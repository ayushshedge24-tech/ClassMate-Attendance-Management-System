const Notification = require('../models/Notification');
const Student = require('../models/Student');

// @desc    Get user notifications with unread count
// @route   GET /api/notifications
// @access  Authenticated (Student, Teacher, HOD, Admin)
const getMyNotifications = async (req, res) => {
  try {
    const recipientIds = [req.user._id];

    // If user is student, also check student document ID
    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (student) {
        recipientIds.push(student._id);
      }
    }

    const notifications = await Notification.find({
      recipient: { $in: recipientIds },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: { $in: recipientIds },
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error('getMyNotifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Authenticated
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    // Authorization: Verify notification belongs to the calling user
    const recipientIds = [req.user._id.toString()];
    if (req.userRole === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (student) recipientIds.push(student._id.toString());
    }

    if (!recipientIds.includes(notification.recipient.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update another user\'s notification.',
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked as read.', data: notification });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Authenticated
const markAllAsRead = async (req, res) => {
  try {
    const recipientIds = [req.user._id];
    if (req.user.role === 'student') {
      const student = await Student.findOne({ email: req.user.email });
      if (student) recipientIds.push(student._id);
    }

    await Notification.updateMany(
      { recipient: { $in: recipientIds }, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
