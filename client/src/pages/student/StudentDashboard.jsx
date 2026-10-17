import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import {
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiCalendar,
  FiBookOpen,
  FiAlertTriangle,
  FiClock,
  FiArrowRight,
  FiLayers,
  FiShield,
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
} from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?._id) {
      fetchStudentSummary();
    }
  }, [user]);

  const fetchStudentSummary = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/attendance/student/${user._id}/summary`);
      setSummary(res.data.data);
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
          <p className="text-sm font-medium text-slate-500">Loading student attendance portal...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h3 className="font-semibold text-base">Failed to load attendance summary</h3>
        <p className="text-xs mt-1">{errorMsg}</p>
        <button
          onClick={fetchStudentSummary}
          className="mt-3 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const attendanceRate = summary?.attendancePercentage || 0;
  const isLowAttendance = attendanceRate < 75;

  const pieData = [
    { name: 'Attended Classes', value: summary?.presentClasses || 0, color: '#10b981' },
    { name: 'Missed Classes', value: summary?.absentClasses || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Teach Us Inspired */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-700/15">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-100 backdrop-blur border border-indigo-400/20">
                Semester {user?.semester} • Division {user?.division} • Roll #{user?.rollNumber}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-400/20">
                Enrolled Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2.5">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
              Student ID: <span className="font-mono font-bold text-white">{user?.studentId}</span> • {user?.course}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/20 text-center min-w-[150px]">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Overall Rate
            </p>
            <p className="text-3xl font-black text-white mt-1">
              {attendanceRate}%
            </p>
            <span
              className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                !isLowAttendance ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'
              }`}
            >
              {!isLowAttendance ? '✓ Exam Eligible' : '⚠ Attendance Shortage'}
            </span>
          </div>
        </div>
      </div>

      {/* Low Attendance Warning Alert if under 75% */}
      {isLowAttendance && (
        <div className="flex items-start space-x-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <FiAlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-950">
              Attendance Shortage Alert (Threshold: 75% Required)
            </h4>
            <p className="mt-0.5 text-amber-800">
              Your overall attendance is currently at <span className="font-bold">{attendanceRate}%</span>, which is below the mandatory university policy of 75%. Please attend upcoming instructional sessions to regularize your eligibility.
            </p>
          </div>
        </div>
      )}

      {/* 6 Required Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendanceRate}%`}
          icon={FiTrendingUp}
          color={isLowAttendance ? 'rose' : 'emerald'}
          subtitle={isLowAttendance ? 'Below 75% quota' : 'Good academic standing'}
        />
        <StatCard
          title="Total Conducted"
          value={summary?.totalClasses || 0}
          icon={FiCalendar}
          color="indigo"
          subtitle="Total lecture sessions"
        />
        <StatCard
          title="Classes Attended"
          value={summary?.presentClasses || 0}
          icon={FiCheckCircle}
          color="emerald"
          subtitle="Marked Present"
        />
        <StatCard
          title="Classes Missed"
          value={summary?.absentClasses || 0}
          icon={FiXCircle}
          color="rose"
          subtitle="Marked Absent"
        />
        <StatCard
          title="Total Subjects"
          value={summary?.totalSubjects || 0}
          icon={FiBookOpen}
          color="sky"
          subtitle="Enrolled curriculum"
        />
        <StatCard
          title="Below Threshold"
          value={summary?.subjectsBelowThreshold || 0}
          icon={FiAlertTriangle}
          color={(summary?.subjectsBelowThreshold || 0) > 0 ? 'rose' : 'emerald'}
          subtitle={(summary?.subjectsBelowThreshold || 0) > 0 ? 'Courses need attention' : 'All courses safe'}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Performance Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Course Attendance Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Percentage comparison across all enrolled subjects
              </p>
            </div>
            <Link
              to="/student/subjects"
              className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>View Details</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {summary?.subjectWise?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.subjectWise}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="subjectCode" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Attendance']}
                    labelFormatter={(code) => {
                      const s = summary.subjectWise.find((x) => x.subjectCode === code);
                      return s ? `${code} - ${s.subjectName}` : code;
                    }}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    name="Attendance %"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No course records found yet.
              </div>
            )}
          </div>
        </div>

        {/* Present vs Absent Ratio Donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Attendance Distribution
            </h2>
            <p className="text-xs text-slate-500 mb-2">
              Ratio of present vs absent sessions
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {summary?.totalClasses > 0 ? (
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No attendance records logged yet</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>Present: {summary?.presentClasses || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span>Absent: {summary?.absentClasses || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Summary Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Subject Attendance Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Detailed breakdown of classes held, attended, and percentage by subject
            </p>
          </div>
          <Link
            to="/student/subjects"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View Subject Details →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Subject Code</th>
                <th className="px-6 py-3.5">Subject Name</th>
                <th className="px-6 py-3.5">Faculty</th>
                <th className="px-6 py-3.5 text-center">Classes Conducted</th>
                <th className="px-6 py-3.5 text-center text-emerald-700">Attended</th>
                <th className="px-6 py-3.5 text-center text-rose-700">Missed</th>
                <th className="px-6 py-3.5 w-44">Attendance %</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.subjectWise?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No curriculum subjects enrolled for this semester.
                  </td>
                </tr>
              ) : (
                summary?.subjectWise?.map((sub) => (
                  <tr key={sub.subjectId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                      {sub.subjectCode}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">
                      {sub.subjectName}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {sub.teacher?.name || 'Assigned Faculty'}
                    </td>
                    <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                      {sub.totalClasses}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                      {sub.presentClasses}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                      {sub.absentClasses}
                    </td>
                    <td className="px-6 py-3.5">
                      <ProgressBar percentage={sub.percentage} height="h-2" />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          sub.totalClasses === 0
                            ? 'bg-slate-100 text-slate-600'
                            : sub.percentage >= 75
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.percentage >= 60
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.totalClasses === 0
                          ? 'No Classes'
                          : sub.percentage >= 75
                          ? 'Safe'
                          : sub.percentage >= 60
                          ? 'Warning'
                          : 'Shortage'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attendance Logs (Latest 5 Sessions) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Recent Attendance History (Latest 5 Sessions)
            </h3>
            <p className="text-xs text-slate-500">Live verified attendance records</p>
          </div>
          <Link
            to="/student/attendance"
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View Complete History</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Lecture Date</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Session</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.recentAttendance?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No recent attendance logs recorded.
                  </td>
                </tr>
              ) : (
                summary?.recentAttendance?.slice(0, 5).map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {new Date(rec.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {rec.subject?.subjectCode} - {rec.subject?.subjectName}
                    </td>
                    <td className="px-6 py-3 text-slate-600 font-medium">
                      {rec.session || 'Lecture 1'}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rec.status === 'Present' ? (
                          <FiCheckCircle className="mr-1 h-3 w-3 text-emerald-600" />
                        ) : (
                          <FiXCircle className="mr-1 h-3 w-3 text-rose-600" />
                        )}
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {rec.remarks || 'Regular class'}
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

export default StudentDashboard;
