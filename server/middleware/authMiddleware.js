const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'college_attendance_jwt_secret_key_2025_mini_project_secure');

    // Check if token belongs to an Admin/Teacher or a Student
    if (decoded.role === 'student') {
      const student = await Student.findById(decoded.id).select('-password');
      if (!student) {
        return res.status(401).json({
          success: false,
          message: 'Student account not found.',
        });
      }
      req.user = student;
      req.userRole = 'student';
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User account not found.',
        });
      }
      req.user = user;
      req.userRole = user.role; // 'admin' or 'teacher'
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired. Please login again.',
    });
  }
};

module.exports = { protect };
