// import React from 'react';
// import { RefreshCw, Shield, AlertCircle, CheckCircle, XCircle, User } from 'lucide-react';

// const RecentActivities = ({ activities, error, onRefresh }) => { 
//   return ( 
//     <div> 
//       <div className="flex justify-between items-center mb-6"> 
//         <h2 className="text-xl font-semibold text-white">Recent Activities</h2> 
//         <button  
//           onClick={onRefresh} 
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-colors" 
//         > 
//           <RefreshCw className="w-4 h-4" /> 
//           Refresh 
//         </button> 
//       </div> 

//       {error && ( 
//         <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"> 
//           <div className="flex items-center"> 
//             <AlertCircle className="w-5 h-5 text-red-400 mr-3" /> 
//             <div> 
//               <h3 className="text-red-300 font-medium">Error loading activities</h3> 
//               <p className="text-red-400 text-sm">{error}</p> 
//             </div> 
//           </div> 
//         </div> 
//       )} 

//       {!error && activities.length === 0 ? ( 
//         <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"> 
//           <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" /> 
//           <h3 className="text-lg font-medium text-white mb-2">No Activities Yet</h3> 
//           <p className="text-gray-400"> 
//             Admin activities will appear here once users start getting approved, rejected, or managed. 
//           </p> 
//         </div> 
//       ) : ( 
//         <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"> 
//           <div className="divide-y divide-gray-700/50"> 
//             {activities.map((activity, index) => ( 
//               <div key={index} className="p-6 hover:bg-gray-700/30 transition-colors"> 
//                 <div className="flex items-start space-x-4"> 
//                   <div className="flex-shrink-0"> 
//                     {activity.action_type === 'user_approval' || activity.action_type === 'approve_user' ? ( 
//                       <CheckCircle className="w-5 h-5 text-green-400" /> 
//                     ) : ( 
//                       <XCircle className="w-5 h-5 text-red-400" /> 
//                     )} 
//                   </div> 
//                   <div className="flex-1 min-w-0"> 
//                     <div className="flex items-center justify-between"> 
//                       <p className="text-sm font-medium text-white capitalize"> 
//                         {activity.action_type?.replace(/_/g, ' ') || 'Unknown Action'} 
//                       </p> 
//                       <time className="text-sm text-gray-400"> 
//                         {new Date(activity.created_at).toLocaleDateString()} 
//                       </time> 
//                     </div> 
//                     {(activity.description || activity.details) && ( 
//                       <p className="text-sm text-gray-300 mt-1"> 
//                         {activity.description || activity.details} 
//                       </p> 
//                     )} 
//                     {activity.admin_name && ( 
//                       <div className="flex items-center mt-2"> 
//                         <User className="w-4 h-4 text-gray-400 mr-1" /> 
//                         <span className="text-xs text-gray-400"> 
//                           By {activity.admin_name} 
//                         </span> 
//                       </div> 
//                     )} 
//                   </div> 
//                 </div> 
//               </div> 
//             ))} 
//           </div> 
//         </div> 
//       )} 
//     </div> 
//   ); 
// }; 

// export default RecentActivities;




import React from 'react';
import { RefreshCw, Shield, AlertCircle, CheckCircle, XCircle, User } from 'lucide-react';

const RecentActivities = ({ activities, error, onRefresh }) => {
  // Helper to determine the icon and color based on the action type
  const getActivityIcon = (actionType) => {
    const typeStr = actionType || '';
    if (typeStr.includes('approve') || typeStr.includes('unlock')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (typeStr.includes('reject') || typeStr.includes('lock') || typeStr.includes('delete')) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    // Default icon for other actions like 'update_role', 'send_email', etc.
    return <User className="w-5 h-5 text-blue-500" />;
  };

  return (
    // The main container for this component uses the parent's background
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 md:p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Recent Activities
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 dark:text-red-300 font-medium">Error loading activities</h3>
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* "No Activities" Placeholder */}
      {!error && activities.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
          <Shield className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
            No Activities Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Admin actions will appear here as they are performed.
          </p>
        </div>
      ) : (
        // List of Activities
        <div className="border border-slate-200 dark:border-slate-700/80 rounded-lg overflow-hidden">
          <div className="divide-y divide-slate-200 dark:divide-slate-700/80">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize truncate" title={activity.action_type?.replace(/_/g, ' ') || 'Unknown Action'}>
                        {activity.action_type?.replace(/_/g, ' ') || 'Unknown Action'}
                      </p>
                      <time className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-4">
                        {new Date(activity.created_at).toLocaleString()}
                      </time>
                    </div>
                    {(activity.description || activity.details) && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {activity.description || activity.details}
                      </p>
                    )}
                    {activity.admin_name && (
                      <div className="flex items-center mt-2 text-slate-500 dark:text-slate-400">
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs">
                          By {activity.admin_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;