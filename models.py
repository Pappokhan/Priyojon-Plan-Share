import uuid
from datetime import datetime

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


def make_slug():
    return uuid.uuid4().hex[:10]


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.Text)
    avatar_emoji = db.Column(db.String(10), default="🙂")
    avatar_image = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    plans = db.relationship(
        "Plan", backref="owner", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)


class Plan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    title = db.Column(db.String(200), nullable=False)
    recipient_name = db.Column(db.String(120), nullable=False)
    occasion = db.Column(db.String(120))
    plan_date = db.Column(db.String(40))
    plan_time = db.Column(db.String(40))
    location = db.Column(db.String(200))
    cover_emoji = db.Column(db.String(10), default="💖")
    description = db.Column(db.Text)

    share_slug = db.Column(
        db.String(20), unique=True, nullable=False, default=make_slug, index=True
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    views = db.Column(db.Integer, default=0, nullable=False)
    event_datetime = db.Column(db.DateTime, nullable=True)

    items = db.relationship(
        "PlanItem",
        backref="plan",
        lazy=True,
        cascade="all, delete-orphan",
        order_by="PlanItem.position",
    )

    def as_public_dict(self):
        return {
            "title": self.title,
            "recipient_name": self.recipient_name,
            "occasion": self.occasion,
            "plan_date": self.plan_date,
            "plan_time": self.plan_time,
            "location": self.location,
            "cover_emoji": self.cover_emoji,
            "description": self.description,
            "items": [i.activity for i in self.items],
        }


class PlanItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("plan.id"), nullable=False)
    position = db.Column(db.Integer, default=0)
    time_label = db.Column(db.String(60))
    activity = db.Column(db.String(300), nullable=False)
    note = db.Column(db.String(400))
    icon = db.Column(db.String(10), default="✨")


class Wish(db.Model):
    """A short well-wish / reaction left on a plan's public share page by a
    visitor (no login required). This is the app's guestbook feature."""

    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("plan.id"), nullable=False)
    name = db.Column(db.String(60), nullable=False)
    emoji = db.Column(db.String(10), default="❤️")
    message = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    plan = db.relationship("Plan", backref=db.backref(
        "wishes", lazy=True, cascade="all, delete-orphan",
        order_by="Wish.created_at.desc()",
    ))
