import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { exportToCsv } from '../../utils/exportCsv';
import {
  FiUserCheck,
  FiPlus,
  FiSearch,
  FiFilter,
  FiTrash2,
  FiDownload,
  FiBookOpen,
  FiUsers,
  FiCalendar,
  FiRefreshCw,
} from 'react-icons/fi';

const TeacherAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    program: 'B.Sc. IT',
    semester: 4,
    division: 'A',
    academicYear: '2026-2027',
  });

  const { success, error } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchDropdowns();
  }, [academicYearFilter, divisionFilter, subjectFilter]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (subjectFilter) params.subject = subjectFilter;
      if (divisionFilter) params.division = divisionFilter;
      if (academicYearFilter) params.academicYear = academicYearFilter;

      const res = await api.get('/assignments', { params });
      setAssignments(res.data.data || []);
    } catch (err) {
      error(getErrorMessage(err, 'Failed to fetch teacher assignments'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [tRes, sRes, pRes] = await Promise.all([
        api.get('/auth/teachers'),
        api.get('/subjects'),
        api.get('/programs'),
      ]);
      setTeachers(tRes.data.data || []);
      setSubjects(sRes.data.data || []);
      setPrograms(pRes.data.data || []);
    } catch (err) {
      // non-critical failure
    }
  };

  const handleSubjectSelectChange = (subjectId) => {
    const selected = subjects.find((s) => s._id === subjectId);
    setFormData((prev) => ({
      ...prev,
      subject: subjectId,
      semester: selected ? selected.semester : prev.semester,
      program: selected?.program || prev.program,
    }));
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!formData.teacher || !formData.subject) {
      error('Please select both a faculty member and a subject');
      return;
    }

    try {
      await api.post('/assignments', formData);
      success('Faculty assignment created successfully');
      setIsModalOpen(false);
      setFormData({
        teacher: '',
        subject: '',
        program: 'B.Sc. IT',
        semester: 4,
        division: 'A',
        academicYear: '2026-2027',
      });
      fetchAssignments();
    } catch (err) {
      error(getErrorMessage(err, 'Failed to assign teacher'));
    }
  };

  const handleDeleteAssignment = async (id, teacherName, subjectName, division) => {
    if (!window.confirm(`Remove assignment of ${teacherName} for ${subjectName} (Div ${division})?`)) {
      return;
    }
    try {
      await api.delete(`/assignments/${id}`);
      success('Assignment deleted successfully');
      fetchAssignments();
    } catch (err) {
      error(getErrorMessage(err, 'Failed to delete assignment'));
    }
  };

  const handleExportCsv = () => {
    if (filteredAssignments.length === 0) return;
    const exportData = filteredAssignments.map((a) => ({
      'Teacher Name': a.teacher?.name || 'N/A',
      'Teacher Email': a.teacher?.email || 'N/A',
      'Teacher Dept': a.teacher?.department || 'N/A',
      'Subject Code': a.subject?.subjectCode || 'N/A',
      'Subject Name': a.subject?.subjectName || 'N/A',
      Program: a.program,
      Semester: a.semester,
      Division: a.division,
      'Academic Year': a.academicYear,
    }));
    exportToCsv(exportData, `Teacher_Assignments_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const filteredAssignments = assignments.filter((a) => {
    const teacherName = a.teacher?.name?.toLowerCase() || '';
    const subjectName = a.subject?.subjectName?.toLowerCase() || '';
    const subjectCode = a.subject?.subjectCode?.toLowerCase() || '';
    const q = search.toLowerCase();

    return !search || teacherName.includes(q) || subjectName.includes(q) || subjectCode.includes(q);
  });

  const uniqueTeachersCount = new Set(assignments.map((a) => a.teacher?._id)).size;
  const uniqueSubjectsCount = new Set(assignments.map((a) => a.subject?._id)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Teacher Subject &amp; Class Assignments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Assign faculty members to specific subjects, divisions (A&ndash;D), and academic sessions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAssignments}
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            disabled={filteredAssignments.length === 0}
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <FiDownload className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <FiPlus className="h-4 w-4" />
            <span>Assign Faculty</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Assignments
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FiUserCheck className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{assignments.length}</p>
          <p className="mt-1 text-xs text-slate-500">Active class allocations</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assigned Faculty
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiUsers className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{uniqueTeachersCount}</p>
          <p className="mt-1 text-xs text-slate-500">Faculty members with classes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Allocated Courses
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FiBookOpen className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{uniqueSubjectsCount}</p>
          <p className="mt-1 text-xs text-slate-500">Unique subjects covered</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Academic Year
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FiCalendar className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600">2026-2027</p>
          <p className="mt-1 text-xs text-slate-500">Active evaluation cycle</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectCode} - {sub.subjectName}
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
              value={academicYearFilter}
              onChange={(e) => setAcademicYearFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Academic Years</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FiUserCheck className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Assignments Found</h3>
            <p className="text-sm mt-1 text-slate-500">
              Click &quot;Assign Faculty&quot; above to link a teacher to a subject and division.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Faculty Member</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Program &amp; Sem</th>
                  <th className="px-6 py-3.5 text-center">Division</th>
                  <th className="px-6 py-3.5 text-center">Academic Year</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAssignments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{a.teacher?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.teacher?.email}</div>
                      <div className="text-xs text-indigo-600 font-semibold mt-0.5">
                        Dept: {a.teacher?.department || 'General'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {a.subject?.subjectName || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {a.subject?.subjectCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div>{a.program}</div>
                      <div className="text-xs text-slate-400">Semester {a.semester}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {a.division}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-mono font-medium text-slate-600">
                        {a.academicYear}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleDeleteAssignment(
                            a._id,
                            a.teacher?.name,
                            a.subject?.subjectName,
                            a.division
                          )
                        }
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete Assignment"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Faculty to Course &amp; Division"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Faculty Member *
            </label>
            <select
              required
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Faculty...</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.email}) - {t.department || 'General'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject *
            </label>
            <select
              required
              value={formData.subject}
              onChange={(e) => handleSubjectSelectChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Subject...</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} - {s.subjectName} (Sem {s.semester})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Program
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {programs.map((p) => (
                  <option key={p._id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Semester
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Division *
              </label>
              <select
                required
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
                <option value="D">Division D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Academic Year *
              </label>
              <select
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherAssignmentsPage;
