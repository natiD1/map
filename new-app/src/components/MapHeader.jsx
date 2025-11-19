

// for logoutimport React from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaCity, FaFilter, FaMapMarkerAlt, FaShareAlt, FaMoon, FaSun, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const premiumStyles = {
  primaryGradient: 'from-cyan-500 to-blue-600',
  secondaryGradient: 'from-violet-600 to-purple-700', 
  accentGradient: 'from-pink-500 to-rose-500',
  glassMorphism: 'backdrop-blur-xl bg-white/10 border border-white/20',
  darkGlassMorphism: 'backdrop-blur-xl bg-black/20 border border-white/10',
  premiumShadow: 'shadow-[0_20px_50px_rgba(59,_130,_246,_0.4)]',
  neonGlow: 'shadow-[0_0_30px_rgba(99,_102,_241,_0.4)]',
  floatingShadow: 'shadow-[0_25px_50px_-12px_rgba(0,_0,_0,_0.25)]',
  buttonGlow: 'shadow-[0_0_20px_rgba(99,_102,_241,_0.6)]',
  buttonHover: 'hover:shadow-[0_0_30px_rgba(99,_102,_241,_0.8)]',
  shareButton: 'from-emerald-500 to-teal-600',
  darkMode: {
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    panel: 'bg-gray-800/90',
    border: 'border-gray-700'
  }
};

const premiumAnimations = {
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
  },
  buttonHover: {
    whileHover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  },
  logoutHover: {
    whileHover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  },
  pulse: {
    animate: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

const MapHeader = ({ 
  onAddProject, 
  onToggleCities, 
  onToggleFilters, 
  onShare,
  onToggleDarkMode,
  activeFiltersCount,
  isCityPanelOpen,
  isFilterPanelOpen,
  isDrawing,
  darkMode
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.div 
      className={`${premiumStyles.glassMorphism} ${premiumStyles.premiumShadow} rounded-2xl p-5 relative overflow-hidden`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 animate-pulse pb-5"></div>
      
      {/* Premium decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/30 to-pink-600/30 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        {/* Left side - Title with icon */}
        <motion.div 
          className="flex items-center space-x-4"
          variants={premiumAnimations.staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="flex items-center space-x-3 bg-gradient-to-r from-white/10 to-transparent p-3 rounded-xl"
            variants={premiumAnimations.staggerChild}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-70"></div>
              <FaMapMarkerAlt className="relative text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                BSD Design and Management
              </h1>
              {user && (
                <p className="text-sm text-gray-300">
                  Welcome, {user.fullName || user.email}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
        
        {/* Right side - Buttons */}
        <motion.div 
          className="flex items-center space-x-3"
          variants={premiumAnimations.staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Dark Mode Toggle */}
          <motion.button
            className={`relative group p-3 rounded-xl text-white overflow-hidden transition-all duration-300 ${
              darkMode 
                ? `bg-gradient-to-r from-gray-700 to-gray-800 ${premiumStyles.buttonGlow}` 
                : `bg-gradient-to-r from-amber-500 to-orange-500 ${premiumStyles.buttonGlow}`
            }`}
            onClick={onToggleDarkMode}
            {...premiumAnimations.buttonHover}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
          </motion.button>
          
          {/* Share Button */}
          <motion.button
            className={`relative group p-3 rounded-xl text-white overflow-hidden transition-all duration-300 bg-gradient-to-r ${premiumStyles.shareButton} ${premiumStyles.buttonGlow} ${premiumStyles.buttonHover}`}
            onClick={onShare}
            {...premiumAnimations.buttonHover}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaShareAlt className="w-5 h-5" />
          </motion.button>
          
          {/* Add Project Button */}
          <motion.button
            className={`relative group px-5 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 flex items-center space-x-2 ${
              isDrawing 
                ? `bg-gradient-to-r from-red-500 to-red-600 ${premiumStyles.neonGlow}` 
                : `bg-gradient-to-r ${premiumStyles.primaryGradient} ${premiumStyles.buttonGlow} ${premiumStyles.buttonHover}`
            }`}
            onClick={onAddProject}
            {...premiumAnimations.buttonHover}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <motion.div
              animate={{ rotate: isDrawing ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaPlus className="w-4 h-4" />
            </motion.div>
            <span>{isDrawing ? 'Cancel' : 'Add Project'}</span>
          </motion.button>
          
          {/* Cities Button */}
          <motion.button
            className={`relative group px-5 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 flex items-center space-x-2 ${
              isCityPanelOpen 
                ? `bg-gradient-to-r ${premiumStyles.secondaryGradient} ${premiumStyles.neonGlow}` 
                : `bg-gradient-to-r ${premiumStyles.secondaryGradient} ${premiumStyles.buttonGlow} ${premiumStyles.buttonHover}`
            }`}
            onClick={onToggleCities}
            {...premiumAnimations.buttonHover}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaCity className="w-4 h-4" />
            <span>Cities</span>
          </motion.button>
          
          {/* Filters Button */}
          <motion.button
            className={`relative group px-5 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 flex items-center space-x-2 ${
              isFilterPanelOpen 
                ? `bg-gradient-to-r ${premiumStyles.accentGradient} ${premiumStyles.neonGlow}` 
                : `bg-gradient-to-r ${premiumStyles.accentGradient} ${premiumStyles.buttonGlow} ${premiumStyles.buttonHover}`
            }`}
            onClick={onToggleFilters}
            {...premiumAnimations.buttonHover}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaFilter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <motion.div
                className="bg-white/30 rounded-full px-2 py-1 text-xs"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {activeFiltersCount}
              </motion.div>
            )}
          </motion.button>
          
          {/* Logout Button */}
          <motion.button
            className="relative group px-4 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-[0_0_15px_rgba(107,114,128,0.5)] hover:shadow-[0_0_25px_rgba(107,114,128,0.8)] transition-all duration-300 flex items-center space-x-2"
            onClick={handleLogout}
            {...premiumAnimations.logoutHover}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <FaUserCircle className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Logout</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MapHeader;