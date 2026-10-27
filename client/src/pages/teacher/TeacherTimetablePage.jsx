import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiBookOpen,
  FiRadio,
  FiRefreshCw,
  FiUsers,
} from 'react-icons/fi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TeacherTimetablePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDay, setActiveDay] = useState('Monday');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/timetable/teacher');
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

  const handleLaunchRadar = (slot) => {
    navigate('/teacher/radar', {
      state: {
        prefill: {
          subjectId: slot.subject?._id,
          semester: slot.semester,
          division: slot.division,
          classroom: slot.classroom,
          sessionSlot: `${slot.startTime} - ${slot.endTime}`,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Teaching Timetable & Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly instructional schedule assigned to {user?.name}
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

      {/* Schedule Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 pb-4 border-b border-slate-100">
          Classes for {activeDay}
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading timetable...</div>
        ) : (weeklySchedule[activeDay] || []).length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <FiCalendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No teaching slots scheduled for {activeDay}.</p>
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
                        <FiUsers className="h-3.5 w-3.5 text-slate-400" />
                        <span>Class: <strong>Sem {slot.semester} • Div {slot.division}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FiMapPin className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Room: <strong className="text-slate-700">{slot.classroom}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="self-end md:self-center">
                  <button
                    onClick={() => handleLaunchRadar(slot)}
                    className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
                  >
                    <FiRadio className="h-3.5 w-3.5" />
                    <span>Start Radar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTimetablePage;
