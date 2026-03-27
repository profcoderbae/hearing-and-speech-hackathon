const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Serve static client build in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// --------------- Room Management ---------------
const rooms = new Map(); // roomCode -> { users: Map<socketId, {role, name}>, createdAt }

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomInfo(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  const users = [];
  room.users.forEach((userData, socketId) => {
    users.push({ socketId, ...userData });
  });
  return { roomCode, users, createdAt: room.createdAt };
}

// --------------- Socket.io Events ---------------
io.on('connection', (socket) => {
  console.log(`[SignBridge] User connected: ${socket.id}`);

  // Create a new room
  socket.on('create-room', ({ name }, callback) => {
    const roomCode = generateRoomCode();
    rooms.set(roomCode, {
      users: new Map([[socket.id, { name, role: null }]]),
      createdAt: Date.now(),
    });
    socket.join(roomCode);
    socket.roomCode = roomCode;
    console.log(`[SignBridge] Room ${roomCode} created by ${name}`);
    callback({ success: true, roomCode, roomInfo: getRoomInfo(roomCode) });
  });

  // Join an existing room
  socket.on('join-room', ({ roomCode, name }, callback) => {
    const code = roomCode.toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      return callback({ success: false, error: 'Room not found. Check the code and try again.' });
    }
    if (room.users.size >= 2) {
      return callback({ success: false, error: 'Room is full. Only 2 users per room.' });
    }

    room.users.set(socket.id, { name, role: null });
    socket.join(code);
    socket.roomCode = code;

    // Notify others in the room
    socket.to(code).emit('user-joined', { name, socketId: socket.id });

    console.log(`[SignBridge] ${name} joined room ${code}`);
    callback({ success: true, roomCode: code, roomInfo: getRoomInfo(code) });
  });

  // Set user role (speaker or signer)
  socket.on('set-role', ({ role }, callback) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return callback({ success: false, error: 'Not in a room' });

    const user = room.users.get(socket.id);
    if (user) {
      user.role = role; // 'speaker' or 'signer'
      socket.to(socket.roomCode).emit('user-role-changed', {
        socketId: socket.id,
        name: user.name,
        role,
      });
      callback({ success: true });
    }
  });

  // Send message (text from either speaker or signer)
  socket.on('send-message', ({ text, type }) => {
    if (!socket.roomCode) return;
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const user = room.users.get(socket.id);
    const message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      text,
      type, // 'speech' (from speaker) or 'sign' (from signer)
      senderName: user?.name || 'Unknown',
      senderId: socket.id,
      timestamp: Date.now(),
    };

    // Send to everyone in the room including sender
    io.to(socket.roomCode).emit('new-message', message);
    console.log(`[SignBridge] Message in ${socket.roomCode}: [${type}] "${text}"`);
  });

  // Typing / signing indicator
  socket.on('activity-indicator', ({ isActive, activityType }) => {
    if (!socket.roomCode) return;
    const room = rooms.get(socket.roomCode);
    const user = room?.users.get(socket.id);
    socket.to(socket.roomCode).emit('partner-activity', {
      isActive,
      activityType, // 'speaking', 'typing', 'signing'
      name: user?.name || 'Partner',
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[SignBridge] User disconnected: ${socket.id}`);
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        const user = room.users.get(socket.id);
        room.users.delete(socket.id);

        socket.to(socket.roomCode).emit('user-left', {
          name: user?.name || 'Unknown',
          socketId: socket.id,
        });

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(socket.roomCode);
          console.log(`[SignBridge] Room ${socket.roomCode} deleted (empty)`);
        }
      }
    }
  });
});

// --------------- Health Check ---------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SignBridge Server',
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

// Catch-all for SPA routing in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// --------------- Start Server ---------------
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🤟 SignBridge Server running on http://localhost:${PORT}\n`);
});
