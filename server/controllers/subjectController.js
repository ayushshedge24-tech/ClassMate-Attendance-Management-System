const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

// @desc    Get all subjects (optionally filtered by semester)
// @route   GET /api/subjects
// @access  Private (Admin / Teacher / Student)
const getSubjects = async (req, res, next) => {
  try {
    const { semester } = req.query;
    const query = {};

    if (semester) {
      query.semester = Number(semester);
    }

    const subjects = await Subject.find(query)
      .populate('teacher', 'name email department')
      .sort({ semester: 1, subjectCode: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject by ID
// @route   GET /api/subjects/:id
// @access  Private (Admin / Teacher / Student)
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate(
      'teacher',
      'name email department'
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin / Teacher)
const createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, semester, department, teacher } = req.body;

    if (!subjectCode || !subjectName || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject code, subject name, and semester',
      });
    }

    // Check duplicate subjectCode
    const existing = await Subject.findOne({
      subjectCode: subjectCode.toUpperCase().trim(),
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Subject with code '${subjectCode}' already exists`,
      });
    }

    const subject = await Subject.create({
      subjectCode: subjectCode.toUpperCase().trim(),
      subjectName: subjectName.trim(),
      semester: Number(semester),
      department: department || 'Information Technology',
      teacher: teacher || req.user._id,
    });

    const populatedSubject = await Subject.findById(subject._id).populate('teacher', 'name email');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: populatedSubject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin / Teacher)
const updateSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, semester, department, teacher } = req.body;

    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    if (subjectCode && subjectCode.toUpperCase().trim() !== subject.subjectCode) {
      const existing = await Subject.findOne({
        subjectCode: subjectCode.toUpperCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Subject with code '${subjectCode}' already exists`,
        });
      }
      subject.subjectCode = subjectCode.toUpperCase().trim();
    }

    if (subjectName) subject.subjectName = subjectName.trim();
    if (semester) subject.semester = Number(semester);
    if (department) subject.department = department.trim();
    if (teacher !== undefined) subject.teacher = teacher || null;

    await subject.save();

    const populatedSubject = await Subject.findById(subject._id).populate('teacher', 'name email');

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: populatedSubject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject & safely delete related attendance records
// @route   DELETE /api/subjects/:id
// @access  Private (Admin / Teacher)
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    const attendanceResult = await Attendance.deleteMany({ subject: subject._id });
    await subject.deleteOne();

    res.status(200).json({
      success: true,
      message: `Subject '${subject.subjectName}' and ${attendanceResult.deletedCount} related attendance records deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
