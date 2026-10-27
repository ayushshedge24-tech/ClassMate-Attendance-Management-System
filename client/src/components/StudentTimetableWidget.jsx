import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiArrowRight,
  FiBookOpen,
} from 'react-icons/fi';

const StudentTimetableWidget = () => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable/student');
      if (res.data?.success) {
        setScheduleData(res.data.data);
      }
    } catch (err) {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-20 animate-pulse bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const todayLectures = scheduleData?.todayLectures || [];
  const currentDay = scheduleData?.currentDay || 'Today';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FiCalendar className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Today's Class Schedule ({currentDay})
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Institutional timetable slots for your semester and division
          </p>
        </div>
        <Link
          to="/student/timetable"
          className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <span>Full Week</span>
          <FiArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4">
        {todayLectures.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <FiCalendar className="mx-auto h-6 w-6 text-slate-300 mb-1.5" />
            <span>No instructional lectures scheduled for {currentDay}. Enjoy your day!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayLectures.map((slot) => (
              <div
                key={slot._id}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:border-indigo-200 hover:bg-indigo-50/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-indigo-600">
                    {slot.startTime} – {slot.endTime}
                  </span>
                  <span className="rounded-md bg-indigo-100/70 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    {slot.sessionType || 'Theory'}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 mt-2 truncate">
                  {slot.subject?.subjectCode} — {slot.subject?.subjectName}
                </h4>

                <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1 truncate">
                    <FiUser className="h-3 w-3 shrink-0 text-slate-400" />
                    <span>{slot.teacher?.name || 'Faculty'}</span>
                  </span>
                  <span className="flex items-center space-x-1 font-medium text-slate-700">
                    <FiMapPin className="h-3 w-3 shrink-0 text-indigo-500" />
                    <span>{slot.classroom}</span>
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

export default StudentTimetableWidget;
