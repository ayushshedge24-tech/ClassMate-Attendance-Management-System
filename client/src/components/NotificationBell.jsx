import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiCheck,
  FiClock,
  FiRadio,
} from 'react-icons/fi';
import { getSocket } from '../services/socket';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Non-blocking notification fetch
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds as background sync
    const interval = setInterval(fetchNotifications, 30000);

    // Socket listener for real-time notifications
    const socket = getSocket();
    const handleNewNotification = () => {
      fetchNotifications();
    };

    if (socket) {
      socket.on('new_notification', handleNewNotification);
    }

    // Click outside listener
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('new_notification', handleNewNotification);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'radar_session_started':
        return <FiRadio className="h-4 w-4 text-cyan-500" />;
      case 'attendance_marked':
        return <FiCheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'attendance_corrected':
        return <FiClock className="h-4 w-4 text-amber-500" />;
      case 'shortage_warning':
        return <FiAlertCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <FiInfo className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors shadow-sm"
      >
        <FiBell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/60">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <FiCheck className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <FiBell className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                <span>No notifications yet.</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start space-x-3 p-3.5 text-xs transition-colors hover:bg-slate-50/80 ${
                    !notif.isRead ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100 p-1.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800 truncate">{notif.title}</p>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                          title="Mark as read"
                          className="shrink-0 text-slate-400 hover:text-indigo-600 ml-2"
                        >
                          <FiCheck className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' • '}
                      {new Date(notif.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
