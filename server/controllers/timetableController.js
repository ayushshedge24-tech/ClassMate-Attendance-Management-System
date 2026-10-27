const Timetable = require('../models/Timetable');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const User = require('../models/User');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to check time overlaps (e.g. "09:00" to "10:00" vs "09:30" to "10:30")
const isTimeOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

// @desc    Get weekly timetable and today's schedule for student
// @route   GET /api/timetable/student
// @access  Student
const getStudentTimetable = async (req, res) => {
  try {
    let student = await Student.findOne({ email: req.user.email });
    if (!student && req.user.studentId) {
      student = await Student.findOne({ studentId: req.user.studentId });
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const entries = await Timetable.find({
      semester: student.semester,
      division: student.division,
      isActive: true,
    })
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .sort({ startTime: 1 });

    // Group by day of week
    const weeklySchedule = {};
    DAYS.forEach((d) => (weeklySchedule[d] = []));
    entries.forEach((e) => {
      if (weeklySchedule[e.dayOfWeek]) {
        weeklySchedule[e.dayOfWeek].push(e);
      }
    });

    // Identify Today and Next lecture
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[new Date().getDay()];
    const todayLectures = weeklySchedule[currentDay] || [];

    const nowTime = new Date().toTimeString().substring(0, 5); // "HH:mm"
    const nextLecture = todayLectures.find((l) => l.startTime >= nowTime) || null;

    res.status(200).json({
      success: true,
      data: {
        weeklySchedule,
        currentDay,
        todayLectures,
        nextLecture,
        totalWeeklySlots: entries.length,
      },
    });
  } catch (error) {
    console.error('getStudentTimetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get weekly timetable and today's schedule for teacher
// @route   GET /api/timetable/teacher
// @access  Teacher, Admin
const getTeacherTimetable = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const entries = await Timetable.find({
      teacher: teacherId,
      isActive: true,
    })
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .sort({ startTime: 1 });

    const weeklySchedule = {};
    DAYS.forEach((d) => (weeklySchedule[d] = []));
    entries.forEach((e) => {
      if (weeklySchedule[e.dayOfWeek]) {
        weeklySchedule[e.dayOfWeek].push(e);
      }
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[new Date().getDay()];
    const todayLectures = weeklySchedule[currentDay] || [];

    const nowTime = new Date().toTimeString().substring(0, 5);
    const nextLecture = todayLectures.find((l) => l.startTime >= nowTime) || null;
    const currentLecture =
      todayLectures.find((l) => l.startTime <= nowTime && l.endTime >= nowTime) || null;

    res.status(200).json({
      success: true,
      data: {
        weeklySchedule,
        currentDay,
        todayLectures,
        currentLecture,
        nextLecture,
        totalWeeklySlots: entries.length,
      },
    });
  } catch (error) {
    console.error('getTeacherTimetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get timetable by department / course / semester / division (Admin & HOD)
// @route   GET /api/timetable
// @access  Admin, HOD, Teacher
const getTimetableEntries = async (req, res) => {
  try {
    const { department, course, semester, division, dayOfWeek } = req.query;

    const query = { isActive: true };
    if (department) query.department = department;
    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (division) query.division = division.toUpperCase();
    if (dayOfWeek) query.dayOfWeek = dayOfWeek;

    // HOD restriction: department must match
    if (req.user.role === 'hod' && req.user.department) {
      query.department = req.user.department;
    }

    const entries = await Timetable.find(query)
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error('getTimetableEntries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new timetable entry with collision prevention
// @route   POST /api/timetable
// @access  Admin, HOD
const createTimetableEntry = async (req, res) => {
  try {
    const {
      department = 'Information Technology',
      course,
      semester,
      division,
      subject,
      teacher,
      classroom,
      dayOfWeek,
      startTime,
      endTime,
      sessionType = 'Theory',
    } = req.body;

    if (!course || !semester || !division || !subject || !teacher || !classroom || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'All timetable fields (course, semester, division, subject, teacher, classroom, day, start, end) are required.',
      });
    }

    // Collision Check 1: Teacher double-booking
    const teacherConflict = await Timetable.findOne({
      teacher,
      dayOfWeek,
      isActive: true,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      ],
    }).populate('subject', 'subjectName');

    if (teacherConflict) {
      return res.status(400).json({
        success: false,
        message: `Teacher collision! Faculty is already scheduled for ${teacherConflict.subject?.subjectName} (${teacherConflict.startTime} - ${teacherConflict.endTime}) on ${dayOfWeek}.`,
      });
    }

    // Collision Check 2: Classroom double-booking
    const roomConflict = await Timetable.findOne({
      classroom,
      dayOfWeek,
      isActive: true,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      ],
    });

    if (roomConflict) {
      return res.status(400).json({
        success: false,
        message: `Classroom collision! ${classroom} is already occupied on ${dayOfWeek} from ${roomConflict.startTime} to ${roomConflict.endTime}.`,
      });
    }

    // Collision Check 3: Student class slot double-booking
    const classConflict = await Timetable.findOne({
      course,
      semester: Number(semester),
      division: division.toUpperCase(),
      dayOfWeek,
      isActive: true,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      ],
    }).populate('subject', 'subjectName');

    if (classConflict) {
      return res.status(400).json({
        success: false,
        message: `Class collision! Semester ${semester} Division ${division} already has ${classConflict.subject?.subjectName} scheduled at that time.`,
      });
    }

    const entry = await Timetable.create({
      department,
      course,
      semester: Number(semester),
      division: division.toUpperCase(),
      subject,
      teacher,
      classroom,
      dayOfWeek,
      startTime,
      endTime,
      sessionType,
    });

    const populatedEntry = await Timetable.findById(entry._id)
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email');

    res.status(201).json({
      success: true,
      message: 'Timetable entry scheduled successfully.',
      data: populatedEntry,
    });
  } catch (error) {
    console.error('createTimetableEntry error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Admin, HOD
const deleteTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    }

    if (req.userRole === 'hod' && entry.department && entry.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete timetable entries for another department.',
      });
    }

    await entry.deleteOne();
    res.status(200).json({ success: true, message: 'Timetable entry deleted successfully.' });
  } catch (error) {
    console.error('deleteTimetableEntry error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentTimetable,
  getTeacherTimetable,
  getTimetableEntries,
  createTimetableEntry,
  deleteTimetableEntry,
};
