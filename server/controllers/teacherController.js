const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { normalizeDate } = require('../services/attendanceService');

// Helper to get assigned subject IDs for a user (teacher or admin)
const getTeacherSubjectIds = async (user) => {
  if (user.role === 'admin') {
    // If admin is inspecting teacher views, they can view all subjects or subjects assigned to admin
    const all = await Subject.find();
    return all.map((s) => s._id);
  }
  const assigned = await Subject.find({ teacher: user._id });
  return assigned.map((s) => s._id);
};

// @desc    Get dashboard summary statistics for logged-in teacher
// @route   GET /api/teacher/dashboard-stats
// @access  Private (Teacher / Admin)
const getTeacherDashboardStats = async (req, res, next) => {
  try {
    const isTeacher = req.userRole === 'teacher';
    const subjectQuery = isTeacher ? { teacher: req.user._id } : {};

    const assignedSubjects = await Subject.find(subjectQuery).populate('teacher', 'name email');
    const assignedSubjectIds = assignedSubjects.map((s) => s._id);

    // 1. Total Assigned Subjects
    const assignedSubjectsCount = assignedSubjects.length;

    // 2. Semesters of assigned subjects
    const semesters = [...new Set(assignedSubjects.map((s) => s.semester))];

    // 3. Total Assigned Students
    const totalAssignedStudents = semesters.length > 0
      ? await Student.countDocuments({ semester: { $in: semesters } })
      : 0;

    // 4. Classes Conducted (Distinct subject + date + session)
    const conductedCount = await Attendance.aggregate([
      { $match: { subject: { $in: assignedSubjectIds } } },
      {
        $group: {
          _id: {
            subject: '$subject',
            date: '$date',
            session: '$session',
          },
        },
      },
      { $count: 'total' },
    ]);
    const classesConducted = conductedCount[0]?.total || 0;

    // 5. Today's Statistics
    const today = new Date();
    const todayStart = normalizeDate(today);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayRecords = await Attendance.find({
      subject: { $in: assignedSubjectIds },
      date: { $gte: todayStart, $lt: todayEnd },
    }).populate('subject', 'subjectCode subjectName');

    const presentStudentsToday = todayRecords.filter((r) => r.status === 'Present').length;
    const absentStudentsToday = todayRecords.filter((r) => r.status === 'Absent').length;

    // Distinct sessions held today
    const todaySessionsSet = new Set();
    todayRecords.forEach((r) => {
      todaySessionsSet.add(`${r.subject?._id || r.subject}_${r.session || 'Lecture 1'}`);
    });
    const todayAttendanceSessions = todaySessionsSet.size;

    // 6. Pending Attendance Sessions Today
    // Assigned subjects that have NOT had attendance recorded today
    const markedSubjectIdsToday = new Set(
      todayRecords.map((r) => (r.subject?._id || r.subject).toString())
    );

    const pendingSubjects = assignedSubjects
      .filter((s) => !markedSubjectIdsToday.has(s._id.toString()))
      .map((s) => ({
        _id: s._id,
        subjectCode: s.subjectCode,
        subjectName: s.subjectName,
        semester: s.semester,
      }));

    const pendingAttendanceSessions = pendingSubjects.length;

    // 7. Recent Marked Sessions
    const recentDistinct = await Attendance.aggregate([
      { $match: { subject: { $in: assignedSubjectIds } } },
      {
        $group: {
          _id: {
            subject: '$subject',
            date: '$date',
            session: '$session',
          },
          totalStudents: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
          },
          lastMarked: { $max: '$updatedAt' },
        },
      },
      { $sort: { '_id.date': -1, lastMarked: -1 } },
      { $limit: 6 },
    ]);

    const populatedRecentSessions = [];
    for (const item of recentDistinct) {
      const sub = assignedSubjects.find((s) => s._id.toString() === item._id.subject.toString());
      if (sub) {
        const pct = item.totalStudents > 0
          ? Number(((item.presentCount / item.totalStudents) * 100).toFixed(1))
          : 0;
        populatedRecentSessions.push({
          subjectId: sub._id,
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
          semester: sub.semester,
          date: item._id.date,
          session: item._id.session || 'Lecture 1',
          totalStudents: item.totalStudents,
          presentCount: item.presentCount,
          absentCount: item.absentCount,
          percentage: pct,
        });
      }
    }

    // 8. Attendance Trend Over Time (Last 7 distinct instructional days for teacher's subjects)
    const distinctDates = await Attendance.distinct('date', {
      subject: { $in: assignedSubjectIds },
    });
    distinctDates.sort((a, b) => new Date(a) - new Date(b));
    const recentDates = distinctDates.slice(-7);

    const attendanceTrend = [];
    for (const d of recentDates) {
      const dayStart = new Date(d);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayRecords = await Attendance.find({
        subject: { $in: assignedSubjectIds },
        date: { $gte: dayStart, $lt: dayEnd },
      });

      const dayPresent = dayRecords.filter((r) => r.status === 'Present').length;
      const dayAbsent = dayRecords.filter((r) => r.status === 'Absent').length;
      const dayTotal = dayRecords.length;
      const percentage = dayTotal > 0 ? Number(((dayPresent / dayTotal) * 100).toFixed(1)) : 0;

      attendanceTrend.push({
        date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: d,
        present: dayPresent,
        absent: dayAbsent,
        total: dayTotal,
        percentage,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        assignedSubjectsCount,
        totalAssignedStudents,
        classesConducted,
        todayAttendanceSessions,
        presentStudentsToday,
        absentStudentsToday,
        pendingAttendanceSessions,
        pendingSubjects,
        recentSessions: populatedRecentSessions,
        attendanceTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assigned subjects for the teacher with student count, total classes, and avg attendance
// @route   GET /api/teacher/subjects
// @access  Private (Teacher / Admin)
const getTeacherSubjects = async (req, res, next) => {
  try {
    const isTeacher = req.userRole === 'teacher';
    const query = isTeacher ? { teacher: req.user._id } : {};

    const subjects = await Subject.find(query)
      .populate('teacher', 'name email department')
      .sort({ semester: 1, subjectCode: 1 });

    const todayStart = normalizeDate(new Date());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const subjectsData = [];

    for (const sub of subjects) {
      // 1. Enrolled student count for subject semester
      const studentCount = await Student.countDocuments({ semester: sub.semester });

      // 2. Attendance records for this subject
      const records = await Attendance.find({ subject: sub._id }).select('status date session');
      const totalRecords = records.length;
      const presentCount = records.filter((r) => r.status === 'Present').length;
      const absentCount = records.filter((r) => r.status === 'Absent').length;

      // 3. Distinct classes conducted
      const distinctSessions = new Set(
        records.map((r) => `${r.date.toISOString().substring(0, 10)}_${r.session || 'Lecture 1'}`)
      );
      const totalClasses = distinctSessions.size;

      // 4. Average Attendance % = (present / total) * 100
      const averageAttendance = totalRecords > 0
        ? Number(((presentCount / totalRecords) * 100).toFixed(1))
        : 0;

      // 5. Today's attendance status
      const todayCount = await Attendance.countDocuments({
        subject: sub._id,
        date: { $gte: todayStart, $lt: todayEnd },
      });

      subjectsData.push({
        _id: sub._id,
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        semester: sub.semester,
        department: sub.department,
        teacher: sub.teacher,
        studentCount,
        totalClasses,
        totalRecords,
        presentCount,
        absentCount,
        averageAttendance,
        markedToday: todayCount > 0,
      });
    }

    res.status(200).json({
      success: true,
      count: subjectsData.length,
      data: subjectsData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authorized students in teacher's assigned subjects with individual attendance statistics
// @route   GET /api/teacher/students
// @access  Private (Teacher / Admin)
const getTeacherStudents = async (req, res, next) => {
  try {
    const { semester, division, search, subjectId } = req.query;

    const isTeacher = req.userRole === 'teacher';
    const subQuery = isTeacher ? { teacher: req.user._id } : {};
    const teacherSubjects = await Subject.find(subQuery);
    const teacherSubjectIds = teacherSubjects.map((s) => s._id);

    const teacherSemesters = [...new Set(teacherSubjects.map((s) => s.semester))];

    // Build query for students
    const studentQuery = {};

    if (semester) {
      const semNum = Number(semester);
      if (isTeacher && !teacherSemesters.includes(semNum)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access students of this semester',
        });
      }
      studentQuery.semester = semNum;
    } else if (isTeacher) {
      studentQuery.semester = { $in: teacherSemesters };
    }

    if (division) {
      studentQuery.division = division.toUpperCase().trim();
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      studentQuery.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
      ];
      if (!isNaN(Number(search))) {
        studentQuery.$or.push({ rollNumber: Number(search) });
      }
    }

    const students = await Student.find(studentQuery)
      .sort({ semester: 1, division: 1, rollNumber: 1 });

    // Calculate attendance for each student across the teacher's subjects
    const relevantSubjectIds = subjectId
      ? [subjectId]
      : teacherSubjectIds;

    const attendanceRecords = await Attendance.find({
      student: { $in: students.map((s) => s._id) },
      subject: { $in: relevantSubjectIds },
    }).select('student subject status');

    const studentsWithStats = students.map((stu) => {
      const stuRecords = attendanceRecords.filter(
        (r) => r.student.toString() === stu._id.toString()
      );
      const totalClasses = stuRecords.length;
      const presentClasses = stuRecords.filter((r) => r.status === 'Present').length;
      const absentClasses = stuRecords.filter((r) => r.status === 'Absent').length;
      const percentage = totalClasses > 0
        ? Number(((presentClasses / totalClasses) * 100).toFixed(1))
        : 0;

      let status = 'Safe';
      if (totalClasses > 0) {
        if (percentage < 60) status = 'Critical';
        else if (percentage < 75) status = 'Warning';
      } else {
        status = 'No Records';
      }

      return {
        _id: stu._id,
        studentId: stu.studentId,
        name: stu.name,
        email: stu.email,
        phone: stu.phone,
        course: stu.course,
        semester: stu.semester,
        division: stu.division,
        rollNumber: stu.rollNumber,
        totalClasses,
        presentClasses,
        absentClasses,
        percentage,
        status,
      };
    });

    res.status(200).json({
      success: true,
      count: studentsWithStats.length,
      data: studentsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get absent students (for today, a specific date, or chronic defaulters < 75%)
// @route   GET /api/teacher/absent-students
// @access  Private (Teacher / Admin)
const getTeacherAbsentStudents = async (req, res, next) => {
  try {
    const { date, subject, mode = 'date' } = req.query;

    const isTeacher = req.userRole === 'teacher';
    const subQuery = isTeacher ? { teacher: req.user._id } : {};
    const teacherSubjects = await Subject.find(subQuery);
    const teacherSubjectIds = teacherSubjects.map((s) => s._id.toString());

    // 1. Mode: Chronic Shortage (<75% attendance)
    if (mode === 'chronic') {
      const teacherSemesters = [...new Set(teacherSubjects.map((s) => s.semester))];
      const students = await Student.find({ semester: { $in: teacherSemesters } })
        .sort({ semester: 1, division: 1, rollNumber: 1 });

      const allRecords = await Attendance.find({
        subject: { $in: teacherSubjectIds },
      }).populate('subject', 'subjectCode subjectName');

      const chronicStudents = [];

      students.forEach((stu) => {
        const stuRecords = allRecords.filter(
          (r) => r.student.toString() === stu._id.toString()
        );
        const total = stuRecords.length;
        if (total > 0) {
          const present = stuRecords.filter((r) => r.status === 'Present').length;
          const absent = stuRecords.filter((r) => r.status === 'Absent').length;
          const percentage = Number(((present / total) * 100).toFixed(1));

          if (percentage < 75) {
            // Calculate how many more classes needed to reach 75%:
            // (present + x) / (total + x) >= 0.75  =>  x >= (0.75*total - present) / 0.25
            const neededClasses = Math.max(0, Math.ceil((0.75 * total - present) / 0.25));

            chronicStudents.push({
              student: {
                _id: stu._id,
                name: stu.name,
                studentId: stu.studentId,
                rollNumber: stu.rollNumber,
                semester: stu.semester,
                division: stu.division,
                email: stu.email,
                phone: stu.phone,
              },
              totalClasses: total,
              presentClasses: present,
              absentClasses: absent,
              percentage,
              neededClasses,
              status: percentage < 60 ? 'Critical' : 'Warning',
            });
          }
        }
      });

      return res.status(200).json({
        success: true,
        mode: 'chronic',
        count: chronicStudents.length,
        data: chronicStudents,
      });
    }

    // 2. Mode: Date-wise Absent Students
    const queryDate = date ? normalizeDate(date) : normalizeDate(new Date());
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const recordQuery = {
      status: 'Absent',
      date: { $gte: queryDate, $lt: nextDay },
    };

    if (subject) {
      if (isTeacher && !teacherSubjectIds.includes(subject)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access absent records for this subject',
        });
      }
      recordQuery.subject = subject;
    } else {
      recordQuery.subject = { $in: teacherSubjectIds };
    }

    const absentRecords = await Attendance.find(recordQuery)
      .populate('student', 'name studentId rollNumber semester division email phone')
      .populate('subject', 'subjectCode subjectName semester')
      .populate('markedBy', 'name email')
      .sort({ 'student.rollNumber': 1 });

    res.status(200).json({
      success: true,
      mode: 'date',
      date: queryDate,
      count: absentRecords.length,
      data: absentRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate comprehensive teacher reports
// @route   GET /api/teacher/reports
// @access  Private (Teacher / Admin)
const getTeacherReports = async (req, res, next) => {
  try {
    const { type = 'student', subject, date, month, semester, division } = req.query;

    const isTeacher = req.userRole === 'teacher';
    const subQuery = isTeacher ? { teacher: req.user._id } : {};
    const teacherSubjects = await Subject.find(subQuery);
    const teacherSubjectIds = teacherSubjects.map((s) => s._id.toString());

    // 1. Subject-wise Report
    if (type === 'subject') {
      const subjectReport = [];

      for (const sub of teacherSubjects) {
        const records = await Attendance.find({ subject: sub._id });
        const total = records.length;
        const present = records.filter((r) => r.status === 'Present').length;
        const absent = records.filter((r) => r.status === 'Absent').length;
        const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

        const distinctSessions = new Set(
          records.map((r) => `${r.date.toISOString().substring(0, 10)}_${r.session || 'Lecture 1'}`)
        );

        subjectReport.push({
          subjectId: sub._id,
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
          semester: sub.semester,
          department: sub.department,
          totalLectures: distinctSessions.size,
          totalRecords: total,
          presentCount: present,
          absentCount: absent,
          averagePercentage: percentage,
        });
      }

      return res.status(200).json({
        success: true,
        type: 'subject',
        data: subjectReport,
      });
    }

    // 2. Daily Report
    if (type === 'daily') {
      const targetDate = date ? normalizeDate(date) : normalizeDate(new Date());
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const query = {
        date: { $gte: targetDate, $lt: nextDay },
      };

      if (subject) {
        if (isTeacher && !teacherSubjectIds.includes(subject)) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized for this subject',
          });
        }
        query.subject = subject;
      } else {
        query.subject = { $in: teacherSubjectIds };
      }

      const dailyRecords = await Attendance.find(query)
        .populate('student', 'name studentId rollNumber semester division email')
        .populate('subject', 'subjectCode subjectName')
        .sort({ 'subject.subjectCode': 1, 'student.rollNumber': 1 });

      const total = dailyRecords.length;
      const present = dailyRecords.filter((r) => r.status === 'Present').length;
      const absent = dailyRecords.filter((r) => r.status === 'Absent').length;
      const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return res.status(200).json({
        success: true,
        type: 'daily',
        date: targetDate,
        summary: { total, present, absent, percentage },
        data: dailyRecords,
      });
    }

    // 3. Monthly Report
    if (type === 'monthly') {
      const targetMonth = month || new Date().toISOString().substring(0, 7); // YYYY-MM
      const [y, m] = targetMonth.split('-');
      const start = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, 1));
      const end = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10), 1));

      const query = {
        date: { $gte: start, $lt: end },
        subject: { $in: teacherSubjectIds },
      };
      if (subject) query.subject = subject;

      const monthlyRecords = await Attendance.find(query)
        .populate('student', 'name studentId rollNumber semester division')
        .populate('subject', 'subjectCode subjectName');

      // Group by subject for this month
      const subjectMonthMap = {};
      teacherSubjects.forEach((sub) => {
        if (!subject || subject === sub._id.toString()) {
          subjectMonthMap[sub._id.toString()] = {
            subjectCode: sub.subjectCode,
            subjectName: sub.subjectName,
            semester: sub.semester,
            total: 0,
            present: 0,
            absent: 0,
            percentage: 0,
          };
        }
      });

      monthlyRecords.forEach((rec) => {
        const subId = (rec.subject?._id || rec.subject).toString();
        if (subjectMonthMap[subId]) {
          subjectMonthMap[subId].total += 1;
          if (rec.status === 'Present') subjectMonthMap[subId].present += 1;
          else subjectMonthMap[subId].absent += 1;
        }
      });

      const monthlySubjectData = Object.values(subjectMonthMap).map((item) => {
        item.percentage = item.total > 0 ? Number(((item.present / item.total) * 100).toFixed(1)) : 0;
        return item;
      });

      const total = monthlyRecords.length;
      const present = monthlyRecords.filter((r) => r.status === 'Present').length;
      const absent = monthlyRecords.filter((r) => r.status === 'Absent').length;
      const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return res.status(200).json({
        success: true,
        type: 'monthly',
        month: targetMonth,
        summary: { total, present, absent, percentage },
        data: monthlySubjectData,
      });
    }

    // 4. Default: Student-wise Report
    const semFilter = semester
      ? [Number(semester)]
      : [...new Set(teacherSubjects.map((s) => s.semester))];

    const studentFilter = { semester: { $in: semFilter } };
    if (division) studentFilter.division = division.toUpperCase().trim();

    const students = await Student.find(studentFilter)
      .sort({ semester: 1, division: 1, rollNumber: 1 });

    const attendanceFilter = {
      subject: subject ? subject : { $in: teacherSubjectIds },
    };

    const records = await Attendance.find(attendanceFilter).select('student status');

    const studentReportData = students.map((stu) => {
      const stuRecs = records.filter((r) => r.student.toString() === stu._id.toString());
      const total = stuRecs.length;
      const present = stuRecs.filter((r) => r.status === 'Present').length;
      const absent = stuRecs.filter((r) => r.status === 'Absent').length;
      const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return {
        _id: stu._id,
        rollNumber: stu.rollNumber,
        studentId: stu.studentId,
        name: stu.name,
        semester: stu.semester,
        division: stu.division,
        email: stu.email,
        phone: stu.phone,
        totalClasses: total,
        presentClasses: present,
        absentClasses: absent,
        percentage,
        status: total === 0 ? 'No Classes' : percentage >= 75 ? 'Eligible' : percentage >= 60 ? 'Warning' : 'Defaulter',
      };
    });

    res.status(200).json({
      success: true,
      type: 'student',
      count: studentReportData.length,
      data: studentReportData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherDashboardStats,
  getTeacherSubjects,
  getTeacherStudents,
  getTeacherAbsentStudents,
  getTeacherReports,
};
