import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiBookOpen,
  FiCheckSquare,
  FiList,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiCalendar,
  FiShield,
  FiClock,
  FiUserX,
  FiEdit3,
  FiActivity,
  FiPieChart,
  FiInfo,
} from 'react-icons/fi';
import AboutDeveloperModal from '../components/AboutDeveloperModal';

const DashboardLayout = () => {
  const { user, logout, isStaff, isStudent, isAdmin, isTeacher } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Students', path: '/admin/students', icon: FiUsers },
    { name: 'Subjects', path: '/admin/subjects', icon: FiBookOpen },
    { name: 'Mark Attendance', path: '/admin/attendance', icon: FiCheckSquare },
    { name: 'Attendance Records', path: '/admin/attendance-records', icon: FiList },
    { name: 'Reports', path: '/admin/reports', icon: FiBarChart2 },
  ];

  const teacherNavLinks = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: FiGrid },
    { name: 'My Subjects', path: '/teacher/subjects', icon: FiBookOpen },
    { name: 'Mark Attendance', path: '/teacher/mark-attendance', icon: FiCheckSquare },
    { name: 'Edit Attendance', path: '/teacher/edit-attendance', icon: FiEdit3 },
    { name: 'Attendance History', path: '/teacher/attendance-history', icon: FiClock },
    { name: 'Student Attendance', path: '/teacher/students', icon: FiUsers },
    { name: 'Absent Students', path: '/teacher/absent-students', icon: FiUserX },
    { name: 'Reports', path: '/teacher/reports', icon: FiBarChart2 },
  ];

  const studentNavLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: FiGrid },
    { name: 'My Attendance', path: '/student/attendance', icon: FiCalendar },
    { name: 'Subject-wise Attendance', path: '/student/subjects', icon: FiBookOpen },
    { name: 'Monthly Summary', path: '/student/monthly', icon: FiPieChart },
    { name: 'My Profile', path: '/student/profile', icon: FiUser },
  ];

  let navLinks = studentNavLinks;
  if (isAdmin) {
    navLinks = adminNavLinks;
  } else if (isTeacher) {
    navLinks = teacherNavLinks;
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <FiCheckSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-none">
                AMS Portal
              </h1>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Attendance Management
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* User Role Badge in Sidebar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-indigo-400 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-rose-500/20 text-rose-300'
                      : isStaff
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  <FiShield className="mr-1 h-3 w-3" />
                  {user?.role || 'User'}
                </span>
                {user?.studentId && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {user.studentId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 px-4 py-4 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setAboutModalOpen(true)}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-950/60 border border-slate-800/80 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <FiInfo className="h-3.5 w-3.5 text-indigo-400" />
            <span>About Developer</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-rose-600 hover:text-white transition-colors"
          >
            <FiLogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500">
              <FiClock className="h-4 w-4 text-indigo-500" />
              <span>Session: Academic Year 2024-2025</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setAboutModalOpen(true)}
              title="About Developer & AMS Project"
              className="hidden sm:flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-white hover:border-indigo-200 transition shadow-sm"
            >
              <FiInfo className="h-3.5 w-3.5 text-indigo-500" />
              <span>About Developer</span>
            </button>

            <div className="flex items-center space-x-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <FiCalendar className="h-3.5 w-3.5 text-slate-500" />
              <span>{todayStr}</span>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {user?.role === 'student' ? `${user?.course} (${user?.semester}-${user?.division})` : user?.email}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm border border-indigo-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* Clean, Understated Application Footer */}
        <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-center sm:text-left">
            <span>Developed by</span>
            <button
              onClick={() => setAboutModalOpen(true)}
              className="font-semibold text-slate-700 hover:text-indigo-600 underline underline-offset-2 transition"
            >
              Ayush Shedge
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Vidyalankar School of Information Technology, Mumbai</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>MERN Attendance Management System</span>
            <span>•</span>
            <button
              onClick={() => setAboutModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              Profile & Architecture
            </button>
          </div>
        </footer>
      </div>

      {/* About Developer Modal */}
      <AboutDeveloperModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
