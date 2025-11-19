// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { user, loading } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     // You could add a loading spinner here
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   if (!user) {
//     // Redirect to login page but save the location they were trying to access
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (adminOnly && user.role !== 'admin') {
//     // Redirect non-admin users trying to access admin routes
//     return <Navigate to="/map" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;








// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You could add a loading spinner here
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is provided and the user's role is not included, redirect.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // It's a good practice to redirect to a dedicated "unauthorized" page
    // or back to a safe default page like the home page or map.
    return <Navigate to="/unauthorized" replace />;
  }

  // If the user is authenticated and has the required role (or if no specific role is required), render the children.
  return children;
};

export default ProtectedRoute;