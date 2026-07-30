/* =========================================================================
   Priyojon Plan — i18n (Bengali / English) engine
   One click switches every static UI string on the page (and persists the
   choice across page loads via localStorage). User-generated content
   (plan titles, messages, names, etc.) is never translated.
   ========================================================================= */

(function (window) {
  'use strict';

  var STORAGE_KEY = 'ppplan_lang';

  // ---------------------------------------------------------------------
  // Dictionary: every key has a Bengali (bn) and English (en) string.
  // Keys with "_html" may contain safe, app-authored inline HTML (e.g. <br>).
  // ---------------------------------------------------------------------
  var DICT = {
    // ---- Header / nav ----
    'nav.open_menu': { bn: 'মেনু খুলুন', en: 'Open menu' },
    'nav.dashboard': { bn: 'আমার পরিকল্পনা', en: 'My Plans' },
    'nav.new_plan': { bn: '+ নতুন প্ল্যান', en: '+ New Plan' },
    'nav.profile': { bn: 'প্রোফাইল', en: 'Profile' },
    'nav.logout': { bn: 'লগআউট', en: 'Log out' },
    'nav.login': { bn: 'লগইন', en: 'Log in' },
    'nav.register': { bn: 'শুরু করুন', en: 'Get Started' },
    'nav.lang_toggle': { bn: 'EN', en: 'বাংলা' },
    'nav.lang_toggle_label': { bn: 'ইংরেজি ভাষায় দেখুন', en: 'View in Bengali' },

    // ---- Footer ----
    'footer.tagline_html': {
      bn: 'তৈরি হয়েছে ভালোবাসা দিয়ে 💕 — প্রিয়জন প্ল্যান',
      en: 'Made with love 💕 — Priyojon Plan',
    },

    // ---- Page titles (set via JS from body[data-title-key]) ----
    'title.index': { bn: 'প্রিয়জন প্ল্যান — আপনার প্রিয় মানুষের জন্য পরিকল্পনা করুন', en: 'Priyojon Plan — Plan Something Special for Someone You Love' },
    'title.dashboard': { bn: 'আমার পরিকল্পনাসমূহ', en: 'My Plans' },
    'title.login': { bn: 'লগইন', en: 'Log In' },
    'title.register': { bn: 'একাউন্ট তৈরি করুন', en: 'Create an Account' },
    'title.plan_new': { bn: 'নতুন পরিকল্পনা', en: 'New Plan' },
    'title.plan_edit': { bn: 'পরিকল্পনা সম্পাদনা', en: 'Edit Plan' },
    'title.profile': { bn: 'আমার প্রোফাইল', en: 'My Profile' },
    'title.profile_edit': { bn: 'প্রোফাইল সম্পাদনা', en: 'Edit Profile' },

    // ---- Index / hero ----
    'index.hero_heading_html': {
      bn: 'আপনার প্রিয় মানুষের জন্য<br>একটি সুন্দর পরিকল্পনা তৈরি করুন',
      en: 'Create a Beautiful Plan<br>for Someone You Love',
    },
    'index.hero_sub': {
      bn: 'জন্মদিন, অ্যানিভার্সারি, ডেট নাইট, কিংবা যেকোনো বিশেষ দিন — ধাপে ধাপে পরিকল্পনা সাজান এবং একটি সুন্দর লিংকের মাধ্যমে তাকে সারপ্রাইজ দিন।',
      en: 'Birthdays, anniversaries, date nights, or any special occasion — build a step-by-step plan and surprise them with one beautiful link.',
    },
    'index.cta_new_plan': { bn: 'নতুন পরিকল্পনা তৈরি করুন', en: 'Create a New Plan' },
    'index.cta_register': { bn: 'ফ্রি একাউন্ট খুলুন', en: 'Create a Free Account' },
    'index.cta_login': { bn: 'লগইন করুন', en: 'Log In' },
    'index.eyebrow': { bn: 'কীভাবে কাজ করে', en: 'How It Works' },
    'index.feature1_title': { bn: 'সহজে পরিকল্পনা তৈরি', en: 'Effortless Planning' },
    'index.feature1_desc': { bn: 'সময়, স্থান ও ধাপে ধাপে কর্মসূচি যোগ করুন — ঠিক যেমনটা চান।', en: 'Add the time, place, and a step-by-step itinerary — exactly the way you want it.' },
    'index.feature2_title': { bn: 'শেয়ার করুন এক ক্লিকে', en: 'Share in One Click' },
    'index.feature2_desc': { bn: 'প্রতিটি পরিকল্পনার জন্য একটি সুন্দর, প্রাইভেট শেয়ার-লিংক পাবেন।', en: 'Every plan gets its own beautiful, private share link.' },
    'index.feature3_title': { bn: 'রোমান্টিক ডিজাইন', en: 'Thoughtful Design' },
    'index.feature3_desc': { bn: 'যাকে পাঠাবেন সে দেখবে একটি সুন্দর, যত্ন করে সাজানো পেইজ।', en: 'Whoever you send it to sees a beautiful, carefully crafted page.' },
    'index.stat_users': { bn: 'জন ব্যবহারকারী যুক্ত হয়েছেন', en: 'users have joined' },
    'index.stat_plans': { bn: 'টি পরিকল্পনা তৈরি হয়েছে', en: 'plans have been created' },
    'index.chart_title': { bn: 'গত ৬ মাসের প্রবৃদ্ধি', en: 'Growth Over the Last 6 Months' },
    'index.legend_users': { bn: 'ব্যবহারকারী', en: 'Users' },
    'index.legend_plans': { bn: 'পরিকল্পনা', en: 'Plans' },

    // ---- Dashboard ----
    'dashboard.heading': { bn: 'আমার পরিকল্পনাসমূহ', en: 'My Plans' },
    'dashboard.new_plan': { bn: '+ নতুন পরিকল্পনা', en: '+ New Plan' },
    'dashboard.view': { bn: 'দেখুন', en: 'View' },
    'dashboard.edit': { bn: 'সম্পাদনা', en: 'Edit' },
    'dashboard.delete': { bn: 'মুছুন', en: 'Delete' },
    'dashboard.delete_confirm': { bn: 'আপনি কি নিশ্চিত এটি মুছে ফেলতে চান?', en: 'Are you sure you want to delete this plan?' },
    'dashboard.empty_text': { bn: 'এখনো কোনো পরিকল্পনা তৈরি করেননি।', en: "You haven't created any plans yet." },
    'dashboard.empty_cta': { bn: 'প্রথম পরিকল্পনা তৈরি করুন', en: 'Create Your First Plan' },
    'dashboard.count_one': { bn: 'টি পরিকল্পনা', en: 'plan' },
    'dashboard.count_other': { bn: 'টি পরিকল্পনা', en: 'plans' },
    'dashboard.search_placeholder': { bn: 'নাম, উপলক্ষ বা শিরোনাম দিয়ে খুঁজুন...', en: 'Search by name, occasion, or title...' },
    'dashboard.sort_newest': { bn: 'নতুন আগে', en: 'Newest first' },
    'dashboard.sort_oldest': { bn: 'পুরনো আগে', en: 'Oldest first' },
    'dashboard.sort_az': { bn: 'নাম (A-Z)', en: 'Name (A-Z)' },
    'dashboard.no_results': { bn: '😕 কোনো পরিকল্পনা পাওয়া যায়নি।', en: '😕 No plans found.' },
    'dashboard.duplicate': { bn: 'কপি', en: 'Duplicate' },
    'dashboard.views_suffix': { bn: 'বার দেখা হয়েছে', en: 'views' },
    'dashboard.wishes_suffix': { bn: 'শুভেচ্ছাবার্তা', en: 'wishes' },

    // ---- Profile view ----
    'profile.plans_label': { bn: 'পরিকল্পনা তৈরি করেছেন', en: 'Plans Created' },
    'profile.joined_label': { bn: 'যোগ দিয়েছেন', en: 'Joined' },
    'profile.edit_btn': { bn: 'প্রোফাইল সম্পাদনা করুন', en: 'Edit Profile' },
    'profile.view_plans_btn': { bn: 'আমার পরিকল্পনা দেখুন', en: 'View My Plans' },

    // ---- Profile edit form ----
    'profileform.heading': { bn: 'প্রোফাইল সম্পাদনা করুন', en: 'Edit Your Profile' },
    'profileform.sub': { bn: 'আপনার তথ্য আপডেট করুন।', en: 'Update your account details.' },
    'profileform.section_photo': { bn: 'প্রোফাইল ছবি', en: 'Profile Photo' },
    'profileform.change_photo': { bn: 'ছবি পরিবর্তন করুন', en: 'Change photo' },
    'profileform.upload_photo': { bn: 'ছবি আপলোড করুন', en: 'Upload Photo' },
    'profileform.remove_photo': { bn: 'ছবি সরান', en: 'Remove Photo' },
    'profileform.photo_hint': { bn: 'PNG, JPG, GIF বা WEBP — সর্বোচ্চ ৫ এমবি', en: 'PNG, JPG, GIF, or WEBP — up to 5MB' },
    'profileform.avatar_label': { bn: 'প্রোফাইল ইমোজি (ছবি না থাকলে দেখা যাবে)', en: 'Profile Emoji (shown when no photo is set)' },
    'profileform.bio_label': { bn: 'সংক্ষিপ্ত পরিচিতি', en: 'Bio' },
    'profileform.bio_placeholder': { bn: 'নিজের সম্পর্কে দুই এক কথা লিখুন...', en: 'Write a short line about yourself...' },
    'profileform.section_password': { bn: 'পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)', en: 'Change Password (Optional)' },
    'profileform.new_password_label': { bn: 'নতুন পাসওয়ার্ড', en: 'New Password' },
    'profileform.new_password_placeholder': { bn: 'খালি রাখুন যদি পরিবর্তন না করতে চান', en: 'Leave blank to keep your current password' },
    'profileform.cancel': { bn: 'বাতিল করুন', en: 'Cancel' },
    'profileform.submit': { bn: 'প্রোফাইল আপডেট করুন', en: 'Update Profile' },

    // ---- Auth: login ----
    'login.heading': { bn: 'লগইন করুন', en: 'Log In' },
    'login.sub': { bn: 'আপনার একাউন্টে ফিরে আসুন', en: 'Welcome back to your account' },
    'auth.email_label': { bn: 'ইমেইল', en: 'Email' },
    'auth.password_label': { bn: 'পাসওয়ার্ড', en: 'Password' },
    'auth.password_placeholder': { bn: 'আপনার পাসওয়ার্ড', en: 'Your password' },
    'login.submit': { bn: 'লগইন', en: 'Log In' },
    'login.alt_text': { bn: 'নতুন এখানে?', en: 'New here?' },
    'login.alt_link': { bn: 'একাউন্ট তৈরি করুন', en: 'Create an account' },

    // ---- Auth: register ----
    'register.heading': { bn: 'একাউন্ট তৈরি করুন', en: 'Create an Account' },
    'register.sub': { bn: 'কয়েক সেকেন্ডে শুরু করুন — সম্পূর্ণ ফ্রি', en: 'Get started in seconds — completely free' },
    'register.name_label': { bn: 'আপনার নাম', en: 'Your Name' },
    'register.name_placeholder': { bn: 'যেমন: রাহুল', en: 'e.g. Rahul' },
    'register.password_placeholder': { bn: 'কমপক্ষে ৬ অক্ষর', en: 'At least 6 characters' },
    'register.confirm_label': { bn: 'পাসওয়ার্ড আবার লিখুন', en: 'Confirm Password' },
    'register.confirm_placeholder': { bn: 'একই পাসওয়ার্ড আবার লিখুন', en: 'Re-enter the same password' },
    'register.submit': { bn: 'একাউন্ট তৈরি করুন', en: 'Create Account' },
    'register.alt_text': { bn: 'আগে থেকে একাউন্ট আছে?', en: 'Already have an account?' },
    'register.alt_link': { bn: 'লগইন করুন', en: 'Log In' },

    // ---- Plan form ----
    'planform.heading_new': { bn: 'নতুন পরিকল্পনা তৈরি করুন', en: 'Create a New Plan' },
    'planform.heading_edit': { bn: 'পরিকল্পনা সম্পাদনা করুন', en: 'Edit Your Plan' },
    'planform.sub': { bn: 'নিচের ঘরগুলো পূরণ করে আপনার বিশেষ পরিকল্পনাটি সাজান।', en: 'Fill in the fields below to put together your special plan.' },
    'planform.section_basic': { bn: 'মূল তথ্য', en: 'Basic Details' },
    'planform.title_label': { bn: 'পরিকল্পনার শিরোনাম', en: 'Plan Title' },
    'planform.title_placeholder': { bn: 'যেমন: তোমার জন্য একটি বিশেষ সন্ধ্যা', en: 'e.g. A Special Evening for You' },
    'planform.recipient_label': { bn: 'কার জন্য (নাম)', en: 'For (Name)' },
    'planform.recipient_placeholder': { bn: 'যেমন: প্রিয়া', en: 'e.g. Priya' },
    'planform.occasion_label': { bn: 'উপলক্ষ', en: 'Occasion' },
    'planform.occasion_placeholder': { bn: 'জন্মদিন / অ্যানিভার্সারি / এমনি', en: 'Birthday / Anniversary / Just Because' },
    'planform.date_label': { bn: 'তারিখ', en: 'Date' },
    'planform.date_placeholder': { bn: '২৯ জুলাই, ২০২৬', en: 'July 29, 2026' },
    'planform.time_label': { bn: 'সময়', en: 'Time' },
    'planform.time_placeholder': { bn: 'সন্ধ্যা ৭টা', en: '7:00 PM' },
    'planform.location_label': { bn: 'স্থান', en: 'Location' },
    'planform.location_placeholder': { bn: 'যেমন: ছাদ, ধানমন্ডি লেক...', en: 'e.g. Rooftop, Dhanmondi Lake...' },
    'planform.emoji_label': { bn: 'কভার ইমোজি', en: 'Cover Emoji' },
    'planform.description_label': { bn: 'বার্তা / ভূমিকা', en: 'Message / Intro' },
    'planform.description_placeholder': { bn: 'তার জন্য একটি ছোট্ট মিষ্টি বার্তা লিখুন...', en: 'Write a short, sweet message for them...' },
    'planform.items_heading': { bn: 'ধাপে ধাপে পরিকল্পনা', en: 'Step-by-Step Itinerary' },
    'planform.add_item': { bn: '+ ধাপ যোগ করুন', en: '+ Add Step' },
    'planform.col_time': { bn: 'সময়', en: 'Time' },
    'planform.col_icon': { bn: 'ইমোজি', en: 'Icon' },
    'planform.col_activity': { bn: 'কার্যক্রম', en: 'Activity' },
    'planform.col_note': { bn: 'নোট', en: 'Note' },
    'planform.item_time_placeholder': { bn: 'যেমন: সন্ধ্যা ৭টা', en: 'e.g. 7:00 PM' },
    'planform.item_activity_placeholder': { bn: 'কার্যক্রম (যেমন: মুভি দেখা)', en: 'Activity (e.g. Watch a movie)' },
    'planform.item_note_placeholder': { bn: 'নোট (ঐচ্ছিক)', en: 'Note (optional)' },
    'planform.remove_item_label': { bn: 'এই ধাপ মুছুন', en: 'Remove this step' },
    'planform.submit_new': { bn: 'পরিকল্পনা তৈরি করুন', en: 'Create Plan' },
    'planform.submit_edit': { bn: 'পরিকল্পনা আপডেট করুন', en: 'Update Plan' },
    'planform.countdown_label': { bn: '🕑 কাউন্টডাউনের জন্য সঠিক তারিখ ও সময় (ঐচ্ছিক)', en: '🕑 Exact Date & Time for Countdown (Optional)' },
    'planform.countdown_hint': { bn: 'দিলে শেয়ার পেইজে একটি লাইভ কাউন্টডাউন দেখা যাবে।', en: 'If set, a live countdown will appear on the share page.' },

    // ---- View plan / share page ----
    'view.share_label': { bn: '🔗 শেয়ার লিংক:', en: '🔗 Share Link:' },
    'view.copy': { bn: 'কপি করুন', en: 'Copy' },
    'view.copied': { bn: 'লিংক কপি হয়েছে!', en: 'Link copied!' },
    'view.edit': { bn: 'সম্পাদনা', en: 'Edit' },
    'view.for_prefix': { bn: '✨ বিশেষভাবে তৈরি করা হয়েছে', en: '✨ Specially made for' },
    'view.for_suffix': { bn: '-এর জন্য ✨', en: '✨' },
    'view.schedule_heading': { bn: 'সময়সূচি', en: 'Schedule' },
    'view.footer_msg': { bn: '💕 এই মুহূর্তগুলো তোমার জন্য, শুধু তোমার জন্য 💕', en: '💕 These moments are for you, only you 💕' },
    'view.views_label': { bn: 'দেখেছেন', en: 'Views:' },
    'view.duplicate': { bn: '📄 কপি তৈরি করুন', en: '📄 Duplicate' },
    'view.download': { bn: '⬇️ ডাউনলোড / প্রিন্ট', en: '⬇️ Download / Print' },
    'view.countdown_heading': { bn: '⏳ শুরু হতে বাকি', en: '⏳ Time Remaining' },
    'view.wishes_label': { bn: 'শুভেচ্ছাবার্তা', en: 'Wishes:' },

    // ---- Guestbook / wishes (public share page) ----
    'wishes.heading': { bn: '💌 শুভেচ্ছাবার্তা', en: '💌 Wishes' },
    'wishes.sub': { bn: 'যিনি এই লিংক দেখছেন, তিনি এখানে একটি ছোট্ট শুভেচ্ছাবার্তা রেখে যেতে পারেন।', en: 'Anyone viewing this link can leave a short wish here.' },
    'wishes.name_label': { bn: 'আপনার নাম', en: 'Your name' },
    'wishes.name_placeholder': { bn: 'তোমার বন্ধু', en: 'Your friend' },
    'wishes.message_label': { bn: 'শুভেচ্ছাবার্তা', en: 'Your wish' },
    'wishes.message_placeholder': { bn: 'তোমাদের জন্য শুভকামনা রইলো...', en: 'Wishing you both the best...' },
    'wishes.submit': { bn: 'শুভেচ্ছা পাঠান', en: 'Send Wish' },
    'wishes.empty': { bn: 'এখনো কোনো শুভেচ্ছাবার্তা আসেনি — প্রথম বার্তাটি আপনার হতে পারে!', en: 'No wishes yet — you could be the first!' },
    'wishes.delete': { bn: 'মুছুন', en: 'Delete' },

    // ---- Countdown widget ----
    'countdown.days': { bn: 'দিন', en: 'Days' },
    'countdown.hours': { bn: 'ঘণ্টা', en: 'Hours' },
    'countdown.minutes': { bn: 'মিনিট', en: 'Minutes' },
    'countdown.seconds': { bn: 'সেকেন্ড', en: 'Seconds' },
    'countdown.arrived': { bn: '🎉 সময় হয়ে গেছে!', en: "🎉 It's time!" },

    // ---- Status badges ----
    'badge.upcoming': { bn: '✨ আসছে', en: '✨ Upcoming' },
    'badge.past': { bn: '✔️ সম্পন্ন', en: '✔️ Past' },

    // ---- Server-rendered flash messages (exact-match translation) ----
    'flash.login_first': { bn: 'প্রথমে লগইন করুন।', en: 'Please log in first.' },
    'flash.fill_all': { bn: 'সব ঘর পূরণ করুন।', en: 'Please fill in all fields.' },
    'flash.password_mismatch': { bn: 'পাসওয়ার্ড দুটি মিলছে না।', en: 'The passwords do not match.' },
    'flash.email_exists': { bn: 'এই ইমেইল দিয়ে আগেই একাউন্ট আছে।', en: 'An account with this email already exists.' },
    'flash.welcome': { bn: 'স্বাগতম! আপনার একাউন্ট তৈরি হয়েছে।', en: 'Welcome! Your account has been created.' },
    'flash.bad_credentials': { bn: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।', en: 'Incorrect email or password.' },
    'flash.no_edit_permission': { bn: 'আপনার এই পরিকল্পনা সম্পাদনার অনুমতি নেই।', en: 'You do not have permission to edit this plan.' },
    'flash.plan_created': { bn: 'পরিকল্পনা তৈরি হয়েছে!', en: 'Your plan has been created!' },
    'flash.plan_updated': { bn: 'পরিকল্পনা আপডেট হয়েছে!', en: 'Your plan has been updated!' },
    'flash.no_delete_permission': { bn: 'আপনার এই পরিকল্পনা মুছার অনুমতি নেই।', en: 'You do not have permission to delete this plan.' },
    'flash.plan_deleted': { bn: 'পরিকল্পনা মুছে ফেলা হয়েছে।', en: 'Your plan has been deleted.' },
    'flash.no_view_permission': { bn: 'আপনার এই পরিকল্পনা দেখার অনুমতি নেই।', en: 'You do not have permission to view this plan.' },
    'flash.profile_updated': { bn: 'প্রোফাইল আপডেট হয়েছে!', en: 'Your profile has been updated!' },
    'flash.password_too_short': { bn: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।', en: 'Password must be at least 6 characters.' },
    'flash.invalid_image_type': { bn: 'শুধুমাত্র ছবি ফাইল (PNG, JPG, GIF, WEBP) আপলোড করা যাবে।', en: 'Only image files (PNG, JPG, GIF, WEBP) can be uploaded.' },
    'flash.plan_duplicated': { bn: 'পরিকল্পনার একটি কপি তৈরি হয়েছে!', en: 'A copy of your plan has been created!' },
    'flash.wish_added': { bn: 'আপনার শুভেচ্ছাবার্তার জন্য ধন্যবাদ! 💕', en: 'Thank you for your wish! 💕' },
    'flash.wish_fill_all': { bn: 'নাম ও বার্তা লিখুন।', en: 'Please enter your name and a message.' },
    'flash.no_wish_delete_permission': { bn: 'এই শুভেচ্ছাবার্তাটি মুছার অনুমতি নেই।', en: 'You do not have permission to delete this wish.' },
    'flash.wish_deleted': { bn: 'শুভেচ্ছাবার্তাটি মুছে ফেলা হয়েছে।', en: 'The wish has been deleted.' },
  };

  function getLang() {
    var stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'bn' ? stored : 'bn';
  }

  function setLang(lang) {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }

  function t(key) {
    var entry = DICT[key];
    if (!entry) return null;
    var lang = getLang();
    return entry[lang] || entry.bn;
  }

  function translateDashboardCount(el) {
    var count = parseInt(el.getAttribute('data-count'), 10) || 0;
    var lang = getLang();
    if (lang === 'en') {
      el.textContent = count + ' ' + (count === 1 ? t('dashboard.count_one') : t('dashboard.count_other'));
    } else {
      el.textContent = count + t('dashboard.count_other');
    }
  }

  function translateFlashMessages() {
    var flashes = document.querySelectorAll('.flash[data-flash-key]');
    flashes.forEach(function (el) {
      var key = el.getAttribute('data-flash-key');
      var translated = t(key);
      if (translated) {
        el.textContent = translated;
      }
    });
  }

  function applyTranslations() {
    var lang = getLang();
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n'));
      if (value !== null) el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-html'));
      if (value !== null) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-placeholder'));
      if (value !== null) el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-aria-label'));
      if (value !== null) el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-count]').forEach(translateDashboardCount);

    translateFlashMessages();

    var body = document.body;
    if (body && body.getAttribute('data-title-key')) {
      var titleValue = t(body.getAttribute('data-title-key'));
      if (titleValue !== null) document.title = titleValue;
    }

    var toggleLabel = document.getElementById('lang-toggle-label');
    if (toggleLabel) toggleLabel.textContent = lang === 'en' ? 'বাংলা' : 'EN';

    var toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', t('nav.lang_toggle_label') || '');
      toggleBtn.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
    }
  }

  function toggleLang() {
    setLang(getLang() === 'en' ? 'bn' : 'en');
    applyTranslations();
  }

  window.ppI18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    toggle: toggleLang,
    apply: applyTranslations,
  };

  document.addEventListener('DOMContentLoaded', applyTranslations);
})(window);
