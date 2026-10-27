const TeacherAssignment = require('../models/TeacherAssignment');
const User = require('../models/User');
const Subject = require('../models/Subject');

// @desc    Get all teacher assignments
// @route   GET /api/assignments
// @access  Private (Admin, HOD, Teacher)
const getAssignments = async (req, res, next) => {
  try {
    const { teacher, subject, program, division, academicYear } = req.query;
    const query = {};

    if (teacher) query.teacher = teacher;
    if (subject) query.subject = subject;
    if (program) query.program = program;
    if (division) query.division = division.toUpperCase().trim();
    if (academicYear) query.academicYear = academicYear;

    // If teacher role, only show their assignments
    if (req.userRole === 'teacher') {
      query.teacher = req.user._id;
    }

    const assignments = await TeacherAssignment.find(query)
      .populate('teacher', 'name email department phone')
      .populate('subject', 'subjectCode subjectName semester department')
      .sort({ semester: 1, division: 1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new teacher assignment
// @route   POST /api/assignments
// @access  Private (Admin / HOD)
const createAssignment = async (req, res, next) => {
  try {
    const { teacher, subject, program, semester, division, academicYear } = req.body;

    if (!teacher || !subject || !semester || !division) {
      return res.status(400).json({
        success: false,
        message: 'Teacher, subject, semester, and division are required',
      });
    }

    const teacherObj = await User.findById(teacher);
    if (!teacherObj) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const subjectObj = await Subject.findById(subject);
    if (!subjectObj) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Check if already assigned
    const existing = await TeacherAssignment.findOne({
      teacher,
      subject,
      division: division.toUpperCase().trim(),
      academicYear: academicYear || '2026-2027',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This teacher is already assigned to this subject and division for this academic year',
      });
    }

    const assignment = await TeacherAssignment.create({
      teacher,
      subject,
      program: program || subjectObj.program || 'B.Sc. IT',
      semester: Number(semester),
      division: division.toUpperCase().trim(),
      academicYear: academicYear || '2026-2027',
    });

    // Also update Subject.teacher if null
    if (!subjectObj.teacher) {
      subjectObj.teacher = teacher;
      await subjectObj.save();
    }

    const populated = await TeacherAssignment.findById(assignment._id)
      .populate('teacher', 'name email department')
      .populate('subject', 'subjectCode subjectName semester');

    res.status(201).json({
      success: true,
      message: 'Teacher assigned successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Admin / HOD)
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await TeacherAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Teacher assignment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  deleteAssignment,
};
