import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // This effect handles closing the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The main language icon button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="
          p-2 
          text-white 
          bg-white/10 backdrop-blur-lg 
          border border-white/20 rounded-full 
          shadow-lg
          transition-all duration-300 ease-in-out
          hover:bg-white/20 hover:shadow-xl hover:shadow-white/20
          focus:outline-none focus:ring-2 focus:ring-white/50
        "
        aria-label="Change language"
      >
        <FaGlobe className="h-5 w-5 text-white/90" />
      </button>

      {/* The animated dropdown menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-full right-0 mt-2 w-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl overflow-hidden"
          >
            <ul>
              <li>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    i18n.language === 'en' ? 'bg-blue-500/50 text-white' : 'text-gray-200 hover:bg-white/20'
                  }`}
                >
                  English
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage('he')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    i18n.language === 'he' ? 'bg-blue-500/50 text-white' : 'text-gray-200 hover:bg-white/20'
                  }`}
                >
                  עברית
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;