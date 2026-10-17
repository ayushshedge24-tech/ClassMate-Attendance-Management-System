const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const { normalizeDate } = require('../services/attendanceService');

// @desc    Get top-level dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Teacher / Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    // Today's boundaries
    const today = new Date();
    const todayStart = normalizeDate(today);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayRecords = await Attendance.find({
      date: { $gte: todayStart, $lt: todayEnd },
    });

    const presentToday = todayRecords.filter((r) => r.status === 'Present').length;
    const absentToday = todayRecords.filter((r) => r.status === 'Absent').length;
    const todayAttendanceTotal = todayRecords.length;

    // Overall Average Attendance
    const allRecords = await Attendance.find().select('status');
    const totalAllRecords = allRecords.length;
    const totalPresent = allRecords.filter((r) => r.status === 'Present').length;
    const averageAttendance = totalAllRecords > 0
      ? Number(((totalPresent / totalAllRecords) * 100).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalSubjects,
        todayAttendanceTotal,
        presentToday,
        absentToday,
        averageAttendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart datasets for Admin/Teacher dashboard
// @route   GET /api/dashboard/attendance
// @access  Private (Teacher / Admin)
const getDashboardAttendanceCharts = async (req, res, next) => {
  try {
    // 1. Overall Present vs Absent
    const allRecords = await Attendance.find().select('status date subject');
    const totalPresent = allRecords.filter((r) => r.status === 'Present').length;
    const totalAbsent = allRecords.filter((r) => r.status === 'Absent').length;

    const presentVsAbsent = [
      { name: 'Present', value: totalPresent, color: '#10b981' },
      { name: 'Absent', value: totalAbsent, color: '#ef4444' },
    ];

    // 2. Attendance Overview (Last 7 distinct dates or 7 days)
    const distinctDates = await Attendance.distinct('date');
    distinctDates.sort((a, b) => new Date(a) - new Date(b));
    const recentDates = distinctDates.slice(-7);

    const overviewData = [];
    for (const d of recentDates) {
      const dayStart = new Date(d);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayRecords = await Attendance.find({
        date: { $gte: dayStart, $lt: dayEnd },
      });

      const dayPresent = dayRecords.filter((r) => r.status === 'Present').length;
      const dayAbsent = dayRecords.filter((r) => r.status === 'Absent').length;
      const dayTotal = dayRecords.length;
      const percentage = dayTotal > 0 ? Number(((dayPresent / dayTotal) * 100).toFixed(1)) : 0;

      const dateStr = new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      overviewData.push({
        date: dateStr,
        fullDate: d,
        present: dayPresent,
        absent: dayAbsent,
        total: dayTotal,
        percentage,
      });
    }

    // 3. Subject-wise attendance
    const subjects = await Subject.find().select('subjectCode subjectName');
    const subjectWiseData = [];

    for (const sub of subjects) {
      const subRecords = allRecords.filter(
        (r) => r.subject.toString() === sub._id.toString()
      );
      const subTotal = subRecords.length;
      const subPresent = subRecords.filter((r) => r.status === 'Present').length;
      const subAbsent = subRecords.filter((r) => r.status === 'Absent').length;
      const percentage = subTotal > 0 ? Number(((subPresent / subTotal) * 100).toFixed(1)) : 0;

      subjectWiseData.push({
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        totalClasses: subTotal,
        present: subPresent,
        absent: subAbsent,
        percentage,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        presentVsAbsent,
        overviewData,
        subjectWiseData,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDashboardAttendanceCharts,
};
