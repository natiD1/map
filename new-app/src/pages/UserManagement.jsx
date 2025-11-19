// import React, { useState, useEffect } from 'react';
// import { 
//   Search, 
//   CheckCircle, 
//   XCircle, 
//   Eye, 
//   Lock, 
//   Unlock,
//   Mail
// } from 'lucide-react';
// import UserDetailModal from './UserDetailModal';

// const UserManagement = ({ onSendEmail, onUserAction }) => { 
//   const [users, setUsers] = useState([]); 
//   const [loading, setLoading] = useState(true); 
//   const [searchTerm, setSearchTerm] = useState(''); 
//   const [statusFilter, setStatusFilter] = useState('all'); 
//   const [selectedUser, setSelectedUser] = useState(null); 
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); 
//   const [pagination, setPagination] = useState({ 
//     total: 0, 
//     limit: 10, 
//     offset: 0 
//   }); 

//   useEffect(() => { 
//     fetchUsers(); 
//   }, [statusFilter, searchTerm, pagination.offset]); 

//   const fetchUsers = async () => { 
//     try { 
//       setLoading(true); 
//       const token = localStorage.getItem('token'); 
//       const params = new URLSearchParams({ 
//         status: statusFilter, 
//         limit: pagination.limit, 
//         offset: pagination.offset 
//       }); 
       
//       if (searchTerm) { 
//         params.append('search', searchTerm); 
//       } 

//       const response = await fetch(`http://localhost:5001/api/admin/users?${params}`, { 
//         headers: { 
//           'Authorization': `Bearer ${token}` 
//         } 
//       }); 
       
//       if (response.ok) { 
//         const data = await response.json(); 
//         setUsers(data.users); 
//         setPagination(prev => ({ ...prev, total: data.pagination?.total || data.users.length })); 
//       } 
//     } catch (error) { 
//       console.error('Error fetching users:', error); 
//     } finally { 
//       setLoading(false); 
//     } 
//   }; 

//   const handleApprove = async (userId, sendEmail = false) => { 
//     try { 
//       const token = localStorage.getItem('token'); 
//       const response = await fetch(`http://localhost:5001/api/admin/approve-user/${userId}`, { 
//         method: 'POST', 
//         headers: { 
//           'Authorization': `Bearer ${token}`, 
//           'Content-Type': 'application/json' 
//         },
//         body: JSON.stringify({ sendEmail })
//       }); 
       
//       if (response.ok) { 
//         fetchUsers();
//         onUserAction && onUserAction();
//       } else {
//         const errorData = await response.json();
//         alert(`Error approving user: ${errorData.message}`);
//       }
//     } catch (error) { 
//       console.error('Error approving user:', error); 
//     } 
//   }; 

//   const handleReject = async (userId, reason, sendEmail = false) => { 
//     try { 
//       const token = localStorage.getItem('token'); 
//       const response = await fetch(`http://localhost:5001/api/admin/reject-user/${userId}`, { 
//         method: 'POST', 
//         headers: { 
//           'Authorization': `Bearer ${token}`, 
//           'Content-Type': 'application/json' 
//         }, 
//         body: JSON.stringify({ reason, sendEmail }) 
//       }); 
       
//       if (response.ok) { 
//         fetchUsers();
//         onUserAction && onUserAction();
//       } else {
//         const errorData = await response.json();
//         alert(`Error rejecting user: ${errorData.message}`);
//       }
//     } catch (error) { 
//       console.error('Error rejecting user:', error); 
//     } 
//   };

//   const handleLock = async (userId, reason) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5001/api/admin/lock-user/${userId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ reason })
//       });
//       if (response.ok) {
//         fetchUsers();
//         onUserAction && onUserAction();
//       } else {
//         const errorData = await response.json();
//         alert(`Error: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Error locking user:', error);
//     }
//   };

//   const handleUnlock = async (userId) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5001/api/admin/unlock-user/${userId}`, {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.ok) {
//         fetchUsers();
//         onUserAction && onUserAction();
//       } else {
//         const errorData = await response.json();
//         alert(`Error: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Error unlocking user:', error);
//     }
//   };

