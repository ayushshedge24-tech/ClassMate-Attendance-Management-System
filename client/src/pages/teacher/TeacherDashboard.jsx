import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../services/api';
import StatCard from '../../components/StatCard';
import {
  FiBookOpen,
  FiUsers,
  FiCalendar,
  FiClock,
  FiUserCheck,
  FiUserX,
  FiAlertCircle,
  FiCheckSquare,
  FiFileText,
  FiArrowRight,
  FiTrendingUp,
  FiCheckCircle,
  FiRadio,
  FiMapPin,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable/teacher');
      if (res.data?.success) {
        setTimetable(res.data.data);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/teacher/dashboard-stats');
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
          <p className="text-sm font-medium text-slate-500">Loading faculty dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h3 className="font-semibold text-base">Failed to load teacher dashboard data</h3>
        <p className="mt-1 text-sm">{errorMsg}</p>
        <button
          onClick={fetchDashboardStats}
          className="mt-3 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasPending = (stats?.pendingAttendanceSessions || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner - Teach Us Inspired */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                Faculty Portal
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {user?.department || 'Department of Information Technology'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2.5">
              Welcome, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Manage your assigned curriculum courses, record lecture attendance, and track student eligibility.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <Link
              to="/teacher/radar"
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-300 hover:to-indigo-500 hover:scale-105 transition"
            >
              <FiRadio className="h-4 w-4 text-slate-950 animate-pulse" />
              <span>Start Your Radar</span>
            </Link>
            <Link
              to="/teacher/mark-attendance"
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition"
            >
              <FiCheckSquare className="h-4 w-4" />
              <span>Manual Mark</span>
            </Link>
            <Link
              to="/teacher/absent-students"
              className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <FiUserX className="h-4 w-4 text-rose-400" />
              <span>Review Absentees</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Sessions Notification Alert */}
      {hasPending ? (
        <div className="flex items-start space-x-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <FiAlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div>
              <h4 className="font-bold text-amber-950">
                Pending Today's Attendance ({stats.pendingAttendanceSessions} courses pending)
              </h4>
              <p className="mt-0.5 text-amber-800">
                You have not yet recorded attendance today for:{' '}
                <strong>
                  {stats.pendingSubjects?.map((s) => s.subjectCode).join(', ')}
                </strong>
                .
              </p>
            </div>
            <Link
              to="/teacher/mark-attendance"
              className="inline-flex items-center space-x-1 rounded-xl bg-amber-600 px-3 py-1.5 font-bold text-white hover:bg-amber-700 transition whitespace-nowrap self-start sm:self-auto"
            >
              <span>Mark Now</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <FiCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            All assigned lecture sessions for today have been recorded and verified!
          </span>
        </div>
      )}

      {/* Today's Schedule & Quick Radar Launch Card */}
      {timetable?.todayLectures?.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FiCalendar className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Today's Teaching Schedule ({timetable.currentDay})
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                One-click Smart Radar activation for scheduled lecture slots
              </p>
            </div>
            <Link
              to="/teacher/timetable"
              className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>Weekly Routine</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {timetable.todayLectures.map((slot) => (
              <div
                key={slot._id}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:border-indigo-200 hover:bg-indigo-50/20 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      Sem {slot.semester} • Div {slot.division}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-2 truncate">
                    {slot.subject?.subjectCode} — {slot.subject?.subjectName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                    <FiMapPin className="h-3 w-3 text-indigo-500" />
                    <span>{slot.classroom}</span>
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-end">
                  <Link
                    to="/teacher/radar"
                    state={{
                      prefill: {
                        subjectId: slot.subject?._id,
                        semester: slot.semester,
                        division: slot.division,
                        classroom: slot.classroom,
                        sessionSlot: `${slot.startTime} - ${slot.endTime}`,
                      },
                    }}
                    className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                  >
                    <FiRadio className="h-3.5 w-3.5" />
                    <span>Launch Radar</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7 Required Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          title="Assigned Subjects"
          value={stats?.assignedSubjectsCount ?? 0}
          icon={FiBookOpen}
          color="indigo"
          subtitle="Curriculum courses"
        />
        <StatCard
          title="Assigned Students"
          value={stats?.totalAssignedStudents ?? 0}
          icon={FiUsers}
          color="sky"
          subtitle="Enrolled in classes"
        />
        <StatCard
          title="Classes Conducted"
          value={stats?.classesConducted ?? 0}
          icon={FiCalendar}
          color="indigo"
          subtitle="Total sessions held"
        />
        <StatCard
          title="Today's Sessions"
          value={stats?.todayAttendanceSessions ?? 0}
          icon={FiClock}
          color="amber"
          subtitle="Recorded today"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentStudentsToday ?? 0}
          icon={FiUserCheck}
          color="emerald"
          subtitle="Students attended"
        />
        <StatCard
          title="Absent Today"
          value={stats?.absentStudentsToday ?? 0}
          icon={FiUserX}
          color="rose"
          subtitle="Students absent"
        />
        <StatCard
          title="Pending Sessions"
          value={stats?.pendingAttendanceSessions ?? 0}
          icon={FiAlertCircle}
          color={hasPending ? 'amber' : 'emerald'}
          subtitle={hasPending ? 'Awaiting submission' : 'All clear'}
        />
      </div>

      {/* Visual Charts & Pending Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Attendance Trends in Your Courses
              </h2>
              <p className="text-xs text-slate-500">
                Daily present vs absent count across your instructional lectures
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              Past 7 Days
            </span>
          </div>

          <div className="h-72 w-full">
            {stats?.attendanceTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.attendanceTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="teacherPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="teacherAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="present"
                    name="Present Students"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#teacherPresent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    name="Absent Students"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#teacherAbsent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No recent attendance records to plot.
              </div>
            )}
          </div>
        </div>

        {/* Quick Tools & Pending Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Faculty Workflows
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Quick access to daily instructional management
            </p>

            <div className="space-y-3">
              <Link
                to="/teacher/mark-attendance"
                className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <FiCheckSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Mark Attendance</h4>
                    <p className="text-[11px] text-slate-500">Record daily lecture roster</p>
                  </div>
                </div>
                <FiArrowRight className="text-indigo-600 h-4 w-4" />
              </Link>

              <Link
                to="/teacher/edit-attendance"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-800 text-white rounded-lg">
                    <FiClock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Edit Attendance</h4>
                    <p className="text-[11px] text-slate-500">Correct previous session logs</p>
                  </div>
                </div>
                <FiArrowRight className="text-slate-600 h-4 w-4" />
              </Link>

              <Link
                to="/teacher/absent-students"
                className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-600 text-white rounded-lg">
                    <FiUserX className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Absentee Monitor</h4>
                    <p className="text-[11px] text-slate-500">Track defaulters & shortage</p>
                  </div>
                </div>
                <FiArrowRight className="text-rose-600 h-4 w-4" />
              </Link>

              <Link
                to="/teacher/reports"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <FiFileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Attendance Reports</h4>
                    <p className="text-[11px] text-slate-500">Export student & subject data</p>
                  </div>
                </div>
                <FiArrowRight className="text-emerald-600 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Teach Us Faculty Attendance Workflow
          </div>
        </div>
      </div>

      {/* Recent Marked Sessions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Recent Class Attendance Sessions
            </h3>
            <p className="text-xs text-slate-500">Lectures recently conducted and verified</p>
          </div>
          <Link
            to="/teacher/attendance-history"
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>Full History</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Lecture Date</th>
                <th className="px-6 py-3">Subject Code</th>
                <th className="px-6 py-3">Subject Name</th>
                <th className="px-6 py-3">Session</th>
                <th className="px-6 py-3 text-center">Roster Size</th>
                <th className="px-6 py-3 text-center text-emerald-700">Present</th>
                <th className="px-6 py-3 text-center text-rose-700">Absent</th>
                <th className="px-6 py-3 text-center">Rate</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentSessions?.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No recent attendance sessions found. Click "Mark Today's Attendance" to get started.
                  </td>
                </tr>
              ) : (
                stats?.recentSessions?.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 font-mono font-bold text-indigo-600">
                      {s.subjectCode}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {s.subjectName}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {s.session}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center font-semibold text-slate-700">
                      {s.totalStudents}
                    </td>
                    <td className="px-6 py-3 text-center font-bold text-emerald-600">
                      {s.presentCount}
                    </td>
                    <td className="px-6 py-3 text-center font-bold text-rose-600">
                      {s.absentCount}
                    </td>
                    <td className="px-6 py-3 text-center font-bold text-indigo-600">
                      {s.percentage}%
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/teacher/edit-attendance?subject=${s.subjectId}&date=${new Date(s.date).toISOString().substring(0, 10)}&session=${s.session}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
