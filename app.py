import os
import sqlite3
import uuid
from datetime import datetime

from flask import Flask, flash, redirect, render_template, request, url_for
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from werkzeug.utils import secure_filename

from models import Plan, PlanItem, User, Wish, db, make_slug

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "please-change-this-secret-key")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    BASE_DIR, "plans.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Profile picture uploads
app.config["AVATAR_UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "static", "uploads", "avatars")
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024 
ALLOWED_AVATAR_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
os.makedirs(app.config["AVATAR_UPLOAD_FOLDER"], exist_ok=True)

# Guestbook
ALLOWED_WISH_EMOJIS = {"❤️", "🎉", "😍", "🥹", "👏", "🔥"}
DEFAULT_WISH_EMOJI = "❤️"

db.init_app(app)


def _allowed_avatar_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_AVATAR_EXTENSIONS
    )


def _save_avatar_file(file_storage):
    """Saves an uploaded avatar image under a unique filename and returns
    that filename, or None if the file is missing/invalid."""
    if not file_storage or not file_storage.filename:
        return None
    if not _allowed_avatar_file(file_storage.filename):
        return False

    ext = secure_filename(file_storage.filename).rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_storage.save(os.path.join(app.config["AVATAR_UPLOAD_FOLDER"], filename))
    return filename


def _delete_avatar_file(filename):
    if not filename:
        return
    path = os.path.join(app.config["AVATAR_UPLOAD_FOLDER"], filename)
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass

FLASH_KEYS = {
    "প্রথমে লগইন করুন।": "flash.login_first",
    "সব ঘর পূরণ করুন।": "flash.fill_all",
    "পাসওয়ার্ড দুটি মিলছে না।": "flash.password_mismatch",
    "এই ইমেইল দিয়ে আগেই একাউন্ট আছে।": "flash.email_exists",
    "স্বাগতম! আপনার একাউন্ট তৈরি হয়েছে।": "flash.welcome",
    "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।": "flash.bad_credentials",
    "আপনার এই পরিকল্পনা সম্পাদনার অনুমতি নেই।": "flash.no_edit_permission",
    "পরিকল্পনা তৈরি হয়েছে!": "flash.plan_created",
    "পরিকল্পনা আপডেট হয়েছে!": "flash.plan_updated",
    "আপনার এই পরিকল্পনা মুছার অনুমতি নেই।": "flash.no_delete_permission",
    "পরিকল্পনা মুছে ফেলা হয়েছে।": "flash.plan_deleted",
    "আপনার এই পরিকল্পনা দেখার অনুমতি নেই।": "flash.no_view_permission",
    "প্রোফাইল আপডেট হয়েছে!": "flash.profile_updated",
    "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।": "flash.password_too_short",
    "শুধুমাত্র ছবি ফাইল (PNG, JPG, GIF, WEBP) আপলোড করা যাবে।": "flash.invalid_image_type",
    "পরিকল্পনার একটি কপি তৈরি হয়েছে!": "flash.plan_duplicated",
    "আপনার শুভেচ্ছাবার্তার জন্য ধন্যবাদ! 💕": "flash.wish_added",
    "নাম ও বার্তা লিখুন।": "flash.wish_fill_all",
    "এই শুভেচ্ছাবার্তাটি মুছার অনুমতি নেই।": "flash.no_wish_delete_permission",
    "শুভেচ্ছাবার্তাটি মুছে ফেলা হয়েছে।": "flash.wish_deleted",
}


@app.context_processor
def inject_flash_keys():
    return {"flash_keys": FLASH_KEYS}

login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.login_message = "প্রথমে লগইন করুন।"
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


def _ensure_new_columns():
    """Lightweight migration: add newly-introduced User columns to an
    existing plans.db file without wiping any data. Safe to call on a
    fresh install (no-op if the db file / table doesn't exist yet)."""
    db_path = os.path.join(BASE_DIR, "plans.db")
    if not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user'")
        if not cur.fetchone():
            return

        cur.execute("PRAGMA table_info(user)")
        existing_cols = {row[1] for row in cur.fetchall()}

        if "bio" not in existing_cols:
            cur.execute("ALTER TABLE user ADD COLUMN bio TEXT")
        if "avatar_emoji" not in existing_cols:
            cur.execute("ALTER TABLE user ADD COLUMN avatar_emoji VARCHAR(10) DEFAULT '🙂'")
        if "avatar_image" not in existing_cols:
            cur.execute("ALTER TABLE user ADD COLUMN avatar_image VARCHAR(300)")

        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='plan'")
        if cur.fetchone():
            cur.execute("PRAGMA table_info(plan)")
            plan_cols = {row[1] for row in cur.fetchall()}
            if "views" not in plan_cols:
                cur.execute("ALTER TABLE plan ADD COLUMN views INTEGER DEFAULT 0")
            if "event_datetime" not in plan_cols:
                cur.execute("ALTER TABLE plan ADD COLUMN event_datetime DATETIME")

        conn.commit()
    finally:
        conn.close()


