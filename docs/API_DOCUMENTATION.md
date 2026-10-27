# REST API Documentation
## Attendance Management System (AMS) — MERN Platform

**Document Version:** 2.2.0  
**Date:** October 2026  
**Author:** Ayush Shedge  
**Degree:** B.Sc. Information Technology  
**Institution:** Vidyalankar School of Information Technology, Mumbai  
**Base URL:** `http://localhost:5000/api`  
**Protocol:** HTTP/1.1 (JSON over REST)  
**Authentication:** JSON Web Token (Bearer JWT in `Authorization` header)  

---

## 1. Authentication & Security Conventions

All protected API endpoints require an HTTP `Authorization` header formatted as:
```http
Authorization: Bearer <jwt_token>
```

### Standard Response Envelope
#### Success Response (`200 OK` / `201 Created`):
```json
{
  "success": true,
  "message": "Action executed successfully",
  "data": { ... }
}
```

#### Error Response (`400`, `401`, `403`, `404`, `500`):
```json
{
  "success": false,
  "message": "Specific explanation of error condition"
}
```

---

## 2. Health & System Status Endpoints

### 2.1 Server Health Check
- **Endpoint:** `GET /health`
- **Access:** Public (No authentication required)
- **Description:** Verifies that Express backend and database connection are responsive.
- **Success Response (`200 OK`):**
```json
{
  "status": "OK",
  "message": "MERN Attendance Management System API is running smoothly",
  "timestamp": "2026-10-23T13:45:00.000Z"
}
```

---

## 3. Authentication & User Profile Endpoints

### 3.1 User Login
- **Endpoint:** `POST /auth/login`
- **Access:** Public
- **Description:** Authenticates Admin, HOD, Teacher, or Student and returns a signed JWT.
- **Request Body (Staff / Admin / HOD / Teacher):**
```json
{
  "email": "teacher@attendance.com",
  "password": "Teacher@123"
}
```
- **Request Body (Student by ID):**
```json
{
  "studentId": "STU1001",
  "password": "Student@123"
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671800000000000000000002",
    "name": "Prof. Priya Verma",
    "email": "teacher@attendance.com",
    "role": "teacher",
    "department": "Information Technology",
    "phone": "+91 98765 43211"
  }
}
```

### 3.2 Get Current Profile
- **Endpoint:** `GET /auth/me`
- **Access:** Private (Authenticated User / Student)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "_id": "671800000000000000000004",
    "name": "Aarav Patel",
    "email": "aarav.patel.stu@attendance.com",
    "studentId": "STU1001",
    "course": "B.Sc. IT",
    "department": "Information Technology",
    "semester": 4,
    "division": "A",
    "rollNumber": "101"
  },
  "role": "student"
}
```

### 3.3 List Faculty Teachers Directory
- **Endpoint:** `GET /auth/teachers`
- **Access:** Private (`admin`, `hod`, `teacher`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "671800000000000000000001",
      "name": "Dr. Rajesh Sharma (Admin)",
      "email": "admin@attendance.com",
      "department": "Information Technology"
    },
    {
      "_id": "671800000000000000000002",
      "name": "Prof. Priya Verma",
      "email": "teacher@attendance.com",
      "department": "Information Technology"
    }
  ]
}
```

---

## 4. College Programs & Departments Endpoints

### 4.1 List College Degree Programs
- **Endpoint:** `GET /programs`
- **Access:** Private (Authenticated)
- **Query Parameters:**
  - `department` (optional string): Filter by department name.
  - `status` (optional string): `'Active'` or `'Inactive'`.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "671900000000000000000001",
      "name": "B.Sc. IT",
      "code": "BSCIT",
      "department": "Information Technology",
      "totalSemesters": 6,
      "divisions": ["A", "B", "C", "D"],
      "academicYears": ["2026-2027", "2025-2026"],
      "status": "Active"
    }
  ]
}
```

### 4.2 Create New College Program
- **Endpoint:** `POST /programs`
- **Access:** Private (`admin`)
- **Request Body:**
```json
{
  "name": "B.Sc. Data Science",
  "code": "BSCDS",
  "department": "Data Science",
  "totalSemesters": 6,
  "divisions": ["A", "B", "C", "D"],
  "academicYears": ["2026-2027"],
  "description": "Undergraduate program in Big Data and Analytics",
  "status": "Active"
}
```
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "College program created successfully",
  "data": { ... }
}
```

