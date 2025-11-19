
// import React, { useRef, useEffect, useState } from 'react';
// import { FaSearch, FaShareAlt, FaUserCircle, FaLayerGroup } from 'react-icons/fa';

// const Header = ({
//   searchQuery,
//   setSearchQuery,
//   searchResults,
//   setSearchResults,
//   onSelectSearchResult,
//   toggleSidePanel,
//   sidePanelOpen,
//   showUserMenu,
//   toggleUserMenu,
//   handleMenuItemClick,
//   toggleSharePanel,
//   sharePanelOpen,
//   // Removed: overlayOpacity, setOverlayOpacity, showOverlay, setShowOverlay — no longer used
// }) => {
//   const userMenuRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const searchResultsRef = useRef(null);

//   // Effect to handle clicks outside menus (only user menu and search results now)
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Close user menu
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         if (showUserMenu) {
//           toggleUserMenu();
//         }
//       }

//       // Close search results dropdown
//       if (
//         searchResultsRef.current &&
//         searchInputRef.current &&
//         !searchResultsRef.current.contains(event.target) &&
//         !searchInputRef.current.contains(event.target)
//       ) {
//         if (searchResults.length > 0) {
//           setSearchResults([]);
//         }
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showUserMenu, toggleUserMenu, searchResults.length, setSearchResults]);

//   return (
//     <header className="bg-white shadow-sm border-b px-3 py-4 flex items-center justify-between z-50 relative">
//       {/* Layers Button — Opens SidePanel directly, no dropdown */}
//       <button
//         onClick={toggleSidePanel}
//         className="flex items-center space-x-1 text-gray-700 font-medium hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100 text-sm"
//         aria-label="Open Layers Panel"
//       >
//         <FaLayerGroup className="text-base" />
//         <span>Layers</span>
//       </button>

//       {/* Search Bar with Results Dropdown */}
//       <div className="flex-1 max-w-md mx-3 relative">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
//             <FaSearch className="text-gray-400 text-sm" />
//           </div>
//           <input
//             ref={searchInputRef}
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search for a layer, address, block/parcel..."
//             className="block w-full pl-9 pr-2.5 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
//             aria-label="Search map location"
//           />
//         </div>
//         {searchResults.length > 0 && (
//           <div
//             ref={searchResultsRef}
//             className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-40"
//           >
//            {searchResults.map((result) => (
//   <div
//     key={result.id} // 👈 Use 'id' instead of 'osm_id || place_id'
//     className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
//     onClick={() => onSelectSearchResult(result)}
//   >
//     {result.text} {/* 👈 Use 'text' instead of 'display_name' */}
//   </div>
// ))}
//           </div>
//         )}
//       </div>

//       {/* Share & Profile */}
//       <div className="flex items-center space-x-3">
//         {/* Share Button */}
//         <button
//           onClick={toggleSharePanel}
//           className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100 text-sm ${sharePanelOpen ? 'bg-gray-100' : ''}`}
//           aria-label="Share Map"
//         >
//           <FaShareAlt className="text-base" />
//           <span>Share</span>
//         </button>

//         {/* User Profile with Dropdown Menu */}
//         <div className="relative" ref={userMenuRef}>
//           <button
//             onClick={toggleUserMenu}
//             className="flex items-center space-x-1.5 bg-gray-100 rounded-full p-1.5 hover:bg-gray-200 transition"
//             aria-label="User Profile Menu"
//           >
//             <FaUserCircle className="text-base" />
//           </button>

//           {/* User Menu Dropdown */}
//           {showUserMenu && (
//             <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
//               <div className="py-1">
//                 <button
//                   onClick={() => handleMenuItemClick('About')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">ⓘ</span> About
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('Terms of use')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">📄</span> Terms of use
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('API documentation')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">🔗</span> API documentation
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('Accessibility')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">♿</span> Accessibility
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('Contact Us')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">✉️</span> Contact Us
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('עברית')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">🌐</span> עברית
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('Show in Israel TM Grid')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">🗺️</span> Show in Israel TM Grid
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;



// import React, { useRef, useEffect } from 'react';
// import { FaSearch, FaShareAlt, FaUserCircle, FaLayerGroup } from 'react-icons/fa';

// const Header = ({
//   searchQuery,
//   setSearchQuery,
//   searchResults,
//   setSearchResults,
//   onSelectSearchResult,
//   toggleSidePanel,
//   sidePanelOpen,
//   showUserMenu,
//   toggleUserMenu,
//   handleMenuItemClick,
//   toggleSharePanel,
//   sharePanelOpen,
// }) => {
//   const userMenuRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const searchResultsRef = useRef(null);

