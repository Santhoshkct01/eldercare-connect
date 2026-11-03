# Eldercare Connect - Smart Elderly Assistance Platform

Eldercare Connect is a full-stack MERN application dedicated to elderly care, safety, and health management. It connects senior citizens with family members, verified volunteers, professional caregivers, and administrators.

---

## 🌟 Key Features

1. **Dedicated Role Dashboards**:
   - **Elderly User**: Large typography, high contrast, voice navigation, one-touch SOS dispatch, medicine checklist, and assistance requests.
   - **Family Member**: Real-time GPS location monitoring, medication adherence tracking, and instantaneous emergency notifications.
   - **Community Volunteer**: Haversine formula nearby task matching, availability toggle, and mission navigation.
   - **Professional Caregiver**: Personalized care plans, clinical visit logging, and vitals monitoring.
   - **Administrator**: Live database metrics, volunteer verification pipeline, and crisis management.

2. **Automations**:
   - **Smart Medicine Reminders**: Automatic notifications scheduled via cron, alerts elder and escalates to family members if missed.
   - **Emergency SOS Dispatch**: One-touch broadcast capturing GPS coordinates, alerting family, admins, and nearby volunteers.
   - **Smart Volunteer Matching**: Evaluates distance using the Haversine formula and matches verified volunteers.

3. **Accessibility**:
   - Web Speech API voice assistant ("Voice Companion")
   - High Contrast mode & Large Text (A+) mode
   - Multilingual support (English, Tamil, Hindi)

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, Recharts
- **Backend**: Node.js, Express.js, Socket.IO, JWT, bcryptjs, Helmet, Express Rate Limit
- **Database**: MongoDB & Mongoose (Target: `db01.dbhost.dev:5050/db_458492c92`)
- **Hosting / Deployment**: Render Single Web Service (serving React static build & Express API)

---

## 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm run install:all
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
- **Build Command**: `npm install && cd server && npm install && cd ../client && npm install && npm run build`
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
