import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import {
  FiBookOpen,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiUser,
  FiRefreshCw,
  FiCalendar,
} from 'react-icons/fi';

const initialSubjectForm = {
  subjectCode: '',
  subjectName: '',
  semester: 4,
  department: 'Information Technology',
  teacher: '',
};

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState(initialSubjectForm);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
  }, [semesterFilter]);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/auth/teachers');
      setTeachers(res.data.data || []);
    } catch (err) {
      console.warn('Could not fetch teacher list', err);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      const res = await api.get('/subjects', { params });
      setSubjects(res.data.data);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialSubjectForm);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setCurrentSubject(sub);
    setFormData({
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      semester: sub.semester,
      department: sub.department || 'Information Technology',
      teacher: sub.teacher?._id || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (sub) => {
    setCurrentSubject(sub);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/subjects', formData);
      success('Subject created successfully with assigned faculty!');
      setIsAddOpen(false);
      fetchSubjects();
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/subjects/${currentSubject._id}`, formData);
      success('Subject and teacher assignment updated successfully!');
      setIsEditOpen(false);
      fetchSubjects();
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.delete(`/subjects/${currentSubject._id}`);
      success(res.data.message || 'Subject deleted successfully!');
      setIsDeleteOpen(false);
      fetchSubjects();
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subject Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure course subjects, syllabus semesters, and assign authorized faculty teachers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-600">Filter Semester:</label>
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

        <button
          onClick={fetchSubjects}
          className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition"
        >
          <FiRefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-xs text-slate-500">Loading curriculum subjects...</p>
          </div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          No subjects created yet. Click "Add Subject" to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 font-mono">
                    {sub.subjectCode}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    Semester {sub.semester}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                  {sub.subjectName}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{sub.department}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <FiUser className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="truncate max-w-[130px] font-medium">
                    {sub.teacher?.name || 'No Faculty Assigned'}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 transition"
                    title="Edit subject"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(sub)}
                    className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                    title="Delete subject"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Subject">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Code * (e.g., IT301)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. IT301"
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Database Management System"
              value={formData.subjectName}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Teacher Assignment Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Faculty Teacher
            </label>
            <select
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            >
              <option value="">-- Select Faculty / Teacher --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.department || t.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Subject Details & Faculty Assignment">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Code *
            </label>
            <input
              type="text"
              required
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={formData.subjectName}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Teacher Assignment Selection in Edit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Faculty Teacher
            </label>
            <select
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            >
              <option value="">-- Select Faculty / Teacher --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.department || t.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Subject Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Subject Deletion">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete{' '}
            <strong className="text-slate-900">{currentSubject?.subjectCode} - {currentSubject?.subjectName}</strong>?
          </p>
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <strong>Warning:</strong> Deleting this subject will also safely remove all historical attendance records linked to this subject.
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDeleteSubmit}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete Subject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectsPage;
