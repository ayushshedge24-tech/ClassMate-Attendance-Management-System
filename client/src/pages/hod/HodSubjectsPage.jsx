import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { exportToCsv } from '../../utils/exportCsv';
import {
  FiBookOpen,
  FiSearch,
  FiPlus,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiLayers,
} from 'react-icons/fi';

const HodSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters
  const [semesterFilter, setSemesterFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    semester: 4,
    program: 'B.Sc. IT',
    teacher: '',
  });

  const { success, error } = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchDepartmentTeachers();
  }, [semesterFilter]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      const res = await api.get('/hod/subjects', { params });
      setSubjects(res.data.data || []);
      setDepartmentName(res.data.department || 'Department');
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentTeachers = async () => {
    try {
      const res = await api.get('/hod/teachers');
      setTeachers(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    const today = new Date().toISOString().substring(0, 10);
    const columns = [
      { label: 'Subject Code', key: 'subjectCode' },
      { label: 'Subject Title', key: 'subjectName' },
      { label: 'Semester', key: 'semester' },
      { label: 'Program', key: 'program' },
      { label: 'Faculty In-Charge', accessor: (s) => s.teacher?.name || 'Unassigned' },
      { label: 'Department', key: 'department' },
    ];
    exportToCsv(columns, filteredSubjects, `hod-${departmentName.toLowerCase().replace(/\s+/g, '-')}-subjects-${today}.csv`);
  };

  const handleOpenAdd = () => {
    setFormData({
      subjectCode: '',
      subjectName: '',
      semester: 4,
      program: 'B.Sc. IT',
      teacher: teachers[0]?._id || '',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setSelectedSubject(sub);
    setFormData({
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      semester: sub.semester || 1,
      program: sub.program || 'B.Sc. IT',
      teacher: sub.teacher?._id || '',
    });
    setIsEditOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        department: departmentName,
      };

      if (isEditOpen && selectedSubject) {
        await api.put(`/subjects/${selectedSubject._id}`, payload);
        success('Subject updated successfully');
        setIsEditOpen(false);
      } else {
        await api.post('/subjects', payload);
        success('Curriculum course added successfully');
        setIsAddOpen(false);
      }
      fetchSubjects();
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  const filteredSubjects = subjects.filter((sub) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      sub.subjectCode?.toLowerCase().includes(q) ||
      sub.subjectName?.toLowerCase().includes(q) ||
      sub.teacher?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {departmentName} — Curriculum Subjects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department courses, syllabus modules, semester allocations, and appointed instructors
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <FiDownload className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by subject code, title, or instructor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <span className="text-xs font-semibold text-slate-500">
            Total: <span className="text-slate-900 font-bold">{filteredSubjects.length}</span>
          </span>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Subject Code</th>
                <th className="py-3.5 px-4">Course Title</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Program</th>
                <th className="py-3.5 px-4">Appointed Faculty</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-2" />
                    Loading department course catalog...
                  </td>
                </tr>
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {sub.subjectCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {sub.subjectName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        Semester {sub.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {sub.program || 'B.Sc. IT'}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.teacher ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                            {sub.teacher.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{sub.teacher.name}</p>
                            <p className="text-[11px] text-slate-400">{sub.teacher.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="Edit Subject"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No curriculum subjects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Subject Modal */}
      {(isAddOpen || isEditOpen) && (
        <Modal
          title={isEditOpen ? 'Edit Curriculum Course' : 'Add New Department Course'}
          onClose={() => {
            setIsAddOpen(false);
            setIsEditOpen(false);
          }}
        >
          <form onSubmit={handleSaveSubject} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT401"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })}
                  disabled={isEditOpen}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Semester *</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Course Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineering & Agile Methodologies"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Program *</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="B.Sc. IT">B.Sc. IT</option>
                  <option value="B.Sc. CS">B.Sc. CS</option>
                  <option value="B.Sc. DS">B.Sc. DS</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Sc. IT">M.Sc. IT</option>
                  <option value="M.Sc. CS">M.Sc. CS</option>
                  <option value="M.Sc. DS">M.Sc. DS</option>
                  <option value="M.Tech">M.Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Appointed Faculty</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                {isEditOpen ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HodSubjectsPage;
