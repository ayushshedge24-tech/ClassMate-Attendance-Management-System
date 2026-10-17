const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const {
  normalizeDate,
  calculateStudentSummary,
  calculateStudentMonthlyBreakdown,
} = require('../services/attendanceService');

// @desc    Mark attendance (supports single record or batch submission for a class)
// @route   POST /api/attendance
// @access  Private (Teacher / Admin)
const markAttendance = async (req, res, next) => {
  try {
    const { subject, date, session, student, status, remarks, records } = req.body;

    if (!subject || !date) {
      return res.status(400).json({
        success: false,
        message: 'Subject and date are required',
      });
    }

    const subjectObj = await Subject.findById(subject);
    if (!subjectObj) {
      return res.status(404).json({
        success: false,
        message: 'Selected subject does not exist',
      });
    }

    // Role-based authorization: Teachers can only mark attendance for their assigned subjects
    if (req.userRole === 'teacher') {
      if (
        subjectObj.teacher &&
        subjectObj.teacher.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to mark attendance for this subject',
        });
      }
    }

    const attendanceDate = normalizeDate(date);
    const lectureSession = session ? session.trim() : 'Lecture 1';

    // Case 1: Batch submission (e.g. from Mark Attendance Page)
    if (records && Array.isArray(records) && records.length > 0) {
      const operations = records.map((item) => ({
        updateOne: {
          filter: {
            student: item.student,
            subject: subject,
            date: attendanceDate,
            session: item.session || lectureSession,
          },
          update: {
            $set: {
              status: item.status || 'Present',
              markedBy: req.user._id,
              remarks: item.remarks || '',
              session: item.session || lectureSession,
            },
          },
          upsert: true,
        },
      }));

      const bulkResult = await Attendance.bulkWrite(operations);

      return res.status(200).json({
        success: true,
        message: `Attendance marked successfully for ${records.length} students (${lectureSession})`,
        data: {
          upsertedCount: bulkResult.upsertedCount,
          modifiedCount: bulkResult.modifiedCount,
          matchedCount: bulkResult.matchedCount,
          session: lectureSession,
        },
      });
    }

    // Case 2: Single submission
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student ID or list of records is required',
      });
    }

    // Check if student exists
    const studentObj = await Student.findById(student);
    if (!studentObj) {
      return res.status(404).json({
        success: false,
        message: 'Student does not exist',
      });
    }

    // Check for duplicate for same student + subject + date + session
    const existing = await Attendance.findOne({
      student,
      subject,
      date: attendanceDate,
      session: lectureSession,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Attendance already marked for this student on ${date.toString().substring(0, 10)} for ${lectureSession}`,
      });
    }

    const attendance = await Attendance.create({
      student,
      subject,
      date: attendanceDate,
      session: lectureSession,
      status: status || 'Present',
      markedBy: req.user._id,
      remarks: remarks || '',
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('student', 'name studentId rollNumber semester division')
      .populate('subject', 'subjectCode subjectName')
      .populate('markedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records with comprehensive filtering and pagination
// @route   GET /api/attendance
// @access  Private (Teacher / Admin)
const getAttendanceRecords = async (req, res, next) => {
  try {
    const {
      date,
      startDate,
      endDate,
      session,
      subject,
      student,
      status,
      semester,
      division,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Teacher subject authorization
    if (req.userRole === 'teacher') {
      const teacherSubjects = await Subject.find({ teacher: req.user._id }).select('_id');
      const teacherSubjectIds = teacherSubjects.map((s) => s._id.toString());

      if (subject) {
        if (!teacherSubjectIds.includes(subject.toString())) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to access attendance records for this subject',
          });
        }
        query.subject = subject;
      } else {
        query.subject = { $in: teacherSubjectIds };
      }
    } else if (subject) {
      query.subject = subject;
    }

    if (date) {
      const searchDate = normalizeDate(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = {
        $gte: searchDate,
        $lt: nextDay,
      };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = normalizeDate(startDate);
      }
      if (endDate) {
        const end = normalizeDate(endDate);
        end.setDate(end.getDate() + 1);
        query.date.$lt = end;
      }
    }

    if (session) {
      query.session = session;
    }

    if (status) {
      query.status = status;
    }

    // Filter by student properties (semester, division, specific student)
    if (student) {
      query.student = student;
    } else if (semester || division) {
      const studentQuery = {};
      if (semester) studentQuery.semester = Number(semester);
      if (division) studentQuery.division = division.toUpperCase();

      const matchingStudents = await Student.find(studentQuery).select('_id');
      const studentIds = matchingStudents.map((s) => s._id);
      query.student = { $in: studentIds };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);

    const records = await Attendance.find(query)
      .populate('student', 'studentId name rollNumber semester division email phone')
      .populate({
        path: 'subject',
        select: 'subjectCode subjectName semester teacher',
        populate: {
          path: 'teacher',
          select: 'name email department',
        },
      })
      .populate('markedBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attendance record by ID
// @route   GET /api/attendance/:id
// @access  Private (Teacher / Admin)
const getAttendanceById = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('student', 'studentId name rollNumber semester division')
      .populate('subject', 'subjectCode subjectName teacher')
      .populate('markedBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Check teacher authorization
    if (req.userRole === 'teacher' && record.subject?.teacher) {
      if (record.subject.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this attendance record',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance status/remarks/session
// @route   PUT /api/attendance/:id
// @access  Private (Teacher / Admin)
const updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks, session } = req.body;

    const record = await Attendance.findById(req.params.id).populate('subject');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Check teacher authorization
    if (req.userRole === 'teacher' && record.subject?.teacher) {
      if (record.subject.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to edit attendance for this subject',
        });
      }
    }

    if (status) {
      if (!['Present', 'Absent'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be Present or Absent',
        });
      }
      record.status = status;
    }

    if (remarks !== undefined) {
      record.remarks = remarks.trim();
    }

    if (session) {
      record.session = session.trim();
    }

    record.markedBy = req.user._id;

    await record.save();

    const updated = await Attendance.findById(record._id)
      .populate('student', 'studentId name rollNumber semester division')
      .populate('subject', 'subjectCode subjectName')
      .populate('markedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Teacher / Admin)
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id).populate('subject');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Check teacher authorization
    if (req.userRole === 'teacher' && record.subject?.teacher) {
      if (record.subject.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete attendance for this subject',
        });
      }
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed attendance history for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private (Student self or Teacher/Admin)
const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { subject, month, startDate, endDate, status, page, limit } = req.query;

    // Strict Authorization check: Student can only view their own attendance
    if (req.userRole === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access another student\'s records',
      });
    }

    const query = { student: studentId };

    if (subject) {
      query.subject = subject;
    }

    if (status) {
      query.status = status;
    }

    if (month) {
      // month format: YYYY-MM
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      query.date = { $gte: start, $lt: end };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = normalizeDate(startDate);
      }
      if (endDate) {
        const end = normalizeDate(endDate);
        end.setDate(end.getDate() + 1);
        query.date.$lt = end;
      }
    }

    const total = await Attendance.countDocuments(query);

    let queryBuilder = Attendance.find(query)
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

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      queryBuilder = queryBuilder.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const records = await queryBuilder;

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance summary & calculation for a student
// @route   GET /api/attendance/student/:studentId/summary
// @access  Private (Student self or Teacher/Admin)
const getStudentSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Strict Authorization check
    if (req.userRole === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access another student\'s summary',
      });
    }

    const summary = await calculateStudentSummary(studentId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly attendance breakdown for a student
// @route   GET /api/attendance/student/:studentId/monthly
// @access  Private (Student self or Teacher/Admin)
const getStudentMonthly = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month is required in YYYY-MM format',
      });
    }

    // Strict Authorization check
    if (req.userRole === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access another student\'s monthly summary',
      });
    }

    const monthlyData = await calculateStudentMonthlyBreakdown(studentId, month);

    res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getStudentAttendance,
  getStudentSummary,
  getStudentMonthly,
};
