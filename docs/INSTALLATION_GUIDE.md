# Complete Installation & Deployment Guide
## Attendance Management System (AMS) — Setup and Execution

**Document Version:** 2.2.0  
**Date:** October 2026  
**Author:** Ayush Shedge  
**Degree:** B.Sc. Information Technology  
**Institution:** Vidyalankar School of Information Technology, Mumbai  
**Operating System:** Windows / Linux / macOS  

---

## 1. System Prerequisites

Before setting up the project, ensure your workstation meets the following technical requirements:

| Component | Minimum Version | Recommended Version | Download Link |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.0.0` | `v20.x` or `v24.x` LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | `v9.0.0` | `v10.x` | Packaged with Node.js |
| **MongoDB** | Community `v6.0` | Community `v8.0` | [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |
| **Git** | `v2.30` | Latest | [git-scm.com](https://git-scm.com/) |
| **Web Browser** | Evergreen | Chrome, Edge, Firefox | Modern web browser |

---

## 2. MongoDB Community Server Setup

The application connects to a local MongoDB Community instance at:
```text
mongodb://127.0.0.1:27017/attendance_db
```

### 2.1 Starting MongoDB on Windows
MongoDB Community Server runs as a native Windows Service named `MongoDB`.

Open PowerShell as Administrator:
```powershell
# 1. Verify MongoDB service status
Get-Service -Name MongoDB

# 2. If the service is Stopped, start it
Start-Service -Name MongoDB

# 3. Test connectivity on port 27017
Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
```
When `TcpTestSucceeded : True` is returned, your local MongoDB server is ready.

### 2.2 Starting MongoDB on Linux (Ubuntu / Debian)
```bash
sudo systemctl status mongod
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2.3 Starting MongoDB on macOS (Homebrew)
```bash
brew services list
brew services start mongodb-community
```

---

## 3. Step-by-Step Project Installation

### Step 1: Open the Project Directory
```powershell
cd C:\Users\Ayush\.gemini\antigravity\scratch\attendance-management-system
```

### Step 2: Install Node.js Dependencies
The project contains three dependency layers: the root orchestration runner, the Express server, and the Vite React client.

Install all layers using the root convenience script:
```powershell
npm run install-all
```

Alternatively, install each layer manually:
```powershell
# Root dependencies
npm install

# Backend server dependencies
npm install --prefix server

# Frontend client dependencies
npm install --prefix client
```

---

## 4. Environment Variable Configuration

Create a file named `.env` inside the `server/` directory.

### Location:
`server/.env`

### Configuration Content:
```env
# Application Server Port
PORT=5000

# Local MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/attendance_db

# JWT Secret Signing Key
JWT_SECRET=ams_super_secure_jwt_secret_key_2026_vsit_mumbai

# JWT Token Expiration
JWT_EXPIRE=7d

# Environment Mode
NODE_ENV=development
```

> **Security Guard:** The repository's root `.gitignore` excludes all `.env` files. Never commit production secrets or credentials to public Git repositories.

---

## 5. Execution Modes

### Option A: Unified Single-Port Production Mode (Recommended)
This mode builds the optimized Vite client into `client/dist` and serves both the API and frontend on port `5000`:

```powershell
# 1. Compile the React frontend
npm run build

# 2. Start the unified Express application
npm start
```

- **Application URL:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Option B: Concurrent Development Mode
This mode runs the Express backend and the Vite development server with Hot Module Replacement (HMR) concurrently:

```powershell
npm run dev:watch
```

- **React Client (Vite Dev Server):** [http://localhost:5173](http://localhost:5173)
- **Express Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 6. Verification & Automated Testing

Once the server is running on port 5000, verify system integrity using the automated E2E test suite:

```powershell
# Run the 24-step automated verification suite
node server/test_api.js
```

### Expected Output:
```text
===============================================================
 ALL 24 VERIFICATION SUITE TESTS PASSED WITH 100% SUCCESS!
 All 4 Dashboards (Admin, HOD, Teacher, Student) Verified!
===============================================================
```

### Manual Health Endpoint Verification:
In PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get | ConvertTo-Json
```
Output:
```json
{
  "status": "OK",
  "message": "MERN Attendance Management System API is running smoothly",
  "timestamp": "2026-10-23T14:00:00.000Z"
}
```

---

## 7. Demo Evaluation Credentials

Log in at [http://localhost:5000/login](http://localhost:5000/login) using any of the following credentials or by clicking the **1-Click Quick-Fill Demo Buttons**:

| Role | Username / ID | Password | Scope & Portal |
| :--- | :--- | :--- | :--- |
| **Main Admin** | `admin@attendance.com` | `Admin@123` | Institutional Admin (`/admin/dashboard`) |
| **HOD (IT Dept)** | `hod.it@attendance.com` | `Hod@123` | Department Admin (`/hod/dashboard`) |
| **HOD (CS Dept)** | `hod.cs@attendance.com` | `Hod@123` | Department Admin (`/hod/dashboard`) |
| **Faculty Teacher** | `teacher@attendance.com` | `Teacher@123` | Faculty Portal (`/teacher/dashboard`) |
| **Student** | `STU1001` | `Student@123` | Student Portal (`/student/dashboard`) |

---

## 8. Common Troubleshooting

### 1. `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
- **Cause:** Local MongoDB Community Server is not running.
- **Solution:** Run `Start-Service -Name MongoDB` in PowerShell as Administrator.

### 2. `Error: listen EADDRINUSE: address already in use :::5000`
- **Cause:** Another node process or terminal is currently bound to port 5000.
- **Solution:**
  ```powershell
  # Find process using port 5000
  Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
  # Stop the process (replace <PID> with process ID)
  Stop-Process -Id <PID> -Force
  ```

### 3. Changes in React Code Do Not Appear on Port 5000
- **Cause:** Port 5000 serves the compiled assets in `client/dist`.
- **Solution:** Rebuild the frontend bundle by running `npm run build`.
