const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store session data
const sessions = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        players: [],
        captains: [],
        rpsWinner: null,
        picks: {},
        pickedPlayers: [],
        currentTurn: null,
        rpsDone: false,
        rpsChoices: {},
        onlineUsers: []
      };
    }
    socket.emit('state-update', sessions[sessionId]);
  });

  socket.on('update-session', ({ sessionId, state }) => {
    if (sessions[sessionId]) {
      sessions[sessionId] = { ...sessions[sessionId], ...state };
      io.to(sessionId).emit('state-update', sessions[sessionId]);
    }
  });

  socket.on('user-joined', (userName) => {
    const sessionId = Object.keys(socket.rooms)[1]; // Get the session ID
    if (sessions[sessionId]) {
      if (!sessions[sessionId].onlineUsers.includes(userName)) {
        sessions[sessionId].onlineUsers.push(userName);
        io.to(sessionId).emit('user-joined', userName);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up online users when they disconnect
    Object.keys(sessions).forEach(sessionId => {
      const session = sessions[sessionId];
      if (session.onlineUsers) {
        session.onlineUsers = session.onlineUsers.filter(user => 
          user !== socket.id
        );
        io.to(sessionId).emit('state-update', session);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
