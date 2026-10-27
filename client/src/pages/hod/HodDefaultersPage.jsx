import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';
import {
  FiAlertTriangle,
  FiDownload,
  FiPrinter,
  FiFilter,
  FiSearch,
  FiInfo,
  FiUserX,
  FiShield,
  FiCheckCircle,
  FiRefreshCw,
  FiMail,
  FiPhone,
} from 'react-icons/fi';

const HodDefaultersPage = () => {
  const [defaulters, setDefaulters] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const { error } = useToast();

  useEffect(() => {
    fetchDefaulters();
  }, [semesterFilter, divisionFilter]);

  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (divisionFilter) params.division = divisionFilter;

      const res = await api.get('/hod/defaulters', { params });
      setDefaulters(res.data.data || []);
      setDepartmentName(res.data.department || 'Department');
    } catch (err) {
      error(getErrorMessage(err, 'Failed to fetch defaulters list'));
    } finally {
      setLoading(false);
    }
  };

  // Filter by search & severity
  const filteredDefaulters = defaulters.filter((item) => {
    const student = item.student || {};
    const matchesSearch =
      !search ||
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = !severityFilter || item.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const criticalCount = defaulters.filter((d) => d.severity === 'Critical').length;
  const warningCount = defaulters.filter((d) => d.severity === 'Warning').length;
  const avgAttendance =
    defaulters.length > 0
      ? (defaulters.reduce((acc, curr) => acc + curr.percentage, 0) / defaulters.length).toFixed(1)
      : 0;

  const handleExportCsv = () => {
    if (filteredDefaulters.length === 0) return;
    const exportData = filteredDefaulters.map((d) => ({
      'Student ID': d.student.studentId,
      'Student Name': d.student.name,
      Roll: d.student.rollNumber || 'N/A',
      Semester: d.student.semester,
      Division: d.student.division,
      'Total Classes': d.total,
      Present: d.present,
      Absent: d.absent,
      'Attendance %': `${d.percentage}%`,
      'Severity': d.severity,
      'Consecutive Classes Needed (for 75%)': d.neededClasses,
      Email: d.student.email,
      Phone: d.student.phone || 'N/A',
    }));

    exportToCsv(exportData, `HOD_${departmentName}_Defaulters_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Attendance Defaulters List
            </h1>
            <span className="rounded-full bg-rose-100 px-3 py-0.5 text-xs font-semibold text-rose-800">
              Below 75% Threshold
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring department of <strong className="text-slate-800">{departmentName}</strong>. Students requiring attendance intervention.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDefaulters}
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
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCsv}
            disabled={filteredDefaulters.length === 0}
            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <FiDownload className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-xl font-bold text-slate-900">Attendance Defaulters Report (&lt; 75%)</h1>
        <p className="text-sm text-slate-600">Department: {departmentName} | Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Defaulters
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <FiUserX className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{defaulters.length}</p>
          <p className="mt-1 text-xs text-rose-600 font-medium">Students below mandatory 75%</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Critical Cases (&lt;60%)
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <FiAlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">{criticalCount}</p>
          <p className="mt-1 text-xs text-slate-500">Severe shortage &mdash; exam debar risk</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Warning Cases (60-74%)
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FiInfo className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{warningCount}</p>
          <p className="mt-1 text-xs text-slate-500">Can recover with consecutive attendance</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Defaulter Avg Attendance
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FiShield className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{avgAttendance}%</p>
          <p className="mt-1 text-xs text-slate-500">Mean rate across all defaulters</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <FiFilter className="text-slate-400 text-sm" />
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
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

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Severity Levels</option>
              <option value="Critical">Critical (&lt; 60%)</option>
              <option value="Warning">Warning (60% - 74.9%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : filteredDefaulters.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FiCheckCircle className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No Defaulters Found
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              All students in the selected criteria have 75% or higher attendance, or no attendance records exist yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Class / Roll</th>
                  <th className="px-6 py-3.5 text-center">Total</th>
                  <th className="px-6 py-3.5 text-center">Attended</th>
                  <th className="px-6 py-3.5 text-center">Missed</th>
                  <th className="px-6 py-3.5">Attendance %</th>
                  <th className="px-6 py-3.5">Severity</th>
                  <th className="px-6 py-3.5">Recovery Needed</th>
                  <th className="px-6 py-3.5 text-right print:hidden">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDefaulters.map((item) => {
                  const s = item.student || {};
                  const isCritical = item.severity === 'Critical';

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          ID: {s.studentId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800">
                          Sem {s.semester} - Div {s.division}
                        </div>
                        <div className="text-xs text-slate-500">Roll: {s.rollNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700 font-semibold">
                        {item.total}
                      </td>
                      <td className="px-6 py-4 text-center text-emerald-600 font-semibold">
                        {item.present}
                      </td>
                      <td className="px-6 py-4 text-center text-rose-600 font-semibold">
                        {item.absent}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className={isCritical ? 'text-red-600' : 'text-amber-600'}>
                              {item.percentage}%
                            </span>
                            <span className="text-[10px] text-slate-400">/ 75% req</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isCritical ? 'bg-red-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, item.percentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isCritical
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <FiAlertTriangle className="mr-1 h-3 w-3" />
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <span>+{item.neededClasses} consecutive</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right print:hidden">
                        <div className="flex items-center justify-end space-x-2">
                          {s.email && (
                            <a
                              href={`mailto:${s.email}?subject=Attendance Warning - Action Required&body=Dear ${s.name}, your current attendance is ${item.percentage}%, which is below the mandatory 75% requirement. You must attend the next ${item.neededClasses} consecutive classes.`}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                              title="Send Email Alert"
                            >
                              <FiMail className="h-4 w-4" />
                            </a>
                          )}
                          {s.phone && (
                            <a
                              href={`tel:${s.phone}`}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                              title="Call Student / Guardian"
                            >
                              <FiPhone className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HodDefaultersPage;
