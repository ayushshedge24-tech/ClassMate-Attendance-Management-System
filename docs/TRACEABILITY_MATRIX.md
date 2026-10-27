# Requirements Traceability Matrix (RTM)
## Attendance Management System (AMS) — MERN Platform

**Document Version:** 2.2.0  
**Date:** October 2026  
**Author:** Ayush Shedge  
**Degree:** B.Sc. Information Technology  
**Institution:** Vidyalankar School of Information Technology, Mumbai  
**Test Harness:** [`server/test_api.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/test_api.js) (24/24 Tests Passed)  

---

## 1. Traceability Matrix Overview

The Requirements Traceability Matrix (RTM) maps each functional requirement (`FR-*`) and non-functional requirement (`NFR-*`) defined in the **Software Requirements Specification (SRS)** to its corresponding:
1. **Frontend UI Component & Page**
2. **Backend Express Controller & Route**
3. **Mongoose Model & MongoDB Collection**
4. **Automated Verification Test Case (TC-01 to TC-24)**
5. **Implementation & Verification Status**

---

## 2. Complete Traceability Mapping

| Req ID | Requirement Description | Frontend Component | Backend Route & Controller | Database Model | Test ID | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`FR-ADM-01`** | Institutional KPI Dashboard & Analytics | `AdminDashboard.jsx` | `GET /api/dashboard/stats`<br>`dashboardController.js` | `User`, `Student`, `Subject`, `Attendance` | TC-16 | ✅ Completed |
| **`FR-ADM-02`** | 8 Default Programs & Custom Program CRUD | `ProgramsPage.jsx` | `GET /api/programs`<br>`POST /api/programs`<br>`programController.js` | `Program.js`<br>(`programs`) | TC-22 | ✅ Completed |
| **`FR-ADM-03`** | Academic Departments Management | `ProgramsPage.jsx` | `GET /api/programs/departments/all`<br>`programController.js` | `Department.js`<br>(`departments`) | TC-22 | ✅ Completed |
| **`FR-ADM-04`** | Teacher Subject & Division Allocations | `TeacherAssignmentsPage.jsx` | `GET /api/assignments`<br>`POST /api/assignments`<br>`assignmentController.js` | `TeacherAssignment.js`<br>(`teacherassignments`) | TC-23 | ✅ Completed |
| **`FR-ADM-05`** | Student Lifecycle Management (CRUD) | `StudentsPage.jsx` | `GET /api/students`<br>`POST /api/students`<br>`studentController.js` | `Student.js`<br>(`students`) | TC-16 | ✅ Completed |
| **`FR-ADM-06`** | Curriculum Subject Management (CRUD) | `SubjectsPage.jsx` | `GET /api/subjects`<br>`POST /api/subjects`<br>`subjectController.js` | `Subject.js`<br>(`subjects`) | TC-15 | ✅ Completed |
| **`FR-ADM-07`** | Attendance Log Inspection & Audit History | `AttendanceRecordsPage.jsx` | `GET /api/attendance`<br>`PUT /api/attendance/:id`<br>`attendanceController.js` | `Attendance.js`<br>(`attendances`) | TC-24 | ✅ Completed |
| **`FR-ADM-08`** | College Reports (Print & CSV Export) | `ReportsPage.jsx`<br>`exportCsv.js` | `GET /api/attendance`<br>`attendanceController.js` | `Attendance.js`<br>(`attendances`) | TC-16 | ✅ Completed |
| **`FR-HOD-01`** | Department-Scoped HOD Dashboard | `HodDashboard.jsx` | `GET /api/hod/dashboard-stats`<br>`hodController.js` | `Department`, `User`, `Student`, `Attendance` | TC-18 | ✅ Completed |
| **`FR-HOD-02`** | Department Student Management | `HodStudentsPage.jsx` | `GET /api/hod/students`<br>`hodController.js` | `Student.js`<br>(`students`) | TC-19 | ✅ Completed |
| **`FR-HOD-03`** | Department Faculty Monitoring | `HodTeachersPage.jsx` | `GET /api/hod/teachers`<br>`hodController.js` | `User.js`<br>(`users`) | TC-19 | ✅ Completed |
| **`FR-HOD-04`** | Department Curriculum Catalog | `HodSubjectsPage.jsx` | `GET /api/hod/subjects`<br>`hodController.js` | `Subject.js`<br>(`subjects`) | TC-19 | ✅ Completed |
| **`FR-HOD-05`** | Defaulter Monitoring (< 75%) & Recovery Gap | `HodDefaultersPage.jsx` | `GET /api/hod/defaulters`<br>`hodController.js` | `Student`, `Attendance` | TC-20 | ✅ Completed |
| **`FR-HOD-06`** | Department Reports (Student/Subject/Daily/Monthly) | `HodReportsPage.jsx` | `GET /api/hod/reports`<br>`hodController.js` | `Attendance`, `Subject` | TC-21 | ✅ Completed |
| **`FR-TCH-01`** | Faculty Dashboard Metrics & Today's Sessions | `TeacherDashboard.jsx` | `GET /api/teacher/dashboard-stats`<br>`teacherController.js` | `Subject`, `Attendance` | TC-09 | ✅ Completed |
| **`FR-TCH-02`** | Teacher Assigned Subjects View | `TeacherSubjectsPage.jsx` | `GET /api/teacher/subjects`<br>`teacherController.js` | `Subject.js`<br>(`subjects`) | TC-10 | ✅ Completed |
| **`FR-TCH-03`** | Batch Classroom Attendance Marking | `TeacherMarkAttendancePage.jsx` | `POST /api/attendance`<br>`attendanceController.js` | `Attendance.js`<br>(`attendances`) | TC-11 | ✅ Completed |
| **`FR-TCH-04`** | Attendance Corrections & Audit Trail | `TeacherEditAttendancePage.jsx` | `PUT /api/attendance/:id`<br>`attendanceController.js` | `Attendance.js`<br>(`attendances.editHistory`) | TC-12<br>TC-24 | ✅ Completed |
| **`FR-TCH-05`** | Daily Absentee Tracking | `TeacherAbsentStudentsPage.jsx`| `GET /api/teacher/absent-students`<br>`teacherController.js` | `Attendance`, `Student` | TC-13 | ✅ Completed |
| **`FR-TCH-06`** | Course Chronic Defaulters Tracking | `TeacherAbsentStudentsPage.jsx`| `GET /api/teacher/absent-students`<br>`teacherController.js` | `Attendance`, `Student` | TC-13 | ✅ Completed |
| **`FR-TCH-07`** | Teacher Attendance History Ledger | `TeacherAttendanceHistoryPage.jsx`| `GET /api/attendance`<br>`attendanceController.js` | `Attendance.js`<br>(`attendances`) | TC-12 | ✅ Completed |
| **`FR-TCH-08`** | Teacher Classroom Reports & CSV Export | `TeacherReportsPage.jsx` | `GET /api/teacher/reports`<br>`teacherController.js` | `Attendance`, `Student` | TC-14 | ✅ Completed |
| **`FR-STU-01`** | Student Personal Dashboard & Dynamic Math | `StudentDashboard.jsx` | `GET /api/attendance/student/:id/summary`<br>`attendanceController.js` | `Attendance`, `Student` | TC-05 | ✅ Completed |
| **`FR-STU-02`** | Shortage Warning Alert Banner (< 75%) | `StudentDashboard.jsx` | `GET /api/attendance/student/:id/summary`<br>`attendanceController.js` | `Attendance`, `Student` | TC-05 | ✅ Completed |
| **`FR-STU-03`** | Day-Wise Attendance Ledger & Exact Dates | `StudentAttendanceHistory.jsx`| `GET /api/attendance/student/:id`<br>`attendanceController.js` | `Attendance.js`<br>(`attendances`) | TC-06 | ✅ Completed |
| **`FR-STU-04`** | Subject-Wise Attendance Breakdown | `StudentSubjectAttendance.jsx`| `GET /api/attendance/student/:id/summary`<br>`attendanceController.js` | `Attendance`, `Subject` | TC-05 | ✅ Completed |
| **`FR-STU-05`** | Monthly Attendance Trends | `StudentMonthlySummary.jsx` | `GET /api/attendance/student/:id/monthly`<br>`attendanceController.js` | `Attendance.js`<br>(`attendances`) | TC-07 | ✅ Completed |
| **`FR-STU-06`** | Student Academic Profile | `StudentProfile.jsx` | `GET /api/auth/me`<br>`authController.js` | `Student.js`<br>(`students`) | TC-04 | ✅ Completed |
| **`FR-SYS-01`** | Dual-ID JWT Authentication | `LoginPage.jsx`<br>`AuthContext.jsx`| `POST /api/auth/login`<br>`authController.js` | `User.js`, `Student.js` | TC-02<br>TC-04 | ✅ Completed |
| **`FR-SYS-02`** | Role-Based Route Guards (RBAC) | `ProtectedRoute.jsx` | `roleMiddleware.js` | `User.role` | TC-08<br>TC-15 | ✅ Completed |
| **`FR-SYS-03`** | Cross-Student Privacy Boundary | `AuthContext.jsx` | `authMiddleware.js`<br>`attendanceController.js` | `Attendance.js` | TC-08 | ✅ Completed |
| **`FR-SYS-04`** | Course Authorization Boundary | `TeacherMarkAttendancePage.jsx`| `attendanceController.js` | `Subject.teacher` | TC-15 | ✅ Completed |
| **`FR-SYS-05`** | Duplicate Submission Prevention | `TeacherMarkAttendancePage.jsx`| `{ student, subject, date, session }` | `Attendance.js` Index | TC-11 | ✅ Completed |
| **`FR-SYS-06`** | Safe Idempotent Database Seeding | `server.js` | `bootstrapData.js`<br>`seedData.js` | All Collections | TC-01 | ✅ Completed |
| **`NFR-PERF-01`**| High-Throughput Bulk Operations | `TeacherMarkAttendancePage.jsx`| `Attendance.bulkWrite` | `Attendance.js` | TC-11 | ✅ Completed |
| **`NFR-REL-01`** | Zero-Division Mathematical Safety | `attendanceService.js` | `calculateStudentSummary` | N/A | TC-05 | ✅ Completed |
| **`NFR-SEC-01`** | 10-Round Bcrypt Salted Password Hashing | Pre-save hook | `User.js`, `Student.js` | `users`, `students` | TC-02 | ✅ Completed |

---

## 3. Compliance Summary

- **Total Functional Requirements:** 32
- **Total Non-Functional Requirements:** 3
- **Requirements Verified via Automated Tests:** 35 / 35 (100%)
- **Residual Uncovered Requirements:** 0 (0%)
