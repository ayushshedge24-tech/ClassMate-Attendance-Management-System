const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDashboardAttendanceCharts,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/stats', protect, authorize('admin', 'teacher'), getDashboardStats);
router.get('/attendance', protect, authorize('admin', 'teacher'), getDashboardAttendanceCharts);

module.exports = router;
