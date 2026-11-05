# Eldercare Connect - Smart Elderly Assistance Platform

Eldercare Connect is a full-stack MERN application dedicated to elderly care, safety, and health management. It connects senior citizens with family members, verified volunteers, professional caregivers, and administrators.

---

## 🌐 Complete Multilingual Support (English & Tamil / தமிழ்)

Eldercare Connect supports **English** and **Tamil (தமிழ்)** across all pages, forms, dialogues, notifications, and role dashboards.

### Language Capabilities:
- **Instant Toggle**: Switch between `🌐 English` and `🌐 தமிழ்` with immediate reactivity (zero page reload required).
- **Persistent Preferences**:
  - Guest language preferences are saved in browser `localStorage`.
  - Authenticated user language preferences are persisted in MongoDB (`preferredLanguage: 'en' | 'ta'`) and automatically restored upon login.
- **Typography & Font**: Integrated with **Noto Sans Tamil** for clean, legible rendering on desktop and mobile devices.
- **Speech Assistant Compatibility**: Multilingual voice recognition and speech synthesis (Web Speech API) supporting voice commands in both English and Tamil.
- **Locale-Aware Formatting**: Localized date and time display (`en-IN` and `ta-IN`).

---

## 🌟 Key Features

1. **Dedicated Role Dashboards**:
   - **Elderly User**: Large typography, high contrast mode, voice companion, one-touch SOS dispatch, medicine checklist, and assistance requests.
   - **Family Member**: Real-time GPS location monitoring, medication adherence tracking, and instantaneous emergency notifications.
   - **Community Volunteer**: Haversine formula nearby task matching, availability toggle, and mission navigation.
   - **Professional Caregiver**: Personalized care plans, clinical visit logging, and vitals monitoring.
   - **Administrator**: Live database metrics, volunteer verification pipeline, and crisis management.

2. **Automations & Notifications**:
   - **Indian Standard Time (IST) Medicine Reminders**: Automatic 12-hour AM/PM scheduler polling every minute in `Asia/Kolkata` (UTC+05:30). Delivers in-app notification alerts, Socket.IO real-time dispatches, and Web Push notifications to desktop/Windows.
   - **Dose Adherence & Missed Escalations**: Tracks individual doses (`Pending`, `Taken`, `Missed`). If unanswered after 15 minutes, automatically escalates missed medication alerts to authorized family members.
   - **Location-Based Volunteer Matching**: Evaluates geographic proximity via the Haversine formula (Auto-assigns $\le$ 100m; routes $>100$m to Admin Manual Assignment Queue).
   - **Emergency SOS Dispatch**: One-touch distress broadcast capturing live GPS coordinates, alerting family, admins, and nearby volunteers via WebSockets and Twilio SMS.

---

## ⏰ Indian Standard Time (IST) Medicine Reminder Setup

Eldercare Connect employs an automated backend reminder daemon (`server/services/medicineReminderService.js`) running in `Asia/Kolkata` timezone:

1. **12-Hour AM/PM Input**: The prescription modal accepts times in natural 12-hour format (`Hour: 1-12`, `Minute: 00-55`, `AM/PM`) and stores them unambiguously as 24-hour time strings (`10:00`, `22:00`).
2. **Web Push Configuration**:
   - Set the following environment variables in Render / `.env`:
     ```bash
     WEB_PUSH_PUBLIC_KEY=your_vapid_public_key
     WEB_PUSH_PRIVATE_KEY=your_vapid_private_key
     WEB_PUSH_SUBJECT=mailto:support@eldercare-connect.org
     ```
3. **Browser Push Notification**:
   - Seniors click "Enable Push Alerts" on their Medicine page to register the background service worker (`sw.js`).
   - Reminders trigger notifications even if the tab is inactive or minimized.
4. **Idempotent Delivery**:
   - Every scheduled dose utilizes a unique idempotency key (`rem_userId_medId_date_time`), guaranteeing exactly one reminder per scheduled dose per calendar day.

3. **Accessibility**:
   - Web Speech API voice assistant ("Voice Companion")
   - High Contrast mode & Large Text (A+) mode
   - Full bilingual support (English & Tamil)

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, i18next, react-i18next, Lucide React, Framer Motion, Recharts
- **Backend**: Node.js, Express.js, Socket.IO, JWT, bcryptjs, Helmet, Express Rate Limit
- **Database**: MongoDB & Mongoose (Target: `db01.dbhost.dev:5050/db_458492c92`)
- **Hosting / Deployment**: Render Single Web Service (serving React static build & Express API)

---

## 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `server/.env.example` to `server/.env` and verify database credentials.

3. **Run Tests**:
   ```bash
   npm test
   ```

4. **Start Application**:
   ```bash
   npm run build
   npm start
   ```
   Open `http://localhost:5000` in your web browser.

---

## ☁️ Production Deployment on Render

This project includes a pre-configured `render.yaml` specification:
- **Build Command**: `npm ci --include=dev && npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/api/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `MONGODB_HOST`: `db01.dbhost.dev`
  - `MONGODB_PORT`: `5050`
  - `MONGODB_DATABASE`: `db_458492c92`
  - `MONGODB_USERNAME`: `user_458492c92`
  - `MONGODB_PASSWORD`: [Configured securely in Render environment settings]
  - `MONGODB_AUTH_SOURCE`: `db_458492c92`
  - `JWT_SECRET`: [Secure random string]
