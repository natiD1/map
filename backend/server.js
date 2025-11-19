




// START: Added required modules for real-time functionality
const http = require('http');
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
// END: Added modules

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/locations');
const adminRoutes = require('./routes/admin');
const supervisorRoutes = require('./routes/supervisor');
// START: Added notifications route
const notificationRoutes = require('./routes/notifications');
// END: Added notifications route

const uploadMiddleware = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Server Setup and Middleware ---
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. Exiting.');
  process.exit(1);
}

// START: Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST"]
  }
});

// This object will store the mapping of userId to their unique socketId
const connectedUsers = {};
// END: Server and Socket.IO setup

app.use(cors());
app.use(express.json({ limit: '1Gb' }));
app.use(express.urlencoded({ limit: '1Gb', extended: true }));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// START: Make io and connectedUsers available to all routes
app.set('socketio', io);
app.set('connectedUsers', connectedUsers);
// END: Make io available

// --- Route Registrations ---
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supervisor', supervisorRoutes);

// START: Register the new notifications route
app.use('/api/notifications', notificationRoutes);
// END: Register route

// START: Socket.IO Authentication Middleware & Connection Logic
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = user; // Attach user info to the socket for later use
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.fullName} with socket ID ${socket.id}`);
  // Store the user's socket ID for direct messaging
  connectedUsers[socket.user.id] = socket.id;

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.fullName}`);
    // Clean up the user's record upon disconnection
    delete connectedUsers[socket.user.id];
  });
});
// END: Socket.IO Logic

// --- Global Error Handling Middleware ---
app.use((error, req, res, next) => {
  console.error('Global Error middleware caught:', error);
  if (error instanceof uploadMiddleware.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        message: 'File too large. Maximum size is 100MB.',
        maxSize: '100MB'
      });
    }
    return res.status(400).json({ 
      message: `File upload error: ${error.message}` 
    });
  }
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      message: error.message 
    });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// --- Start the server ---
// IMPORTANT: We use server.listen() instead of app.listen() now
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});