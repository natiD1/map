import { useEffect, useState, useMemo } from 'react';
import io from 'socket.io-client';

export const useSocket = (serverUrl) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Retrieve token from local storage
    const token = localStorage.getItem('token');
    
    // Do not attempt to connect if the user is not authenticated
    if (!token) {
        console.warn("No token found, socket connection not established.");
        return;
    }

    // Establish the connection, passing the token for authentication
    const newSocket = io(serverUrl, {
      auth: {
        token: token
      }
    });

    setSocket(newSocket);

    // Disconnect the socket when the component unmounts
    return () => {
      newSocket.close();
    };
  }, [serverUrl]); // Re-connect only if the server URL changes

  return socket;
};