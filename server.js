const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Optional: Friendly root message
app.get('/', (req, res) => {
  res.send('Football Team Picker backend is running!');
});

// Session state
const sessions = {};

io.on('connection', (socket) => {
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
    // You may want to improve this logic for online users
  });

  socket.on('disconnect', () => {
    // Handle user disconnect if needed
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
