const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getSubjects)
  .post(protect, authorize('admin', 'hod'), createSubject);

router.route('/:id')
  .get(protect, getSubjectById)
  .put(protect, authorize('admin', 'hod'), updateSubject)
  .delete(protect, authorize('admin', 'hod'), deleteSubject);

module.exports = router;
