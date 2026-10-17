import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import {
  FiBookOpen,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiCheckSquare,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';

const TeacherSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/teacher/subjects');
      setSubjects(res.data.data || []);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Assigned Subjects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Courses specifically assigned to your faculty profile for lecture delivery and attendance management
          </p>
        </div>

        <button
          onClick={fetchSubjects}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-xs text-slate-500">Loading your assigned courses...</p>
          </div>
        </div>
      ) : errorMsg ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <FiBookOpen className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Assigned Subjects</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not currently have any subjects assigned. Contact your department administrator to assign curriculum subjects to your faculty account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 font-mono">
                    {sub.subjectCode}
                  </span>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      sub.markedToday
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {sub.markedToday ? '✓ Marked Today' : 'Pending Today'}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                  {sub.subjectName}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Semester {sub.semester} • {sub.department}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-600">Course Average Attendance</span>
                    <span className="font-bold text-indigo-600">{sub.averageAttendance}%</span>
                  </div>
                  <ProgressBar percentage={sub.averageAttendance} height="h-2" />
                </div>

                {/* 3 Metrics: Students, Classes, Attendance */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Enrolled</span>
                    <p className="text-sm font-bold text-slate-800">{sub.studentCount}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Classes Held</span>
                    <p className="text-sm font-bold text-slate-800">{sub.totalClasses}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Avg Rate</span>
                    <p className="text-sm font-bold text-indigo-600">{sub.averageAttendance}%</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to={`/teacher/mark-attendance?subject=${sub._id}`}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-indigo-600 py-2 px-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  <FiCheckSquare className="h-3.5 w-3.5" />
                  <span>Mark Attendance</span>
                </Link>

                <Link
                  to={`/teacher/reports?subject=${sub._id}&type=student`}
                  className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <FiFileText className="h-3.5 w-3.5" />
                  <span>View Report</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSubjectsPage;