### 4.3 Update College Program
- **Endpoint:** `PUT /programs/:id`
- **Access:** Private (`admin`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Program updated successfully",
  "data": { ... }
}
```

### 4.4 List Academic Departments with Counter Rollups
- **Endpoint:** `GET /programs/departments/all`
- **Access:** Private (Authenticated)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "671910000000000000000001",
      "name": "Information Technology",
      "code": "IT",
      "description": "Department of Information Technology & Computing",
      "hod": {
        "_id": "671920000000000000000001",
        "name": "Prof. HOD IT",
        "email": "hod.it@attendance.com"
      },
      "programCount": 2,
      "subjectCount": 5,
      "studentCount": 20
    }
  ]
}
```

---

## 5. Teacher Allocations Endpoints

### 5.1 List Teacher Assignments
- **Endpoint:** `GET /assignments`
- **Access:** Private (Admin, HOD, Teacher)
- **Note:** For `teacher` role, automatically scopes to assignments where `teacher === req.user._id`.
- **Query Parameters:** `teacher`, `subject`, `program`, `division`, `academicYear`.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "671930000000000000000001",
      "teacher": {
        "_id": "671800000000000000000002",
        "name": "Prof. Priya Verma",
        "email": "teacher@attendance.com",
        "department": "Information Technology"
      },
      "subject": {
        "_id": "671810000000000000000001",
        "subjectCode": "IT301",
        "subjectName": "Database Management System",
        "semester": 4
      },
      "program": "B.Sc. IT",
      "semester": 4,
      "division": "A",
      "academicYear": "2026-2027"
    }
  ]
}
```

### 5.2 Create Teacher Assignment
- **Endpoint:** `POST /assignments`
- **Access:** Private (`admin`, `hod`)
- **Request Body:**
```json
{
  "teacher": "671800000000000000000002",
  "subject": "671810000000000000000001",
  "program": "B.Sc. IT",
  "semester": 4,
  "division": "B",
  "academicYear": "2026-2027"
}
```
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Teacher assigned successfully",
  "data": { ... }
}
```

---

## 6. Department Admin / HOD Endpoints

### 6.1 Department Dashboard Statistics
- **Endpoint:** `GET /hod/dashboard-stats`
- **Access:** Private (`hod`, `admin`)
- **Description:** Scoped strictly to the logged-in HOD's department.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "department": "Information Technology",
  "data": {
    "totalStudents": 20,
    "totalTeachers": 1,
    "totalSubjects": 5,
    "defaultersCount": 2,
    "averageAttendance": 83.1,
    "todaySessions": 0,
    "todayPresent": 0,
    "todayAbsent": 0,
    "subjectsBreakdown": [ ... ]
  }
}
```

### 6.2 Department Attendance Defaulters (< 75%)
- **Endpoint:** `GET /hod/defaulters`
- **Access:** Private (`hod`, `admin`)
- **Query Parameters:** `semester` (1–8), `division` (`A`–`D`).
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "department": "Information Technology",
  "count": 2,
  "data": [
    {
      "student": {
        "_id": "671800000000000000000005",
        "studentId": "STU1002",
        "name": "Ananya Sharma",
        "email": "ananya.sharma.stu@attendance.com",
        "phone": "+91 98765 43222",
        "semester": 4,
        "division": "A",
        "rollNumber": "102",
        "course": "B.Sc. IT"
      },
      "total": 51,
      "present": 30,
      "absent": 21,
      "percentage": 58.8,
      "neededClasses": 33,
      "severity": "Critical"
    }
  ]
}
```

