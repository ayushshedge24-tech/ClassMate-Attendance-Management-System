import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../services/api';
import {
  FiCalendar,
  FiBookOpen,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi';

const StudentAttendanceHistory = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      fetchAttendance();
    }
  }, [user, selectedSubject, selectedMonth, startDate, endDate, statusFilter]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects', {
        params: { semester: user?.semester },
      });
      setSubjects(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedMonth) params.month = selectedMonth;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get(`/attendance/student/${user._id}`, { params });
      setRecords(res.data.data || []);
      setCurrentPage(1); // reset to page 1 on filter change
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedSubject('');
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalRecords = records.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const rate = totalRecords > 0 ? Number(((presentCount / totalRecords) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Day-Wise Attendance History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete, chronological ledger of all instructional classes conducted and your attendance status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            Total Sessions: <span className="font-bold text-slate-900">{totalRecords}</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
            Present: <span className="font-bold">{presentCount}</span>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700">
            Absent: <span className="font-bold">{absentCount}</span>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
            Rate: <span className="font-bold">{rate}%</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Filter by Subject */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="">All Curriculum Subjects</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectCode} - {sub.subjectName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Month */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setStartDate('');
                setEndDate('');
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Filter by Date Range (From) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Date Range From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedMonth('');
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Filter by Date Range (To) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Date Range To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedMonth('');
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Status Filter & Reset */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Present">Present Only</option>
                <option value="Absent">Absent Only</option>
              </select>
            </div>
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Day-Wise Attendance Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Day of Week</th>
                <th className="px-6 py-3.5">Subject Code</th>
                <th className="px-6 py-3.5">Subject Name</th>
                <th className="px-6 py-3.5">Lecture / Session</th>
                <th className="px-6 py-3.5 text-center">Attendance Status</th>
                <th className="px-6 py-3.5">Faculty / Marked By</th>
                <th className="px-6 py-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading attendance history records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <FiCalendar className="h-10 w-10 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">No attendance records found</p>
                      <p className="text-xs max-w-sm">
                        No instructional classes match your selected filters. Try broadening your date range or subject filter.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => {
                  const recDate = new Date(rec.date);
                  const dayName = recDate.toLocaleDateString('en-US', { weekday: 'long' });
                  const dateStr = recDate.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={rec._id}
                      className={`transition-colors ${
                        rec.status === 'Absent' ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-6 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-medium">
                        {dayName}
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                        {rec.subject?.subjectCode || '-'}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">
                        {rec.subject?.subjectName || 'Unknown Subject'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-medium">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {rec.session || 'Lecture 1'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-xs ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm'
                              : 'bg-rose-50 text-rose-700 border border-rose-300 shadow-sm'
                          }`}
                        >
                          {rec.status === 'Present' ? (
                            <FiCheckCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <FiXCircle className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
                          )}
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {rec.markedBy?.name || rec.subject?.teacher?.name || 'Faculty Staff'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {rec.remarks || (rec.status === 'Present' ? 'Regular lecture' : 'Absent')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-3.5 bg-slate-50/50 gap-3">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * itemsPerPage, totalRecords)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{totalRecords}</span> recorded sessions
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <FiChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-medium text-slate-600 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <span>Next</span>
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceHistory;
