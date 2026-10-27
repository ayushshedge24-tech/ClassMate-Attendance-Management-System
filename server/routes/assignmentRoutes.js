const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('admin', 'hod'), createAssignment);

router.route('/:id')
  .delete(authorize('admin', 'hod'), deleteAssignment);

module.exports = router;
