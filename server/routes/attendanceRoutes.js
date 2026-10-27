const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getStudentAttendance,
  getStudentSummary,
  getStudentMonthly,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Specific student attendance summary, monthly breakdown & history
router.get('/student/:studentId/summary', protect, getStudentSummary);
router.get('/student/:studentId/monthly', protect, getStudentMonthly);
router.get('/student/:studentId', protect, getStudentAttendance);

// General attendance records & marking
router.route('/')
  .get(protect, authorize('admin', 'hod', 'teacher'), getAttendanceRecords)
  .post(protect, authorize('admin', 'hod', 'teacher'), markAttendance);

router.route('/:id')
  .get(protect, authorize('admin', 'hod', 'teacher'), getAttendanceById)
  .put(protect, authorize('admin', 'hod', 'teacher'), updateAttendance)
  .delete(protect, authorize('admin', 'hod', 'teacher'), deleteAttendance);

module.exports = router;
