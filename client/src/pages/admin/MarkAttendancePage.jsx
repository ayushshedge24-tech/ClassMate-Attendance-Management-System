import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FiCalendar,
  FiBookOpen,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiSave,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';

const MarkAttendancePage = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [selectedDivision, setSelectedDivision] = useState('A');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: { status: 'Present' | 'Absent', remarks: '' } }
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  const { success, error, info } = useToast();

  // 1. Fetch subjects
  useEffect(() => {
    fetchSubjects();
  }, [selectedSemester]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects', {
        params: { semester: selectedSemester },
      });
      setSubjects(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedSubject(res.data.data[0]._id);
      } else {
        setSelectedSubject('');
      }
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  // 2. Fetch students for the chosen semester & division
  useEffect(() => {
    fetchClassStudents();
  }, [selectedSemester, selectedDivision]);

  // 3. Whenever date, subject, or students change, check if attendance already exists for that day
  useEffect(() => {
    if (selectedSubject && selectedDate && students.length > 0) {
      checkExistingAttendance();
    }
  }, [selectedSubject, selectedDate, students]);

  const fetchClassStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await api.get('/students', {
        params: {
          semester: selectedSemester,
          division: selectedDivision,
        },
      });

      const studentList = res.data.data;
      setStudents(studentList);

      // Initialize default attendance as 'Present' for all students
      const initialMap = {};
      studentList.forEach((s) => {
        initialMap[s._id] = {
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

  const checkExistingAttendance = async () => {
    try {
      const res = await api.get('/attendance', {
        params: {
          subject: selectedSubject,
          date: selectedDate,
          semester: selectedSemester,
          division: selectedDivision,
          limit: 100,
        },
      });

      if (res.data.data && res.data.data.length > 0) {
        setAlreadyMarked(true);
        // Pre-fill statuses from existing records
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
      console.warn('Could not verify existing attendance records', err);
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
      error('Please select a subject');
      return;
    }

    if (!selectedDate) {
      error('Please pick an attendance date');
      return;
    }

    if (students.length === 0) {
      error('No students in this class to record attendance for');
      return;
    }

    setSaving(true);
    try {
      const records = students.map((s) => ({
        student: s._id,
        status: attendanceMap[s._id]?.status || 'Present',
        remarks: attendanceMap[s._id]?.remarks || '',
      }));

      const payload = {
        subject: selectedSubject,
        date: selectedDate,
        records,
      };

      const res = await api.post('/attendance', payload);
      success(res.data.message || 'Attendance saved successfully!');
      setAlreadyMarked(true);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Counts
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
            Mark Daily Attendance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record lecture attendance for enrolled students by semester, division, and subject
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

      {/* Control Panel: Filters for Marking */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lecture Date *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Semester Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Semester *
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Division Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Division *
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

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              {subjects.length === 0 ? (
                <option value="">No subjects found for Semester {selectedSemester}</option>
              ) : (
                subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Existing Attendance Notice Banner */}
        {alreadyMarked && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
            <FiInfo className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Attendance for this date, subject, and division has already been recorded. Any modifications you make now will update the existing records.
            </span>
          </div>
        )}
      </div>

      {/* Batch Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="flex items-center space-x-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
          >
            <FiCheck className="h-4 w-4" />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
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

      {/* Attendance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5 w-20">Roll No</th>
                <th className="px-6 py-3.5 w-28">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5 text-center w-48">Status Selection</th>
                <th className="px-6 py-3.5 w-64">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingStudents ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading enrolled students for Semester {selectedSemester} Div {selectedDivision}...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No students found in Semester {selectedSemester} Division {selectedDivision}.
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
                          placeholder="Optional note..."
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
    </div>
  );
};

export default MarkAttendancePage;
