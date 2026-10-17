import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import Modal from '../../components/Modal';
import ProgressBar from '../../components/ProgressBar';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiAlertTriangle,
  FiEye,
  FiRefreshCw,
} from 'react-icons/fi';

const TeacherStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  // Student Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedSemester, selectedDivision]);

  const fetchAssignedSubjects = async () => {
    try {
      const res = await api.get('/teacher/subjects');
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSemester) params.semester = selectedSemester;
      if (selectedDivision) params.division = selectedDivision;
      if (search) params.search = search;

      const res = await api.get('/teacher/students', { params });
      setStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (stu) => {
    setSelectedStudent(stu);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/attendance/student/${stu._id}/summary`);
      setStudentSummary(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredStudents = students.filter((stu) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      stu.name?.toLowerCase().includes(q) ||
      stu.studentId?.toLowerCase().includes(q) ||
      stu.rollNumber?.toString().includes(q) ||
      stu.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Attendance Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track individual student attendance progress and identify students needing academic intervention
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Enrolled Students: <span className="font-bold text-slate-900">{filteredStudents.length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Semesters</option>
            {[...new Set(subjects.map((s) => s.semester))].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Divisions</option>
            {['A', 'B', 'C'].map((d) => (
              <option key={d} value={d}>Division {d}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch('');
              setSelectedSemester('');
              setSelectedDivision('');
              fetchStudents();
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Class Allotment</th>
                <th className="px-6 py-3.5 text-center">Classes Conducted</th>
                <th className="px-6 py-3.5 text-center text-emerald-700">Attended</th>
                <th className="px-6 py-3.5 text-center text-rose-700">Missed</th>
                <th className="px-6 py-3.5 w-40">Attendance %</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading authorized students...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    No students match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      #{stu.rollNumber}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-indigo-600 font-semibold">
                      {stu.studentId}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">
                      {stu.name}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      Sem {stu.semester} • Div {stu.division}
                    </td>
                    <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                      {stu.totalClasses}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                      {stu.presentClasses}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                      {stu.absentClasses}
                    </td>
                    <td className="px-6 py-3.5">
                      <ProgressBar percentage={stu.percentage} height="h-2" />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          stu.totalClasses === 0
                            ? 'bg-slate-100 text-slate-600'
                            : stu.percentage >= 75
                            ? 'bg-emerald-50 text-emerald-700'
                            : stu.percentage >= 60
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {stu.totalClasses === 0
                          ? 'No Classes'
                          : stu.percentage >= 75
                          ? 'Eligible'
                          : stu.percentage >= 60
                          ? 'Warning'
                          : 'Shortage'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetail(stu)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        <FiEye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Student Attendance Portfolio"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-xs">
              <h3 className="font-bold text-sm text-slate-900">{selectedStudent.name}</h3>
              <p className="text-slate-600">Student ID: <span className="font-mono font-bold text-indigo-600">{selectedStudent.studentId}</span> • Roll #{selectedStudent.rollNumber}</p>
              <p className="text-slate-600">Class: Semester {selectedStudent.semester} (Division {selectedStudent.division}) • {selectedStudent.email}</p>
            </div>

            {loadingDetail ? (
              <div className="py-8 text-center text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-2" />
                <p className="text-xs">Loading course-wise breakdown...</p>
              </div>
            ) : studentSummary ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Course-Wise Attendance</h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-semibold text-slate-600">
                      <tr>
                        <th className="px-4 py-2">Subject</th>
                        <th className="px-4 py-2 text-center">Conducted</th>
                        <th className="px-4 py-2 text-center">Attended</th>
                        <th className="px-4 py-2 text-center">%</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentSummary.subjectWise?.map((sub) => (
                        <tr key={sub.subjectId}>
                          <td className="px-4 py-2 font-medium text-slate-800">{sub.subjectCode} - {sub.subjectName}</td>
                          <td className="px-4 py-2 text-center font-semibold">{sub.totalClasses}</td>
                          <td className="px-4 py-2 text-center font-bold text-emerald-600">{sub.presentClasses}</td>
                          <td className="px-4 py-2 text-center font-bold text-indigo-600">{sub.percentage}%</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              sub.totalClasses === 0 ? 'bg-slate-100 text-slate-600' :
                              sub.percentage >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {sub.totalClasses === 0 ? 'None' : sub.percentage >= 75 ? 'Safe' : 'Shortage'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherStudentsPage;
