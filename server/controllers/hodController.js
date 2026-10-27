const Student = require('../models/Student');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Program = require('../models/Program');
const { normalizeDate } = require('../services/attendanceService');

/**
 * Helper to get HOD's department.
 * Admin can pass ?department=... to inspect any department.
 * HOD is strictly restricted to req.user.department.
 */
const resolveDepartment = (req) => {
  if (req.userRole === 'admin') {
    return req.query.department || req.user.department || 'Information Technology';
  }
  return req.user.department || 'Information Technology';
};

// @desc    Get Department Dashboard Summary Statistics for HOD
// @route   GET /api/hod/dashboard-stats
// @access  Private (HOD / Admin)
const getHodDashboardStats = async (req, res, next) => {
  try {
    const department = resolveDepartment(req);

    // 1. Department subjects
    const deptSubjects = await Subject.find({ department }).populate('teacher', 'name email');
    const deptSubjectIds = deptSubjects.map((s) => s._id);

    // 2. Department teachers
    const deptTeachersCount = await User.countDocuments({
      role: 'teacher',
      department,
    });

    // 3. Department programs
    const deptPrograms = await Program.find({ department });
    const programNames = deptPrograms.map((p) => p.name);

    // 4. Department students (match by department or course name matching department programs or fallback)
    const studentQuery = {
      $or: [
        { department },
        { course: new RegExp(department, 'i') },
        ...(programNames.length > 0 ? [{ course: { $in: programNames } }] : []),
      ],
    };
    const deptStudentsCount = await Student.countDocuments(studentQuery);

    // 5. Total Attendance Records & Conducted Classes for this department
    const allDeptRecords = await Attendance.find({ subject: { $in: deptSubjectIds } }).select('status date subject session');
    const totalRecords = allDeptRecords.length;
    const totalPresent = allDeptRecords.filter((r) => r.status === 'Present').length;
    const averageAttendance = totalRecords > 0 ? Number(((totalPresent / totalRecords) * 100).toFixed(1)) : 0;

    // Distinct conducted sessions (subject + date + session)
    const distinctSessionsSet = new Set(
      allDeptRecords.map((r) => `${r.subject}_${r.date.toISOString().substring(0, 10)}_${r.session || 'Lecture 1'}`)
    );
    const classesConducted = distinctSessionsSet.size;

    // 6. Today's Statistics
    const today = new Date();
    const todayStart = normalizeDate(today);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayRecords = await Attendance.find({
      subject: { $in: deptSubjectIds },
      date: { $gte: todayStart, $lt: todayEnd },
    });

    const presentStudentsToday = todayRecords.filter((r) => r.status === 'Present').length;
    const absentStudentsToday = todayRecords.filter((r) => r.status === 'Absent').length;
    const todaySessionsCount = new Set(
      todayRecords.map((r) => `${r.subject}_${r.session || 'Lecture 1'}`)
    ).size;

    // 7. Calculate Department Defaulters Count (< 75%)
    const deptStudents = await Student.find(studentQuery).select('_id');
    const studentIds = deptStudents.map((s) => s._id);

    let defaultersCount = 0;
    for (const sId of studentIds) {
      const stuRecs = allDeptRecords.filter((r) => r.student?.toString() === sId.toString());
      if (stuRecs.length > 0) {
        const pCount = stuRecs.filter((r) => r.status === 'Present').length;
        const rate = (pCount / stuRecs.length) * 100;
        if (rate < 75) defaultersCount++;
      }
    }

    // 8. Subject performance comparison
    const subjectPerformance = deptSubjects.map((sub) => {
      const subRecs = allDeptRecords.filter((r) => r.subject.toString() === sub._id.toString());
      const subTotal = subRecs.length;
      const subPresent = subRecs.filter((r) => r.status === 'Present').length;
      const rate = subTotal > 0 ? Number(((subPresent / subTotal) * 100).toFixed(1)) : 0;
      return {
        _id: sub._id,
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        semester: sub.semester,
        teacherName: sub.teacher?.name || 'Unassigned',
        totalClasses: subTotal,
        presentCount: subPresent,
        absentCount: subTotal - subPresent,
        averageAttendance: rate,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        department,
        totalSubjects: deptSubjects.length,
        totalStudents: deptStudentsCount,
        totalTeachers: deptTeachersCount,
        classesConducted,
        totalRecords,
        averageAttendance,
        defaultersCount,
        todayAttendanceSessions: todaySessionsCount,
        presentStudentsToday,
        absentStudentsToday,
        subjectPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students in HOD's department
// @route   GET /api/hod/students
// @access  Private (HOD / Admin)
const getHodStudents = async (req, res, next) => {
  try {
    const department = resolveDepartment(req);
    const { semester, division, search, program } = req.query;

    const deptPrograms = await Program.find({ department });
    const programNames = deptPrograms.map((p) => p.name);

    const query = {
      $or: [
        { department },
        { course: new RegExp(department, 'i') },
        ...(programNames.length > 0 ? [{ course: { $in: programNames } }] : []),
      ],
    };

    if (semester) query.semester = Number(semester);
    if (division) query.division = division.toUpperCase().trim();
    if (program) query.course = new RegExp(program.trim(), 'i');

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        {
          $or: [
            { name: searchRegex },
            { studentId: searchRegex },
            { email: searchRegex },
          ],
        },
      ];
    }

    const students = await Student.find(query).sort({ semester: 1, division: 1, rollNumber: 1 });

    res.status(200).json({
      success: true,
      department,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teachers in HOD's department
// @route   GET /api/hod/teachers
// @access  Private (HOD / Admin)
const getHodTeachers = async (req, res, next) => {
  try {
    const department = resolveDepartment(req);

    const teachers = await User.find({
      role: 'teacher',
      department,
    }).select('-password').sort({ name: 1 });

    // Populate assigned subjects for each teacher
    const teachersWithSubjects = await Promise.all(
      teachers.map(async (t) => {
        const subjects = await Subject.find({ teacher: t._id }).select('subjectCode subjectName semester');
        return {
          ...t.toObject(),
          assignedSubjects: subjects,
        };
      })
    );

    res.status(200).json({
      success: true,
      department,
      count: teachersWithSubjects.length,
      data: teachersWithSubjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects in HOD's department
// @route   GET /api/hod/subjects
// @access  Private (HOD / Admin)
const getHodSubjects = async (req, res, next) => {
  try {
    const department = resolveDepartment(req);
    const { semester } = req.query;

    const query = { department };
    if (semester) query.semester = Number(semester);

    const subjects = await Subject.find(query)
      .populate('teacher', 'name email phone')
      .sort({ semester: 1, subjectCode: 1 });

    res.status(200).json({
      success: true,
      department,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance defaulters (< 75%) in HOD's department
// @route   GET /api/hod/defaulters
// @access  Private (HOD / Admin)
const getHodDefaulters = async (req, res, next) => {
  try {
    const department = resolveDepartment(req);
    const { semester, division } = req.query;

    const deptPrograms = await Program.find({ department });
    const programNames = deptPrograms.map((p) => p.name);

    const studentFilter = {
      $or: [
        { department },
        { course: new RegExp(department, 'i') },
        ...(programNames.length > 0 ? [{ course: { $in: programNames } }] : []),
      ],
    };

    if (semester) studentFilter.semester = Number(semester);
    if (division) studentFilter.division = division.toUpperCase().trim();

    const students = await Student.find(studentFilter).sort({ semester: 1, division: 1, rollNumber: 1 });
    const studentIds = students.map((s) => s._id);

    const deptSubjects = await Subject.find({ department });
    const deptSubjectIds = deptSubjects.map((s) => s._id);

    const records = await Attendance.find({
      student: { $in: studentIds },
      subject: { $in: deptSubjectIds },
    }).select('student status');

    const defaulters = [];

    for (const stu of students) {
      const stuRecs = records.filter((r) => r.student.toString() === stu._id.toString());
      const total = stuRecs.length;
      if (total === 0) continue;

      const present = stuRecs.filter((r) => r.status === 'Present').length;
      const absent = total - present;
      const percentage = Number(((present / total) * 100).toFixed(1));

      if (percentage < 75) {
        // Calculate consecutive classes needed to cross 75%
        // (present + x) / (total + x) >= 0.75  =>  x >= 3*total - 4*present
        const needed = Math.max(0, Math.ceil(3 * total - 4 * present));

        defaulters.push({
          student: {
            _id: stu._id,
            studentId: stu.studentId,
            name: stu.name,
            email: stu.email,
            phone: stu.phone,
            semester: stu.semester,
            division: stu.division,
            rollNumber: stu.rollNumber,
            course: stu.course,
          },
          total,
          present,
          absent,
          percentage,
          neededClasses: needed,
          severity: percentage < 60 ? 'Critical' : 'Warning',
        });
      }
    }

    // Sort by percentage ascending (lowest first)
    defaulters.sort((a, b) => a.percentage - b.percentage);

    res.status(200).json({
      success: true,
      department,
      count: defaulters.length,
      data: defaulters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Department Reports (Student-wise, Subject-wise, Daily, Monthly)
// @route   GET /api/hod/reports
// @access  Private (HOD / Admin)
const getHodReports = async (req, res, next) => {
  try {
    const department = resolveDepartment(req);
    const { type = 'student', semester, division, subject, date, month } = req.query;

    const deptSubjects = await Subject.find({ department });
    const deptSubjectIds = deptSubjects.map((s) => s._id);

    if (type === 'subject') {
      const records = await Attendance.find({ subject: { $in: deptSubjectIds } });

      const subjectData = deptSubjects.map((sub) => {
        const subRecs = records.filter((r) => r.subject.toString() === sub._id.toString());
        const total = subRecs.length;
        const present = subRecs.filter((r) => r.status === 'Present').length;
        const absent = total - present;
        const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

        return {
          subjectId: sub._id,
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
          semester: sub.semester,
          department: sub.department,
          totalRecords: total,
          presentCount: present,
          absentCount: absent,
          averagePercentage: percentage,
        };
      });

      return res.status(200).json({
        success: true,
        department,
        type: 'subject',
        data: subjectData,
      });
    }

    if (type === 'daily') {
      const targetDate = date ? normalizeDate(date) : normalizeDate(new Date());
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const query = {
        subject: { $in: deptSubjectIds },
        date: { $gte: targetDate, $lt: nextDay },
      };
      if (subject) query.subject = subject;

      const dailyRecords = await Attendance.find(query)
        .populate('student', 'name studentId rollNumber semester division email')
        .populate('subject', 'subjectCode subjectName');

      const total = dailyRecords.length;
      const present = dailyRecords.filter((r) => r.status === 'Present').length;
      const absent = total - present;
      const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return res.status(200).json({
        success: true,
        department,
        type: 'daily',
        date: targetDate,
        summary: { total, present, absent, percentage },
        data: dailyRecords,
      });
    }

    if (type === 'monthly') {
      const targetMonth = month || new Date().toISOString().substring(0, 7);
      const [y, m] = targetMonth.split('-');
      const start = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, 1));
      const end = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10), 1));

      const query = {
        subject: { $in: deptSubjectIds },
        date: { $gte: start, $lt: end },
      };
      if (subject) query.subject = subject;

      const monthlyRecords = await Attendance.find(query).populate('subject', 'subjectCode subjectName');

      const subjectMonthMap = {};
      deptSubjects.forEach((sub) => {
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

      const data = Object.values(subjectMonthMap).map((item) => {
        item.percentage = item.total > 0 ? Number(((item.present / item.total) * 100).toFixed(1)) : 0;
        return item;
      });

      return res.status(200).json({
        success: true,
        department,
        type: 'monthly',
        month: targetMonth,
        data,
      });
    }

    // Default: Student-wise Report
    const deptPrograms = await Program.find({ department });
    const programNames = deptPrograms.map((p) => p.name);

    const studentFilter = {
      $or: [
        { department },
        { course: new RegExp(department, 'i') },
        ...(programNames.length > 0 ? [{ course: { $in: programNames } }] : []),
      ],
    };

    if (semester) studentFilter.semester = Number(semester);
    if (division) studentFilter.division = division.toUpperCase().trim();

    const students = await Student.find(studentFilter).sort({ semester: 1, division: 1, rollNumber: 1 });
    const studentIds = students.map((s) => s._id);

    const attQuery = {
      student: { $in: studentIds },
      subject: subject ? subject : { $in: deptSubjectIds },
    };

    const records = await Attendance.find(attQuery).select('student status');

    const studentReportData = students.map((stu) => {
      const stuRecs = records.filter((r) => r.student.toString() === stu._id.toString());
      const total = stuRecs.length;
      const present = stuRecs.filter((r) => r.status === 'Present').length;
      const absent = total - present;
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
      department,
      type: 'student',
      count: studentReportData.length,
      data: studentReportData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHodDashboardStats,
  getHodStudents,
  getHodTeachers,
  getHodSubjects,
  getHodDefaulters,
  getHodReports,
};
