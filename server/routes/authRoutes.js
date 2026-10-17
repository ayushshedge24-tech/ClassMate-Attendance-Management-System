const express = require('express');
const router = express.Router();
const { login, register, getMe, getTeachers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.get('/teachers', protect, authorize('admin', 'teacher'), getTeachers);

module.exports = router;
