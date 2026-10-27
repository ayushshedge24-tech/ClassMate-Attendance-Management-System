# Software Design Document (SDD)
## Attendance Management System (AMS) — MERN Platform

**Document Version:** 2.2.0  
**Date:** October 2026  
**Author:** Ayush Shedge  
**Degree:** B.Sc. Information Technology  
**Institution:** Vidyalankar School of Information Technology, Mumbai  
**GitHub Repository:** [https://github.com/ayushshedge24-tech/attendance-management-system-mern](https://github.com/ayushshedge24-tech/attendance-management-system-mern)  

---

## 1. System Overview & Architectural Approach

### 1.1 Architectural Pattern
The **Attendance Management System (AMS)** is engineered as a multi-tier, decoupled client-server web platform following the **Model-View-Controller (MVC) / Controller-Service-Repository** pattern:

```
+---------------------------------------------------------------------------------------------------+
|                                       PRESENTATION TIER                                           |
|       React 18 Single-Page Application (SPA) + Vite 6 + Tailwind CSS 3 + Recharts + React Router   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                   JSON over HTTP/REST (Bearer JWT)
                                                  |
+---------------------------------------------------------------------------------------------------+
|                                       APPLICATION TIER                                            |
|                                    Node.js + Express.js                                           |
|   +--------------------------+  +--------------------------+  +-------------------------------+   |
|   | Middleware (Auth & RBAC) |  |   Express Router Layer   |  | Controller & Service Business |   |
|   +--------------------------+  +--------------------------+  +-------------------------------+   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                          Mongoose ODM (v8)
                                                  |
+---------------------------------------------------------------------------------------------------+
|                                      DATA PERSISTENCE TIER                                        |
|                                  MongoDB Community Server (v8.0)                                  |
|     Collections: users, departments, programs, teacherassignments, students, subjects, attendances|
+---------------------------------------------------------------------------------------------------+
```

### 1.2 Unified Single-Port Deployment
To simplify academic deployment and project evaluation, AMS is configured for **unified single-port execution**:
- Express serves both the REST API under `/api/*` and compiled React static assets (`client/dist/*`) on port `5000`.
- Any unhandled non-API client routes fall through to `index.html` via `res.sendFile(path.join(__dirname, '../client/dist/index.html'))`, enabling HTML5 History API routing without Nginx/Apache configuration.
- Concurrent development mode (`npm run dev:watch`) is also supported using Vite dev server (port 5173) with Axios proxying.

---

## 2. Component & Layer Architecture

### 2.1 Presentation Layer (Frontend)
- **Framework:** React.js v18.3.
- **Routing Engine:** React Router DOM v6 with nested route configuration.
- **State Management:**
  - `AuthContext`: Centralized JWT authentication state, user metadata, role flags (`isAdmin`, `isHod`, `isTeacher`, `isStudent`, `isStaff`), and login/logout routines.
  - `ToastContext`: Global notification toast system for non-intrusive operational feedback.
- **Data Visualization:** Recharts v2.15 (BarChart, PieChart, ResponsiveContainer, Tooltips).
- **Styling:** Tailwind CSS v3.4 utility classes with custom color design tokens.

### 2.2 Security & Middleware Layer
- **`authMiddleware.js` (`protect`):** Extracts Bearer token from `Authorization` header, verifies signature using `JWT_SECRET`, checks token expiration, and attaches the authenticated user document and role string (`req.userRole`) to `req.user`.
- **`roleMiddleware.js` (`authorize(...roles)`):** Intercepts requests and enforces role-based access control (RBAC). Rejects unauthorized roles with HTTP `403 Forbidden`.
- **`errorMiddleware.js`:** Centralized error handler returning standardized JSON: `{ success: false, message, stack }` (stack omitted in production).

### 2.3 Controller & Service Layer
- **Controllers:** Encapsulate HTTP request processing, input validation, service invocation, and JSON serialization.
- **Services:** Pure business logic decoupled from HTTP request/response primitives:
  - `attendanceService.js`: UTC date normalization, dynamic attendance summary calculation, and monthly breakdown aggregation.

### 2.4 Data Persistence Layer
- **Mongoose ODM:** Defines schemas, strict data types, field constraints, default values, pre-save hooks (e.g., bcrypt password hashing), and compound unique indexes.

---

## 3. Module Decomposition

### 3.1 Authentication & RBAC Module
- **Files:** [`server/controllers/authController.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/controllers/authController.js), [`server/middleware/authMiddleware.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/middleware/authMiddleware.js), [`client/src/context/AuthContext.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/context/AuthContext.jsx).
- **Responsibilities:**
  - Dual identifier login: allows email for staff/admin and student ID/email for students.
  - Password verification via `bcrypt.compare`.
  - JWT token generation with user ID and role payload.
  - Role-based route redirection (`/admin/dashboard`, `/hod/dashboard`, `/teacher/dashboard`, `/student/dashboard`).

### 3.2 Academic Programs & Department Governance Module
- **Files:** [`server/models/Program.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/models/Program.js), [`server/models/Department.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/models/Department.js), [`server/controllers/programController.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/controllers/programController.js), [`client/src/pages/admin/ProgramsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/admin/ProgramsPage.jsx).
- **Responsibilities:**
  - Default initialization and CRUD of 8 college programs (B.Sc. IT, B.Sc. CS, B.Sc. DS, B.Tech, M.Sc. IT, M.Sc. CS, M.Sc. DS, M.Tech).
  - Division allocation support across Divisions A, B, C, and D.
  - Department entity management with HOD user references and student/subject counter rollups.

### 3.3 Faculty Assignment & Allocation Module
- **Files:** [`server/models/TeacherAssignment.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/models/TeacherAssignment.js), [`server/controllers/assignmentController.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/controllers/assignmentController.js), [`client/src/pages/admin/TeacherAssignmentsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/admin/TeacherAssignmentsPage.jsx).
- **Responsibilities:**
  - Allocates faculty members to specific curriculum subjects, programs, semesters, divisions, and academic years.
  - Enforces compound uniqueness on `{ teacher, subject, division, academicYear }`.
  - Auto-updates primary subject coordinator reference on assignment creation.

### 3.4 Student Lifecycle & Enrollment Module
- **Files:** [`server/models/Student.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/models/Student.js), [`server/controllers/studentController.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/controllers/studentController.js), [`client/src/pages/admin/StudentsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/admin/StudentsPage.jsx), [`client/src/pages/hod/HodStudentsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/hod/HodStudentsPage.jsx).
- **Responsibilities:**
  - Student registration with unique `studentId` and auto-generated bcrypt password hash (`Student@123`).
  - Scoped queries filtering students by semester, division, department, and course.
  - Cascading deletion of student attendance records upon student removal.

### 3.5 Attendance Logging & Batch Processing Module
- **Files:** [`server/models/Attendance.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/models/Attendance.js), [`server/controllers/attendanceController.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/controllers/attendanceController.js), [`client/src/pages/teacher/TeacherMarkAttendancePage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/teacher/TeacherMarkAttendancePage.jsx).
- **Responsibilities:**
  - High-performance batch submission using `Attendance.bulkWrite([ { updateOne: { filter, update, upsert: true } } ])`.
  - UTC date normalization to midnight (`00:00:00.000Z`) to eliminate timezone discrepancy bugs.
  - Authorization check ensuring faculty can only mark attendance for their allocated courses.

### 3.6 Audit Trail & Revision History Module
- **Files:** [`server/models/Attendance.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/models/Attendance.js), [`server/controllers/attendanceController.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/controllers/attendanceController.js), [`client/src/pages/teacher/TeacherEditAttendancePage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/teacher/TeacherEditAttendancePage.jsx), [`client/src/pages/admin/AttendanceRecordsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/admin/AttendanceRecordsPage.jsx).
- **Responsibilities:**
  - Embedded `editHistory` array on attendance records.
  - Captures `editedBy`, `editedAt`, `previousStatus`, `newStatus`, `previousRemarks`, `newRemarks`, and `reason`.
  - Renders audit indicators (`Edited (X)`) and an interactive timeline modal for auditing changes.

### 3.7 Defaulter Analysis & Shortage Recovery Module
- **Files:** [`server/controllers/hodController.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/controllers/hodController.js), [`client/src/pages/hod/HodDefaultersPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/hod/HodDefaultersPage.jsx), [`client/src/pages/teacher/TeacherAbsentStudentsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/teacher/TeacherAbsentStudentsPage.jsx).
- **Responsibilities:**
  - Dynamic detection of students below the mandatory 75% threshold.
  - Mathematical calculation of consecutive classes needed to regularize attendance.
  - Severity classification: Critical ($< 60\%$) vs Warning ($60\% - 74.9\%$).
  - Contact action triggers (`mailto:` and `tel:`).

### 3.8 Reporting & Data Export Engine
- **Files:** [`client/src/utils/exportCsv.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/utils/exportCsv.js), [`client/src/pages/admin/ReportsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/admin/ReportsPage.jsx), [`client/src/pages/hod/HodReportsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/hod/HodReportsPage.jsx), [`client/src/pages/teacher/TeacherReportsPage.jsx`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/client/src/pages/teacher/TeacherReportsPage.jsx).
- **Responsibilities:**
  - Client-side CSV generation with UTF-8 BOM encoding (`\uFEFF`) ensuring seamless Microsoft Excel compatibility.
  - CSS `@media print` stylesheets formatting clean, paper-ready institutional reports.

---

## 4. Detailed Data Flow Diagrams

### 4.1 Batch Attendance Submission Flow

```
[Teacher Browser]               [Express Server]               [MongoDB Community]
       |                               |                               |
       |-- POST /api/attendance ------>|                               |
       |   { subject, date, session,   |                               |
       |     records: [...] }          |                               |
       |                               |-- Verify JWT & Role --------->|
       |                               |-- Check Faculty Assignment -->|
       |                               |                               |
       |                               |-- Attendance.bulkWrite() ---->|
       |                               |   (upsert filter: student,    |
       |                               |    subject, date, session)    |
       |                               |<-- Upserted / Modified -------|
       |                               |                               |
       |<-- HTTP 200 JSON Response ----|                               |
       |    { success: true, count }   |                               |
```

### 4.2 Attendance Correction with Audit Trail Flow

```
[Faculty / Admin]               [Express Server]               [MongoDB Community]
       |                               |                               |
       |-- PUT /api/attendance/:id --->|                               |
       |   { status, remarks, reason } |                               |
       |                               |-- Find Attendance Record ---->|
       |                               |<-- Record Found --------------|
       |                               |                               |
       |                               |-- Compare previous vs new ----|
       |                               |-- Push into editHistory: -----|
       |                               |   { editedBy, editedAt,       |
       |                               |     previousStatus, newStatus,|
       |                               |     reason }                  |
       |                               |-- record.save() ------------->|
       |                               |<-- Record Saved --------------|
       |                               |                               |
       |<-- HTTP 200 JSON Response ----|                               |
```

### 4.3 Defaulter Recovery Calculation Algorithm

```
Given:
  Total Conducted Classes = T
  Present Classes Attended = P
  Target Threshold = 75% = 0.75

Let x = consecutive upcoming classes student must attend without missing.

Condition:
  (P + x) / (T + x) >= 0.75
  P + x >= 0.75 * (T + x)
  P + x >= 0.75 * T + 0.75 * x
  0.25 * x >= 0.75 * T - P
  x >= (0.75 * T - P) / 0.25
  x >= 3 * T - 4 * P

Algorithm Implementation:
  if T == 0:
    Percentage = 0, NeededClasses = 0
  else:
    Percentage = (P / T) * 100
    if Percentage < 75:
      NeededClasses = Math.max(0, Math.ceil(3 * T - 4 * P))
      Severity = Percentage < 60 ? 'Critical' : 'Warning'
    else:
      NeededClasses = 0
      Severity = 'Eligible'
```

---

## 5. Architectural Decisions & Trade-Offs

### 5.1 Embedded `editHistory` vs. Separate `AuditLog` Collection
- **Decision:** Embed `editHistory` as a subdocument array directly inside `Attendance.js`.
- **Rationale:**
  1. Attendance records rarely undergo more than 1–3 revisions, well within MongoDB's 16MB document limit.
  2. Eliminates costly secondary `$lookup` joins when rendering attendance tables with audit indicators.
  3. Guarantees atomicity: the status update and audit entry commit simultaneously in a single document write without multi-document transactions.

### 5.2 Date Normalization at Midnight UTC
- **Decision:** All incoming date strings (`YYYY-MM-DD`) are normalized via `normalizeDate(date)` into UTC midnight (`new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))`).
- **Rationale:** Prevents timezone offset shifts where a date submitted at `2026-10-18` in IST (+05:30) could roll back to `2026-10-17 18:30:00Z`, breaking date-wise lookups.

### 5.3 Compound Unique Constraints
- **Decision:** Enforce compound unique indexes:
  - Attendance: `{ student: 1, subject: 1, date: 1, session: 1 }`
  - Teacher Assignment: `{ teacher: 1, subject: 1, division: 1, academicYear: 1 }`
- **Rationale:** Prevents race conditions and duplicate attendance submissions when multiple clicks occur, maintaining database integrity at the storage engine level.
