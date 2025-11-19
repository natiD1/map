// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Check, X, UserPlus, UserMinus, UserCog, RefreshCw, AlertCircle, CheckCircle, MapPin, ChevronDown, Home, ArrowRight, Map, Edit3, Trash2 } from 'lucide-react';
// import L from 'leaflet';
// import MapModal from '../MapModal';
// // Helper component for the detailed hover summary
// const HoverChangesSummary = ({ changes }) => {
//   // Helper to format values concisely for the hover tooltip
//   const formatValue = (value) => {
//     if (value === null || value === undefined || value === '') return <em className="text-gray-400 italic">empty</em>;
//     if (typeof value === 'boolean') return <strong className="text-purple-300">{value ? 'Yes' : 'No'}</strong>;
//     if (typeof value === 'object') return <span className="text-purple-300">[Object]</span>; // Keep it brief for hover
//     return <strong className="text-purple-300 truncate">{String(value)}</strong>;
//   };

//   return (
//     <div className="space-y-2">
//       <h6 className="text-sm font-semibold text-blue-300 flex items-center mb-2 border-b border-gray-700 pb-1">
//         <Edit3 className="w-4 h-4 mr-2"/>Proposed Changes
//       </h6>
//       <ul className="space-y-1.5 text-xs">
//         {Object.entries(changes).slice(0, 3).map(([key, value]) => ( // Show up to 3 changes for brevity
//           <li key={key} className="grid grid-cols-3 items-center gap-x-2">
//             <span className="text-gray-400 capitalize truncate text-left">{key.replace(/_/g, ' ')}:</span>
//             <div className="text-gray-400 truncate text-right">{formatValue(value.old)}</div>
//             <div className="flex items-center gap-x-2">
//                <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
//                <div className="truncate text-left">{formatValue(value.new)}</div>
//             </div>
//           </li>
//         ))}
//         {Object.keys(changes).length > 3 && <li className="text-center text-gray-500 text-xs mt-1">...and more</li>}
//       </ul>
//     </div>
//   );
// };
// const ChangesSummary = ({ changes }) => {
//   if (!changes || Object.keys(changes).length === 0) { return <p className="text-xs text-gray-500 italic px-3 pt-2">No specific field changes were logged.</p>; }
//   const formatValue = (value) => {
//     if (value === null || value === undefined || value === '') return <em className="text-gray-500">empty</em>;
//     if (typeof value === 'object') return <pre className="text-xs p-1.5 rounded bg-gray-900/60 max-h-24 overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
//     return <strong className="text-blue-300">{String(value)}</strong>;
//   };
//   return (<div className="p-3 bg-gray-800/60 rounded-lg"><h5 className="font-semibold text-gray-300 mb-2 flex items-center"><UserCog className="w-4 h-4 mr-2" /> Proposed Changes</h5><ul className="space-y-2 text-xs">{Object.entries(changes).map(([key, value]) => (<li key={key} className="border-t border-gray-700/50 pt-2 first:border-0 first:pt-0"><span className="capitalize text-gray-400 font-medium">{key.replace(/_/g, ' ')} changed:</span><div className="pl-2 mt-1 flex items-start space-x-2"><div className="flex-1">{formatValue(value.old)}</div><ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0 mt-1" /><div className="flex-1">{formatValue(value.new)}</div></div></li>))}</ul></div>);
// };
// const LocationDetails = ({ request }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const { type, locationData, changes } = request;
//   if (!locationData) return null;
//   const hasDetails = type === 'ADD' || type === 'DELETE' || (type === 'EDIT' && changes);
//   if (!hasDetails) { return (<div className="mt-4 border-t border-gray-700/50 pt-3"><p className="text-xs text-gray-500 italic">No additional details provided.</p></div>); }
//   return (<div className="mt-4 border-t border-gray-700/50 pt-4"><button className="flex justify-between items-center w-full text-left text-sm font-medium text-gray-300 hover:text-white" onClick={() => setIsOpen(!isOpen)}><span>View Full Details</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button><AnimatePresence>{isOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3 space-y-4"> {type === 'EDIT' && <ChangesSummary changes={changes} />} {type === 'ADD' && (<div className="p-3 bg-gray-800/60 rounded-lg"><h5 className="font-semibold text-gray-300 mb-2 flex items-center"><Home className="w-4 h-4 mr-2" />New Property Details</h5><div className="space-y-1 text-xs text-gray-400"><p><strong className="text-gray-500">Address:</strong> {locationData.address || 'N/A'}</p><p><strong className="text-gray-500">City:</strong> {locationData.city || 'N/A'}</p><div className="pt-2 mt-2 border-t border-gray-700/50"><p><strong className="text-gray-500">Gush/Block:</strong> {locationData.gush_num || 'N/A'}</p><p><strong className="text-gray-500">Helka/Parcel:</strong> {locationData.parcel_num || 'N/A'}</p></div><p className="pt-2 mt-2 border-t border-gray-700/50"><strong className="text-gray-500">Description:</strong> {locationData.description || 'No description.'}</p>{locationData.owners?.[0] && <p className="pt-2 mt-2 border-t border-gray-700/50"><strong className="text-gray-500">Owner:</strong> {locationData.owners[0].first_name} {locationData.owners[0].last_name}</p>}{locationData.files && locationData.files.length > 0 && (<div className="pt-2 mt-2 border-t border-gray-700/50"><strong className="text-gray-500">Uploaded Files:</strong><ul className="list-disc pl-5 mt-1 space-y-1">{locationData.files.map((file, index) => (<li key={index} className="truncate" title={file.originalname}>{file.originalname}</li>))}</ul></div>)}</div></div>)}{type === 'DELETE' && (<div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg"><h5 className="font-semibold text-red-300 mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Deletion Target</h5><div className="space-y-1 text-xs text-red-200/80"><p><strong className="text-red-300/60">Address:</strong> {locationData.address || 'N/A'}</p><p><strong className="text-red-300/60">Gush/Block:</strong> {locationData.gush_num || 'N/A'}</p><p><strong className="text-red-300/60">Helka/Parcel:</strong> {locationData.parcel_num || 'N/A'}</p>{locationData.owners?.[0] && <p><strong className="text-red-300/60">Primary Owner:</strong> {locationData.owners[0].first_name} {locationData.owners[0].last_name}</p>}</div></div>)}</motion.div>)}</AnimatePresence></div>);
// };

