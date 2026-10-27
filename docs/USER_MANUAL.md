# Comprehensive User Manual
## Attendance Management System (AMS) — Role-Based Operating Guide

**Document Version:** 2.2.0  
**Date:** October 2026  
**Author:** Ayush Shedge  
**Degree:** B.Sc. Information Technology  
**Institution:** Vidyalankar School of Information Technology, Mumbai  
**Application URL:** [http://localhost:5000](http://localhost:5000)  

---

## 1. Getting Started & Logging In

Open your web browser and navigate to [http://localhost:5000](http://localhost:5000). You will be presented with the login interface.

### 1.1 One-Click Demo Quick-Fill Buttons
For academic viva evaluation, the login page features quick-fill buttons across the top:
- **Admin:** Automatically fills `admin@attendance.com` / `Admin@123`.
- **HOD IT:** Automatically fills `hod.it@attendance.com` / `Hod@123`.
- **HOD CS:** Automatically fills `hod.cs@attendance.com` / `Hod@123`.
- **Teacher:** Automatically fills `teacher@attendance.com` / `Teacher@123`.
- **Student:** Automatically fills Student ID `STU1001` / `Student@123`.

### 1.2 Manual Role Selection
- **Staff / Admin / HOD / Teacher Tab:** Enter your registered institutional email and password, then click **Sign In to AMS Portal**.
- **Student Tab:** Enter your official **Student ID** (e.g. `STU1001`) or college email and password, then click **Sign In as Student**.

---

## 2. Main Administrator Guide

As Main Admin, you oversee the entire institution across all programs and faculties.

### 2.1 Navigating the Admin Dashboard (`/admin/dashboard`)
- **Top Metric Cards:** Monitor Total Students, Total Faculty, Total Curriculum Courses, and College-Wide Average Attendance Rate.
- **Charts:** Visual analytics showing Department-wise Student Distribution and Attendance Status Ratios.
- **Recent Activity:** Real-time feed of recent class attendance sessions recorded across the institution.

### 2.2 Managing College Programs & Departments (`/admin/programs`)
- **Programs Tab:**
  1. View the 8 default degree programs (B.Sc. IT, B.Sc. CS, B.Sc. DS, B.Tech, M.Sc. IT, M.Sc. CS, M.Sc. DS, M.Tech).
  2. Click **Add Program** to register a new degree course. Enter Program Name, Program Code, Department, Semesters (1–10), and check the supported divisions (**A**, **B**, **C**, **D**).
  3. Click the **Edit** icon on any program card to adjust semesters or divisions.
  4. Click **Export CSV** to download the institutional programs registry.
- **Departments Tab:**
  1. Inspect the academic departments (Information Technology, Computer Science, Data Science, Computer Engineering).
  2. View appointed Heads of Department (HOD) and program/course counter rollups.
  3. Click **Add Department** to create a new academic department.

### 2.3 Allocating Faculty Teaching Assignments (`/admin/assignments`)
1. Click **Assign Faculty** button.
2. Select the **Faculty Member** from the dropdown list.
3. Select the **Curriculum Subject** (semester auto-populates).
4. Select the target **Program**, **Division** (A, B, C, or D), and **Academic Year** (e.g. `2026-2027`).
5. Click **Create Assignment**. The compound unique constraint ensures the same teacher cannot be duplicated for the same subject and division.
6. Click the trash icon to revoke a teaching assignment when course terms conclude.

### 2.4 Managing Students & Subjects (`/admin/students`, `/admin/subjects`)
- Search by name, roll number, or student ID.
- Filter students by semester and division.
- Click **Add Student** / **Add Subject** to create new records.
- Click **Export CSV** to download complete student rosters.

### 2.5 Inspecting Attendance Records & Audit History (`/admin/attendance-records`)
1. Filter attendance logs by Date, Subject, Status (Present/Absent), Semester, or Division.
2. If a record has been edited, an amber **Edited (Xx)** button appears beside the status badge.
3. Click **Edited (Xx)** to open the **Attendance Record Audit History Modal**:
   - View who edited the record (Name, Role).
   - View exact timestamp of the revision.
   - View previous status vs new status.
   - Read the revision justification reason provided by faculty.
4. Click the pencil icon to perform an administrative override, entering a required revision reason for the audit log.

---

## 3. Department Admin / HOD Guide

As Head of Department, your dashboard and permissions are strictly scoped to your assigned department (e.g. Information Technology).

### 3.1 Department Dashboard (`/hod/dashboard`)
- Displays live statistics exclusively for your department: Department Students count, Department Faculty count, Curriculum Subjects, and Active Defaulters.
- Today's Session metrics showing Present and Absent breakdowns for lectures conducted today.

### 3.2 Monitoring Defaulters (< 75%) (`/hod/defaulters`)
1. Navigate to **Defaulters (<75%)** in the sidebar.
2. View all department students whose attendance is below the mandatory 75% university threshold.
3. Review key indicators:
   - **Attendance Progress Bar:** Visual indicator color-coded red for Critical (<60%) or amber for Warning (60–74.9%).
   - **Recovery Needed:** Displays exact consecutive classes needed (e.g. `+12 consecutive`) to regularize attendance above 75%.
   - **Quick Actions:** Click the envelope icon to launch a pre-filled email alert to the student/parent, or the phone icon to initiate a call.
4. Click **Print Report** for a clean, official paper report, or **Export CSV** to generate a defaulter register for university submission.

### 3.3 Running Department Reports (`/hod/reports`)
- Select between 4 report modes using the top tabs:
  1. **Student-Wise Report:** Overall attendance table showing conducted, attended, missed, percentage, and compliance badges.
  2. **Subject-Wise Report:** Course averages, total attendance records marked, and present/absent ratios.
  3. **Daily Session Report:** Filter by a calendar date to inspect every student marked in that day's department lectures.
  4. **Monthly Summary:** Aggregated monthly percentages across curriculum courses for a selected year-month.
- Click **Export CSV** to download any active report view.

---

## 4. Faculty Teacher Guide

### 4.1 Viewing Assigned Subjects (`/teacher/subjects`)
- View only courses allocated to you by administration.
- Inspect enrolled student count, classes conducted to date, and average classroom attendance rate.

### 4.2 Marking Batch Classroom Attendance (`/teacher/mark-attendance`)
1. Select the **Assigned Subject** from the dropdown menu.
2. Select the **Attendance Date** (defaults to today).
3. Select the **Session / Lecture** (e.g. Lecture 1, Lecture 2, Lab Practical).
4. Select the **Division** (A, B, C, or D). The student roster will load automatically.
5. Use rapid marking shortcuts:
   - Click **Mark All Present** to set all students to Present.
   - Click **Mark All Absent** if conducting an unannounced test or audit.
   - Click individual student toggle buttons to switch status.
   - Enter optional notes in the **Remarks** field (e.g., "Late entry permitted").
6. Click **Save Attendance** to commit the batch to MongoDB. The system ensures duplicate records are prevented.

### 4.3 Editing Attendance with Revision Justification (`/teacher/edit-attendance`)
1. Select the subject, date, and session you wish to correct.
2. In the **Revision Reason / Justification** input, enter the reason for change (e.g., "Medical slip submitted and approved", "Proxy attendance rectified").
3. Toggle the corrected statuses.
4. Click **Save Corrections**. The system updates the records and appends an audit entry recording your name, timestamp, and justification.

### 4.4 Tracking Daily Absentees & Defaulters (`/teacher/absent-students`)
- Inspect daily absentees across your classes to identify patterns of unexcused leave.
- Monitor chronic defaulters in your courses with needed consecutive class calculations.

---

## 5. Student Guide

### 5.1 Personal Attendance Dashboard (`/student/dashboard`)
- **Overall Attendance Percentage:** Large visual indicator showing your cumulative college attendance.
- **Threshold Warning Banner:** If your attendance is below 75%, an alert banner appears warning of exam debarment risk and displaying your current deficit.
- **Summary Cards:** Total Classes Conducted, Classes Attended, Classes Missed, Total Subjects, and Subjects Below Threshold.

### 5.2 Checking the Day-Wise Attendance Ledger (`/student/attendance`)
- View a complete chronological log of every class session.
- **Columns:** Date, Day of Week, Subject Code, Subject Name, Lecture/Session, Status.
- **Visual Status:** Green badge indicates **Present**; red badge indicates **Absent**.
- **Filters:** Filter by Subject to check a single course, or select a Month or Date Range.
- Click **Export CSV** to save your personal attendance log for your records.

### 5.3 Subject-Wise Breakdown (`/student/subjects`)
- Shows individual percentages for every course you are enrolled in.
- Identify immediately which specific subject is pulling down your overall percentage.

### 5.4 Monthly Attendance Trends (`/student/monthly`)
- Review your month-by-month attendance progress to ensure you are improving attendance toward the end of the term.

---

## 6. Frequently Asked Questions (FAQs)

**Q: What if I attend an extra lecture? How does it affect my percentage?**  
A: Every marked session is added to your total conducted classes. If you are marked Present, both attended and conducted counts increment, increasing your percentage according to:
$$\text{Percentage} = \left(\frac{\text{Attended}}{\text{Conducted}}\right) \times 100$$

**Q: Can a student edit their attendance records?**  
A: No. The student role is strictly read-only. Any attempt to send edit requests to `/api/attendance` is rejected by the server with `HTTP 403 Forbidden`.

**Q: How does the system handle days where no classes were scheduled?**  
A: Percentages are calculated only from actual recorded instructional sessions. Unscheduled dates or holidays have zero records and do not impact percentages.
