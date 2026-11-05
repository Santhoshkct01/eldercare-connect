# APPLICATION AUDIT REPORT: ELDERCARE CONNECT

**Date**: November 5, 2026  
**Auditor**: Antigravity Full-Stack Agent  
**Repository**: [Santhoshkct01/eldercare-connect](https://github.com/Santhoshkct01/eldercare-connect)  
**Live Application**: [https://eldercare-connect.onrender.com/](https://eldercare-connect.onrender.com/)

---

## 1. Executive Summary

A comprehensive, end-to-end audit was conducted across the entire ElderCare Connect project, covering:
- **Frontend**: React 18 SPA (Vite, React Router v6, Tailwind CSS, i18next English/Tamil, Axios, Socket.IO client).
- **Backend**: Node.js & Express.js REST API, JWT auth & role middleware, Socket.IO, node-cron automations, Twilio SMS service.
- **Database**: MongoDB hosted on `db01.dbhost.dev:5050/db_458492c92` with Mongoose ODM models.
- **Business Logic**: Proximity-based volunteer assignment, emergency SOS pipeline, medication adherence tracking, and wellness check-ins.

Overall, the core architecture is well-structured and deployed. However, critical gaps were discovered that hinder full reliability and user control—most notably:
1. Missing **Edit** and **Cancel** functionality for senior assistance requests on both the frontend and backend.
2. Incomplete cleanup of obsolete **Caregiver** endpoints (`/api/features/careplans`) and translation artifacts.
3. Lack of **cancellation audit fields** in the `AssistanceRequest` database schema (`cancelledAt`, `cancelledBy`, `updatedAt`).
4. Absence of dynamic location loading on `FamilyLocation.jsx` (which was hardcoded to static coordinates).
5. Lack of automated verification test suites for location matching rules and assistance request lifecycles.

---

## 2. Detailed Findings by Category

### A. Business Logic & Location Assignment
- **Strengths**: 
  - `volunteerAssignmentService.js` centrally uses `calculateDistance` (Haversine formula in `matchingService.js`) and compares against `SAME_LOCATION_RADIUS_METERS` (default: 100 meters).
  - Rule 1 (within 100m) properly auto-assigns approved & available volunteers.
  - Rule 2 (exceeding 100m or invalid GPS) routes to the Admin Manual Queue without auto-assignment.
- **Deficiencies**:
  - Editing a request currently does not exist; if a senior's assistance location or category changes, there was no endpoint or UI to re-evaluate the assignment.
  - No cancellation mechanism for pending or assigned requests. If a senior cancels an errand, assigned volunteers and admins were not notified, and requests lingered in the database indefinitely.

### B. Obsolete Caregiver Role Remnants
- **Strengths**: 
  - User model and authentication controller strictly allow only `['elder', 'family', 'volunteer', 'admin']`.
  - Registration UI only permits the four active roles.
  - Sidebar and App routing have deleted caregiver views.
- **Deficiencies**:
  - `server/routes/featureRoutes.js` still contained `/careplans` routes referring to `CarePlan` model with `caregiver` field.
  - `server/models/OtherModels.js` defined `carePlanSchema` referencing `caregiver`.
  - Locale files (`en/translation.json` and `ta/translation.json`) retained obsolete `caregiver` keys.

### C. Assistance Request Management (Edit & Cancel Workflows)
- **Frontend Deficiencies**:
  - `client/src/dashboards/elder/ElderRequests.jsx` offered no "Edit Request" or "Cancel Request" buttons.
  - Elderly users could not correct typos, adjust preferred times/dates, or change priorities once submitted.
- **Backend Deficiencies**:
  - `server/controllers/requestController.js` and `server/routes/requestRoutes.js` lacked `PUT /api/requests/:id` (edit) and `PUT /api/requests/:id/cancel` (cancel).
  - When a request is cancelled, notifications must be dispatched to any assigned volunteer and administrators, and status must update to `'Cancelled'` while preserving history.

### D. Family Member Experience & Location Tracking
- **Deficiencies**:
  - `client/src/dashboards/family/FamilyLocation.jsx` had static coordinates hardcoded (`11.0168, 76.9558`). It did not fetch the connected senior's live GPS coordinates from `/api/features/location` or `/api/users`.

### E. Navigation, Authentication & Routing
- **Strengths**:
  - `AuthContext.jsx` and `api.js` interceptors persist JWT cleanly in `localStorage`.
  - Protected routes render informative 403 Access Denied views for mismatched roles rather than jarring blank pages.
- **Observations**:
  - Public routes properly exempted from session refresh timeouts.

---

## 3. Action Items & Improvement Plan

1. **AssistanceRequest Schema & Endpoints**:
   - Add schema fields: `cancelledAt`, `cancelledBy`, `cancellationReason`.
   - Implement `updateRequest` (edit) in `requestController.js`: validate permissions, update allowed fields, re-evaluate assignment if location/category changes, notify assigned volunteer.
   - Implement `cancelRequest` in `requestController.js`: confirm request is not already 'Completed', set status to 'Cancelled', record timestamp, notify volunteer and admins.
   - Register routes in `requestRoutes.js`: `PUT /api/requests/:id` and `PUT /api/requests/:id/cancel`.
2. **Frontend Elder Assistance Dashboard**:
   - Add **Edit Request** modal with form pre-population for eligible requests (Pending or Volunteer Assigned).
   - Add **Cancel Request** confirmation dialog with optional reason input.
   - Update request item status badges with bilingual Tamil & English status labels.
3. **Family Location Integration**:
   - Update `FamilyLocation.jsx` to dynamically load connected elderly family member coordinates and address with live Google Maps tracking links.
4. **Purge Remaining Caregiver Remnants**:
   - Remove unused care plan routes and model schemas.
   - Clean translation keys.
5. **Testing & Verification**:
   - Run unit test scripts for Haversine matching (<100m, >100m, missing GPS, unavailable volunteer, ranking).
   - Test request editing and cancellation lifecycle.
   - Verify frontend production build (`npm run build`).

