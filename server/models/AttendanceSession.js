const mongoose = require('mongoose');

const attendeeSubSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    rollNumber: {
      type: Number,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Requires Review'],
      default: 'Present',
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    verificationMethod: {
      type: String,
      enum: [
        'radar_smart',
        'geolocation_verified',
        'network_verified',
        'teacher_manual',
        'not_marked',
      ],
      default: 'radar_smart',
    },
    distanceMeters: {
      type: Number,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    deviceInfo: {
      type: String,
      default: '',
    },
    manuallyEdited: {
      type: Boolean,
      default: false,
    },
    reviewRemarks: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const attendanceSessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    sessionToken: {
      type: String,
      required: true,
    },
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
    department: {
      type: String,
      required: true,
      trim: true,
      default: 'Information Technology',
    },
    course: {
      type: String,
      required: true,
      trim: true,
      default: 'B.Tech Information Technology',
    },
    semester: {
      type: Number,
      required: true,
    },
    division: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    classroom: {
      type: String,
      default: 'Lecture Hall 101',
      trim: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    sessionSlot: {
      type: String,
      default: 'Lecture 1',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    closedAt: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      default: 15,
    },
    verificationMethod: {
      type: String,
      enum: ['radar_smart', 'location_geofence', 'manual_only'],
      default: 'radar_smart',
    },
    classroomLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      radiusMeters: { type: Number, default: 100 },
    },
    attendees: [attendeeSubSchema],
    isFinalSubmitted: {
      type: Boolean,
      default: false,
    },
    finalSubmittedAt: {
      type: Date,
    },
    finalSubmittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSessionSchema.index({ status: 1, course: 1, semester: 1, division: 1 });
attendanceSessionSchema.index({ teacher: 1, date: 1, status: 1 });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

module.exports = AttendanceSession;
