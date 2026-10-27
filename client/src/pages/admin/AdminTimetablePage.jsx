import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiClock,
  FiMapPin,
  FiUser,
  FiBookOpen,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const initialForm = {
  department: 'Information Technology',
  course: 'B.Tech Information Technology',
  semester: 4,
  division: 'A',
  subject: '',
  teacher: '',
  classroom: 'Room 301',
  dayOfWeek: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
  sessionType: 'Theory',
};

const AdminTimetablePage = () => {
  const { user, isHod } = useAuth();
  const { success, error } = useToast();

  const [entries, setEntries] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [semesterFilter, setSemesterFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [semesterFilter, divisionFilter, dayFilter]);

  const fetchPrerequisites = async () => {
    try {
      const [subRes, teachRes, progRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/auth/teachers'),
        api.get('/programs'),
      ]);

      const subs = subRes.data?.data || [];
      const teachs = teachRes.data?.data || [];
      const progs = progRes.data?.data || [];

      setSubjects(subs);
      setTeachers(teachs);
      setPrograms(progs);

      if (subs.length > 0 && teachs.length > 0) {
        setFormData((prev) => ({
          ...prev,
          subject: subs[0]._id,
          teacher: teachs[0]._id,
          department: isHod ? user.department : prev.department,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (divisionFilter) params.division = divisionFilter;
      if (dayFilter) params.dayOfWeek = dayFilter;

      const res = await api.get('/timetable', { params });
      setEntries(res.data?.data || []);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/timetable', formData);
      if (res.data?.success) {
        success('Timetable slot scheduled successfully!');
        setIsAddOpen(false);
        fetchTimetable();
      }
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable slot?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      success('Timetable entry deleted.');
      fetchTimetable();
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Timetable Scheduler
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage weekly class routines with automated conflict and double-booking detection
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition self-start sm:self-auto"
        >
          <FiPlus className="h-4 w-4" />
          <span>Add Timetable Slot</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Day of Week</label>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="">All Days</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Semester</label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Division</label>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="">All Divisions</option>
              {['A', 'B', 'C', 'D'].map((d) => (
                <option key={d} value={d}>Division {d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSemesterFilter('');
                setDivisionFilter('');
                setDayFilter('');
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Day & Time</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Class / Div</th>
                <th className="px-6 py-3.5">Classroom</th>
                <th className="px-6 py-3.5">Assigned Faculty</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Loading timetable...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">No timetable slots match criteria.</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      <div>{entry.dayOfWeek}</div>
                      <div className="font-mono text-xs text-indigo-600 font-semibold mt-0.5">
                        {entry.startTime} – {entry.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {entry.subject?.subjectCode} — {entry.subject?.subjectName}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
                        Sem {entry.semester} • Div {entry.division}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">
                      {entry.classroom}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {entry.teacher?.name}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {entry.sessionType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(entry._id)}
                        title="Delete slot"
                        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule New Timetable Slot">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week *</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type</label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="Tutorial">Tutorial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time (HH:mm) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 09:00"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time (HH:mm) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 10:00"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              required
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} — {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Teacher *</label>
            <select
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              required
            >
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Division *</label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              >
                {['A', 'B', 'C', 'D'].map((d) => (
                  <option key={d} value={d}>Div {d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classroom *</label>
              <input
                type="text"
                required
                placeholder="e.g. Room 301"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
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
              {submitting ? 'Checking Collisions...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTimetablePage;
