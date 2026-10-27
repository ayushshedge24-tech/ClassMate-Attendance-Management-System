const express = require('express');
const router = express.Router();
const {
  startRadarSession,
  getActiveSessionForStudent,
  markAttendanceByStudent,
  getLiveSessionDetails,
  updateAttendeeManual,
  submitFinalAttendance,
} = require('../controllers/radarController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Teacher / Admin Radar session controls
router.post('/session/start', protect, authorize('teacher', 'admin'), startRadarSession);
router.get('/session/:sessionId/live', protect, authorize('teacher', 'admin', 'hod'), getLiveSessionDetails);
router.put('/session/:sessionId/attendee/:studentId', protect, authorize('teacher', 'admin'), updateAttendeeManual);
router.post('/session/:sessionId/submit', protect, authorize('teacher', 'admin'), submitFinalAttendance);

// Student Radar endpoints
router.get('/session/active', protect, authorize('student'), getActiveSessionForStudent);
router.post('/session/mark', protect, authorize('student'), markAttendanceByStudent);

module.exports = router;
