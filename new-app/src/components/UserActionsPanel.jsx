// src/components/UserActionsPanel.js

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHistory, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaInfoCircle } from 'react-icons/fa';

const luxuryAnimations = (isRtl = false) => ({
    fadeIn: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
    },
    staggerContainer: {
        animate: { transition: { staggerChildren: 0.08 } }
    }
});

function formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const now = new Date();
    const secondsPast = (now.getTime() - new Date(timestamp).getTime()) / 1000;
    if (secondsPast < 60) return `${Math.round(secondsPast)}s ago`;
    if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m ago`;
    if (secondsPast <= 86400) return `${Math.round(secondsPast / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
}

const UserActionsPanel = ({ onClose, theme }) => {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const animations = luxuryAnimations();
    const isDark = theme === 'dark';

    const fetchActions = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/locations/my-actions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setActions(data);
            }
        } catch (error) {
            console.error("Failed to fetch user actions:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActions();
    }, [fetchActions]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved':
                return { icon: FaCheckCircle, color: 'text-green-400', label: 'Approved' };
            case 'rejected':
                return { icon: FaTimesCircle, color: 'text-red-400', label: 'Rejected' };
            default:
                return { icon: FaHourglassHalf, color: 'text-yellow-400', label: 'Pending' };
        }
    };

    const getActionType = (action) => {
        switch (action) {
            case 'create': return 'Creation Request';
            case 'update': return 'Update Request';
            case 'delete': return 'Deletion Request';
            default: return 'Request';
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/20 text-white' : 'border-black/10 text-gray-900'}`}>
                <h3 className="text-lg font-semibold flex items-center">
                    <FaHistory className="mr-2" /> My Submissions
                </h3>
                <button
                    className={`p-1 rounded-md transition-all duration-200 ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-black/10'}`}
                    onClick={onClose}
                >
                    <FaTimes />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <p className={`text-center ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Loading submissions...</p>
                ) : actions.length === 0 ? (
                    <p className={`text-center ${isDark ? 'text-white/60' : 'text-gray-500'}`}>You have no pending or recent submissions.</p>
                ) : (
                    <motion.div className="space-y-3" variants={animations.staggerContainer} initial="initial" animate="animate">
                        {actions.map(action => {
                            const statusInfo = getStatusInfo(action.status);
                            const StatusIcon = statusInfo.icon;
                            return (
                                <motion.div key={action.id} variants={animations.fadeIn} className={`p-3 rounded-lg border ${isDark ? 'bg-white/5 border-white/20' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{action.payload.name || `Location ID: ${action.location_id}`}</p>
                                            <p className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>{getActionType(action.action_type)}</p>
                                        </div>
                                        <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color} ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                            <StatusIcon className="mr-1.5" />
                                            {statusInfo.label}
                                        </div>
                                    </div>
                                    <div className={`text-xs mt-2 pt-2 border-t ${isDark ? 'border-white/10 text-white/60' : 'border-black/10 text-gray-500'}`}>
                                        Submitted: {formatTimeAgo(action.created_at)}
                                        {action.processed_at && ` | Processed: ${formatTimeAgo(action.processed_at)}`}
                                    </div>
                                    {action.status === 'rejected' && action.rejection_reason && (
                                        <div className={`mt-2 p-2 rounded-md text-sm flex items-start ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
                                            <FaInfoCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-semibold">Reason:</span> {action.rejection_reason}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default UserActionsPanel;