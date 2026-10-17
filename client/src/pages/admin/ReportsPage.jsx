import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import {
  FiPrinter,
  FiFileText,
  FiBookOpen,
  FiUsers,
  FiSearch,
  FiFilter,
  FiDownload,
} from 'react-icons/fi';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'subject'
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [semesterFilter, setSemesterFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [semesterFilter]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const studentParams = semesterFilter ? { semester: semesterFilter } : {};
      const [stuRes, subRes, attRes] = await Promise.all([
        api.get('/students', { params: studentParams }),
        api.get('/subjects', { params: studentParams }),
        api.get('/attendance', { params: { limit: 2000, ...studentParams } }),
      ]);

      setStudents(stuRes.data.data);
      setSubjects(subRes.data.data);
      setAttendanceRecords(attRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. Calculate Student Reports
  const studentReports = students
    .map((stu) => {
      const stuRecords = attendanceRecords.filter(
        (r) => (r.student?._id || r.student) === stu._id
      );
      const total = stuRecords.length;
      const present = stuRecords.filter((r) => r.status === 'Present').length;
      const absent = stuRecords.filter((r) => r.status === 'Absent').length;
      const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      return {
        id: stu._id,
        studentId: stu.studentId,
        name: stu.name,
        rollNumber: stu.rollNumber,
        semester: stu.semester,
        division: stu.division,
        total,
        present,
        absent,
        percentage,
      };
    })
    .filter((stu) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        stu.name.toLowerCase().includes(q) ||
        stu.studentId.toLowerCase().includes(q) ||
        stu.rollNumber.toString().includes(q)
      );
    })
    .sort((a, b) => a.rollNumber - b.rollNumber);

  // 2. Calculate Subject Reports
  const subjectReports = subjects.map((sub) => {
    const subRecords = attendanceRecords.filter(
      (r) => (r.subject?._id || r.subject) === sub._id
    );
    const total = subRecords.length;
    const present = subRecords.filter((r) => r.status === 'Present').length;
    const absent = subRecords.filter((r) => r.status === 'Absent').length;
    const avgPercentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

    return {
      id: sub._id,
      code: sub.subjectCode,
      name: sub.subjectName,
      semester: sub.semester,
      totalClasses: total,
      present,
      absent,
      avgPercentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Title & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Attendance Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export consolidated student attendance summaries and course averages
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 transition"
          >
            <FiPrinter className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs and Filters (Hidden on Print) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <div className="flex rounded-xl bg-slate-100 p-1 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'student'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiUsers className="h-4 w-4" />
            <span>Student Attendance Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subject')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'subject'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiBookOpen className="h-4 w-4" />
            <span>Subject Averages Report</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === 'student' && (
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          )}

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Header (Visible only on print or clean view) */}
      <div className="hidden print:block mb-6 border-b border-slate-300 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Attendance Report — College of Engineering & Technology</h1>
        <p className="text-xs text-slate-600">Generated on {new Date().toLocaleString()} | Academic Year 2024-2025</p>
      </div>

      {/* Student Report Table */}
      {activeTab === 'student' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Student Attendance Summary
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
                  <th className="px-6 py-3.5 text-center">Total Classes</th>
                  <th className="px-6 py-3.5 text-center text-emerald-700">Present</th>
                  <th className="px-6 py-3.5 text-center text-rose-700">Absent</th>
                  <th className="px-6 py-3.5 w-44">Attendance %</th>
                  <th className="px-6 py-3.5 text-center">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      Loading attendance reports...
                    </td>
                  </tr>
                ) : studentReports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  studentReports.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        #{row.rollNumber}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-indigo-600 font-semibold">
                        {row.studentId}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {row.name}
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                        {row.total}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                        {row.present}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                        {row.absent}
                      </td>
                      <td className="px-6 py-3.5">
                        <ProgressBar percentage={row.percentage} height="h-2" />
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            row.percentage >= 75
                              ? 'bg-emerald-50 text-emerald-700'
                              : row.percentage >= 60
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {row.percentage >= 75 ? 'Eligible' : row.percentage >= 60 ? 'Warning' : 'Defaulter'}
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

      {/* Subject Report Table */}
      {activeTab === 'subject' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Subject Attendance Rates
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Subject Code</th>
                  <th className="px-6 py-3.5">Subject Name</th>
                  <th className="px-6 py-3.5 text-center">Semester</th>
                  <th className="px-6 py-3.5 text-center">Total Attendance Logs</th>
                  <th className="px-6 py-3.5 text-center text-emerald-700">Present Count</th>
                  <th className="px-6 py-3.5 text-center text-rose-700">Absent Count</th>
                  <th className="px-6 py-3.5 w-48">Average Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Loading subject reports...
                    </td>
                  </tr>
                ) : subjectReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  subjectReports.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                        {sub.code}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {sub.name}
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-600 font-semibold">
                        Sem {sub.semester}
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                        {sub.totalClasses}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                        {sub.present}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                        {sub.absent}
                      </td>
                      <td className="px-6 py-3.5">
                        <ProgressBar percentage={sub.avgPercentage} height="h-2" />
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

export default ReportsPage;
