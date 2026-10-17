import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import {
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiBookOpen,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

const StudentMonthlySummary = () => {
  const { user } = useAuth();

  // Default month: Current month in YYYY-MM
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [monthlyData, setMonthlyData] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch overall summary first to discover which months have attendance
  useEffect(() => {
    if (user?._id) {
      api.get(`/attendance/student/${user._id}/summary`)
        .then((res) => {
          const mList = res.data.data?.monthlyAttendance || [];
          if (mList.length > 0) {
            setAvailableMonths(mList);
            // If current month has records, pick it; else default to the latest recorded month
            const hasCurrent = mList.some((m) => m.monthKey === currentMonthKey);
            if (!hasCurrent) {
              setSelectedMonth(mList[mList.length - 1].monthKey);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  // 2. Whenever selectedMonth changes, fetch detailed monthly breakdown
  useEffect(() => {
    if (user?._id && selectedMonth) {
      fetchMonthlyData();
    }
  }, [user, selectedMonth]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/attendance/student/${user._id}/monthly`, {
        params: { month: selectedMonth },
      });
      setMonthlyData(res.data.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const total = monthlyData?.totalClasses || 0;
  const present = monthlyData?.presentClasses || 0;
  const absent = monthlyData?.absentClasses || 0;
  const rate = monthlyData?.monthlyPercentage || 0;
  const isSafe = rate >= 75;

  return (
    <div className="space-y-6">
      {/* Title & Month Selector Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Monthly Attendance Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your monthly attendance trend, subject breakdown, and instructional participation
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Available Months Quick Select Pills */}
      {availableMonths.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Recorded Months:</span>
          {availableMonths.map((m) => (
            <button
              key={m.monthKey}
              onClick={() => setSelectedMonth(m.monthKey)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedMonth === m.monthKey
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m.month} ({m.percentage}%)
            </button>
          ))}
        </div>
      )}

      {/* Monthly Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Attendance"
          value={`${rate}%`}
          icon={FiTrendingUp}
          color={isSafe ? 'emerald' : 'rose'}
          subtitle={monthlyData?.monthLabel || 'Selected month'}
        />
        <StatCard
          title="Classes Conducted"
          value={total}
          icon={FiCalendar}
          color="indigo"
          subtitle="Total sessions in month"
        />
        <StatCard
          title="Classes Attended"
          value={present}
          icon={FiCheckCircle}
          color="emerald"
          subtitle="Present sessions"
        />
        <StatCard
          title="Classes Missed"
          value={absent}
          icon={FiXCircle}
          color="rose"
          subtitle="Absent sessions"
        />
      </div>

      {/* Subject-Wise Monthly Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Subject Attendance in {monthlyData?.monthLabel || selectedMonth}
            </h2>
            <p className="text-xs text-slate-500">
              Subject-wise lectures conducted and attendance rate for the chosen month
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Subject Code</th>
                <th className="px-6 py-3.5">Subject Name</th>
                <th className="px-6 py-3.5 text-center">Conducted this Month</th>
                <th className="px-6 py-3.5 text-center text-emerald-700">Attended</th>
                <th className="px-6 py-3.5 text-center text-rose-700">Missed</th>
                <th className="px-6 py-3.5 w-44">Monthly Rate %</th>
                <th className="px-6 py-3.5 text-center">Monthly Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading monthly subject data...</span>
                    </div>
                  </td>
                </tr>
              ) : monthlyData?.subjectWise?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No instructional lectures were recorded in this month.
                  </td>
                </tr>
              ) : (
                monthlyData?.subjectWise?.map((sub) => (
                  <tr key={sub.subjectId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">
                      {sub.subjectCode}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">
                      {sub.subjectName}
                    </td>
                    <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                      {sub.totalClasses}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                      {sub.presentClasses}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                      {sub.absentClasses}
                    </td>
                    <td className="px-6 py-3.5">
                      <ProgressBar percentage={sub.percentage} height="h-2" />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          sub.percentage >= 75
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {sub.percentage >= 75 ? 'Safe (≥75%)' : 'Shortage (<75%)'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Sessions in Selected Month Table */}
      {monthlyData?.dailyRecords?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Daily Class Sessions in {monthlyData.monthLabel} ({monthlyData.dailyRecords.length} sessions)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Day</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Session</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyData.dailyRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {new Date(r.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 text-slate-600 font-medium">
                      {r.day}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {r.subjectCode} - {r.subjectName}
                    </td>
                    <td className="px-6 py-3 text-slate-600 font-medium">
                      {r.session}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          r.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {r.remarks || 'Regular class'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMonthlySummary;
