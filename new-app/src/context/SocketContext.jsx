// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Connect to the server, passing the token for authentication
      const newSocket = io('http://localhost:5001', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Socket.IO connected!');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
      });

      setSocket(newSocket);

      // Cleanup on component unmount
      return () => newSocket.close();
    }
  }, []); // This effect runs once on mount

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};