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

// Student list & create: restricted to admin, hod, teacher
router.route('/')
  .get(protect, authorize('admin', 'hod', 'teacher'), getStudents)
  .post(protect, authorize('admin', 'hod'), createStudent);

// Student get by id: student can get self, staff can get any
router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorize('admin', 'hod'), updateStudent)
  .delete(protect, authorize('admin', 'hod'), deleteStudent);

module.exports = router;
