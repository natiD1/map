// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ClipboardList, Globe, RefreshCw } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';

// // Import the new components you will create
// import LocationApprovals from './LocationApprovals';
// import LocationExplorer from './LocationExplorer';

// const SupervisorDashboard = () => {
//   const [activeTab, setActiveTab] = useState('approvals');
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/'); // Redirect to main page after logout
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'approvals':
//         return <LocationApprovals />;
//       case 'explorer':
//         return <LocationExplorer />;
//       default:
//         return <LocationApprovals />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
//       {/* Header */}
//       <header className="fixed top-0 left-0 w-full bg-transparent px-4 sm:px-6 py-3 z-30">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <Link to="/" className="text-white text-xl md:text-2xl font-bold tracking-wider hover:opacity-80 transition-opacity">
//             BSD
//           </Link>
//           {user && (
//             <button
//               onClick={handleLogout}
//               className="px-4 py-1 md:px-6 md:py-2 font-semibold text-white text-sm md:text-base bg-white/10 backdrop-blur-lg border border-white/20 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-white/20 hover:shadow-xl hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
//             >
//               Logout
//             </button>
//           )}
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="pt-16 md:pt-24">
//         <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 md:py-6">
//           <div className="text-center mb-6 md:mb-8">
//             <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
//               Supervisor Dashboard
//             </h1>
//             <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
//               Welcome, {user?.fullName || 'Supervisor'}. Manage location requests and explore the system.
//             </p>
//           </div>

//           {/* Navigation Tabs */}
//           <div className="border-b border-gray-700/50 mb-4 md:mb-6 overflow-x-auto">
//             <nav className="-mb-px flex space-x-4 md:space-x-8">
//               <TabButton
//                 active={activeTab === 'approvals'}
//                 onClick={() => setActiveTab('approvals')}
//                 icon={<ClipboardList className="w-4 h-4 md:w-5 md:h-5" />}
//                 label="Pending Approvals"
//               />
//               <TabButton
//                 active={activeTab === 'explorer'}
//                 onClick={() => setActiveTab('explorer')}
//                 icon={<Globe className="w-4 h-4 md:w-5 md:h-5" />}
//                 label="Explore Locations"
//               />
//             </nav>
//           </div>

//           {/* Tab Content */}
//           <main>
//             {renderTabContent()}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TabButton = ({ active, onClick, icon, label }) => (
//   <button
//     onClick={onClick}
//     className={`py-3 px-1 border-b-2 font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all whitespace-nowrap ${
//       active
//         ? 'border-cyan-500 text-cyan-400'
//         : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
//     }`}
//   >
//     {icon}
//     {label}
//   </button>
// );

// export default SupervisorDashboard;


// src/pages/Supervisor/SupervisorDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Globe, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import LocationApprovals from './LocationApprovals';
import LocationExplorer from './LocationExplorer';

const SupervisorDashboard = () => {
    // --- THEME LOGIC ---
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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

    // --- ORIGINAL STATE AND LOGIC ---
    const [activeTab, setActiveTab] = useState('approvals');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'approvals':
                return <LocationApprovals />;
            case 'explorer':
                return <LocationExplorer />;
            default:
                return <LocationApprovals />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors duration-300">
            <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/60 px-4 sm:px-6 py-3 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold text-slate-900 dark:text-slate-100 hover:opacity-80 transition-opacity">
                        BSD Supervisor
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Toggle theme">
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1.5 font-medium text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="pt-20 md:pt-24">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 md:py-6">
                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                            Supervisor Dashboard
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 md:mt-2 text-sm">
                            Welcome, {user?.fullName || 'Supervisor'}. Manage location requests.
                        </p>
                    </div>

                    <div className="border-b border-slate-200 dark:border-slate-700 mb-4 md:mb-6 overflow-x-auto">
                        <nav className="-mb-px flex space-x-4 md:space-x-8">
                            <TabButton
                                active={activeTab === 'approvals'}
                                onClick={() => setActiveTab('approvals')}
                                icon={<ClipboardList className="w-4 h-4 md:w-5 md:h-5" />}
                                label="Pending Approvals"
                            />
                            <TabButton
                                active={activeTab === 'explorer'}
                                onClick={() => setActiveTab('explorer')}
                                icon={<Globe className="w-4 h-4 md:w-5 md:h-5" />}
                                label="Explore Locations"
                            />
                        </nav>
                    </div>

                    <main>{renderTabContent()}</main>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 text-sm md:text-base font-medium transition-colors duration-200 ${
            active 
            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default SupervisorDashboard;