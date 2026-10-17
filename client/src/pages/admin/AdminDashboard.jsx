import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiTrendingUp,
  FiUserCheck,
  FiUserX,
  FiCheckSquare,
  FiPlus,
  FiArrowUpRight,
  FiClock,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#6366f1', '#f59e0b'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/attendance'),
      ]);
      setStats(statsRes.data.data);
      setChartData(chartsRes.data.data);
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
          <p className="text-sm font-medium text-slate-500">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h3 className="font-semibold text-base">Failed to load dashboard data</h3>
        <p className="mt-1 text-sm">{errorMsg}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Attendance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time attendance overview and statistics across all enrolled classes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/attendance"
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <FiCheckSquare className="h-4 w-4" />
            <span>Mark Daily Attendance</span>
          </Link>
          <Link
            to="/admin/students"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <FiPlus className="h-3.5 w-3.5" />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={FiUsers}
          color="indigo"
          subtitle="Enrolled active"
        />
        <StatCard
          title="Total Subjects"
          value={stats?.totalSubjects ?? 0}
          icon={FiBookOpen}
          color="sky"
          subtitle="Curriculum courses"
        />
        <StatCard
          title="Average Attendance"
          value={`${stats?.averageAttendance ?? 0}%`}
          icon={FiTrendingUp}
          color="emerald"
          subtitle="College overall rate"
        />
        <StatCard
          title="Today's Total"
          value={stats?.todayAttendanceTotal ?? 0}
          icon={FiCalendar}
          color="amber"
          subtitle="Records logged today"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday ?? 0}
          icon={FiUserCheck}
          color="emerald"
          subtitle="Attendees logged"
        />
        <StatCard
          title="Absent Today"
          value={stats?.absentToday ?? 0}
          icon={FiUserX}
          color="rose"
          subtitle="Absent notifications"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Attendance Trend Over Time (Area Chart) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Attendance Trend Over Time
              </h2>
              <p className="text-xs text-slate-500">
                Daily present vs absent statistics for the past instructional days
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              Daily Log
            </span>
          </div>

          <div className="h-72 w-full">
            {chartData?.overviewData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.overviewData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorPresent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    name="Absent Students"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAbsent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No attendance trend records found yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Present vs Absent Donut Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Present vs Absent Ratio
            </h2>
            <p className="text-xs text-slate-500 mb-2">
              Cumulative distribution across all records
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {chartData?.presentVsAbsent?.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.presentVsAbsent}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.presentVsAbsent.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
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
              <div className="text-xs text-slate-400">No attendance data to display</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            {chartData?.presentVsAbsent?.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-xs font-medium text-slate-600">{item.name}</p>
                  <p className="text-sm font-bold text-slate-900">{item.value} records</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Subject-Wise Attendance Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Subject-wise Attendance Rates
            </h2>
            <p className="text-xs text-slate-500">
              Comparative attendance percentages for subjects in active semester
            </p>
          </div>
          <Link
            to="/admin/reports"
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View Full Report</span>
            <FiArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="h-72 w-full">
          {chartData?.subjectWiseData?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.subjectWiseData}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <XAxis dataKey="subjectCode" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Attendance Rate']}
                  labelFormatter={(code) => {
                    const sub = chartData.subjectWiseData.find((s) => s.subjectCode === code);
                    return sub ? `${code} - ${sub.subjectName}` : code;
                  }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="percentage"
                  name="Attendance %"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No subject attendance data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
