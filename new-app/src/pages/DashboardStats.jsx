import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserCheck, UserX, Lock, LogIn, Activity, Shield,
    CheckCircle, XCircle, AlertCircle, ClipboardList,
    ArrowLeft, MapPin, UserPlus, FileText, Sun, Moon
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';


// --- Reusable Sidebar Item Component ---
const StatSidebarItem = ({ title, value, icon, color, loading, onClick, isActive, actionRequired }) => {
    // Theme-aware color palette
    const colorClasses = {
        blue: { text: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10', ring: 'ring-blue-500/30' },
        green: { text: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10', ring: 'ring-emerald-500/30' },
        red: { text: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10', ring: 'ring-red-500/30' },
        teal: { text: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-500/10', ring: 'ring-teal-500/30' },
        gray: { text: 'text-slate-500 dark:text-gray-400', bg: 'bg-slate-200 dark:bg-gray-500/10', ring: 'ring-gray-500/30' },
        orange: { text: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/10', ring: 'ring-amber-500/30' },
    };
    const activeClass = isActive ? `bg-blue-100 dark:bg-blue-500/10 ring-1 ${colorClasses.blue.ring}` : 'hover:bg-slate-100 dark:hover:bg-slate-700/50';
    const currentTheme = colorClasses[color] || colorClasses.blue;

    return (
        <motion.div
            layout
            onClick={onClick}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${activeClass}`}
        >
            <div className="flex items-center">
                <div className={`relative p-2 rounded-lg mr-3 ${currentTheme.bg}`}>
                    {React.cloneElement(icon, { className: `w-5 h-5 ${currentTheme.text}` })}
                    {actionRequired && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white dark:border-slate-800"></span>
                        </span>
                    )}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</span>
            </div>
            {loading ? (
                <div className="h-5 w-10 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
            ) : (
                <span className={`text-xl font-bold ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>{value}</span>
            )}
        </motion.div>
    );
};

// --- Reusable Detail View Component ---
const DetailsView = ({ title, data, isLoading, onClose }) => {
    const getIconForType = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('user')) return <UserPlus className="w-6 h-6 text-blue-400" />;
        if (lowerType.includes('location')) return <MapPin className="w-6 h-6 text-emerald-400" />;
        if (lowerType.includes('login')) return <LogIn className="w-6 h-6 text-teal-400" />;
        if (lowerType.includes('admin')) return <Shield className="w-6 h-6 text-amber-400" />;
        return <FileText className="w-6 h-6 text-gray-400" />;
    };

    return (
        <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl h-full flex flex-col"
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center">
                <button onClick={onClose} className="mr-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group">
                    <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
                    {!isLoading && <p className="text-sm text-slate-500 dark:text-gray-400">{data?.length || 0} items found</p>}
                </div>
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
                {isLoading ? (
                     <div className="space-y-3 p-2">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className="flex items-center space-x-4 animate-pulse">
                               <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                               <div className="flex-1 space-y-2 py-1">
                                   <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                   <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                               </div>
                           </div>
                        ))}
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 dark:text-gray-500 flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">All Clear!</p>
                        <p>No items to display for this category.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/40 rounded-lg"
                            >
                                <div className="flex items-center overflow-hidden">
                                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 mr-4">{getIconForType(item.type)}</div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-slate-800 dark:text-white font-medium truncate" title={item.title}>{item.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-gray-400 truncate" title={item.description}>{item.description}</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                                            By {item.requester} on {new Date(item.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs ml-2 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 whitespace-nowrap">
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

// --- Chart Component for Summary View ---
// --- Chart Component for Summary View ---
// --- Chart Component for Summary View ---
const SummaryChart = ({ stats, loading, theme }) => {
    const chartData = [
        { name: 'Approvals', value: stats?.users?.approvedToday || 0, fill: '#34D399' },
        { name: 'Rejections', value: stats?.users?.rejectedToday || 0, fill: '#F87171' },
        { name: 'Admin Actions', value: stats?.activity?.adminActionsToday || 0, fill: '#60A5FA' },
        { name: 'Active Users', value: stats?.activity?.activeToday || 0, fill: '#2DD4BF' },
    ];

    const axisColor = theme === 'dark' ? '#A0AEC0' : '#4B5563';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipStyle = {
        backgroundColor: theme === 'dark' ? '#1A202C' : '#FFFFFF',
        borderColor: theme === 'dark' ? '#4A5568' : '#E5E7EB',
        borderRadius: '0.5rem'
    };
    const tooltipLabelStyle = { color: theme === 'dark' ? '#E2E8F0' : '#1F2937' };


    if (loading) {
        return <div className="w-full h-[300px] bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>;
    }

    // FINAL FIX APPLIED HERE:
    // This wrapper div provides a completely stable rendering area for the chart.
    // - h-[300px]: Guarantees a non-zero height.
    // - min-w-0: Prevents the parent flex container from collapsing the chart's width to zero during animation, which is a common cause of the width(-1) error.
    return (
        <div className="w-full h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke={axisColor} fontSize={12} />
                    <YAxis stroke={axisColor} fontSize={12} />
                    <Tooltip
                        cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                        contentStyle={tooltipStyle}
                        labelStyle={tooltipLabelStyle}
                    />
                    <Bar dataKey="value" barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


// --- Default Summary View Component ---
const DashboardSummary = ({ stats, loading, theme }) => (
    <motion.div
        key="summary"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 h-full flex flex-col"
    >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Today's Activity Chart</h2>
        <div className="mb-8 h-[300px]">
            <SummaryChart stats={stats} loading={loading} theme={theme} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {loading ? (
                <>
                    <div className="h-24 bg-slate-200 dark:bg-slate-700/60 rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-slate-200 dark:bg-slate-700/60 rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-slate-200 dark:bg-slate-700/60 rounded-lg animate-pulse"></div>
                </>
             ) : (
                <>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg flex items-center border border-slate-200 dark:border-slate-700/50">
                        <CheckCircle className="w-7 h-7 text-emerald-500 dark:text-emerald-400 mr-4" />
                        <div>
                            <span className="text-slate-600 dark:text-gray-400 text-sm">Users Approved</span>
                            <p className="font-semibold text-slate-800 dark:text-white text-2xl">{stats?.users?.approvedToday || 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg flex items-center border border-slate-200 dark:border-slate-700/50">
                        <XCircle className="w-7 h-7 text-red-500 dark:text-red-400 mr-4" />
                        <div>
                           <span className="text-slate-600 dark:text-gray-400 text-sm">Users Rejected</span>
                           <p className="font-semibold text-slate-800 dark:text-white text-2xl">{stats?.users?.rejectedToday || 0}</p>
                        </div>
                    </div>
                     <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg flex items-center border border-slate-200 dark:border-slate-700/50">
                        <Shield className="w-7 h-7 text-blue-500 dark:text-blue-400 mr-4" />
                        <div>
                            <span className="text-slate-600 dark:text-gray-400 text-sm">Admin Actions</span>
                            <p className="font-semibold text-slate-800 dark:text-white text-2xl">{stats?.activity?.adminActionsToday || 0}</p>
                        </div>
                    </div>
                </>
             )}
        </div>
         <div className="mt-auto pt-6 text-center text-slate-500 dark:text-gray-500">
            <p>Select an item from the left to view details.</p>
        </div>
    </motion.div>
);


// --- MAIN DASHBOARD COMPONENT ---
const ModernDashboard = () => {
    // --- THEME LOGIC ---
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // --- Original Component State ---
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailTitle, setDetailTitle] = useState('');

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    // FIX: Restored the data fetching logic
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Replace with your actual API endpoint
                const response = await fetch('/api/admin/stats', { headers: getAuthHeader() });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError('Failed to fetch dashboard statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // FIX: Restored the card click data fetching logic
 // src/pages/DashboardStats.jsx (or ModernDashboard.jsx)
// Replace the entire function with this one.

const handleCardClick = async (viewType, endpoint, title) => {
    // If the view is already active, close it.
    if (activeView === viewType) {
        setActiveView(null);
        return;
    }
    
    // Set up the UI for loading the new view
    setActiveView(viewType);
    setDetailTitle(title);
    setIsDetailLoading(true);
    setDetailData(null); // Clear previous data

    try {
        const response = await fetch(endpoint, { headers: getAuthHeader() });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        let formattedData = [];

        // --- EXPLANATION ---
        // Different API endpoints return data in slightly different formats.
        // This logic correctly handles each specific format.

        if (viewType.includes('user')) {
            // The /users endpoint returns data inside a `users` object property.
            formattedData = data.users.map(user => ({ 
                id: user.id, 
                type: `User (${user.status || 'N/A'})`, 
                title: user.full_name || user.email, 
                description: `Role: ${user.role || 'user'}`, 
                date: user.created_at, 
                requester: 'System' 
            }));
        } else if (viewType.includes('login')) {
            // The /logins endpoint returns data inside a `logins` object property.
            formattedData = data.logins.map(login => ({ 
                id: login.id, 
                type: `Login (${login.success ? 'Success' : 'Failed'})`, 
                title: login.full_name || login.email, 
                description: `IP: ${login.ip_address}`, 
                date: login.attempted_at, 
                requester: 'User' 
            }));
        } else if (viewType.includes('admin-actions')) {
            // The /recent-activities endpoint returns data inside an `activities` object property.
            formattedData = data.activities.map(act => ({ 
                id: act.id, 
                type: `Admin Action`, 
                title: act.description, 
                description: `Type: ${act.action_type}`, 
                date: act.created_at, 
                requester: act.admin_name || 'System' 
            }));

        // --- THIS IS THE CORRECTED PART ---
        } else if (viewType === 'pending-actions') {
            // The /all-pending-actions endpoint returns a direct array that is already
            // perfectly formatted by the backend. No extra mapping is needed.
            formattedData = data;
        }
        // --- END OF CORRECTION ---
        
        setDetailData(formattedData);

    } catch (err) {
        console.error(`Error fetching details for ${viewType}:`, err);
        setDetailData([]); // Set to empty array on error to show the "All Clear!" message
    } finally {
        setIsDetailLoading(false);
    }
};


    if (error) {
        return (
            <div className="bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-xl p-6 flex items-center">
                <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400 mr-4" />
                <div>
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Data</h3>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    const pendingActionsCount = stats?.summary?.totalPendingActions || 0;
    const menuItems = [
        { group: 'User Management', items: [
            { id: 'total-users', title: "Total Users", value: stats?.users?.total ?? '...', icon: <Users />, color: 'blue', endpoint: '/api/admin/users', detailsTitle: 'All Users' },
            { id: 'approved-users', title: "Approved Users", value: stats?.users?.totalApproved ?? '...', icon: <UserCheck />, color: 'green', endpoint: '/api/admin/users?status=approved', detailsTitle: 'Approved Users' },
            { id: 'rejected-users', title: "Rejected Users", value: stats?.users?.totalRejected ?? '...', icon: <UserX />, color: 'red', endpoint: '/api/admin/users?status=rejected', detailsTitle: 'Rejected Users' },
            { id: 'locked-users', title: "Locked Accounts", value: stats?.users?.totalLocked ?? '...', icon: <Lock />, color: 'gray', endpoint: '/api/admin/users?is_locked=true', detailsTitle: 'Locked Accounts' },
        ]},
        { group: 'Activity & Actions', items: [
             { id: 'pending-actions', title: "Pending Actions", value: pendingActionsCount, icon: <ClipboardList />, color: 'orange', actionRequired: pendingActionsCount > 0, endpoint: '/api/admin/all-pending-actions', detailsTitle: 'All Pending Actions' },
            { id: 'total-logins', title: "Total Logins", value: stats?.activity?.totalLogins ?? '...', icon: <LogIn />, color: 'blue', endpoint: '/api/admin/logins', detailsTitle: 'Recent Login Attempts' },
            { id: 'login-active-today', title: "Active Today", value: stats?.activity?.activeToday ?? '...', icon: <Activity />, color: 'teal', endpoint: '/api/admin/logins?date_range=today', detailsTitle: 'Users Active Today' },
            { id: 'admin-actions', title: "Admin Actions", value: stats?.activity?.adminActionsToday ?? '...', icon: <Shield />, color: 'blue', endpoint: '/api/admin/recent-activities?date_range=today', detailsTitle: 'Admin Actions Today' },
        ]}
    ];

    return (
        <div className="relative p-4 sm:p-6 bg-slate-100 dark:bg-slate-900 min-h-screen">
            <div className="relative flex flex-col md:flex-row gap-6 h-[700px] max-h-[90vh]">
                <div className="absolute top-0 right-0 z-10">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {/* {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} */}
                    </button>
                </div>
                <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
                     <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 h-full overflow-y-auto">
                        {menuItems.map(group => (
                            <div key={group.group} className="mb-4">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 px-3 pb-2">{group.group}</h3>
                                 <div className="space-y-1">
                                    {group.items.map(item => (
                                        <StatSidebarItem
                                            key={item.id}
                                            title={item.title}
                                            value={item.value}
                                            icon={item.icon}
                                            color={item.color}
                                            loading={loading}
                                            onClick={() => handleCardClick(item.id, item.endpoint, item.detailsTitle)}
                                            isActive={activeView === item.id}
                                            actionRequired={item.actionRequired}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
                <div className="flex-grow min-w-0">
                    <AnimatePresence mode="wait">
                        {activeView ? (
                            <DetailsView
                                key={activeView}
                                title={detailTitle}
                                data={detailData}
                                isLoading={isDetailLoading}
                                onClose={() => setActiveView(null)}
                            />
                        ) : (
                            <DashboardSummary stats={stats} loading={loading} theme={theme} />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ModernDashboard;






// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//     Users, UserCheck, UserX, Lock, LogIn, Activity, Shield,
//     CheckCircle, XCircle, AlertCircle, ClipboardList,
//     ArrowLeft, MapPin, UserPlus, FileText, Sun, Moon, RefreshCw
// } from 'lucide-react';
// import {
//     BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from 'recharts';


// // --- Reusable Sidebar Item Component ---
// const StatSidebarItem = ({ title, value, icon, color, loading, onClick, isActive, actionRequired }) => {
//     // Theme-aware color palette
//     const colorClasses = {
//         blue: { text: 'text-blue-400', bg: 'bg-blue-900/20', ring: 'ring-blue-500/30' },
//         green: { text: 'text-emerald-400', bg: 'bg-emerald-900/20', ring: 'ring-emerald-500/30' },
//         red: { text: 'text-red-400', bg: 'bg-red-900/20', ring: 'ring-red-500/30' },
//         teal: { text: 'text-teal-400', bg: 'bg-teal-900/20', ring: 'ring-teal-500/30' },
//         gray: { text: 'text-gray-400', bg: 'bg-gray-700/20', ring: 'ring-gray-500/30' },
//         orange: { text: 'text-amber-500', bg: 'bg-amber-900/20', ring: 'ring-amber-500/30' },
//     };
//     const activeClass = isActive ? `bg-blue-900/30 ring-1 ${colorClasses.blue.ring}` : 'hover:bg-slate-500/10';
//     const currentTheme = colorClasses[color] || colorClasses.blue;

//     return (
//         <motion.div
//             layout
//             onClick={onClick}
//             className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${activeClass}`}
//         >
//             <div className="flex items-center">
//                 <div className={`relative p-2 rounded-lg mr-3 ${currentTheme.bg}`}>
//                     {React.cloneElement(icon, { className: `w-5 h-5 ${currentTheme.text}` })}
//                     {actionRequired && (
//                         <span className="absolute -top-1 -right-1 flex h-3 w-3">
//                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
//                           <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white dark:border-slate-800"></span>
//                         </span>
//                     )}
//                 </div>
//                 <span className="text-sm font-medium text-slate-200">{title}</span>
//             </div>
//             {loading ? (
//                 <div className="h-5 w-10 bg-slate-700 rounded animate-pulse"></div>
//             ) : (
//                 <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{value}</span>
//             )}
//         </motion.div>
//     );
// };

// // --- Reusable Detail View Component ---
// const DetailsView = ({ title, data, isLoading, onClose }) => {
//     const getIconForType = (type) => {
//         const lowerType = type.toLowerCase();
//         if (lowerType.includes('user')) return <UserPlus className="w-6 h-6 text-blue-400" />;
//         if (lowerType.includes('location')) return <MapPin className="w-6 h-6 text-emerald-400" />;
//         if (lowerType.includes('login')) return <LogIn className="w-6 h-6 text-teal-400" />;
//         if (lowerType.includes('admin')) return <Shield className="w-6 h-6 text-amber-400" />;
//         return <FileText className="w-6 h-6 text-gray-400" />;
//     };

//     return (
//         <motion.div
//             key="details"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl h-full flex flex-col shadow-2xl"
//         >
//             <div className="p-4 border-b border-white/20 flex items-center">
//                 <button onClick={onClose} className="mr-4 p-2 hover:bg-white/10 rounded-lg transition-colors group">
//                     <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
//                 </button>
//                 <div>
//                     <h2 className="text-lg font-semibold text-white">{title}</h2>
//                     {!isLoading && <p className="text-sm text-gray-400">{data?.length || 0} items found</p>}
//                 </div>
//             </div>
//             <div className="p-4 flex-grow overflow-y-auto">
//                 {isLoading ? (
//                      <div className="space-y-3 p-2">
//                         {[...Array(5)].map((_, i) => (
//                            <div key={i} className="flex items-center space-x-4 animate-pulse">
//                                <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
//                                <div className="flex-1 space-y-2 py-1">
//                                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
//                                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
//                                </div>
//                            </div>
//                         ))}
//                     </div>
//                 ) : !data || data.length === 0 ? (
//                     <div className="text-center py-16 text-gray-500 flex flex-col items-center">
//                         <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
//                         <p className="text-lg">All Clear!</p>
//                         <p>No items to display for this category.</p>
//                     </div>
//                 ) : (
//                     <div className="space-y-3">
//                         {data.map((item) => (
//                             <motion.div
//                                 key={item.id}
//                                 initial={{ opacity: 0, y: 10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-lg"
//                             >
//                                 <div className="flex items-center overflow-hidden">
//                                     <div className="p-3 rounded-lg bg-slate-700/50 mr-4">{getIconForType(item.type)}</div>
//                                     <div className="overflow-hidden">
//                                         <h4 className="text-white font-medium truncate" title={item.title}>{item.title}</h4>
//                                         <p className="text-sm text-gray-400 truncate" title={item.description}>{item.description}</p>
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             By {item.requester} on {new Date(item.date).toLocaleDateString()}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <span className="text-xs ml-2 px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/20 whitespace-nowrap">
//                                     {item.type}
//                                 </span>
//                             </motion.div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </motion.div>
//     );
// };

// // --- Chart Component for Summary View ---
// const SummaryChart = ({ stats, loading, theme }) => {
//     const chartData = [
//         { name: 'Approvals', value: stats?.users?.approvedToday || 0, fill: '#34D399' },
//         { name: 'Rejections', value: stats?.users?.rejectedToday || 0, fill: '#F87171' },
//         { name: 'Admin Actions', value: stats?.activity?.adminActionsToday || 0, fill: '#60A5FA' },
//         { name: 'Active Users', value: stats?.activity?.activeToday || 0, fill: '#2DD4BF' },
//     ];

//     const axisColor = '#A0AEC0'; // For dark theme
//     const gridColor = 'rgba(255, 255, 255, 0.1)'; // For dark theme
//     const tooltipStyle = {
//         backgroundColor: '#1A202C',
//         borderColor: '#4A5568',
//         borderRadius: '0.5rem'
//     };
//     const tooltipLabelStyle = { color: '#E2E8F0' };


//     if (loading) {
//         return <div className="w-full h-[300px] bg-slate-700/50 rounded-lg animate-pulse"></div>;
//     }

//     return (
//         <div className="w-full h-[300px] min-w-0">
//             <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                     <XAxis dataKey="name" stroke={axisColor} fontSize={12} />
//                     <YAxis stroke={axisColor} fontSize={12} />
//                     <Tooltip
//                         cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
//                         contentStyle={tooltipStyle}
//                         labelStyle={tooltipLabelStyle}
//                     />
//                     <Bar dataKey="value" barSize={40} />
//                 </BarChart>
//             </ResponsiveContainer>
//         </div>
//     );
// };


// // --- Default Summary View Component ---
// const DashboardSummary = ({ stats, loading, theme }) => (
//     <motion.div
//         key="summary"
//         initial={{ opacity: 0, x: 20 }}
//         animate={{ opacity: 1, x: 0 }}
//         exit={{ opacity: 0, x: -20 }}
//         className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6 h-full flex flex-col shadow-2xl"
//     >
//         <h2 className="text-xl font-semibold text-white mb-4">Today's Activity Chart</h2>
//         <div className="mb-8 h-[300px]">
//             <SummaryChart stats={stats} loading={loading} theme={theme} />
//         </div>
//         <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//              {loading ? (
//                 <>
//                     <div className="h-24 bg-slate-700/60 rounded-lg animate-pulse"></div>
//                     <div className="h-24 bg-slate-700/60 rounded-lg animate-pulse"></div>
//                     <div className="h-24 bg-slate-700/60 rounded-lg animate-pulse"></div>
//                 </>
//              ) : (
//                 <>
//                     <div className="bg-black/20 p-4 rounded-lg flex items-center border border-white/10">
//                         <CheckCircle className="w-7 h-7 text-emerald-400 mr-4" />
//                         <div>
//                             <span className="text-gray-400 text-sm">Users Approved</span>
//                             <p className="font-semibold text-white text-2xl">{stats?.users?.approvedToday || 0}</p>
//                         </div>
//                     </div>
//                     <div className="bg-black/20 p-4 rounded-lg flex items-center border border-white/10">
//                         <XCircle className="w-7 h-7 text-red-400 mr-4" />
//                         <div>
//                            <span className="text-gray-400 text-sm">Users Rejected</span>
//                            <p className="font-semibold text-white text-2xl">{stats?.users?.rejectedToday || 0}</p>
//                         </div>
//                     </div>
//                      <div className="bg-black/20 p-4 rounded-lg flex items-center border border-white/10">
//                         <Shield className="w-7 h-7 text-blue-400 mr-4" />
//                         <div>
//                             <span className="text-gray-400 text-sm">Admin Actions</span>
//                             <p className="font-semibold text-white text-2xl">{stats?.activity?.adminActionsToday || 0}</p>
//                         </div>
//                     </div>
//                 </>
//              )}
//         </div>
//          <div className="mt-auto pt-6 text-center text-gray-500">
//             <p>Select an item from the left to view details.</p>
//         </div>
//     </motion.div>
// );


// // --- MAIN DASHBOARD COMPONENT ---
// const ModernDashboard = () => {
//     // --- THEME LOGIC ---
//     const [theme, setTheme] = useState('dark');

//     useEffect(() => {
//         document.documentElement.classList.add('dark');
//         return () => {
//             document.documentElement.classList.remove('dark');
//         }
//     }, []);

//     // --- Original Component State ---
//     const [stats, setStats] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [activeView, setActiveView] = useState(null);
//     const [detailData, setDetailData] = useState(null);
//     const [isDetailLoading, setIsDetailLoading] = useState(false);
//     const [detailTitle, setDetailTitle] = useState('');
//     const [refreshKey, setRefreshKey] = useState(0); // State to trigger refresh

//     const getAuthHeader = () => {
//         const token = localStorage.getItem('token');
//         return token ? { 'Authorization': `Bearer ${token}` } : {};
//     };

//     // Fetch stats whenever refreshKey changes
//     useEffect(() => {
//         const fetchStats = async () => {
//             try {
//                 setLoading(true);
//                 const response = await fetch('/api/admin/stats', { headers: getAuthHeader() });
//                 if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//                 const data = await response.json();
//                 setStats(data);
//             } catch (err) {
//                 setError('Failed to fetch dashboard statistics.');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchStats();
//     }, [refreshKey]);

//     const handleCardClick = async (viewType, endpoint, title) => {
//         if (activeView === viewType) {
//             setActiveView(null);
//             return;
//         }
        
//         setActiveView(viewType);
//         setDetailTitle(title);
//         setIsDetailLoading(true);
//         setDetailData(null);

//         try {
//             const response = await fetch(endpoint, { headers: getAuthHeader() });
//             if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
//             const data = await response.json();
//             let formattedData = [];

//             if (viewType.includes('user')) {
//                 formattedData = data.users.map(user => ({ 
//                     id: user.id, 
//                     type: `User (${user.status || 'N/A'})`, 
//                     title: user.full_name || user.email, 
//                     description: `Role: ${user.role || 'user'}`, 
//                     date: user.created_at, 
//                     requester: 'System' 
//                 }));
//             } else if (viewType.includes('login')) {
//                 formattedData = data.logins.map(login => ({ 
//                     id: login.id, 
//                     type: `Login (${login.success ? 'Success' : 'Failed'})`, 
//                     title: login.full_name || login.email, 
//                     description: `IP: ${login.ip_address}`, 
//                     date: login.attempted_at, 
//                     requester: 'User' 
//                 }));
//             } else if (viewType.includes('admin-actions')) {
//                 formattedData = data.activities.map(act => ({ 
//                     id: act.id, 
//                     type: `Admin Action`, 
//                     title: act.description, 
//                     description: `Type: ${act.action_type}`, 
//                     date: act.created_at, 
//                     requester: act.admin_name || 'System' 
//                 }));
//             } else if (viewType === 'pending-actions') {
//                 formattedData = data;
//             }
            
//             setDetailData(formattedData);

//         } catch (err) {
//             console.error(`Error fetching details for ${viewType}:`, err);
//             setDetailData([]);
//         } finally {
//             setIsDetailLoading(false);
//         }
//     };


//     if (error) {
//         return (
//             <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 flex items-center">
//                 <AlertCircle className="w-8 h-8 text-red-400 mr-4" />
//                 <div>
//                     <h3 className="text-lg font-medium text-red-300">Error Loading Data</h3>
//                     <p className="text-red-400">{error}</p>
//                 </div>
//             </div>
//         );
//     }

//     const pendingActionsCount = stats?.summary?.totalPendingActions || 0;
//     const menuItems = [
//         { group: 'User Management', items: [
//             { id: 'total-users', title: "Total Users", value: stats?.users?.total ?? '...', icon: <Users />, color: 'blue', endpoint: '/api/admin/users', detailsTitle: 'All Users' },
//             { id: 'approved-users', title: "Approved Users", value: stats?.users?.totalApproved ?? '...', icon: <UserCheck />, color: 'green', endpoint: '/api/admin/users?status=approved', detailsTitle: 'Approved Users' },
//             { id: 'rejected-users', title: "Rejected Users", value: stats?.users?.totalRejected ?? '...', icon: <UserX />, color: 'red', endpoint: '/api/admin/users?status=rejected', detailsTitle: 'Rejected Users' },
//             { id: 'locked-users', title: "Locked Accounts", value: stats?.users?.totalLocked ?? '...', icon: <Lock />, color: 'gray', endpoint: '/api/admin/users?is_locked=true', detailsTitle: 'Locked Accounts' },
//         ]},
//         { group: 'Activity & Actions', items: [
//              { id: 'pending-actions', title: "Pending Actions", value: pendingActionsCount, icon: <ClipboardList />, color: 'orange', actionRequired: pendingActionsCount > 0, endpoint: '/api/admin/all-pending-actions', detailsTitle: 'All Pending Actions' },
//             { id: 'total-logins', title: "Total Logins", value: stats?.activity?.totalLogins ?? '...', icon: <LogIn />, color: 'blue', endpoint: '/api/admin/logins', detailsTitle: 'Recent Login Attempts' },
//             { id: 'login-active-today', title: "Active Today", value: stats?.activity?.activeToday ?? '...', icon: <Activity />, color: 'teal', endpoint: '/api/admin/logins?date_range=today', detailsTitle: 'Users Active Today' },
//             { id: 'admin-actions', title: "Admin Actions", value: stats?.activity?.adminActionsToday ?? '...', icon: <Shield />, color: 'blue', endpoint: '/api/admin/recent-activities?date_range=today', detailsTitle: 'Admin Actions Today' },
//         ]}
//     ];

//     return (
//         <div className="relative min-h-screen text-white">
//             <video 
//                 autoPlay 
//                 loop 
//                 muted 
//                 playsInline 
//                 className="absolute inset-0 object-cover w-full h-full z-0 filter blur-md" 
//                 src="https://videos.pexels.com/video-files/6607871/6607871-uhd_2560_1440_30fps.mp4" 
//             />
//             <div className="absolute inset-0 bg-black/40 z-0" />

//             <div className="relative z-10 p-4 sm:p-6">
//                 <div className="relative flex flex-col md:flex-row gap-6 h-[700px] max-h-[90vh]">
//                     <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
//                          <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-4 h-full overflow-y-auto shadow-2xl">
//                             {menuItems.map(group => (
//                                 <div key={group.group} className="mb-4">
//                                     <h3 className="text-sm font-semibold text-gray-400 px-3 pb-2">{group.group}</h3>
//                                      <div className="space-y-1">
//                                         {group.items.map(item => (
//                                             <StatSidebarItem
//                                                 key={item.id}
//                                                 title={item.title}
//                                                 value={item.value}
//                                                 icon={item.icon}
//                                                 color={item.color}
//                                                 loading={loading}
//                                                 onClick={() => handleCardClick(item.id, item.endpoint, item.detailsTitle)}
//                                                 isActive={activeView === item.id}
//                                                 actionRequired={item.actionRequired}
//                                             />
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))}
//                          </div>
//                     </div>
//                     <div className="flex-grow min-w-0">
//                         <AnimatePresence mode="wait">
//                             {activeView ? (
//                                 <DetailsView
//                                     key={activeView}
//                                     title={detailTitle}
//                                     data={detailData}
//                                     isLoading={isDetailLoading}
//                                     onClose={() => setActiveView(null)}
//                                 />
//                             ) : (
//                                 <DashboardSummary stats={stats} loading={loading} theme={theme} />
//                             )}
//                         </AnimatePresence>
//                     </div>
//                 </div>

//                 {/* Refresh Button - ADDED and styled */}
//                 <div className="flex justify-center mt-6">
//                      <button 
//                         onClick={() => setRefreshKey(k => k + 1)} 
//                         className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-lg text-slate-300 rounded-lg border border-white/20 hover:bg-white/30 transition-colors"
//                     >
//                         <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                         <span>Refresh Data</span>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModernDashboard;