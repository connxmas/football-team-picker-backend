const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

// --- Persistent player list (JSON file) ---
const DATA_FILE = path.join(__dirname, 'players.json');
let persistentPlayers = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    persistentPlayers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
} catch (e) {
  persistentPlayers = [];
}

// --- Serve React build ---
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// --- Socket.IO setup ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const sessions = {};

io.on('connection', (socket) => {
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        players: [...persistentPlayers], // Use persistent list
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
      // If players changed, update persistent storage
      if (state.players) {
        persistentPlayers = state.players;
        fs.writeFileSync(DATA_FILE, JSON.stringify(persistentPlayers, null, 2));
      }
      sessions[sessionId] = { ...sessions[sessionId], ...state };
      io.to(sessionId).emit('state-update', sessions[sessionId]);
    }
  });

  socket.on('user-joined', (userName) => {
    // You can enhance online user tracking here if needed
  });

  socket.on('disconnect', () => {
    // Handle user disconnect if needed
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