//   const handleDelete = async (userId) => {
//     if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
//       return;
//     }
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5001/api/admin/user/${userId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.ok) {
//         fetchUsers();
//         onUserAction && onUserAction();
//       } else {
//         const errorData = await response.json();
//         alert(`Error: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//     }
//   };

//   const handleUpdateRole = async (userId, newRole) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5001/api/admin/update-user-role/${userId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ role: newRole })
//       });
//       if (response.ok) {
//         alert('User role updated successfully!');
//         fetchUsers(); // Refresh the user list
//         onUserAction && onUserAction();
//       } else {
//         const errorData = await response.json();
//         alert(`Error updating role: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Error updating role:', error);
//     }
//   };

//   const handleActionWithEmail = (user, action, reason = null) => {
//     const shouldSendEmail = window.confirm(`Do you want to send an email notification to ${user.email}?`);
    
//     if (action === 'approve') {
//       handleApprove(user.id, shouldSendEmail);
//     } else if (action === 'reject') {
//       if (!reason) {
//         reason = prompt('Reason for rejection:');
//         if (!reason) return;
//       }
//       handleReject(user.id, reason, shouldSendEmail);
//     }
//   };

//   const openUserDetail = (user) => { 
//     setSelectedUser(user); 
//     setIsDetailModalOpen(true); 
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

//   return ( 
//     <div> 
//       <div className="flex justify-between items-center mb-6"> 
//         <h2 className="text-xl font-semibold text-white">User Management</h2> 
//       </div> 

//       {/* Filters and Search */} 
//       <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6"> 
//         <div className="flex flex-col lg:flex-row gap-4"> 
//           <div className="flex-1"> 
//             <div className="relative"> 
//               <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> 
//               <input 
//                 type="text" 
//                 placeholder="Search users..." 
//                 value={searchTerm} 
//                 onChange={(e) => setSearchTerm(e.target.value)} 
//                 className="pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
//               /> 
//             </div> 
//           </div> 
//           <div className="w-full sm:w-48"> 
//             <select 
//               value={statusFilter} 
//               onChange={(e) => setStatusFilter(e.target.value)} 
//               className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
//             > 
//               <option value="all">All Status</option> 
//               <option value="pending">Pending</option> 
//               <option value="approved">Approved</option> 
//               <option value="rejected">Rejected</option> 
//             </select> 
//           </div> 
//         </div> 
//       </div> 

//       {/* Users Table */} 
//       <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"> 
//         {loading ? ( 
//           <div className="p-6"> 
//             <div className="animate-pulse space-y-4"> 
//               {[...Array(5)].map((_, i) => ( 
//                 <div key={i} className="flex items-center justify-between py-4"> 
//                   <div className="flex items-center space-x-4"> 
//                     <div className="w-10 h-10 bg-gray-600 rounded-full"></div> 
//                     <div> 
//                       <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div> 
//                       <div className="h-3 bg-gray-600 rounded w-24"></div> 
//                     </div> 
//                   </div> 
//                   <div className="h-6 bg-gray-600 rounded w-20"></div> 
//                 </div> 
//               ))} 
//             </div> 
//           </div> 
//         ) : users.length === 0 ? ( 
//           <div className="p-6 text-center text-gray-400"> 
//             No users found matching your criteria. 
//           </div> 
//         ) : ( 
//           <> 
//             <div className="overflow-x-auto"> 
//               <table className="min-w-full divide-y divide-gray-700/50"> 
//                 <thead className="bg-gray-700/30"> 
//                   <tr> 
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th> 
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th> 
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th> 
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th> 
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th> 
//                   </tr> 
//                 </thead> 
//                 <tbody className="divide-y divide-gray-700/50"> 
//                   {users.map((user) => ( 
//                     <tr key={user.id} className="hover:bg-gray-700/20"> 
//                       <td className="px-6 py-4 whitespace-nowrap"> 
//                         <div className="flex items-center"> 
//                           <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"> 
//                             <span className="text-white font-medium"> 
//                               {user.full_name?.[0]?.toUpperCase() || 'U'} 
//                             </span> 
//                           </div> 
//                           <div className="ml-4"> 
//                             <div className="text-sm font-medium text-white">{user.full_name}</div> 
//                             <div className="text-sm text-gray-400">{user.email}</div> 
//                           </div> 
//                         </div> 
//                       </td> 
//                       <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status, user.is_locked)}</td> 
//                       <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
//                         <span className={user.role === 'Supervisor' ? 'font-medium text-blue-300' : 'text-gray-400'}>
//                             {user.role}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td> 
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> 
//                         <div className="flex items-center justify-end space-x-2"> 
//                           <button onClick={() => openUserDetail(user)} className="text-blue-400 hover:text-blue-300 p-1" title="View Details"><Eye className="w-4 h-4" /></button> 
//                           <button onClick={() => onSendEmail(user)} className="text-purple-400 hover:text-purple-300 p-1" title="Send Email"><Mail className="w-4 h-4" /></button> 
//                           {user.status === 'pending' && ( 
//                             <> 
//                               <button onClick={() => handleActionWithEmail(user, 'approve')} className="text-green-400 hover:text-green-300 p-1" title="Approve User"><CheckCircle className="w-4 h-4" /></button> 
//                               <button onClick={() => handleActionWithEmail(user, 'reject')} className="text-red-400 hover:text-red-300 p-1" title="Reject User"><XCircle className="w-4 h-4" /></button> 
//                             </> 
//                           )}
//                           {user.status === 'approved' && !user.is_locked && (
//                             <button onClick={() => { const reason = prompt('Reason for locking user:'); if (reason) handleLock(user.id, reason);}} className="text-yellow-400 hover:text-yellow-300 p-1" title="Lock User"><Lock className="w-4 h-4" /></button>
//                           )}
//                           {user.is_locked && (
//                               <button onClick={() => handleUnlock(user.id)} className="text-green-400 hover:text-green-300 p-1" title="Unlock User"><Unlock className="w-4 h-4" /></button>
//                           )}
//                         </div> 
//                       </td> 
//                     </tr> 
//                   ))} 
//                 </tbody> 
//               </table> 
//             </div> 
             
//             {/* Pagination */} 
//             {pagination.total > pagination.limit && ( 
//               <div className="px-6 py-4 bg-gray-700/30 border-t border-gray-700/50"> 
//                 <div className="flex items-center justify-between"> 
//                   <div className="text-sm text-gray-300"> 
//                     Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '} 
//                     <span className="font-medium">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of{' '} 
//                     <span className="font-medium">{pagination.total}</span> users 
//                   </div> 
//                   <div className="flex space-x-2"> 
//                     <button onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit)}))} disabled={pagination.offset === 0} className="px-3 py-1 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50">Previous</button> 
//                     <button onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit}))} disabled={pagination.offset + pagination.limit >= pagination.total} className="px-3 py-1 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50">Next</button> 
//                   </div> 
//                 </div> 
//               </div> 
//             )} 
//           </> 
//         )} 
//       </div> 

//       {/* User Detail Modal */} 
//       {selectedUser && isDetailModalOpen && ( 
//         <UserDetailModal 
//           user={selectedUser} 
//           onClose={() => setIsDetailModalOpen(false)} 
//           onApprove={(userId) => handleActionWithEmail(selectedUser, 'approve')}
//           onReject={(userId, reason) => handleActionWithEmail(selectedUser, 'reject', reason)}
//           onLock={handleLock}
//           onUnlock={handleUnlock}
//           onDelete={handleDelete}
//           onUpdateRole={handleUpdateRole}
//           onSendEmail={() => onSendEmail(selectedUser)}
//         /> 
//       )} 
//     </div> 
//   ); 
// }; 

// export default UserManagement;



import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock, 
  Unlock,
  Mail
} from 'lucide-react';
import UserDetailModal from './UserDetailModal';

