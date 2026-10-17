const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

const seedAllData = async () => {
  try {
    console.log('[Seed] Starting database seed process...');

    // Clear existing collections
    await User.deleteMany();
    await Student.deleteMany();
    await Subject.deleteMany();
    await Attendance.deleteMany();

    console.log('[Seed] Cleared existing records.');

    // 1. Create Admin and Teacher users
    const admin = await User.create({
      name: 'Dr. Rajesh Sharma (Admin)',
      email: 'admin@attendance.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Department of Computer Science & Engineering',
      phone: '+91 98765 43210',
    });

    const teacher = await User.create({
      name: 'Prof. Priya Verma',
      email: 'teacher@attendance.com',
      password: 'Teacher@123',
      role: 'teacher',
      department: 'Information Technology',
      phone: '+91 98765 43211',
    });

    console.log('[Seed] Admin and Teacher accounts created.');

    // 2. Create 5 Subjects
    const subjectData = [
      {
        subjectCode: 'IT301',
        subjectName: 'Database Management System',
        semester: 4,
        department: 'Information Technology',
        teacher: teacher._id,
      },
      {
        subjectCode: 'IT302',
        subjectName: 'Web Programming',
        semester: 4,
        department: 'Information Technology',
        teacher: teacher._id,
      },
      {
        subjectCode: 'IT303',
        subjectName: 'Data Structures & Algorithms',
        semester: 4,
        department: 'Information Technology',
        teacher: admin._id,
      },
      {
        subjectCode: 'IT304',
        subjectName: 'Operating Systems',
        semester: 4,
        department: 'Information Technology',
        teacher: teacher._id,
      },
      {
        subjectCode: 'IT305',
        subjectName: 'Computer Networks',
        semester: 4,
        department: 'Information Technology',
        teacher: admin._id,
      },
    ];

    const subjects = await Subject.insertMany(subjectData);
    console.log(`[Seed] ${subjects.length} subjects created.`);

    // 3. Create 20 Students (Semester 4, Division A & B)
    const studentNames = [
      'Aarav Patel', 'Aditi Rao', 'Ananya Sharma', 'Aryan Gupta',
      'Bhavya Desai', 'Chirag Mehta', 'Devanshi Joshi', 'Dhruv Shah',
      'Isha Kulkarni', 'Kavya Nair', 'Manish Reddy', 'Neha Singhal',
      'Pranav Iyer', 'Rhea Malhotra', 'Rohan Chatterjee', 'Siddharth Sen',
      'Tanvi Hegde', 'Utkarsh Verma', 'Varun Kapoor', 'Zoya Khan',
    ];

    const studentsToInsert = studentNames.map((name, index) => {
      const rollNum = index + 1;
      const division = index < 10 ? 'A' : 'B';
      const studentId = `STU10${(rollNum < 10 ? '0' : '') + rollNum}`;
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}.stu@attendance.com`;

      return {
        studentId,
        name,
        email,
        phone: `+91 98110 ${10000 + rollNum}`,
        course: 'B.Tech Information Technology',
        semester: 4,
        division,
        rollNumber: rollNum,
        password: 'Student@123',
      };
    });

    const students = [];
    for (const item of studentsToInsert) {
      // Create individually so pre-save hook hashes password properly
      const student = await Student.create(item);
      students.push(student);
    }
    console.log(`[Seed] ${students.length} students created with encrypted passwords.`);

    // 4. Create Sample Attendance records for the past 10 instructional days
    console.log('[Seed] Generating realistic attendance history...');
    const attendanceRecords = [];

    // Past 10 working days
    const dates = [];
    let curDate = new Date();
    while (dates.length < 10) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        const d = new Date(curDate);
        d.setUTCHours(0, 0, 0, 0);
        dates.push(d);
      }
      curDate.setDate(curDate.getDate() - 1);
    }
    dates.reverse(); // Chronological order

    // Generate records for each subject and student
    for (const d of dates) {
      for (const sub of subjects) {
        for (const stu of students) {
          // Weighted random attendance: 85% probability Present
          // Specific roll numbers have higher or lower attendance for varied charts
          let presentChance = 0.85;
          if (stu.rollNumber === 3 || stu.rollNumber === 15) presentChance = 0.65; // lower attendance
          if (stu.rollNumber === 1 || stu.rollNumber === 10) presentChance = 0.98; // high attendance

          const isPresent = Math.random() < presentChance;

          attendanceRecords.push({
            student: stu._id,
            subject: sub._id,
            date: d,
            status: isPresent ? 'Present' : 'Absent',
            markedBy: teacher._id,
            remarks: isPresent ? 'Regular class' : 'Absent without prior intimation',
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`[Seed] ${attendanceRecords.length} attendance records inserted.`);

    console.log('----------------------------------------------------');
    console.log(' DEMO CREDENTIALS:');
    console.log(' Admin:   admin@attendance.com   / Admin@123');
    console.log(' Teacher: teacher@attendance.com / Teacher@123');
    console.log(' Student: aarav.patel.stu@attendance.com (or STU1001) / Student@123');
    console.log('----------------------------------------------------');
    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

// If run directly
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedAllData();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedAllData };
