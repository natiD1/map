// import React, { useState, useEffect } from 'react';
// import { X, CheckCircle, XCircle, Lock, Unlock, User, Mail, Calendar, AlertCircle, Shield, Trash2, UserCheck } from 'lucide-react';

// const UserDetailModal = ({ user, onClose, onApprove, onReject, onLock, onUnlock, onDelete, onUpdateRole }) => {
//   const [userDetails, setUserDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchUserDetails();
//   }, [user]);

//   const fetchUserDetails = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5001/api/admin/user/${user.id}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUserDetails(data);
//       } else {
//         throw new Error('Failed to fetch user details');
//       }
//     } catch (err) {
//       console.error('Error fetching user details:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status, isLocked) => { 
//     if (isLocked) { 
//       return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">Locked</span>; 
//     } 
//     switch (status) { 
//       case 'pending': 
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>; 
//       case 'approved': 
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">Approved</span>; 
//       case 'rejected': 
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">Rejected</span>; 
//       default: 
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">Unknown</span>; 
//     } 
//   };
  
//   const renderLoading = () => (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//       <div className="bg-gray-800 rounded-xl max-w-2xl w-full p-6 border border-gray-700">
//         <div className="animate-pulse space-y-6">
//           <div className="h-6 bg-gray-700 rounded w-1/3"></div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4"><div className="h-4 bg-gray-700 rounded w-full"></div><div className="h-4 bg-gray-700 rounded w-2/3"></div></div>
//             <div className="space-y-4"><div className="h-4 bg-gray-700 rounded w-full"></div><div className="h-4 bg-gray-700 rounded w-2/3"></div></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) return renderLoading();

//   const isSupervisor = userDetails?.user?.role === 'Supervisor';

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-700">
//         <div className="flex justify-between items-center p-6 border-b border-gray-700">
//           <h3 className="text-lg font-semibold text-white">User Details</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
//         </div>

//         <div className="overflow-y-auto p-6 space-y-6">
//           {error && (
//             <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
//               <AlertCircle className="w-5 h-5 text-red-400 mr-2" /><span className="text-red-300">{error}</span>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Basic Info */}
//             <div className="space-y-4">
//               <h4 className="text-white font-medium border-b border-gray-700 pb-2">Basic Information</h4>
//               <div className="flex items-start"><User className="w-4 h-4 text-gray-400 mr-2 mt-1" /><div><p className="text-gray-400 text-sm">Name</p><p className="text-white">{userDetails?.user.full_name}</p></div></div>
//               <div className="flex items-start"><Mail className="w-4 h-4 text-gray-400 mr-2 mt-1" /><div><p className="text-gray-400 text-sm">Email</p><p className="text-white">{userDetails?.user.email}</p></div></div>
//               <div className="flex items-start"><Calendar className="w-4 h-4 text-gray-400 mr-2 mt-1" /><div><p className="text-gray-400 text-sm">Joined</p><p className="text-white">{new Date(userDetails?.user.created_at).toLocaleDateString()}</p></div></div>
//               <div><p className="text-gray-400 text-sm mb-1">Status</p>{getStatusBadge(userDetails?.user.status, userDetails?.user.is_locked)}</div>
//               <div className="flex items-start"><UserCheck className="w-4 h-4 text-gray-400 mr-2 mt-1" /><div><p className="text-gray-400 text-sm">Role</p><p className="text-white capitalize">{userDetails?.user.role}</p></div></div>
//               {userDetails?.user.lock_reason && (<div><p className="text-gray-400 text-sm">Lock Reason</p><p className="text-white text-sm">{userDetails?.user.lock_reason}</p></div>)}
//             </div>

//             {/* Additional Info */}
//             <div className="space-y-4">
//               <h4 className="text-white font-medium border-b border-gray-700 pb-2">Activity</h4>
//               <div><p className="text-gray-400 text-sm">Login Count</p><p className="text-white">{userDetails?.user.login_count || 0}</p></div>
//               <div><p className="text-gray-400 text-sm">Last Login</p><p className="text-white">{userDetails?.user.last_login ? new Date(userDetails?.user.last_login).toLocaleString() : 'Never'}</p></div>
//               {userDetails?.user.admin_notes && (<div><p className="text-gray-400 text-sm">Admin Notes</p><p className="text-white text-sm bg-gray-700/50 p-2 rounded">{userDetails?.user.admin_notes}</p></div>)}
//             </div>
//           </div>

