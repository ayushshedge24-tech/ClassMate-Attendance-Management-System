import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import {
  FiCheckSquare,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUserCheck,
  FiBookOpen,
  FiShield,
  FiArrowRight,
  FiInfo,
} from 'react-icons/fi';
import AboutDeveloperModal from '../components/AboutDeveloperModal';

const LoginPage = () => {
  const [roleTab, setRoleTab] = useState('staff'); // 'staff' (Admin/Teacher) or 'student'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleDemoFill = (type) => {
    if (type === 'admin') {
      setRoleTab('staff');
      setIdentifier('admin@attendance.com');
      setPassword('Admin@123');
    } else if (type === 'teacher') {
      setRoleTab('staff');
      setIdentifier('teacher@attendance.com');
      setPassword('Teacher@123');
    } else if (type === 'student') {
      setRoleTab('student');
      setIdentifier('aarav.patel.stu@attendance.com');
      setPassword('Student@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      error('Please enter your credentials');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        password,
        role: roleTab === 'student' ? 'student' : undefined,
      };

      if (identifier.includes('@')) {
        payload.email = identifier.trim();
      } else {
        payload.studentId = identifier.trim();
      }

      const loggedUser = await login(payload);
      success(`Welcome back, ${loggedUser.name}!`);

      if (loggedUser.role === 'student') {
        navigate('/student/dashboard');
      } else if (loggedUser.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/25">
            <FiCheckSquare className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              AMS Portal
            </h2>
            <p className="text-xs text-indigo-300 font-medium">
              College Attendance Management System
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur shadow-2xl rounded-3xl border border-slate-200/50 p-8">
          {/* Role Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setRoleTab('staff');
                setIdentifier('');
                setPassword('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                roleTab === 'staff'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiShield className="h-4 w-4" />
              <span>Admin / Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab('student');
                setIdentifier('');
                setPassword('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                roleTab === 'student'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiBookOpen className="h-4 w-4" />
              <span>Student Portal</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                {roleTab === 'student' ? 'Student Email or Student ID' : 'Institutional Email'}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <FiMail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    roleTab === 'student'
                      ? 'e.g. STU1001 or aarav@attendance.com'
                      : 'e.g. admin@attendance.com'
                  }
                  className="block w-full rounded-xl border border-slate-300 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 pl-11 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In to AMS</span>
                  <FiArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Fill Buttons for College Viva Demonstration */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-center mb-3">
              ⚡ Viva Quick-Fill Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-center hover:bg-indigo-50 hover:border-indigo-200 transition"
              >
                <span className="text-xs font-semibold text-slate-800">Admin</span>
                <span className="text-[10px] text-slate-500">Admin@123</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('teacher')}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-center hover:bg-indigo-50 hover:border-indigo-200 transition"
              >
                <span className="text-xs font-semibold text-slate-800">Teacher</span>
                <span className="text-[10px] text-slate-500">Teacher@123</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-center hover:bg-indigo-50 hover:border-indigo-200 transition"
              >
                <span className="text-xs font-semibold text-slate-800">Student</span>
                <span className="text-[10px] text-slate-500">Student@123</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 space-y-1.5">
          <p className="text-xs text-indigo-200/90 font-medium">
            Developed by{' '}
            <button
              type="button"
              onClick={() => setAboutModalOpen(true)}
              className="text-white font-semibold underline underline-offset-2 hover:text-indigo-200 transition"
            >
              Ayush Shedge
            </button>{' '}
            • Vidyalankar School of Information Technology, Mumbai
          </p>
          <div className="flex items-center justify-center space-x-3 text-[11px] text-indigo-300/70">
            <span>B.Sc. Information Technology (2027)</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setAboutModalOpen(true)}
              className="text-indigo-300 hover:text-white transition underline underline-offset-2 flex items-center gap-1 inline-flex"
            >
              <FiInfo className="h-3 w-3" />
              <span>About Developer</span>
            </button>
          </div>
        </div>
      </div>

      {/* About Developer Modal */}
      <AboutDeveloperModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
