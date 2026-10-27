# System Architecture Document
## Attendance Management System (AMS) — MERN Platform

**Document Version:** 2.2.0  
**Date:** October 2026  
**Author:** Ayush Shedge  
**Degree:** B.Sc. Information Technology  
**Institution:** Vidyalankar School of Information Technology, Mumbai  
**GitHub Repository:** [https://github.com/ayushshedge24-tech/attendance-management-system-mern](https://github.com/ayushshedge24-tech/attendance-management-system-mern)  

---

## 1. High-Level Architectural Context

The **Attendance Management System (AMS)** is engineered as a decoupled, multi-tier Single Page Application (SPA) driven by a RESTful backend API. The system orchestrates four role-isolated portals (Main Admin, Department HOD, Faculty Teacher, and Student) operating over a unified MongoDB Community database.

```mermaid
flowchart TD
    subgraph Clients ["Client Layer (React 18 + Vite)"]
        A1["Main Administrator\n(College-wide Portal)"]
        A2["Department HOD\n(Department Portal)"]
        A3["Faculty Teacher\n(Classroom Portal)"]
        A4["Enrolled Student\n(Student Portal)"]
    end

    subgraph Gateway ["Application Server (Node.js + Express.js)"]
        B1["Unified Express Server (Port 5000)"]
        B2["Static SPA Handler (/dist)"]
        B3["JWT Authentication Gateway"]
        B4["Role-Based Access Control (RBAC)"]
        B5["REST API Router (/api/*)"]
    end

    subgraph Controllers ["Controllers & Business Logic"]
        C1["Program & Dept Controller"]
        C2["Assignment Controller"]
        C3["HOD Scoped Controller"]
        C4["Teacher Controller"]
        C5["Attendance Service & Audit Engine"]
        C6["Student Controller"]
    end

    subgraph Storage ["Data Persistence (MongoDB v8.0)"]
        D1[("attendance_db")]
        D2["users\n(Staff & HODs)"]
        D3["departments\n& programs"]
        D4["teacherassignments"]
        D5["students\n& subjects"]
        D6["attendances\n(with editHistory)"]
    end

    A1 -->|HTTPS/JSON| B1
    A2 -->|HTTPS/JSON| B1
    A3 -->|HTTPS/JSON| B1
    A4 -->|HTTPS/JSON| B1

    B1 --> B2
    B1 --> B3 --> B4 --> B5
    
    B5 --> C1
    B5 --> C2
    B5 --> C3
    B5 --> C4
    B5 --> C5
    B5 --> C6

    C1 --> D3
    C2 --> D4
    C3 --> D1
    C4 --> D5
    C5 --> D6
    C6 --> D5

    D1 --- D2
    D1 --- D3
    D1 --- D4
    D1 --- D5
    D1 --- D6
```

---

## 2. Component & Layer Architecture

```mermaid
flowchart LR
    subgraph Presentation ["Presentation Layer (React 18)"]
        direction TB
        UI1["AuthContext & ToastContext"]
        UI2["ProtectedRoute (RBAC Guard)"]
        UI3["DashboardLayout (Responsive Sidebar)"]
        UI4["Pages (Admin, HOD, Teacher, Student)"]
        UI5["Axios Client (Bearer Interceptor)"]
        UI1 --> UI2 --> UI3 --> UI4 --> UI5
    end

    subgraph ServerLayer ["Server Layer (Express.js)"]
        direction TB
        S1["server.js (Static & CORS)"]
        S2["authMiddleware (JWT Verify)"]
        S3["roleMiddleware (RBAC Guard)"]
        S4["Express Routers"]
        S5["Controllers & Services"]
        S1 --> S2 --> S3 --> S4 --> S5
    end

    subgraph DataLayer ["Persistence Layer (Mongoose + MongoDB)"]
        direction TB
        M1["Mongoose Models & Hooks"]
        M2["Compound Unique Indexes"]
        M3["MongoDB Storage Engine (WiredTiger)"]
        M1 --> M2 --> M3
    end

    UI5 -->|HTTP REST| S1
    S5 -->|ODM Queries| M1
```

---

## 3. Role-Based Portal Architecture & Routing

```mermaid
flowchart TD
    Login["/login (LoginPage.jsx)\nDual ID Authentication"]
    
    Login -->|Role: 'admin'| ADM["/admin/dashboard\nMain Admin Portal"]
    Login -->|Role: 'hod'| HOD["/hod/dashboard\nDepartment HOD Portal"]
    Login -->|Role: 'teacher'| TCH["/teacher/dashboard\nFaculty Teacher Portal"]
    Login -->|Role: 'student'| STU["/student/dashboard\nStudent Portal"]

    subgraph AdminPortal ["Admin Protected Routes"]
        ADM --> P1["/admin/programs (8 Programs + Depts)"]
        ADM --> P2["/admin/assignments (Teacher Allocations)"]
        ADM --> P3["/admin/students (Student CRUD)"]
        ADM --> P4["/admin/subjects (Subject CRUD)"]
        ADM --> P5["/admin/attendance-records (Audit Logs)"]
        ADM --> P6["/admin/reports (College Reports)"]
    end

    subgraph HodPortal ["HOD Protected Routes"]
        HOD --> H1["/hod/students (Department Students)"]
        HOD --> H2["/hod/teachers (Department Faculty)"]
        HOD --> H3["/hod/subjects (Department Courses)"]
        HOD --> H4["/hod/defaulters (Defaulters < 75%)"]
        HOD --> H5["/hod/reports (Department Reports)"]
    end

    subgraph TeacherPortal ["Teacher Protected Routes"]
        TCH --> T1["/teacher/subjects (Assigned Classes)"]
        TCH --> T2["/teacher/mark-attendance (Batch Marking)"]
        TCH --> T3["/teacher/edit-attendance (Audit Updates)"]
        TCH --> T4["/teacher/absent-students (Defaulters)"]
        TCH --> T5["/teacher/reports (Classroom Reports)"]
    end

    subgraph StudentPortal ["Student Protected Routes"]
        STU --> S1["/student/attendance (Day-wise Ledger)"]
        STU --> S2["/student/subjects (Subject Percentages)"]
        STU --> S3["/student/monthly (Monthly Trends)"]
        STU --> S4["/student/profile (Academic Info)"]
    end
```

---

## 4. Sequence Diagrams

### 4.1 Batch Attendance Marking Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Faculty Professor
    participant Browser as React Frontend
    participant Server as Express Server
    participant DB as MongoDB Database

    Teacher->>Browser: Select Subject, Date, Division, Session
    Browser->>Server: GET /api/teacher/students?subject=id&division=A
    Server->>DB: Student.find({ semester, division })
    DB-->>Server: [Student Documents]
    Server-->>Browser: JSON Student Roster
    Browser-->>Teacher: Renders Classroom Roster Table
    
    Teacher->>Browser: Clicks "Mark All Present", toggles 2 Absentees
    Teacher->>Browser: Clicks "Save Attendance"
    Browser->>Server: POST /api/attendance (Batch Payload)
    
    Note over Server: Validates JWT token & teacher assignment
    Server->>Server: Normalize Date to UTC Midnight (00:00:00Z)
    Server->>DB: Attendance.bulkWrite([ operations ])
    Note over DB: Enforces compound unique index<br/>{student, subject, date, session}
    DB-->>Server: BulkWriteResult (Upserted / Modified)
    Server-->>Browser: HTTP 200 OK { success: true, count }
    Browser-->>Teacher: Toast "Attendance marked successfully"
```

### 4.2 Attendance Correction with Audit Trail Logging
```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Teacher / Administrator
    participant Client as React Client
    participant Controller as Attendance Controller
    participant Model as Attendance Model
    participant DB as MongoDB

    Faculty->>Client: Edits status from Absent to Present
    Faculty->>Client: Enters revision reason: "Medical certificate verified"
    Faculty->>Client: Clicks "Save Corrections"
    Client->>Controller: PUT /api/attendance/:id { status: "Present", reason: "..." }
    
    Controller->>Model: findById(req.params.id)
    Model->>DB: Query by ObjectId
    DB-->>Model: Attendance Document
    Model-->>Controller: record instance
    
    Note over Controller: Detects status change: "Absent" -> "Present"
    Controller->>Controller: Push subdocument to record.editHistory:<br/>{ editedBy, editedAt, previousStatus, newStatus, reason }
    Controller->>Model: record.save()
    Model->>DB: Document Update with atomic array push
    DB-->>Model: Acknowledged
    Controller-->>Client: HTTP 200 OK (Updated Document with Audit Trail)
    Client-->>Faculty: Renders "Edited (1x)" Pill & Success Toast
```

### 4.3 Student Dashboard Calculation & Security Boundary
```mermaid
sequenceDiagram
    autonumber
    actor Student as Enrolled Student
    participant SPA as React Frontend
    participant Auth as Auth Middleware
    participant Service as Attendance Service
    participant DB as MongoDB

    Student->>SPA: Navigates to /student/dashboard
    SPA->>Auth: GET /api/attendance/student/:id/summary (Bearer JWT)
    
    alt Student attempts to access another student's ID
        Auth->>Auth: req.user._id !== req.params.id && role === 'student'
        Auth-->>SPA: HTTP 403 Forbidden ("Access denied to other student records")
        SPA-->>Student: Displays Authorization Error Toast
    else Student accesses own ID
        Auth->>Service: calculateStudentSummary(studentId)
        Service->>DB: Attendance.find({ student: studentId })
        DB-->>Service: [Attendance Documents]
        Service->>Service: Total = records.length<br/>Present = records.filter(Present).length<br/>Percentage = Total > 0 ? (Present/Total)*100 : 0
        Service-->>SPA: HTTP 200 OK { attendancePercentage, total, present, absent }
        SPA-->>Student: Renders Dynamic Circular Progress & Shortage Banner
    end
```

### 4.4 HOD Defaulter Detection & Scoped Department Query
```mermaid
sequenceDiagram
    autonumber
    actor HOD as Department HOD
    participant Client as HOD React Portal
    participant API as HOD Controller
    participant DB as MongoDB

    HOD->>Client: Navigates to /hod/defaulters
    Client->>API: GET /api/hod/defaulters?semester=4 (Bearer JWT)
    
    Note over API: Extracts HOD's department from req.user.department
    API->>DB: Program.find({ department: "Information Technology" })
    DB-->>API: [Dept Programs]
    API->>DB: Student.find({ department: "IT", semester: 4 })
    DB-->>API: [Dept Students]
    API->>DB: Attendance.find({ student: { $in: deptStudentIds } })
    DB-->>API: [Attendance Records]
    
    loop For each student
        API->>API: Calculate percentage = (Present / Total) * 100
        opt Percentage < 75%
            API->>API: NeededClasses = Math.max(0, ceil(3*Total - 4*Present))
            API->>API: Severity = Percentage < 60 ? 'Critical' : 'Warning'
            API->>API: Push to defaulters list
        end
    end
    
    API-->>Client: HTTP 200 OK { department, count, data: [defaulters] }
    Client-->>HOD: Renders Defaulter Table with consecutive class gaps
```

---

## 5. Deployment Topology

The application supports a unified single-port architecture ideal for campus intranet deployment:

```mermaid
flowchart TB
    subgraph Host ["Single Node Campus Host / Developer Machine"]
        subgraph NodeProcess ["Node.js Server Process (PID: node server/server.js)"]
            StaticServe["Express Static Middleware\nServes compiled React assets from /client/dist"]
            ApiRouter["Express REST Router\nServes /api/* endpoints"]
            PortBind["Port Listener :5000"]
        end

        subgraph MongoService ["MongoDB Community Server (Port 27017)"]
            WiredTiger["WiredTiger Storage Engine"]
            DbFiles["Database: attendance_db\n(Data Files on Local Disk)"]
        end
    end

    BrowserClient["End-User Web Browsers\n(Laptops, Mobile Devices, Tablets)"] -->|HTTP / localhost:5000| PortBind
    PortBind --> StaticServe
    PortBind --> ApiRouter
    ApiRouter -->|Mongoose Connection| WiredTiger
    WiredTiger --- DbFiles
```

---

## 6. Security Architecture

1. **Authentication:** Stateless JSON Web Token signed with HMAC-SHA256 using `JWT_SECRET`.
2. **Password Security:** Salted hashes generated using `bcryptjs` with 10 salt rounds. Passwords are never stored or transmitted in plain text.
3. **Role-Based Access Control:** Dual-layer enforcement:
   - Client-side: `<ProtectedRoute allowedRoles={[...]} />` redirects unauthorized users.
   - Server-side: `roleMiddleware.js` verifies permissions before controller invocation.
4. **Data Isolation:** Strict identity checking ensures that students cannot read or write records belonging to other students.
5. **NoSQL Injection Defense:** Mongoose schema casting and strict sanitization ensure malicious query operators are rejected.
