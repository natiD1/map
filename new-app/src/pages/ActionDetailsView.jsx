// Create a new component, e.g., ActionDetailsView.js

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, UserPlus, MapPin } from 'lucide-react';

const ActionDetailsView = ({ title, data, isLoading, onClose }) => {
  const getIconForType = (type) => {
    if (type.toLowerCase().includes('user')) {
      return <UserPlus className="w-6 h-6 text-blue-400" />;
    }
    if (type.toLowerCase().includes('location')) {
      return <MapPin className="w-6 h-6 text-green-400" />;
    }
    return <CheckCircle className="w-6 h-6 text-gray-400" />;
  };

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50 flex items-center">
        <button
          onClick={onClose}
          className="mr-4 p-2 hover:bg-gray-700 rounded-lg transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {!isLoading && <p className="text-sm text-gray-400">{data?.length || 0} items found</p>}
        </div>
      </div>

      {/* List */}
      <div className="p-6 h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading details...</div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No items to display for this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-900/30 border border-gray-700/30 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gray-700/50 mr-4">
                      {getIconForType(item.type)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested by {item.requester} on {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.type}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActionDetailsView;