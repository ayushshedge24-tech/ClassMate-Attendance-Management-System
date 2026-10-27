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

const runSecurityTests = async () => {
  console.log('===============================================================');
  console.log(' VERIFYING SECURITY PATCHES & ACCESS CONTROL FIXES');
  console.log('===============================================================\n');

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
    // 1. Unauthenticated Registration Prevention
    const unauthReg = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Attacker Admin',
        email: 'attacker@evil.com',
        password: 'password123',
        role: 'admin',
      }),
    });
    assert(
      unauthReg.status === 401,
      'Unauthenticated Admin/Teacher Registration Blocked',
      `Status: ${unauthReg.status} (Expected 401 Unauthorized)`
    );

    // Login authentic users
    const teacherLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'teacher@attendance.com', password: 'Teacher@123' }),
    });
    const teacherToken = teacherLogin.body.token;

    const student1Login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'STU1001', password: 'Student@123' }),
    });
    const student1Token = student1Login.body.token;

    const student2Login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'STU1002', password: 'Student@123' }),
    });
    const student2Token = student2Login.body.token;

    // 2. Teacher BOLA/IDOR Prevention on Subject Deletion
    const subjectsRes = await request('/api/subjects', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    const sampleSubject = subjectsRes.body.data[0];
    const teacherDelSubject = await request(`/api/subjects/${sampleSubject._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert(
      teacherDelSubject.status === 403,
      'Teacher Subject Deletion Blocked (Least Privilege)',
      `Status: ${teacherDelSubject.status} (Expected 403 Forbidden)`
    );

    // 3. Notification IDOR Prevention (Student 2 trying to mark Student 1 notification as read)
    const student1Notifs = await request('/api/notifications', {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    if (student1Notifs.body.data?.length > 0) {
      const targetNotifId = student1Notifs.body.data[0]._id;
      const idorNotifAttempt = await request(`/api/notifications/${targetNotifId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${student2Token}` }, // Student 2 attempting to mark Student 1's notification
      });
      assert(
        idorNotifAttempt.status === 403,
        'Notification IDOR Protection (Cross-User Read Prevention)',
        `Status: ${idorNotifAttempt.status} (Expected 403 Forbidden)`
      );
    }

  } catch (err) {
    console.error('Security test failure:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`SECURITY PATCH VERIFICATION: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) process.exit(1);
};

runSecurityTests();
