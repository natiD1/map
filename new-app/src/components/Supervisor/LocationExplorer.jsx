
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import L from 'leaflet';

// // IMPORTANT: Make sure the path to MapModal and AuthContext is correct for your project structure
// import MapModal from '../MapModal';
// import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

// const LocationExplorer = () => {
//   const { user } = useAuth(); // Get the authenticated user
//   const [showMap, setShowMap] = useState(false);
//   // AFTER (The correct code):
// const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]); // Default coordinates
//   const [searchedLocation, setSearchedLocation] = useState(null);
//   const [searchInput, setSearchInput] = useState('');

//   // A user is considered privileged if they are an admin or a supervisor.
//   const isPrivilegedUser = user?.role === 'admin' || user?.role === 'supervisor';

//   const handleShowCleanMap = () => {
//     setSearchedLocation(null);
//     setSearchInput('');
//     setMapCoords([33.06333, 35.15833]);
//     setShowMap(true);
//   };

//   const handleSearch = async (query) => {
//     if (!query.trim()) return;
//     // ... (Copy the full handleSearch logic from your AdminPanel.jsx here)
//     // This logic handles searching your backend and falling back to Nominatim
//     console.log("Searching for:", query);
//     // For now, let's just open the map at a default location
//     setShowMap(true);
//   };

//   return (
//     <>
//       <div className="backdrop-blur-sm bg-black/20 rounded-lg p-4 md:p-6">
//         <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Location Explorer</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//           <div className="bg-gray-700/50 p-3 md:p-4 rounded-lg">
//             <h3 className="text-lg font-semibold text-white mb-2">View Full Map</h3>
//             <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Open the interactive map to explore all registered locations.</p>
//             <button
//               onClick={handleShowCleanMap}
//               className="px-3 py-2 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
//             >
//               Open Map
//             </button>
//           </div>
          
//           <div className="bg-gray-700/50 p-3 md:p-4 rounded-lg">
//             <h3 className="text-lg font-semibold text-white mb-2">Search Location</h3>
//             <div className="flex flex-col md:flex-row">
//               <input
//                 type="text"
//                 value={searchInput}
//                 onChange={(e) => setSearchInput(e.target.value)}
//                 onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchInput); }}
//                 className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-t-lg md:rounded-l-lg md:rounded-t-none focus:outline-none text-sm md:text-base"
//                 placeholder="Search by address, city, or name..."
//               />
//               <button
//                 onClick={() => handleSearch(searchInput)}
//                 className="bg-blue-500 text-white px-3 py-2 rounded-b-lg md:rounded-r-lg md:rounded-b-none hover:bg-blue-600 transition-colors text-sm md:text-base"
//               >
//                 Search
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {showMap && (
//           <MapModal
//             show={showMap}
//             onClose={() => setShowMap(false)}
//             initialCoords={mapCoords}
//             searchedLocation={searchedLocation}
//             searchInput={searchInput}
//             onSearch={handleSearch}
//             // Pass the calculated privilege status to the modal
//             isAdmin={isPrivilegedUser} 
//           />
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default LocationExplorer;



// src/pages/Supervisor/LocationExplorer.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';

import MapModal from '../MapModal';
import { useAuth } from '../../context/AuthContext';

const LocationExplorer = () => {
  const { user } = useAuth();
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  const isPrivilegedUser = user?.role === 'admin' || user?.role === 'supervisor';

  const handleShowCleanMap = () => {
    setSearchedLocation(null);
    setSearchInput('');
    setMapCoords([33.06333, 35.15833]);
    setShowMap(true);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    console.log("Searching for:", query);
    setShowMap(true);
  };

  return (
    <>
      <div className="bg-slate-100/80 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-200 dark:border-transparent">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">Location Explorer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white dark:bg-slate-800/50 p-3 md:p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">View Full Map</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3 md:mb-4 text-sm">Open the interactive map to explore all registered locations.</p>
            <button
              onClick={handleShowCleanMap}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors text-sm"
            >
              Open Map
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-800/50 p-3 md:p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Search Location</h3>
             <div className="flex flex-col sm:flex-row">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchInput); }}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-2 rounded-t-lg sm:rounded-l-lg sm:rounded-t-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Search by address, city, or name..."
              />
              <button
                onClick={() => handleSearch(searchInput)}
                className="bg-blue-600 text-white px-4 py-2 rounded-b-lg sm:rounded-r-lg sm:rounded-b-none hover:bg-blue-500 font-semibold transition-colors text-sm"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMap && (
          <MapModal
            show={showMap}
            onClose={() => setShowMap(false)}
            initialCoords={mapCoords}
            searchedLocation={searchedLocation}
            searchInput={searchInput}
            onSearch={handleSearch}
            isAdmin={isPrivilegedUser} 
            useVideoBackground={true}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default LocationExplorer;