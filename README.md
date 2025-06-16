# Football Team Picker Backend

Backend server for the Football Team Picker application using Socket.IO for real-time communication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## API Endpoints

The server uses Socket.IO for real-time communication. Main events:

- `join-session`: Join a team picking session
- `update-session`: Update session state
- `user-joined`: Notify when a user joins
- `state-update`: Broadcast state changes to all connected clients
