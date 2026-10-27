import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import {
  FiEdit3,
  FiCalendar,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSave,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowRight,
  FiShield,
} from 'react-icons/fi';

const TeacherEditAttendancePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSubject = searchParams.get('subject') || '';
  const initialDate = searchParams.get('date') || new Date().toISOString().substring(0, 10);
  const initialSession = searchParams.get('session') || 'Lecture 1';

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSession, setSelectedSession] = useState(initialSession);

  const [records, setRecords] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [auditRecord, setAuditRecord] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const { success, error, info } = useToast();

  // 1. Fetch assigned subjects
  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  const fetchAssignedSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await api.get('/teacher/subjects');
      const subs = res.data.data || [];
      setSubjects(subs);
      if (subs.length > 0) {
        if (initialSubject && subs.some((s) => s._id === initialSubject)) {
          setSelectedSubject(initialSubject);
        } else {
          setSelectedSubject(subs[0]._id);
        }
      }
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoadingSubjects(false);
    }
  };

  // 2. Load attendance records for the selected subject, date, and session
  useEffect(() => {
    if (selectedSubject && selectedDate) {
      loadAttendanceRecords();
    }
  }, [selectedSubject, selectedDate, selectedSession]);

  const loadAttendanceRecords = async () => {
    setLoadingRecords(true);
    try {
      const params = {
        subject: selectedSubject,
        date: selectedDate,
        session: selectedSession,
        limit: 100,
      };

      const res = await api.get('/attendance', { params });
      setRecords(res.data.data || []);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleStatusToggle = (recordId, newStatus) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec._id === recordId ? { ...rec, status: newStatus, isDirty: true } : rec
      )
    );
  };

  const handleRemarksChange = (recordId, newRemarks) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec._id === recordId ? { ...rec, remarks: newRemarks, isDirty: true } : rec
      )
    );
  };

  const handleSaveCorrections = async () => {
    if (records.length === 0) {
      error('No attendance records loaded to edit');
      return;
    }

    const dirtyRecords = records.filter((r) => r.isDirty);
    if (dirtyRecords.length === 0) {
      info('No modifications were made. Toggle status or change remarks to save corrections.');
      return;
    }

    setSaving(true);
    try {
      // Update each modified record via PUT to record full audit history
      await Promise.all(
        dirtyRecords.map((r) =>
          api.put(`/attendance/${r._id}`, {
            status: r.status,
            remarks: r.remarks || '',
            session: selectedSession,
            reason: correctionReason || 'Attendance corrected by faculty',
          })
        )
      );

      success(`Successfully updated ${dirtyRecords.length} attendance record(s) with audit history!`);
      setCorrectionReason('');
      loadAttendanceRecords();
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Previously Marked Attendance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Faculty correction tool to inspect and update attendance statuses and faculty remarks
          </p>
        </div>

        {records.length > 0 && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <FiCheckCircle className="h-4 w-4" />
              <span>Present: {presentCount}</span>
            </div>
            <div className="flex items-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
              <FiXCircle className="h-4 w-4" />
              <span>Absent: {absentCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Select Subject, Date, and Session */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Assigned Subject *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectCode} - {sub.subjectName} (Sem {sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Attendance Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Session / Lecture *
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              <option value="Lecture 1">Lecture 1</option>
              <option value="Lecture 2">Lecture 2</option>
              <option value="Lecture 3">Lecture 3</option>
              <option value="Lecture 4">Lecture 4</option>
              <option value="Lab Practical">Lab / Practical</option>
              <option value="Tutorial">Tutorial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      {records.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 max-w-md">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Revision Reason / Justification <span className="text-slate-400 font-normal">(Recorded in Audit Log)</span>
            </label>
            <input
              type="text"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g., Medical leave approved, Proxy attendance rectified..."
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <p className="text-xs text-slate-500">
              Loaded <strong className="text-slate-900">{records.length} records</strong>
            </p>

            <button
              type="button"
              onClick={handleSaveCorrections}
              disabled={saving}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              <span>Save Corrections</span>
            </button>
          </div>
        </div>
      )}

      {/* Records Edit Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5 w-20">Roll No</th>
                <th className="px-6 py-3.5 w-28">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5 text-center w-52">Correct Status</th>
                <th className="px-6 py-3.5 w-72">Correction Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingRecords ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading attendance records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <FiAlertCircle className="h-10 w-10 text-slate-300" />
                      <p className="font-semibold text-slate-700 text-sm">
                        No attendance recorded on this date & session
                      </p>
                      <p className="text-xs max-w-sm">
                        There are no recorded attendance entries for this subject on {selectedDate} ({selectedSession}).
                      </p>
                      <button
                        onClick={() =>
                          navigate(
                            `/teacher/mark-attendance?subject=${selectedSubject}`
                          )
                        }
                        className="mt-3 flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                      >
                        <span>Mark Attendance for this Date</span>
                        <FiArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr
                    key={rec._id}
                    className={`transition-colors ${
                      rec.status === 'Absent' ? 'bg-rose-50/30' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-6 py-3 font-bold text-slate-900">
                      #{rec.student?.rollNumber || '-'}
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-600 font-semibold">
                      {rec.student?.studentId}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-semibold text-slate-800">
                        {rec.student?.name}
                      </div>
                      {rec.editHistory && rec.editHistory.length > 0 && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAuditRecord(rec);
                              setIsAuditOpen(true);
                            }}
                            className="inline-flex items-center space-x-1 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 transition"
                            title="View Revision Audit Log"
                          >
                            <FiClock className="h-3 w-3" />
                            <span>Edited ({rec.editHistory.length}x)</span>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="inline-flex rounded-xl bg-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(rec._id, 'Present')}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-semibold text-xs transition ${
                            rec.status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FiCheck className="h-3.5 w-3.5" />
                          <span>Present</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(rec._id, 'Absent')}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-semibold text-xs transition ${
                            rec.status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FiX className="h-3.5 w-3.5" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={rec.remarks || ''}
                        onChange={(e) => handleRemarksChange(rec._id, e.target.value)}
                        placeholder="Reason for status change..."
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit History Modal */}
      <Modal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        title="Attendance Record Audit History"
      >
        {auditRecord && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1">
              <p>
                <span className="font-semibold text-slate-600">Student:</span>{' '}
                {auditRecord.student?.name} ({auditRecord.student?.studentId})
              </p>
              <p>
                <span className="font-semibold text-slate-600">Subject:</span>{' '}
                {subjects.find((s) => s._id === selectedSubject)?.subjectCode} -{' '}
                {subjects.find((s) => s._id === selectedSubject)?.subjectName}
              </p>
              <p>
                <span className="font-semibold text-slate-600">Date &amp; Session:</span>{' '}
                {new Date(auditRecord.date).toLocaleDateString()} &mdash; {selectedSession}
              </p>
              <p>
                <span className="font-semibold text-slate-600">Current Status:</span>{' '}
                <strong
                  className={
                    auditRecord.status === 'Present' ? 'text-emerald-600' : 'text-rose-600'
                  }
                >
                  {auditRecord.status}
                </strong>
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Audit Timeline ({auditRecord.editHistory?.length || 0} revisions)
              </h4>

              {(!auditRecord.editHistory || auditRecord.editHistory.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No previous revisions logged for this student.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {auditRecord.editHistory
                    .slice()
                    .reverse()
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            {item.editedBy?.name || 'Faculty Member'}{' '}
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({item.editedBy?.role || 'teacher'})
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.editedAt ? new Date(item.editedAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-slate-500">Status change:</span>
                          <span className="font-semibold text-slate-600 line-through">
                            {item.previousStatus}
                          </span>
                          <span className="text-slate-400">&rarr;</span>
                          <span
                            className={`font-bold ${
                              item.newStatus === 'Present' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {item.newStatus}
                          </span>
                        </div>

                        {item.reason && (
                          <div className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2 mt-1">
                            <span className="font-semibold text-slate-500">Reason: </span>
                            {item.reason}
                          </div>
                        )}

                        {item.previousRemarks !== item.newRemarks && (
                          <p className="text-[11px] text-slate-500 italic">
                            Remarks: &quot;{item.previousRemarks || 'none'}&quot; &rarr; &quot;
                            {item.newRemarks || 'none'}&quot;
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAuditOpen(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherEditAttendancePage;