//   // Logout function
//   const handleLogout = () => {
//     // Clear authentication data
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userData');
//     sessionStorage.clear(); // Clear session storage if used
    
//     // Redirect to login page
//     window.location.href = '/login';
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         if (showUserMenu) {
//           toggleUserMenu();
//         }
//       }
//       if (
//         searchResultsRef.current &&
//         searchInputRef.current &&
//         !searchResultsRef.current.contains(event.target) &&
//         !searchInputRef.current.contains(event.target)
//       ) {
//         if (searchResults.length > 0) {
//           setSearchResults([]);
//         }
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showUserMenu, toggleUserMenu, searchResults.length, setSearchResults]);

//   return (
//     <header className="bg-white shadow-sm border-b px-3 py-4 flex items-center justify-between z-50 relative">
//       <button
//         onClick={toggleSidePanel}
//         className="flex items-center space-x-1 text-gray-700 font-medium hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100 text-sm"
//         aria-label="Open Layers Panel"
//       >
//         <FaLayerGroup className="text-base" />
//         <span>Layers</span>
//       </button>

//       <div className="flex-1 max-w-md mx-3 relative">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
//             <FaSearch className="text-gray-400 text-sm" />
//           </div>
//           <input
//             ref={searchInputRef}
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search for a layer, address, block/parcel..."
//             className="block w-full pl-9 pr-2.5 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
//             aria-label="Search map location"
//           />
//         </div>
//         {searchResults.length > 0 && (
//           <div
//             ref={searchResultsRef}
//             className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-40"
//           >
//             {searchResults.map((result) => (
//               <div
//                 key={result.id}
//                 className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
//                 onClick={() => onSelectSearchResult(result)}
//               >
//                 {result.text}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="flex items-center space-x-3">
//         <button
//           onClick={toggleSharePanel}
//           className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100 text-sm ${sharePanelOpen ? 'bg-gray-100' : ''}`}
//           aria-label="Share Map"
//         >
//           <FaShareAlt className="text-base" />
//           <span>Share</span>
//         </button>

//         <div className="relative" ref={userMenuRef}>
//           <button
//             onClick={toggleUserMenu}
//             className="flex items-center space-x-1.5 bg-gray-100 rounded-full p-1.5 hover:bg-gray-200 transition"
//             aria-label="User Profile Menu"
//           >
//             <FaUserCircle className="text-base" />
//           </button>
          
//           {showUserMenu && (
//             <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
//               <div className="py-1">
//                 <button
//                   onClick={() => handleMenuItemClick('About')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">ⓘ</span> About
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('Change Language')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">🌐</span> Change Language
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('Contact Us')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">✉️</span> Contact Us
//                 </button>
//                 <div className="border-t border-gray-200 my-1"></div>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">🚪</span> Logout
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;


// import React, { useRef, useEffect } from 'react';
// import { FaSearch, FaShareAlt, FaUserCircle, FaLayerGroup } from 'react-icons/fa';

// const Header = ({
//   searchQuery,
//   setSearchQuery,
//   searchResults,
//   setSearchResults,
//   onSelectSearchResult,
//   toggleSidePanel,
//   sidePanelOpen,
//   showUserMenu,
//   toggleUserMenu,
//   handleMenuItemClick,
//   toggleSharePanel,
//   sharePanelOpen,
// }) => {
//   const userMenuRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const searchResultsRef = useRef(null);

//   // Logout function
//   const handleLogout = () => {
//     // Clear all authentication data
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userToken');
//     localStorage.removeItem('token');
//     localStorage.removeItem('userData');
//     localStorage.removeItem('user');
//     sessionStorage.clear();
    
//     // Clear any cookies if used
//     document.cookie.split(";").forEach(function(c) { 
//       document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
//     });
    
//     // Redirect to login page
//     window.location.href = '/login';
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         if (showUserMenu) {
//           toggleUserMenu();
//         }
//       }
//       if (
//         searchResultsRef.current &&
//         searchInputRef.current &&
//         !searchResultsRef.current.contains(event.target) &&
//         !searchInputRef.current.contains(event.target)
//       ) {
//         if (searchResults.length > 0) {
//           setSearchResults([]);
//         }
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showUserMenu, toggleUserMenu, searchResults.length, setSearchResults]);

//   return (
//     <header className="bg-white shadow-sm border-b px-3 py-4 flex items-center justify-between z-50 relative">
//       <button
//         onClick={toggleSidePanel}
//         className="flex items-center space-x-1 text-gray-700 font-medium hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100 text-sm"
//         aria-label="Open Layers Panel"
//       >
//         <FaLayerGroup className="text-base" />
//         <span>Layers</span>
//       </button>

//       <div className="flex-1 max-w-md mx-3 relative">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
//             <FaSearch className="text-gray-400 text-sm" />
//           </div>
//           <input
//             ref={searchInputRef}
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search for a layer, address, block/parcel..."
//             className="block w-full pl-9 pr-2.5 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
//             aria-label="Search map location"
//           />
//         </div>
//         {searchResults.length > 0 && (
//           <div
//             ref={searchResultsRef}
//             className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-40"
//           >
//             {searchResults.map((result) => (
//               <div
//                 key={result.id}
//                 className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
//                 onClick={() => onSelectSearchResult(result)}
//               >
//                 {result.text}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="flex items-center space-x-3">
//         <button
//           onClick={toggleSharePanel}
//           className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100 text-sm ${sharePanelOpen ? 'bg-gray-100' : ''}`}
//           aria-label="Share Map"
//         >
//           <FaShareAlt className="text-base" />
//           <span>Share</span>
//         </button>

//         <div className="relative" ref={userMenuRef}>
//           <button
//             onClick={toggleUserMenu}
//             className="flex items-center space-x-1.5 bg-gray-100 rounded-full p-1.5 hover:bg-gray-200 transition"
//             aria-label="User Profile Menu"
//           >
//             <FaUserCircle className="text-base" />
//           </button>
          
//           {showUserMenu && (
//             <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
//               <div className="py-1">
//                 <button
//                   onClick={() => handleMenuItemClick('About')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">ⓘ</span> About
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('Change Language')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">🌐</span> Change Language
//                 </button>
//                 <button
//                   onClick={() => handleMenuItemClick('Contact Us')}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">✉️</span> Contact Us
//                 </button>
//                 <div className="border-t border-gray-200 my-1"></div>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
//                 >
//                   <span className="mr-3">🚪</span> Logout
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;


import React, { useRef, useEffect } from 'react';
import { FaSearch, FaShareAlt, FaUserCircle, FaLayerGroup } from 'react-icons/fa';

const Header = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  onSelectSearchResult,
  toggleSidePanel,
  sidePanelOpen,
  showUserMenu,
  toggleUserMenu,
  handleMenuItemClick,
  toggleSharePanel,
  sharePanelOpen,
}) => {
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  
  // Logout function
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear any cookies if used
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Redirect to login page
    window.location.href = '/login';
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        if (showUserMenu) {
          toggleUserMenu();
        }
      }
      if (
        searchResultsRef.current &&
        searchInputRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        if (searchResults.length > 0) {
          setSearchResults([]);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, toggleUserMenu, searchResults.length, setSearchResults]);
  
  return (
    <header className="bg-white shadow-sm border-b px-3 py-4 flex items-center justify-between z-50 relative">
      <button
        onClick={toggleSidePanel}
        className="flex items-center space-x-1 text-gray-700 font-medium hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100 text-sm"
        aria-label="Open Layers Panel"
      >
        <FaLayerGroup className="text-base" />
        <span>Layers</span>
      </button>
      
      <div className="flex-1 max-w-md mx-3 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 text-sm" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location, address, house number..."
            className="block w-full pl-9 pr-2.5 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            aria-label="Search map location"
          />
        </div>
        
        {searchResults.length > 0 && (
          <div
            ref={searchResultsRef}
            className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-40"
          >
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
                onClick={() => onSelectSearchResult(result)}
              >
                <div className="font-medium">{result.name || result.text}</div>
                {result.address && (
                  <div className="text-xs text-gray-500">{result.address}</div>
                )}
                {result.source === 'database' && (
                  <div className="text-xs text-blue-500 mt-1">House Location</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSharePanel}
          className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition p-1.5 rounded-md hover:bg-gray-100 text-sm ${sharePanelOpen ? 'bg-gray-100' : ''}`}
          aria-label="Share Map"
        >
          <FaShareAlt className="text-base" />
          <span>Share</span>
        </button>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            className="flex items-center space-x-1.5 bg-gray-100 rounded-full p-1.5 hover:bg-gray-200 transition"
            aria-label="User Profile Menu"
          >
            <FaUserCircle className="text-base" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="py-1">
                <button
                  onClick={() => handleMenuItemClick('About')}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="mr-3">ⓘ</span> About
                </button>
                <button
                  onClick={() => handleMenuItemClick('Change Language')}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="mr-3">🌐</span> Change Language
                </button>
                <button
                  onClick={() => handleMenuItemClick('Contact Us')}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="mr-3">✉️</span> Contact Us
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <span className="mr-3">🚪</span> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;