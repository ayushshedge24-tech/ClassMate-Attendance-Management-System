# Software Requirements Specification (SRS)
## Attendance Management System (AMS) — MERN Platform

**Document Version:** 2.2.0  
**Date:** October 2026  
**Author:** Ayush Shedge  
**Degree:** B.Sc. Information Technology  
**Institution:** Vidyalankar School of Information Technology, Mumbai  
**GitHub Repository:** [https://github.com/ayushshedge24-tech/attendance-management-system-mern](https://github.com/ayushshedge24-tech/attendance-management-system-mern)  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document details the complete functional and non-functional requirements for the **Attendance Management System (AMS) – MERN**. It defines the four role-segregated portals (Main Admin, Department Admin / HOD, Faculty Teacher, and Student), college program management (8 default programs with Divisions A–D), dynamic teacher assignments, attendance logging, attendance edit audit trails, defaulter calculations (<75%), and institutional reporting.

### 1.2 Document Conventions
- **Requirement Identifiers:**
  - `FR-ADM-xx`: Functional Requirement — Main Administrator Portal
  - `FR-HOD-xx`: Functional Requirement — Department Admin / HOD Portal
  - `FR-TCH-xx`: Functional Requirement — Faculty Teacher Portal
  - `FR-STU-xx`: Functional Requirement — Student Portal
  - `FR-SYS-xx`: Functional Requirement — System & Security Infrastructure
  - `NFR-xx`: Non-Functional Requirement
- **Priority Ratings:** High (Mandatory for core operation), Medium (Essential for academic workflow), Low (Enhancement).

### 1.3 Intended Audience
- **Academic Evaluators and Examiners:** For project evaluation, viva voce, and grading.
- **System Developers & Maintainers:** For architectural comprehension and future enhancement.
- **Institutional Administrators & Faculty:** As an operational specification guide.

### 1.4 Project Scope
The Attendance Management System replaces manual paper-based attendance registers across college departments with a centralized, responsive web platform. The platform supports:
1. Multi-role access control for Main Admin, Department HOD, Teacher, and Student.
2. 8 Default College Degree Programs (B.Sc. IT, B.Sc. CS, B.Sc. DS, B.Tech, M.Sc. IT, M.Sc. CS, M.Sc. DS, M.Tech) across Divisions A, B, C, and D.
3. Faculty-to-subject-division teaching allocations.
4. One-click batch attendance marking and individual attendance corrections with full audit trail logging.
5. Automated mathematical calculation of attendance percentages and recovery classes for defaulters (<75%).
6. Institutional and departmental reports with CSV export and print layouts.

### 1.5 References
- University Attendance Mandate: Minimum 75% attendance requirement for semester examination eligibility.
- Teach Us College Intelligence Reference: Faculty workflows and academic summaries.
- IEEE Standard 830-1998: Recommended Practice for Software Requirements Specifications.

---

## 2. Overall Description

### 2.1 Product Perspective
AMS is a self-contained, single-port deployable web application engineered with the MERN stack:
- **Presentation Tier:** React 18, Vite, Tailwind CSS, Recharts, React Router DOM v6.
- **Application Tier:** Node.js v24, Express.js v4 RESTful API with JWT authentication and role-based middleware.
- **Data Tier:** MongoDB Community Server v8 with Mongoose ODM v8.

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|                 React 18 SPA + Vite + Tailwind CSS + Recharts                   |
+---------------------------------------------------------------------------------+
                                         | REST / HTTPS (Bearer JWT)
+---------------------------------------------------------------------------------+
|                              APPLICATION LAYER                                  |
|            Node.js + Express.js API (Auth, RBAC, Services, Controllers)        |
+---------------------------------------------------------------------------------+
                                         | Mongoose ODM v8
+---------------------------------------------------------------------------------+
|                                DATABASE LAYER                                   |
|                        MongoDB Community Server v8.0                            |
+---------------------------------------------------------------------------------+
```

### 2.2 User Classes and Characteristics

| User Role | Description | Technical Competence |
| :--- | :--- | :--- |
| **Main Administrator** | College registrar or principal managing college-wide programs, departments, faculty allocations, student rosters, and institutional reports. | Intermediate |
| **Department Admin / HOD** | Head of Department managing only their assigned department (e.g. Information Technology or Computer Science), tracking department faculty, students, and defaulters. | Intermediate |
| **Faculty Teacher** | Subject professors conducting lectures, marking classroom attendance, updating attendance with reason justifications, and monitoring class defaulters. | Basic to Intermediate |
| **Student** | Enrolled undergraduate or postgraduate student checking personal attendance percentages, lecture dates, subject breakdowns, and shortage warnings. | Basic |

### 2.3 Operating Environment
- **Server OS:** Cross-platform (Windows 10/11, Ubuntu 22.04 LTS, macOS).
- **Runtime Environment:** Node.js v18.0.0 or higher.
- **Database Server:** MongoDB Community Server v6.0 or higher.
- **Client Browsers:** Modern evergreen web browsers (Google Chrome 110+, Mozilla Firefox 110+, Microsoft Edge 110+, Safari 16+).
- **Responsive Layout:** Mobile (360px+), Tablet (768px+), and Desktop (1024px+).

### 2.4 Design and Implementation Constraints
- Must preserve existing MongoDB records (`1,013` attendances, `20` students, `5` subjects, `4` users).
- Single port deployment capability (serving client `dist` static files from Express at port 5000).
- Pure JavaScript / Node.js implementation; no Java or .NET modifications.
- Passwords must be hashed using bcrypt with salt factor 10.
- Compound unique indexes to prevent duplicate attendance logs for same student, subject, date, and session.

---

## 3. System Features & Functional Requirements

### 3.1 Main Administrator Portal

#### `FR-ADM-01`: Institutional KPI Dashboard
- **Priority:** High
- **Description:** System displays total students, faculty count, curriculum subjects, active programs, departments, today's attendance sessions, and college-wide average attendance.
- **Input:** None (retrieved dynamically from database).
- **Output:** Metric cards, Recharts department distribution charts, and recent attendance feed.

#### `FR-ADM-02`: College Programs Management
- **Priority:** High
- **Description:** Admin can manage college degree programs, including the 8 default programs (B.Sc. IT, B.Sc. CS, B.Sc. DS, B.Tech, M.Sc. IT, M.Sc. CS, M.Sc. DS, M.Tech).
- **Input:** Program Name, Program Code, Department, Total Semesters (1–10), Supported Divisions (A, B, C, D), Academic Years, Status (Active/Inactive), Description.
- **Output:** Created/updated program card/row and CSV export.

#### `FR-ADM-03`: Academic Departments Management
- **Priority:** High
- **Description:** Admin can view and create academic departments with assigned Head of Department (HOD).
- **Input:** Department Name, Department Code, Description, HOD selector.
- **Output:** Department roster showing programs count, subjects count, and students count.

#### `FR-ADM-04`: Teacher Assignment Management
- **Priority:** High
- **Description:** Admin can assign faculty members to subjects, divisions (A–D), semesters, and academic years.
- **Input:** Teacher ID, Subject ID, Program Name, Semester, Division (A–D), Academic Year.
- **Validation:** Enforce compound unique constraint `{ teacher, subject, division, academicYear }`.
- **Output:** Assignment roster, assignment deletion, and CSV export.

#### `FR-ADM-05`: Student Lifecycle Management (CRUD)
- **Priority:** High
- **Description:** Admin can add, view, search, edit, and delete student records with semester, division, and course filters.
- **Input:** Student ID, Full Name, Email, Phone, Course/Program, Department, Semester, Division, Roll Number, Academic Year.
- **Output:** Filtered student table, pagination, edit modal, delete confirmation, and CSV export.

#### `FR-ADM-06`: Subject Curriculum Management (CRUD)
- **Priority:** High
- **Description:** Admin can create, modify, and assign curriculum courses to professors.
- **Input:** Subject Code, Subject Name, Department, Semester, Assigned Teacher ID.
- **Output:** Course catalog table, edit modal, delete action, and CSV export.

#### `FR-ADM-07`: Attendance Records & Audit Inspection
- **Priority:** High
- **Description:** Admin can browse all attendance logs across the institution, filter by date, subject, status, semester, and division, and view full edit audit trails.
- **Output:** Records table, `Edited (X)` indicator pill, and Audit History modal showing revision author, timestamp, previous vs new status, and justification reason.

#### `FR-ADM-08`: College-Wide Attendance Reports
- **Priority:** High
- **Description:** Admin can generate student-wise and subject-wise attendance reports with print-friendly layout and CSV export.
- **Output:** Printable summary view and downloadable CSV file with UTF-8 BOM encoding.

---

### 3.2 Department Admin / HOD Portal

#### `FR-HOD-01`: Department Scoped Dashboard
- **Priority:** High
- **Description:** HOD dashboard automatically scopes all metrics and data strictly to the HOD's assigned academic department.
- **Output:** Department student count, faculty count, department subjects, active defaulters count, today's attendance summary, and compliance distribution chart.

#### `FR-HOD-02`: Department Student Roster
- **Priority:** High
- **Description:** HOD can view and manage students belonging to their department's programs.
- **Input:** Filter by semester (1–8), division (A–D), search query.
- **Output:** Scoped student table, add student modal, edit modal, and CSV export.

#### `FR-HOD-03`: Department Faculty Monitoring
- **Priority:** Medium
- **Description:** HOD can inspect all faculty members teaching within their department and view their assigned courses.
- **Output:** Faculty roster with email, phone, and badges of assigned subjects.

#### `FR-HOD-04`: Department Curriculum Courses
- **Priority:** Medium
- **Description:** HOD can view all subjects offered by the department and appointed course coordinators.
- **Output:** Department course catalog with semester and assigned teacher information.

#### `FR-HOD-05`: Defaulter Tracking (< 75% Threshold)
- **Priority:** High
- **Description:** HOD can monitor all students whose overall attendance in department courses is below 75%.
- **Calculation Formula:**
  $$\text{Needed Consecutive Classes} = \max(0, \lceil 3 \times \text{Total} - 4 \times \text{Present} \rceil)$$
- **Severity Tiers:** Critical ($< 60\%$), Warning ($60\% - 74.9\%$).
- **Actions:** Severity filter, division filter, CSV export, Print report, direct email alert (`mailto:`), and call shortcut (`tel:`).

#### `FR-HOD-06`: Department Academic Reports
- **Priority:** High
- **Description:** Tabbed reporting module supporting:
  1. Student-Wise Report (Total, Present, Absent, Percentage, Eligibility Status)
  2. Subject-Wise Report (Conducted records, Present, Absent, Average Percentage)
  3. Daily Session Report (Exact student attendance list on a selected date)
  4. Monthly Summary Report (Subject breakdown for a selected year-month)
- **Output:** Interactive Recharts charts, printable styling, and CSV download.

---

### 3.3 Faculty Teacher Portal

#### `FR-TCH-01`: Teacher Faculty Dashboard
- **Priority:** High
- **Description:** Live dashboard showing assigned courses count, assigned students, today's conducted sessions, and pending sessions.
- **Output:** Stat cards, today's session summary, and assigned subject quick-launch cards.

#### `FR-TCH-02`: Assigned Subjects View
- **Priority:** High
- **Description:** Teachers can only view subjects allocated to them. Unassigned subjects are inaccessible.
- **Output:** Card grid displaying Subject Code, Subject Name, Semester, Enrolled Students count, Classes Conducted, and Average Attendance Rate.

#### `FR-TCH-03`: Batch Attendance Marking
- **Priority:** High
- **Description:** Teachers select subject, date, session (Lecture 1–4, Lab, Tutorial), and division to load student roster.
- **Features:**
  - One-click *Mark All Present*
  - One-click *Mark All Absent*
  - Individual toggle Present/Absent
  - Optional remarks per student
  - Bulk upsert into MongoDB preventing duplicates
- **Output:** Success toast and real-time present/absent counters.

#### `FR-TCH-04`: Attendance Corrections with Audit History
- **Priority:** High
- **Description:** Teachers can retrieve past attendance sessions and update statuses and remarks.
- **Audit Requirement:** Teachers can enter a *Revision Justification Reason* (e.g. "Medical certificate submitted"). Every change pushes an audit record to `Attendance.editHistory`.
- **Output:** Revision timestamp, author tracking, and updated statistics.

#### `FR-TCH-05`: Daily Absentee Tracking
- **Priority:** Medium
- **Description:** Displays students marked absent on the current calendar date across assigned subjects.
- **Output:** Student name, ID, roll number, subject, session, and guardian contact shortcut.

#### `FR-TCH-06`: Chronic Defaulters View (< 75%)
- **Priority:** High
- **Description:** Faculty can view students with attendance below 75% in their subjects, showing shortfall gap and needed consecutive classes.
- **Output:** Defaulter table with CSV export.

#### `FR-TCH-07`: Teacher Attendance History Ledger
- **Priority:** Medium
- **Description:** Historical session log of every attendance session conducted by the teacher.
- **Output:** Date, session, subject, total students marked, present count, absent count, and edit action shortcut.

#### `FR-TCH-08`: Teacher Reports
- **Priority:** High
- **Description:** Generates student-wise and subject-wise reports for the teacher's assigned classes with CSV download.

---

### 3.4 Student Portal

#### `FR-STU-01`: Personal Dashboard & Metrics
- **Priority:** High
- **Description:** Logged-in student sees exclusively their own academic attendance. Cross-student data viewing is prohibited.
- **Calculations:** Overall Percentage, Conducted Classes, Attended Classes, Missed Classes, Enrolled Subjects, Subjects Below 75%.
- **Output:** Dynamic KPI cards, progress bars, and recent attendance feed.

#### `FR-STU-02`: Shortage Alert Banner (< 75%)
- **Priority:** High
- **Description:** If overall attendance falls below 75%, a prominent amber/rose warning banner is rendered calculating the exact deficit.
- **Output:** Visual banner highlighting examination eligibility risk.

#### `FR-STU-03`: Day-Wise Attendance Ledger
- **Priority:** High
- **Description:** Complete chronological audit of every instructional class attended or missed.
- **Columns:** Date, Day of Week, Subject Code, Subject Name, Lecture/Session, Attendance Status.
- **Visual Design:** Green badge for Present, Red badge for Absent.
- **Filters:** Filter by Subject, Filter by Month, Filter by Date Range.
- **Output:** Interactive ledger with CSV download.

#### `FR-STU-04`: Subject-Wise Attendance Breakdown
- **Priority:** High
- **Description:** Table of all enrolled courses showing:
  - Subject Code & Subject Name
  - Total Classes Conducted
  - Classes Attended (Present)
  - Classes Missed (Absent)
  - Subject Attendance Percentage
  - Status Badge (`Eligible` ≥ 75%, `Warning` 60–74%, `Defaulter` < 60%)
- **Output:** Subject summary cards and table.

#### `FR-STU-05`: Monthly Attendance Summary
- **Priority:** Medium
- **Description:** Month-by-month attendance breakdown showing total classes, attended count, and monthly attendance rate.
- **Output:** Monthly cards and Recharts trend visualization.

#### `FR-STU-06`: Student Profile View
- **Priority:** Low
- **Description:** Displays official student academic profile including Student ID, Course, Department, Semester, Division, Roll Number, and Email.

---

### 3.5 System & Security Services

#### `FR-SYS-01`: Authentication & JWT Token Management
- **Description:** Dual identifier login supporting `email` (Staff/HOD/Admin) and `studentId` or `email` (Students). Issues signed JSON Web Token with 7-day expiration.
- **Security:** Passwords hashed with bcrypt; JWT stored in browser `localStorage`.

#### `FR-SYS-02`: Role-Based Route Protection (RBAC)
- **Description:** Client-side `<ProtectedRoute allowedRoles={[...]} />` and server-side `authorize('admin', 'hod', 'teacher')` middleware block unauthorized route traversal.

#### `FR-SYS-03`: Cross-Student Security Boundary
- **Description:** A student querying `/api/attendance/student/:id` for an ID other than their own JWT `req.user._id` is rejected with `HTTP 403 Forbidden`.

#### `FR-SYS-04`: Teacher Subject Isolation Boundary
- **Description:** A teacher attempting to mark attendance or view logs for a subject not assigned to them is rejected with `HTTP 403 Forbidden`.

#### `FR-SYS-05`: Duplicate Attendance Prevention
- **Description:** Compound unique database index `{ student: 1, subject: 1, date: 1, session: 1 }` prevents duplicate attendance records for the same student, subject, date, and lecture.

#### `FR-SYS-06`: Safe Database Seeding Guard
- **Description:** Bootstrapping utilities run idempotently and bypass seeding if collections already contain records, guaranteeing 0% data loss.

---

## 4. External Interface Requirements

### 4.1 User Interface Requirements
- Single-Page Application (SPA) architecture with responsive navigation bar and role-adaptive sidebar.
- Consistent color design tokens:
  - Primary / Action: Indigo (`#4F46E5`)
  - Success / Present: Emerald (`#10B981`)
  - Warning / Alert: Amber (`#F59E0B`)
  - Danger / Absent: Rose / Red (`#EF4444`)
  - Background / Surface: Slate (`#0F172A`, `#F8FAFC`, `#FFFFFF`)
- Modal dialogs with accessible backdrop dismissal and escape key listeners.
- 1-Click Quick-Fill Demo buttons on `/login` for seamless academic viva evaluation.

### 4.2 Software Interfaces
- **Database Engine:** MongoDB Community Server connected via Mongoose connection string `mongodb://127.0.0.1:27017/attendance_db`.
- **API Communication:** JSON over HTTP/REST using Axios client with authorization interceptors.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance Requirements
- `NFR-PERF-01`: API responses for dashboard metrics and attendance queries shall execute in under 150ms on a local MongoDB instance.
- `NFR-PERF-02`: Batch attendance marking for a classroom of 60 students shall execute in a single bulk operation (`Attendance.bulkWrite`) in under 250ms.
- `NFR-PERF-03`: Client-side production bundle shall be optimized with Vite tree-shaking and minification under 250 KB gzipped.

### 5.2 Security Requirements
- `NFR-SEC-01`: Passwords must be hashed using bcrypt with salt work factor of 10 rounds before storage in MongoDB.
- `NFR-SEC-02`: Password fields must be omitted by default (`select: false`) in Mongoose queries.
- `NFR-SEC-03`: Sensitive environmental variables (JWT secret, DB URI) must reside in `server/.env` and never be committed to Git.
- `NFR-SEC-04`: API inputs must be validated and sanitized against NoSQL injection.

### 5.3 Reliability & Availability
- `NFR-REL-01`: Zero-safe division handling in all mathematical calculations: if total classes is 0, percentage returns `0%` without runtime crashes.
- `NFR-REL-02`: Centralized Express error-handling middleware catching all unhandled promises and returning standardized JSON error payloads.

### 5.4 Maintainability & Extensibility
- `NFR-MNT-01`: Clear separation of concerns following Controller-Route-Model-Service architectural pattern.
- `NFR-MNT-02`: Comprehensive automated verification suite (`server/test_api.js`) verifying all 24 E2E test cases.

---

## 6. Academic Compliance & Institutional Thresholds

- **Standard Threshold:** $75.0\%$ attendance required for university examination eligibility.
- **Warning Band:** $60.0\% \le \text{Attendance} < 75.0\%$ triggers institutional warning notifications.
- **Critical Shortage:** $< 60.0\%$ triggers exam debarment risk and mandatory guardian contact.
- **Formula Standard:** $\text{Attendance \%} = \left(\frac{\text{Attended Classes}}{\text{Total Conducted Classes}}\right) \times 100$.