def _parse_event_datetime(raw_value):
    """Parses the <input type="datetime-local"> value ('YYYY-MM-DDTHH:MM')
    into a datetime object, returning None for blank/invalid input."""
    raw_value = (raw_value or "").strip()
    if not raw_value:
        return None
    try:
        return datetime.strptime(raw_value, "%Y-%m-%dT%H:%M")
    except ValueError:
        return None


with app.app_context():
    _ensure_new_columns()
    db.create_all()


def _shift_month(dt, delta):
    month_index = dt.month - 1 + delta
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    return dt.replace(year=year, month=month, day=1)


def get_homepage_stats(months=6):
    total_users = User.query.count()
    total_plans = Plan.query.count()

    now = datetime.utcnow().replace(day=1)
    month_starts = [_shift_month(now, -i) for i in range(months - 1, -1, -1)]

    user_dates = [row[0] for row in db.session.query(User.created_at).all()]
    plan_dates = [row[0] for row in db.session.query(Plan.created_at).all()]

    chart_data = []
    max_value = 1
    for m in month_starts:
        key = (m.year, m.month)
        u_count = sum(1 for d in user_dates if d and (d.year, d.month) == key)
        p_count = sum(1 for d in plan_dates if d and (d.year, d.month) == key)
        max_value = max(max_value, u_count, p_count)
        chart_data.append({"label": m.strftime("%b"), "users": u_count, "plans": p_count})

    for row in chart_data:
        row["users_pct"] = round(row["users"] / max_value * 100) if max_value else 0
        row["plans_pct"] = round(row["plans"] / max_value * 100) if max_value else 0

    return {
        "total_users": total_users,
        "total_plans": total_plans,
        "chart_data": chart_data,
    }


@app.route("/")
def index():
    stats = get_homepage_stats()
    return render_template("index.html", stats=stats)


@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm", "")

        if not name or not email or not password:
            flash("সব ঘর পূরণ করুন।", "error")
        elif password != confirm:
            flash("পাসওয়ার্ড দুটি মিলছে না।", "error")
        elif User.query.filter_by(email=email).first():
            flash("এই ইমেইল দিয়ে আগেই একাউন্ট আছে।", "error")
        else:
            user = User(name=name, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            flash("স্বাগতম! আপনার একাউন্ট তৈরি হয়েছে।", "success")
            return redirect(url_for("dashboard"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for("dashboard"))
        flash("ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।", "error")

    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))



@app.route("/dashboard")
@login_required
def dashboard():
    plans = (
        Plan.query.filter_by(user_id=current_user.id)
        .order_by(Plan.created_at.desc())
        .all()
    )
    return render_template("dashboard.html", plans=plans, now=datetime.utcnow())


@app.route("/plan/new", methods=["GET", "POST"])
@login_required
def create_plan():
    if request.method == "POST":
        plan = Plan(
            user_id=current_user.id,
            title=request.form.get("title", "").strip() or "একটি বিশেষ পরিকল্পনা",
            recipient_name=request.form.get("recipient_name", "").strip(),
            occasion=request.form.get("occasion", "").strip(),
            plan_date=request.form.get("plan_date", "").strip(),
            plan_time=request.form.get("plan_time", "").strip(),
            location=request.form.get("location", "").strip(),
            cover_emoji=request.form.get("cover_emoji", "💖").strip() or "💖",
            description=request.form.get("description", "").strip(),
            event_datetime=_parse_event_datetime(request.form.get("event_datetime")),
            share_slug=make_slug(),
        )
        db.session.add(plan)
        db.session.flush()

        _save_items_from_form(plan)

        db.session.commit()
        flash("পরিকল্পনা তৈরি হয়েছে!", "success")
        return redirect(url_for("view_owner_plan", plan_id=plan.id))

    return render_template("plan_form.html", plan=None)


