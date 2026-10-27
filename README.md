# ClassMate — Smart College Attendance Management System

**ClassMate** is an enterprise-grade, full-stack **Smart College Attendance Management System** engineered with the **MERN** stack (MongoDB, Express.js, React.js, Node.js), real-time **Socket.IO** WebSockets, and **Progressive Web App (PWA)** capabilities.

ClassMate delivers modern, role-segregated portals for **Main Administrators**, **Department Admins / HODs**, **Faculty Teachers**, and **Students**. Key innovations include the **Smart Attendance Radar**, collision-preventing **Timetable System**, persistent **In-App Notifications**, automated 75% target recovery calculations, attendance revision audit trails, multi-division class scheduling (Divisions A–D), Excel-compatible CSV exports, and offline-capable mobile/desktop PWA installation.

---

## 1. Project Overview & Quick Reference

- **Product Name:** **ClassMate**
- **Tagline:** Smart College Attendance Management System
- **Repository:** `attendance-management-system-mern`
- **Architecture:** Unified Single-Port MERN + Socket.IO WebSockets
- **Local Application URL:** [http://localhost:5000](http://localhost:5000)
- **API Base:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PWA Manifest:** [http://localhost:5000/manifest.webmanifest](http://localhost:5000/manifest.webmanifest)
- **Vite Dev Server (HMR):** [http://localhost:5173](http://localhost:5173)

---

## 2. Developer Attribution & Academic Context

- **Developer:** **Ayush Shedge**
- **Degree Program:** Bachelor of Science in Information Technology (B.Sc. IT)
- **Institution:** Vidyalankar School of Information Technology, Mumbai (Class of 2027)
- **Career Focus:** Aspiring Data Analyst & Full-Stack Developer
- **GitHub:** [https://github.com/ayushshedge24-tech](https://github.com/ayushshedge24-tech)
- **LinkedIn:** [https://linkedin.com/in/ayush-shedge-analytics](https://linkedin.com/in/ayush-shedge-analytics)
- **Project Scope:** Academic Evaluation, Viva Demonstration & Portfolio Showcase

---

## 3. Core System Highlights

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ClassMate Core Architecture                     │
├───────────────────┬────────────────────┬─────────────────┬─────────────┤
│ 1. Admin Portal   │ 2. HOD Portal      │ 3. Teacher Hub  │ 4. Student  │
│ • Stats & Roster  │ • IT Dept Scoped   │ • Radar Studio  │ • Attendance│
│ • Program & Depts │ • Defaulter Alerts │ • Live Roster   │ • Timetable │
│ • Timetable Admin │ • Faculty Reports  │ • Manual Review │ • 75% Target│
└───────────────────┴────────────────────┴─────────────────┴─────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Smart Attendance│     │ Dynamic Academic │     │ Progressive Web  │
│      Radar       │     │    Timetables    │     │    App (PWA)     │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│• "Start Radar"   │     │• Weekly schedules│     │• Android install │
│• Socket.IO sync  │     │• Room collisions │     │• Desktop install │
│• W3C Geofencing  │     │• Faculty clashes │     │• Shell caching   │
│• Final submission│     │• Class collisions│     │• 0 API leaks     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### 📡 Smart Attendance Radar Workflow
1. **Teacher Launches Session ("Start Your Radar"):**
   - The teacher selects an assigned subject, division, room, and session duration.
   - Generates a cryptographically randomized 6-character beacon code (`RAD-XXXXXX`) with an active countdown timer.
   - Real-time event `radar_session_started` is broadcast via Socket.IO to enrolled students.
2. **Student Submits Attendance ("Mark Your Attendance"):**
   - The student dashboard widget pulses actively when a lecture radar is detected.
   - Prompts for browser geolocation; validates latitude/longitude within configured classroom radius (default 100m) using the spherical Haversine formula.
   - Prevents duplicate submissions via compound indexing and session locking.
3. **Live Teacher Roster Updates (Zero Polling):**
   - Submissions trigger `attendance_marked_live` over Socket.IO.
   - The teacher's radar studio roster increments counters (Present, Absent, Requires Review) and marks rows in real time without page reload.
4. **Manual Teacher Override & Institutional Lock:**
   - Teachers retain full authority to manually correct student status and enter review notes.
   - Clicking **"Submit Attendance to College Database"** writes permanent records to the `Attendance` collection with immutable audit logs and permanently locks the session against re-submission.

### 🗓️ Academic Timetable Engine & Collision Prevention
- Prevents **Teacher Double-Booking** (faculty cannot be scheduled in two classrooms concurrently).
- Prevents **Classroom Collisions** (two classes cannot occupy the same lecture hall at the same time).
- Prevents **Division Clashes** (students in the same division cannot have overlapping lecture slots).

### 📲 Progressive Web App (PWA) Ready
- Fully installable on **Android Chrome**, **Desktop Chrome/Edge**, and **iOS Safari**.
- Custom application icons (`192x192`, `512x512`, `maskable`, `apple-touch-icon`, and scalable `SVG`).
- **Privacy-First Service Worker:** Caches only static shell assets (HTML, CSS, JS, fonts). **Strictly bypasses all `/api/*` endpoints, WebSockets, and non-GET requests** to ensure zero private student or attendance data is cached.

### 🎯 75% Attendance Target Recovery Formula
For any student below the university mandatory 75% threshold, ClassMate derives the exact number of consecutive lectures $x$ required to restore compliance:

$$\text{Needed Consecutive Classes} = \max\left(0, \lceil 3 \times \text{Total} - 4 \times \text{Present} \rceil\right)$$

---

## 4. Technical Architecture & Technology Stack

### Frontend Architecture
- **Library / Framework:** React 18 (v18.3)
- **Bundler:** Vite (v6.1)
- **Styling:** Tailwind CSS (v3.4) with PostCSS and Autoprefixer
- **Routing:** React Router DOM (v6.28) with nested layouts and protected RBAC guards
- **Real-Time Client:** Socket.IO Client (v4.8)
- **Charts:** Recharts (v2.15) for responsive compliance and distribution charts
- **Icons:** React Icons (`react-icons/fi`) and Lucide React
- **HTTP Client:** Axios (v1.7) with request/response JWT interceptors

### Backend Architecture
- **Runtime:** Node.js (v24.19 / v18+ compatible)
- **Framework:** Express.js (v4.21)
- **Real-Time Engine:** Socket.IO (v4.8) bound to `http.createServer(app)`
- **Database:** MongoDB Community Server (v8.0) / MongoDB Atlas (Cloud)
- **ODM:** Mongoose (v8.9) with compound unique indexes and strict validation
- **Authentication:** JSON Web Tokens (`jsonwebtoken` v9.0) with salted `bcryptjs` hashing (10 rounds)
- **Security Middleware:** Rate limiting (`express-rate-limit`), security headers (`nosniff`, `SAMEORIGIN`, `XSS-Protection`), CORS origin filtering

---

## 5. Project Folder Structure

```
attendance-management-system/
├── .env.example                     # Environment configuration template (safe placeholders)
├── .gitignore                       # Git exclusion rules (.env, node_modules, client/dist)
├── package.json                     # Root scripts (build, start, dev:watch)
├── README.md                        # Primary project documentation
├── docs/                            # Complete Technical Documentation Suite
│   ├── SRS.md                       # Software Requirements Specification
│   ├── SDD.md                       # Software Design Document
│   ├── DATABASE_DESIGN.md           # MongoDB Schemas, ERD & Compound Indexes
│   ├── API_DOCUMENTATION.md         # Full REST API Endpoint Catalog & Permissions
│   ├── ARCHITECTURE.md              # System Architecture & Mermaid Diagrams
│   ├── TESTING.md                   # QA Testing Report & Test Case Catalog
│   ├── USER_MANUAL.md               # User Manual for Admin, HOD, Teacher, Student
│   ├── INSTALLATION_GUIDE.md        # Local Setup & MongoDB Instructions
│   ├── PROJECT_REPORT.md            # University Standard Mini-Project Report
│   └── TRACEABILITY_MATRIX.md       # Requirements to Implementation Mapping
├── client/                          # Frontend React + Vite SPA
│   ├── index.html                   # HTML entry point with PWA meta tags & icons
│   ├── package.json                 # Client dependencies & scripts
│   ├── vite.config.js               # Vite bundler & API proxy configuration
│   ├── public/                      # Static PWA Assets
│   │   ├── manifest.webmanifest     # Web App Manifest (standalone, theme_color)
│   │   ├── sw.js                    # Service Worker (static shell caching, 0 API leaks)
│   │   └── icons/                   # PWA Icons (192px, 512px, maskable, apple-touch, SVG)
│   └── src/
│       ├── App.jsx                  # React Router routes & 4-role protected routes
│       ├── main.jsx                 # React root mount & Service Worker registration
│       ├── components/              # Reusable UI & Widget Components
│       │   ├── ClassMateLogo.jsx    # SVG branding logo with radar rings
│       │   ├── NotificationBell.jsx # Database-backed notification bell with unread badge
│       │   ├── PWAInstallPrompt.jsx # Native one-click install button for PWA
│       │   ├── StudentRadarWidget.jsx # Student active radar beacon & mark dialog
│       │   ├── StudentTimetableWidget.jsx # Student schedule widget
│       │   ├── ProtectedRoute.jsx   # Role-based route guard
│       │   └── StatCard.jsx         # Summary KPI card
│       ├── layouts/
│       │   └── DashboardLayout.jsx  # Glassmorphic sidebar layout with role adaptation
│       ├── pages/
│       │   ├── LoginPage.jsx        # Login page with 1-click viva credentials
│       │   ├── admin/               # Admin pages (Dashboard, Programs, Timetable, etc.)
│       │   ├── hod/                 # HOD pages (Dept Dashboard, Faculty, Defaulters, etc.)
│       │   ├── teacher/             # Teacher pages (Radar Studio, Timetable, Mark, Reports)
│       │   └── student/             # Student pages (Dashboard, Timetable, History)
│       └── services/
│           ├── api.js               # Axios instance with Bearer JWT interceptors
│           └── socket.js            # Socket.IO client singleton
└── server/                          # Backend Express REST API & WebSockets
    ├── .env                         # Server environment configuration (ignored by Git)
    ├── .env.example                 # Safe server environment template
    ├── package.json                 # Server dependencies & scripts
    ├── server.js                    # Express app initialization, Socket.IO, static SPA serving
    ├── socket.js                    # Socket.IO room manager (session & user channels)
    ├── config/
    │   └── db.js                    # Mongoose connection with Atlas 10s timeout & memory guard
    ├── controllers/
    │   ├── radarController.js       # Smart Attendance Radar engine & geofence validation
    │   ├── timetableController.js   # Timetable scheduler & 3-tier collision prevention
    │   ├── notificationController.js# In-app notifications & unread counters
    │   ├── attendanceController.js  # Attendance marking, history, audits, and summaries
    │   ├── authController.js        # Authentication & staff directory
    │   ├── hodController.js         # Scoped HOD analytics & defaulter tracking
    │   └── subjectController.js     # Subject management
    ├── models/
    │   ├── Attendance.js            # Attendance records with embedded editHistory audit
    │   ├── AttendanceSession.js     # Live Radar sessions with attendees & geofence bounds
    │   ├── Timetable.js             # Academic timetable slots with collision indexes
    │   ├── Notification.js          # Persistent user notifications
    │   ├── User.js                  # Staff accounts (Admin, HOD, Teacher)
    │   ├── Student.js               # Student accounts
    │   ├── Subject.js               # Curriculum courses
    │   ├── Department.js            # College departments
    │   └── Program.js               # Degree programs (Divisions A–D)
    └── routes/                      # Express route endpoints
```

---

## 6. Installation & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v9.0.0 or higher (packaged with Node.js)
- **MongoDB:** MongoDB Community Server running locally on port `27017`

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/ayushshedge24-tech/attendance-management-system-mern.git
cd attendance-management-system-mern

# Install root, server, and client dependencies
npm run install-all
```

### Step 2: Environment Configuration
Create a `.env` file inside `server/` (or copy from `server/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/attendance_db
JWT_SECRET=your_long_random_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=*
```

### Step 3: Run the Application

#### Option A: Unified Single-Port Mode (Recommended — Mirrors Production)
Builds the client and serves both the React application, API, and Socket.IO on port 5000:
```bash
npm run build
npm start
```
- Open: [http://localhost:5000](http://localhost:5000)

#### Option B: Concurrent Development Mode
Runs the backend with auto-reload and the Vite frontend with Hot Module Replacement (HMR):
```bash
npm run dev:watch
```
- React UI (Vite Dev): [http://localhost:5173](http://localhost:5173)
- Backend API & WebSockets: [http://localhost:5000](http://localhost:5000)

---

## 7. Demonstration Credentials (Viva & Evaluation)

The login screen includes **1-Click Quick-Fill Viva Buttons** for rapid role switching:

| Role | Username / ID | Password | Scope & Primary URL |
| :--- | :--- | :--- | :--- |
| **Main Admin** | `admin@attendance.com` | `Admin@123` | Institutional Admin: [http://localhost:5000/admin/dashboard](http://localhost:5000/admin/dashboard) |
| **HOD (IT Dept)** | `hod.it@attendance.com` | `Hod@123` | Department Portal: [http://localhost:5000/hod/dashboard](http://localhost:5000/hod/dashboard) |
| **Faculty Teacher** | `teacher@attendance.com` | `Teacher@123` | **Radar Studio**: [http://localhost:5000/teacher/radar](http://localhost:5000/teacher/radar) |
| **Student 1** | `STU1001` (Roll 1) | `Student@123` | Student Portal: [http://localhost:5000/student/dashboard](http://localhost:5000/student/dashboard) |
| **Student 2** | `STU1002` (Roll 2) | `Student@123` | Multi-session test: [http://localhost:5000/student/dashboard](http://localhost:5000/student/dashboard) |

---

## 8. Automated Testing & Verification Suite

ClassMate includes automated verification suites covering end-to-end user flows, security boundaries, and PWA compliance:

```bash
# 1. Comprehensive E2E Regression Suite (33 Tests)
node server/test_api.js

# 2. Deep 10-Feature Audit Suite (19 Tests)
node server/verify_all_features.js

# 3. PWA Standards & Privacy Compliance Suite (9 Tests)
node server/verify_pwa.js

# 4. Security Patches & IDOR Verification (3 Tests)
node server/verify_security_fixes.js
```

### Verified Test Summary:
- ✅ **Server Health & 4-Role Authentication** (Admin, HOD, Teacher, Student)
- ✅ **Cross-Student Record Isolation** (HTTP 403 Forbidden verified)
- ✅ **Smart Radar Session Lifecycle** (Cryptographic code generation, student submission, duplicate rejection)
- ✅ **Socket.IO Real-Time Live Sync** (Teacher roster receives instant event without reload)
- ✅ **W3C Geolocation & Geofencing** (Haversine distance calculation, out-of-bounds 400 rejection)
- ✅ **Teacher Session Ownership** (Cross-teacher session edit/finalize blocked with 403)
- ✅ **Timetable Engine & Collision Prevention** (Teacher & classroom double-booking rejected with 400)
- ✅ **PWA Installability** (Manifest, Service Worker, 192px/512px/maskable icons, 0 API leaks)

---

## 9. Online Deployment Preparation (Render + MongoDB Atlas)

ClassMate is pre-configured for turnkey single-port deployment on **Render**:

1. **MongoDB Atlas Setup:**
   - Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Set Network Access to `0.0.0.0/0` (Allow from anywhere) and copy the `mongodb+srv://` connection string.
2. **Render Web Service Configuration:**
   - Connect repository on [Render](https://dashboard.render.com).
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/attendance_db?retryWrites=true&w=majority`
     - `JWT_SECRET`: `your_random_64_character_hex_key`
     - `JWT_EXPIRE`: `7d`
     - `CORS_ORIGIN`: `*`
3. **PWA & GPS on Production:**
   - Render automatically provisions SSL/HTTPS. On mobile/desktop, users can immediately install ClassMate as a standalone PWA and grant GPS location permissions.

---

## 10. Technical Realism Disclosure

To maintain scientific and professional integrity:
* **GPS & Geolocation:** Genuinely implemented via the W3C Geolocation API (`navigator.geolocation`) and audited on the backend using the spherical Haversine formula against configurable classroom bounds.
* **Socket.IO:** Genuinely implemented for real-time WebSocket state transport (`attendance_marked_live`, `attendee_status_updated`). Does **not** detect physical hardware.
* **Bluetooth Low Energy (BLE) & Wi-Fi MAC Discovery:** Standard web browsers sandboxing prevents silent background BLE scanning and router BSSID/ARP inspection. ClassMate transparently documents that native hardware BLE/Wi-Fi discovery requires companion native mobile apps or enterprise 802.1X RADIUS controller integration.

---

*ClassMate — Engineered and maintained by Ayush Shedge (Class of 2027).*
