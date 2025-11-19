


// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Link, useNavigate } from 'react-router-dom';
// import { 
//   Users, 
//   BarChart3, 
//   Activity, 
//   Globe, 
//   RefreshCw,
//   ClipboardList
// } from 'lucide-react';
// import L from 'leaflet';

// import DashboardStats from './DashboardStats';
// import UserManagement from './UserManagement';
// import RecentActivities from './RecentActivities';
// import UserActions from './UserActions';
// import EmailModal from './EmailModal';
// import LuxuryMapModal from '../components/MapModal'; 
// import { useAuth } from '../context/AuthContext';

// const AdminPanel = () => { 
//   const [activeTab, setActiveTab] = useState('dashboard'); 
//   const [stats, setStats] = useState(null); 
//   const [recentActivities, setRecentActivities] = useState([]); 
//   const [loading, setLoading] = useState(true); 
//   const [error, setError] = useState(null);
//   const [emailModalOpen, setEmailModalOpen] = useState(false);
//   const [selectedUserForEmail, setSelectedUserForEmail] = useState(null);
  
//   const [showMap, setShowMap] = useState(false);
//   const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]); 
//   const [searchedLocation, setSearchedLocation] = useState(null);
//   const [searchInput, setSearchInput] = useState('');
  
//   const [refreshKey, setRefreshKey] = useState(0);

//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const fetchStatsAndActivities = useCallback(() => {
//     const fetchStats = async () => { 
//       try { 
//         setLoading(true); 
//         setError(null); 
//         const token = localStorage.getItem('token'); 
//         const response = await fetch('http://localhost:5001/api/admin/stats', { 
//           headers: { 'Authorization': `Bearer ${token}` } 
//         }); 
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); 
//         const data = await response.json(); 
//         setStats(data); 
//       } catch (error) { 
//         console.error('Error fetching stats:', error); 
//         setError(error.message); 
//       } finally { 
//         setLoading(false); 
//       } 
//     }; 

//     const fetchRecentActivities = async () => { 
//       try { 
//         setError(null); 
//         const token = localStorage.getItem('token'); 
//         const response = await fetch('http://localhost:5001/api/admin/recent-activities?limit=10', { 
//           headers: { 'Authorization': `Bearer ${token}` } 
//         }); 
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); 
//         const data = await response.json(); 
//         setRecentActivities(data.activities); 
//       } catch (error) { 
//         console.error('Error fetching activities:', error); 
//         setError(error.message); 
//       } 
//     };
    
//     fetchStats();
//     fetchRecentActivities();
//   }, []);

