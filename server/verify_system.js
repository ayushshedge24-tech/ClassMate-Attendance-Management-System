const http = require('http');
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

const runVerification = async () => {
  console.log('======================================================================');
  console.log(' CLASSMATE: DEEP END-TO-END WORKFLOW & RADAR VERIFICATION SUITE');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`[PASS] ${title}`);
      if (details) console.log(`       -> ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      if (details) console.error(`       -> ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health Endpoint
    const health = await request('/api/health');
    assert(health.status === 200 && health.body.status === 'OK', 'Health Endpoint Verification', `Status: ${health.body.status}, Message: ${health.body.message}`);

    // 2. Authentication for All Roles
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@attendance.com', password: 'Admin@123' }),
    });
    assert(adminLogin.status === 200 && adminLogin.body.user?.role === 'admin', 'Admin Authentication', `Role: ${adminLogin.body.user?.role}`);
    const adminToken = adminLogin.body.token;

    const hodLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'hod.it@attendance.com', password: 'Hod@123' }),
    });
    assert(hodLogin.status === 200 && hodLogin.body.user?.role === 'hod', 'HOD Authentication', `Department: ${hodLogin.body.user?.department}`);
    const hodToken = hodLogin.body.token;

    const teacherLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'teacher@attendance.com', password: 'Teacher@123' }),
    });
    assert(teacherLogin.status === 200 && teacherLogin.body.user?.role === 'teacher', 'Teacher Authentication', `Teacher: ${teacherLogin.body.user?.name}`);
    const teacherToken = teacherLogin.body.token;

    const student1Login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'STU1001', password: 'Student@123' }),
    });
    assert(student1Login.status === 200 && student1Login.body.user?.role === 'student', 'Student 1 Authentication', `Student: ${student1Login.body.user?.name} (STU1001)`);
    const student1Token = student1Login.body.token;
    const student1Id = student1Login.body.user?._id;

    const student2Login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'STU1002', password: 'Student@123' }),
    });
    assert(student2Login.status === 200 && student2Login.body.user?.role === 'student', 'Student 2 Authentication', `Student: ${student2Login.body.user?.name} (STU1002)`);
    const student2Token = student2Login.body.token;

    // 3. Admin Dashboard & Master Data Endpoints
    const adminDash = await request('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDash.status === 200 && adminDash.body.data?.totalStudents > 0, 'Admin Dashboard Stats', `Total Students: ${adminDash.body.data?.totalStudents}, Avg Attendance: ${adminDash.body.data?.averageAttendance}%`);

    const programs = await request('/api/programs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(programs.status === 200 && programs.body.data?.length > 0, 'Admin Programs List', `Total Programs: ${programs.body.data?.length}`);

    // 4. HOD Scoped Dashboard & Defaulters
    const hodDash = await request('/api/hod/dashboard-stats', {
      headers: { Authorization: `Bearer ${hodToken}` },
    });
    assert(hodDash.status === 200 && hodDash.body.data?.totalStudents > 0, 'HOD Department Dashboard', `Dept: ${hodLogin.body.user?.department}, Students: ${hodDash.body.data?.totalStudents}`);

    const hodDefaulters = await request('/api/hod/defaulters', {
      headers: { Authorization: `Bearer ${hodToken}` },
    });
    assert(hodDefaulters.status === 200, 'HOD Defaulters Analysis', `Defaulters Count: ${hodDefaulters.body.count || hodDefaulters.body.data?.length || 0}`);

    // 5. Teacher Dashboard & Assigned Subjects
    const teacherDash = await request('/api/teacher/dashboard-stats', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert(teacherDash.status === 200 && teacherDash.body.data?.assignedSubjectsCount > 0, 'Teacher Dashboard Overview', `Assigned Subjects: ${teacherDash.body.data?.assignedSubjectsCount}, Conducted: ${teacherDash.body.data?.totalClassesConducted}`);

    const teacherSubjects = await request('/api/teacher/subjects', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert(teacherSubjects.status === 200 && teacherSubjects.body.data?.length > 0, 'Teacher Assigned Subjects', `Subjects: ${teacherSubjects.body.data?.map(s => s.subjectCode).join(', ')}`);
    const assignedSubject = teacherSubjects.body.data[0];

    // 6. Student Dashboard & 75% Formula Validation
    const studentDash = await request(`/api/attendance/student/${student1Id}/summary`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const sData = studentDash.body.data;
    const computedPercentage = Math.round((sData.presentClasses / (sData.totalClasses || 1)) * 1000) / 10;
    assert(
      studentDash.status === 200 && Math.abs(sData.attendancePercentage - computedPercentage) <= 0.1,
      'Student Dashboard & Percentage Formula Verification',
      `Classes: ${sData.totalClasses}, Attended: ${sData.presentClasses}, Reported: ${sData.attendancePercentage}%, Computed: ${computedPercentage}%`
    );

    // 7. Student Timetable & Notifications
    const studentTimetable = await request('/api/timetable/student', {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentTimetable.status === 200 && studentTimetable.body.data?.weeklySchedule, 'Student Timetable Retrieval', `Current Day Slots: ${studentTimetable.body.data?.todaySchedule?.length || 0}`);

    const notifications = await request('/api/notifications', {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(notifications.status === 200, 'Student Notifications List', `Total Notifications: ${notifications.body.data?.length || 0}, Unread: ${notifications.body.unreadCount}`);

    // 8. Timetable Collision Detection
    const collisionTest = await request('/api/timetable', {
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
    assert(collisionTest.status === 400 && collisionTest.body.message?.includes('collision'), 'Timetable Collision Prevention Guard', `Status: 400, Collision Message: "${collisionTest.body.message}"`);

    // ==================================================================
    // STEP 5: SMART ATTENDANCE RADAR WORKFLOW & LIVE SOCKET.IO TEST
    // ==================================================================
    console.log('\n--- TESTING SMART ATTENDANCE RADAR & REAL-TIME SOCKET.IO ---');

    // Setup Socket.IO Client for Teacher
    let teacherSocketEventReceived = null;
    let teacherSocketPromise = null;

    const teacherSocket = ioClient(BASE_URL, {
      transports: ['websocket', 'polling'],
      forceNew: true,
    });

    await new Promise((resolve) => {
      teacherSocket.on('connect', () => {
        resolve();
      });
    });
    assert(teacherSocket.connected, 'Teacher Socket.IO Connection Established', `Socket ID: ${teacherSocket.id}`);

    // Teacher Starts Radar Session
    const uniqueSlot = `Lecture-Radar-${Date.now()}`;
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
        classroomLocation: {
          latitude: 19.0760,
          longitude: 72.8777,
          radiusMeters: 100,
        },
      }),
    });

    assert(
      startRadarRes.status === 201 || (startRadarRes.status === 200 && startRadarRes.body.data),
      'Teacher Starts Radar Session',
      `Session Code: ${startRadarRes.body.data.sessionCode}, Status: ${startRadarRes.body.data.status}`
    );

    const sessionId = startRadarRes.body.data._id;
    const sessionCode = startRadarRes.body.data.sessionCode;

    // Teacher Socket joins radar room
    teacherSocket.emit('join_radar_session', {
      sessionId,
      role: 'teacher',
      userName: teacherLogin.body.user.name,
    });

    teacherSocketPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for live attendance Socket.IO event'));
      }, 7000);

      teacherSocket.on('attendance_marked_live', (data) => {
        clearTimeout(timeout);
        teacherSocketEventReceived = data;
        resolve(data);
      });
    });

    // Student 1 checks active radar session
    const studentActiveRes = await request('/api/radar/session/active', {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentActiveRes.status === 200 && studentActiveRes.body.hasActiveSession && studentActiveRes.body.data.sessionCode === sessionCode,
      'Student Detects Active Radar Session',
      `Found Session Code: ${studentActiveRes.body.data.sessionCode}, Subject: ${studentActiveRes.body.data.subjectName}`
    );

    // Student 1 Marks Attendance (Simulating coordinates within geofence)
    const student1MarkRes = await request('/api/radar/session/mark', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: JSON.stringify({
        sessionCode,
        latitude: 19.07605, // ~5 meters away
        longitude: 72.87772,
        deviceInfo: 'Mozilla/5.0 ClassMate Test Client',
      }),
    });

    assert(
      student1MarkRes.status === 200 && student1MarkRes.body.data?.status === 'Present',
      'Student 1 Marks Attendance Successfully',
      `Message: "${student1MarkRes.body.message}", Verification: ${student1MarkRes.body.data?.verificationMethod}`
    );

    // Verify Teacher received live Socket.IO update without polling
    const liveSocketEvent = await teacherSocketPromise;
    assert(
      liveSocketEvent && liveSocketEvent.studentId === 'STU1001',
      'Teacher Received Real-Time Socket.IO Live Update',
      `Live Student: ${liveSocketEvent.studentName}, Status: ${liveSocketEvent.status}, Time: ${liveSocketEvent.markedAt}`
    );

    // Student 1 attempts Duplicate Submission
    const duplicateRes = await request('/api/radar/session/mark', {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: JSON.stringify({
        sessionCode,
        latitude: 19.07605,
        longitude: 72.87772,
      }),
    });
    assert(
      duplicateRes.status === 200 && duplicateRes.body.alreadyMarked === true,
      'Duplicate Submission Prevented',
      `Response: alreadyMarked=${duplicateRes.body.alreadyMarked}, Message: "${duplicateRes.body.message}"`
    );

    // Test Concurrent Submissions (Student 2 marks while Student 1 re-attempts concurrently)
    const [concurrent1, concurrent2] = await Promise.all([
      request('/api/radar/session/mark', {
        method: 'POST',
        headers: { Authorization: `Bearer ${student2Token}` },
        body: JSON.stringify({
          sessionCode,
          latitude: 19.0761,
          longitude: 72.8778,
          deviceInfo: 'Concurrent Test Client 2',
        }),
      }),
      request('/api/radar/session/mark', {
        method: 'POST',
        headers: { Authorization: `Bearer ${student1Token}` },
        body: JSON.stringify({ sessionCode }),
      }),
    ]);

    assert(
      concurrent1.status === 200 && concurrent1.body.data?.status === 'Present',
      'Concurrent Submission: Student 2 Marked Cleanly',
      `Status: Present, Verification: ${concurrent1.body.data?.verificationMethod}`
    );
    assert(
      concurrent2.status === 200 && concurrent2.body.alreadyMarked === true,
      'Concurrent Submission: Student 1 Duplicate Blocked Safely'
    );

    // Teacher inspects Live Session Roster
    const liveRoster = await request(`/api/radar/session/${sessionId}/live`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert(
      liveRoster.status === 200 && liveRoster.body.data?.counters?.presentCount >= 2,
      'Teacher Inspects Live Roster & Counters',
      `Present: ${liveRoster.body.data?.counters?.presentCount}, Absent: ${liveRoster.body.data?.counters?.absentCount}, Total: ${liveRoster.body.data?.counters?.totalStudents}`
    );

    // Teacher Manual Override / Review Correction
    const overrideRes = await request(`/api/radar/session/${sessionId}/attendee/STU1002`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: JSON.stringify({
        status: 'Requires Review',
        reviewRemarks: 'Teacher noted intermittent Wi-Fi connection during lecture',
      }),
    });
    assert(
      overrideRes.status === 200 && overrideRes.body.data?.status === 'Requires Review',
      'Teacher Manual Override / Correction',
      `Updated STU1002 Status: ${overrideRes.body.data?.status}, Method: ${overrideRes.body.data?.verificationMethod}`
    );

    // Revert to Present before final submit
    await request(`/api/radar/session/${sessionId}/attendee/STU1002`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: JSON.stringify({ status: 'Present' }),
    });

    // Final Attendance Submission & Institutional Lock
    const finalSubmitRes = await request(`/api/radar/session/${sessionId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert(
      finalSubmitRes.status === 200 && finalSubmitRes.body.data?.isFinalSubmitted === true,
      'Final Attendance Submitted & Database Records Committed',
      `Status: ${finalSubmitRes.body.message}, Final Locked: ${finalSubmitRes.body.data?.isFinalSubmitted}`
    );

    // Re-submission rejection check
    const reSubmitRes = await request(`/api/radar/session/${sessionId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert(
      reSubmitRes.status === 400,
      'Accidental Re-submission Blocked by Institutional Lock',
      `Status: 400, Message: "${reSubmitRes.body.message}"`
    );

    // Verify Notification Delivered to Student
    const studentNotifs = await request('/api/notifications', {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const latestNotif = studentNotifs.body.data?.[0];
    assert(
      studentNotifs.status === 200 && latestNotif,
      'Database-Backed Notification Delivered to Student',
      `Title: "${latestNotif?.title}", Message: "${latestNotif?.message}"`
    );

    // Clean up Socket.IO
    teacherSocket.disconnect();

  } catch (err) {
    console.error('Unexpected error during verification:', err);
    failed++;
  }

  console.log('\n======================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
};

runVerification();
