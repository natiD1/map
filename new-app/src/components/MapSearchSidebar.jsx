
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaEye, FaEyeSlash, FaFilter } from 'react-icons/fa';

const premiumStyles = {
  primaryGradient: 'from-cyan-500 to-blue-600',
  secondaryGradient: 'from-violet-600 to-purple-700', 
  accentGradient: 'from-pink-500 to-rose-500',
  glassMorphism: 'backdrop-blur-xl bg-white/10 border border-white/20',
  darkGlassMorphism: 'backdrop-blur-xl bg-black/20 border border-white/10',
  premiumShadow: 'shadow-[0_20px_50px_rgba(59,_130,_246,_0.4)]',
  neonGlow: 'shadow-[0_0_30px_rgba(99,_102,_241,_0.4)]',
  floatingShadow: 'shadow-[0_25px_50px_-12px_rgba(0,_0,_0,_0.25)]',
  darkMode: {
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    panel: 'bg-gray-800/90',
    border: 'border-gray-700'
  }
};

const premiumAnimations = {
  slideInFromRight: {
    initial: { x: 100, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      x: 100, 
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  },
  fadeInScale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  staggerChild: {
    initial: { y: 50, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }
};

const MapSearchSidebar = ({ 
  onSearch, 
  searchInput, 
  setSearchInput,
  recentSearches,
  onRecentSearchClick,
  onQuickFilter,
  allLocations = [], // Default to empty array to prevent undefined error
  onLocationSelect,
  onPanToLocation,
  darkMode
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchLocations = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Add null check for allLocations
    const locations = Array.isArray(allLocations) ? allLocations : [];
    
    const filteredLocations = locations.filter(location => {
      const searchTerm = query.toLowerCase();
      return (
        location.name?.toLowerCase().includes(searchTerm) ||
        location.address?.toLowerCase().includes(searchTerm) ||
        location.city?.toLowerCase().includes(searchTerm) ||
        location.description?.toLowerCase().includes(searchTerm) ||
        location.license_status?.toLowerCase().includes(searchTerm)
      );
    });

    setSearchResults(filteredLocations);
    setIsSearching(false);
  }, [allLocations]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.length > 2) {
      searchLocations(value);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      searchLocations(searchInput);
      onSearch(searchInput);
    }
  };

  const handleLocationClick = (location) => {
    onLocationSelect(location);
    if (onPanToLocation) {
      onPanToLocation(location);
    }
    setSearchInput(location.name || '');
    setSearchResults([]);
  };

  return (
    <motion.div
      className={`p-6 space-y-6 relative overflow-hidden ${darkMode ? premiumStyles.darkMode.panel : 'bg-white/90'}`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
      
      <div className="relative z-10">
        <motion.div
          className="relative"
          variants={premiumAnimations.staggerChild}
        >
          <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>
            Search & Navigation
          </h3>
          
          <div className="relative">
            <motion.div
              className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                isFocused 
                  ? `bg-gradient-to-r ${premiumStyles.primaryGradient} blur-lg opacity-30` 
                  : 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 blur-lg opacity-20'
              }`}
              animate={{ scale: isFocused ? 1.02 : 1 }}
            />
            
            <div className={`relative ${darkMode ? premiumStyles.darkGlassMorphism : premiumStyles.glassMorphism} rounded-xl p-4`}>
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotateY: isFocused ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <FaSearch className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-blue-400'}`} />
                </motion.div>
                <input
                  type="text"
                  placeholder="Search locations, cities, addresses..."
                  value={searchInput}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={`flex-1 bg-transparent outline-none text-lg ${darkMode ? 'text-white placeholder-gray-400' : 'text-black placeholder-gray-400'}`}
                />
              
              </div>
            </div>

            {/* Search Results Dropdown */}
            {(searchResults.length > 0 || isSearching) && (
              <motion.div
                className={`absolute top-full left-0 right-0 mt-2 ${darkMode ? premiumStyles.darkGlassMorphism : premiumStyles.glassMorphism} rounded-xl p-3 z-50 max-h-64 overflow-y-auto`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {isSearching ? (
                  <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Searching...</div>
                ) : (
                  <div className="space-y-2">
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Found {searchResults.length} locations</div>
                    {searchResults.slice(0, 10).map((location) => (
                      <motion.button
                        key={location.id}
                        className={`w-full text-left p-3 rounded-lg ${darkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-white/5 hover:bg-white/10'} transition-all duration-200 ${darkMode ? 'text-white' : 'text-gray-800'}`}
                        onClick={() => handleLocationClick(location)}
                        whileHover={{ x: 5 }}
                      >
                        <div className="font-medium">{location.name || 'Unnamed Location'}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {location.address || location.city || 'No address'}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                          location.license_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          location.license_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          location.license_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {location.license_status?.replace(/_/g, ' ') || 'Not submitted'}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Filters */}
        <motion.div
          className="space-y-4"
          variants={premiumAnimations.staggerChild}
        >
          <h4 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quick Filters</h4>
          <motion.div 
            className="grid grid-cols-2 gap-3"
            variants={premiumAnimations.staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { key: 'all', label: 'All Properties', gradient: premiumStyles.primaryGradient },
              { key: 'approved', label: 'Approved', gradient: 'from-emerald-500 to-green-600' },
              { key: 'pending', label: 'Pending', gradient: premiumStyles.secondaryGradient },
              { key: 'rejected', label: 'Rejected', gradient: premiumStyles.accentGradient }
            ].map((filter) => (
              <motion.button
                key={filter.key}
                className={`relative group p-3 rounded-xl bg-gradient-to-r ${filter.gradient} text-white font-medium overflow-hidden`}
                onClick={() => onQuickFilter(filter.key)}
                variants={premiumAnimations.staggerChild}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">{filter.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <motion.div
            className="space-y-4"
            variants={premiumAnimations.staggerChild}
          >
            <h4 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recent Searches</h4>
            <motion.div 
              className="space-y-2"
              variants={premiumAnimations.staggerContainer}
              initial="initial"
              animate="animate"
            >
              {recentSearches.slice(0, 5).map((search, index) => (
                <motion.button
                  key={index}
                  className={`w-full text-left p-3 rounded-xl ${darkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-white/10 hover:bg-white/20'} transition-all duration-200 group`}
                  onClick={() => onRecentSearchClick(search)}
                  variants={premiumAnimations.staggerChild}
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <FaSearch className={`w-4 h-4 ${darkMode ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-blue-400 group-hover:text-blue-500'} transition-colors duration-200`} />
                    <span className={`truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{search}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MapSearchSidebar;