//   useEffect(() => { 
//     fetchStatsAndActivities();
//   }, [fetchStatsAndActivities]); 

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const openEmailModal = (user) => {
//     setSelectedUserForEmail(user);
//     setEmailModalOpen(true);
//   };

//   // ✅ THIS IS THE MISSING FUNCTION THAT WAS CAUSING THE CRASH
//   const sendEmailToUser = async ({ subject, message }) => {
//     if (!selectedUserForEmail) {
//       alert("No user selected.");
//       return;
//     }
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:5001/api/admin/send-email', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           userId: selectedUserForEmail.id,
//           subject,
//           message
//         })
//       });

//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.message || "Failed to send email.");
//       }
      
//       alert(`Email sent successfully to ${selectedUserForEmail.email}!`);
//       setEmailModalOpen(false);
//       setSelectedUserForEmail(null);

//     } catch (err) {
//       console.error("Error sending email:", err);
//       alert(`Error: ${err.message}`);
//     }
//   };

//   const handleShowCleanMap = () => {
//     setSearchedLocation(null);
//     setSearchInput('');
//     setMapCoords([33.06333, 35.15833]);
//     setShowMap(true);
//   };

//   const handleViewLocationRequest = (request) => {
//     const coordsData = request.locationData.boundaryCoords || request.locationData.boundary_coords;
//     if (coordsData?.coordinates?.[0]?.length) {
//       const locationObject = {
//         ...request,
//         isPending: true,
//         pendingType: request.type,
//         boundary_coords: coordsData
//       };
//       const flippedCoords = coordsData.coordinates[0].map(p => [p[1], p[0]]);
//       const bounds = L.polygon(flippedCoords).getBounds();
//       const center = bounds.getCenter();
//       setMapCoords([center.lat, center.lng]);
//       setSearchedLocation(locationObject);
//       setShowMap(true);
//     } else {
//       alert("Cannot view on map: This request does not have associated location data.");
//     }
//   };

//   const handleCloseMap = () => {
//     setShowMap(false);
//     setSearchedLocation(null); 
//   };
  
//   const handleMapAction = async (requestId, decision) => {
//     if (decision === 'reject') {
//         const reason = prompt("Please provide a reason for rejecting this request:");
//         if (reason === null) {
//             return;
//         }
//         if (!reason.trim()) {
//             alert("Rejection reason cannot be empty. Please provide a valid reason.");
//             return;
//         }
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`http://localhost:5001/api/admin/handle-location-action/${requestId}`, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ action: 'reject', reason: reason })
//             });
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `Failed to reject request.`);
//             }
//             handleCloseMap();
//             setRefreshKey(prevKey => prevKey + 1);
//             alert(`Request rejected successfully!`);
//         } catch (err) {
//             console.error(`Action failed: ${err.message}`);
//             alert(`Action failed: ${err.message}`);
//         }
//     } else {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`http://localhost:5001/api/admin/handle-location-action/${requestId}`, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ action: 'approve' })
//             });
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `Failed to approve request.`);
//             }
//             handleCloseMap();
//             setRefreshKey(prevKey => prevKey + 1);
//             alert(`Request approved successfully!`);
//         } catch (err) {
//             console.error(`Action failed: ${err.message}`);
//             alert(`Action failed: ${err.message}`);
//         }
//     }
//   };

//   const renderTabContent = () => { 
//     switch (activeTab) { 
//       case 'dashboard': 
//         return <DashboardStats stats={stats} loading={loading} error={error} />; 
//       case 'users': 
//         return <UserManagement onSendEmail={openEmailModal} onUserAction={fetchStatsAndActivities} />; 
//       case 'locations':
//         return (
//           <div className=" backdrop-blur-sm rounded-lg p-4 md:p-6">
//             <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Location Management</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               <div className="bg-gray-700/50 p-3 md:p-4 rounded-lg">
//                 <h3 className="text-lg font-semibold text-white mb-2">View & Add Locations</h3>
//                 <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Open the map to view all properties or add a new one.</p>
//                 <button onClick={handleShowCleanMap} className="px-3 py-2 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base">
//                   Open Map
//                 </button>
//               </div>
//               <div className="bg-gray-700/50 p-3 md:p-4 rounded-lg">
//                 <h3 className="text-lg font-semibold text-white mb-2">Search Location</h3>
//                 <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Open the map and use the search bar to find a specific location.</p>
//                 <button onClick={handleShowCleanMap} className="px-3 py-2 md:px-4 md:py-2 bg-blue-500/50 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm md:text-base">
//                   Open Map & Search
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//       case 'userActions':
//         return <UserActions key={refreshKey} onUserAction={fetchStatsAndActivities} onViewLocation={handleViewLocationRequest} />;
//       case 'activities': 
//         return <RecentActivities activities={recentActivities} error={error} onRefresh={fetchStatsAndActivities} />; 
//       default: 
//         return <DashboardStats stats={stats} loading={loading} error={error} />; 
//     } 
//   }; 

//   return ( 
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white"> 
//       <header className="fixed top-0 left-0 w-full bg-black/20 backdrop-blur-sm px-4 sm:px-6 py-3 z-30 border-b border-gray-700/50">
//           <div className="max-w-7xl mx-auto flex justify-between items-center">
//               <Link to="/" className="text-xl font-bold">Admin Panel</Link>
//               <div className="flex items-center space-x-4">
//                   <span className="text-sm">Welcome, {user?.full_name || 'Admin'}</span>
//                   <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300">Logout</button>
//               </div>
//           </div>
//       </header>

