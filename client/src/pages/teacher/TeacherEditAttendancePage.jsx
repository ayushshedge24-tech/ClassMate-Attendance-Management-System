import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
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

    setSaving(true);
    try {
      const updatedList = records.map((r) => ({
        student: r.student?._id || r.student,
        status: r.status,
        remarks: r.remarks || '',
        session: selectedSession,
      }));

      const res = await api.post('/attendance', {
        subject: selectedSubject,
        date: selectedDate,
        session: selectedSession,
        records: updatedList,
      });

      success(res.data.message || 'Attendance records corrected successfully in MongoDB!');
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
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Loaded <strong className="text-slate-900">{records.length} student records</strong> for {selectedDate} ({selectedSession})
          </p>

          <button
            type="button"
            onClick={handleSaveCorrections}
            disabled={saving}
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FiSave className="h-4 w-4" />
            )}
            <span>Save Corrections</span>
          </button>
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
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {rec.student?.name}
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
    </div>
  );
};

export default TeacherEditAttendancePage;
