import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FiRadio,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiUser,
  FiCheck,
  FiShield,
  FiAlertCircle,
} from 'react-icons/fi';
import { getSocket } from '../services/socket';

const StudentRadarWidget = ({ onAttendanceMarked }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [markResult, setMarkResult] = useState(null);

  const { success, error, info } = useToast();

  const fetchActiveSession = async () => {
    try {
      const res = await api.get('/radar/session/active');
      if (res.data?.success && res.data.hasActiveSession) {
        setActiveSession(res.data.data);
        setAlreadyMarked(res.data.alreadyMarked);
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      // Non-blocking radar check
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();

    // Check periodically every 20 seconds
    const interval = setInterval(fetchActiveSession, 20000);

    const socket = getSocket();
    const handleRadarStarted = () => {
      fetchActiveSession();
      info('A new Smart Attendance Radar session is active for your class!');
    };

    const handleSessionFinalized = () => {
      fetchActiveSession();
      if (onAttendanceMarked) onAttendanceMarked();
    };

    if (socket) {
      socket.on('radar_session_started', handleRadarStarted);
      socket.on('session_finalized', handleSessionFinalized);
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('radar_session_started', handleRadarStarted);
        socket.off('session_finalized', handleSessionFinalized);
      }
    };
  }, []);

  const handleMarkAttendance = async () => {
    setMarking(true);
    setMarkResult(null);

    // Get optional browser geolocation if permitted
    let latitude = null;
    let longitude = null;

    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 60000,
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoErr) {
        // Fall back gracefully to network verified
        console.log('Location not granted or unavailable; using network verification.');
      }
    }

    try {
      const res = await api.post('/radar/session/mark', {
        sessionCode: activeSession.sessionCode,
        latitude,
        longitude,
        deviceInfo: navigator.userAgent,
      });

      if (res.data?.success) {
        setAlreadyMarked(true);
        setMarkResult(res.data);
        setModalOpen(true);
        success(res.data.message || 'Attendance Marked Successfully!');
        if (onAttendanceMarked) onAttendanceMarked();
      }
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return null;
  }

  // If no active radar session, return clean idle status pill
  if (!activeSession) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FiRadio className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-700">Smart Attendance Radar</h4>
            <p className="text-[11px] text-slate-400">
              Radar status is currently idle. Ready for your teacher to broadcast attendance.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          Standby
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Active Radar Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 text-white shadow-xl shadow-indigo-950/20 border border-indigo-700/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Pulsing Concentric Radar Rings */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-cyan-400/20 animate-ping opacity-30" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-indigo-400/20 opacity-40" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/30">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>ACTIVE LECTURE RADAR</span>
              </span>
              <span className="text-xs text-indigo-200 font-mono">
                Code: {activeSession.sessionCode}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-2 text-white">
              {activeSession.subjectCode} — {activeSession.subjectName}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-200 mt-2">
              <span className="flex items-center space-x-1">
                <FiUser className="h-3.5 w-3.5 text-indigo-300" />
                <span>{activeSession.teacherName}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiMapPin className="h-3.5 w-3.5 text-indigo-300" />
                <span>{activeSession.classroom}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiClock className="h-3.5 w-3.5 text-indigo-300" />
                <span>{activeSession.sessionSlot}</span>
              </span>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center space-x-3">
            {alreadyMarked ? (
              <div className="flex items-center space-x-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 px-5 py-3 text-emerald-300">
                <FiCheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="text-left text-xs">
                  <p className="font-bold text-white">Attendance Marked</p>
                  <p className="text-[11px] text-emerald-200">
                    Status: <span className="font-bold text-white">Present</span>
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleMarkAttendance}
                disabled={marking}
                className="relative group flex items-center space-x-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-300 hover:to-indigo-400 hover:scale-105 transition-all disabled:opacity-50"
              >
                <FiRadio className="h-4 w-4 animate-pulse" />
                <span>{marking ? 'Verifying Proximity...' : 'Mark Your Attendance'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && markResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
              <FiCheckCircle className="h-8 w-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Your Attendance Has Been Marked Successfully!
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              Verified attendance recorded in ClassMate institutional database.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-bold text-slate-800">{activeSession.subjectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Status:</span>
                <span className="font-bold text-emerald-600">Present ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lecture Session:</span>
                <span className="font-medium text-slate-700">{activeSession.sessionSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Mode:</span>
                <span className="font-semibold text-indigo-600">
                  {markResult.data?.verificationMethod === 'geolocation_verified'
                    ? '📍 Geolocation Verified'
                    : '📶 Smart Radar Verified'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentRadarWidget;
