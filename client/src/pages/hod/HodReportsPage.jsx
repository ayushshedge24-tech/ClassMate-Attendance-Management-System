import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';
import {
  FiBarChart2,
  FiCalendar,
  FiDownload,
  FiPrinter,
  FiFilter,
  FiRefreshCw,
  FiUser,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

const HodReportsPage = () => {
  const [reportType, setReportType] = useState('student'); // 'student' | 'subject' | 'daily' | 'monthly'
  const [departmentName, setDepartmentName] = useState('');
  const [subjectsList, setSubjectsList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [semesterFilter, setSemesterFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));

  const { error } = useToast();

  useEffect(() => {
    fetchDepartmentSubjects();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, semesterFilter, divisionFilter, subjectFilter, dateFilter, monthFilter]);

  const fetchDepartmentSubjects = async () => {
    try {
      const res = await api.get('/hod/subjects');
      setSubjectsList(res.data.data || []);
      setDepartmentName(res.data.department || 'Department');
    } catch (err) {
      // non-critical failure
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { type: reportType };
      if (semesterFilter) params.semester = semesterFilter;
      if (divisionFilter) params.division = divisionFilter;
      if (subjectFilter) params.subject = subjectFilter;
      if (reportType === 'daily' && dateFilter) params.date = dateFilter;
      if (reportType === 'monthly' && monthFilter) params.month = monthFilter;

      const res = await api.get('/hod/reports', { params });
      setReportData(res.data.data || []);
      setReportSummary(res.data.summary || null);
      if (res.data.department) setDepartmentName(res.data.department);
    } catch (err) {
      error(getErrorMessage(err, 'Failed to fetch report data'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!reportData || reportData.length === 0) return;

    let exportRows = [];
    let filename = `HOD_${departmentName}_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'student') {
      exportRows = reportData.map((r) => ({
        'Student ID': r.studentId,
        'Student Name': r.name,
        Roll: r.rollNumber || 'N/A',
        Semester: r.semester,
        Division: r.division,
        'Total Classes': r.totalClasses,
        Present: r.presentClasses,
        Absent: r.absentClasses,
        'Attendance %': `${r.percentage}%`,
        Status: r.status,
      }));
    } else if (reportType === 'subject') {
      exportRows = reportData.map((r) => ({
        'Subject Code': r.subjectCode,
        'Subject Name': r.subjectName,
        Semester: r.semester,
        'Total Records': r.totalRecords,
        'Present Count': r.presentCount,
        'Absent Count': r.absentCount,
        'Average Attendance %': `${r.averagePercentage}%`,
      }));
    } else if (reportType === 'daily') {
      exportRows = reportData.map((r) => ({
        'Student ID': r.student?.studentId || 'N/A',
        'Student Name': r.student?.name || 'N/A',
        'Subject Code': r.subject?.subjectCode || 'N/A',
        'Subject Name': r.subject?.subjectName || 'N/A',
        Status: r.status,
        Date: new Date(r.date).toLocaleDateString(),
        Remarks: r.remarks || '',
      }));
    } else if (reportType === 'monthly') {
      exportRows = reportData.map((r) => ({
        'Subject Code': r.subjectCode,
        'Subject Name': r.subjectName,
        Semester: r.semester,
        'Total Classes': r.total,
        Present: r.present,
        Absent: r.absent,
        'Attendance %': `${r.percentage}%`,
      }));
    }

    exportToCsv(exportRows, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  // Distribution for Student report
  const eligibleCount = reportData.filter((r) => r.percentage >= 75).length;
  const warningCount = reportData.filter((r) => r.percentage >= 60 && r.percentage < 75).length;
  const criticalCount = reportData.filter((r) => r.percentage < 60 && r.totalClasses > 0).length;

  const studentPieData = [
    { name: 'Eligible (≥75%)', value: eligibleCount, color: '#10B981' },
    { name: 'Warning (60-74%)', value: warningCount, color: '#F59E0B' },
    { name: 'Critical (<60%)', value: criticalCount, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Department Attendance Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Generate and export academic analytics for the Department of{' '}
            <strong className="text-slate-800">{departmentName}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchReport}
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <FiPrinter className="h-4 w-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportCsv}
            disabled={reportData.length === 0}
            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <FiDownload className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block border-b pb-4 mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          Department Attendance Report &mdash; {reportType.toUpperCase()}
        </h1>
        <p className="text-sm text-slate-600">
          Department: {departmentName} | Date Generated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm print:hidden">
        {[
          { id: 'student', label: 'Student-Wise Report', icon: FiUser },
          { id: 'subject', label: 'Subject-Wise Report', icon: FiBookOpen },
          { id: 'daily', label: 'Daily Session Report', icon: FiClock },
          { id: 'monthly', label: 'Monthly Summary', icon: FiCalendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Semester Filter */}
          {(reportType === 'student' || reportType === 'subject') && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Semester
              </label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Division Filter */}
          {reportType === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Division
              </label>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Divisions</option>
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
                <option value="D">Division D</option>
              </select>
            </div>
          )}

          {/* Subject Filter */}
          {(reportType === 'student' || reportType === 'daily' || reportType === 'monthly') && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjectsList.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Filter (Daily) */}
          {reportType === 'daily' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Month Filter (Monthly) */}
          {reportType === 'monthly' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Month
              </label>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Visual Analytics Cards */}
      {reportType === 'student' && reportData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 print:hidden">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Student Attendance Performance Distribution
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { category: 'Eligible (≥75%)', count: eligibleCount, fill: '#10B981' },
                    { category: 'Warning (60-74%)', count: warningCount, fill: '#F59E0B' },
                    { category: 'Critical (<60%)', count: criticalCount, fill: '#EF4444' },
                  ]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Compliance Ratio
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Percentage of students meeting the 75% attendance threshold.
              </p>
            </div>
            {studentPieData.length > 0 ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {studentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-10 text-sm">No data</div>
            )}
          </div>
        </div>
      )}

      {/* Daily Summary Banner */}
      {reportType === 'daily' && reportSummary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Marked
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900">{reportSummary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Present
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{reportSummary.present}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Absent
            </span>
            <p className="mt-1 text-2xl font-bold text-rose-600">{reportSummary.absent}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Attendance Rate
            </span>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{reportSummary.percentage}%</p>
          </div>
        </div>
      )}

      {/* Report Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FiBarChart2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Records Found</h3>
            <p className="text-sm mt-1 text-slate-500">
              Try adjusting the filter criteria or date range to view attendance results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* 1. STUDENT-WISE REPORT TABLE */}
            {reportType === 'student' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Sem / Div / Roll</th>
                    <th className="px-6 py-3.5 text-center">Conducted</th>
                    <th className="px-6 py-3.5 text-center">Attended</th>
                    <th className="px-6 py-3.5 text-center">Missed</th>
                    <th className="px-6 py-3.5">Attendance Rate</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportData.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{row.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          ID: {row.studentId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div>Sem {row.semester} - Div {row.division}</div>
                        <div className="text-xs text-slate-400">Roll: {row.rollNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">
                        {row.totalClasses}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                        {row.presentClasses}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-rose-600">
                        {row.absentClasses}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-28">
                          <span
                            className={`text-xs font-bold ${
                              row.percentage >= 75
                                ? 'text-emerald-600'
                                : row.percentage >= 60
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {row.percentage}%
                          </span>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                row.percentage >= 75
                                  ? 'bg-emerald-500'
                                  : row.percentage >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, row.percentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.status === 'Eligible'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'Warning'
                              ? 'bg-amber-100 text-amber-800'
                              : row.status === 'Defaulter'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. SUBJECT-WISE REPORT TABLE */}
            {reportType === 'subject' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Semester</th>
                    <th className="px-6 py-3.5 text-center">Total Attendance Marked</th>
                    <th className="px-6 py-3.5 text-center">Present</th>
                    <th className="px-6 py-3.5 text-center">Absent</th>
                    <th className="px-6 py-3.5 text-right">Average Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportData.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{sub.subjectName}</div>
                        <div className="text-xs text-indigo-600 font-mono mt-0.5">
                          {sub.subjectCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">
                        Semester {sub.semester}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700 font-semibold">
                        {sub.totalRecords}
                      </td>
                      <td className="px-6 py-4 text-center text-emerald-600 font-semibold">
                        {sub.presentCount}
                      </td>
                      <td className="px-6 py-4 text-center text-rose-600 font-semibold">
                        {sub.absentCount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                            sub.averagePercentage >= 75
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {sub.averagePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. DAILY SESSION REPORT TABLE */}
            {reportType === 'daily' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Class</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportData.map((rec) => {
                    const isPresent = rec.status === 'Present';
                    return (
                      <tr key={rec._id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {rec.student?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            ID: {rec.student?.studentId || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          Sem {rec.student?.semester || '-'} - Div {rec.student?.division || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {rec.subject?.subjectName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {rec.subject?.subjectCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPresent ? (
                              <FiCheckCircle className="mr-1 h-3.5 w-3.5" />
                            ) : (
                              <FiXCircle className="mr-1 h-3.5 w-3.5" />
                            )}
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-500 italic">
                          {rec.remarks || 'Regular class'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* 4. MONTHLY SUMMARY REPORT TABLE */}
            {reportType === 'monthly' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Semester</th>
                    <th className="px-6 py-3.5 text-center">Conducted Classes</th>
                    <th className="px-6 py-3.5 text-center">Present</th>
                    <th className="px-6 py-3.5 text-center">Absent</th>
                    <th className="px-6 py-3.5 text-right">Monthly %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{row.subjectName}</div>
                        <div className="text-xs text-indigo-600 font-mono">{row.subjectCode}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">
                        Semester {row.semester}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">
                        {row.total}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                        {row.present}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-rose-600">
                        {row.absent}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                            row.percentage >= 75
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HodReportsPage;
