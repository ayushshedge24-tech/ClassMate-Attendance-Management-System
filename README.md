# MERN Attendance Management System (AMS) — College Mini Project

A complete, robust, full-stack **Attendance Management System** built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Designed for colleges and academic institutions to streamline attendance tracking, student record management, faculty lecture logs, and automated attendance analytics.

---

## 1. Project Description

In academic institutions, manual roll-call attendance is time-consuming, prone to human error, and lacks real-time visibility for students and administrators. The **MERN Attendance Management System** provides an automated, centralized web portal that enables:
- **Teachers/Administrators** to manage students and subjects, log daily attendance with one-click batch controls, edit historical attendance logs, and generate consolidated reports.
- **Students** to track their personal lecture attendance in real-time, inspect subject-wise breakdown percentages, view alerts when falling below the mandatory 75% university quota, and inspect their attendance history.

---

## 2. Key Features

### 👨‍🏫 Admin / Teacher Module
* **JWT Authentication & RBAC**: Secure login with role-based route guards.
* **Interactive Analytics Dashboard**:
  - Live counts of Total Students, Total Subjects, and Today's Attendance.
  - Overall college average attendance rate.
  - Recharts visual charts: Daily Attendance Trend (Area Chart), Present vs. Absent Ratio (Donut Chart), and Subject-wise Percentages (Bar Chart).
* **Student Management (CRUD)**:
  - Add, edit, view, and delete students.
  - Search by Name, Student ID, Email, or Roll Number.
  - Filter by Semester (1–8) and Division (A, B, C).
  - Validation to prevent duplicate Student IDs and emails.
  - Safe cascading deletion of student attendance records.
* **Subject Management (CRUD)**:
  - Add, edit, view, and delete curriculum courses.
  - Prevents duplicate Subject Codes (e.g., `IT301`).
* **Daily Attendance Marking**:
  - Select lecture date, semester, division, and subject.
  - Student table with toggles for **Present** / **Absent**.
  - Default status is `Present` for maximum speed.
  - Quick action buttons: **Mark All Present**, **Mark All Absent**, **Save Attendance**.
  - Database-level duplicate prevention for `Student + Subject + Date`.
* **Attendance Records Log**:
  - Search and filter historical logs by date, subject, student, status, semester, and division.
  - Inline record status editing and deletion with pagination.
* **Printable Reports**:
  - Student-wise attendance summary with percentage and eligibility status (`Eligible` ≥ 75%, `Warning` 60–75%, `Defaulter` < 60%).
  - Subject-wise average attendance rates.
  - Browser-friendly **Print Report** button formatted for physical printing or PDF export.

### 🎓 Student Portal
* **Dedicated Student Authentication**: Login via Student Email or Student ID (e.g., `STU1001`).
* **Personal Attendance Dashboard**:
  - Overall attendance percentage with color-coded progress bars.
  - High-priority alert banner when attendance drops below the 75% threshold.
  - Subject-wise attendance table with total classes held, attended, and missed.
  - Recharts performance charts and distribution ratios.
* **Attendance History**:
  - Comprehensive lecture history log with filter by subject and month.
* **Student Profile View**:
  - View academic details, enrolled semester/division, and institutional contact details.

---

## 3. Technology Stack

### Frontend
- **React.js (v18)** with **Vite** build tooling
- **React Router DOM (v6)** for client-side routing & protected routes
- **Tailwind CSS (v3)** for modern UI design and layout
- **Recharts (v2)** for data visualization (Area, Donut, Bar charts)
- **React Icons & Lucide React** for clean vector iconography
- **Axios** with request/response interceptors for token management

### Backend
- **Node.js (v24)** runtime
- **Express.js (v4)** REST API framework
- **MongoDB** & **Mongoose (v8)** Object Data Modeling (ODM)
- **JSON Web Token (jsonwebtoken)** for stateless authentication
- **bcryptjs** for 10-round salted password encryption
- **cors** & **dotenv** for cross-origin configuration and environment management

---

## 4. System Architecture

```text
+--------------------------------------------------------------+
|                        Client Layer                          |
|             React 18 + Vite + Tailwind CSS + Recharts        |
+--------------------------------------------------------------+
                                |
                   HTTP / REST with JWT Bearer
                                |
+--------------------------------------------------------------+
|                        Server Layer                          |
|                  Node.js + Express.js API                    |
|                                                              |
|  [Auth Middleware] -> [Role Middleware] -> [Controllers]    |
+--------------------------------------------------------------+
                                |
                       Mongoose Models & ODM
                                |
+--------------------------------------------------------------+
|                       Database Layer                         |
|                 MongoDB (Local or Atlas)                     |
|           Users | Students | Subjects | Attendances          |
+--------------------------------------------------------------+
```

---

## 5. Folder Structure

