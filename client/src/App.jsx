import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProgramsPage from './pages/admin/ProgramsPage';
import TeacherAssignmentsPage from './pages/admin/TeacherAssignmentsPage';
import StudentsPage from './pages/admin/StudentsPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import MarkAttendancePage from './pages/admin/MarkAttendancePage';
import AttendanceRecordsPage from './pages/admin/AttendanceRecordsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminTimetablePage from './pages/admin/AdminTimetablePage';

// HOD / Department Admin Pages
import HodDashboard from './pages/hod/HodDashboard';
import HodStudentsPage from './pages/hod/HodStudentsPage';
import HodTeachersPage from './pages/hod/HodTeachersPage';
import HodSubjectsPage from './pages/hod/HodSubjectsPage';
import HodDefaultersPage from './pages/hod/HodDefaultersPage';
import HodReportsPage from './pages/hod/HodReportsPage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherRadarPage from './pages/teacher/TeacherRadarPage';
import TeacherTimetablePage from './pages/teacher/TeacherTimetablePage';
import TeacherSubjectsPage from './pages/teacher/TeacherSubjectsPage';
import TeacherMarkAttendancePage from './pages/teacher/TeacherMarkAttendancePage';
import TeacherEditAttendancePage from './pages/teacher/TeacherEditAttendancePage';
import TeacherAttendanceHistoryPage from './pages/teacher/TeacherAttendanceHistoryPage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherAbsentStudentsPage from './pages/teacher/TeacherAbsentStudentsPage';
import TeacherReportsPage from './pages/teacher/TeacherReportsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentTimetablePage from './pages/student/StudentTimetablePage';
import StudentAttendanceHistory from './pages/student/StudentAttendanceHistory';
import StudentSubjectAttendance from './pages/student/StudentSubjectAttendance';
import StudentMonthlySummary from './pages/student/StudentMonthlySummary';
import StudentProfile from './pages/student/StudentProfile';

// Root Index Redirector based on user role
const RootRedirector = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (user?.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  if (user?.role === 'hod') {
    return <Navigate to="/hod/dashboard" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirector />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/programs" element={<ProgramsPage />} />
          <Route path="/admin/assignments" element={<TeacherAssignmentsPage />} />
          <Route path="/admin/timetable" element={<AdminTimetablePage />} />
          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/subjects" element={<SubjectsPage />} />
          <Route path="/admin/attendance" element={<MarkAttendancePage />} />
          <Route path="/admin/attendance-records" element={<AttendanceRecordsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      {/* HOD Protected Routes (Accessible by HOD and Admin) */}
      <Route element={<ProtectedRoute allowedRoles={['hod', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/hod/dashboard" element={<HodDashboard />} />
          <Route path="/hod/timetable" element={<AdminTimetablePage />} />
          <Route path="/hod/students" element={<HodStudentsPage />} />
          <Route path="/hod/teachers" element={<HodTeachersPage />} />
          <Route path="/hod/subjects" element={<HodSubjectsPage />} />
          <Route path="/hod/defaulters" element={<HodDefaultersPage />} />
          <Route path="/hod/reports" element={<HodReportsPage />} />
        </Route>
      </Route>

      {/* Teacher Protected Routes (Accessible by Teacher and Admin) */}
      <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/radar" element={<TeacherRadarPage />} />
          <Route path="/teacher/timetable" element={<TeacherTimetablePage />} />
          <Route path="/teacher/subjects" element={<TeacherSubjectsPage />} />
          <Route path="/teacher/mark-attendance" element={<TeacherMarkAttendancePage />} />
          <Route path="/teacher/edit-attendance" element={<TeacherEditAttendancePage />} />
          <Route path="/teacher/attendance-history" element={<TeacherAttendanceHistoryPage />} />
          <Route path="/teacher/students" element={<TeacherStudentsPage />} />
          <Route path="/teacher/absent-students" element={<TeacherAbsentStudentsPage />} />
          <Route path="/teacher/reports" element={<TeacherReportsPage />} />
        </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/timetable" element={<StudentTimetablePage />} />
          <Route path="/student/attendance" element={<StudentAttendanceHistory />} />
          <Route path="/student/subjects" element={<StudentSubjectAttendance />} />
          <Route path="/student/monthly" element={<StudentMonthlySummary />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
