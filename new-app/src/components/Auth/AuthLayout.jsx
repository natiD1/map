// src/components/AuthLayout.js

import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Video Background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 object-cover w-full h-full z-0 filter blur-md" src="https://videos.pexels.com/video-files/6607871/6607871-uhd_2560_1440_30fps.mp4" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Header with Link to Home */}
      <header className="fixed top-0 left-0 w-full bg-transparent px-6 sm:px-8 py-4 z-30">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="text-white text-2xl font-bold tracking-wider hover:opacity-80 transition-opacity">
            BSD
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-20 w-full">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;