// const ActionItem = ({ request, onApprove, onReject, onViewOnMap, processing }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const { type, locationData, changes } = request;

//   // ✅ FIX: Added a default case to the switch statement.
//   const getTypeStyles = (type) => {
//     switch (type) {
//       case 'ADD': return { icon: UserPlus, color: 'text-green-400', bg: 'bg-green-500/10', label: 'New Location Request' };
//       case 'DELETE': return { icon: UserMinus, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Deletion Request' };
//       case 'EDIT': return { icon: UserCog, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Location Edit Request' };
//       default: return { icon: MapPin, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Unknown Action' };
//     }
//   };

//   const styles = getTypeStyles(type);
//   const TypeIcon = styles.icon;
//   const canViewOnMap = locationData?.boundaryCoords || locationData?.boundary_coords;
//   const hasChanges = type === 'EDIT' && changes && Object.keys(changes).length > 0;

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 20, scale: 0.98 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
//       transition={{ duration: 0.3 }}
//       className="relative flex flex-col p-4 bg-gray-900/40 border border-gray-700/50 rounded-lg hover:border-gray-600/50 transition-colors"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
//         <div className="flex items-center mb-4 sm:mb-0 min-w-0"><div className={`p-3 rounded-lg ${styles.bg} mr-4 flex-shrink-0`}><TypeIcon className={`w-6 h-6 ${styles.color}`} /></div><div className="min-w-0"><h4 className="text-white font-medium truncate" title={locationData.name}>{locationData.name || 'Location'}</h4><p className="text-sm text-gray-400">Requested by: {request.requestedBy.username}</p><span className={`text-xs font-semibold mt-1 inline-block ${styles.color}`}>{styles.label}</span></div></div>
//         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto self-stretch sm:self-center">
//           {canViewOnMap && (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onViewOnMap} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"><Map className="w-4 h-4 mr-2" /> View on Map</motion.button>)}
//           <div className="flex space-x-3 w-full"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onApprove} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"><Check className="w-4 h-4 mr-2" /> Approve</motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onReject} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"><X className="w-4 h-4 mr-2" /> Reject</motion.button></div>
//         </div>
//       </div>
//       <LocationDetails request={request} />
//       <AnimatePresence>
//     {isHovered && (hasChanges || type === 'DELETE') && (
//         <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: 5 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 5 }}
//             transition={{ duration: 0.15 }} // Faster transition for an instant feel
//             className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[380px] z-10 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl"
//         >
//             {hasChanges && <HoverChangesSummary changes={changes} />}
//             {type === 'DELETE' && (
//                 <div>
//                     <h6 className="text-sm font-semibold text-red-300 flex items-center mb-1"><Trash2 className="w-4 h-4 mr-2"/>Deletion Target</h6>
//                     <p className="text-xs text-gray-400 font-semibold truncate">{locationData.name}</p>
//                     <p className="text-xs text-gray-500 truncate">{locationData.address}</p>
//                 </div>
//             )}
//         </motion.div>
//     )}
// </AnimatePresence>
//     </motion.div>
//   );
// };

