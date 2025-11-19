import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearchLocation } from "react-icons/fa";
// START: Link is already imported, which is what we need
import { Link, useNavigate, useLocation } from 'react-router-dom';
// END: Link is already imported
import L from 'leaflet';

import logo from '../assets/noback.png'; 

import { useAuth } from '../context/AuthContext';
import MapModal from './MapModal';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const useSearchHistory = () => {
  // ... (no changes in this custom hook)
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const addSearchTerm = (term) => {
    if (!term || history.includes(term)) return;
    const updatedHistory = [term, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  return [history, addSearchTerm];
};

const MainHero = () => {
  const { t } = useTranslation();
  const [heroInput, setHeroInput] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [searchHistory, addSearchTerm] = useSearchHistory();
  const [suggestions, setSuggestions] = useState([]);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  
  const location = useLocation();
  const fromLogin = location.state?.fromLogin;

  useEffect(() => {
    if (user && !loading && fromLogin) {
      setShowMap(true);
    }
  }, [user, loading, fromLogin]);

  const handleSearch = async (query) => {
    // ... (no changes in this function)
    if (!query.trim()) return;
    addSearchTerm(query);
    setHeroInput(query);
    setSearchedLocation(null);

    try {
      const backendRes = await fetch(`http://localhost:5001/api/locations/search?q=${encodeURIComponent(query)}`);
      
      if (!backendRes.ok) {
        throw new Error('Search failed');
      }

      const results = await backendRes.json();

      if (Array.isArray(results) && results.length > 0 && results[0]) {
        const loc = results[0];
        setSearchedLocation(loc);

        if (loc.boundary_coords?.coordinates?.length > 0) {
          const flippedCoords = loc.boundary_coords.coordinates[0].map(p => [p[1], p[0]]);
          const bounds = L.polygon(flippedCoords).getBounds();
          const center = bounds.getCenter();
          setMapCoords([center.lat, center.lng]);
        }

        setShowMap(true);
        setSuggestions([]);
        return;
      }

      const nominatimRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const nominatimData = await nominatimRes.json();

      if (nominatimData && nominatimData.length > 0) {
        const { lat, lon, display_name } = nominatimData[0];
        setMapCoords([parseFloat(lat), parseFloat(lon)]);

        const placeholderLocation = {
          id: `nominatim-${nominatimData[0].place_id}`,
          name: query,
          description: display_name,
          address: display_name,
          boundary_coords: null,
        };
        setSearchedLocation(placeholderLocation);
        setShowMap(true);
      } else {
        alert("No results found.");
      }

      setSuggestions([]);
    } catch (error) {
      console.error("Search failed:", error);
      alert("An error occurred during search.");
    }
  };

  const handleShowCleanMap = () => {
    setSearchedLocation(null);
    setHeroInput('');
    setMapCoords([33.06333, 35.15833]);
    setShowMap(true);
  };

  const handleHeroInputChange = (e) => {
    // ... (no changes in this function)
    const value = e.target.value;
    setHeroInput(value);
    if (value) {
        const filteredSuggestions = searchHistory.filter(item =>
            item.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
    } else {
        setSuggestions([]);
    }
  };

  if (loading) {
    // ... (no changes in the loading state)
    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
             <video autoPlay loop muted playsInline className="absolute inset-0 object-cover w-full h-full z-0 filter blur-md" src="https://videos.pexels.com/video-files/6607871/6607871-uhd_2560_1440_30fps.mp4" />
             <div className="absolute inset-0 bg-black/40 z-10" />
            <p className="relative z-20 text-white text-xl">Loading user data...</p>
        </div>
    );
  }

  return (
    <>
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <header className="fixed top-0 left-0 w-full bg-transparent px-6 sm:px-8 py-4 z-30">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <motion.div
                className="relative flex h-12 w-20 flex-shrink-0 items-center justify-center"
                whileHover={{
                  scale: 1.05,
                  rotate: -2,
                  transition: { type: 'spring', stiffness: 300, damping: 15 },
                }}
              >
                <img
                  src={logo}
                  alt="BSD Logo"
                  className="h-full w-full object-contain brightness-0 invert"
                />
              </motion.div>
            </Link>
            
            <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                {user ? (
                <button
                    onClick={logout}
                    className="
                    px-6 py-2 
                    font-semibold text-white 
                    bg-white/10 backdrop-blur-lg 
                    border border-white/20 rounded-full 
                    shadow-lg
                    transition-all duration-300 ease-in-out
                    hover:bg-white/20 hover:shadow-xl hover:shadow-white/20
                    focus:outline-none focus:ring-2 focus:ring-white/50
                    "
                >
                    {t('logout')}
                </button>
                ) : (
                <Link
                    to="/login"
                    className="
                    px-6 py-2 
                    font-semibold text-white 
                    bg-blue-500/20 backdrop-blur-lg 
                    border border-blue-400/30 rounded-full 
                    shadow-lg
                    transition-all duration-300 ease-in-out
                    hover:bg-blue-500/40 hover:shadow-xl hover:shadow-blue-500/30
                    focus:outline-none focus:ring-2 focus:ring-blue-400/50
                    "
                >
                    {t('login')}
                </Link>
                )}
            </div>
          </div>
        </header>

        <video autoPlay loop muted playsInline className="absolute inset-0 object-cover w-full h-full z-0 filter blur-md" src="https://videos.pexels.com/video-files/6607871/6607871-uhd_2560_1440_30fps.mp4" />
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        <motion.div
          className="relative z-20 p-4 w-full max-w-2xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
            {user ? (
                 <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 font-two">
                    {t('welcome_user', { name: user.fullName || user.email })}
                </h1>
            ) : (
                <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 font-two">
                    {t('explore_the_world')}
                </h1>
            )}

            {user && (
              <div className="mt-6">
                {/* START: This is the updated part */}
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform inline-block"
                  >
                    {t('Admin Panel')}
                  </Link>
                ) : (
                  <button
                    onClick={handleShowCleanMap}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    {t('Map')}
                  </button>
                )}
                {/* END: This is the updated part */}
              </div>
            )}
            
        </motion.div>
      </div>

      <AnimatePresence>
        {showMap && (
          <MapModal
              show={showMap}
              onClose={() => setShowMap(false)}
              initialCoords={mapCoords}
              searchedLocation={searchedLocation}
              searchInput={heroInput}
              onSearch={handleSearch} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MainHero;