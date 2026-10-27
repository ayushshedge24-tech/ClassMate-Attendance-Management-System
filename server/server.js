const express = require('express');
const http = require('http');
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
const { initSocket } = require('./socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const hodRoutes = require('./routes/hodRoutes');
const programRoutes = require('./routes/programRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const radarRoutes = require('./routes/radarRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { bootstrapCollegeData } = require('./utils/bootstrapData');

const app = express();

// Security Hardening: Disable information disclosure headers
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Dynamic CORS configuration (accepts single origin, comma-separated list, or wildcard for dev)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health / Welcome Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ClassMate — Smart College Attendance Management System API is running smoothly',
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
app.use('/api/hod', hodRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/radar', radarRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);

// Static frontend serving from client/dist (Unified Single-Port Deployment)
const clientDistPath = path.join(__dirname, '../client/dist');

// PWA Service Worker & Manifest Handlers (MIME types & Service-Worker-Allowed header)
app.get('/sw.js', (req, res) => {
  const swPath = path.join(clientDistPath, 'sw.js');
  if (fs.existsSync(swPath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(swPath);
  }
  res.status(404).send('Service worker not found.');
});

app.get(['/manifest.webmanifest', '/manifest.json'], (req, res) => {
  const manifestPath = path.join(clientDistPath, 'manifest.webmanifest');
  if (fs.existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/manifest+json');
    return res.sendFile(manifestPath);
  }
  res.status(404).send('Manifest not found.');
});

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

    // Safely bootstrap college hierarchy (departments, programs, HOD, timetable) if empty
    await bootstrapCollegeData();

    // Create HTTP Server and bind Socket.IO
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    const server = httpServer.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` ClassMate — Smart Attendance Management System`);
      console.log(` Running on Port: ${PORT}`);
      console.log(` Web Application: http://localhost:${PORT}`);
      console.log(` REST API Base:   http://localhost:${PORT}/api`);
      console.log(` Health Status:   http://localhost:${PORT}/api/health`);
      console.log(` Real-time Radar: Socket.IO Engine Active`);
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
