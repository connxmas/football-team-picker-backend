const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let sessions = {};

io.on("connection", (socket) => {
  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        players: [],
        captains: [],
        rpsWinner: null,
        picks: {},
        pickedPlayers: [],
        rpsStage: false
      };
    }
    socket.emit("state-update", sessions[sessionId]);
  });

  socket.on("update-session", ({ sessionId, state }) => {
    sessions[sessionId] = state;
    io.to(sessionId).emit("state-update", state);
  });
});

server.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
