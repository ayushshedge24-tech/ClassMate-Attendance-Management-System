const crypto = require('crypto');
const AttendanceSession = require('../models/AttendanceSession');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const TeacherAssignment = require('../models/TeacherAssignment');
const Notification = require('../models/Notification');
const { emitToSession, emitToUser } = require('../socket');

// Helper to compute Haversine distance in meters
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// @desc    Start a new Smart Attendance Radar session
// @route   POST /api/radar/session/start
// @access  Teacher, Admin
const startRadarSession = async (req, res) => {
  try {
    const {
      subjectId,
      course,
      semester,
      division,
      classroom,
      sessionSlot,
      durationMinutes = 15,
      verificationMethod = 'radar_smart',
      classroomLocation,
    } = req.body;

    if (!subjectId || !semester || !division) {
      return res.status(400).json({
        success: false,
        message: 'Subject, semester, and division are required to start Radar session.',
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Role verification: If teacher, ensure assigned
    if (req.user.role === 'teacher') {
      const isAssigned = await TeacherAssignment.findOne({
        teacher: req.user._id,
        subject: subjectId,
        semester: Number(semester),
        division: division.toUpperCase(),
      });
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to teach this subject and division.',
        });
      }
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const normalizedSlot = sessionSlot || 'Lecture 1';

    // Prevent duplicate active session for same class
    const existingActive = await AttendanceSession.findOne({
      subject: subjectId,
      semester: Number(semester),
      division: division.toUpperCase(),
      date: todayStr,
      sessionSlot: normalizedSlot,
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email');

    if (existingActive) {
      return res.status(200).json({
        success: true,
        message: 'An active Radar session is already running for this lecture.',
        data: existingActive,
        isExisting: true,
      });
    }

    // Pre-fetch all enrolled students to populate baseline roster
    const studentQuery = {
      semester: Number(semester),
      division: division.toUpperCase(),
    };
    if (course) {
      studentQuery.course = course;
    }

    const enrolledStudents = await Student.find(studentQuery).sort({ rollNumber: 1 });

    const initialAttendees = enrolledStudents.map((st) => ({
      student: st._id,
      studentId: st.studentId,
      rollNumber: st.rollNumber,
      studentName: st.name,
      status: 'Absent', // default absent until student marks or teacher updates
      markedAt: null,
      verificationMethod: 'not_marked',
      distanceMeters: null,
      ipAddress: '',
      deviceInfo: '',
      manuallyEdited: false,
      reviewRemarks: '',
    }));

    // Generate random 6-character session code (e.g. RAD-7294)
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const sessionCode = `RAD-${randomHex}`;
    const sessionToken = crypto.randomBytes(16).toString('hex');

    const duration = Math.min(60, Math.max(5, Number(durationMinutes) || 15));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000);

    const session = await AttendanceSession.create({
      sessionCode,
      sessionToken,
      teacher: req.user._id,
      subject: subjectId,
      department: subject.department || 'Information Technology',
      course: course || 'B.Tech Information Technology',
      semester: Number(semester),
      division: division.toUpperCase(),
      classroom: classroom || 'Lecture Hall 101',
      date: todayStr,
      sessionSlot: normalizedSlot,
      status: 'active',
      startedAt: now,
      expiresAt,
      durationMinutes: duration,
      verificationMethod,
      classroomLocation: classroomLocation || { latitude: null, longitude: null, radiusMeters: 100 },
      attendees: initialAttendees,
      isFinalSubmitted: false,
    });

    const populatedSession = await AttendanceSession.findById(session._id)
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email');

    res.status(201).json({
      success: true,
      message: `Smart Attendance Radar active! Session Code: ${sessionCode}`,
      data: populatedSession,
    });
  } catch (error) {
    console.error('startRadarSession error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error starting radar.' });
  }
};

// @desc    Get active radar session for an authenticated student
// @route   GET /api/radar/session/active
// @access  Student
const getActiveSessionForStudent = async (req, res) => {
  try {
    let student = null;
    if (req.user.role === 'student') {
      student = await Student.findOne({ email: req.user.email });
      if (!student && req.user.studentId) {
        student = await Student.findOne({ studentId: req.user.studentId });
      }
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Find active session matching student's semester & division
    const activeSession = await AttendanceSession.findOne({
      semester: student.semester,
      division: student.division,
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email');

    if (!activeSession) {
      return res.status(200).json({
        success: true,
        hasActiveSession: false,
        message: 'No active Radar attendance session right now.',
      });
    }

    // Check if student has already marked attendance
    const attendeeRecord = activeSession.attendees.find(
      (a) => a.student.toString() === student._id.toString()
    );

    const alreadyMarked =
      attendeeRecord && attendeeRecord.verificationMethod !== 'not_marked' && attendeeRecord.status === 'Present';

    res.status(200).json({
      success: true,
      hasActiveSession: true,
      alreadyMarked: !!alreadyMarked,
      data: {
        sessionId: activeSession._id,
        sessionCode: activeSession.sessionCode,
        subjectName: activeSession.subject?.subjectName,
        subjectCode: activeSession.subject?.subjectCode,
        teacherName: activeSession.teacher?.name,
        classroom: activeSession.classroom,
        date: activeSession.date,
        sessionSlot: activeSession.sessionSlot,
        expiresAt: activeSession.expiresAt,
        status: activeSession.status,
        attendeeStatus: attendeeRecord ? attendeeRecord.status : 'Absent',
        verificationMethod: attendeeRecord ? attendeeRecord.verificationMethod : 'not_marked',
        markedAt: attendeeRecord ? attendeeRecord.markedAt : null,
      },
    });
  } catch (error) {
    console.error('getActiveSessionForStudent error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Student marks attendance in active Radar session
// @route   POST /api/radar/session/mark
// @access  Student
const markAttendanceByStudent = async (req, res) => {
  try {
    const { sessionCode, latitude, longitude, deviceInfo } = req.body;

    if (!sessionCode) {
      return res.status(400).json({
        success: false,
        message: 'Session Code is required to mark attendance.',
      });
    }

    // Identify student
    let student = await Student.findOne({ email: req.user.email });
    if (!student && req.user.studentId) {
      student = await Student.findOne({ studentId: req.user.studentId });
    }

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Only registered students can mark attendance via radar.',
      });
    }

    // Find active session by code
    const session = await AttendanceSession.findOne({
      sessionCode: sessionCode.toUpperCase().trim(),
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).populate('subject', 'subjectName subjectCode');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active Radar session not found or session has expired.',
      });
    }

    // Verify student belongs to session's semester & division
    if (session.semester !== student.semester || session.division !== student.division) {
      return res.status(403).json({
        success: false,
        message: `You are enrolled in Sem ${student.semester} Div ${student.division}. This radar is for Sem ${session.semester} Div ${session.division}.`,
      });
    }

    // Check if student is in attendees list
    let attendeeIndex = session.attendees.findIndex(
      (a) => a.student.toString() === student._id.toString()
    );

    // Duplicate check
    if (
      attendeeIndex !== -1 &&
      session.attendees[attendeeIndex].verificationMethod !== 'not_marked' &&
      session.attendees[attendeeIndex].status === 'Present'
    ) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        message: 'Your attendance has already been marked.',
        data: {
          status: 'Present',
          subjectName: session.subject?.subjectName,
          date: session.date,
          sessionSlot: session.sessionSlot,
          markedAt: session.attendees[attendeeIndex].markedAt,
        },
      });
    }

    // Coordinate range validation & Geolocation verification logic
    let hasCoords = false;
    let numLat = null;
    let numLon = null;
    if (
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null &&
      latitude !== '' &&
      longitude !== ''
    ) {
      numLat = Number(latitude);
      numLon = Number(longitude);
      if (!isNaN(numLat) && !isNaN(numLon) && numLat >= -90 && numLat <= 90 && numLon >= -180 && numLon <= 180) {
        hasCoords = true;
      }
    }

    // Geofence strict enforcement: if session configured with 'location_geofence'
    if (session.verificationMethod === 'location_geofence') {
      if (!hasCoords) {
        return res.status(400).json({
          success: false,
          message: 'Geofence verification requires GPS location permission. Please enable location on your device.',
        });
      }

      if (session.classroomLocation?.latitude && session.classroomLocation?.longitude) {
        const dist = calculateDistanceMeters(
          session.classroomLocation.latitude,
          session.classroomLocation.longitude,
          numLat,
          numLon
        );
        const maxRadius = session.classroomLocation.radiusMeters || 100;
        if (dist !== null && dist > maxRadius) {
          return res.status(400).json({
            success: false,
            message: `Location verification failed: You are ${dist}m away from the classroom (maximum allowed radius: ${maxRadius}m).`,
            distanceMeters: dist,
            maxRadius,
          });
        }
      }
    }

    let verificationMethod = 'radar_smart';
    let distanceMeters = null;
    let attendeeStatus = 'Present';
    let reviewRemarks = '';

    if (session.classroomLocation?.latitude && session.classroomLocation?.longitude && hasCoords) {
      distanceMeters = calculateDistanceMeters(
        session.classroomLocation.latitude,
        session.classroomLocation.longitude,
        numLat,
        numLon
      );
      const allowedRadius = session.classroomLocation.radiusMeters || 100;
      if (distanceMeters !== null && distanceMeters <= allowedRadius) {
        verificationMethod = 'geolocation_verified';
      } else if (distanceMeters !== null && distanceMeters > allowedRadius) {
        verificationMethod = 'radar_smart';
        attendeeStatus = 'Requires Review';
        reviewRemarks = `Location outside classroom radius (${distanceMeters}m > ${allowedRadius}m)`;
      }
    } else if (hasCoords) {
      verificationMethod = 'geolocation_verified';
    } else {
      verificationMethod = 'network_verified';
    }

    const now = new Date();
    const updatedAttendee = {
      student: student._id,
      studentId: student.studentId,
      rollNumber: student.rollNumber,
      studentName: student.name,
      status: attendeeStatus,
      markedAt: now,
      verificationMethod,
      distanceMeters,
      ipAddress: req.ip || '',
      deviceInfo: deviceInfo || req.headers['user-agent'] || 'Web Browser',
      manuallyEdited: false,
      reviewRemarks,
    };

    if (attendeeIndex !== -1) {
      session.attendees[attendeeIndex] = updatedAttendee;
    } else {
      session.attendees.push(updatedAttendee);
    }

    await session.save();

    // Create database-backed student notification
    await Notification.create({
      recipient: req.user._id,
      recipientModel: 'User',
      recipientRole: 'student',
      title: 'Attendance Marked Successfully',
      message: `You were marked Present in ${session.subject?.subjectName} (${session.sessionSlot}) via Smart Radar.`,
      type: 'attendance_marked',
      metadata: {
        sessionId: session._id,
        subjectId: session.subject?._id,
        subjectCode: session.subject?.subjectCode,
        subjectName: session.subject?.subjectName,
        date: session.date,
        sessionSlot: session.sessionSlot,
        status: 'Present',
      },
    });

    // Real-time Socket.IO emission to Teacher room
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    emitToSession(session._id, 'attendance_marked_live', {
      studentId: student.studentId,
      rollNumber: student.rollNumber,
      studentName: student.name,
      status: 'Present',
      markedAt: now,
      verificationMethod,
      activityMessage: `${student.name} marked attendance at ${timeStr}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Your Attendance Has Been Marked Successfully!',
      data: {
        status: 'Present',
        subjectName: session.subject?.subjectName,
        date: session.date,
        sessionSlot: session.sessionSlot,
        markedAt: now,
        verificationMethod,
      },
    });
  } catch (error) {
    console.error('markAttendanceByStudent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error marking attendance.' });
  }
};

// @desc    Get live session roster and counters for Teacher
// @route   GET /api/radar/session/:sessionId/live
// @access  Teacher, Admin, HOD
const getLiveSessionDetails = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId)
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Role-based session ownership checks
    if (req.userRole === 'teacher' && session.teacher?._id && session.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view another teacher\'s radar session.',
      });
    }
    if (req.userRole === 'hod' && session.department && session.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view radar sessions outside your department.',
      });
    }

    // Calculate real-time summary counters
    const totalStudents = session.attendees.length;
    const presentCount = session.attendees.filter((a) => a.status === 'Present').length;
    const absentCount = session.attendees.filter((a) => a.status === 'Absent').length;
    const requiresReviewCount = session.attendees.filter((a) => a.status === 'Requires Review').length;
    const attendanceMarked = session.attendees.filter(
      (a) => a.verificationMethod !== 'not_marked'
    ).length;
    const notMarked = totalStudents - attendanceMarked;

    res.status(200).json({
      success: true,
      data: {
        session,
        counters: {
          totalStudents,
          attendanceMarked,
          notMarked,
          presentCount,
          absentCount,
          requiresReviewCount,
        },
      },
    });
  } catch (error) {
    console.error('getLiveSessionDetails error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Teacher manually overrides/corrects an attendee's status
// @route   PUT /api/radar/session/:sessionId/attendee/:studentId
// @access  Teacher, Admin
const updateAttendeeManual = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;
    const session = await AttendanceSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Role-based session ownership: Teachers can only edit their own sessions
    if (req.userRole === 'teacher' && session.teacher && session.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify another teacher\'s radar session.',
      });
    }

    if (session.isFinalSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'This session has already been finalized and locked.',
      });
    }

    const attendee = session.attendees.find(
      (a) => a.student.toString() === req.params.studentId || a.studentId === req.params.studentId
    );

    if (!attendee) {
      return res.status(404).json({ success: false, message: 'Student attendee not found in session roster.' });
    }

    attendee.status = status;
    attendee.manuallyEdited = true;
    attendee.verificationMethod = 'teacher_manual';
    attendee.markedAt = attendee.markedAt || new Date();
    if (reviewRemarks !== undefined) {
      attendee.reviewRemarks = reviewRemarks;
    }

    await session.save();

    // Emit live update over socket
    emitToSession(session._id, 'attendee_status_updated', {
      studentId: attendee.studentId,
      status: attendee.status,
      manuallyEdited: true,
      reviewRemarks: attendee.reviewRemarks,
    });

    res.status(200).json({
      success: true,
      message: `Updated status for ${attendee.studentName} to ${status}.`,
      data: attendee,
    });
  } catch (error) {
    console.error('updateAttendeeManual error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Final submit and persist attendance records to database
// @route   POST /api/radar/session/:sessionId/submit
// @access  Teacher, Admin
const submitFinalAttendance = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId).populate('subject');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Role-based session ownership: Teachers can only submit their own sessions
    if (req.userRole === 'teacher' && session.teacher && session.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit another teacher\'s radar session.',
      });
    }

    if (session.isFinalSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'This attendance session has already been submitted and finalized.',
      });
    }

    // Persist all attendees into official Attendance collection
    const attendanceDate = new Date(session.date);
    const notificationsToCreate = [];

    for (const attendee of session.attendees) {
      const targetStatus = attendee.status === 'Present' ? 'Present' : 'Absent';

      // Find or create attendance record in DB (check student + subject + date)
      let existingRecord = await Attendance.findOne({
        student: attendee.student,
        subject: session.subject._id,
        date: attendanceDate,
      });

      if (existingRecord) {
        if (existingRecord.status !== targetStatus) {
          existingRecord.editHistory.push({
            editedBy: req.user._id,
            editedAt: new Date(),
            previousStatus: existingRecord.status,
            newStatus: targetStatus,
            previousRemarks: existingRecord.remarks || '',
            newRemarks: `Finalized via Radar session ${session.sessionCode}`,
            reason: 'Submitted via Smart Attendance Radar',
          });
          existingRecord.status = targetStatus;
          existingRecord.session = session.sessionSlot;
          existingRecord.remarks = `Finalized via Radar (${session.sessionCode})`;
          await existingRecord.save();
        }
      } else {
        try {
          await Attendance.create({
            student: attendee.student,
            subject: session.subject._id,
            date: attendanceDate,
            session: session.sessionSlot,
            status: targetStatus,
            markedBy: req.user._id,
            remarks: `Recorded via Smart Attendance Radar (${session.sessionCode})`,
          });
        } catch (createErr) {
          if (createErr.code === 11000) {
            // Concurrency safe fallback: update the record that was concurrently inserted
            await Attendance.findOneAndUpdate(
              { student: attendee.student, subject: session.subject._id, date: attendanceDate },
              { $set: { status: targetStatus, session: session.sessionSlot } }
            );
          } else {
            throw createErr;
          }
        }
      }

      // Prepare student notification
      notificationsToCreate.push({
        recipient: attendee.student,
        recipientModel: 'Student',
        recipientRole: 'student',
        title: `Attendance Confirmed: ${targetStatus}`,
        message: `Your final attendance for ${session.subject.subjectName} (${session.sessionSlot}) on ${session.date} has been confirmed as ${targetStatus}.`,
        type: 'attendance_marked',
        metadata: {
          sessionId: session._id,
          subjectId: session.subject._id,
          subjectCode: session.subject.subjectCode,
          subjectName: session.subject.subjectName,
          date: session.date,
          sessionSlot: session.sessionSlot,
          status: targetStatus,
          teacherName: req.user.name,
        },
      });
    }

    // Bulk create notifications safely
    if (notificationsToCreate.length > 0) {
      try {
        await Notification.insertMany(notificationsToCreate);
      } catch (notifErr) {
        console.warn('Non-blocking notification insert warning:', notifErr.message);
      }
    }

    // Lock session
    session.status = 'completed';
    session.isFinalSubmitted = true;
    session.finalSubmittedAt = new Date();
    session.finalSubmittedBy = req.user._id;
    session.closedAt = new Date();
    await session.save();

    // Real-time broadcast
    emitToSession(session._id, 'session_finalized', {
      sessionId: session._id,
      sessionCode: session.sessionCode,
      message: 'Attendance session successfully submitted and locked.',
    });

    res.status(200).json({
      success: true,
      message: `Final attendance successfully recorded in database for ${session.attendees.length} students.`,
      data: session,
    });
  } catch (error) {
    console.error('submitFinalAttendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startRadarSession,
  getActiveSessionForStudent,
  markAttendanceByStudent,
  getLiveSessionDetails,
  updateAttendeeManual,
  submitFinalAttendance,
};
