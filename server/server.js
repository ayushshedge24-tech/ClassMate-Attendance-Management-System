const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const { seedAllData } = require('./utils/seedData');

// Route imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow cross-origin requests if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health / Welcome Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MERN Attendance Management System API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/teacher', teacherRoutes);

// Static frontend serving from client/dist (Unified Single-Port Deployment)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA Catch-All Route: Any non-API GET request returns index.html for React Router DOM
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send('Frontend build not found. Please run "npm run build".');
});

// Error Middlewares (Catches unmatched /api routes and internal server errors)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs seeding
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial demo data...');
      await seedAllData();
    }

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` MERN Attendance Management System Running on Port ${PORT}`);
      console.log(` Web Application: http://localhost:${PORT}`);
      console.log(` REST API Base:   http://localhost:${PORT}/api`);
      console.log(` Health Status:   http://localhost:${PORT}/api/health`);
      console.log(` Mode:            ${process.env.NODE_ENV || 'production'}`);
      console.log(`====================================================`);
    });

    return server;
  } catch (error) {
    console.error(`[Server Error] Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
