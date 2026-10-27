const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      default: 'Information Technology',
    },
    course: {
      type: String,
      required: [true, 'Course / Program name is required'],
      trim: true,
      default: 'B.Tech Information Technology',
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    division: {
      type: String,
      required: [true, 'Division is required'],
      uppercase: true,
      trim: true,
      default: 'A',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher reference is required'],
    },
    classroom: {
      type: String,
      required: [true, 'Classroom designation is required'],
      trim: true,
      default: 'Lecture Hall 101',
    },
    dayOfWeek: {
      type: String,
      required: [true, 'Day of week is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g., 09:00)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g., 10:00)'],
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ['Theory', 'Practical', 'Tutorial'],
      default: 'Theory',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and conflict prevention
timetableSchema.index(
  { course: 1, semester: 1, division: 1, dayOfWeek: 1, startTime: 1, academicYear: 1 },
  { name: 'class_slot_unique' }
);
timetableSchema.index({ teacher: 1, dayOfWeek: 1, startTime: 1 });
timetableSchema.index({ classroom: 1, dayOfWeek: 1, startTime: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
