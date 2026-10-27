const express = require('express');
const router = express.Router();
const {
  getStudentTimetable,
  getTeacherTimetable,
  getTimetableEntries,
  createTimetableEntry,
  deleteTimetableEntry,
} = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/student', protect, authorize('student'), getStudentTimetable);
router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherTimetable);
router.get('/', protect, authorize('admin', 'hod', 'teacher'), getTimetableEntries);
router.post('/', protect, authorize('admin', 'hod'), createTimetableEntry);
router.delete('/:id', protect, authorize('admin', 'hod'), deleteTimetableEntry);

module.exports = router;