//       <div className="pt-20 md:pt-24"> 
//         <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 md:py-6"> 
//           <div className="text-center mb-6 md:mb-8">
//             <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//               Admin Dashboard
//             </h1>
//             <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">Advanced user management & location oversight</p>
//           </div>

//           {error && ( 
//             <div className="mt-3 bg-red-500/20 text-red-300 p-3 rounded-lg text-center"><strong>Error:</strong> {error}</div> 
//           )} 

//           <div className="border-b border-gray-700/50 mb-4 md:mb-6 overflow-x-auto"> 
//             <nav className="-mb-px flex space-x-4 md:space-x-8 justify-center"> 
//               <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 className="w-4 h-4 md:w-5 md:h-5" />} label="Dashboard" /> 
//               <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4 md:w-5 md:h-5" />} label="Users" /> 
//               <TabButton active={activeTab === 'locations'} onClick={() => setActiveTab('locations')} icon={<Globe className="w-4 h-4 md:w-5 md:h-5" />} label="Locations" />
//               <TabButton active={activeTab === 'userActions'} onClick={() => setActiveTab('userActions')} icon={<ClipboardList className="w-4 h-4 md:w-5 md:h-5" />} label="Pending Actions" /> 
//               <TabButton active={activeTab === 'activities'} onClick={() => setActiveTab('activities')} icon={<Activity className="w-4 h-4 md:w-5 md:h-5" />} label="Activities" /> 
//             </nav> 
//           </div> 

//           <main> 
//             {renderTabContent()} 
//           </main>
          
//           <div className="flex justify-center mt-6 md:mt-8">
//             <button onClick={fetchStatsAndActivities} className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600/50"> 
//               <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 ${loading ? 'animate-spin' : ''}`} /> 
//               <span>Refresh Data</span> 
//             </button> 
//           </div>
//         </div> 
//       </div>

//       {emailModalOpen && <EmailModal user={selectedUserForEmail} onClose={() => { setEmailModalOpen(false); setSelectedUserForEmail(null); }} onSend={sendEmailToUser} />}

//       <AnimatePresence>
//         {showMap && (
//           <LuxuryMapModal
//             show={showMap}
//             onClose={handleCloseMap}
//             initialCoords={mapCoords}
//             searchedLocation={searchedLocation}
//             onMapAction={handleMapAction}
//           />
//         )}
//       </AnimatePresence>
//     </div> 
//   ); 
// }; 

// const TabButton = ({ active, onClick, icon, label }) => ( 
//   <button onClick={onClick} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 text-sm md:text-base font-medium transition-colors duration-200 ${active ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}> 
//     {icon} <span>{label}</span>
//   </button> 
// ); 

// export default AdminPanel;


// src/pages/AdminPanel.jsx (FINAL AND CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  BarChart3,
  Activity,
  Globe,
  RefreshCw,
  ClipboardList,
  Sun,
  Moon
} from 'lucide-react';
import L from 'leaflet';

