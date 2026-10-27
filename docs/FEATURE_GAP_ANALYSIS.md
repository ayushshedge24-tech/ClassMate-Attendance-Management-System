# Feature Gap Analysis & Codebase Audit Report

**Project:** Attendance Management System — MERN  
**Repository:** `https://github.com/ayushshedge24-tech/attendance-management-system-mern`  
**Date:** October 2026  
**Auditor:** Senior Full-Stack MERN Architect & QA Team  

---

## 1. Executive Summary

A comprehensive pre-production audit was conducted across the frontend, backend, database models, business logic, security controls, and documentation of the Attendance Management System. The application features a robust 4-tier role-based access control (Admin, HOD / Department Admin, Teacher, Student) built on Express, MongoDB/Mongoose, and React/Tailwind CSS.

While core functionalities (authentication, attendance marking, audit trails, defaulter calculations, multi-role dashboards) are operational, several critical and high-priority gaps were discovered during deep code inspection that must be remediated prior to production release.

---

## 2. Inventory of Current Modules & Records

| Component / Collection | Current Count / State | Status |
| :--- | :--- | :--- |
| **MongoDB Database** | `attendance_db` on `127.0.0.1:27017` | Connected & Verified |
| **Attendances** | 1,013 documents | Preserved & Verified |
| **Students** | 20 documents | Preserved & Verified |
| **Subjects** | 5 documents | Preserved & Verified |
| **Users** | 4 documents (Admin, HOD, Teacher, Student) | Preserved & Verified |
| **Departments** | 4 documents (IT, CS, Electronics, Mechanical) | Preserved & Verified |
| **Programs** | 8 documents (B.Tech, B.Sc., BCA, MCA) | Preserved & Verified |
| **Teacher Assignments** | 10 assignments | Preserved & Verified |
| **Data Backup** | `backups/pre_audit_backup/` | Verified & Git-ignored |

---

## 3. Discovered Gaps & Vulnerabilities

### Gap 1: Incomplete Division Support (Missing Division 'D')
- **Severity:** Medium / Usability
- **Locations:**
  - `client/src/pages/admin/AttendanceRecordsPage.jsx` (Line 291)
  - `client/src/pages/admin/MarkAttendancePage.jsx` (Line 285)
  - `client/src/pages/admin/StudentsPage.jsx` (Lines 208, 397, 523)
  - `client/src/pages/teacher/TeacherMarkAttendancePage.jsx` (Line 343)
  - `client/src/pages/teacher/TeacherStudentsPage.jsx` (Line 141)
- **Problem:** The college program schema explicitly supports divisions `['A', 'B', 'C', 'D']`, and `HodStudentsPage` allows all four. However, the admin and teacher views hardcoded `['A', 'B', 'C']`, preventing access to Division 'D' records.
- **Remediation:** Standardize division options across all pages to `['A', 'B', 'C', 'D']`.

### Gap 2: Hardcoded Course Field in Student Creation & Editing
- **Severity:** Medium / Data Integrity
- **Locations:** `client/src/pages/admin/StudentsPage.jsx`
- **Problem:** When creating or editing a student, the course program was a static text input defaulting to `'B.Tech Information Technology'`, ignoring the dynamic programs configured in `/api/programs`.
- **Remediation:** Fetch active programs dynamically from `/api/programs` on component mount and present them in a standard dropdown selector, retaining existing course values for existing records.

### Gap 3: Missing Student Directory Export on Admin Portal
- **Severity:** Low / Feature Completeness
- **Locations:** `client/src/pages/admin/StudentsPage.jsx`
- **Problem:** Admin attendance records can be exported, but the student directory lacked a direct CSV export button for administrative archiving.
- **Remediation:** Add an "Export Students CSV" button on `StudentsPage.jsx` utilizing `exportToCsv`.

### Gap 4: Authentication Security & Brute-Force Vulnerability
- **Severity:** High / Security
- **Locations:** `server/routes/authRoutes.js`, `server/server.js`
- **Problem:** The `/api/auth/login` endpoint lacked rate limiting. Automated credential stuffing or brute-force dictionary attacks could be executed against admin and teacher accounts without throttling.
- **Remediation:** Implement a sliding-window rate limiter middleware (`server/middleware/rateLimiter.js`) restricting failed/total login attempts per IP address (e.g., maximum 10 requests per 15-minute window for authentication endpoints) returning HTTP `429 Too Many Requests`.

### Gap 5: Missing Essential Security Headers
- **Severity:** Medium / Security
- **Locations:** `server/server.js`
- **Problem:** Express emitted default `X-Powered-By: Express` headers and lacked `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and restrictive referrer policies.
- **Remediation:** Add explicit HTTP security headers in `server/server.js` and disable `x-powered-by`.

### Gap 6: Silent In-Memory Fallback in Production
- **Severity:** High / Reliability & Data Loss Risk
- **Locations:** `server/config/db.js`
- **Problem:** If the primary MongoDB connection failed, `connectDB()` automatically fell back to `MongoMemoryServer` regardless of the environment. In a deployed production setting, this would cause catastrophic data loss on process restart without alerting the DevOps team.
- **Remediation:** Disallow fallback to `MongoMemoryServer` when `NODE_ENV === 'production'` unless `ALLOW_IN_MEMORY_DB=true` is explicitly provided. Exit process loudly with a descriptive error.

### Gap 7: Polymorphic CSV Utility Inconsistency
- **Severity:** Low (Fixed)
- **Locations:** `client/src/utils/exportCsv.js`
- **Problem:** Some components called `exportToCsv(dataArray, filename)` while others called `exportToCsv(columns, dataArray, filename)`.
- **Remediation:** Made `exportToCsv` polymorphic to seamlessly accept either signature with UTF-8 BOM encoding.

---

## 4. Remediation Matrix & Status

| ID | Issue Description | Component | Target Phase | Status |
| :--- | :--- | :--- | :--- | :--- |
| **GAP-01** | Division 'D' missing in dropdowns | Client (Admin & Teacher) | Phase 3 & 5 | In Progress |
| **GAP-02** | Static course input in student registration | Client (Admin Students) | Phase 3 | In Progress |
| **GAP-03** | Missing student export to CSV | Client (Admin Students) | Phase 3 | In Progress |
| **GAP-04** | Brute-force vulnerability on `/api/auth/login` | Server (Auth Middleware) | Phase 8 | Planned |
| **GAP-05** | Missing HTTP security headers | Server (server.js) | Phase 8 | Planned |
| **GAP-06** | In-memory fallback safety in production | Server (config/db.js) | Phase 8 | Planned |
| **GAP-07** | Polymorphic CSV exporter argument mismatch | Client (utils) | Phase 2 | Resolved |

---

## 5. Conclusion

Addressing these gaps will elevate the Attendance Management System from a functional prototype to an enterprise-grade, secure, and production-ready academic software platform.
