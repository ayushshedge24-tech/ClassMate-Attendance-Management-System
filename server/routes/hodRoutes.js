const express = require('express');
const router = express.Router();
const {
  getHodDashboardStats,
  getHodStudents,
  getHodTeachers,
  getHodSubjects,
  getHodDefaulters,
  getHodReports,
} = require('../controllers/hodController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All HOD routes require authentication and HOD or Admin role
router.use(protect);
router.use(authorize('hod', 'admin'));

router.get('/dashboard-stats', getHodDashboardStats);
router.get('/students', getHodStudents);
router.get('/teachers', getHodTeachers);
router.get('/subjects', getHodSubjects);
router.get('/defaulters', getHodDefaulters);
router.get('/reports', getHodReports);

module.exports = router;
