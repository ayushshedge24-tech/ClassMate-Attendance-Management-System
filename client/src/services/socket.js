import { io } from 'socket.io-client';

// Use same host/origin for single-port unified deployment
const SOCKET_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : window.location.origin;

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO] Connected to ClassMate real-time server:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection warning (fallback active):', err.message);
    });
  }

  return socketInstance;
};

export const joinRadarRoom = (sessionId, user) => {
  const socket = getSocket();
  if (socket && sessionId) {
    socket.emit('join_radar_session', {
      sessionId,
      role: user?.role || 'user',
      userName: user?.name || 'Guest',
    });
  }
};

export const leaveRadarRoom = (sessionId) => {
  const socket = getSocket();
  if (socket && sessionId) {
    socket.emit('leave_radar_session', { sessionId });
  }
};

export default getSocket;