// // ... (LocationApprovals main component remains unchanged) ...
// const LocationApprovals = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [processingId, setProcessingId] = useState(null);
//   const [showMap, setShowMap] = useState(false);
//   const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]);
//   const [selectedRequestForMap, setSelectedRequestForMap] = useState(null);
//   const fetchRequests = useCallback(async () => { setLoading(true); setError(null); try { const token = localStorage.getItem('token'); const response = await fetch('/api/supervisor/pending-location-actions', { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const data = await response.json(); setRequests(data.requests || []); } catch (err) { setError(err.message); } finally { setLoading(false); } }, []);
//   useEffect(() => { fetchRequests(); }, [fetchRequests]);
//   const handleAction = async (requestId, decision) => { setProcessingId(requestId); try { const token = localStorage.getItem('token'); const response = await fetch(`/api/supervisor/handle-location-action/${requestId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: decision }) }); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Action failed.'); } setRequests(prev => prev.filter(req => req.id !== requestId)); } catch (err) { setError(`Action failed: ${err.message}`); } finally { setProcessingId(null); } };
//   const handleViewOnMap = (request) => { const coordsData = request.locationData.boundaryCoords || request.locationData.boundary_coords; if (coordsData?.coordinates?.[0]?.length) { const locationObject = { ...request, isPending: true, pendingType: request.type, boundary_coords: coordsData, }; const flippedCoords = coordsData.coordinates[0].map(p => [p[1], p[0]]); const bounds = L.polygon(flippedCoords).getBounds(); const center = bounds.getCenter(); setMapCoords([center.lat, center.lng]); setSelectedRequestForMap(locationObject); setShowMap(true); } else { alert("Cannot view on map: This request does not have location data."); } };
//   const handleCloseMap = () => { setShowMap(false); setSelectedRequestForMap(null); };
//   const handleMapAction = async (requestId, decision) => { await handleAction(requestId, decision); handleCloseMap(); };
//   return (
//     <>
//       <div className="backdrop-blur-sm bg-black/20 rounded-lg p-4 md:p-6">
//         <div className="flex justify-between items-center mb-6"><div><h2 className="text-xl md:text-2xl font-bold text-white">Pending Location Approvals</h2><p className="text-gray-400 text-sm">Review, approve, or reject location requests.</p></div><button onClick={fetchRequests} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg border border-gray-600/50 transition-all text-sm disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span></button></div>
//         {loading && <p className="text-center text-gray-400 py-10">Loading requests...</p>}
//         {error && <div className="bg-red-500/20 text-red-300 rounded-lg p-4 flex items-center"><AlertCircle className="w-5 h-5 mr-3" /><span>{error}</span></div>}
//         {!loading && !error && (requests.length > 0 ? (<div className="space-y-4"><AnimatePresence>{requests.map(req => (<ActionItem key={req.id} request={req} onApprove={() => handleAction(req.id, 'approve')} onReject={() => handleAction(req.id, 'reject')} onViewOnMap={() => handleViewOnMap(req)} processing={processingId === req.id} />))}</AnimatePresence></div>) : (<div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-700/50 rounded-lg"><CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" /><h3 className="text-lg font-semibold text-gray-400">All Caught Up!</h3><p>There are no pending location actions to review.</p></div>))}
//       </div>
//       <AnimatePresence>{showMap && (<MapModal show={showMap} onClose={handleCloseMap} initialCoords={mapCoords} searchedLocation={selectedRequestForMap} onMapAction={handleMapAction} />)}</AnimatePresence>
//     </>
//   );
// };

// export default LocationApprovals;



// // src/pages/Supervisor/LocationApprovals.jsx

// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Check, X, UserPlus, UserMinus, UserCog, RefreshCw, AlertCircle, CheckCircle, MapPin, ChevronDown, Home, ArrowRight, Map, Edit3, Trash2 } from 'lucide-react';
// import L from 'leaflet';
// import MapModal from '../MapModal';

// // Helper component for the detailed hover summary
// const HoverChangesSummary = ({ changes }) => {
//   const formatValue = (value) => {
//     if (value === null || value === undefined || value === '') return <em className="text-slate-500 dark:text-gray-400 italic">empty</em>;
//     if (typeof value === 'boolean') return <strong className="text-purple-600 dark:text-purple-300">{value ? 'Yes' : 'No'}</strong>;
//     if (typeof value === 'object') return <span className="text-purple-600 dark:text-purple-300">[Object]</span>;
//     return <strong className="text-purple-600 dark:text-purple-300 truncate">{String(value)}</strong>;
//   };
//   return (
//     <div className="space-y-2">
//       <h6 className="text-sm font-semibold text-blue-600 dark:text-blue-300 flex items-center mb-2 border-b border-slate-200 dark:border-gray-700 pb-1">
//         <Edit3 className="w-4 h-4 mr-2"/>Proposed Changes
//       </h6>
//       <ul className="space-y-1.5 text-xs">
//         {Object.entries(changes).slice(0, 3).map(([key, value]) => (
//           <li key={key} className="grid grid-cols-3 items-center gap-x-2">
//             <span className="text-slate-500 dark:text-gray-400 capitalize truncate text-left">{key.replace(/_/g, ' ')}:</span>
//             <div className="text-slate-500 dark:text-gray-400 truncate text-right">{formatValue(value.old)}</div>
//             <div className="flex items-center gap-x-2">
//                <ArrowRight className="w-3 h-3 text-slate-400 dark:text-gray-500 flex-shrink-0" />
//                <div className="truncate text-left">{formatValue(value.new)}</div>
//             </div>
//           </li>
//         ))}
//         {Object.keys(changes).length > 3 && <li className="text-center text-slate-400 dark:text-gray-500 text-xs mt-1">...and more</li>}
//       </ul>
//     </div>
//   );
// };

