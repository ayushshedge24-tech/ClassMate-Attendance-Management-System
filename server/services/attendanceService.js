const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');

// Normalize a date to UTC midnight to ensure consistent queries and unique constraint
const normalizeDate = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// Calculate summary stats for a student
const calculateStudentSummary = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  // Get all curriculum subjects for this student's semester
  const semesterSubjects = await Subject.find({ semester: student.semester })
    .populate('teacher', 'name email department')
    .sort({ subjectCode: 1 });

  // Get all attendance records for this student
  const records = await Attendance.find({ student: student._id })
    .populate({
      path: 'subject',
      select: 'subjectCode subjectName semester teacher',
      populate: {
        path: 'teacher',
        select: 'name email department',
      },
    })
    .populate('markedBy', 'name email')
    .sort({ date: -1, createdAt: -1 });

  const totalClasses = records.length;
  const presentClasses = records.filter((r) => r.status === 'Present').length;
  const absentClasses = records.filter((r) => r.status === 'Absent').length;
  const attendancePercentage = totalClasses > 0
    ? Number(((presentClasses / totalClasses) * 100).toFixed(1))
    : 0;

  // Initialize subject map with all enrolled semester subjects
  const subjectMap = {};
  semesterSubjects.forEach((sub) => {
    const subId = sub._id.toString();
    subjectMap[subId] = {
      subjectId: subId,
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      semester: sub.semester,
      teacher: sub.teacher ? {
        _id: sub.teacher._id,
        name: sub.teacher.name,
        email: sub.teacher.email,
        department: sub.teacher.department,
      } : null,
      totalClasses: 0,
      presentClasses: 0,
      absentClasses: 0,
      percentage: 0,
    };
  });

  // Accumulate attendance counts
  records.forEach((rec) => {
    if (!rec.subject) return;
    const subId = rec.subject._id.toString();

    if (!subjectMap[subId]) {
      subjectMap[subId] = {
        subjectId: subId,
        subjectCode: rec.subject.subjectCode,
        subjectName: rec.subject.subjectName,
        semester: rec.subject.semester,
        teacher: rec.subject.teacher ? {
          _id: rec.subject.teacher._id,
          name: rec.subject.teacher.name,
          email: rec.subject.teacher.email,
        } : null,
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
        percentage: 0,
      };
    }

    subjectMap[subId].totalClasses += 1;
    if (rec.status === 'Present') {
      subjectMap[subId].presentClasses += 1;
    } else {
      subjectMap[subId].absentClasses += 1;
    }
  });

  const subjectWise = Object.values(subjectMap).map((sub) => {
    sub.percentage = sub.totalClasses > 0
      ? Number(((sub.presentClasses / sub.totalClasses) * 100).toFixed(1))
      : 0;
    sub.isBelowThreshold = sub.totalClasses > 0 && sub.percentage < 75;
    return sub;
  });

  const totalSubjects = semesterSubjects.length || subjectWise.length;
  const subjectsBelowThreshold = subjectWise.filter((s) => s.isBelowThreshold).length;

  // Monthly breakdown for student chart & analytics
  const monthlyMap = {};
  records.forEach((rec) => {
    const recDate = new Date(rec.date);
    const monthKey = `${recDate.getUTCFullYear()}-${String(recDate.getUTCMonth() + 1).padStart(2, '0')}`;
    const monthLabel = recDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        monthKey,
        month: monthLabel,
        present: 0,
        absent: 0,
        total: 0,
        percentage: 0,
      };
    }
    monthlyMap[monthKey].total += 1;
    if (rec.status === 'Present') {
      monthlyMap[monthKey].present += 1;
    } else {
      monthlyMap[monthKey].absent += 1;
    }
  });

  const monthlyAttendance = Object.values(monthlyMap)
    .map((m) => {
      m.percentage = m.total > 0 ? Number(((m.present / m.total) * 100).toFixed(1)) : 0;
      return m;
    })
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  return {
    student: {
      _id: student._id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      course: student.course,
      semester: student.semester,
      division: student.division,
      rollNumber: student.rollNumber,
      phone: student.phone,
    },
    totalClasses,
    presentClasses,
    absentClasses,
    attendancePercentage,
    totalSubjects,
    subjectsBelowThreshold,
    subjectWise,
    monthlyAttendance,
    recentAttendance: records.slice(0, 10),
    enrolledSubjects: semesterSubjects,
  };
};

// Calculate monthly breakdown with subject-wise stats for a specific month
const calculateStudentMonthlyBreakdown = async (studentId, month) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  // month is formatted as YYYY-MM
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);

  const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNum, 1));

  const records = await Attendance.find({
    student: student._id,
    date: { $gte: startDate, $lt: endDate },
  })
    .populate('subject', 'subjectCode subjectName semester')
    .sort({ date: 1 });

  const totalClasses = records.length;
  const presentClasses = records.filter((r) => r.status === 'Present').length;
  const absentClasses = records.filter((r) => r.status === 'Absent').length;
  const monthlyPercentage = totalClasses > 0
    ? Number(((presentClasses / totalClasses) * 100).toFixed(1))
    : 0;

  // Subject-wise breakdown for this month
  const subjectMap = {};
  records.forEach((rec) => {
    if (!rec.subject) return;
    const subId = rec.subject._id.toString();

    if (!subjectMap[subId]) {
      subjectMap[subId] = {
        subjectId: subId,
        subjectCode: rec.subject.subjectCode,
        subjectName: rec.subject.subjectName,
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
        percentage: 0,
      };
    }

    subjectMap[subId].totalClasses += 1;
    if (rec.status === 'Present') {
      subjectMap[subId].presentClasses += 1;
    } else {
      subjectMap[subId].absentClasses += 1;
    }
  });

  const subjectWise = Object.values(subjectMap).map((sub) => {
    sub.percentage = sub.totalClasses > 0
      ? Number(((sub.presentClasses / sub.totalClasses) * 100).toFixed(1))
      : 0;
    return sub;
  });

  // Daily records for calendar/table view
  const dailyRecords = records.map((r) => ({
    _id: r._id,
    date: r.date,
    day: new Date(r.date).toLocaleDateString('en-US', { weekday: 'long' }),
    subjectCode: r.subject?.subjectCode,
    subjectName: r.subject?.subjectName,
    session: r.session || 'Lecture 1',
    status: r.status,
    remarks: r.remarks,
  }));

  return {
    month,
    monthLabel: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
    totalClasses,
    presentClasses,
    absentClasses,
    monthlyPercentage,
    subjectWise,
    dailyRecords,
  };
};

module.exports = {
  normalizeDate,
  calculateStudentSummary,
  calculateStudentMonthlyBreakdown,
};
