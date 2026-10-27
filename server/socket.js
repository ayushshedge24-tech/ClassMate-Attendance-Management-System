const { Server } = require('socket.io');

let ioInstance = null;

const initSocket = (httpServer) => {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*';

  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: allowedOrigins !== '*',
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.on('connection', (socket) => {
    // Join Radar Session Room (for live attendance feed)
    socket.on('join_radar_session', ({ sessionId, role, userName }) => {
      if (sessionId) {
        const roomName = `session:${sessionId}`;
        socket.join(roomName);
        console.log(`[Socket] ${userName || 'Client'} (${role || 'User'}) joined ${roomName}`);
        socket.to(roomName).emit('user_joined_session', {
          socketId: socket.id,
          userName,
          role,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Leave Radar Session Room
    socket.on('leave_radar_session', ({ sessionId }) => {
      if (sessionId) {
        socket.leave(`session:${sessionId}`);
      }
    });

    // Join Personal Notification Channel
    socket.on('join_user_channel', ({ userId }) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnect handled cleanly
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

const emitToSession = (sessionId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`session:${sessionId}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToSession,
  emitToUser,
};