//           {/* Permissions Info */}
//           <div className="space-y-4">
//             <h4 className="text-white font-medium border-b border-gray-700 pb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Permissions</h4>
//             {userDetails?.permissions && Object.keys(userDetails.permissions).length > 0 ? (
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
//                   <p className={`p-2 rounded-md text-center ${userDetails.permissions.can_manage_users ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-400'}`}>Manage Users</p>
//                   <p className={`p-2 rounded-md text-center ${userDetails.permissions.can_manage_locations ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-400'}`}>Manage Locations</p>
//                   <p className={`p-2 rounded-md text-center ${userDetails.permissions.can_manage_content ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-400'}`}>Manage Content</p>
//                   <p className={`p-2 rounded-md text-center ${userDetails.permissions.can_view_reports ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-400'}`}>View Reports</p>
//               </div>
//             ) : <p className="text-gray-400">No specific permissions set.</p>}
//           </div>
//         </div>
        
//         {/* Actions */}
//         <div className="p-6 mt-auto border-t border-gray-700 bg-gray-800/50">
//           <div className="flex flex-wrap gap-3">
//             {user.status === 'pending' && (
//               <>
//                 <button onClick={() => { onApprove(user.id); onClose(); }} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><CheckCircle className="w-4 h-4" />Approve</button>
//                 <button onClick={() => { const reason = prompt('Reason for rejection:'); if (reason) { onReject(user.id, reason); onClose(); } }} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><XCircle className="w-4 h-4" />Reject</button>
//               </>
//             )}

//             {user.status === 'approved' && (
//               user.is_locked ? (
//                 <button onClick={() => { onUnlock(user.id); onClose(); }} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><Unlock className="w-4 h-4" />Unlock</button>
//               ) : (
//                 <button onClick={() => { const reason = prompt('Reason for locking:'); if (reason) { onLock(user.id, reason); onClose(); } }} className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><Lock className="w-4 h-4" />Lock</button>
//               )
//             )}
            
//             {user.status === 'approved' && !user.is_locked && userDetails && user.role !== 'admin' && (
//                 isSupervisor ? (
//                     <button onClick={() => { onUpdateRole(user.id, 'user'); onClose(); }} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">Demote to User</button>
//                 ) : (
//                     <button onClick={() => { onUpdateRole(user.id, 'Supervisor'); onClose(); }} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Promote to Supervisor</button>
//                 )
//             )}
//           </div>
//           {user.role !== 'admin' && <button onClick={() => { onDelete(user.id); onClose(); }} className="w-full mt-3 px-4 py-2 bg-red-800 hover:bg-red-700 text-red-200 rounded-lg flex items-center justify-center gap-2 transition-colors"><Trash2 className="w-4 h-4" />Delete User</button>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDetailModal;



import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Lock, Unlock, User, Mail, Calendar, AlertCircle, Shield, Trash2, UserCheck } from 'lucide-react';