### 6.3 Department Academic Reports
- **Endpoint:** `GET /hod/reports`
- **Access:** Private (`hod`, `admin`)
- **Query Parameters:**
  - `type`: `'student'` (default), `'subject'`, `'daily'`, or `'monthly'`.
  - `semester`, `division`, `subject`, `date`, `month`.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "department": "Information Technology",
  "type": "student",
  "count": 20,
  "data": [
    {
      "_id": "671800000000000000000004",
      "studentId": "STU1001",
      "name": "Aarav Patel",
      "semester": 4,
      "division": "A",
      "totalClasses": 53,
      "presentClasses": 49,
      "absentClasses": 4,
      "percentage": 92.5,
      "status": "Eligible"
    }
  ]
}
```

---

## 7. Faculty Teacher Endpoints

### 7.1 Faculty Dashboard Statistics
- **Endpoint:** `GET /teacher/dashboard-stats`
- **Access:** Private (`teacher`, `admin`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "totalAssignedSubjects": 3,
    "totalAssignedStudents": 20,
    "totalClassesConducted": 33,
    "todaySessionsCount": 0,
    "todayPresentCount": 0,
    "todayAbsentCount": 0,
    "pendingSessions": 3
  }
}
```

### 7.2 Assigned Subjects List
- **Endpoint:** `GET /teacher/subjects`
- **Access:** Private (`teacher`, `admin`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "671810000000000000000001",
      "subjectCode": "IT301",
      "subjectName": "Database Management System",
      "semester": 4,
      "department": "Information Technology",
      "enrolledStudentsCount": 20,
      "totalClassesConducted": 13,
      "averageAttendancePercentage": 85.4
    }
  ]
}
```

---

## 8. Attendance Marking & Audit Trail Endpoints

### 8.1 Mark Batch Attendance
- **Endpoint:** `POST /attendance`
- **Access:** Private (`teacher`, `admin`, `hod`)
- **Security Check:** Faculty can only mark attendance for assigned subjects.
- **Request Body:**
```json
{
  "subject": "671810000000000000000001",
  "date": "2026-10-23",
  "session": "Lecture 1",
  "records": [
    { "student": "671800000000000000000004", "status": "Present", "remarks": "On time" },
    { "student": "671800000000000000000005", "status": "Absent", "remarks": "Informed leave" }
  ]
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Attendance marked successfully for 2 students (Lecture 1)",
  "data": {
    "upsertedCount": 0,
    "modifiedCount": 2,
    "matchedCount": 2,
    "session": "Lecture 1"
  }
}
```

### 8.2 Update Attendance with Audit Trail
- **Endpoint:** `PUT /attendance/:id`
- **Access:** Private (`teacher`, `admin`, `hod`)
- **Request Body:**
```json
{
  "status": "Present",
  "remarks": "Medical certificate verified",
  "reason": "Submitted valid medical slip approved by HOD",
  "session": "Lecture 1"
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Attendance record updated successfully with audit trail",
  "data": {
    "_id": "671820000000000000000100",
    "status": "Present",
    "remarks": "Medical certificate verified",
    "editHistory": [
      {
        "editedBy": "671800000000000000000002",
        "editedAt": "2026-10-23T14:10:00.000Z",
        "previousStatus": "Absent",
        "newStatus": "Present",
        "previousRemarks": "Unexcused",
        "newRemarks": "Medical certificate verified",
        "reason": "Submitted valid medical slip approved by HOD"
      }
    ]
  }
}
```

### 8.3 Student Personal Summary Calculation
- **Endpoint:** `GET /attendance/student/:id/summary`
- **Access:** Private (Target Student or Staff)
- **Security Check:** Other students are rejected with `HTTP 403 Forbidden`.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "attendancePercentage": 92.5,
    "totalClassesConducted": 53,
    "classesAttended": 49,
    "classesMissed": 4,
    "totalEnrolledSubjects": 5,
    "subjectsBelowThreshold": 0,
    "threshold": 75,
    "subjectBreakdown": [
      {
        "subjectId": "671810000000000000000001",
        "subjectCode": "IT301",
        "subjectName": "Database Management System",
        "totalClasses": 13,
        "presentClasses": 12,
        "absentClasses": 1,
        "percentage": 92.3,
        "status": "Eligible"
      }
    ]
  }
}
```

### 8.4 Student Monthly Summary
- **Endpoint:** `GET /attendance/student/:id/monthly`
- **Access:** Private (Target Student or Staff)
- **Query Parameters:** `month` (e.g. `2026-10`).
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "month": "October 2026",
    "totalClasses": 2,
    "classesAttended": 1,
    "classesMissed": 1,
    "percentage": 50,
    "subjectWise": [ ... ]
  }
}
```