const UserManagement = ({ onSendEmail, onUserAction }) => { 
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); 
  const [pagination, setPagination] = useState({ 
    total: 0, 
    limit: 10, 
    offset: 0 
  }); 

  useEffect(() => { 
    fetchUsers(); 
  }, [statusFilter, searchTerm, pagination.offset]); 

  const fetchUsers = async () => { 
    try { 
      setLoading(true); 
      const token = localStorage.getItem('token'); 
      const params = new URLSearchParams({ 
        status: statusFilter, 
        limit: pagination.limit, 
        offset: pagination.offset 
      }); 
       
      if (searchTerm) { 
        params.append('search', searchTerm); 
      } 

      const response = await fetch(`http://localhost:5001/api/admin/users?${params}`, { 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      }); 
       
      if (response.ok) { 
        const data = await response.json(); 
        setUsers(data.users); 
        setPagination(prev => ({ ...prev, total: data.pagination?.total || data.users.length })); 
      } 
    } catch (error) { 
      console.error('Error fetching users:', error); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  // ... All your handler functions (handleApprove, handleReject, etc.) remain unchanged ...
  const handleApprove = async (userId, sendEmail = false) => { 
    try { 
      const token = localStorage.getItem('token'); 
      const response = await fetch(`http://localhost:5001/api/admin/approve-user/${userId}`, { 
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ sendEmail })
      }); 
       
      if (response.ok) { 
        fetchUsers();
        onUserAction && onUserAction();
      } else {
        const errorData = await response.json();
        alert(`Error approving user: ${errorData.message}`);
      }
    } catch (error) { 
      console.error('Error approving user:', error); 
    } 
  }; 

  const handleReject = async (userId, reason, sendEmail = false) => { 
    try { 
      const token = localStorage.getItem('token'); 
      const response = await fetch(`http://localhost:5001/api/admin/reject-user/${userId}`, { 
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify({ reason, sendEmail }) 
      }); 
       
      if (response.ok) { 
        fetchUsers();
        onUserAction && onUserAction();
      } else {
        const errorData = await response.json();
        alert(`Error rejecting user: ${errorData.message}`);
      }
    } catch (error) { 
      console.error('Error rejecting user:', error); 
    } 
  };

  const handleLock = async (userId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/lock-user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        fetchUsers();
        onUserAction && onUserAction();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error locking user:', error);
    }
  };

  const handleUnlock = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/unlock-user/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchUsers();
        onUserAction && onUserAction();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error unlocking user:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/user/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchUsers();
        onUserAction && onUserAction();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/update-user-role/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        alert('User role updated successfully!');
        fetchUsers(); // Refresh the user list
        onUserAction && onUserAction();
      } else {
        const errorData = await response.json();
        alert(`Error updating role: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleActionWithEmail = (user, action, reason = null) => {
    const shouldSendEmail = window.confirm(`Do you want to send an email notification to ${user.email}?`);
    
    if (action === 'approve') {
      handleApprove(user.id, shouldSendEmail);
    } else if (action === 'reject') {
      if (!reason) {
        reason = prompt('Reason for rejection:');
        if (!reason) return;
      }
      handleReject(user.id, reason, shouldSendEmail);
    }
  };


  const openUserDetail = (user) => { 
    setSelectedUser(user); 
    setIsDetailModalOpen(true); 
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

  return ( 
    <div> 
      <div className="flex justify-between items-center mb-6"> 
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">User Management</h2> 
      </div> 

      {/* Filters and Search */} 
      <div className="bg-slate-100 dark:bg-gray-800/50 backdrop-blur-sm border border-slate-200 dark:border-gray-700/50 rounded-xl p-6 mb-6"> 
        <div className="flex flex-col lg:flex-row gap-4"> 
          <div className="flex-1"> 
            <div className="relative"> 
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-400" /> 
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-slate-300 dark:border-gray-600/50 rounded-lg w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              /> 
            </div> 
          </div> 
          <div className="w-full sm:w-48"> 
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-slate-300 dark:border-gray-600/50 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            > 
              <option value="all">All Status</option> 
              <option value="pending">Pending</option> 
              <option value="approved">Approved</option> 
              <option value="rejected">Rejected</option> 
            </select> 
          </div> 
        </div> 
      </div> 

      {/* Users Table */} 
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-slate-200 dark:border-gray-700/50 rounded-xl overflow-hidden"> 
        {loading ? ( 
          <div className="p-6"> 
            <div className="animate-pulse space-y-4"> 
              {[...Array(5)].map((_, i) => ( 
                <div key={i} className="flex items-center justify-between py-4"> 
                  <div className="flex items-center space-x-4"> 
                    <div className="w-10 h-10 bg-slate-300 dark:bg-gray-600 rounded-full"></div> 
                    <div> 
                      <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-32 mb-2"></div> 
                      <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-24"></div> 
                    </div> 
                  </div> 
                  <div className="h-6 bg-slate-300 dark:bg-gray-600 rounded w-20"></div> 
                </div> 
              ))} 
            </div> 
          </div> 
        ) : users.length === 0 ? ( 
          <div className="p-6 text-center text-slate-500 dark:text-gray-400"> 
            No users found matching your criteria. 
          </div> 
        ) : ( 
          <> 
            <div className="overflow-x-auto"> 
              <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700/50"> 
                <thead className="bg-slate-50 dark:bg-gray-700/30"> 
                  <tr> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">User</th> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">Status</th> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">Role</th> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">Joined</th> 
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">Actions</th> 
                  </tr> 
                </thead> 
                <tbody className="divide-y divide-slate-200 dark:divide-gray-700/50"> 
                  {users.map((user) => ( 
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/20"> 
                      <td className="px-6 py-4 whitespace-nowrap"> 
                        <div className="flex items-center"> 
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"> 
                            <span className="text-white font-medium"> 
                              {user.full_name?.[0]?.toUpperCase() || 'U'} 
                            </span> 
                          </div> 
                          <div className="ml-4"> 
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{user.full_name}</div> 
                            <div className="text-sm text-slate-500 dark:text-gray-400">{user.email}</div> 
                          </div> 
                        </div> 
                      </td> 
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status, user.is_locked)}</td> 
                      <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                        <span className={user.role === 'Supervisor' ? 'font-medium text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-gray-400'}>
                            {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td> 
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> 
                        <div className="flex items-center justify-end space-x-2"> 
                          <button onClick={() => openUserDetail(user)} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-1" title="View Details"><Eye className="w-4 h-4" /></button> 
                          <button onClick={() => onSendEmail(user)} className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 p-1" title="Send Email"><Mail className="w-4 h-4" /></button> 
                          {user.status === 'pending' && ( 
                            <> 
                              <button onClick={() => handleActionWithEmail(user, 'approve')} className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 p-1" title="Approve User"><CheckCircle className="w-4 h-4" /></button> 
                              <button onClick={() => handleActionWithEmail(user, 'reject')} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1" title="Reject User"><XCircle className="w-4 h-4" /></button> 
                            </> 
                          )}
                          {user.status === 'approved' && !user.is_locked && (
                            <button onClick={() => { const reason = prompt('Reason for locking user:'); if (reason) handleLock(user.id, reason);}} className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 p-1" title="Lock User"><Lock className="w-4 h-4" /></button>
                          )}
                          {user.is_locked && (
                              <button onClick={() => handleUnlock(user.id)} className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 p-1" title="Unlock User"><Unlock className="w-4 h-4" /></button>
                          )}
                        </div> 
                      </td> 
                    </tr> 
                  ))} 
                </tbody> 
              </table> 
            </div> 
             
            {/* Pagination */} 
            {pagination.total > pagination.limit && ( 
              <div className="px-6 py-4 bg-slate-50 dark:bg-gray-700/30 border-t border-slate-200 dark:border-gray-700/50"> 
                <div className="flex items-center justify-between"> 
                  <div className="text-sm text-slate-600 dark:text-gray-300"> 
                    Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '} 
                    <span className="font-medium">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of{' '} 
                    <span className="font-medium">{pagination.total}</span> users 
                  </div> 
                  <div className="flex space-x-2"> 
                    <button onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit)}))} disabled={pagination.offset === 0} className="px-3 py-1 border border-slate-300 dark:border-gray-600 rounded-md text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-slate-100 dark:hover:bg-gray-600/50 disabled:opacity-50">Previous</button> 
                    <button onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit}))} disabled={pagination.offset + pagination.limit >= pagination.total} className="px-3 py-1 border border-slate-300 dark:border-gray-600 rounded-md text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-slate-100 dark:hover:bg-gray-600/50 disabled:opacity-50">Next</button> 
                  </div> 
                </div> 
              </div> 
            )} 
          </> 
        )} 
      </div> 

      {/* User Detail Modal */} 
      {selectedUser && isDetailModalOpen && ( 
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setIsDetailModalOpen(false)} 
          onApprove={(userId) => handleActionWithEmail(selectedUser, 'approve')}
          onReject={(userId, reason) => handleActionWithEmail(selectedUser, 'reject', reason)}
          onLock={handleLock}
          onUnlock={handleUnlock}
          onDelete={handleDelete}
          onUpdateRole={handleUpdateRole}
          onSendEmail={() => onSendEmail(selectedUser)}
        /> 
      )} 
    </div> 
  ); 
}; 

export default UserManagement;