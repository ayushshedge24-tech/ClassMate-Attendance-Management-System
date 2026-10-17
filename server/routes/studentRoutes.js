const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Student list & create: restricted to admin/teacher
router.route('/')
  .get(protect, authorize('admin', 'teacher'), getStudents)
  .post(protect, authorize('admin', 'teacher'), createStudent);

// Student get by id: student can get self, admin/teacher can get any
router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorize('admin', 'teacher'), updateStudent)
  .delete(protect, authorize('admin', 'teacher'), deleteStudent);

module.exports = router;