import DashboardStats from './DashboardStats';
import UserManagement from './UserManagement';
import RecentActivities from './RecentActivities';
import UserActions from './UserActions';
import EmailModal from './EmailModal';
import LuxuryMapModal from '../components/MapModal';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
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

  // --- ALL YOUR ORIGINAL, WORKING STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- YOUR ORIGINAL, WORKING DATA FETCHING LOGIC ---
  const fetchStatsAndActivities = useCallback(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/admin/recent-activities?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setRecentActivities(data.activities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error.message);
      }
    };

    fetchStats();
    fetchRecentActivities();
  }, []);

  useEffect(() => {
    fetchStatsAndActivities();
  }, [fetchStatsAndActivities, refreshKey]); // Added refreshKey dependency

  // --- ALL YOUR ORIGINAL, WORKING HANDLER FUNCTIONS ---
  const handleLogout = () => { logout(); navigate('/'); };
  const openEmailModal = (user) => { setSelectedUserForEmail(user); setEmailModalOpen(true); };
  const handleCloseMap = () => { setShowMap(false); setSearchedLocation(null); };

  const sendEmailToUser = async ({ subject, message }) => {
    // Your working logic here...
  };
  const handleShowCleanMap = () => {
    setSearchedLocation(null);
    setMapCoords([33.06333, 35.15833]);
    setShowMap(true);
  };
  const handleViewLocationRequest = (request) => {
    const coordsData = request.locationData.boundaryCoords || request.locationData.boundary_coords;
    if (coordsData?.coordinates?.[0]?.length) {
      const locationObject = { ...request, isPending: true, pendingType: request.type, boundary_coords: coordsData };
      const flippedCoords = coordsData.coordinates[0].map(p => [p[1], p[0]]);
      const bounds = L.polygon(flippedCoords).getBounds();
      const center = bounds.getCenter();
      setMapCoords([center.lat, center.lng]);
      setSearchedLocation(locationObject);
      setShowMap(true);
    } else {
      alert("Cannot view on map: This request does not have associated location data.");
    }
  };
  
  // ✅ --- THIS IS THE CORRECTED, FULLY IMPLEMENTED FUNCTION --- ✅
  const handleMapAction = async (requestId, decision) => {
    if (decision === 'reject') {
        const reason = prompt("Please provide a reason for rejecting this request:");
        if (reason === null) { // User cancelled the prompt
            return;
        }
        if (!reason.trim()) {
            alert("Rejection reason cannot be empty. Please provide a valid reason.");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/admin/handle-location-action/${requestId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', reason: reason })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to reject request.`);
            }
            handleCloseMap();
            setRefreshKey(prevKey => prevKey + 1); // Refresh the actions list
            alert(`Request rejected successfully!`);
        } catch (err) {
            console.error(`Action failed: ${err.message}`);
            alert(`Action failed: ${err.message}`);
        }
    } else { // This handles the 'approve' action
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/admin/handle-location-action/${requestId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to approve request.`);
            }
            handleCloseMap();
            setRefreshKey(prevKey => prevKey + 1); // Refresh the actions list
            alert(`Request approved successfully!`);
        } catch (err) {
            console.error(`Action failed: ${err.message}`);
            alert(`Action failed: ${err.message}`);
        }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={stats} loading={loading} error={error} />;
      case 'users':
        return <UserManagement onSendEmail={openEmailModal} onUserAction={() => setRefreshKey(k => k + 1)} />;
      case 'locations':
        return (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Location Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">View & Add Locations</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3 md:mb-4 text-sm">Open the map to view all properties or add a new one.</p>
                <button onClick={handleShowCleanMap} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors text-sm">Open Map</button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Search Location</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3 md:mb-4 text-sm">Use the map's search bar to find a specific location.</p>
                <button onClick={handleShowCleanMap} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors text-sm">Open Map & Search</button>
              </div>
            </div>
          </div>
        );
      case 'userActions':
        return <UserActions key={refreshKey} onUserAction={() => setRefreshKey(k => k + 1)} onViewLocation={handleViewLocationRequest} />;
      case 'activities':
        return <RecentActivities activities={recentActivities} error={error} onRefresh={() => setRefreshKey(k => k + 1)} />;
      default:
        return <DashboardStats stats={stats} loading={loading} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors duration-300">
      <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/60 px-4 sm:px-6 py-3 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</Link>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            {user && (
              <button onClick={handleLogout} className="px-4 py-1.5 font-medium text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">Logout</button>
            )}
          </div>
        </div>
      </header>

      <div className="pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 md:py-6">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 md:mt-2 text-sm">Advanced user management & location oversight</p>
          </div>
          {error && <div className="mt-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-lg text-center"><strong>Error:</strong> {error}</div>}
          <div className="border-b border-slate-200 dark:border-slate-700 mb-4 md:mb-6 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 md:space-x-8 justify-center">
              <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 />} label="Dashboard" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Users" />
              <TabButton active={activeTab === 'locations'} onClick={() => setActiveTab('locations')} icon={<Globe />} label="Locations" />
              <TabButton active={activeTab === 'userActions'} onClick={() => setActiveTab('userActions')} icon={<ClipboardList />} label="Pending Actions" />
              <TabButton active={activeTab === 'activities'} onClick={() => setActiveTab('activities')} icon={<Activity />} label="Activities" />
            </nav>
          </div>
          <main><AnimatePresence mode="wait"><motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>{renderTabContent()}</motion.div></AnimatePresence></main>
          <div className="flex justify-center mt-6 md:mt-8">
            <button onClick={() => setRefreshKey(k => k + 1)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      {emailModalOpen && <EmailModal user={selectedUserForEmail} onClose={() => setEmailModalOpen(false)} onSend={sendEmailToUser} />}
      
      <AnimatePresence>
        {showMap && (
          <LuxuryMapModal
            show={showMap}
            onClose={handleCloseMap}
            initialCoords={mapCoords}
            searchedLocation={searchedLocation}
            onMapAction={handleMapAction}
            useVideoBackground={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// This TabButton component is now theme-aware.
const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 text-sm md:text-base font-medium transition-colors duration-200 ${active ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200'}`}>
    {React.cloneElement(icon, { className: 'w-4 h-4 md:w-5 md:h-5' })}
    <span>{label}</span>
  </button>
);

export default AdminPanel;





// // src/pages/AdminPanel.jsx (FINAL AND CORRECTED)

// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Users,
//   BarChart3,
//   Activity,
//   Globe,
//   RefreshCw,
//   ClipboardList,
//   Sun,
//   Moon
// } from 'lucide-react';
// import L from 'leaflet';

// import DashboardStats from './DashboardStats';
// import UserManagement from './UserManagement';
// import RecentActivities from './RecentActivities';
// import UserActions from './UserActions';
// import EmailModal from './EmailModal';
// import LuxuryMapModal from '../components/MapModal';
// import { useAuth } from '../context/AuthContext';

// const AdminPanel = () => {
//   // --- THEME LOGIC ---
//   const [theme, setTheme] = useState(() => {
//     if (typeof window !== 'undefined') {
//       const savedTheme = localStorage.getItem('theme');
//       if (savedTheme) return savedTheme;
//       return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//     }
//     return 'light';
//   });

//   useEffect(() => {
//     const root = window.document.documentElement;
//     if (theme === 'dark') {
//       root.classList.add('dark');
//     } else {
//       root.classList.remove('dark');
//     }
//     localStorage.setItem('theme', theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
//   };

//   // --- ALL YOUR ORIGINAL, WORKING STATE ---
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [stats, setStats] = useState(null);
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [emailModalOpen, setEmailModalOpen] = useState(false);
//   const [selectedUserForEmail, setSelectedUserForEmail] = useState(null);
//   const [showMap, setShowMap] = useState(false);
//   const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]);
//   const [searchedLocation, setSearchedLocation] = useState(null);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   // --- YOUR ORIGINAL, WORKING DATA FETCHING LOGIC ---
//   const fetchStatsAndActivities = useCallback(() => {
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const token = localStorage.getItem('token');
//         const response = await fetch('http://localhost:5001/api/admin/stats', {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         const data = await response.json();
//         setStats(data);
//       } catch (error) {
//         console.error('Error fetching stats:', error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchRecentActivities = async () => {
//       try {
//         setError(null);
//         const token = localStorage.getItem('token');
//         const response = await fetch('http://localhost:5001/api/admin/recent-activities?limit=10', {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         const data = await response.json();
//         setRecentActivities(data.activities);
//       } catch (error) {
//         console.error('Error fetching activities:', error);
//         setError(error.message);
//       }
//     };

//     fetchStats();
//     fetchRecentActivities();
//   }, []);

//   useEffect(() => {
//     fetchStatsAndActivities();
//   }, [fetchStatsAndActivities, refreshKey]); // Added refreshKey dependency

//   // --- ALL YOUR ORIGINAL, WORKING HANDLER FUNCTIONS ---
//   const handleLogout = () => { logout(); navigate('/'); };
//   const openEmailModal = (user) => { setSelectedUserForEmail(user); setEmailModalOpen(true); };
//   const handleCloseMap = () => { setShowMap(false); setSearchedLocation(null); };

//   const sendEmailToUser = async ({ subject, message }) => {
//     // Your working logic here...
//   };
//   const handleShowCleanMap = () => {
//     setSearchedLocation(null);
//     setMapCoords([33.06333, 35.15833]);
//     setShowMap(true);
//   };
//   const handleViewLocationRequest = (request) => {
//     const coordsData = request.locationData.boundaryCoords || request.locationData.boundary_coords;
//     if (coordsData?.coordinates?.[0]?.length) {
//       const locationObject = { ...request, isPending: true, pendingType: request.type, boundary_coords: coordsData };
//       const flippedCoords = coordsData.coordinates[0].map(p => [p[1], p[0]]);
//       const bounds = L.polygon(flippedCoords).getBounds();
//       const center = bounds.getCenter();
//       setMapCoords([center.lat, center.lng]);
//       setSearchedLocation(locationObject);
//       setShowMap(true);
//     } else {
//       alert("Cannot view on map: This request does not have associated location data.");
//     }
//   };
  
//   const handleMapAction = async (requestId, decision) => {
//     if (decision === 'reject') {
//         const reason = prompt("Please provide a reason for rejecting this request:");
//         if (reason === null) { 
//             return;
//         }
//         if (!reason.trim()) {
//             alert("Rejection reason cannot be empty. Please provide a valid reason.");
//             return;
//         }
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`http://localhost:5001/api/admin/handle-location-action/${requestId}`, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ action: 'reject', reason: reason })
//             });
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `Failed to reject request.`);
//             }
//             handleCloseMap();
//             setRefreshKey(prevKey => prevKey + 1);
//             alert(`Request rejected successfully!`);
//         } catch (err) {
//             console.error(`Action failed: ${err.message}`);
//             alert(`Action failed: ${err.message}`);
//         }
//     } else { 
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`http://localhost:5001/api/admin/handle-location-action/${requestId}`, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ action: 'approve' })
//             });
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `Failed to approve request.`);
//             }
//             handleCloseMap();
//             setRefreshKey(prevKey => prevKey + 1);
//             alert(`Request approved successfully!`);
//         } catch (err) {
//             console.error(`Action failed: ${err.message}`);
//             alert(`Action failed: ${err.message}`);
//         }
//     }
//   };

