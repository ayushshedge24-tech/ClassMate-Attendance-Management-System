import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { getErrorMessage } from '../../services/api';
import { getSocket, joinRadarRoom, leaveRadarRoom } from '../../services/socket';
import {
  FiRadio,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiPlay,
  FiCheck,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiCopy,
  FiShield,
  FiLayers,
} from 'react-icons/fi';

const TeacherRadarPage = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  // Active Session State
  const [activeSession, setActiveSession] = useState(null);
  const [counters, setCounters] = useState({
    totalStudents: 0,
    attendanceMarked: 0,
    notMarked: 0,
    presentCount: 0,
    absentCount: 0,
    requiresReviewCount: 0,
  });
  const [attendees, setAttendees] = useState([]);
  const [liveActivity, setLiveActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingFinal, setSubmittingFinal] = useState(false);

  // Start Radar Form State
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [selectedDivision, setSelectedDivision] = useState('A');
  const [classroom, setClassroom] = useState('Room 301');
  const [sessionSlot, setSessionSlot] = useState('Lecture 1');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [enableGeofence, setEnableGeofence] = useState(false);
  const [classroomCoords, setClassroomCoords] = useState({ latitude: '', longitude: '' });
  const [startingRadar, setStartingRadar] = useState(false);

  // Table Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Timetable auto-suggest
  const [nextLecture, setNextLecture] = useState(null);

  // Time remaining countdown
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Load teacher assigned subjects & schedule on mount
  useEffect(() => {
    fetchTeacherContext();
  }, []);

  const fetchTeacherContext = async () => {
    setLoading(true);
    try {
      // 1. Fetch assigned subjects
      const subRes = await api.get('/teacher/subjects');
      const subs = subRes.data?.data || [];
      setAssignedSubjects(subs);
      if (subs.length > 0) {
        setSelectedSubject(subs[0].subjectId || subs[0]._id);
      }

      // 2. Fetch today's schedule to auto-suggest
      try {
        const timeRes = await api.get('/timetable/teacher');
        if (timeRes.data?.data) {
          const next = timeRes.data.data.currentLecture || timeRes.data.data.nextLecture;
          if (next) {
            setNextLecture(next);
            if (next.subject?._id) setSelectedSubject(next.subject._id);
            if (next.semester) setSelectedSemester(next.semester);
            if (next.division) setSelectedDivision(next.division);
            if (next.classroom) setClassroom(next.classroom);
            if (next.startTime) setSessionSlot(`${next.startTime} - ${next.endTime}`);
          }
        }
      } catch (ttErr) {
        // Timetable non-blocking
      }
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Socket.IO real-time event listeners for active session
  useEffect(() => {
    if (!activeSession?._id) return;

    joinRadarRoom(activeSession._id, user);
    const socket = getSocket();

    const handleAttendanceMarkedLive = (data) => {
      setLiveActivity(data);

      // Update attendee list in state
      setAttendees((prev) =>
        prev.map((att) =>
          att.studentId === data.studentId
            ? {
                ...att,
                status: data.status,
                markedAt: data.markedAt,
                verificationMethod: data.verificationMethod,
              }
            : att
        )
      );

      // Update counters
      setCounters((prev) => {
        const marked = prev.attendanceMarked + 1;
        const notMarked = Math.max(0, prev.totalStudents - marked);
        const present = prev.presentCount + (data.status === 'Present' ? 1 : 0);
        const absent = Math.max(0, prev.absentCount - (data.status === 'Present' ? 1 : 0));
        return {
          ...prev,
          attendanceMarked: marked,
          notMarked,
          presentCount: present,
          absentCount: absent,
        };
      });
    };

    const handleStatusUpdated = (data) => {
      setAttendees((prev) =>
        prev.map((att) =>
          att.studentId === data.studentId
            ? {
                ...att,
                status: data.status,
                manuallyEdited: true,
                reviewRemarks: data.reviewRemarks,
              }
            : att
        )
      );
    };

    if (socket) {
      socket.on('attendance_marked_live', handleAttendanceMarkedLive);
      socket.on('attendee_status_updated', handleStatusUpdated);
    }

    return () => {
      leaveRadarRoom(activeSession._id);
      if (socket) {
        socket.off('attendance_marked_live', handleAttendanceMarkedLive);
        socket.off('attendee_status_updated', handleStatusUpdated);
      }
    };
  }, [activeSession?._id]);

  // Countdown timer for active session
  useEffect(() => {
    if (!activeSession?.expiresAt || activeSession?.status !== 'active') return;

    const updateTimer = () => {
      const now = Date.now();
      const expires = new Date(activeSession.expiresAt).getTime();
      const diffSecs = Math.max(0, Math.round((expires - now) / 1000));
      setSecondsRemaining(diffSecs);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [activeSession?.expiresAt, activeSession?.status]);

  // Start Radar Session
  const handleStartRadar = async (e) => {
    e.preventDefault();
    setStartingRadar(true);
    try {
      const payload = {
        subjectId: selectedSubject,
        course: 'B.Tech Information Technology',
        semester: Number(selectedSemester),
        division: selectedDivision,
        classroom,
        sessionSlot,
        durationMinutes: Number(durationMinutes),
        verificationMethod: enableGeofence ? 'location_geofence' : 'radar_smart',
      };

      if (enableGeofence && classroomCoords.latitude && classroomCoords.longitude) {
        payload.classroomLocation = {
          latitude: Number(classroomCoords.latitude),
          longitude: Number(classroomCoords.longitude),
          radiusMeters: 100,
        };
      }

      const res = await api.post('/radar/session/start', payload);
      if (res.data?.success) {
        success(res.data.message || 'Smart Attendance Radar is now broadcasting!');
        setActiveSession(res.data.data);
        fetchLiveSessionRoster(res.data.data._id);
      }
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setStartingRadar(false);
    }
  };

  // Fetch live session details and roster
  const fetchLiveSessionRoster = async (sessionId) => {
    try {
      const res = await api.get(`/radar/session/${sessionId}/live`);
      if (res.data?.success) {
        setActiveSession(res.data.data.session);
        setCounters(res.data.data.counters);
        setAttendees(res.data.data.session.attendees || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manual status override
  const handleStatusToggle = async (attendee, nextStatus) => {
    try {
      const res = await api.put(
        `/radar/session/${activeSession._id}/attendee/${attendee.studentId}`,
        {
          status: nextStatus,
          reviewRemarks: `Manual override by ${user.name}`,
        }
      );
      if (res.data?.success) {
        setAttendees((prev) =>
          prev.map((a) => (a.studentId === attendee.studentId ? { ...a, status: nextStatus, manuallyEdited: true } : a))
        );
        info(`Marked ${attendee.studentName} as ${nextStatus}`);
      }
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  // Submit Final Attendance
  const handleSubmitFinal = async () => {
    if (!window.confirm('Submit and finalize attendance records to permanent database?')) {
      return;
    }
    setSubmittingFinal(true);
    try {
      const res = await api.post(`/radar/session/${activeSession._id}/submit`);
      if (res.data?.success) {
        success(res.data.message || 'Attendance finalized and saved to MongoDB!');
        setActiveSession((prev) => ({ ...prev, status: 'completed', isFinalSubmitted: true }));
      }
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmittingFinal(false);
    }
  };

  const copySessionCode = () => {
    if (activeSession?.sessionCode) {
      navigator.clipboard.writeText(activeSession.sessionCode);
      info(`Copied Code: ${activeSession.sessionCode}`);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter attendees
  const filteredAttendees = attendees.filter((att) => {
    const matchesSearch =
      att.studentName.toLowerCase().includes(search.toLowerCase()) ||
      att.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      att.rollNumber.toString().includes(search);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'present' && att.status === 'Present') ||
      (statusFilter === 'absent' && att.status === 'Absent') ||
      (statusFilter === 'review' && att.status === 'Requires Review');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FiRadio className="h-3.5 w-3.5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Smart Attendance Radar Studio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time classroom presence broadcast & live attendance synchronization
          </p>
        </div>

        {activeSession && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchLiveSessionRoster(activeSession._id)}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            {!activeSession.isFinalSubmitted && (
              <button
                onClick={handleSubmitFinal}
                disabled={submittingFinal}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
              >
                <FiCheck className="h-4 w-4" />
                <span>{submittingFinal ? 'Saving Records...' : 'Submit Attendance'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Screen 1: Start Radar Form (if no active session) */}
      {!activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Launcher Card */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
                <FiRadio className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Start Your Radar Session</h2>
                <p className="text-xs text-slate-500">
                  Broadcast active lecture window for students to mark attendance
                </p>
              </div>
            </div>

            {/* Timetable Auto-Suggest Banner if available */}
            {nextLecture && (
              <div className="mt-6 flex items-start space-x-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
                <FiClock className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-indigo-900">Scheduled Lecture Match:</span>
                  <p className="text-indigo-800 mt-0.5 font-medium">
                    {nextLecture.subject?.subjectCode} - {nextLecture.subject?.subjectName} ({nextLecture.startTime} - {nextLecture.endTime}) in {nextLecture.classroom}
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-700">
                    Form has been pre-filled with this timetable entry.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleStartRadar} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Curriculum Subject *
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                  required
                >
                  {assignedSubjects.map((sub) => (
                    <option key={sub.subjectId || sub._id} value={sub.subjectId || sub._id}>
                      {sub.subjectCode} — {sub.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Semester *
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Division *
                  </label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                  >
                    {['A', 'B', 'C', 'D'].map((d) => (
                      <option key={d} value={d}>Division {d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Radar Window (Mins)
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Classroom / Lecture Hall
                  </label>
                  <input
                    type="text"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder="e.g. Room 301 or Lab 402"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lecture Session / Slot
                  </label>
                  <input
                    type="text"
                    value={sessionSlot}
                    onChange={(e) => setSessionSlot(e.target.value)}
                    placeholder="e.g. Lecture 1 or 09:00 - 10:00"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Geofence / Proximity toggle */}
              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableGeofence}
                    onChange={(e) => setEnableGeofence(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-4 w-4"
                  />
                  <span>Enable Classroom Geofence Proximity Check</span>
                </label>
                {enableGeofence && (
                  <div className="mt-3 grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 19.0222"
                        value={classroomCoords.latitude}
                        onChange={(e) => setClassroomCoords({ ...classroomCoords, latitude: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 72.8561"
                        value={classroomCoords.longitude}
                        onChange={(e) => setClassroomCoords({ ...classroomCoords, longitude: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={startingRadar}
                  className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
                >
                  <FiPlay className="h-4 w-4" />
                  <span>{startingRadar ? 'Activating Radar...' : 'Start Your Radar'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Radar Information & Device Reality Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 mb-3">
                <FiRadio className="h-5 w-5" />
                <h3 className="font-bold text-sm text-slate-900">How ClassMate Radar Works</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-indigo-600 shrink-0">1.</span>
                  <span>Teacher starts the session for the lecture slot. A unique broadcast code is generated.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-indigo-600 shrink-0">2.</span>
                  <span>Eligible students in that course & division see the active lecture card on their ClassMate portal.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-indigo-600 shrink-0">3.</span>
                  <span>Students click <strong>Mark Your Attendance</strong>. Concurrent submissions are processed without blocking.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-indigo-600 shrink-0">4.</span>
                  <span>Live roster updates on teacher's screen in real time via Socket.IO engine.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-indigo-600 shrink-0">5.</span>
                  <span>Teacher reviews, manually overrides if needed, and clicks <strong>Submit Attendance</strong>.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                <FiShield className="h-3.5 w-3.5 text-emerald-600" />
                <span>Zero Fake Detection</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                ClassMate strictly respects web standards: no artificial device discovery or false verification claims.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Screen 2: Active Radar Session Studio */
        <div className="space-y-6">
          {/* Active Radar Status Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-900/40">
            {/* Background Radar Waves Animation */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full border border-indigo-500/20 animate-ping opacity-25" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-88 w-88 rounded-full border border-cyan-500/10 opacity-30" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/30">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>RADAR ACTIVE</span>
                  </span>
                  <span className="text-xs text-indigo-200">
                    {activeSession.sessionSlot} • {activeSession.classroom}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 text-white">
                  {activeSession.subject?.subjectCode} — {activeSession.subject?.subjectName}
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                  Sem {activeSession.semester} • Div {activeSession.division} • {activeSession.course}
                </p>
              </div>

              {/* Session Code & Countdown Box */}
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    Session Code
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <span className="font-mono text-2xl font-black text-white">
                      {activeSession.sessionCode}
                    </span>
                    <button
                      onClick={copySessionCode}
                      title="Copy Session Code"
                      className="rounded-lg p-1 text-indigo-200 hover:text-white hover:bg-white/10"
                    >
                      <FiCopy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4 text-center min-w-[120px]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    Time Remaining
                  </p>
                  <p className="font-mono text-2xl font-black text-cyan-400 mt-1">
                    {formatTimer(secondsRemaining)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed Banner (instant event) */}
          {liveActivity && (
            <div className="flex items-center space-x-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <FiCheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="flex-1 font-medium">
                <span className="font-bold text-emerald-950">Live Attendance Event: </span>
                {liveActivity.activityMessage}
              </div>
              <span className="text-[10px] text-emerald-600 font-mono">
                {liveActivity.verificationMethod}
              </span>
            </div>
          )}

          {/* Live Attendance Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Students</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{counters.totalStudents}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Marked</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{counters.attendanceMarked}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Not Marked</p>
              <p className="text-2xl font-black text-slate-400 mt-1">{counters.notMarked}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-emerald-700 uppercase">Present</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{counters.presentCount}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-rose-700 uppercase">Absent</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{counters.absentCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-amber-700 uppercase">Needs Review</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{counters.requiresReviewCount}</p>
            </div>
          </div>

          {/* Attendees Table & Management */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search student name, roll no, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                {['all', 'present', 'absent', 'review'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      statusFilter === f
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Roll No</th>
                    <th className="px-6 py-3.5">Student ID</th>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Time Marked</th>
                    <th className="px-6 py-3.5">Verification Mode</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Manual Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No students match search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((att) => (
                      <tr key={att.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-900">#{att.rollNumber}</td>
                        <td className="px-6 py-3.5 font-mono text-indigo-600 font-semibold">{att.studentId}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-800">{att.studentName}</td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {att.markedAt
                            ? new Date(att.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {att.verificationMethod === 'geolocation_verified' && '📍 GPS Verified'}
                            {att.verificationMethod === 'network_verified' && '📶 Network Verified'}
                            {att.verificationMethod === 'radar_smart' && '⚡ Radar Pulse'}
                            {att.verificationMethod === 'teacher_manual' && '✍ Manual Override'}
                            {att.verificationMethod === 'not_marked' && '⏳ Not Marked'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              att.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : att.status === 'Absent'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {att.status}
                            {att.manuallyEdited && <span className="ml-1 text-[9px]">(edited)</span>}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {att.status !== 'Present' && (
                              <button
                                onClick={() => handleStatusToggle(att, 'Present')}
                                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                              >
                                Mark Present
                              </button>
                            )}
                            {att.status !== 'Absent' && (
                              <button
                                onClick={() => handleStatusToggle(att, 'Absent')}
                                className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition"
                              >
                                Mark Absent
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherRadarPage;
