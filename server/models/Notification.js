const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientModel',
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ['User', 'Student'],
      default: 'User',
    },
    recipientRole: {
      type: String,
      enum: ['student', 'teacher', 'hod', 'admin'],
      default: 'student',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'radar_session_started',
        'attendance_marked',
        'attendance_corrected',
        'shortage_warning',
        'system_alert',
      ],
      default: 'attendance_marked',
    },
    metadata: {
      sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession' },
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      subjectCode: { type: String, default: '' },
      subjectName: { type: String, default: '' },
      date: { type: String, default: '' },
      sessionSlot: { type: String, default: '' },
      status: { type: String, default: '' },
      previousStatus: { type: String, default: '' },
      reason: { type: String, default: '' },
      teacherName: { type: String, default: '' },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
