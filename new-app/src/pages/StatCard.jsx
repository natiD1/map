import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// --- STAT CARD COMPONENT (Handles onClick) ---
const StatCard = ({ title, value, icon, color, loading, onClick, actionRequired }) => {
  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-600 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const colorClasses = {
    yellow: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-pink-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-indigo-500',
    gray: 'from-gray-500 to-slate-500',
    orange: 'from-amber-500 to-orange-600'
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all group 
        ${onClick ? 'cursor-pointer hover:border-blue-500/30 hover:bg-gray-800/80' : 'hover:border-gray-600/50'}
        ${actionRequired ? 'ring-1 ring-orange-500/30' : ''}
      `}
    >
      {onClick && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-5 h-5 text-gray-400" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color] || colorClasses.blue} shadow-lg relative`}>
          {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
          {actionRequired && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></span>
          )}
        </div>
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
      
      {/* Mini trend chart placeholder */}
      <div className="mt-4 h-8 bg-gray-700/30 rounded flex items-end justify-center overflow-hidden">
        <div className={`w-full h-full bg-gradient-to-r from-transparent via-${color === 'orange' ? 'orange' : 'blue'}-500/20 to-transparent rounded`}></div>
      </div>
    </motion.div>
  );
};

export default StatCard;