import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiBookOpen,
  FiRefreshCw,
} from 'react-icons/fi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentTimetablePage = () => {
  const { user } = useAuth();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDay, setActiveDay] = useState('');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/timetable/student');
      if (res.data?.success) {
        setScheduleData(res.data.data);
        setActiveDay(res.data.data.currentDay || 'Monday');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const weeklySchedule = scheduleData?.weeklySchedule || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Weekly Class Timetable
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official class routine for Semester {user?.semester} • Division {user?.division} ({user?.course})
          </p>
        </div>
        <button
          onClick={fetchTimetable}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 self-start sm:self-auto"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const count = (weeklySchedule[day] || []).length;
          const isActive = activeDay === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{day}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Timetable View */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 pb-4 border-b border-slate-100">
          Schedule for {activeDay}
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading schedule...</div>
        ) : (weeklySchedule[activeDay] || []).length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <FiCalendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No classes scheduled for {activeDay}.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use this day for revision, assignments, or self-study.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {(weeklySchedule[activeDay] || []).map((slot) => (
              <div
                key={slot._id}
                className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50/60 rounded-xl px-3 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-indigo-50 px-3.5 py-2.5 min-w-[110px] text-center border border-indigo-100/60">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-500 uppercase mt-0.5">
                      {slot.sessionType || 'Theory'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {slot.subject?.subjectCode} — {slot.subject?.subjectName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <FiUser className="h-3.5 w-3.5 text-slate-400" />
                        <span>Faculty: <strong className="text-slate-700">{slot.teacher?.name}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FiMapPin className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Room: <strong className="text-slate-700">{slot.classroom}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="self-end md:self-center">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Scheduled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTimetablePage;
