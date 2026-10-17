const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Get all students with filtering, search, and sorting
// @route   GET /api/students
// @access  Private (Admin / Teacher)
const getStudents = async (req, res, next) => {
  try {
    const { search, semester, division, course } = req.query;

    const query = {};

    if (semester) {
      query.semester = Number(semester);
    }

    if (division) {
      query.division = division.toUpperCase().trim();
    }

    if (course) {
      query.course = course;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
      ];
      if (!isNaN(Number(search))) {
        query.$or.push({ rollNumber: Number(search) });
      }
    }

    const students = await Student.find(query)
      .sort({ semester: 1, division: 1, rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private (Admin / Teacher / Student for self)
const getStudentById = async (req, res, next) => {
  try {
    // If student is viewing, they can only view their own profile
    if (req.userRole === 'student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this student profile',
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin / Teacher)
const createStudent = async (req, res, next) => {
  try {
    const {
      studentId,
      name,
      email,
      phone,
      course,
      semester,
      division,
      rollNumber,
      password,
    } = req.body;

    // Check required fields
    if (!studentId || !name || !email || !semester || !division || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (studentId, name, email, semester, division, rollNumber)',
      });
    }

    // Check duplicate studentId
    const existingId = await Student.findOne({ studentId: studentId.toUpperCase().trim() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Student with ID '${studentId}' already exists`,
      });
    }

    // Check duplicate email
    const existingEmail = await Student.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Student with email '${email}' already exists`,
      });
    }

    const student = await Student.create({
      studentId: studentId.toUpperCase().trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      course: course || 'B.Tech Computer Science',
      semester: Number(semester),
      division: division.toUpperCase().trim(),
      rollNumber: Number(rollNumber),
      password: password || 'Student@123',
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin / Teacher)
const updateStudent = async (req, res, next) => {
  try {
    const {
      studentId,
      name,
      email,
      phone,
      course,
      semester,
      division,
      rollNumber,
      password,
    } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check uniqueness if updating studentId
    if (studentId && studentId.toUpperCase().trim() !== student.studentId) {
      const existingId = await Student.findOne({
        studentId: studentId.toUpperCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: `Student with ID '${studentId}' already exists`,
        });
      }
      student.studentId = studentId.toUpperCase().trim();
    }

    // Check uniqueness if updating email
    if (email && email.toLowerCase().trim() !== student.email) {
      const existingEmail = await Student.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: `Student with email '${email}' already exists`,
        });
      }
      student.email = email.toLowerCase().trim();
    }

    if (name) student.name = name.trim();
    if (phone !== undefined) student.phone = phone.trim();
    if (course) student.course = course.trim();
    if (semester) student.semester = Number(semester);
    if (division) student.division = division.toUpperCase().trim();
    if (rollNumber) student.rollNumber = Number(rollNumber);
    if (password) student.password = password; // pre-save will rehash

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student & safely delete related attendance records
// @route   DELETE /api/students/:id
// @access  Private (Admin / Teacher)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Delete associated attendance records safely
    const attendanceResult = await Attendance.deleteMany({ student: student._id });

    // Delete student
    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: `Student '${student.name}' and ${attendanceResult.deletedCount} associated attendance records deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