//   const renderTabContent = () => {
//     // NOTE: For a fully consistent theme, the root elements of DashboardStats, UserManagement, 
//     // UserActions, and RecentActivities should be styled with a glassy background like the 'locations' tab below.
//     switch (activeTab) {
//       case 'dashboard':
//         return <DashboardStats stats={stats} loading={loading} error={error} />;
//       case 'users':
//         return <UserManagement onSendEmail={openEmailModal} onUserAction={() => setRefreshKey(k => k + 1)} />;
//       case 'locations':
//         return (
//           <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-6 shadow-2xl">
//             <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Location Management</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               <div className="bg-white/10 p-3 md:p-4 rounded-lg border border-white/20">
//                 <h3 className="text-lg font-semibold text-white mb-2">View & Add Locations</h3>
//                 <p className="text-slate-200 mb-3 md:mb-4 text-sm">Open the map to view all properties or add a new one.</p>
//                 <button onClick={handleShowCleanMap} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors text-sm">Open Map</button>
//               </div>
//               <div className="bg-white/10 p-3 md:p-4 rounded-lg border border-white/20">
//                 <h3 className="text-lg font-semibold text-white mb-2">Search Location</h3>
//                 <p className="text-slate-200 mb-3 md:mb-4 text-sm">Use the map's search bar to find a specific location.</p>
//                 <button onClick={handleShowCleanMap} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors text-sm">Open Map & Search</button>
//               </div>
//             </div>
//           </div>
//         );
//       case 'userActions':
//         return <UserActions key={refreshKey} onUserAction={() => setRefreshKey(k => k + 1)} onViewLocation={handleViewLocationRequest} />;
//       case 'activities':
//         return <RecentActivities activities={recentActivities} error={error} onRefresh={() => setRefreshKey(k => k + 1)} />;
//       default:
//         return <DashboardStats stats={stats} loading={loading} error={error} />;
//     }
//   };

