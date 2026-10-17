const express = require('express');
const router = express.Router();
const {
  getTeacherDashboardStats,
  getTeacherSubjects,
  getTeacherStudents,
  getTeacherAbsentStudents,
  getTeacherReports,
} = require('../controllers/teacherController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All teacher routes are protected and restricted to teachers and administrators
router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/dashboard-stats', getTeacherDashboardStats);
router.get('/subjects', getTeacherSubjects);
router.get('/students', getTeacherStudents);
router.get('/absent-students', getTeacherAbsentStudents);
router.get('/reports', getTeacherReports);

module.exports = router;
