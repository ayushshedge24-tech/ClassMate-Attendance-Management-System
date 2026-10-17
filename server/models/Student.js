const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Please provide student ID (e.g., STU101)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide student email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    course: {
      type: String,
      required: [true, 'Please provide course (e.g., B.Tech Computer Science)'],
      trim: true,
      default: 'B.Tech Computer Science',
    },
    semester: {
      type: Number,
      required: [true, 'Please provide semester'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
    },
    division: {
      type: String,
      required: [true, 'Please provide division (e.g., A, B, C)'],
      uppercase: true,
      trim: true,
      default: 'A',
    },
    rollNumber: {
      type: Number,
      required: [true, 'Please provide roll number'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      default: 'Student@123',
      select: false,
    },
    role: {
      type: String,
      default: 'student',
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for semester, division, rollNumber
studentSchema.index({ semester: 1, division: 1, rollNumber: 1 });

// Pre-save hook to hash password if modified
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