// const ChangesSummary = ({ changes }) => {
//     if (!changes || Object.keys(changes).length === 0) return <p className="text-xs text-slate-500 dark:text-gray-500 italic px-3 pt-2">No field changes logged.</p>;
//     const formatValue = (value) => {
//         if (value === null || value === undefined || value === '') return <em className="text-slate-500 dark:text-gray-500">empty</em>;
//         if (typeof value === 'object') return <pre className="text-xs p-1.5 rounded bg-slate-200 dark:bg-gray-900/60 max-h-24 overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
//         return <strong className="text-blue-600 dark:text-blue-300">{String(value)}</strong>;
//     };
//     return (<div className="p-3 bg-slate-100 dark:bg-gray-800/60 rounded-lg"><h5 className="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center"><UserCog className="w-4 h-4 mr-2" /> Proposed Changes</h5><ul className="space-y-2 text-xs">{Object.entries(changes).map(([key, value]) => (<li key={key} className="border-t border-slate-200 dark:border-gray-700/50 pt-2 first:border-0 first:pt-0"><span className="capitalize text-slate-600 dark:text-gray-400 font-medium">{key.replace(/_/g, ' ')} changed:</span><div className="pl-2 mt-1 flex items-start space-x-2"><div className="flex-1">{formatValue(value.old)}</div><ArrowRight className="w-3 h-3 text-slate-400 dark:text-gray-500 flex-shrink-0 mt-1" /><div className="flex-1">{formatValue(value.new)}</div></div></li>))}</ul></div>);
// };

// const LocationDetails = ({ request }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const { type, locationData, changes } = request;
//     if (!locationData) return null;
//     return (<div className="mt-4 border-t border-slate-200 dark:border-gray-700/50 pt-4"><button className="flex justify-between items-center w-full text-left text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setIsOpen(!isOpen)}><span>View Full Details</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button><AnimatePresence>{isOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3 space-y-4">{type === 'EDIT' && <ChangesSummary changes={changes} />}{type === 'ADD' && (<div className="p-3 bg-slate-100 dark:bg-gray-800/60 rounded-lg"><h5 className="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center"><Home className="w-4 h-4 mr-2" />New Property Details</h5><div className="space-y-1 text-xs text-slate-600 dark:text-gray-400"><p><strong className="text-slate-500 dark:text-gray-500">Address:</strong> {locationData.address || 'N/A'}</p><p><strong className="text-slate-500 dark:text-gray-500">Gush/Parcel:</strong> {locationData.gush_num || 'N/A'} / {locationData.parcel_num || 'N/A'}</p>{locationData.owners?.[0] && <p className="pt-2 mt-2 border-t border-slate-200 dark:border-gray-700/50"><strong className="text-slate-500 dark:text-gray-500">Owner:</strong> {locationData.owners[0].first_name} {locationData.owners[0].last_name}</p>}</div></div>)}{type === 'DELETE' && (<div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg"><h5 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Deletion Target</h5><div className="space-y-1 text-xs text-red-700 dark:text-red-200/80"><p><strong className="text-red-600 dark:text-red-300/60">Address:</strong> {locationData.address || 'N/A'}</p></div></div>)}</motion.div>)}</AnimatePresence></div>);
// };

// const ActionItem = ({ request, onApprove, onReject, onViewOnMap, processing }) => {
//     const [isHovered, setIsHovered] = useState(false);
//     const { type, locationData, changes } = request;
    
//     const getTypeStyles = (type) => {
//         switch (type) {
//             case 'ADD': return { icon: UserPlus, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-500/10', label: 'New Location Request' };
//             case 'DELETE': return { icon: UserMinus, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500/10', label: 'Deletion Request' };
//             case 'EDIT': return { icon: UserCog, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-500/10', label: 'Location Edit Request' };
//             default: return { icon: MapPin, color: 'text-slate-700 dark:text-gray-400', bg: 'bg-slate-500/10', label: 'Unknown Action' };
//         }
//     };
    
//     const styles = getTypeStyles(type);
//     const TypeIcon = styles.icon;
//     const canViewOnMap = locationData?.boundaryCoords || locationData?.boundary_coords;
//     const hasChanges = type === 'EDIT' && changes && Object.keys(changes).length > 0;

