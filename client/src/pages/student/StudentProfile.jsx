import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiShield,
  FiLock,
} from 'react-icons/fi';

const StudentProfile = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      api.get(`/attendance/student/${user._id}/summary`)
        .then((res) => setSummary(res.data.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const enrolledSubjects = summary?.enrolledSubjects || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Profile & Academic Enrollment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified institutional identity, enrolled curriculum subjects, and attendance eligibility
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-700 font-extrabold text-3xl border-2 border-indigo-200 shadow-sm">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5">
                  ID: {user?.studentId} • Roll #{user?.rollNumber}
                </p>
              </div>

              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 self-center sm:self-auto">
                <FiCheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Active Enrolled
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600">
              Department of Computer Science & Information Technology
            </p>
          </div>
        </div>

        {/* Academic and Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Curriculum Course
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {user?.course}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Academic Allotment
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">
              Semester {user?.semester} • Division {user?.division}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Institutional Email
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1 break-all font-mono">
              {user?.email}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Registered Phone
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {user?.phone || 'Not updated'}
            </p>
          </div>
        </div>

        {/* Enrolled Curriculum Subjects with Assigned Faculty */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <FiBookOpen className="text-indigo-600" />
            <span>Enrolled Subjects (Semester {user?.semester})</span>
          </h3>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Subject Code</th>
                  <th className="px-5 py-3">Subject Name</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Faculty In-Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledSubjects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No enrolled curriculum subjects found.
                    </td>
                  </tr>
                ) : (
                  enrolledSubjects.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-mono font-bold text-indigo-600">
                        {sub.subjectCode}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {sub.subjectName}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {sub.department}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {sub.teacher?.name || 'Department Faculty'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Standing Overview */}
        {summary && (
          <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3">
              Attendance Standing Assessment
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-white p-3 border border-indigo-100 shadow-sm">
                <span className="text-[11px] text-slate-500">Total Lectures</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{summary.totalClasses}</p>
              </div>
              <div className="rounded-xl bg-white p-3 border border-indigo-100 shadow-sm">
                <span className="text-[11px] text-slate-500">Attended</span>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">{summary.presentClasses}</p>
              </div>
              <div className="rounded-xl bg-white p-3 border border-indigo-100 shadow-sm">
                <span className="text-[11px] text-slate-500">Attendance %</span>
                <p className="text-lg font-bold text-indigo-600 mt-0.5">{summary.attendancePercentage}%</p>
              </div>
            </div>

            <div className="mt-4">
              <ProgressBar percentage={summary.attendancePercentage} showStatus={true} />
            </div>
          </div>
        )}

        {/* Security / Privacy Notice */}
        <div className="mt-6 flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <FiLock className="h-4 w-4 text-indigo-500 shrink-0" />
          <span>
            Privacy Notice: Institutional attendance records are confidential. Students are cryptographically restricted to accessing their own private records.
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
