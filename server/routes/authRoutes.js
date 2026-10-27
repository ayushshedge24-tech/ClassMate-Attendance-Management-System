const express = require('express');
const router = express.Router();
const { login, register, getMe, getTeachers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createRateLimiter } = require('../middleware/rateLimiter');

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

router.post('/login', loginLimiter, login);
router.post('/register', protect, authorize('admin'), register);
router.get('/me', protect, getMe);
router.get('/teachers', protect, authorize('admin', 'hod', 'teacher'), getTeachers);

module.exports = router;
