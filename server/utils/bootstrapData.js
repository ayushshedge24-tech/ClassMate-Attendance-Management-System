const Department = require('../models/Department');
const Program = require('../models/Program');
const User = require('../models/User');
const Subject = require('../models/Subject');
const TeacherAssignment = require('../models/TeacherAssignment');
const Timetable = require('../models/Timetable');

/**
 * Safely bootstraps college hierarchy:
 * Default departments, default programs, HOD accounts, and teacher assignments.
 * NEVER drops collections or modifies existing records.
 */
const bootstrapCollegeData = async () => {
  try {
    // 1. Bootstrap Default Departments if none exist
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log('[Bootstrap] Initializing default college departments...');
      await Department.insertMany([
        {
          name: 'Information Technology',
          code: 'IT',
          description: 'Department of Information Technology & Advanced Software Systems',
        },
        {
          name: 'Computer Science',
          code: 'CS',
          description: 'Department of Computer Science & Algorithmic Foundations',
        },
        {
          name: 'Data Science',
          code: 'DS',
          description: 'Department of Data Science & Artificial Intelligence',
        },
        {
          name: 'Computer Engineering',
          code: 'CE',
          description: 'Department of Computer Science & Engineering',
        },
      ]);
      console.log('[Bootstrap] 4 college departments initialized.');
    }

    // 2. Bootstrap HOD Accounts if not present
    let hodIt = await User.findOne({ email: 'hod.it@attendance.com' });
    if (!hodIt) {
      console.log('[Bootstrap] Creating HOD IT account...');
      hodIt = await User.create({
        name: 'Dr. Sunita Kulkarni (HOD IT)',
        email: 'hod.it@attendance.com',
        password: 'Hod@123',
        role: 'hod',
        department: 'Information Technology',
        phone: '+91 98765 43220',
      });
      // Link to Department
      await Department.findOneAndUpdate(
        { code: 'IT' },
        { hod: hodIt._id }
      );
    }

    let hodCs = await User.findOne({ email: 'hod.cs@attendance.com' });
    if (!hodCs) {
      console.log('[Bootstrap] Creating HOD CS account...');
      hodCs = await User.create({
        name: 'Dr. Amit Deshmukh (HOD CS)',
        email: 'hod.cs@attendance.com',
        password: 'Hod@123',
        role: 'hod',
        department: 'Computer Science',
        phone: '+91 98765 43221',
      });
      await Department.findOneAndUpdate(
        { code: 'CS' },
        { hod: hodCs._id }
      );
    }

    // 3. Bootstrap Required College Programs
    const programCount = await Program.countDocuments();
    if (programCount === 0) {
      console.log('[Bootstrap] Initializing 8 standard college programs...');
      const defaultPrograms = [
        {
          name: 'B.Sc. IT',
          code: 'BSCIT',
          department: 'Information Technology',
          totalSemesters: 6,
          divisions: ['A', 'B', 'C', 'D'],
          academicYears: ['2026-2027', '2025-2026', '2024-2025'],
          description: 'Bachelor of Science in Information Technology (VSIT Curriculum)',
        },
        {
          name: 'B.Sc. CS',
          code: 'BSCCS',
          department: 'Computer Science',
          totalSemesters: 6,
          divisions: ['A', 'B', 'C', 'D'],
          academicYears: ['2026-2027', '2025-2026', '2024-2025'],
          description: 'Bachelor of Science in Computer Science',
        },
        {
          name: 'B.Sc. DS',
          code: 'BSCDS',
          department: 'Data Science',
          totalSemesters: 6,
          divisions: ['A', 'B', 'C', 'D'],
          academicYears: ['2026-2027', '2025-2026', '2024-2025'],
          description: 'Bachelor of Science in Data Science & Big Data Analytics',
        },
        {
          name: 'B.Tech',
          code: 'BTECH',
          department: 'Computer Engineering',
          totalSemesters: 8,
          divisions: ['A', 'B', 'C', 'D'],
          academicYears: ['2026-2027', '2025-2026', '2024-2025'],
          description: 'Bachelor of Technology in Computer Engineering',
        },
        {
          name: 'M.Sc. IT',
          code: 'MSCIT',
          department: 'Information Technology',
          totalSemesters: 4,
          divisions: ['A', 'B'],
          academicYears: ['2026-2027', '2025-2026', '2024-2025'],
          description: 'Master of Science in Information Technology',
        },
        {
          name: 'M.Sc. CS',
          code: 'MSCCS',
          department: 'Computer Science',
          totalSemesters: 4,
          divisions: ['A', 'B'],
          academicYears: ['2026-2027', '2025-2026', '2024-2025'],
          description: 'Master of Science in Computer Science',
        },
        {
          name: 'M.Sc. DS',
          code: 'MSCDS',
          department: 'Data Science',
          totalSemesters: 4,
          divisions: ['A', 'B'],
          academicYears: ['2026-2027', '2025-2026', '2024-2025'],
          description: 'Master of Science in Data Science',
        },
        {
          name: 'M.Tech',
          code: 'MTECH',
          department: 'Computer Engineering',
          totalSemesters: 4,
          divisions: ['A', 'B'],
          academicYears: ['2026-2027', '2025-2026', '2024-2025'],
          description: 'Master of Technology in Computer Engineering',
        },
      ];

      await Program.insertMany(defaultPrograms);
      console.log('[Bootstrap] 8 college programs successfully initialized.');
    }

    // 4. Bootstrap Teacher Assignments for existing subjects if empty
    const assignmentCount = await TeacherAssignment.countDocuments();
    if (assignmentCount === 0) {
      console.log('[Bootstrap] Initializing teacher-subject-division assignments...');
      const teacher = await User.findOne({ email: 'teacher@attendance.com' });
      const subjects = await Subject.find();

      if (teacher && subjects.length > 0) {
        const assignments = [];
        for (const sub of subjects) {
          // Assign Division A and B
          assignments.push({
            teacher: sub.teacher || teacher._id,
            subject: sub._id,
            program: 'B.Sc. IT',
            semester: sub.semester || 4,
            division: 'A',
            academicYear: '2026-2027',
          });
          assignments.push({
            teacher: sub.teacher || teacher._id,
            subject: sub._id,
            program: 'B.Sc. IT',
            semester: sub.semester || 4,
            division: 'B',
            academicYear: '2026-2027',
          });
        }
        await TeacherAssignment.insertMany(assignments);
        console.log(`[Bootstrap] Created ${assignments.length} initial teacher assignments.`);
      }
    }

    // 5. Bootstrap Default Timetable if empty
    const timetableCount = await Timetable.countDocuments();
    if (timetableCount === 0) {
      console.log('[Bootstrap] Initializing default weekly timetable schedule...');
      const teacher = await User.findOne({ email: 'teacher@attendance.com' });
      const admin = await User.findOne({ email: 'admin@attendance.com' });
      const subjects = await Subject.find();

      if (subjects.length >= 3 && teacher) {
        const sub1 = subjects[0]; // e.g. IT301
        const sub2 = subjects[1]; // e.g. IT302
        const sub3 = subjects[2]; // e.g. IT303
        const sub4 = subjects[3] || sub1;
        const sub5 = subjects[4] || sub2;

        const scheduleEntries = [
          // Monday
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub1._id,
            teacher: teacher._id,
            classroom: 'Room 301',
            dayOfWeek: 'Monday',
            startTime: '09:00',
            endTime: '10:00',
            sessionType: 'Theory',
          },
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub2._id,
            teacher: teacher._id,
            classroom: 'Lab 402',
            dayOfWeek: 'Monday',
            startTime: '10:00',
            endTime: '11:00',
            sessionType: 'Practical',
          },
          // Tuesday
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub3._id,
            teacher: admin ? admin._id : teacher._id,
            classroom: 'Room 302',
            dayOfWeek: 'Tuesday',
            startTime: '09:00',
            endTime: '10:00',
            sessionType: 'Theory',
          },
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub4._id,
            teacher: teacher._id,
            classroom: 'Room 301',
            dayOfWeek: 'Tuesday',
            startTime: '10:00',
            endTime: '11:00',
            sessionType: 'Theory',
          },
          // Wednesday
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub5._id,
            teacher: admin ? admin._id : teacher._id,
            classroom: 'Smart Hall 1',
            dayOfWeek: 'Wednesday',
            startTime: '09:00',
            endTime: '10:00',
            sessionType: 'Theory',
          },
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub1._id,
            teacher: teacher._id,
            classroom: 'Room 301',
            dayOfWeek: 'Wednesday',
            startTime: '10:00',
            endTime: '11:00',
            sessionType: 'Theory',
          },
          // Thursday
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub2._id,
            teacher: teacher._id,
            classroom: 'Lab 402',
            dayOfWeek: 'Thursday',
            startTime: '09:00',
            endTime: '10:00',
            sessionType: 'Practical',
          },
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub3._id,
            teacher: admin ? admin._id : teacher._id,
            classroom: 'Room 302',
            dayOfWeek: 'Thursday',
            startTime: '10:00',
            endTime: '11:00',
            sessionType: 'Theory',
          },
          // Friday
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub4._id,
            teacher: teacher._id,
            classroom: 'Room 301',
            dayOfWeek: 'Friday',
            startTime: '09:00',
            endTime: '10:00',
            sessionType: 'Theory',
          },
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub5._id,
            teacher: admin ? admin._id : teacher._id,
            classroom: 'Smart Hall 1',
            dayOfWeek: 'Friday',
            startTime: '10:00',
            endTime: '11:00',
            sessionType: 'Theory',
          },
          // Saturday
          {
            department: 'Information Technology',
            course: 'B.Tech Information Technology',
            semester: 4,
            division: 'A',
            subject: sub1._id,
            teacher: teacher._id,
            classroom: 'Seminar Room',
            dayOfWeek: 'Saturday',
            startTime: '09:00',
            endTime: '10:00',
            sessionType: 'Tutorial',
          },
        ];

        await Timetable.insertMany(scheduleEntries);
        console.log(`[Bootstrap] Created ${scheduleEntries.length} weekly timetable slots.`);
      }
    }
  } catch (error) {
    console.error('[Bootstrap] Non-fatal error during college data bootstrap:', error.message);
  }
};

module.exports = { bootstrapCollegeData };
