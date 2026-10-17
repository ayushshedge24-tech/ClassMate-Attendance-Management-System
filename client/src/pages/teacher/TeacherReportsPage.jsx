import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import {
  FiFileText,
  FiPrinter,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiAlertTriangle,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';

const TeacherReportsPage = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'student';
  const initialSubject = searchParams.get('subject') || '';

  const [reportType, setReportType] = useState(initialType); // 'student', 'subject', 'daily', 'monthly'
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [search, setSearch] = useState('');

  const [reportData, setReportData] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedSubject, selectedDate, selectedMonth]);

  const fetchAssignedSubjects = async () => {
    try {
      const res = await api.get('/teacher/subjects');
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        type: reportType,
      };
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedDate) params.date = selectedDate;
      if (selectedMonth) params.month = selectedMonth;

      const res = await api.get('/teacher/reports', { params });
      setReportData(res.data.data || []);
      setReportSummary(res.data.summary || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredStudentReport =
    reportType === 'student'
      ? reportData.filter((stu) => {
          if (!search) return true;
          const q = search.toLowerCase();
          return (
            stu.name?.toLowerCase().includes(q) ||
            stu.studentId?.toLowerCase().includes(q) ||
            stu.rollNumber?.toString().includes(q)
          );
        })
      : reportData;

  return (
    <div className="space-y-6">
      {/* Title & Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Faculty Attendance Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated reports for student attendance, subject averages, daily sessions, and monthly audits
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 transition self-start sm:self-auto"
        >
          <FiPrinter className="h-4 w-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 no-print">
        <div className="flex rounded-xl bg-slate-100 p-1 w-full lg:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setReportType('student')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              reportType === 'student'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiUsers className="h-4 w-4" />
            <span>Student-Wise Report</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('subject')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              reportType === 'subject'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiBookOpen className="h-4 w-4" />
            <span>Subject Averages</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('daily')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              reportType === 'daily'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiCalendar className="h-4 w-4" />
            <span>Daily Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('monthly')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              reportType === 'monthly'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiFileText className="h-4 w-4" />
            <span>Monthly Audit</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {reportType === 'student' && (
            <div className="relative flex-1 sm:w-48">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          )}

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All My Assigned Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>

          {reportType === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          )}

          {reportType === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-6 border-b border-slate-300 pb-3">
        <h1 className="text-xl font-bold text-slate-900">
          Faculty Attendance Report — Teach Us AMS Portal
        </h1>
        <p className="text-xs text-slate-600">
          Generated on {new Date().toLocaleString()} | Faculty In-Charge Report
        </p>
      </div>

      {/* 1. Student-Wise Report Table */}
      {reportType === 'student' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Student Attendance Performance
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Standard eligibility threshold: <strong>75%</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Student ID</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Class</th>
                  <th className="px-6 py-3.5 text-center">Total Classes</th>
                  <th className="px-6 py-3.5 text-center text-emerald-700">Present Count</th>
                  <th className="px-6 py-3.5 text-center text-rose-700">Absent Count</th>
                  <th className="px-6 py-3.5 w-44">Attendance %</th>
                  <th className="px-6 py-3.5 text-center">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      Generating student attendance report...
                    </td>
                  </tr>
                ) : filteredStudentReport.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudentReport.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        #{row.rollNumber}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-indigo-600 font-semibold">
                        {row.studentId}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {row.name}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        Sem {row.semester} ({row.division})
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                        {row.totalClasses}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                        {row.presentClasses}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                        {row.absentClasses}
                      </td>
                      <td className="px-6 py-3.5">
                        <ProgressBar percentage={row.percentage} height="h-2" />
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            row.status === 'Eligible'
                              ? 'bg-emerald-50 text-emerald-700'
                              : row.status === 'Warning'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Subject-Wise Report Table */}
      {reportType === 'subject' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Assigned Subjects Attendance Rate Summary
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Subject Code</th>
                  <th className="px-6 py-3.5">Subject Name</th>
                  <th className="px-6 py-3.5 text-center">Semester</th>
                  <th className="px-6 py-3.5 text-center">Lectures Held</th>
                  <th className="px-6 py-3.5 text-center">Total Logs</th>
                  <th className="px-6 py-3.5 text-center text-emerald-700">Present</th>
                  <th className="px-6 py-3.5 text-center text-rose-700">Absent</th>
                  <th className="px-6 py-3.5 w-44">Average Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      Loading subject attendance report...
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  reportData.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                        {sub.subjectCode}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {sub.subjectName}
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-600">
                        Sem {sub.semester}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                        {sub.totalLectures}
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                        {sub.totalRecords}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                        {sub.presentCount}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                        {sub.absentCount}
                      </td>
                      <td className="px-6 py-3.5">
                        <ProgressBar percentage={sub.averagePercentage} height="h-2" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Daily Attendance Report */}
      {reportType === 'daily' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Daily Attendance Report for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            {reportSummary && (
              <span className="text-xs text-slate-600">
                Total: <strong>{reportSummary.total}</strong> • Rate: <strong className="text-indigo-600">{reportSummary.percentage}%</strong>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Student ID</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Session</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Loading daily report...
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No attendance sessions recorded on {selectedDate}.
                    </td>
                  </tr>
                ) : (
                  reportData.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        #{rec.student?.rollNumber}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-indigo-600 font-semibold">
                        {rec.student?.studentId}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {rec.student?.name}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">
                        {rec.subject?.subjectCode} - {rec.subject?.subjectName}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {rec.session || 'Lecture 1'}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {rec.remarks || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Monthly Audit Report */}
      {reportType === 'monthly' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Monthly Subject Audit ({selectedMonth})
            </h3>
            {reportSummary && (
              <span className="text-xs text-slate-600">
                Monthly Total: <strong>{reportSummary.total}</strong> • Present: <strong>{reportSummary.present}</strong> • Rate: <strong className="text-indigo-600">{reportSummary.percentage}%</strong>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Subject Code</th>
                  <th className="px-6 py-3.5">Subject Name</th>
                  <th className="px-6 py-3.5 text-center">Semester</th>
                  <th className="px-6 py-3.5 text-center">Total Logs</th>
                  <th className="px-6 py-3.5 text-center text-emerald-700">Present</th>
                  <th className="px-6 py-3.5 text-center text-rose-700">Absent</th>
                  <th className="px-6 py-3.5 w-44">Monthly Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Compiling monthly audit...
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No records found for {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  reportData.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                        {sub.subjectCode}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {sub.subjectName}
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-600">
                        Sem {sub.semester}
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                        {sub.total}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                        {sub.present}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                        {sub.absent}
                      </td>
                      <td className="px-6 py-3.5">
                        <ProgressBar percentage={sub.percentage} height="h-2" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherReportsPage;
