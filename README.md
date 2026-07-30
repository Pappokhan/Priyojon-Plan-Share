# Priyojon Plan

Create special plans for your loved ones and share them through a unique link - built with Flask.

## How to Run

1. Make sure Python 3.10+ is installed.

2. Create a virtual environment (optional but recommended):

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the application:

```bash
python app.py
```

5. Open your browser and visit:

http://127.0.0.1:5000

When running the application for the first time, a SQLite database file named `plans.db` will be created automatically. All users and plans will be stored in this database.

---

## Features

### User Authentication
- Secure user registration and login using email and password.
- User session management powered by Flask-Login.
- Protected dashboard and plan management system.

### Plan Management
- Create, edit, duplicate, and delete personalized plans.
- Organize plans from a clean and modern dashboard.
- View all created plans in one place.

### Rich Plan Details
Each plan can include:

- Title
- Recipient Name
- Occasion
- Event Date
- Event Time
- Location
- Cover Emoji
- Personal Message

### Timeline Activities
- Add multiple activities or events to a plan.
- Each activity supports:
  - Time
  - Emoji
  - Activity Title
  - Additional Notes
- Dynamically add or remove timeline items using JavaScript.

### Unique Shareable Links
- Every plan receives a unique public URL.
- Share plans with anyone.
- Shared plans can be viewed without login.

### Responsive & Romantic UI
- Beautiful modern design optimized for:
  - Desktop
  - Laptop
  - Tablet
  - Mobile devices
- Romantic visual style for special occasions.

### Language Switching
- One-click Bangla ⇄ English language toggle.
- Language preference is stored in localStorage.
- Works across all pages automatically.
- User-created content remains unchanged.

### Dark Mode
- Toggle between Light and Dark themes.
- Theme preference is saved automatically.
- Consistent experience across sessions.

### Live Countdown Timer
- Optional countdown date and time for plans.
- Shared pages display a live countdown showing:
  - Days
  - Hours
  - Minutes
  - Seconds

### View Analytics
- Track how many times a shared plan has been viewed.
- Owners can monitor plan engagement.

### Search & Sorting
- Search plans by:
  - Title
  - Recipient Name
  - Occasion
- Sort plans by:
  - Newest First
  - Oldest First
  - Alphabetical Order

### Plan Status Indicators
- Automatic Upcoming badge.
- Automatic Past badge.
- Visual event status tracking.

### Download & Print Support
- Print-friendly page design.
- Save plans as PDF using the browser print dialog.
- Clean formatting for physical copies.

### Toast Notifications
- Modern toast notifications.
- Non-blocking user feedback.
- Better experience than traditional alert popups.

### Optimized Action Buttons
- Clean 2×2 action grid layout.
- Includes:
  - View
  - Edit
  - Copy
  - Delete
- Fully responsive across all screen sizes.

### Guestbook & Wishes System
Visitors can:

- Select a reaction emoji:
  - ❤️ Love
  - 🎉 Celebration
  - 😍 Admiration
  - 🥹 Emotional
  - 👏 Appreciation
  - 🔥 Awesome
- Enter their name.
- Leave a congratulatory message.
- Participate without creating an account.

Plan owners can:

- View all guestbook messages.
- Delete unwanted or spam messages.
- See total message counts.
- View reaction statistics.

### Anti-Spam Protection
- Hidden honeypot field for spam prevention.
- Helps block automated bot submissions.

### Print-Friendly Guestbook
- Guest messages remain visible when printing.
- Forms and delete buttons are automatically hidden.

### Data Storage
- SQLite database support out of the box.
- Automatic database creation on first launch.
- Stores:
  - User Accounts
  - Plans
  - Timeline Items
  - Guestbook Messages
  - View Statistics

---

## Project Structure

```text
plan_share_app/
├── app.py
├── models.py
├── requirements.txt
├── plans.db
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   ├── plan_form.html
│   └── view_plan.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        ├── i18n.js
        ├── theme.js
        └── main.js
```

---

## Production Notes

- Change the `SECRET_KEY` before deployment.
- Store secrets using environment variables.
- Disable `debug=True` in production.
- Use Gunicorn, Waitress, or another production-ready WSGI server.
- For large-scale deployments, use PostgreSQL or MySQL instead of SQLite.

---

## Copyright

Copyright © 2026 MD Shahidul Khan Pappo.

All Rights Reserved.

This project is proprietary software. No part of this project may be copied, modified, distributed, sold, sublicensed, or reused without prior written permission from the author.

Made with for creating unforgettable moments with your loved ones.
