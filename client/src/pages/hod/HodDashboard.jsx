import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import {
  FiUsers,
  FiBookOpen,
  FiUserCheck,
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiFileText,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const HodDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchHodDashboardStats();
  }, []);

  const fetchHodDashboardStats = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/hod/dashboard-stats');
      setStats(res.data.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading department dashboard...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h3 className="font-semibold text-base">Failed to load department dashboard</h3>
        <p className="text-xs mt-1">{errorMsg}</p>
        <button
          onClick={fetchHodDashboardStats}
          className="mt-3 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const deptName = stats?.department || user?.department || 'Department';
  const avgRate = stats?.averageAttendance || 0;

  const pieData = [
    { name: 'Present Today', value: stats?.presentStudentsToday || 0, color: '#10b981' },
    { name: 'Absent Today', value: stats?.absentStudentsToday || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Department Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/20">
                Department Administrator / HOD Portal
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-200 border border-indigo-400/20">
                Academic Year 2026-2027
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2.5">
              {deptName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Supervising department curriculum, faculty assignments, instructional sessions, and student attendance compliance.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/20 text-center min-w-[170px]">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Department Avg Attendance
            </p>
            <p className="text-3xl font-black text-white mt-1">
              {avgRate}%
            </p>
            <span
              className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                avgRate >= 75 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'
              }`}
            >
              {avgRate >= 75 ? '✓ Compliant Quota' : '⚠ Below 75% Target'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Department Students"
          value={stats?.totalStudents || 0}
          icon={FiUsers}
          color="indigo"
          subtitle="Enrolled in department"
        />
        <StatCard
          title="Department Faculty"
          value={stats?.totalTeachers || 0}
          icon={FiUserCheck}
          color="sky"
          subtitle="Teaching staff"
        />
        <StatCard
          title="Active Courses"
          value={stats?.totalSubjects || 0}
          icon={FiBookOpen}
          color="emerald"
          subtitle="Department subjects"
        />
        <StatCard
          title="Defaulters (<75%)"
          value={stats?.defaultersCount || 0}
          icon={FiAlertTriangle}
          color={stats?.defaultersCount > 0 ? 'rose' : 'emerald'}
          subtitle="Action required"
        />
      </div>

      {/* Secondary Metrics & Today Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conducted Sessions</span>
            <FiActivity className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.classesConducted || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Total distinct lectures held</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sessions</span>
            <FiCalendar className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.todayAttendanceSessions || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Instructional classes marked today</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
            <FiCheckCircle className="h-4 w-4 text-teal-500" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-emerald-600">{stats?.presentStudentsToday || 0} Present</span>
            <span className="text-sm font-semibold text-rose-600">/ {stats?.absentStudentsToday || 0} Absent</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Individual student marks logged</p>
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/hod/defaulters"
          className="flex items-center justify-between p-4 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-50 hover:border-rose-300 transition group"
        >
          <div>
            <p className="text-xs font-bold text-rose-900">Defaulters List</p>
            <p className="text-[11px] text-rose-600 mt-0.5">Below 75% attendance</p>
          </div>
          <FiArrowRight className="h-4 w-4 text-rose-500 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/hod/reports"
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition group"
        >
          <div>
            <p className="text-xs font-bold text-slate-800">Dept Reports</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Export & CSV logs</p>
          </div>
          <FiArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/hod/students"
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition group"
        >
          <div>
            <p className="text-xs font-bold text-slate-800">Dept Students</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Rosters & divisions</p>
          </div>
          <FiArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/hod/teachers"
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition group"
        >
          <div>
            <p className="text-xs font-bold text-slate-800">Faculty Directory</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Assigned subjects</p>
          </div>
          <FiArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Attendance Rates Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject-Wise Attendance Rates</h3>
              <p className="text-xs text-slate-500 mt-0.5">Course averages across department offerings</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Benchmark: 75%
            </span>
          </div>

          <div className="h-72 w-full">
            {stats?.subjectPerformance && stats.subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="subjectCode" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    labelFormatter={(label) => `Subject Code: ${label}`}
                  />
                  <Bar dataKey="averageAttendance" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No subject attendance data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Today Present vs Absent Donut Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's Class Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ratio of students marked today</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {stats?.presentStudentsToday + stats?.absentStudentsToday > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [val, 'Students']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 py-10">
                <FiCalendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                No attendance sessions recorded yet today.
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between text-xs">
            <span className="text-emerald-700 font-semibold">● Present: {stats?.presentStudentsToday || 0}</span>
            <span className="text-rose-700 font-semibold">● Absent: {stats?.absentStudentsToday || 0}</span>
          </div>
        </div>
      </div>

      {/* Subject Performance Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Courses & Faculty Assignment</h3>
            <p className="text-xs text-slate-500 mt-0.5">Detailed breakdown of total classes and average attendance</p>
          </div>
          <Link
            to="/hod/subjects"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All Subjects</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Faculty In-Charge</th>
                <th className="py-3 px-4 text-center">Conducted</th>
                <th className="py-3 px-4 text-center">Present / Absent</th>
                <th className="py-3 px-4">Average Rate</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.subjectPerformance && stats.subjectPerformance.length > 0 ? (
                stats.subjectPerformance.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span className="text-indigo-600 font-mono mr-1.5">{sub.subjectCode}</span>
                      {sub.subjectName}
                    </td>
                    <td className="py-3 px-4 font-medium">Semester {sub.semester}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{sub.teacherName}</td>
                    <td className="py-3 px-4 text-center font-bold">{sub.totalClasses}</td>
                    <td className="py-3 px-4 text-center font-medium">
                      <span className="text-emerald-600 font-bold">{sub.presentCount}</span> /{' '}
                      <span className="text-rose-600 font-bold">{sub.absentCount}</span>
                    </td>
                    <td className="py-3 px-4 min-w-[140px]">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <ProgressBar percentage={sub.averageAttendance} showLabel={false} />
                        </div>
                        <span className="font-bold text-xs text-slate-900 w-10 text-right">
                          {sub.averageAttendance}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          sub.averageAttendance >= 75
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {sub.averageAttendance >= 75 ? 'Optimal' : 'Shortage'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No curriculum subjects registered under this department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
