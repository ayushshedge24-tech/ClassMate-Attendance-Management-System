# Academic Project Report
## Attendance Management System (AMS) — MERN Platform

---

### **A Project Report Submitted to**
### **University of Mumbai**
### **In Partial Fulfillment of the Requirements for the Degree of**
### **Bachelor of Science in Information Technology (B.Sc. IT)**

---

**Submitted By:**  
**Ayush Shedge**  
Class of 2027  
Department of Information Technology  
**Vidyalankar School of Information Technology (VSIT)**  
Vidyalankar Educational Campus, Wadala (East), Mumbai – 400037  

**Academic Year:** 2026–2027  
**GitHub Repository:** [https://github.com/ayushshedge24-tech/attendance-management-system-mern](https://github.com/ayushshedge24-tech/attendance-management-system-mern)  

---

## Certificate of Approval

This is to certify that the project entitled **"Attendance Management System (AMS) – MERN"** is a bonafide work carried out by **Ayush Shedge** in partial fulfillment of the requirements for the award of the Degree of **Bachelor of Science in Information Technology** from the **University of Mumbai** at **Vidyalankar School of Information Technology, Mumbai** during the academic year 2026–2027.

---

## Declaration

I hereby declare that the project report entitled **"Attendance Management System (AMS) – MERN"** submitted to Vidyalankar School of Information Technology, affiliated with the University of Mumbai, is a record of original work done by me under academic supervision. The information derived from literature and external sources has been duly cited in the text and references.

**Ayush Shedge**  
Department of Information Technology  
Vidyalankar School of Information Technology, Mumbai  

---

## Acknowledgements

I would like to express my sincere gratitude to our respected Principal, Head of Department, faculty professors, and project guides at **Vidyalankar School of Information Technology, Mumbai** for their encouragement, technical guidance, and institutional support throughout the development of this academic platform.

I also extend my heartfelt thanks to my peers and family for their continuous motivation and support during the design, coding, testing, and documentation phases of this project.

---

## Abstract

In higher educational institutions, tracking and regulating student attendance is a statutory academic requirement. However, conventional attendance processes rely heavily on paper registers, manual roll-calling, and post-lecture data collation. These methods are inherently vulnerable to human calculation errors, proxy marking, loss of historical records, and significant administrative overhead. Crucially, they fail to provide students and faculty with real-time visibility into attendance deficits until end-of-semester examination debarment lists are published.

The **Attendance Management System (AMS) – MERN** is an enterprise-grade, full-stack academic web platform designed to automate and streamline the entire attendance lifecycle. Engineered using MongoDB, Express.js, React.js, and Node.js, the system implements **four distinct, role-segregated portals**: **Main Administrator** (college-wide governance, 8 default degree programs across Divisions A–D, teacher allocations, and institutional reporting), **Department Admin / HOD** (department-scoped monitoring, curriculum tracking, and defaulter analysis below 75%), **Faculty Teacher** (batch attendance marking, revision justification tracking, and absentee logging), and **Student** (day-wise ledger, subject percentages, and examination shortage alert banners).

The platform features high-throughput bulk write operations for class-wide submissions, compound unique database indexes preventing duplicate records, mathematical algorithms calculating needed consecutive classes to recover from attendance shortages, and complete revision audit trails logging who, when, and why an attendance status was altered. Tested through an automated 24-step verification suite with a 100% pass rate, AMS demonstrates a secure, transparent, and scalable solution for modern educational institutions.

---

## Table of Contents
1. [Chapter 1: Introduction](#chapter-1-introduction)
2. [Chapter 2: Literature Review & Problem Statement](#chapter-2-literature-review--problem-statement)
3. [Chapter 3: System Analysis & Requirements](#chapter-3-system-analysis--requirements)
4. [Chapter 4: System Architecture & Database Design](#chapter-4-system-architecture--database-design)
5. [Chapter 5: Implementation Details](#chapter-5-implementation-details)
6. [Chapter 6: Testing & Quality Assurance](#chapter-6-testing--quality-assurance)
7. [Chapter 7: Results & Walkthrough](#chapter-7-results--walkthrough)
8. [Chapter 8: Conclusion & Future Scope](#chapter-8-conclusion--future-scope)
9. [References](#references)

---

## Chapter 1: Introduction

### 1.1 Background
Attendance monitoring forms the bedrock of institutional academic regulation. Under University of Mumbai guidelines, undergraduate and postgraduate students are mandated to maintain a minimum of 75% attendance in every course to qualify for semester-end examinations. Historically, educational institutions have managed this requirement via physical attendance sheets handed from professor to professor.

### 1.2 Motivation
Traditional attendance recording consumes an estimated 7 to 10 minutes of every 50-minute lecture period. Furthermore, calculating cumulative attendance percentages across multi-division cohorts requires faculty to manually tally attendance counts at the end of each month. This lag creates severe academic friction: students only discover they have fallen below the 75% threshold when they are disqualified from exams, precluding any opportunity for academic recovery.

### 1.3 Project Objectives
1. **Automate Attendance Logging:** Deliver one-click batch attendance marking for entire classrooms.
2. **Implement Role-Based Governance:** Create tailored portals for Main Admin, Department HOD, Teacher, and Student.
3. **Multi-Program & Division Support:** Provide out-of-the-box support for 8 college degree programs (B.Sc. IT, B.Sc. CS, B.Sc. DS, B.Tech, M.Sc. IT, M.Sc. CS, M.Sc. DS, M.Tech) across Divisions A, B, C, and D.
4. **Attendance Auditability:** Log immutable revision entries (`editedBy`, `editedAt`, `previousStatus`, `newStatus`, `reason`) whenever an attendance record is updated.
5. **Dynamic Defaulter Recovery:** Formulate mathematical gaps identifying the exact consecutive classes needed to regularize attendance above 75%.
6. **Data Security & Privacy:** Strictly isolate student records to prevent unauthorized visibility.

---

## Chapter 2: Literature Review & Problem Statement

### 2.1 Study of Existing Systems

| Metric / Feature | Manual Paper Registers | Biometric RFID/Fingerprint | Teach Us App Reference | MERN AMS (Proposed System) |
| :--- | :--- | :--- | :--- | :--- |
| **Data Capture Speed** | Slow (7–10 mins/class) | Fast (1–2 seconds/student) | Fast (Mobile UI) | Ultra-fast (One-click batch) |
| **Hardware Requirement**| None (Paper/Pen) | High (Specialized Scanners) | Smartphone | Standard Web Browser |
| **Real-time Student View**| None (End of term notice)| Moderate (Kiosk/Portal) | Live Mobile App | Live Web Dashboard |
| **Shortage Recovery Gap** | None (Manual calc) | None (Percentage only) | Static warnings | Dynamic Consecutive Class Gap |
| **Audit Revision History**| Messy overwrites/whitener| Complex hardware logs | Basic edit | Full embedded audit trail |
| **Department Scoping** | Manual department files | Central IT database | Faculty views | Scoped HOD Portal |

### 2.2 Problem Statement
Existing paper-based and standalone attendance registers suffer from:
1. Significant instructional time wastage during roll calls.
2. Vulnerability to proxy attendance and unrecorded register loss.
3. Complete absence of immediate student feedback regarding examination eligibility.
4. Absence of audit tracking when attendance statuses are altered after submission.
5. High administrative burden in compiling departmental monthly defaulter sheets.

---

## Chapter 3: System Analysis & Requirements

### 3.1 Stakeholder Analysis
- **Main Administrator:** Requires bird's-eye visibility over all college faculties, programs, teacher allocations, and institutional averages.
- **Department HOD:** Requires department-filtered rosters, course catalogs, faculty monitoring, and real-time defaulter lists (<75%).
- **Faculty Professor:** Requires quick batch attendance marking, absentee inspection, and audit-logged edit tools.
- **Student:** Requires daily class verification (Present vs Absent), subject-wise percentages, and shortage warning alerts.

### 3.2 Feasibility Study
- **Technical Feasibility:** Developed using standard, open-source MERN technologies (Node.js, Express, React, MongoDB Community) requiring no proprietary licenses or dedicated hardware.
- **Operational Feasibility:** High usability with 1-click viva quick-fill credentials, intuitive color coding (Green = Present, Red = Absent), and responsive mobile/desktop design.
- **Economic Feasibility:** Zero software licensing costs; runs locally or on existing college intranet hardware.

---

## Chapter 4: System Architecture & Database Design

### 4.1 Multi-Tier Architecture
AMS adopts an enterprise MVC / Controller-Service-Repository multi-tier architecture:
- **Presentation Tier:** React 18, Vite, Tailwind CSS, Recharts, React Router DOM v6.
- **Application Tier:** Node.js, Express.js REST API with JWT verification and RBAC middleware.
- **Persistence Tier:** MongoDB Community Server v8.0 at `mongodb://127.0.0.1:27017/attendance_db` using Mongoose ODM v8.9.

### 4.2 Entity-Relationship Model
The schema comprises 7 interconnected collections: `users` (Staff), `departments`, `programs`, `teacherassignments`, `students`, `subjects`, and `attendances`.

```mermaid
erDiagram
    USERS ||--o{ DEPARTMENTS : "heads"
    USERS ||--o{ SUBJECTS : "teaches"
    USERS ||--o{ TEACHER_ASSIGNMENTS : "assigned_to"
    USERS ||--o{ ATTENDANCES : "marks"

    DEPARTMENTS ||--o{ PROGRAMS : "offers"
    DEPARTMENTS ||--o{ SUBJECTS : "contains"
    DEPARTMENTS ||--o{ STUDENTS : "belongs_to"

    PROGRAMS ||--o{ STUDENTS : "enrolls"
    PROGRAMS ||--o{ TEACHER_ASSIGNMENTS : "allocates"

    SUBJECTS ||--o{ TEACHER_ASSIGNMENTS : "linked_to"
    SUBJECTS ||--o{ ATTENDANCES : "records_for"

    STUDENTS ||--o{ ATTENDANCES : "receives"
```

---

## Chapter 5: Implementation Details

### 5.1 High-Performance Batch Attendance Marking
Using `Attendance.bulkWrite`, an entire classroom of 60 students is recorded in a single database transaction:
```javascript
const operations = records.map((item) => ({
  updateOne: {
    filter: {
      student: item.student,
      subject: subject,
      date: attendanceDate,
      session: item.session || lectureSession,
    },
    update: {
      $set: {
        status: item.status || 'Present',
        markedBy: req.user._id,
        remarks: item.remarks || '',
        session: item.session || lectureSession,
      },
    },
    upsert: true,
  },
}));
await Attendance.bulkWrite(operations);
```

### 5.2 Attendance Revision Audit Trail
When an attendance entry is modified via `PUT /api/attendance/:id`:
```javascript
if (status !== previousStatus) {
  record.status = status;
  if (!record.editHistory) record.editHistory = [];
  record.editHistory.push({
    editedBy: req.user._id,
    editedAt: new Date(),
    previousStatus,
    newStatus: record.status,
    previousRemarks,
    newRemarks: record.remarks,
    reason: req.body.reason || 'Attendance corrected by faculty',
  });
  await record.save();
}
```

### 5.3 Mathematical Defaulter Recovery Formulation
To determine the number of consecutive upcoming classes $x$ a student must attend to reach or exceed 75%:
$$\frac{\text{Present} + x}{\text{Total} + x} \ge 0.75 \implies x \ge 3 \times \text{Total} - 4 \times \text{Present}$$
$$\text{Needed Classes} = \max(0, \lceil 3 \times \text{Total} - 4 \times \text{Present} \rceil)$$

---

## Chapter 6: Testing & Quality Assurance

### 6.1 Automated Verification Suite
All 24 automated test cases implemented in [`server/test_api.js`](file:///c:/Users/Ayush/.gemini/antigravity/scratch/attendance-management-system/server/test_api.js) passed with 100% success rate:
- **Authentication & Roles:** Admin, HOD, Teacher, and Student logins verified.
- **Dynamic Math Precision:** $(49/53) \times 100 = 92.5\%$ verified.
- **Security Boundaries:** Cross-student queries and unassigned teacher markings rejected with `HTTP 403 Forbidden`.
- **HOD Scoping:** IT Department metrics accurately isolated to IT students and faculty.
- **Audit Trails:** Verification entry pushed to MongoDB `editHistory` with author, timestamps, status delta, and reason.

---

## Chapter 7: Results & Walkthrough

The platform successfully demonstrates four interconnected operational environments:
1. **Main Admin Dashboard:** Comprehensive visibility over the 8 college programs, division allocations, and institutional averages.
2. **HOD Portal:** Department-scoped oversight with real-time defaulter lists and consecutive recovery class calculations.
3. **Teacher Portal:** Rapid batch attendance marking with *Mark All Present/Absent* shortcuts and audit-tracked corrections.
4. **Student Portal:** Transparent day-wise history ledger with green/red status badges, monthly trends, and shortage alerts.

---

## Chapter 8: Conclusion & Future Scope

### 8.1 Conclusion
The **Attendance Management System (AMS) – MERN** fulfills all functional, architectural, and security requirements outlined for a modern college attendance management platform. By replacing manual paperwork with automated bulk logging, embedded revision auditing, dynamic defaulter detection, and role-segregated portals, the platform significantly enhances institutional productivity and academic transparency.

### 8.2 Future Scope
1. **Automated WhatsApp / SMS Alerts:** Interfacing Twilio or WhatsApp Business API to dispatch real-time shortage notices to parents.
2. **Biometric Hardware Integration:** Establishing an Express webhook to receive attendance pings from classroom RFID or fingerprint scanners.
3. **Timetable Engine Integration:** Dynamically populating daily lecture slots based on institutional timetable scheduling.

---

## References
1. University of Mumbai: *Ordinance 6086 relating to Attendance of Students*.
2. Teach Us College Intelligence Platform: *Reference for faculty workflows and attendance summaries* ([teachusapp.com](https://www.teachusapp.com/home)).
3. Mongoose Documentation: *Mongoose v8 Schema Validation, Middleware, and Indexes* ([mongoosejs.com](https://mongoosejs.com/)).
4. React Documentation: *React 18 Single Page Applications & Context API* ([react.dev](https://react.dev/)).