@app.route("/plan/<int:plan_id>/edit", methods=["GET", "POST"])
@login_required
def edit_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    if plan.user_id != current_user.id:
        flash("আপনার এই পরিকল্পনা সম্পাদনার অনুমতি নেই।", "error")
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        plan.title = request.form.get("title", "").strip() or plan.title
        plan.recipient_name = request.form.get("recipient_name", "").strip()
        plan.occasion = request.form.get("occasion", "").strip()
        plan.plan_date = request.form.get("plan_date", "").strip()
        plan.plan_time = request.form.get("plan_time", "").strip()
        plan.location = request.form.get("location", "").strip()
        plan.cover_emoji = request.form.get("cover_emoji", "💖").strip() or "💖"
        plan.description = request.form.get("description", "").strip()
        plan.event_datetime = _parse_event_datetime(request.form.get("event_datetime"))

        PlanItem.query.filter_by(plan_id=plan.id).delete()
        _save_items_from_form(plan)

        db.session.commit()
        flash("পরিকল্পনা আপডেট হয়েছে!", "success")
        return redirect(url_for("view_owner_plan", plan_id=plan.id))

    return render_template("plan_form.html", plan=plan)


@app.route("/plan/<int:plan_id>/delete", methods=["POST"])
@login_required
def delete_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    if plan.user_id != current_user.id:
        flash("আপনার এই পরিকল্পনা মুছার অনুমতি নেই।", "error")
        return redirect(url_for("dashboard"))

    db.session.delete(plan)
    db.session.commit()
    flash("পরিকল্পনা মুছে ফেলা হয়েছে।", "success")
    return redirect(url_for("dashboard"))


@app.route("/plan/<int:plan_id>/duplicate", methods=["POST"])
@login_required
def duplicate_plan(plan_id):
    original = Plan.query.get_or_404(plan_id)
    if original.user_id != current_user.id:
        flash("আপনার এই পরিকল্পনা সম্পাদনার অনুমতি নেই।", "error")
        return redirect(url_for("dashboard"))

    copy = Plan(
        user_id=current_user.id,
        title=f"{original.title} (কপি)",
        recipient_name=original.recipient_name,
        occasion=original.occasion,
        plan_date=original.plan_date,
        plan_time=original.plan_time,
        location=original.location,
        cover_emoji=original.cover_emoji,
        description=original.description,
        event_datetime=original.event_datetime,
        share_slug=make_slug(),
    )
    db.session.add(copy)
    db.session.flush()

    for item in original.items:
        db.session.add(
            PlanItem(
                plan_id=copy.id,
                position=item.position,
                time_label=item.time_label,
                icon=item.icon,
                activity=item.activity,
                note=item.note,
            )
        )

    db.session.commit()
    flash("পরিকল্পনার একটি কপি তৈরি হয়েছে!", "success")
    return redirect(url_for("edit_plan", plan_id=copy.id))


@app.route("/plan/<int:plan_id>")
@login_required
def view_owner_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    if plan.user_id != current_user.id:
        flash("আপনার এই পরিকল্পনা দেখার অনুমতি নেই।", "error")
        return redirect(url_for("dashboard"))
    return render_template(
        "view_plan.html",
        plan=plan,
        is_owner=True,
        now=datetime.utcnow(),
        wish_reactions=_wish_reaction_summary(plan),
    )


def _save_items_from_form(plan):
    times = request.form.getlist("item_time")
    icons = request.form.getlist("item_icon")
    activities = request.form.getlist("item_activity")
    notes = request.form.getlist("item_note")

    position = 0
    for t, icon, activity, note in zip(times, icons, activities, notes):
        if not activity.strip():
            continue
        db.session.add(
            PlanItem(
                plan_id=plan.id,
                position=position,
                time_label=t.strip(),
                icon=(icon.strip() or "✨"),
                activity=activity.strip(),
                note=note.strip(),
            )
        )
        position += 1


@app.route("/profile")
@login_required
def profile():
    plan_count = Plan.query.filter_by(user_id=current_user.id).count()
    return render_template("profile.html", plan_count=plan_count)