//     return (
//         <motion.div
//             layout
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             className="relative flex flex-col p-4 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700/50 rounded-lg shadow-sm"
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//         >
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
//                 <div className="flex items-center mb-4 sm:mb-0 min-w-0"><div className={`p-3 rounded-lg ${styles.bg} mr-4 flex-shrink-0`}><TypeIcon className={`w-6 h-6 ${styles.color}`} /></div><div><h4 className="text-slate-800 dark:text-white font-medium truncate">{locationData.name || 'New Location'}</h4><p className="text-sm text-slate-500 dark:text-gray-400">Requested by: {request.requestedBy.username}</p><span className={`text-xs font-semibold mt-1 inline-block ${styles.color}`}>{styles.label}</span></div></div>
//                 <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
//                     {canViewOnMap && (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onViewOnMap} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20"><Map className="w-4 h-4 mr-2" /> View on Map</motion.button>)}
//                     <div className="flex space-x-3 w-full"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onApprove} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 disabled:opacity-50"><Check className="w-4 h-4 mr-2" /> Approve</motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onReject} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 disabled:opacity-50"><X className="w-4 h-4 mr-2" /> Reject</motion.button></div>
//                 </div>
//             </div>
//             <LocationDetails request={request} />
//            <AnimatePresence>
//             {isHovered && (hasChanges || type === 'DELETE') && (
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.95, y: 5 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.95, y: 5 }}
//                     transition={{ duration: 0.15 }}
//                     className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[380px] z-10 p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-xl"
//                 >
//                     {hasChanges && <HoverChangesSummary changes={changes} />}
//                     {type === 'DELETE' && (
//                         <div>
//                             <h6 className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center mb-1"><Trash2 className="w-4 h-4 mr-2"/>Deletion Target</h6>
//                             <p className="text-xs text-slate-700 dark:text-gray-400 font-semibold truncate">{locationData.name}</p>
//                             <p className="text-xs text-slate-500 dark:text-gray-500 truncate">{locationData.address}</p>
//                         </div>
//                     )}
//                 </motion.div>
//             )}
//         </AnimatePresence>
//         </motion.div>
//     );
// };

// const LocationApprovals = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [processingId, setProcessingId] = useState(null);
//   const [showMap, setShowMap] = useState(false);
//   const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]);
//   const [selectedRequestForMap, setSelectedRequestForMap] = useState(null);

//   const fetchRequests = useCallback(async () => { setLoading(true); setError(null); try { const token = localStorage.getItem('token'); const response = await fetch('/api/supervisor/pending-location-actions', { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const data = await response.json(); setRequests(data.requests || []); } catch (err) { setError(err.message); } finally { setLoading(false); } }, []);
  
//   useEffect(() => { fetchRequests(); }, [fetchRequests]);

//   // ✅ UPDATED handleAction to accept an optional reason
//   const handleAction = async (requestId, decision, reason = null) => { 
//     setProcessingId(requestId); 
//     try { 
//       const token = localStorage.getItem('token'); 
//       // ✅ Construct the request body
//       const body = { action: decision };
//       if (decision === 'reject') {
//           body.reason = reason;
//       }
//       const response = await fetch(`/api/supervisor/handle-location-action/${requestId}`, { 
//         method: 'POST', 
//         headers: { 
//           'Authorization': `Bearer ${token}`, 
//           'Content-Type': 'application/json' 
//         }, 
//         body: JSON.stringify(body) 
//       }); 
//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.message || `Failed to ${decision} request.`);
//       }
//       setRequests(prev => prev.filter(req => req.id !== requestId)); 
//     } catch (err) { 
//       setError(err.message); 
//     } finally { 
//       setProcessingId(null); 
//     } 
//   };
    
//   // ✅ NEW handler to prompt for a reason before rejecting
//   const handleRejectClick = (requestId) => {
//       const reason = prompt("Please provide a reason for rejecting this request:");
//       if (reason === null) return; // User clicked cancel, so we do nothing.
//       if (!reason.trim()) {
//           alert("Rejection reason cannot be empty.");
//           return;
//       }
//       handleAction(requestId, 'reject', reason);
//   };

//   const handleViewOnMap = (request) => { const coordsData = request.locationData.boundaryCoords || request.locationData.boundary_coords; if (coordsData?.coordinates?.[0]?.length) { const locationObject = { ...request, isPending: true, pendingType: request.type, boundary_coords: coordsData, }; const flippedCoords = coordsData.coordinates[0].map(p => [p[1], p[0]]); const bounds = L.polygon(flippedCoords).getBounds(); const center = bounds.getCenter(); setMapCoords([center.lat, center.lng]); setSelectedRequestForMap(locationObject); setShowMap(true); } else { alert("Cannot view on map: This request does not have location data."); } };
  
//   const handleCloseMap = () => { setShowMap(false); setSelectedRequestForMap(null); };

//   // ✅ UPDATED handleMapAction to also prompt for a reason on rejection
//   const handleMapAction = async (requestId, decision) => {
//     if (decision === 'reject') {
//         const reason = prompt("Please provide a reason for rejecting this request:");
//         if (reason === null) return;
//         if (!reason.trim()) {
//             alert("Rejection reason cannot be empty.");
//             return;
//         }
//         await handleAction(requestId, 'reject', reason);
//     } else {
//         await handleAction(requestId, 'approve');
//     }
//     handleCloseMap();
//   };

