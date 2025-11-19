
// components/Navigation.jsx
import React, { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 w-full z-50 py-4 px-4 md:px-8 flex justify-between items-center bg-[#0A1931] bg-opacity-90 backdrop-filter-sm backdrop-blur-lg">
      <div className="text-white text-2xl font-bold flex items-center">
        <div className="w-10 h-10 bg-[#00B4D8] rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold">G</span>
        </div>
        GeoBuild<span className="text-[#00B4D8]">License</span>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden text-white focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      
      {/* Desktop menu */}
      <div className="hidden md:flex space-x-8">
        <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
        <a href="#solutions" className="text-gray-300 hover:text-white transition-colors">Solutions</a>
        <a href="#clients" className="text-gray-300 hover:text-white transition-colors">Clients</a>
        <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
      </div>
      
      <button className="hidden md:block bg-[#00B4D8] text-white px-4 py-2 rounded-md hover:bg-[#0096C7] transition-colors">
        Client Login
      </button>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0A1931] bg-opacity-95 backdrop-filter backdrop-blur-lg md:hidden">
          <div className="flex flex-col py-4 px-4 space-y-4">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#solutions" className="text-gray-300 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Solutions</a>
            <a href="#clients" className="text-gray-300 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Clients</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Contact</a>
            <button className="bg-[#00B4D8] text-white px-4 py-2 rounded-md hover:bg-[#0096C7] transition-colors mt-4">
              Client Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