const UserDetailModal = ({ user, onClose, onApprove, onReject, onLock, onUnlock, onDelete, onUpdateRole }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserDetails();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, isLocked) => { 
    if (isLocked) { 
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400">Locked</span>; 
    } 
    switch (status) { 
      case 'pending': 
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400">Pending</span>; 
      case 'approved': 
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">Approved</span>; 
      case 'rejected': 
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400">Rejected</span>; 
      default: 
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800 dark:bg-gray-500/20 dark:text-gray-400">Unknown</span>; 
    } 
  };
  
  const renderLoading = () => (
    <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 border border-slate-200 dark:border-gray-700">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4"><div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-full"></div><div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-2/3"></div></div>
            <div className="space-y-4"><div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-full"></div><div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-2/3"></div></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return renderLoading();

  const isSupervisor = userDetails?.user?.role === 'Supervisor';

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Details</h3>
          <button onClick={onClose} className="text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" /><span className="text-red-800 dark:text-red-300">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-slate-800 dark:text-white font-medium border-b border-slate-200 dark:border-gray-700 pb-2">Basic Information</h4>
              <div className="flex items-start"><User className="w-4 h-4 text-slate-400 dark:text-gray-400 mr-2 mt-1" /><div><p className="text-slate-500 dark:text-gray-400 text-sm">Name</p><p className="text-slate-900 dark:text-white">{userDetails?.user.full_name}</p></div></div>
              <div className="flex items-start"><Mail className="w-4 h-4 text-slate-400 dark:text-gray-400 mr-2 mt-1" /><div><p className="text-slate-500 dark:text-gray-400 text-sm">Email</p><p className="text-slate-900 dark:text-white">{userDetails?.user.email}</p></div></div>
              <div className="flex items-start"><Calendar className="w-4 h-4 text-slate-400 dark:text-gray-400 mr-2 mt-1" /><div><p className="text-slate-500 dark:text-gray-400 text-sm">Joined</p><p className="text-slate-900 dark:text-white">{new Date(userDetails?.user.created_at).toLocaleDateString()}</p></div></div>
              <div><p className="text-slate-500 dark:text-gray-400 text-sm mb-1">Status</p>{getStatusBadge(userDetails?.user.status, userDetails?.user.is_locked)}</div>
              <div className="flex items-start"><UserCheck className="w-4 h-4 text-slate-400 dark:text-gray-400 mr-2 mt-1" /><div><p className="text-slate-500 dark:text-gray-400 text-sm">Role</p><p className="text-slate-900 dark:text-white capitalize">{userDetails?.user.role}</p></div></div>
              {userDetails?.user.lock_reason && (<div><p className="text-slate-500 dark:text-gray-400 text-sm">Lock Reason</p><p className="text-slate-800 dark:text-white text-sm">{userDetails?.user.lock_reason}</p></div>)}
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h4 className="text-slate-800 dark:text-white font-medium border-b border-slate-200 dark:border-gray-700 pb-2">Activity</h4>
              <div><p className="text-slate-500 dark:text-gray-400 text-sm">Login Count</p><p className="text-slate-900 dark:text-white">{userDetails?.user.login_count || 0}</p></div>
              <div><p className="text-slate-500 dark:text-gray-400 text-sm">Last Login</p><p className="text-slate-900 dark:text-white">{userDetails?.user.last_login ? new Date(userDetails?.user.last_login).toLocaleString() : 'Never'}</p></div>
              {userDetails?.user.admin_notes && (<div><p className="text-slate-500 dark:text-gray-400 text-sm">Admin Notes</p><p className="text-slate-800 dark:text-white text-sm bg-slate-100 dark:bg-gray-700/50 p-2 rounded">{userDetails?.user.admin_notes}</p></div>)}
            </div>
          </div>

          {/* Permissions Info */}
          <div className="space-y-4">
            <h4 className="text-slate-800 dark:text-white font-medium border-b border-slate-200 dark:border-gray-700 pb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Permissions</h4>
            {userDetails?.permissions && Object.keys(userDetails.permissions).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <p className={`p-2 rounded-md text-center ${userDetails.permissions.can_manage_users ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>Manage Users</p>
                  <p className={`p-2 rounded-md text-center ${userDetails.permissions.can_manage_locations ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>Manage Locations</p>
                  <p className={`p-2 rounded-md text-center ${userDetails.permissions.can_manage_content ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>Manage Content</p>
                  <p className={`p-2 rounded-md text-center ${userDetails.permissions.can_view_reports ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>View Reports</p>
              </div>
            ) : <p className="text-slate-500 dark:text-gray-400">No specific permissions set.</p>}
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 mt-auto border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50">
          <div className="flex flex-wrap gap-3">
            {user.status === 'pending' && (
              <>
                <button onClick={() => { onApprove(user.id); onClose(); }} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><CheckCircle className="w-4 h-4" />Approve</button>
                <button onClick={() => { const reason = prompt('Reason for rejection:'); if (reason) { onReject(user.id, reason); onClose(); } }} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><XCircle className="w-4 h-4" />Reject</button>
              </>
            )}

            {user.status === 'approved' && (
              user.is_locked ? (
                <button onClick={() => { onUnlock(user.id); onClose(); }} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><Unlock className="w-4 h-4" />Unlock</button>
              ) : (
                <button onClick={() => { const reason = prompt('Reason for locking:'); if (reason) { onLock(user.id, reason); onClose(); } }} className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"><Lock className="w-4 h-4" />Lock</button>
              )
            )}
            
            {user.status === 'approved' && !user.is_locked && userDetails && user.role !== 'admin' && (
                isSupervisor ? (
                    <button onClick={() => { onUpdateRole(user.id, 'user'); onClose(); }} className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">Demote to User</button>
                ) : (
                    <button onClick={() => { onUpdateRole(user.id, 'Supervisor'); onClose(); }} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Promote to Supervisor</button>
                )
            )}
          </div>
          {user.role !== 'admin' && <button onClick={() => { onDelete(user.id); onClose(); }} className="w-full mt-3 px-4 py-2 bg-red-800 hover:bg-red-700 text-red-200 rounded-lg flex items-center justify-center gap-2 transition-colors"><Trash2 className="w-4 h-4" />Delete User</button>}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;