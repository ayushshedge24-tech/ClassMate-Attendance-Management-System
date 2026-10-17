import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import {
  FiFilter,
  FiSearch,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

const TeacherAttendanceHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Quick Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('Present');
  const [editRemarks, setEditRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [page, selectedSubject, selectedDate, statusFilter]);

  const fetchAssignedSubjects = async () => {
    try {
      const res = await api.get('/teacher/subjects');
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedDate) params.date = selectedDate;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/attendance', { params });
      setRecords(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalRecords(res.data.total || 0);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditRemarks(rec.remarks || '');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/attendance/${editingRecord._id}`, {
        status: editStatus,
        remarks: editRemarks,
      });
      success('Attendance record updated successfully!');
      setIsEditOpen(false);
      fetchRecords();
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSelectedSubject('');
    setSelectedDate('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Faculty Attendance Ledger & History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and inspect verified attendance logs across your assigned courses
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total Logs: <span className="text-slate-900 font-bold">{totalRecords}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Course / Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="">All My Assigned Subjects</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectCode} - {sub.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Attendance Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Session</th>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Remarks</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading attendance history...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No attendance records match your filter criteria.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-slate-800 font-semibold whitespace-nowrap">
                      {new Date(rec.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-bold text-indigo-600">{rec.subject?.subjectCode}</span>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{rec.subject?.subjectName}</p>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {rec.session || 'Lecture 1'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      #{rec.student?.rollNumber || '-'}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">
                      {rec.student?.name}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-xs ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rec.status === 'Present' ? (
                          <FiCheckCircle className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <FiXCircle className="mr-1 h-3.5 w-3.5 text-rose-600" />
                        )}
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {rec.remarks || '-'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(rec)}
                        className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 transition"
                        title="Quick edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <FiChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <span>Next</span>
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Attendance Status">
        {editingRecord && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1">
              <p><span className="font-semibold text-slate-600">Student:</span> {editingRecord.student?.name} ({editingRecord.student?.studentId})</p>
              <p><span className="font-semibold text-slate-600">Subject:</span> {editingRecord.subject?.subjectCode} - {editingRecord.subject?.subjectName}</p>
              <p><span className="font-semibold text-slate-600">Date:</span> {new Date(editingRecord.date).toLocaleDateString()}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Change Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditStatus('Present')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-bold transition ${
                    editStatus === 'Present'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FiCheckCircle className="h-4 w-4" />
                  <span>Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditStatus('Absent')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-bold transition ${
                    editStatus === 'Absent'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FiXCircle className="h-4 w-4" />
                  <span>Absent</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
              <input
                type="text"
                placeholder="Reason for change..."
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
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
                {submitting ? 'Saving...' : 'Update Record'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default TeacherAttendanceHistoryPage;
