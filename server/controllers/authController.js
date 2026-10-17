const User = require('../models/User');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token (supports Admin, Teacher, and Student)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, studentId, password, role } = req.body;

    if ((!email && !studentId) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/student ID and password',
      });
    }

    const identifier = (email || studentId).trim();

    // 1. If explicit role is 'student' or identifier looks like a student ID (e.g., STU...)
    let student = null;
    let user = null;

    if (role === 'student') {
      student = await Student.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { studentId: identifier.toUpperCase() },
        ],
      }).select('+password');
    } else if (role === 'admin' || role === 'teacher') {
      user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
    } else {
      // Auto-detect: first check User table, then check Student table
      user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
      if (!user) {
        student = await Student.findOne({
          $or: [
            { email: identifier.toLowerCase() },
            { studentId: identifier.toUpperCase() },
          ],
        }).select('+password');
      }
    }

    // Process User login (Admin or Teacher)
    if (user) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Password does not match.',
        });
      }

      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
        },
      });
    }

    // Process Student login
    if (student) {
      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Password does not match.',
        });
      }

      const token = generateToken(student._id, 'student');

      return res.status(200).json({
        success: true,
        token,
        user: {
          _id: student._id,
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          role: 'student',
          course: student.course,
          semester: student.semester,
          division: student.division,
          rollNumber: student.rollNumber,
          phone: student.phone,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Account not found with provided credentials.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Admin/Teacher
// @route   POST /api/auth/register
// @access  Public / Admin
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'teacher',
      department: department || 'Information Technology',
      phone: phone || '',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user/student profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
      role: req.userRole,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculty teachers / admins for subject assignment
// @route   GET /api/auth/teachers
// @access  Private (Admin / Teacher)
const getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: { $in: ['teacher', 'admin'] } })
      .select('_id name email role department')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  getTeachers,
};
