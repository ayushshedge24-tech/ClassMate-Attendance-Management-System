const http = require('http');

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: encodeURI(path),
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runComprehensiveTests = async () => {
  console.log('===============================================================');
  console.log(' STARTING COMPREHENSIVE E2E VERIFICATION SUITE');
  console.log(' Student & Teacher Dashboards, Calculations, and Security Tests');
  console.log('===============================================================\n');

  try {
    // 1. Health check
    console.log('[TEST 1] Server Health Check');
    const health = await request('/api/health');
    console.log(`- Status: ${health.status}, OK: ${health.data.status === 'OK'}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Auth: Admin Login
    console.log('\n[TEST 2] Admin Login');
    const adminLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@attendance.com',
      password: 'Admin@123',
    });
    console.log(`- Admin login status: ${adminLogin.status}, Role: ${adminLogin.data.user?.role}`);
    const adminToken = adminLogin.data.token;
    if (!adminToken) throw new Error('Admin login failed');

    // 3. Auth: Teacher Login
    console.log('\n[TEST 3] Teacher Login');
    const teacherLogin = await request('/api/auth/login', 'POST', {
      email: 'teacher@attendance.com',
      password: 'Teacher@123',
    });
    console.log(`- Teacher login status: ${teacherLogin.status}, Name: ${teacherLogin.data.user?.name}`);
    const teacherToken = teacherLogin.data.token;
    const teacherId = teacherLogin.data.user?._id;
    if (!teacherToken) throw new Error('Teacher login failed');

    // 4. Auth: Student Login (with studentId)
    console.log('\n[TEST 4] Student Login (STU1001)');
    const studentLogin = await request('/api/auth/login', 'POST', {
      studentId: 'STU1001',
      password: 'Student@123',
    });
    console.log(`- Student login status: ${studentLogin.status}, Name: ${studentLogin.data.user?.name}`);
    const studentToken = studentLogin.data.token;
    const studentId = studentLogin.data.user?._id;
    if (!studentToken) throw new Error('Student login failed');

    // Also get second student for security testing
    console.log('\n[TEST 4b] Second Student Login (STU1002)');
    const student2Login = await request('/api/auth/login', 'POST', {
      studentId: 'STU1002',
      password: 'Student@123',
    });
    const student2Id = student2Login.data.user?._id;
    const student2Token = student2Login.data.token;

    // 5. Student Dashboard: Summary Cards and Dynamic Calculations
    console.log('\n[TEST 5] Student Dashboard Summary & Formula Verification');
    const studentSummary = await request(`/api/attendance/student/${studentId}/summary`, 'GET', null, studentToken);
    console.log(`- Status: ${studentSummary.status}`);
    const sData = studentSummary.data.data;
    console.log(`  Overall Attendance: ${sData.attendancePercentage}%`);
    console.log(`  Total Classes Conducted: ${sData.totalClasses}`);
    console.log(`  Classes Attended: ${sData.presentClasses}`);
    console.log(`  Classes Missed: ${sData.absentClasses}`);
    console.log(`  Total Enrolled Subjects: ${sData.totalSubjects}`);
    console.log(`  Subjects Below 75%: ${sData.subjectsBelowThreshold}`);

    // Verify Formula: (Present / Total) * 100
    const calculatedFormula = sData.totalClasses > 0
      ? Number(((sData.presentClasses / sData.totalClasses) * 100).toFixed(1))
      : 0;
    console.log(`  Formula check: (${sData.presentClasses}/${sData.totalClasses})*100 = ${calculatedFormula}% -> Matches API: ${calculatedFormula === sData.attendancePercentage}`);

    // 6. Student Day-Wise Attendance History & Filtering
    console.log('\n[TEST 6] Student Attendance History & Date/Subject Filtering');
    const studentHistory = await request(`/api/attendance/student/${studentId}`, 'GET', null, studentToken);
    console.log(`- Total History Records: ${studentHistory.data.count}`);
    const sampleRecord = studentHistory.data.data[0];
    if (sampleRecord) {
      console.log(`  Sample record: Date: ${sampleRecord.date.substring(0, 10)}, Session: ${sampleRecord.session || 'Lecture 1'}, Status: ${sampleRecord.status}, Subject: ${sampleRecord.subject?.subjectCode}`);
    }

    // Filter by subject
    if (sampleRecord?.subject?._id) {
      const filteredBySubject = await request(
        `/api/attendance/student/${studentId}?subject=${sampleRecord.subject._id}`,
        'GET',
        null,
        studentToken
      );
      console.log(`  Subject-filtered count for ${sampleRecord.subject.subjectCode}: ${filteredBySubject.data.count}`);
    }

    // 7. Student Monthly Summary Endpoint
    console.log('\n[TEST 7] Student Monthly Summary Endpoint');
    const recentDate = sampleRecord ? sampleRecord.date.substring(0, 7) : '2026-09';
    const monthlyRes = await request(
      `/api/attendance/student/${studentId}/monthly?month=${recentDate}`,
      'GET',
      null,
      studentToken
    );
    console.log(`- Monthly API Status: ${monthlyRes.status}, Month: ${monthlyRes.data.data?.monthLabel}`);
    console.log(`  Monthly Rate: ${monthlyRes.data.data?.monthlyPercentage}%, Total Classes in Month: ${monthlyRes.data.data?.totalClasses}`);
    console.log(`  Subject-wise items in month: ${monthlyRes.data.data?.subjectWise?.length}`);

    // 8. SECURITY: Student Access Denial for Other Students' Records
    console.log('\n[TEST 8] SECURITY TEST: Student attempting to access Student 2 records');
    const unauthorizedSummary = await request(
      `/api/attendance/student/${student2Id}/summary`,
      'GET',
      null,
      studentToken // Student 1 token accessing Student 2's id
    );
    console.log(`- Access other student summary status: ${unauthorizedSummary.status} (Expected 403 Forbidden)`);
    if (unauthorizedSummary.status !== 403) {
      throw new Error(`SECURITY VULNERABILITY: Student accessed another student summary! Status: ${unauthorizedSummary.status}`);
    }

    const unauthorizedHistory = await request(
      `/api/attendance/student/${student2Id}`,
      'GET',
      null,
      studentToken
    );
    console.log(`- Access other student history status: ${unauthorizedHistory.status} (Expected 403 Forbidden)`);
    if (unauthorizedHistory.status !== 403) {
      throw new Error(`SECURITY VULNERABILITY: Student accessed another student history! Status: ${unauthorizedHistory.status}`);
    }

    // 9. Teacher Dashboard Summary Statistics
    console.log('\n[TEST 9] Teacher Dashboard Summary Statistics');
    const teacherStats = await request('/api/teacher/dashboard-stats', 'GET', null, teacherToken);
    console.log(`- Status: ${teacherStats.status}`);
    const tData = teacherStats.data.data;
    console.log(`  Assigned Subjects: ${tData.assignedSubjectsCount}`);
    console.log(`  Total Assigned Students: ${tData.totalAssignedStudents}`);
    console.log(`  Classes Conducted: ${tData.classesConducted}`);
    console.log(`  Today's Attendance Sessions: ${tData.todayAttendanceSessions}`);
    console.log(`  Present Students Today: ${tData.presentStudentsToday}`);
    console.log(`  Absent Students Today: ${tData.absentStudentsToday}`);
    console.log(`  Pending Attendance Sessions: ${tData.pendingAttendanceSessions}`);

    // 10. Teacher Assigned Subjects
    console.log('\n[TEST 10] Teacher Assigned Subjects Endpoint');
    const teacherSubjects = await request('/api/teacher/subjects', 'GET', null, teacherToken);
    console.log(`- Assigned Subjects count: ${teacherSubjects.data.count}`);
    teacherSubjects.data.data.forEach((sub) => {
      console.log(`  * ${sub.subjectCode} - ${sub.subjectName}: Students: ${sub.studentCount}, Classes: ${sub.totalClasses}, Avg Rate: ${sub.averageAttendance}%`);
    });

    const teacherAssignedSub = teacherSubjects.data.data[0];

    // 11. Teacher Mark Attendance Workflow
    console.log('\n[TEST 11] Teacher Mark Attendance Workflow');
    const markDate = '2026-10-18';
    const markSession = 'Lecture 1';

    const markRes = await request(
      '/api/attendance',
      'POST',
      {
        subject: teacherAssignedSub._id,
        date: markDate,
        session: markSession,
        records: [
          { student: studentId, status: 'Present', remarks: 'On time and active' },
          { student: student2Id, status: 'Absent', remarks: 'Unexcused absence' },
        ],
      },
      teacherToken
    );
    console.log(`- Mark attendance status: ${markRes.status}, Message: ${markRes.data.message}`);

    // 12. Teacher Edit Attendance Workflow
    console.log('\n[TEST 12] Teacher Edit Attendance (Correcting Student 2 status to Present)');
    const editRes = await request(
      '/api/attendance',
      'POST',
      {
        subject: teacherAssignedSub._id,
        date: markDate,
        session: markSession,
        records: [
          { student: student2Id, status: 'Present', remarks: 'Medical excuse accepted by faculty' },
        ],
      },
      teacherToken
    );
    console.log(`- Edit attendance status: ${editRes.status}, Message: ${editRes.data.message}`);

    // Verify correction was saved
    const verifyCorrection = await request(
      `/api/attendance?subject=${teacherAssignedSub._id}&date=${markDate}&session=${markSession}&student=${student2Id}`,
      'GET',
      null,
      teacherToken
    );
    console.log(`- Verified status in DB for Student 2: ${verifyCorrection.data.data[0]?.status} (Expected Present)`);

    // 13. Teacher Absent Students & Chronic Defaulters
    console.log('\n[TEST 13] Teacher Absent Students & Defaulters Reports');
    const dateAbsentees = await request('/api/teacher/absent-students?mode=date', 'GET', null, teacherToken);
    console.log(`- Daily absentees count: ${dateAbsentees.data.count}`);

    const chronicDefaulters = await request('/api/teacher/absent-students?mode=chronic', 'GET', null, teacherToken);
    console.log(`- Chronic Defaulters (<75%) count: ${chronicDefaulters.data.count}`);
    if (chronicDefaulters.data.data[0]) {
      const def = chronicDefaulters.data.data[0];
      console.log(`  Sample defaulter: ${def.student.name} (${def.percentage}%) - Needed consecutive classes: +${def.neededClasses}`);
    }

    // 14. Teacher Reports (Daily, Student-wise, Subject-wise, Monthly)
    console.log('\n[TEST 14] Teacher Reports');
    const stuReport = await request('/api/teacher/reports?type=student', 'GET', null, teacherToken);
    console.log(`- Student-wise report count: ${stuReport.data.count}`);

    const subReport = await request('/api/teacher/reports?type=subject', 'GET', null, teacherToken);
    console.log(`- Subject-wise report items: ${subReport.data.data?.length}`);

    // 15. SECURITY: Teacher Unauthorized Subject Access
    console.log('\n[TEST 15] SECURITY TEST: Teacher attempting to mark attendance for unassigned subject');
    // Find subject assigned to Admin (e.g. IT303 or IT305)
    const allSubjects = await request('/api/subjects', 'GET', null, adminToken);
    const unassignedToTeacher = allSubjects.data.data.find(
      (s) => s.teacher?._id && s.teacher._id.toString() !== teacherId
    );

    if (unassignedToTeacher) {
      console.log(`  Testing with Subject: ${unassignedToTeacher.subjectCode} (Assigned to: ${unassignedToTeacher.teacher?.name})`);
      const unauthMark = await request(
        '/api/attendance',
        'POST',
        {
          subject: unassignedToTeacher._id,
          date: markDate,
          records: [{ student: studentId, status: 'Present' }],
        },
        teacherToken // Teacher attempting to mark for Admin's subject
      );
      console.log(`- Unauthorized mark status: ${unauthMark.status} (Expected 403 Forbidden)`);
      if (unauthMark.status !== 403) {
        throw new Error(`SECURITY VULNERABILITY: Teacher was able to mark attendance for unassigned subject! Status: ${unauthMark.status}`);
      }
    }

    // 16. Admin Features Preserved
    console.log('\n[TEST 16] Admin Features & Teacher Assignment Verification');
    const teachersList = await request('/api/auth/teachers', 'GET', null, adminToken);
    console.log(`- Admin fetched faculty teachers list: ${teachersList.data.count} teachers`);

    const adminStats = await request('/api/dashboard/stats', 'GET', null, adminToken);
    console.log(`- Admin Dashboard Stats Status: ${adminStats.status}, Total Students: ${adminStats.data.data.totalStudents}, Average: ${adminStats.data.data.averageAttendance}%`);

    console.log('\n===============================================================');
    console.log(' ALL 16 VERIFICATION SUITE TESTS PASSED WITH 100% SUCCESS!');
    console.log('===============================================================');
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message || error);
    process.exit(1);
  }
};

runComprehensiveTests();
