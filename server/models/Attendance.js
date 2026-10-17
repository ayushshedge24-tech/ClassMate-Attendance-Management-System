const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent'],
        message: '{VALUE} is not a valid attendance status (must be Present or Absent)',
      },
      default: 'Present',
      required: true,
    },
    session: {
      type: String,
      trim: true,
      default: 'Lecture 1',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher/Admin who marked attendance is required'],
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for student + subject + date + session
attendanceSchema.index({ student: 1, subject: 1, date: 1, session: 1 }, { unique: true });

// Performance indexes for querying attendance history and reports
attendanceSchema.index({ subject: 1, date: -1 });
attendanceSchema.index({ student: 1, date: -1 });
attendanceSchema.index({ date: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