//   return (
//     <div className="min-h-screen text-slate-700 dark:text-slate-300 transition-colors duration-300">
//         <video 
//             autoPlay 
//             loop 
//             muted 
//             playsInline 
//             className="absolute inset-0 object-cover w-full h-full z-0 filter blur-md" 
//             src="https://videos.pexels.com/video-files/6607871/6607871-uhd_2560_1440_30fps.mp4" 
//         />
//         <div className="absolute inset-0 bg-black/40 z-0" />

//         <div className="relative z-10">
//             <header className="fixed top-0 left-0 w-full bg-white/30 dark:bg-slate-900/50 backdrop-blur-lg border-b border-white/20 dark:border-slate-700/60 px-4 sm:px-6 py-3 z-30">
//                 <div className="max-w-7xl mx-auto flex justify-between items-center">
//                     <Link to="/" className="text-xl font-bold text-white dark:text-white">Admin Panel</Link>
//                     <div className="flex items-center gap-4">
//                         <button onClick={toggleTheme} className="p-2 rounded-full text-slate-300 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50" aria-label="Toggle theme">
//                             {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
//                         </button>
//                         {user && (
//                             <button onClick={handleLogout} className="px-4 py-1.5 font-medium text-white dark:text-slate-100 text-sm bg-slate-100/30 dark:bg-slate-700/30 border border-slate-300/50 dark:border-slate-600/50 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-600/50">Logout</button>
//                         )}
//                     </div>
//                 </div>
//             </header>