//   return (
//     <>
//       <div className="bg-slate-100/80 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-200 dark:border-transparent">
//           <div className="flex justify-between items-center mb-6">
//               <div>
//                   <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Pending Location Approvals</h2>
//                   <p className="text-slate-600 dark:text-gray-400 text-sm">Review, approve, or reject location requests.</p>
//               </div>
//               <button onClick={fetchRequests} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700/50 text-slate-700 dark:text-white rounded-lg border border-slate-300 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
//                   <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                   <span>Refresh</span>
//               </button>
//           </div>
//           {loading && <p className="text-center text-slate-500 dark:text-gray-400 py-10">Loading requests...</p>}
//           {error && <div className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}
//           {!loading && !error && (
//               requests.length > 0 ? (
//                   <div className="space-y-4">
//                       <AnimatePresence>
//                           {requests.map(req => (
//                               <ActionItem 
//                                   key={req.id} 
//                                   request={req} 
//                                   onApprove={() => handleAction(req.id, 'approve')} 
//                                   // ✅ Point the reject button to the new handler
//                                   onReject={() => handleRejectClick(req.id)}
//                                   onViewOnMap={() => handleViewOnMap(req)} 
//                                   processing={processingId === req.id} 
//                               />
//                           ))}
//                       </AnimatePresence>
//                   </div>
//               ) : (
//                   <div className="text-center py-10 text-slate-500 dark:text-gray-500 border-2 border-dashed border-slate-300 dark:border-gray-700/50 rounded-lg">
//                       <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
//                       <h3 className="text-lg font-semibold text-slate-600 dark:text-gray-400">All Caught Up!</h3>
//                       <p>No pending location actions to review.</p>
//                   </div>
//               )
//           )}
//       </div>
//       <AnimatePresence>{showMap && (<MapModal show={showMap} onClose={handleCloseMap} initialCoords={mapCoords} searchedLocation={selectedRequestForMap} onMapAction={handleMapAction} />)}</AnimatePresence>
//     </>
//   );
// };

// export default LocationApprovals;



// src/pages/Supervisor/LocationApprovals.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, UserPlus, UserMinus, UserCog, RefreshCw, AlertCircle, CheckCircle, MapPin, ChevronDown, Home, ArrowRight, Map, Edit3, Trash2, FileText } from 'lucide-react';
import L from 'leaflet';
import MapModal from '../MapModal';

// Helper component for the detailed hover summary
const HoverChangesSummary = ({ changes }) => {
  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return <em className="text-slate-500 dark:text-gray-400 italic">empty</em>;
    if (typeof value === 'boolean') return <strong className="text-purple-600 dark:text-purple-300">{value ? 'Yes' : 'No'}</strong>;
    if (typeof value === 'object') return <span className="text-purple-600 dark:text-purple-300">[Object]</span>;
    return <strong className="text-purple-600 dark:text-purple-300 truncate">{String(value)}</strong>;
  };
  return (
    <div className="space-y-2">
      <h6 className="text-sm font-semibold text-blue-600 dark:text-blue-300 flex items-center mb-2 border-b border-slate-200 dark:border-gray-700 pb-1">
        <Edit3 className="w-4 h-4 mr-2"/>Proposed Changes
      </h6>
      <ul className="space-y-1.5 text-xs">
        {Object.entries(changes).slice(0, 3).map(([key, value]) => (
          <li key={key} className="grid grid-cols-3 items-center gap-x-2">
            <span className="text-slate-500 dark:text-gray-400 capitalize truncate text-left">{key.replace(/_/g, ' ')}:</span>
            <div className="text-slate-500 dark:text-gray-400 truncate text-right">{formatValue(value.old)}</div>
            <div className="flex items-center gap-x-2">
               <ArrowRight className="w-3 h-3 text-slate-400 dark:text-gray-500 flex-shrink-0" />
               <div className="truncate text-left">{formatValue(value.new)}</div>
            </div>
          </li>
        ))}
        {Object.keys(changes).length > 3 && <li className="text-center text-slate-400 dark:text-gray-500 text-xs mt-1">...and more</li>}
      </ul>
    </div>
  );
};

const ChangesSummary = ({ changes }) => {
    if (!changes || Object.keys(changes).length === 0) return <p className="text-xs text-slate-500 dark:text-gray-500 italic px-3 pt-2">No field changes logged.</p>;
    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') return <em className="text-slate-500 dark:text-gray-500">empty</em>;
        if (typeof value === 'object') return <pre className="text-xs p-1.5 rounded bg-slate-200 dark:bg-gray-900/60 max-h-24 overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
        return <strong className="text-blue-600 dark:text-blue-300">{String(value)}</strong>;
    };
    return (<div className="p-3 bg-slate-100 dark:bg-gray-800/60 rounded-lg"><h5 className="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center"><UserCog className="w-4 h-4 mr-2" /> Proposed Changes</h5><ul className="space-y-2 text-xs">{Object.entries(changes).map(([key, value]) => (<li key={key} className="border-t border-slate-200 dark:border-gray-700/50 pt-2 first:border-0 first:pt-0"><span className="capitalize text-slate-600 dark:text-gray-400 font-medium">{key.replace(/_/g, ' ')} changed:</span><div className="pl-2 mt-1 flex items-start space-x-2"><div className="flex-1">{formatValue(value.old)}</div><ArrowRight className="w-3 h-3 text-slate-400 dark:text-gray-500 flex-shrink-0 mt-1" /><div className="flex-1">{formatValue(value.new)}</div></div></li>))}</ul></div>);
};

