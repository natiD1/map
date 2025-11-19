import React from 'react';

const BlockInfoPanel = ({ 
  selectedBlock, 
  loadingBlock, 
  blockError, 
  onClose 
}) => {
  return (
    <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-xl z-50 border border-gray-200 max-w-xs animate-fadeIn">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800 text-lg">Block Information</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {loadingBlock ? (
        <div className="text-sm text-gray-500 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading block information...
        </div>
      ) : blockError ? (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
          {blockError}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm font-medium text-gray-600">Gush Number:</span>
            <span className="text-sm font-semibold">{selectedBlock.gush_num}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Suffix:</span>
            <span className="text-sm font-semibold">{selectedBlock.gush_suffix}</span>
          </div>
          {selectedBlock.objectId && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Object ID:</span>
              <span className="text-sm font-semibold">{selectedBlock.objectId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockInfoPanel;