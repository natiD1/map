
import React, { useState, useEffect } from 'react';
import { FaInfoCircle, FaAdjust, FaFilter, FaTrashAlt, FaTimes, FaArrowLeft } from 'react-icons/fa';

const LayerOptionsMenu = ({ 
  layerId, 
  layerName, 
  onClose, 
  onBack,
  initialOpacity = 1,
  onOpacityChange,
  isLocalMap = false
}) => {
  const [opacity, setOpacity] = useState(initialOpacity);
  
  // Update opacity when initialOpacity changes
  useEffect(() => {
    setOpacity(initialOpacity);
  }, [initialOpacity]);

  const handleOpacityChange = (e) => {
    const value = parseFloat(e.target.value);
    setOpacity(value);
    if (onOpacityChange) {
      onOpacityChange(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex pt-14 z-50">
      <div className="bg-white rounded-lg shadow-xl w-80 max-w-sm flex flex-col">
        {/* Header with back button, layer name and close button */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <h3 className="text-base font-semibold text-gray-800 flex-grow text-center">{layerName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
        
        {/* Options List */}
        <ul className="py-2">
          <li className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
            <FaInfoCircle className="text-gray-500 mr-3" />
            <span className="text-sm text-gray-700">About Layer</span>
          </li>
          
          {/* Layer Opacity with Slider - Show for all layers */}
          <li className="flex flex-col px-4 py-2 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FaAdjust className="text-gray-500 mr-3" />
                <span className="text-sm text-gray-700">Layer Opacity</span>
              </div>
              <span className="text-sm text-gray-500">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={handleOpacityChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </li>
          
          <li className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
            <FaFilter className="text-gray-500 mr-3" />
            <span className="text-sm text-gray-700">Layer Filter</span>
          </li>
          <li className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer">
            <FaTrashAlt className="mr-3" />
            <span className="text-sm">Remove Layer</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LayerOptionsMenu;