```text
attendance-management-system/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AttendanceRecordsPage.jsx
│   │   │   │   ├── MarkAttendancePage.jsx
│   │   │   │   ├── ReportsPage.jsx
│   │   │   │   ├── StudentsPage.jsx
│   │   │   │   └── SubjectsPage.jsx
│   │   │   └── student/
│   │   │       ├── StudentAttendanceHistory.jsx
│   │   │       ├── StudentDashboard.jsx
│   │   │       └── StudentProfile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── studentController.js
│   │   └── subjectController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── Student.js
│   │   ├── Subject.js
│   │   └── User.js
│   ├── routes/
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── studentRoutes.js
│   │   └── subjectRoutes.js
│   ├── services/
│   │   └── attendanceService.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seedData.js
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── test_api.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 6. Database Models & Schema Design

### 1. User (`server/models/User.js`)
* `name`: String, required
* `email`: String, required, unique
* `password`: String, hashed via bcrypt, hidden by default
* `role`: Enum `['admin', 'teacher']`, default: `'teacher'`
* `department`: String
* `phone`: String

### 2. Student (`server/models/Student.js`)
* `studentId`: String, uppercase, unique (e.g. `STU1001`)
* `name`: String, required
* `email`: String, lowercase, unique
* `phone`: String
* `course`: String (e.g. `B.Tech Information Technology`)
* `semester`: Number (1–8)
* `division`: String (`A`, `B`, `C`)
* `rollNumber`: Number
* `password`: String, hashed via bcrypt, default: `'Student@123'`
* `role`: String, default: `'student'`
* *Compound Index*: `{ semester: 1, division: 1, rollNumber: 1 }`

### 3. Subject (`server/models/Subject.js`)
* `subjectCode`: String, unique (e.g. `IT301`)
* `subjectName`: String, required (e.g. `Database Management System`)
* `semester`: Number, required
* `department`: String
* `teacher`: ObjectId referencing `User`

### 4. Attendance (`server/models/Attendance.js`)
* `student`: ObjectId referencing `Student`, required
* `subject`: ObjectId referencing `Subject`, required
* `date`: Date (normalized to UTC midnight), required
* `status`: Enum `['Present', 'Absent']`, default: `'Present'`
* `markedBy`: ObjectId referencing `User`, required
* `remarks`: String
* *Unique Compound Index*: `{ student: 1, subject: 1, date: 1 }` (Prevents duplicate attendance for the same student, subject, and date)

---

## 7. Attendance Percentage Formula

$$\text{Attendance Percentage} = \left( \frac{\text{Present Classes}}{\text{Total Classes}} \right) \times 100$$

* **Eligibility Thresholds**:
  - $\ge 75\%$: **Eligible** for University Semester Examinations (Green)
  - $60\% \le \text{Attendance} < 75\%$: **Warning / Shortage** (Amber)
  - $< 60\%$: **Critical Shortage / Defaulter** (Red)

---

## 8. REST API Endpoints

### Authentication
* `POST /api/auth/login`: Authenticate Admin, Teacher, or Student
* `POST /api/auth/register`: Create administrative faculty account
* `GET  /api/auth/me`: Get profile of authenticated user

### Students
* `GET    /api/students`: Fetch students with search & filter parameters
* `GET    /api/students/:id`: Fetch individual student profile
* `POST   /api/students`: Add new student record
* `PUT    /api/students/:id`: Modify student record
* `DELETE /api/students/:id`: Remove student and cascading attendance logs

### Subjects
* `GET    /api/subjects`: Fetch curriculum subjects
* `GET    /api/subjects/:id`: Fetch individual subject
* `POST   /api/subjects`: Add new subject
* `PUT    /api/subjects/:id`: Modify subject
* `DELETE /api/subjects/:id`: Remove subject and cascading logs

### Attendance
* `POST   /api/attendance`: Mark attendance (single or batch array for entire class)
* `GET    /api/attendance`: Query attendance logs with filters & pagination
* `GET    /api/attendance/:id`: Fetch single attendance log
* `PUT    /api/attendance/:id`: Update attendance status/remarks
* `DELETE /api/attendance/:id`: Remove individual attendance log
* `GET    /api/attendance/student/:studentId`: Query student's attendance history
* `GET    /api/attendance/student/:studentId/summary`: Calculate student statistics & subject breakdown

### Dashboard
* `GET /api/dashboard/stats`: Retrieve top-level KPI metrics
* `GET /api/dashboard/attendance`: Retrieve dataset for Recharts visualizations

---

## 9. Installation & Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)
* **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Single-Port Unified Production Mode (Recommended)
Everything runs on **ONE URL: http://localhost:5000** with Express serving the React build:

```bash
# 1. Build the React frontend
npm run build

# 2. Start the Express server on port 5000
npm start
```

Visit the application at: **[http://localhost:5000](http://localhost:5000)**

### Quick Development Mode
```bash
# Start backend and frontend concurrently
npm run dev
```

---

## 10. Environment Variables (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/attendance_db
JWT_SECRET=college_attendance_jwt_secret_key_2025_mini_project_secure
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 11. Demo Credentials (For College Viva & Demonstration)

The login page contains **1-click quick-fill demo buttons** to instantly populate credentials:

| Role | Email / Student ID | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@attendance.com` | `Admin@123` | Full access to Students, Subjects, Attendance, Reports, System Settings |
| **Teacher** | `teacher@attendance.com` | `Teacher@123` | Mark attendance, view dashboard, students, subjects, reports |
| **Student** | `aarav.patel.stu@attendance.com` (or `STU1001`) | `Student@123` | Personal dashboard, subject breakdown, attendance logs, 75% warning |

---

## 12. Verification & Testing Results

An automated end-to-end test suite (`server/test_api.js`) verifies all operations:
- ✅ **API Health Check**: 200 OK
- ✅ **Admin, Teacher, and Student Authentication**: JWT tokens generated & role permissions verified
- ✅ **Dashboard Metrics & Charts**: Computed live totals and Recharts datasets
- ✅ **Student & Subject CRUD**: Inserted, updated, and safely deleted with cascade safety
- ✅ **Daily Attendance Marking**: Batch and single attendance marking with duplicate constraint protection
- ✅ **Attendance Percentage Formula**: Verified exact match: `(Present / Total) * 100`

---

## 13. Future Enhancements

* **SMS/Email Alerts**: Automated notification sent to parents when attendance falls below 75%.
* **Timetable Schedule**: Automatic linking of daily attendance marking to weekly lecture schedules.
* **Export to Excel (.xlsx)**: Direct spreadsheet download of semester reports.
* **Biometric / RFID Integration**: Hardware reader support for automated classroom gate check-ins.
