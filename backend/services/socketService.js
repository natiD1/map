const jwt = require('jsonwebtoken');

let io;

module.exports = {
  /**
   * Initializes the Socket.IO server and attaches authentication middleware.
   * @param {http.Server} httpServer The Node.js HTTP server instance.
   * @returns The Socket.IO server instance.
   */
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: "http://localhost:3000", // Your React app's URL
        methods: ["GET", "POST"]
      }
    });

    // Add authentication middleware to protect the socket connection
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided.'));
      }
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          console.error("Socket Auth Error: Invalid Token");
          return next(new Error('Authentication error: Invalid token.'));
        }
        socket.user = user; // Attach user info to the socket instance
        next();
      });
    });

    io.on('connection', (socket) => {
      console.log(`User connected with socket ID: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  /**
   * Retrieves the initialized Socket.IO server instance.
   * @returns The Socket.IO server instance.
   */
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};