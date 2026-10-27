const express = require('express');
const router = express.Router();
const {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getDepartments,
  createDepartment,
} = require('../controllers/programController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/departments/all', protect, getDepartments);
router.post('/departments', protect, authorize('admin'), createDepartment);

router.route('/')
  .get(protect, getPrograms)
  .post(protect, authorize('admin'), createProgram);

router.route('/:id')
  .get(protect, getProgramById)
  .put(protect, authorize('admin'), updateProgram)
  .delete(protect, authorize('admin'), deleteProgram);

module.exports = router;
