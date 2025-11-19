
// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const decodeAndSetUser = useCallback((token) => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expired. Logging out.");
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            fullName: decoded.fullName || 'User',
            token: token
          });
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = getToken();
    decodeAndSetUser(token);
  }, [getToken, decodeAndSetUser]);

  // const login = async (email, password) => {
  //   try {
  //     const response = await fetch('http://localhost:5001/api/auth/login', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       localStorage.setItem('token', data.token);
  //       setUser({
  //         id: data.user.id,
  //         email: data.user.email,
  //         role: data.user.role,
  //         fullName: data.user.fullName,
  //         token: data.token
  //       });
  //       return { success: true, message: data.message };
  //     } else {
  //       return { success: false, message: data.message || 'Login failed' };
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     return { success: false, message: 'Network error or server unavailable' };
  //   }
  // };

const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        fullName: data.user.fullName,
        token: data.token
      };
      setUser(userData);
      return { success: true, message: data.message, user: userData }; // Add user to return
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error or server unavailable' };
  }
};


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // ✅ Wrap context value in useMemo to prevent unnecessary re-renders
  const authContextValue = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      getToken,
    }),
    [user, loading, login, logout, getToken]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};