const mongoose = require('mongoose');

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher reference is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    program: {
      type: String,
      default: 'B.Sc. IT',
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
    },
    division: {
      type: String,
      required: [true, 'Division is required'],
      uppercase: true,
      default: 'A',
      trim: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

teacherAssignmentSchema.index({ teacher: 1, subject: 1, division: 1, academicYear: 1 }, { unique: true });

const TeacherAssignment = mongoose.model('TeacherAssignment', teacherAssignmentSchema);

module.exports = TeacherAssignment;
