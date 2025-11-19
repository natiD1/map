// src/components/MapCenterSearch.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaSearchLocation } from 'react-icons/fa';

const MapCenterSearch = ({ onSearch }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery(''); // Clear input after search
      setIsSearching(false); // Go back to the icon view
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
      <AnimatePresence>
        {!isSearching ? (
          // The initial search icon that all users see
          <motion.button
            key="search-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsSearching(true)}
            className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-transform hover:scale-110"
            title="Search for a new location"
          >
            <FaSearchLocation size={24} className="text-blue-500" />
          </motion.button>
        ) : (
          // The search bar that appears when the icon is clicked
          <motion.div
            key="search-bar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex items-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-2"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              className="bg-transparent outline-none border-none px-4 text-gray-800"
              placeholder="Search new location..."
              autoFocus
            />
            <button onClick={handleSearchClick} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
              <FaSearch />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapCenterSearch;