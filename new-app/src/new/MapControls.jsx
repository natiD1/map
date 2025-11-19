
// import React, { useState } from 'react';
// import { FaCompass, FaUndo, FaRedo, FaMap, FaDrawPolygon, FaTimes } from 'react-icons/fa';

// const MapControls = ({
//   handleZoomIn,
//   handleZoomOut,
//   handleRotate,
//   handleResetRotation,
//   onChangeBackground,
//   hideControls,
//   isDrawing,
//   toggleDrawing
// }) => {
//   const [showControls, setShowControls] = useState(false);
//   const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
//   const [selectedBackground, setSelectedBackground] = useState('Streets and Buildings');
  
//   const handleBackgroundSelect = (option) => {
//     setSelectedBackground(option);
//     setShowBackgroundOptions(false);
//     if (onChangeBackground) {
//       onChangeBackground(option);
//     }
//   };
  
//   if (hideControls) {
//     return null;
//   }
  
//   return (
//     <>
//       <div className="absolute top-12 right-3 flex flex-col space-y-1" style={{ zIndex: 1000 }}>
//         {/* Compass Rotation Controls */}
//         <div
//           className="relative group"
//           onMouseEnter={() => setShowControls(true)}
//           onMouseLeave={() => setShowControls(false)}
//         >
//           <div className={`absolute right-full top-1/2 transform -translate-y-1/2 mr-1.5 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
//             <div className="flex flex-col space-y-1.5">
//               <div className="text-xs text-gray-700 bg-gray-800 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
//                 Rotate
//               </div>
//               <div className="flex space-x-1.5">
//                 <button
//                   onClick={handleRotate}
//                   className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
//                   aria-label="Rotate Clockwise"
//                 >
//                   <FaRedo className="text-sm text-gray-700" />
//                 </button>
//                 <button
//                   onClick={handleResetRotation}
//                   className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
//                   aria-label="Reset Rotation"
//                 >
//                   <FaUndo className="text-sm text-gray-700" />
//                 </button>
//               </div>
//             </div>
//           </div>
//           <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200">
//             <FaCompass className="h-5 w-5 text-gray-700" />
//           </button>
//         </div>
        
//         {/* Zoom In */}
//         <button
//           onClick={handleZoomIn}
//           className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
//           aria-label="Zoom In"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//           </svg>
//         </button>
        
//         {/* Zoom Out */}
//         <button
//           onClick={handleZoomOut}
//           className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
//           aria-label="Zoom Out"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
//           </svg>
//         </button>
        
//         {/* Draw/Cancel Button */}
//         <button
//           onClick={toggleDrawing}
//           className={`w-10 h-10 rounded-lg shadow-md flex flex-col items-center justify-center transition-all border ${
//             isDrawing 
//               ? 'bg-red-500 text-white border-red-500' 
//               : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
//           }`}
//           aria-label={isDrawing ? "Cancel Drawing" : "Draw Polygon"}
//         >
//           {isDrawing ? (
//             <>
//               <FaTimes className="h-4 w-4" />
//               <span className="text-[0.55rem] mt-0.5">Cancel</span>
//             </>
//           ) : (
//             <>
//               <FaDrawPolygon className="h-4 w-4" />
//               <span className="text-[0.55rem] mt-0.5">Draw</span>
//             </>
//           )}
//         </button>
//       </div>
      
//       {/* Change Map Button - Bottom Right */}
//       <div className="absolute bottom-3 right-3" style={{ zIndex: 1000 }}>
//         <button
//           onClick={() => setShowBackgroundOptions(!showBackgroundOptions)}
//           className="w-20 h-20 bg-black bg-opacity-80 text-white text-[0.65rem] rounded-md flex flex-col items-center justify-center hover:bg-opacity-100 transition-all border border-gray-700 shadow-lg"
//         >
//           <div className="w-10 h-10 bg-gray-300 rounded mb-0.5 flex items-center justify-center">
//             <FaMap className="text-gray-700 text-sm" />
//           </div>
//           <span>Change map</span>
//         </button>
        
//         {/* Background Map Options Popup */}
//         {showBackgroundOptions && (
//           <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
//             <div className="p-3 border-b border-gray-200">
//               <h3 className="font-medium text-gray-800">Background map</h3>
//             </div>
//             <div className="py-1">
//               <button
//                 onClick={() => handleBackgroundSelect('Streets and Buildings')}
//                 className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center ${
//                   selectedBackground === 'Streets and Buildings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
//                 }`}
//               >
//                 <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
//                   selectedBackground === 'Streets and Buildings' ? 'border-blue-500' : 'border-gray-300'
//                 }`}>
//                   {selectedBackground === 'Streets and Buildings' && (
//                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                   )}
//                 </div>
//                 Streets and Buildings
//               </button>
//               <button
//                 onClick={() => handleBackgroundSelect('Orthophoto')}
//                 className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center ${
//                   selectedBackground === 'Orthophoto' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
//                 }`}
//               >
//                 <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
//                   selectedBackground === 'Orthophoto' ? 'border-blue-500' : 'border-gray-300'
//                 }`}>
//                   {selectedBackground === 'Orthophoto' && (
//                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                   )}
//                 </div>
//                 Orthophoto
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default MapControls;


import React, { useState } from 'react';
import { FaCompass, FaUndo, FaRedo, FaMap, FaDrawPolygon, FaTimes } from 'react-icons/fa';

const MapControls = ({
  handleZoomIn,
  handleZoomOut,
  handleRotate,
  handleResetRotation,
  onChangeBackground,
  hideControls,
  isDrawing,
  toggleDrawing,
  isAdmin // Add isAdmin prop
}) => {
  const [showControls, setShowControls] = useState(false);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('Streets and Buildings');
  
  const handleBackgroundSelect = (option) => {
    setSelectedBackground(option);
    setShowBackgroundOptions(false);
    if (onChangeBackground) {
      onChangeBackground(option);
    }
  };
  
  if (hideControls) {
    return null;
  }
  
  return (
    <>
      <div className="absolute top-12 right-3 flex flex-col space-y-1" style={{ zIndex: 1000 }}>
        {/* Compass Rotation Controls */}
        <div
          className="relative group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className={`absolute right-full top-1/2 transform -translate-y-1/2 mr-1.5 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col space-y-1.5">
              <div className="text-xs text-gray-700 bg-gray-800 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                Rotate
              </div>
              <div className="flex space-x-1.5">
                <button
                  onClick={handleRotate}
                  className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
                  aria-label="Rotate Clockwise"
                >
                  <FaRedo className="text-sm text-gray-700" />
                </button>
                <button
                  onClick={handleResetRotation}
                  className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
                  aria-label="Reset Rotation"
                >
                  <FaUndo className="text-sm text-gray-700" />
                </button>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200">
            <FaCompass className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
          aria-label="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
          aria-label="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        
        {/* Draw/Cancel Button - Only show for admin users */}
        {isAdmin && (
          <button
            onClick={toggleDrawing}
            className={`w-10 h-10 rounded-lg shadow-md flex flex-col items-center justify-center transition-all border ${
              isDrawing 
                ? 'bg-red-500 text-white border-red-500' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
            }`}
            aria-label={isDrawing ? "Cancel Drawing" : "Draw Polygon"}
          >
            {isDrawing ? (
              <>
                <FaTimes className="h-4 w-4" />
                <span className="text-[0.55rem] mt-0.5">Cancel</span>
              </>
            ) : (
              <>
                <FaDrawPolygon className="h-4 w-4" />
                <span className="text-[0.55rem] mt-0.5">Draw</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Change Map Button - Bottom Right */}
      <div className="absolute bottom-3 right-3" style={{ zIndex: 1000 }}>
        <button
          onClick={() => setShowBackgroundOptions(!showBackgroundOptions)}
          className="w-20 h-20 bg-black bg-opacity-80 text-white text-[0.65rem] rounded-md flex flex-col items-center justify-center hover:bg-opacity-100 transition-all border border-gray-700 shadow-lg"
        >
          <div className="w-10 h-10 bg-gray-300 rounded mb-0.5 flex items-center justify-center">
            <FaMap className="text-gray-700 text-sm" />
          </div>
          <span>Change map</span>
        </button>
        
        {/* Background Map Options Popup */}
        {showBackgroundOptions && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">Background map</h3>
            </div>
            <div className="py-1">
              <button
                onClick={() => handleBackgroundSelect('Streets and Buildings')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center ${
                  selectedBackground === 'Streets and Buildings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                  selectedBackground === 'Streets and Buildings' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {selectedBackground === 'Streets and Buildings' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
                Streets and Buildings
              </button>
              <button
                onClick={() => handleBackgroundSelect('Orthophoto')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center ${
                  selectedBackground === 'Orthophoto' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                  selectedBackground === 'Orthophoto' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {selectedBackground === 'Orthophoto' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
                Orthophoto
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MapControls;