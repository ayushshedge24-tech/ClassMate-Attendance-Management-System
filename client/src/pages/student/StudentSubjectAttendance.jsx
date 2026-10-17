import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import {
  FiBookOpen,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiShield,
  FiUser,
  FiInfo,
} from 'react-icons/fi';

const StudentSubjectAttendance = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?._id) {
      fetchSummary();
    }
  }, [user]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/student/${user._id}/summary`);
      setSummary(res.data.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading subject attendance ledger...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h3 className="font-semibold text-base">Failed to load subject records</h3>
        <p className="text-xs mt-1">{errorMsg}</p>
      </div>
    );
  }

  const subjects = summary?.subjectWise || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subject-Wise Attendance Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Detailed attendance percentage, conducted lectures, and exam eligibility per curriculum course
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
            Threshold: <strong className="font-bold">75%</strong> Mandatory
          </span>
        </div>
      </div>

      {/* Threshold Explanation Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start space-x-3 text-xs text-slate-600">
        <FiInfo className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          Students must maintain a minimum of <strong>75% attendance</strong> in each individual subject to be eligible to appear for the semester university examinations. Attendance percentages are calculated as <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">(Attended / Conducted) × 100</code>.
        </p>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subjects.map((sub) => {
          const total = sub.totalClasses || 0;
          const present = sub.presentClasses || 0;
          const absent = sub.absentClasses || 0;
          const pct = sub.percentage || 0;

          // Margin calculation:
          // If < 75%: How many consecutive classes must be attended to reach 75%?
          // (present + x) / (total + x) >= 0.75  =>  0.25x >= 0.75*total - present
          let neededClasses = 0;
          let canMissClasses = 0;

          if (total > 0) {
            if (pct < 75) {
              neededClasses = Math.max(0, Math.ceil((0.75 * total - present) / 0.25));
            } else {
              // How many classes can be missed while staying >= 75%?
              // present / (total + y) >= 0.75  =>  0.75*(total + y) <= present  =>  y <= (present / 0.75) - total
              canMissClasses = Math.max(0, Math.floor((present / 0.75) - total));
            }
          }

          const isSafe = total > 0 && pct >= 75;
          const isWarning = total > 0 && pct >= 60 && pct < 75;
          const isCritical = total > 0 && pct < 60;
          const isNoClass = total === 0;

          return (
            <div
              key={sub.subjectId}
              className={`rounded-2xl border p-5 shadow-sm transition-all bg-white flex flex-col justify-between ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isWarning
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 font-mono">
                      {sub.subjectCode}
                    </span>
                    <span className="ml-2 text-[11px] font-medium text-slate-500">
                      Semester {sub.semester}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isNoClass
                        ? 'bg-slate-100 text-slate-600'
                        : isSafe
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isWarning
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isNoClass
                      ? 'No Classes Held'
                      : isSafe
                      ? '✓ Exam Eligible'
                      : isWarning
                      ? '⚠ Shortage Warning'
                      : '✖ Critical Shortage'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {sub.subjectName}
                </h3>

                <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
                  <FiUser className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Faculty: <strong className="text-slate-700">{sub.teacher?.name || 'Department Faculty'}</strong></span>
                </div>

                {/* Progress Bar & Rate */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-600">Attendance Percentage</span>
                    <span className={`font-black text-sm ${isSafe ? 'text-emerald-600' : isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                      {pct}%
                    </span>
                  </div>
                  <ProgressBar percentage={pct} height="h-2.5" />
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Conducted</span>
                    <p className="text-sm font-bold text-slate-800">{total}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50/60 p-2 border border-emerald-100">
                    <span className="text-[10px] uppercase font-semibold text-emerald-600">Attended</span>
                    <p className="text-sm font-bold text-emerald-700">{present}</p>
                  </div>
                  <div className="rounded-xl bg-rose-50/60 p-2 border border-rose-100">
                    <span className="text-[10px] uppercase font-semibold text-rose-600">Missed</span>
                    <p className="text-sm font-bold text-rose-700">{absent}</p>
                  </div>
                </div>
              </div>

              {/* Actionable Advice / Margin Note */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                {isNoClass ? (
                  <p className="text-slate-400 italic">No instructional classes recorded yet for this course.</p>
                ) : isSafe ? (
                  <p className="text-emerald-700 font-medium">
                    ✓ You are in safe standing. You can miss up to <strong>{canMissClasses}</strong> upcoming class{canMissClasses === 1 ? '' : 'es'} without dropping below 75%.
                  </p>
                ) : (
                  <p className="text-rose-700 font-medium">
                    ⚠ Shortage: You must attend the next <strong>{neededClasses}</strong> consecutive class{neededClasses === 1 ? '' : 'es'} to reach the required 75% threshold.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSubjectAttendance;
