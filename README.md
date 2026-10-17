# Attendance Management System (AMS) — MERN

A modern, full-stack **College Attendance Management System** engineered with the **MERN** stack (MongoDB, Express.js, React.js, and Node.js). Features role-segregated portals for **Administrators**, **Faculty Teachers**, and **Students**, automated attendance percentage calculations, shortage alerts, and CSV data export for academic evaluation.

---

## 1. Project Title & Overview

- **Project Name:** Attendance Management System (AMS) — MERN
- **Repository Name:** `attendance-management-system-mern`
- **Application URL:** [http://localhost:5000](http://localhost:5000)
- **API Base:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

In higher-education institutions, traditional paper-based attendance registers are time-intensive, prone to discrepancies, and restrict real-time academic visibility. The **MERN Attendance Management System** delivers a centralized, role-based platform that replaces manual roll-calling with automated attendance logging, dynamic percentage calculation, shortage monitoring, and faculty reporting.

---

## 2. Developer Attribution

- **Developer:** **Ayush Shedge**
- **Degree:** B.Sc. Information Technology
- **College:** Vidyalankar School of Information Technology, Mumbai
- **Expected Graduation:** 2027
- **Career Goal:** Aspiring Data Analyst
- **GitHub:** [https://github.com/ayushshedge24-tech](https://github.com/ayushshedge24-tech)
- **LinkedIn:** [https://linkedin.com/in/ayush-shedge-analytics](https://linkedin.com/in/ayush-shedge-analytics)

---

## 3. Academic Details

- **Academic Institution:** Vidyalankar School of Information Technology, Mumbai
- **Department:** Department of Information Technology
- **Program:** Bachelor of Science in Information Technology (B.Sc. IT)
- **Class/Cohort:** Class of 2027
- **Academic Project Scope:** Final Academic Mini-Project & Technical Portfolio Demonstration

---

## 4. Project Objectives

1. **Eliminate Manual Attendance Overhead:** Provide faculty with rapid, one-click batch attendance marking.
2. **Role-Segregated Dashboards:** Deliver tailored workflows for Institutional Administrators, Faculty Teachers, and Enrolled Students.
3. **Transparent Academic Tracking:** Enable students to monitor personal attendance rates, verify lecture dates, and track subject-level percentages.
4. **Automated Shortage Detection:** Alert students and faculty when attendance falls below the mandatory 75% institutional threshold.
5. **Data Analytics & Export:** Equip faculty and administrators with attendance trend charts and Excel-compatible CSV exports.
6. **Data Security & Privacy:** Strictly isolate student records so students cannot view other students' private attendance logs.

---

## 5. Main Features

- 🔐 **Role-Based Access Control (RBAC):** Distinct route guards and authorization middleware for Admin, Teacher, and Student roles.
- ⚡ **Batch Attendance Marking:** Mark an entire classroom as Present/Absent with a single click and submit via bulk database operations.
- 🔄 **Attendance Corrections & Auditing:** Authorized teachers and administrators can edit previously submitted records without duplicate collisions.
- 📊 **Visual Analytics:** Interactive Recharts charts (Daily Attendance Trend, Donut Status Distribution, and Subject Comparison Bars).
- 📥 **Excel-Compatible CSV Export:** One-click download of attendance logs, student summaries, and defaulter registers with UTF-8 BOM encoding.
- ⚠️ **Defaulter & Shortage Warning System:** Color-coded status badges (`Eligible` ≥ 75%, `Warning` 60–74%, `Defaulter` < 60%) and projected classes needed to regularize attendance.
- 📱 **Responsive UI:** Modern layout built with Tailwind CSS, supporting mobile, tablet, and desktop viewports.

---

## 6. Role Capabilities

### 👨‍💼 Administrator Portal
- **System Overview:** Total students, total curriculum subjects, today's attendance metrics, and college-wide average attendance.
- **Student Management (CRUD):** Add, view, search, edit, and delete student records with semester and division filters.
- **Subject Management (CRUD):** Add, edit, and assign curriculum courses to faculty members.
- **Attendance Management:** View all system attendance logs, perform manual overrides, and export historical logs to CSV.
- **Analytics & Reports:** Consolidated student-wise and subject-wise reports with printable layouts and CSV download.

### 👩‍🏫 Faculty Teacher Portal
- **Faculty Dashboard:** Live metrics on assigned subjects, enrolled students, sessions conducted today, and pending sessions.
- **Assigned Subjects:** Filter and monitor courses assigned specifically to the logged-in teacher.
- **Mark Attendance:** Select subject, lecture session, date, and semester/division to mark student rosters with *Mark All Present* / *Mark All Absent* shortcuts.
- **Edit Attendance:** Retrieve previously submitted dates and update individual student statuses with faculty remarks.
- **Absentee & Defaulter Tracking:** Identify daily absentees and view chronic defaulters with required attendance calculations.
- **Faculty Reports:** Daily session breakdown, subject-level averages, monthly audit summaries, and CSV exports.

### 🎓 Student Portal
- **Personal Dashboard:** Real-time personal attendance percentage, total classes conducted, classes attended, classes missed, and enrolled subjects.
- **Shortage Alert Banner:** Prominent notification if overall attendance falls below the required 75% threshold.
- **Subject Breakdown:** Subject-wise breakdown showing conducted, attended, and absent counts with status badges.
- **Day-Wise History Ledger:** Chronological record of every lecture session showing exact date, day of week, subject code, lecture session, and status (Present/Absent).
- **Date & Subject Filtering:** Filter personal attendance history by curriculum course, calendar month, or custom date range.
- **Monthly Summary:** Month-by-month attendance breakdown with monthly attendance percentage.
- **Personal Profile:** Display enrolled degree program, semester, division, roll number, and official student email.

---

## 7. Technology Stack

### Frontend Architecture
- **Library/Framework:** React.js (v18.3)
- **Build Tool:** Vite (v6.1)
- **Styling:** Tailwind CSS (v3.4) with PostCSS and Autoprefixer
- **Routing:** React Router DOM (v6.28) with nested layouts and protected route guards
- **State Management:** React Context API (`AuthContext`, `ToastContext`)
- **Data Visualization:** Recharts (v2.15) for interactive responsive charts
- **Icons:** React Icons (`react-icons/fi`) and Lucide React
- **HTTP Client:** Axios (v1.7) with request/response interceptors for automatic JWT attachment

### Backend Architecture
- **Runtime:** Node.js (v24.19)
- **Framework:** Express.js (v4.21)
- **Database:** MongoDB Community Server (v8.0)
- **Object Data Modeling:** Mongoose (v8.9) with schema validation, indexes, and hooks
- **Authentication:** JSON Web Tokens (`jsonwebtoken` v9.0)
- **Password Security:** Salted hashing with `bcryptjs` (10 rounds)
- **Cross-Origin Handling:** CORS middleware (`cors` v2.8)
- **Environment Management:** `dotenv` (v16.4)

---

## 8. System Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|              React 18 + Vite + Tailwind CSS + React Router + Recharts           |
|                                                                                 |
|   +-----------------------+  +-----------------------+  +-------------------+   |
|   |   Student Dashboard   |  |   Teacher Dashboard   |  |  Admin Dashboard  |   |
|   +-----------------------+  +-----------------------+  +-------------------+   |
+---------------------------------------------------------------------------------+
                                         |
                            HTTP / REST with Bearer JWT
                                         |
+---------------------------------------------------------------------------------+
|                                 SERVER LAYER                                    |
|                             Node.js + Express.js                                |
|                                                                                 |
|   +------------------------+  +-----------------------+  +------------------+   |
|   | authMiddleware (JWT)   |  | roleMiddleware (RBAC)|  | errorMiddleware  |   |
|   +------------------------+  +-----------------------+  +------------------+   |
|                                                                                 |
|   Routes: /api/auth, /api/students, /api/subjects, /api/attendance, /api/teacher|
+---------------------------------------------------------------------------------+
                                         |
                               Mongoose ODM (v8)
                                         |
+---------------------------------------------------------------------------------+
|                                DATABASE LAYER                                   |
|                           MongoDB Community Server                              |
|                                                                                 |
|   Collections: users (2) | students (20) | subjects (5) | attendances (1,003+)  |
+---------------------------------------------------------------------------------+
```

---

## 9. Project Folder Structure

```
attendance-management-system/
├── .env.example                     # Root environment template (placeholders)
├── .gitignore                       # Git exclusion rules (.env, node_modules, dist)
├── package.json                     # Root scripts (build, start, dev:watch)
├── README.md                        # Documentation and project portfolio guide
├── client/                          # Frontend React + Vite Application
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Client dependencies & scripts
│   ├── tailwind.config.js           # Tailwind design tokens
│   ├── vite.config.js               # Vite bundler configuration
│   └── src/
│       ├── App.jsx                  # Main router configuration & route guards
│       ├── main.jsx                 # React root mount
│       ├── index.css                # Global Tailwind CSS directives
│       ├── components/              # Reusable UI components
│       │   ├── AboutDeveloperModal.jsx  # Developer profile modal (Ayush Shedge)
│       │   ├── Modal.jsx            # Reusable accessible dialog modal
│       │   ├── ProgressBar.jsx      # Color-coded attendance progress bar
│       │   ├── ProtectedRoute.jsx   # Role-based route authorization guard
│       │   └── StatCard.jsx         # KPI summary card
│       ├── context/                 # Context providers
│       │   ├── AuthContext.jsx      # Authentication state and login/logout handlers
│       │   └── ToastContext.jsx     # Global notification toast provider
│       ├── layouts/
│       │   └── DashboardLayout.jsx  # Responsive layout, sidebar, header, footer
│       ├── pages/
│       │   ├── LoginPage.jsx        # Login page with demo credentials
│       │   ├── admin/               # Administrator pages
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AttendanceRecordsPage.jsx
│       │   │   ├── MarkAttendancePage.jsx
│       │   │   ├── ReportsPage.jsx
│       │   │   ├── StudentsPage.jsx
│       │   │   └── SubjectsPage.jsx
│       │   ├── teacher/             # Faculty Teacher pages
│       │   │   ├── TeacherAbsentStudentsPage.jsx
│       │   │   ├── TeacherAttendanceHistoryPage.jsx
│       │   │   ├── TeacherDashboard.jsx
│       │   │   ├── TeacherEditAttendancePage.jsx
│       │   │   ├── TeacherMarkAttendancePage.jsx
│       │   │   ├── TeacherReportsPage.jsx
│       │   │   ├── TeacherStudentsPage.jsx
│       │   │   └── TeacherSubjectsPage.jsx
│       │   └── student/             # Student portal pages
│       │       ├── StudentAttendanceHistory.jsx
│       │       ├── StudentDashboard.jsx
│       │       ├── StudentMonthlySummary.jsx
│       │       ├── StudentProfile.jsx
│       │       └── StudentSubjectAttendance.jsx
│       ├── services/
│       │   └── api.js               # Axios instance with JWT interceptors
│       └── utils/
│           └── exportCsv.js         # Excel-compatible CSV export helper
└── server/                          # Backend Express REST API
    ├── .env                         # Server environment configuration (ignored by Git)
    ├── .env.example                 # Safe environment configuration template
    ├── package.json                 # Backend dependencies & scripts
    ├── server.js                    # Express app initialization & static SPA serving
    ├── test_api.js                  # Automated 16-step E2E verification suite
    ├── config/
    │   └── db.js                    # MongoDB Mongoose connection handler
    ├── controllers/
    │   ├── attendanceController.js  # Attendance marking, history, and summaries
    │   ├── authController.js        # Authentication & teacher directory
    │   ├── dashboardController.js   # Admin analytics & Recharts chart datasets
    │   ├── studentController.js     # Student management CRUD
    │   ├── subjectController.js     # Subject management CRUD
    │   └── teacherController.js     # Faculty statistics, absent students, & reports
    ├── middleware/
    │   ├── authMiddleware.js        # JWT verification middleware
    │   ├── errorMiddleware.js       # 404 & centralized error handler
    │   └── roleMiddleware.js        # RBAC permission enforcer
    ├── models/
    │   ├── Attendance.js            # Attendance schema with unique compound index
    │   ├── Student.js               # Student schema with password hashing
    │   ├── Subject.js               # Subject schema with faculty assignment
    │   └── User.js                  # Staff user schema (Admin & Teacher)
    ├── routes/
    │   ├── attendanceRoutes.js
    │   ├── authRoutes.js
    │   ├── dashboardRoutes.js
    │   ├── studentRoutes.js
    │   ├── subjectRoutes.js
    │   └── teacherRoutes.js
    ├── services/
    │   └── attendanceService.js     # Date normalization & mathematical calculations
    └── utils/
        ├── generateToken.js         # JWT signing utility
        └── seedData.js              # Initial demo data seeder (bypassed if db populated)
```

---

## 10. Database Schema Overview

The system uses four collections in the `attendance_db` MongoDB database:

### 1. `users` (Staff Collection)
Stores administrative staff and faculty members:
- `name` (String, required): Full name
- `email` (String, required, unique): Work email address
- `password` (String, select: false): 10-round bcrypt salted hash
- `role` (String, enum: `['admin', 'teacher']`): System permission tier
- `department` (String): Academic department

### 2. `students` (Student Collection)
Stores student academic profiles and credentials:
- `studentId` (String, required, unique, uppercase): Official ID (e.g., `STU1001`)
- `name` (String, required): Student full name
- `email` (String, required, unique): Official college email
- `phone` (String): Contact phone number
- `course` (String): Program of study (e.g., `B.Tech Computer Science`)
- `semester` (Number, 1–8): Enrolled semester
- `division` (String): Class division (e.g., `A`, `B`)
- `rollNumber` (Number, required): Class roll number
- `password` (String, select: false): 10-round bcrypt salted hash
- `role` (String, default: `'student'`): Immutable student role identifier

### 3. `subjects` (Curriculum Courses)
Stores course information and faculty assignment:
- `subjectCode` (String, required, unique, uppercase): Course code (e.g., `IT301`)
- `subjectName` (String, required): Descriptive title
- `semester` (Number, 1–8): Program semester
- `department` (String): Department offering the course
- `teacher` (ObjectId, ref: `'User'`): Assigned faculty member

### 4. `attendances` (Instructional Session Records)
Stores individual student attendance per lecture:
- `student` (ObjectId, ref: `'Student'`, required): Student reference
- `subject` (ObjectId, ref: `'Subject'`, required): Subject reference
- `date` (Date, required): Normalized UTC date
- `session` (String, default: `'Lecture 1'`): Lecture or laboratory session
- `status` (String, enum: `['Present', 'Absent']`): Attendance mark
- `markedBy` (ObjectId, ref: `'User'`): Faculty or Admin who logged the record
- `remarks` (String): Faculty remarks or medical excuse notes

**Database Constraints & Indexes:**
- Unique compound index: `{ student: 1, subject: 1, date: 1, session: 1 }` prevents duplicate marking collisions for the same student in the same lecture.
- Query optimization indexes on `{ subject: 1, date: -1 }`, `{ student: 1, date: -1 }`, and `{ date: -1 }`.

---

## 11. Attendance Calculation Formula

All statistics across student dashboards and teacher reports are calculated dynamically using the standard academic formula:

$$\text{Attendance Percentage} = \left(\frac{\text{Present Classes}}{\text{Total Conducted Classes}}\right) \times 100$$

### Implementation Rules:
- **Zero-Safe Division:** If `Total Conducted Classes === 0`, the percentage is safely reported as `0%` rather than returning `NaN` or crashing.
- **Exclusion of Unrecorded Dates:** Missing or unscheduled dates are never counted as absences. Percentages reflect only actual recorded instructional sessions.
- **Consistent Rounding:** Percentages are rounded to one decimal place (`Number.prototype.toFixed(1)`).
- **Eligibility Classification:**
  - 🟢 **Eligible:** $\ge 75\%$ (Meets university exam threshold)
  - 🟡 **Warning:** $60\% \le \text{Attendance} < 75\%$ (Shortage alert issued)
  - 🔴 **Defaulter:** $< 60\%$ (Critical attendance shortage)

---

## 12. Installation Prerequisites

- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v9.0.0 or higher (packaged with Node.js)
- **MongoDB:** MongoDB Community Server (v6.0 or higher) running locally on port `27017`

---

## 13. MongoDB Local Setup

Ensure your local MongoDB Community Server is running. In Windows PowerShell:

```powershell
# Check if MongoDB service is active
Get-Service -Name MongoDB

# If stopped, start the service
Start-Service -Name MongoDB
```

The database `attendance_db` is accessed locally at:
```
mongodb://127.0.0.1:27017/attendance_db
```

---

## 14. Environment Variable Configuration

Create a file named `.env` inside the `server/` directory using the provided safe placeholder template:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/attendance_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

> **Security Note:** Never commit `.env` files to Git. The `.gitignore` file is configured to exclude all `.env` files and nested environment configurations.

---

## 15. Run Commands

### Option A: Unified Production Mode (Recommended)
Builds the Vite frontend and serves both the React application and Express API on a single port:

```powershell
# From the project root:
npm run build
npm start
```
- **Web Application & API:** [http://localhost:5000](http://localhost:5000)
- **Health Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Option B: Concurrent Development Mode
Runs the backend with auto-reload and the Vite frontend with Hot Module Replacement (HMR):

```powershell
# From the project root:
npm run dev:watch
```
- **React UI (Vite Dev Server):** [http://localhost:5173](http://localhost:5173)
- **Express Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 16. REST API Endpoint Overview

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and timestamp |
| `POST` | `/api/auth/login` | Public | Authenticate user (Admin, Teacher, or Student) |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/auth/teachers` | Admin / Teacher | List faculty teacher directory |
| `GET` | `/api/students` | Admin | Query students with search/filter/pagination |
| `POST` | `/api/students` | Admin | Register new student |
| `PUT` | `/api/students/:id` | Admin | Update student information |
| `DELETE` | `/api/students/:id` | Admin | Delete student and cascade attendance |
| `GET` | `/api/subjects` | Admin / Teacher | List curriculum subjects |
| `POST` | `/api/subjects` | Admin | Add curriculum subject and assign teacher |
| `POST` | `/api/attendance` | Admin / Teacher | Mark attendance (batch or single) |
| `GET` | `/api/attendance` | Admin / Teacher | Query attendance logs with filters |
| `PUT` | `/api/attendance/:id` | Admin / Teacher | Correct attendance status/remarks |
| `DELETE` | `/api/attendance/:id` | Admin / Teacher | Delete individual attendance record |
| `GET` | `/api/attendance/student/:id` | Student (Self) / Staff | Fetch day-wise personal attendance logs |
| `GET` | `/api/attendance/student/:id/summary` | Student (Self) / Staff | Calculate dynamic attendance metrics |
| `GET` | `/api/attendance/student/:id/monthly` | Student (Self) / Staff | Fetch monthly breakdown by month |
| `GET` | `/api/teacher/dashboard-stats` | Teacher / Admin | Retrieve faculty dashboard statistics |
| `GET` | `/api/teacher/subjects` | Teacher / Admin | Retrieve teacher's assigned subjects |
| `GET` | `/api/teacher/absent-students` | Teacher / Admin | List daily absentees and chronic defaulters |
| `GET` | `/api/teacher/reports` | Teacher / Admin | Generate daily, student, subject, monthly reports |

---

## 17. Testing Instructions & Verified Results

An automated end-to-end test suite is included in `server/test_api.js`. To execute the test suite against the running server:

```powershell
node server/test_api.js
```

### Verified Test Results (100% Pass Rate):
- ✅ **Test 1 — Health Check:** Server status `200 OK`.
- ✅ **Test 2 — Admin Login:** Authenticated with admin role and received valid JWT.
- ✅ **Test 3 — Teacher Login:** Authenticated as `Prof. Priya Verma` with teacher role.
- ✅ **Test 4 — Student Login:** Authenticated with Student ID `STU1001` (`Aarav Patel`).
- ✅ **Test 5 — Calculation Verification:** Confirmed $(49/53) \times 100 = 92.5\%$, matching API output.
- ✅ **Test 6 — Student History & Filtering:** Retrieved 53 records and verified subject-level filtering.
- ✅ **Test 7 — Monthly Summary:** Computed monthly breakdown for October 2026.
- ✅ **Test 8 — Security & Record Isolation:** Verified that Student 1 receives HTTP `403 Forbidden` when attempting to access Student 2's summary or history.
- ✅ **Test 9 — Teacher Dashboard Metrics:** Computed live assigned student count, conducted classes, and today's session status.
- ✅ **Test 10 — Faculty Subject Assignment:** Verified 3 assigned courses for faculty (`IT301`, `IT302`, `IT304`).
- ✅ **Test 11 — Batch Attendance Submission:** Marked batch attendance with status confirmation.
- ✅ **Test 12 — Attendance Correction:** Edited attendance record and verified database persistence.
- ✅ **Test 13 — Defaulter Detection:** Identified chronic defaulters with required attendance calculations.
- ✅ **Test 14 — Faculty Reports:** Generated student-wise, daily, and monthly audit summaries.
- ✅ **Test 15 — Security & Subject Assignment:** Verified that teachers receive HTTP `403 Forbidden` if attempting to mark attendance for unassigned subjects.
- ✅ **Test 16 — Admin Features:** Verified faculty list retrieval and college-wide average attendance rate.

---

## 18. Recommended Screenshots Guide

When preparing documentation or portfolio presentations, capture the following application views:

1. **Login Page (`/login`):** Showing role-selector tabs (Admin/Teacher vs. Student) and 1-click viva quick-fill credentials.
2. **Admin Dashboard (`/admin/dashboard`):** Showing total student counts, subject counts, and Recharts analytics.
3. **Teacher Mark Attendance (`/teacher/mark-attendance`):** Showing subject selection, student roster table, and *Mark All Present* / *Mark All Absent* buttons.
4. **Teacher Absentee & Defaulters (`/teacher/absent-students`):** Showing daily absentee table, chronic defaulters list, and the Export CSV action.
5. **Teacher Reports & Analytics (`/teacher/reports`):** Showing subject averages, student breakdown, and CSV download.
6. **Student Personal Dashboard (`/student/dashboard`):** Showing attendance percentage badge, 6 KPI cards, and 75% shortage alert banner.
7. **Student Day-Wise Attendance (`/student/attendance`):** Showing table of classes attended/missed with green/red status badges and CSV export.
8. **About Developer Modal:** Showing developer attribution, college details, and professional profile links.

---

## 19. Demo Login Credentials (For Viva & Evaluation)

The application login screen includes **1-Click Viva Quick-Fill Buttons** to instantly populate credentials:

| Role | Username / ID | Password | Portal Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@attendance.com` | `Admin@123` | Institutional management, student CRUD, subject CRUD, all logs, analytics |
| **Teacher** | `teacher@attendance.com` | `Teacher@123` | Assigned subjects, mark attendance, edit records, absentee monitoring |
| **Student** | `STU1001` (or `aarav.patel.stu@attendance.com`) | `Student@123` | Personal attendance tracking, subject breakdown, history, monthly audit |

---

## 20. Known Limitations & Future Enhancements

- **SMS / WhatsApp Alerts:** Integrate Twilio or WhatsApp Business API to send real-time shortage alerts directly to parents.
- **Biometric / RFID Readers:** Interface classroom hardware scanners with an Express webhook to mark attendance automatically.
- **Direct Excel (.xlsx) Export:** Expand beyond the current UTF-8 CSV exporter to offer formatted `.xlsx` workbooks with embedded formulas.
- **Timetable Scheduling Engine:** Tie daily attendance options to dynamic timetable schedules based on academic day-orders.

---

## 21. About the Developer

**Ayush Shedge**  
*Aspiring Data Analyst | B.Sc. Information Technology*  
Vidyalankar School of Information Technology, Mumbai (Class of 2027)

- **GitHub:** [https://github.com/ayushshedge24-tech](https://github.com/ayushshedge24-tech)
- **LinkedIn:** [https://linkedin.com/in/ayush-shedge-analytics](https://linkedin.com/in/ayush-shedge-analytics)
- **Project Repository:** [https://github.com/ayushshedge24-tech/attendance-management-system-mern](https://github.com/ayushshedge24-tech/attendance-management-system-mern)

---

*Academic Mini-Project — Developed and maintained by Ayush Shedge.*
