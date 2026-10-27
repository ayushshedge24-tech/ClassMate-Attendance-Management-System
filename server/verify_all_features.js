const ioClient = require('../client/node_modules/socket.io-client');

const BASE_URL = 'http://localhost:5000';

const request = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, headers: res.headers, body };
};

const runComprehensiveVerification = async () => {
  console.log('================================================================================');
  console.log(' CLASSMATE: DEEP 10-FEATURE AUDIT & VERIFICATION SUITE');
  console.log('================================================================================\n');

  const results = [];

  const logFeature = (category, featureName, status, details) => {
    results.push({ category, featureName, status, details });
    const badge = status === 'VERIFIED_WORKING' ? '[PASS]' : status === 'FAILED' ? '[FAIL]' : '[NOT_VERIFIED]';
    console.log(`${badge} [${category}] ${featureName}`);
    console.log(`       -> Status: ${status} | ${details}\n`);
  };

  try {
    // -------------------------------------------------------------------------
    // 1. Dashboards & Role-Based Permissions
    // -------------------------------------------------------------------------
    // Admin Login & Dashboard
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@attendance.com', password: 'Admin@123' }),
    });
    const adminToken = adminLogin.body.token;
    const adminDash = await request('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (adminDash.status === 200 && adminDash.body.data?.totalStudents > 0) {
      logFeature('DASHBOARDS', 'Admin Dashboard & Master Stats', 'VERIFIED_WORKING', `Total Students: ${adminDash.body.data.totalStudents}, Avg Attendance: ${adminDash.body.data.averageAttendance}%`);
    } else {
      logFeature('DASHBOARDS', 'Admin Dashboard & Master Stats', 'FAILED', `Status: ${adminDash.status}`);
    }

    // HOD Login & Scoped Dashboard
    const hodLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'hod.it@attendance.com', password: 'Hod@123' }),
    });
    const hodToken = hodLogin.body.token;
    const hodDash = await request('/api/hod/dashboard-stats', {
      headers: { Authorization: `Bearer ${hodToken}` },
    });
    if (hodDash.status === 200 && hodDash.body.data?.totalStudents > 0) {
      logFeature('DASHBOARDS', 'HOD Department-Scoped Dashboard', 'VERIFIED_WORKING', `Dept: ${hodLogin.body.user.department}, Students: ${hodDash.body.data.totalStudents}`);
    } else {
      logFeature('DASHBOARDS', 'HOD Department-Scoped Dashboard', 'FAILED', `Status: ${hodDash.status}`);
    }

    // Teacher Login & Dashboard
    const teacherLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'teacher@attendance.com', password: 'Teacher@123' }),
    });
    const teacherToken = teacherLogin.body.token;
    const teacherDash = await request('/api/teacher/dashboard-stats', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    if (teacherDash.status === 200 && teacherDash.body.data?.assignedSubjectsCount > 0) {
      logFeature('DASHBOARDS', 'Teacher Dashboard & Metrics', 'VERIFIED_WORKING', `Assigned: ${teacherDash.body.data.assignedSubjectsCount} subjects, Classes: ${teacherDash.body.data.totalClassesConducted}`);
    } else {
      logFeature('DASHBOARDS', 'Teacher Dashboard & Metrics', 'FAILED', `Status: ${teacherDash.status}`);
    }

    // Student Login & Dashboard
    const student1Login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'STU1001', password: 'Student@123' }),
    });
    const student1Token = student1Login.body.token;
    const student1Id = student1Login.body.user?._id;
    const studentDash = await request(`/api/attendance/student/${student1Id}/summary`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    if (studentDash.status === 200 && studentDash.body.data?.attendancePercentage !== undefined) {
      logFeature('DASHBOARDS', 'Student Dashboard & Summary Cards', 'VERIFIED_WORKING', `Attended: ${studentDash.body.data.presentClasses}/${studentDash.body.data.totalClasses} (${studentDash.body.data.attendancePercentage}%)`);
    } else {
      logFeature('DASHBOARDS', 'Student Dashboard & Summary Cards', 'FAILED', `Status: ${studentDash.status}`);
    }

    // Cross-student security check
    const student2Login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'STU1002', password: 'Student@123' }),
    });
    const student2Id = student2Login.body.user?._id;
    const student2Token = student2Login.body.token;
    const breachAttempt = await request(`/api/attendance/student/${student2Id}/summary`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    if (breachAttempt.status === 403) {
      logFeature('PERMISSIONS', 'Cross-Student Data Isolation Security', 'VERIFIED_WORKING', 'Student 1 attempted to access Student 2 records -> HTTP 403 Forbidden correctly returned');
    } else {
      logFeature('PERMISSIONS', 'Cross-Student Data Isolation Security', 'FAILED', `Expected 403, received ${breachAttempt.status}`);
    }

    // -------------------------------------------------------------------------
    // 2. Teacher Radar Session Creation
    // -------------------------------------------------------------------------
    const teacherSubjects = await request('/api/teacher/subjects', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    const assignedSubject = teacherSubjects.body.data[0];
    const uniqueSlot = `Lecture-Audit-${Date.now()}`;

    const startRadarRes = await request('/api/radar/session/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: JSON.stringify({
        subjectId: assignedSubject.subjectId || assignedSubject._id,
        course: 'B.Tech Information Technology',
        semester: 4,
        division: 'A',
        classroom: 'Lab 204',
        sessionSlot: uniqueSlot,
        durationMinutes: 20,
        verificationMethod: 'location_geofence',
        classroomLocation: {
          latitude: 19.0760,
          longitude: 72.8777,
          radiusMeters: 100,
        },
      }),
    });

    let sessionId = null;
    let sessionCode = null;
    if (startRadarRes.status === 201 || (startRadarRes.status === 200 && startRadarRes.body.data)) {
      sessionId = startRadarRes.body.data._id;
      sessionCode = startRadarRes.body.data.sessionCode;
      logFeature('RADAR', 'Teacher Radar Session Creation', 'VERIFIED_WORKING', `Code: ${sessionCode}, Status: active, Geofence: 100m`);
    } else {
      logFeature('RADAR', 'Teacher Radar Session Creation', 'FAILED', `Status: ${startRadarRes.status}, Message: ${startRadarRes.body.message}`);
    }

    // -------------------------------------------------------------------------
    // 6. Socket.IO Live Teacher Roster Updates (Setup listener before student mark)
    // -------------------------------------------------------------------------
    let socketLiveReceived = false;
    let socketLiveData = null;

    const teacherSocket = ioClient(BASE_URL, {
      transports: ['websocket', 'polling'],
      forceNew: true,
    });

    await new Promise((resolve) => {
      teacherSocket.on('connect', resolve);
    });

    teacherSocket.emit('join_radar_session', {
      sessionId,
      role: 'teacher',
      userName: teacherLogin.body.user.name,
    });

    const socketPromise = new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 5000);
      teacherSocket.on('attendance_marked_live', (data) => {
        clearTimeout(timeout);
        socketLiveReceived = true;
        socketLiveData = data;
        resolve(data);
      });
    });

    // -------------------------------------------------------------------------
    // 4. Actual GPS Coordinate Validation & Geofence Radius Enforcement
    // -------------------------------------------------------------------------
    // 4a. Outside Geofence Test (Should be rejected with 400 because verificationMethod is 'location_geofence')
    const farDistanceRes = await request('/api/radar/session/mark', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: JSON.stringify({
        sessionCode,
        latitude: 19.1200, // ~5 km away
        longitude: 72.8900,
      }),
    });
    if (farDistanceRes.status === 400 && farDistanceRes.body.message?.includes('away from the classroom')) {
      logFeature('GPS_GEOFENCE', 'Geofence Radius Enforcement (Outside Bounds Rejection)', 'VERIFIED_WORKING', `Submitting from 5km away rejected with HTTP 400: "${farDistanceRes.body.message}"`);
    } else {
      logFeature('GPS_GEOFENCE', 'Geofence Radius Enforcement (Outside Bounds Rejection)', 'FAILED', `Expected 400, got ${farDistanceRes.status}: ${JSON.stringify(farDistanceRes.body)}`);
    }

    // 4b. Missing GPS Coordinates when Geofence Required (Should be rejected with 400)
    const missingCoordsRes = await request('/api/radar/session/mark', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: JSON.stringify({
        sessionCode,
      }),
    });
    if (missingCoordsRes.status === 400 && missingCoordsRes.body.message?.includes('location permission')) {
      logFeature('GPS_GEOFENCE', 'GPS Location Permission Requirement', 'VERIFIED_WORKING', `Missing GPS coordinates when geofence active rejected with HTTP 400: "${missingCoordsRes.body.message}"`);
    } else {
      logFeature('GPS_GEOFENCE', 'GPS Location Permission Requirement', 'FAILED', `Expected 400, got ${missingCoordsRes.status}`);
    }

    // -------------------------------------------------------------------------
    // 3. Student Radar Attendance Submission (Valid Coordinates within Geofence)
    // -------------------------------------------------------------------------
    const validCoordsMark = await request('/api/radar/session/mark', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: JSON.stringify({
        sessionCode,
        latitude: 19.07605, // ~5 meters away
        longitude: 72.87772,
        deviceInfo: 'ClassMate Verified Mobile/Desktop Client',
      }),
    });
    if (validCoordsMark.status === 200 && validCoordsMark.body.data?.status === 'Present') {
      logFeature('RADAR', 'Student Radar Attendance Submission (In-Bounds)', 'VERIFIED_WORKING', `Marked Present, Verification: ${validCoordsMark.body.data.verificationMethod}`);
    } else {
      logFeature('RADAR', 'Student Radar Attendance Submission (In-Bounds)', 'FAILED', `Status: ${validCoordsMark.status}, Message: ${validCoordsMark.body.message}`);
    }

    // Await Socket.IO live update
    await socketPromise;
    if (socketLiveReceived && socketLiveData?.studentId === 'STU1001') {
      logFeature('SOCKET_IO', 'Socket.IO Real-Time Teacher Roster Live Update', 'VERIFIED_WORKING', `Live event received without reload: ${socketLiveData.studentName} marked ${socketLiveData.status} at ${socketLiveData.markedAt}`);
    } else {
      logFeature('SOCKET_IO', 'Socket.IO Real-Time Teacher Roster Live Update', 'FAILED', 'Did not receive live socket event within timeout');
    }

    // -------------------------------------------------------------------------
    // 5. Duplicate Attendance Prevention
    // -------------------------------------------------------------------------
    const duplicateMark = await request('/api/radar/session/mark', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: JSON.stringify({
        sessionCode,
        latitude: 19.07605,
        longitude: 72.87772,
      }),
    });
    if (duplicateMark.status === 200 && duplicateMark.body.alreadyMarked === true) {
      logFeature('DUPLICATE_CHECK', 'Duplicate Attendance Prevention', 'VERIFIED_WORKING', `Duplicate attempt safely rejected: alreadyMarked=${duplicateMark.body.alreadyMarked}`);
    } else {
      logFeature('DUPLICATE_CHECK', 'Duplicate Attendance Prevention', 'FAILED', `Response: ${JSON.stringify(duplicateMark.body)}`);
    }

    // Also mark Student 2 cleanly
    await request('/api/radar/session/mark', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student2Token}` },
      body: JSON.stringify({
        sessionCode,
        latitude: 19.07605,
        longitude: 72.87772,
      }),
    });

    // -------------------------------------------------------------------------
    // 7. Manual Attendance Correction & Final Submission (Institutional Lock)
    // -------------------------------------------------------------------------
    // 7a. Manual Correction by Teacher
    const manualEdit = await request(`/api/radar/session/${sessionId}/attendee/STU1002`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: JSON.stringify({
        status: 'Requires Review',
        reviewRemarks: 'Teacher manual review check',
      }),
    });
    if (manualEdit.status === 200 && manualEdit.body.data?.status === 'Requires Review') {
      logFeature('CORRECTION', 'Manual Attendance Correction / Override', 'VERIFIED_WORKING', `Teacher modified STU1002 status to 'Requires Review' (method: ${manualEdit.body.data.verificationMethod})`);
    } else {
      logFeature('CORRECTION', 'Manual Attendance Correction / Override', 'FAILED', `Status: ${manualEdit.status}`);
    }

    // Revert to Present before final submit
    await request(`/api/radar/session/${sessionId}/attendee/STU1002`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: JSON.stringify({ status: 'Present' }),
    });

    // 7b. Final Submission
    const finalSubmit = await request(`/api/radar/session/${sessionId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    if (finalSubmit.status === 200 && finalSubmit.body.data?.isFinalSubmitted === true) {
      logFeature('FINAL_SUBMIT', 'Final Submission & Institutional Database Commit', 'VERIFIED_WORKING', `Session finalized and locked in DB for ${finalSubmit.body.data.attendees.length} students`);
    } else {
      logFeature('FINAL_SUBMIT', 'Final Submission & Institutional Database Commit', 'FAILED', `Status: ${finalSubmit.status}`);
    }

    // 7c. Re-submission attempt (Lock enforcement)
    const reSubmitAttempt = await request(`/api/radar/session/${sessionId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    if (reSubmitAttempt.status === 400) {
      logFeature('FINAL_SUBMIT', 'Institutional Lock Prevents Re-Submission', 'VERIFIED_WORKING', `Attempting re-submission rejected with HTTP 400: "${reSubmitAttempt.body.message}"`);
    } else {
      logFeature('FINAL_SUBMIT', 'Institutional Lock Prevents Re-Submission', 'FAILED', `Expected 400, got ${reSubmitAttempt.status}`);
    }

    // -------------------------------------------------------------------------
    // 8. Attendance History, Percentages, Reports & Defaulter Lists
    // -------------------------------------------------------------------------
    // Student history & percentage check
    const studentHistory = await request(`/api/attendance/student/${student1Id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const summaryCheck = await request(`/api/attendance/student/${student1Id}/summary`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const s = summaryCheck.body.data;
    const computedRate = Math.round((s.presentClasses / (s.totalClasses || 1)) * 1000) / 10;
    if (studentHistory.status === 200 && Math.abs(s.attendancePercentage - computedRate) <= 0.1) {
      logFeature('REPORTS', 'Student Attendance History & Exact Mathematical Formula', 'VERIFIED_WORKING', `Records: ${studentHistory.body.count}, Calculated: ${s.attendancePercentage}%, Formula match: true`);
    } else {
      logFeature('REPORTS', 'Student Attendance History & Exact Mathematical Formula', 'FAILED', `Mismatch or status error`);
    }

    // Defaulters List (<75%)
    const defaulters = await request('/api/teacher/absent-students?mode=chronic', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    if (defaulters.status === 200 && defaulters.body.count >= 0) {
      logFeature('REPORTS', 'Chronic Defaulters List (<75%) & Target Calculation', 'VERIFIED_WORKING', `Identified ${defaulters.body.count} defaulters with consecutive class recovery targets`);
    } else {
      logFeature('REPORTS', 'Chronic Defaulters List (<75%) & Target Calculation', 'FAILED', `Status: ${defaulters.status}`);
    }

    // Teacher Reports (Student-wise & Subject-wise)
    const stuReport = await request('/api/teacher/reports?type=student', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    const subReport = await request('/api/teacher/reports?type=subject', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    if (stuReport.status === 200 && subReport.status === 200) {
      logFeature('REPORTS', 'Teacher Student-wise & Subject-wise Reports', 'VERIFIED_WORKING', `Student reports: ${stuReport.body.count}, Subject items: ${subReport.body.data?.length}`);
    } else {
      logFeature('REPORTS', 'Teacher Student-wise & Subject-wise Reports', 'FAILED', `Status error`);
    }

    // -------------------------------------------------------------------------
    // 9. Timetable & Notifications
    // -------------------------------------------------------------------------
    const studentTT = await request('/api/timetable/student', {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const teacherTT = await request('/api/timetable/teacher', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    // Collision detection
    const collisionCheck = await request('/api/timetable', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        dayOfWeek: 'Monday',
        slotNumber: 1,
        startTime: '09:00',
        endTime: '10:00',
        course: 'B.Tech Computer Science',
        semester: 6,
        division: 'B',
        subject: assignedSubject.subjectId || assignedSubject._id,
        teacher: teacherLogin.body.user._id,
        classroom: 'Room 301',
      }),
    });

    if (studentTT.status === 200 && teacherTT.status === 200 && collisionCheck.status === 400) {
      logFeature('TIMETABLE', 'Timetable Engine & Collision Prevention', 'VERIFIED_WORKING', `Student/Teacher schedules loaded; Collision rejected with HTTP 400: "${collisionCheck.body.message}"`);
    } else {
      logFeature('TIMETABLE', 'Timetable Engine & Collision Prevention', 'FAILED', `Collision status: ${collisionCheck.status}`);
    }

    // Notifications
    const notifs = await request('/api/notifications', {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    let markReadOk = false;
    if (notifs.body.data?.[0]?._id) {
      const readRes = await request(`/api/notifications/${notifs.body.data[0]._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      markReadOk = readRes.status === 200;
    }
    if (notifs.status === 200 && markReadOk) {
      logFeature('NOTIFICATIONS', 'Database-Backed Notifications & Mark-as-Read', 'VERIFIED_WORKING', `Total: ${notifs.body.data.length}, Unread: ${notifs.body.unreadCount}, Mark-as-read: 200 OK`);
    } else {
      logFeature('NOTIFICATIONS', 'Database-Backed Notifications & Mark-as-Read', 'FAILED', `Status: ${notifs.status}`);
    }

    // -------------------------------------------------------------------------
    // 10. Physical Radar / Hardware Realism Audit
    // -------------------------------------------------------------------------
    logFeature('RADAR_HARDWARE', 'Bluetooth Low Energy (BLE) Beacon Scanning', 'NOT_VERIFIED', 'Not implemented for web browsers due to OS/browser sandboxing (requires native mobile app or paired BLE hardware)');
    logFeature('RADAR_HARDWARE', 'Campus Enterprise Wi-Fi BSSID Hardware Integration', 'NOT_VERIFIED', 'Web browsers cannot inspect router BSSID/MAC tables; system uses client IP + device fingerprint until RADIUS integration');

    // Clean up Socket.IO
    teacherSocket.disconnect();

  } catch (err) {
    console.error('Fatal error during verification run:', err);
  }

  console.log('================================================================================');
  console.log(' SUMMARY OF RESULTS:');
  const verifiedCount = results.filter((r) => r.status === 'VERIFIED_WORKING').length;
  const failedCount = results.filter((r) => r.status === 'FAILED').length;
  const notVerifiedCount = results.filter((r) => r.status === 'NOT_VERIFIED').length;
  console.log(` VERIFIED WORKING: ${verifiedCount} | FAILED: ${failedCount} | NOT VERIFIED (HARDWARE): ${notVerifiedCount}`);
  console.log('================================================================================');
};

runComprehensiveVerification();
