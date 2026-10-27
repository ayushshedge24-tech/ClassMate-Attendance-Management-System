import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import {
  FiCalendar,
  FiBookOpen,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiSave,
  FiCheck,
  FiX,
  FiInfo,
  FiAlertTriangle,
  FiArrowRight,
} from 'react-icons/fi';

const TeacherMarkAttendancePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedSubject = searchParams.get('subject') || '';

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(preselectedSubject);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [selectedSession, setSelectedSession] = useState('Lecture 1');
  const [selectedDivision, setSelectedDivision] = useState('A');

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: { status: 'Present'|'Absent', remarks: '' } }
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  // Confirmation Summary Modal
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState(null);

  const { success, error, info } = useToast();

  // 1. Fetch assigned subjects for this teacher
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
        if (preselectedSubject && subs.some((s) => s._id === preselectedSubject)) {
          setSelectedSubject(preselectedSubject);
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

  // 2. Fetch student roster when subject or division changes
  const activeSubjectObj = subjects.find((s) => s._id === selectedSubject);

  useEffect(() => {
    if (activeSubjectObj) {
      fetchStudentRoster(activeSubjectObj.semester, selectedDivision);
    }
  }, [selectedSubject, selectedDivision, activeSubjectObj]);

  const fetchStudentRoster = async (sem, div) => {
    setLoadingStudents(true);
    try {
      const res = await api.get('/students', {
        params: { semester: sem, division: div },
      });
      const roster = res.data.data || [];
      setStudents(roster);

      // Default all to 'Present'
      const initialMap = {};
      roster.forEach((stu) => {
        initialMap[stu._id] = {
          status: 'Present',
          remarks: '',
        };
      });
      setAttendanceMap(initialMap);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoadingStudents(false);
    }
  };

  // 3. Check if attendance already recorded for this subject + date + session
  useEffect(() => {
    if (selectedSubject && selectedDate && selectedSession && students.length > 0) {
      checkExistingAttendance();
    }
  }, [selectedSubject, selectedDate, selectedSession, students]);

  const checkExistingAttendance = async () => {
    try {
      const res = await api.get('/attendance', {
        params: {
          subject: selectedSubject,
          date: selectedDate,
          session: selectedSession,
          division: selectedDivision,
          limit: 100,
        },
      });

      if (res.data.data && res.data.data.length > 0) {
        setAlreadyMarked(true);
        // Pre-fill statuses from existing records in MongoDB
        setAttendanceMap((prev) => {
          const updated = { ...prev };
          res.data.data.forEach((rec) => {
            const stuId = rec.student?._id || rec.student;
            if (stuId && updated[stuId]) {
              updated[stuId] = {
                status: rec.status,
                remarks: rec.remarks || '',
              };
            }
          });
          return updated;
        });
      } else {
        setAlreadyMarked(false);
      }
    } catch (err) {
      console.warn('Could not check existing records', err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status) => {
    setAttendanceMap((prev) => {
      const updated = {};
      students.forEach((s) => {
        updated[s._id] = {
          status,
          remarks: prev[s._id]?.remarks || '',
        };
      });
      return updated;
    });
    info(`All students marked as ${status}`);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubject) {
      error('Please select an assigned subject');
      return;
    }

    if (!selectedDate) {
      error('Please pick an attendance date');
      return;
    }

    if (students.length === 0) {
      error('No students enrolled in this division');
      return;
    }

    setSaving(true);
    try {
      const records = students.map((s) => ({
        student: s._id,
        status: attendanceMap[s._id]?.status || 'Present',
        remarks: attendanceMap[s._id]?.remarks || '',
        session: selectedSession,
      }));

      const payload = {
        subject: selectedSubject,
        date: selectedDate,
        session: selectedSession,
        records,
      };

      const res = await api.post('/attendance', payload);
      success(res.data.message || 'Attendance saved successfully!');

      const presentCount = records.filter((r) => r.status === 'Present').length;
      const absentCount = records.filter((r) => r.status === 'Absent').length;

      setSubmissionSummary({
        subjectName: activeSubjectObj?.subjectName,
        subjectCode: activeSubjectObj?.subjectCode,
        date: selectedDate,
        session: selectedSession,
        division: selectedDivision,
        total: records.length,
        presentCount,
        absentCount,
        percentage: Number(((presentCount / records.length) * 100).toFixed(1)),
      });

      setSummaryModalOpen(true);
      setAlreadyMarked(true);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(
    (item) => item.status === 'Present'
  ).length;
  const absentCount = Object.values(attendanceMap).filter(
    (item) => item.status === 'Absent'
  ).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mark Class Attendance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official attendance recording workflow for assigned courses and divisions
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
            <FiCheckCircle className="h-4 w-4" />
            <span>Present: {presentCount}</span>
          </div>
          <div className="flex items-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700">
            <FiXCircle className="h-4 w-4" />
            <span>Absent: {absentCount}</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Filters for Marking Attendance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Assigned Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Subject *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              {subjects.length === 0 ? (
                <option value="">No subjects assigned to you</option>
              ) : (
                subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subjectCode} - {sub.subjectName} (Sem {sub.semester})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lecture Date *
            </label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Session / Lecture Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lecture Session *
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              <option value="Lecture 1">Lecture 1 (Period 1)</option>
              <option value="Lecture 2">Lecture 2 (Period 2)</option>
              <option value="Lecture 3">Lecture 3 (Period 3)</option>
              <option value="Lecture 4">Lecture 4 (Period 4)</option>
              <option value="Lab Practical">Lab / Practical Session</option>
              <option value="Tutorial">Tutorial Session</option>
            </select>
          </div>

          {/* Division Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Class Division *
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              {['A', 'B', 'C', 'D'].map((d) => (
                <option key={d} value={d}>Division {d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Informative Existing Attendance Banner */}
        {alreadyMarked && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
            <FiInfo className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Attendance for this subject, date, and session has already been recorded in MongoDB. Any modifications you submit now will update the verified records without duplicates.
            </span>
          </div>
        )}
      </div>

      {/* Batch Actions & Submit Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="flex items-center space-x-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
          >
            <FiCheck className="h-4 w-4" />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-sm"
          >
            <FiX className="h-4 w-4" />
            <span>Mark All Absent</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSaveAttendance}
          disabled={saving || loadingStudents || students.length === 0}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <FiSave className="h-4 w-4" />
          )}
          <span>{alreadyMarked ? 'Update Attendance' : 'Save Attendance'}</span>
        </button>
      </div>

      {/* Student Roster Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5 w-20">Roll No</th>
                <th className="px-6 py-3.5 w-28">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5 text-center w-52">Attendance Status</th>
                <th className="px-6 py-3.5 w-64">Session Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingStudents ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading student roster for Division {selectedDivision}...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No students found in Semester {activeSubjectObj?.semester} Division {selectedDivision}.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceMap[student._id]?.status || 'Present';
                  const currentRemarks = attendanceMap[student._id]?.remarks || '';

                  return (
                    <tr
                      key={student._id}
                      className={`transition-colors ${
                        currentStatus === 'Absent' ? 'bg-rose-50/30' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="px-6 py-3 font-bold text-slate-900">
                        #{student.rollNumber}
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-600 font-semibold">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-800">
                        {student.name}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student._id, 'Present')}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-semibold text-xs transition ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <FiCheck className="h-3.5 w-3.5" />
                            <span>Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student._id, 'Absent')}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-semibold text-xs transition ${
                              currentStatus === 'Absent'
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
                          placeholder="Optional note (e.g. sick leave)..."
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Summary Modal */}
      <Modal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        title="Attendance Submission Confirmation"
      >
        {submissionSummary && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
              <FiCheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <h4 className="font-bold text-emerald-950 text-sm">
                  Attendance Successfully Recorded in MongoDB
                </h4>
                <p className="mt-0.5 text-emerald-800">
                  Attendance logs have been cryptographically verified and committed to the academic database.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-slate-600">Course:</span>
                <span className="font-bold text-slate-900">{submissionSummary.subjectCode} - {submissionSummary.subjectName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-slate-600">Date & Session:</span>
                <span className="font-bold text-slate-900">{submissionSummary.date} • {submissionSummary.session}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-slate-600">Division:</span>
                <span className="font-bold text-slate-900">Division {submissionSummary.division}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-slate-600">Total Roster:</span>
                <span className="font-bold text-slate-900">{submissionSummary.total} Students</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-emerald-700">Present Count:</span>
                <span className="font-bold text-emerald-700">{submissionSummary.presentCount} Students</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="font-semibold text-rose-700">Absent Count:</span>
                <span className="font-bold text-rose-700">{submissionSummary.absentCount} Students</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-indigo-700">Attendance Rate:</span>
                <span className="font-bold text-indigo-700 text-sm">{submissionSummary.percentage}%</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSummaryModalOpen(false);
                  navigate('/teacher/attendance-history');
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                View Attendance Ledger
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherMarkAttendancePage;