const LocationDetails = ({ request }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { type, locationData, changes } = request;
    if (!locationData) return null;

    const attachedFiles = locationData.files && locationData.files.length > 0 ? locationData.files : null;

    const handleDownload = async (file) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authentication error. Please log in again.");
                return;
            }

            const response = await fetch(`/api/supervisor/download-pending-file/${file.filename}?originalname=${encodeURIComponent(file.originalname)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Download failed with status: ${response.status}` }));
                throw new Error(errorData.message);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.originalname);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Download error:", err);
            alert(`Failed to download file: ${err.message}`);
        }
    };

    return (
        <div className="mt-4 border-t border-slate-200 dark:border-gray-700/50 pt-4">
            <button className="flex justify-between items-center w-full text-left text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setIsOpen(!isOpen)}>
                <span>View Full Details</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3 space-y-4">
                        {type === 'EDIT' && <ChangesSummary changes={changes} />}
                        {type === 'ADD' && (
                            <div className="p-3 bg-slate-100 dark:bg-gray-800/60 rounded-lg">
                                <h5 className="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center"><Home className="w-4 h-4 mr-2" />New Property Details</h5>
                                <div className="space-y-1 text-xs text-slate-600 dark:text-gray-400">
                                    <p><strong className="text-slate-500 dark:text-gray-500">Address:</strong> {locationData.address || 'N/A'}</p>
                                    <p><strong className="text-slate-500 dark:text-gray-500">Gush/Parcel:</strong> {locationData.gush_num || 'N/A'} / {locationData.parcel_num || 'N/A'}</p>
                                    {locationData.owners?.[0] && <p className="pt-2 mt-2 border-t border-slate-200 dark:border-gray-700/50"><strong className="text-slate-500 dark:text-gray-500">Owner:</strong> {locationData.owners[0].first_name} {locationData.owners[0].last_name}</p>}
                                </div>
                            </div>
                        )}
                        {type === 'DELETE' && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Deletion Target</h5>
                                <div className="space-y-1 text-xs text-red-700 dark:text-red-200/80">
                                    <p><strong className="text-red-600 dark:text-red-300/60">Address:</strong> {locationData.address || 'N/A'}</p>
                                </div>
                            </div>
                        )}
                        {/* --- NEWLY ADDED FILES SECTION --- */}
                        {attachedFiles && (
                            <div className="p-3 bg-slate-100 dark:bg-gray-800/60 rounded-lg">
                                <h5 className="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" /> Attached Files
                                </h5>
                                <ul className="space-y-2 text-xs">
                                    {attachedFiles.map((file, index) => (
                                        <li key={index} className="border-t border-slate-200 dark:border-gray-700/50 pt-2 first:border-0 first:pt-0">
                                            <button 
                                                onClick={() => handleDownload(file)}
                                                className="flex items-center text-blue-600 dark:text-blue-400 hover:underline text-left"
                                            >
                                                <span className="truncate">{file.originalname}</span>
                                                <span className="ml-2 text-slate-500 dark:text-gray-500 text-[10px]">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ActionItem = ({ request, onApprove, onReject, onViewOnMap, processing }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { type, locationData, changes } = request;
    
    const getTypeStyles = (type) => {
        switch (type) {
            case 'ADD': return { icon: UserPlus, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-500/10', label: 'New Location Request' };
            case 'DELETE': return { icon: UserMinus, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500/10', label: 'Deletion Request' };
            case 'EDIT': return { icon: UserCog, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-500/10', label: 'Location Edit Request' };
            default: return { icon: MapPin, color: 'text-slate-700 dark:text-gray-400', bg: 'bg-slate-500/10', label: 'Unknown Action' };
        }
    };
    
    const styles = getTypeStyles(type);
    const TypeIcon = styles.icon;
    const canViewOnMap = locationData?.boundaryCoords || locationData?.boundary_coords;
    const hasChanges = type === 'EDIT' && changes && Object.keys(changes).length > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative flex flex-col p-4 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700/50 rounded-lg shadow-sm"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0 min-w-0"><div className={`p-3 rounded-lg ${styles.bg} mr-4 flex-shrink-0`}><TypeIcon className={`w-6 h-6 ${styles.color}`} /></div><div><h4 className="text-slate-800 dark:text-white font-medium truncate">{locationData.name || 'New Location'}</h4><p className="text-sm text-slate-500 dark:text-gray-400">Requested by: {request.requestedBy.username}</p><span className={`text-xs font-semibold mt-1 inline-block ${styles.color}`}>{styles.label}</span></div></div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    {canViewOnMap && (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onViewOnMap} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20"><Map className="w-4 h-4 mr-2" /> View on Map</motion.button>)}
                    <div className="flex space-x-3 w-full"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onApprove} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 disabled:opacity-50"><Check className="w-4 h-4 mr-2" /> Approve</motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onReject} disabled={processing} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 disabled:opacity-50"><X className="w-4 h-4 mr-2" /> Reject</motion.button></div>
                </div>
            </div>
            <LocationDetails request={request} />
           <AnimatePresence>
            {isHovered && (hasChanges || type === 'DELETE') && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[380px] z-10 p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-xl"
                >
                    {hasChanges && <HoverChangesSummary changes={changes} />}
                    {type === 'DELETE' && (
                        <div>
                            <h6 className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center mb-1"><Trash2 className="w-4 h-4 mr-2"/>Deletion Target</h6>
                            <p className="text-xs text-slate-700 dark:text-gray-400 font-semibold truncate">{locationData.name}</p>
                            <p className="text-xs text-slate-500 dark:text-gray-500 truncate">{locationData.address}</p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
        </motion.div>
    );
};

const LocationApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState([33.06333, 35.15833]);
  const [selectedRequestForMap, setSelectedRequestForMap] = useState(null);

  const fetchRequests = useCallback(async () => { setLoading(true); setError(null); try { const token = localStorage.getItem('token'); const response = await fetch('/api/supervisor/pending-location-actions', { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const data = await response.json(); setRequests(data.requests || []); } catch (err) { setError(err.message); } finally { setLoading(false); } }, []);
  
  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (requestId, decision, reason = null) => { 
    setProcessingId(requestId); 
    try { 
      const token = localStorage.getItem('token'); 
      const body = { action: decision };
      if (decision === 'reject') {
          body.reason = reason;
      }
      const response = await fetch(`/api/supervisor/handle-location-action/${requestId}`, { 
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify(body) 
      }); 
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${decision} request.`);
      }
      setRequests(prev => prev.filter(req => req.id !== requestId)); 
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setProcessingId(null); 
    } 
  };
    
  const handleRejectClick = (requestId) => {
      const reason = prompt("Please provide a reason for rejecting this request:");
      if (reason === null) return;
      if (!reason.trim()) {
          alert("Rejection reason cannot be empty.");
          return;
      }
      handleAction(requestId, 'reject', reason);
  };

  const handleViewOnMap = (request) => { const coordsData = request.locationData.boundaryCoords || request.locationData.boundary_coords; if (coordsData?.coordinates?.[0]?.length) { const locationObject = { ...request, isPending: true, pendingType: request.type, boundary_coords: coordsData, }; const flippedCoords = coordsData.coordinates[0].map(p => [p[1], p[0]]); const bounds = L.polygon(flippedCoords).getBounds(); const center = bounds.getCenter(); setMapCoords([center.lat, center.lng]); setSelectedRequestForMap(locationObject); setShowMap(true); } else { alert("Cannot view on map: This request does not have location data."); } };
  
  const handleCloseMap = () => { setShowMap(false); setSelectedRequestForMap(null); };

  const handleMapAction = async (requestId, decision) => {
    if (decision === 'reject') {
        const reason = prompt("Please provide a reason for rejecting this request:");
        if (reason === null) return;
        if (!reason.trim()) {
            alert("Rejection reason cannot be empty.");
            return;
        }
        await handleAction(requestId, 'reject', reason);
    } else {
        await handleAction(requestId, 'approve');
    }
    handleCloseMap();
  };

  return (
    <>
      <div className="bg-slate-100/80 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-200 dark:border-transparent">
          <div className="flex justify-between items-center mb-6">
              <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Pending Location Approvals</h2>
                  <p className="text-slate-600 dark:text-gray-400 text-sm">Review, approve, or reject location requests.</p>
              </div>
              <button onClick={fetchRequests} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700/50 text-slate-700 dark:text-white rounded-lg border border-slate-300 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
              </button>
          </div>
          {loading && <p className="text-center text-slate-500 dark:text-gray-400 py-10">Loading requests...</p>}
          {error && <div className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}
          {!loading && !error && (
              requests.length > 0 ? (
                  <div className="space-y-4">
                      <AnimatePresence>
                          {requests.map(req => (
                              <ActionItem 
                                  key={req.id} 
                                  request={req} 
                                  onApprove={() => handleAction(req.id, 'approve')} 
                                  onReject={() => handleRejectClick(req.id)}
                                  onViewOnMap={() => handleViewOnMap(req)} 
                                  processing={processingId === req.id} 
                              />
                          ))}
                      </AnimatePresence>
                  </div>
              ) : (
                  <div className="text-center py-10 text-slate-500 dark:text-gray-500 border-2 border-dashed border-slate-300 dark:border-gray-700/50 rounded-lg">
                      <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <h3 className="text-lg font-semibold text-slate-600 dark:text-gray-400">All Caught Up!</h3>
                      <p>No pending location actions to review.</p>
                  </div>
              )
          )}
      </div>
      <AnimatePresence>{showMap && (<MapModal show={showMap} onClose={handleCloseMap} initialCoords={mapCoords} searchedLocation={selectedRequestForMap} onMapAction={handleMapAction} useVideoBackground={true} />)}</AnimatePresence>
    </>
  );
};

export default LocationApprovals;