@app.route("/profile/edit", methods=["GET", "POST"])
@login_required
def edit_profile():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        bio = request.form.get("bio", "").strip()
        avatar_emoji = request.form.get("avatar_emoji", "🙂").strip() or "🙂"
        new_password = request.form.get("new_password", "")
        confirm_password = request.form.get("confirm_password", "")
        remove_avatar = request.form.get("remove_avatar") == "1"
        avatar_file = request.files.get("avatar_image")

        existing = User.query.filter_by(email=email).first()

        saved_filename = None
        if avatar_file and avatar_file.filename:
            saved_filename = _save_avatar_file(avatar_file)

        if not name or not email:
            flash("সব ঘর পূরণ করুন।", "error")
        elif existing and existing.id != current_user.id:
            flash("এই ইমেইল দিয়ে আগেই একাউন্ট আছে।", "error")
        elif new_password and len(new_password) < 6:
            flash("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।", "error")
        elif new_password and new_password != confirm_password:
            flash("পাসওয়ার্ড দুটি মিলছে না।", "error")
        elif saved_filename is False:
            flash("শুধুমাত্র ছবি ফাইল (PNG, JPG, GIF, WEBP) আপলোড করা যাবে।", "error")
        else:
            old_avatar = current_user.avatar_image
            current_user.name = name
            current_user.email = email
            current_user.bio = bio
            current_user.avatar_emoji = avatar_emoji
            if new_password:
                current_user.set_password(new_password)

            if saved_filename:
                current_user.avatar_image = saved_filename
                _delete_avatar_file(old_avatar)
            elif remove_avatar:
                current_user.avatar_image = None
                _delete_avatar_file(old_avatar)

            db.session.commit()
            flash("প্রোফাইল আপডেট হয়েছে!", "success")
            return redirect(url_for("profile"))
        if saved_filename:
            _delete_avatar_file(saved_filename)

    return render_template("profile_edit.html")


@app.route("/share/<slug>")
def shared_plan(slug):
    plan = Plan.query.filter_by(share_slug=slug).first_or_404()
    is_owner = current_user.is_authenticated and current_user.id == plan.user_id
    if not is_owner:
        plan.views = (plan.views or 0) + 1
        db.session.commit()
    return render_template(
        "view_plan.html",
        plan=plan,
        is_owner=is_owner,
        now=datetime.utcnow(),
        wish_reactions=_wish_reaction_summary(plan),
    )


def _wish_reaction_summary(plan):
    """Returns [(emoji, count), ...] sorted by count desc, for the little
    reaction tally shown above the guestbook."""
    counts = {}
    for wish in plan.wishes:
        emoji = wish.emoji or DEFAULT_WISH_EMOJI
        counts[emoji] = counts.get(emoji, 0) + 1
    return sorted(counts.items(), key=lambda pair: pair[1], reverse=True)


@app.route("/share/<slug>/wish", methods=["POST"])
def add_wish(slug):
    plan = Plan.query.filter_by(share_slug=slug).first_or_404()

    if request.form.get("website"):
        return redirect(url_for("shared_plan", slug=slug) + "#wishes")

    name = request.form.get("wish_name", "").strip()[:60]
    message = request.form.get("wish_message", "").strip()[:300]
    emoji = request.form.get("wish_emoji", DEFAULT_WISH_EMOJI).strip()
    if emoji not in ALLOWED_WISH_EMOJIS:
        emoji = DEFAULT_WISH_EMOJI

    if not name or not message:
        flash("নাম ও বার্তা লিখুন।", "error")
        return redirect(url_for("shared_plan", slug=slug) + "#wishes")

    db.session.add(Wish(plan_id=plan.id, name=name, emoji=emoji, message=message))
    db.session.commit()
    flash("আপনার শুভেচ্ছাবার্তার জন্য ধন্যবাদ! 💕", "success")
    return redirect(url_for("shared_plan", slug=slug) + "#wishes")


@app.route("/plan/<int:plan_id>/wish/<int:wish_id>/delete", methods=["POST"])
@login_required
def delete_wish(plan_id, wish_id):
    plan = Plan.query.get_or_404(plan_id)
    wish = Wish.query.get_or_404(wish_id)
    if plan.user_id != current_user.id or wish.plan_id != plan.id:
        flash("এই শুভেচ্ছাবার্তাটি মুছার অনুমতি নেই।", "error")
        return redirect(url_for("dashboard"))

    db.session.delete(wish)
    db.session.commit()
    flash("শুভেচ্ছাবার্তাটি মুছে ফেলা হয়েছে।", "success")
    return redirect(url_for("view_owner_plan", plan_id=plan.id) + "#wishes")


if __name__ == "__main__":
    app.run(debug=True)