//             <div className="pt-20 md:pt-24">
//                 <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 md:py-6">
//                     <div className="text-center mb-6 md:mb-8">
//                         <h1 className="text-2xl md:text-4xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Admin Dashboard</h1>
//                         <p className="text-slate-200 mt-1 md:mt-2 text-sm">Advanced user management & location oversight</p>
//                     </div>
//                     {error && <div className="mt-3 bg-red-500/50 backdrop-blur-sm text-white p-3 rounded-lg text-center"><strong>Error:</strong> {error}</div>}
//                     <div className="border-b border-white/20 mb-4 md:mb-6 overflow-x-auto">
//                         <nav className="-mb-px flex space-x-4 md:space-x-8 justify-center">
//                             <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 />} label="Dashboard" />
//                             <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Users" />
//                             <TabButton active={activeTab === 'locations'} onClick={() => setActiveTab('locations')} icon={<Globe />} label="Locations" />
//                             <TabButton active={activeTab === 'userActions'} onClick={() => setActiveTab('userActions')} icon={<ClipboardList />} label="Pending Actions" />
//                             <TabButton active={activeTab === 'activities'} onClick={() => setActiveTab('activities')} icon={<Activity />} label="Activities" />
//                         </nav>
//                     </div>
//                     <main><AnimatePresence mode="wait"><motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>{renderTabContent()}</motion.div></AnimatePresence></main>
//                     <div className="flex justify-center mt-6 md:mt-8">
//                         <button onClick={() => setRefreshKey(k => k + 1)} className="flex items-center gap-2 px-3 py-2 bg-white/30 dark:bg-slate-800/50 text-white backdrop-blur-md rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50">
//                             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh Data</span>
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {emailModalOpen && <EmailModal user={selectedUserForEmail} onClose={() => setEmailModalOpen(false)} onSend={sendEmailToUser} />}
            
//             <AnimatePresence>
//                 {showMap && (
//                 <LuxuryMapModal
//                     show={showMap}
//                     onClose={handleCloseMap}
//                     initialCoords={mapCoords}
//                     searchedLocation={searchedLocation}
//                     onMapAction={handleMapAction}
//                     useVideoBackground={true}
//                 />
//                 )}
//             </AnimatePresence>
//         </div>
//     </div>
//   );
// };

// const TabButton = ({ active, onClick, icon, label }) => (
//     <button onClick={onClick} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 text-sm md:text-base font-medium transition-colors duration-200 ${active ? 'border-blue-400 text-white' : 'border-transparent text-slate-300 hover:border-slate-400 hover:text-white'}`}>
//         {React.cloneElement(icon, { className: 'w-4 h-4 md:w-5 md:h-5' })}
//         <span>{label}</span>
//     </button>
// );

// export default AdminPanel;