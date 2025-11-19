// backend/routes/supervisor.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getClient } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { createAndEmitNotification } = require('../utils/notificationService');
const { getCompleteLocationData, logHistory, getFileTableName } = require('../utils/locationHelpers');
const fs = require('fs').promises;
const path = require('path');


const authorizeSupervisorOrAdmin = (req, res, next) => {
  const userRole = req.user.role?.toLowerCase();
  if (userRole !== 'supervisor' && userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Supervisor or Admin access is required.' });
  }
  next();
};


router.get('/download-pending-file/:filename', [authenticateToken, authorizeSupervisorOrAdmin], async (req, res) => {
    const { filename } = req.params; 
    const { originalname } = req.query;

    console.log(`[Supervisor Download] Attempting to download: ${filename}`);

    // Create an absolute path to your 'uploads' folder
    const uploadsDirectory = path.resolve(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDirectory, filename);

    // Security: Prevent access to files outside the uploads directory
    if (!filePath.startsWith(uploadsDirectory)) {
        console.error(`[Supervisor Download] Forbidden attempt to access path outside of uploads directory: ${filePath}`);
        return res.status(403).json({ message: "Forbidden: Access denied." });
    }
    
    console.log(`[Supervisor Download] Seeking file at absolute path: ${filePath}`);

    try {
        // Check if the file exists
        await fs.access(filePath);
        console.log(`[Supervisor Download] File found. Initiating download.`);

        // Use res.download() to force download and set correct headers
        res.download(filePath, originalname || filename, (err) => {
            if (err) {
                console.error(`[Supervisor Download] Error during file stream for ${filePath}:`, err);
            }
        });

    } catch (error) {
        console.error(`[Supervisor Download] FAILED: File not found at path: ${filePath}.`);
        res.status(404).json({ message: 'File not found.' });
    }
});

router.get('/pending-location-actions', [authenticateToken, authorizeSupervisorOrAdmin], async (req, res) => {
    try {
        const result = await db.query(`
            SELECT pa.*, u.full_name as username, u.id as user_id
            FROM pending_actions pa
            JOIN users u ON pa.requested_by = u.id
            WHERE pa.status = 'pending'
            ORDER BY pa.created_at ASC
        `);

        const requests = await Promise.all(result.rows.map(async (row) => {
            const payload = row.payload;
            const actionType = row.action_type;
            let locationData;

            if (actionType === 'create') {
                locationData = payload;
            } else {
                if (row.location_id) {
                    const existingLocation = await getCompleteLocationData(row.location_id);
                    locationData = { ...existingLocation, ...payload };
                } else {
                    locationData = payload;
                }
            }
            
            return {
                id: row.id,
                type: actionType === 'create' ? 'ADD' : (actionType === 'update' ? 'EDIT' : 'DELETE'),
                locationData: locationData,
                changes: payload.changes,
                requestedBy: {
                    id: row.user_id,
                    username: row.username,
                },
                createdAt: row.created_at,
            };
        }));

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Error fetching pending actions for supervisor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// // ✅ --- THIS IS THE FULLY CORRECTED AND COMPLETE ROUTE --- ✅
// router.post('/handle-location-action/:requestId', [authenticateToken, authorizeSupervisorOrAdmin], async (req, res) => {
//     const { requestId } = req.params;
//     const { action, reason } = req.body; // Now correctly reads both 'action' and 'reason'
//     const approverUserId = req.user.id; 

//     const client = await getClient();

//     try {
//         await client.query('BEGIN');
//         const pendingResult = await client.query(
//             `SELECT pa.*, u.full_name as requester_name
//              FROM pending_actions pa
//              JOIN users u ON pa.requested_by = u.id
//              WHERE pa.id = $1 AND pa.status = 'pending' FOR UPDATE`, // Added status check
//             [requestId]
//         );

//         if (pendingResult.rows.length === 0) {
//             await client.query('ROLLBACK');
//             return res.status(404).json({ message: 'Pending action not found or has already been processed.' });
//         }

//         const pendingAction = pendingResult.rows[0];
//         const payload = pendingAction.payload;
//         const originalRequester = {
//             id: pendingAction.requested_by,
//             name: pendingAction.requester_name || 'a user'
//         };

//         if (action === 'approve') {
//             // --- APPROVAL LOGIC ---
//             if (pendingAction.action_type === 'create') {
//                 const { name, owners, boundaryCoords, files, ...otherData } = payload;
//                 const result = await client.query(
//                     `INSERT INTO locationss (name, address, description, city, country, owners, license_status, boundary_coords, gush_num, gush_suffix, parcel_num, legal_area, created_by, updated_by, parent_house, property_type) 
//                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
//                     [name, otherData.address, otherData.description, otherData.city, otherData.country, JSON.stringify(owners), otherData.license_status, JSON.stringify(boundaryCoords), otherData.gush_num, otherData.gush_suffix, otherData.parcel_num, otherData.legal_area, originalRequester.id, approverUserId, otherData.parent_house, otherData.property_type]
//                 );
//                 const newLocationId = result.rows[0].id;

//                 if (files && files.length > 0) {
//                     for (const file of files) {
//                         const tableName = getFileTableName(file.fieldname);
//                         if (tableName) {
//                             await client.query(
//                                 `INSERT INTO ${tableName} (location_id, file_name, file_url, file_type, file_size) VALUES ($1, $2, $3, $4, $5)`,
//                                 [newLocationId, file.originalname, `/uploads/${file.filename}`, file.file_extension, file.size]
//                             );
//                         }
//                     }
//                 }
//                 await logHistory(newLocationId, approverUserId, 'created_by_approval', { requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name }, client);
//                 const completeLocation = await getCompleteLocationData(newLocationId, client);
//                 await createAndEmitNotification(req, 'location_created', completeLocation, originalRequester, client);

//             } else if (pendingAction.action_type === 'update') {
//                 // ... update logic as before ...
//                 const locationId = pendingAction.location_id;
//                 await logHistory(locationId, approverUserId, 'updated_by_approval', { changes: payload.changes, requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name }, client);
//                 const completeLocation = await getCompleteLocationData(locationId, client);
//                 await createAndEmitNotification(req, 'location_updated', completeLocation, originalRequester, client);

//             } else if (pendingAction.action_type === 'delete') {
//                 // ... delete logic as before ...
//                 const locationId = pendingAction.location_id;
//                 const oldLocation = await getCompleteLocationData(locationId, client) || { id: locationId, name: payload.locationName || 'Unknown' };
//                 await logHistory(locationId, approverUserId, 'deleted_by_approval', { requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name, deleted_data: oldLocation }, client);
//                 await createAndEmitNotification(req, 'location_deleted', { id: oldLocation.id, name: oldLocation.name }, originalRequester, client);
//             }
//             // Update the status to 'approved'
//             await client.query(`UPDATE pending_actions SET status = 'approved', processed_at = NOW(), processed_by = $1 WHERE id = $2`, [approverUserId, requestId]);

//         } else if (action === 'reject') {
//             // --- REJECTION LOGIC (WAS MISSING) ---
//             if (!reason || !reason.trim()) {
//                 await client.query('ROLLBACK');
//                 return res.status(400).json({ message: 'A reason is required for rejection.' });
//             }
            
//             // Update the status to 'rejected' and store the reason
//             await client.query(`UPDATE pending_actions SET status = 'rejected', rejection_reason = $1, processed_at = NOW(), processed_by = $2 WHERE id = $3`, [reason, approverUserId, requestId]);
            
//             // Create and send the rejection notification
//             const targetLocationName = pendingAction.payload.name || (pendingAction.location_id ? (await getCompleteLocationData(pendingAction.location_id, client))?.name : null) || 'a submission';
//             const notificationPayload = { id: pendingAction.location_id, name: targetLocationName, reason: reason };
//             await createAndEmitNotification(req, `location_${pendingAction.action_type}_rejected`, notificationPayload, originalRequester, client);
//         }
        
//         await client.query('COMMIT');

//         res.status(200).json({ message: `Request successfully ${action}d.` });

//     } catch (error) {
//         if (client) await client.query('ROLLBACK');
//         console.error(`Transaction failed for request ${requestId}:`, error);
//         res.status(500).json({ message: 'An internal server error occurred during the transaction.' });
//     } finally {
//         if (client) client.release();
//     }
// });


router.post('/handle-location-action/:requestId', [authenticateToken, authorizeSupervisorOrAdmin], async (req, res) => {
    const { requestId } = req.params;
    const { action, reason } = req.body;
    const approverUserId = req.user.id; 

    const client = await getClient();

    try {
        await client.query('BEGIN');
        const pendingResult = await client.query(
            `SELECT pa.*, u.full_name as requester_name
             FROM pending_actions pa
             JOIN users u ON pa.requested_by = u.id
             WHERE pa.id = $1 AND pa.status = 'pending' FOR UPDATE`,
            [requestId]
        );

        if (pendingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Pending action not found or has already been processed.' });
        }

        const pendingAction = pendingResult.rows[0];
        const payload = pendingAction.payload;
        const originalRequester = {
            id: pendingAction.requested_by,
            name: pendingAction.requester_name || 'a user'
        };

        if (action === 'approve') {
            if (pendingAction.action_type === 'create') {
                const { name, owners, boundaryCoords, files, ...otherData } = payload;
                const result = await client.query(
                    `INSERT INTO locationss (name, address, description, city, country, owners, license_status, boundary_coords, gush_num, gush_suffix, parcel_num, legal_area, created_by, updated_by, parent_house, property_type) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
                    [name, otherData.address, otherData.description, otherData.city, otherData.country, JSON.stringify(owners), otherData.license_status, JSON.stringify(boundaryCoords), otherData.gush_num, otherData.gush_suffix, otherData.parcel_num, otherData.legal_area, originalRequester.id, approverUserId, otherData.parent_house, otherData.property_type]
                );
                const newLocationId = result.rows[0].id;

                if (files && files.length > 0) {
                    for (const file of files) {
                        const tableName = getFileTableName(file.fieldname);
                        if (tableName) {
                            await client.query(
                                `INSERT INTO ${tableName} (location_id, file_name, file_url, file_type, file_size) VALUES ($1, $2, $3, $4, $5)`,
                                [newLocationId, file.originalname, `/uploads/${file.filename}`, file.file_extension, file.size]
                            );
                        }
                    }
                }
                await logHistory(newLocationId, approverUserId, 'created_by_approval', { requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name }, client);
                const completeLocation = await getCompleteLocationData(newLocationId, client);
                // Notification changed to broadcast
                await createAndEmitNotification(req, 'location_created', completeLocation, null, client);

            } else if (pendingAction.action_type === 'update') {
                // --- THIS IS THE RESTORED UPDATE LOGIC ---
                const locationId = pendingAction.location_id;
                const { name, address, description, city, country, owners, license_status, property_type } = payload;
                
                // Update main location data
                await client.query(
                    `UPDATE locationss SET name=$1, address=$2, description=$3, city=$4, country=$5, owners=$6, license_status=$7, property_type=$8, updated_by=$9, updated_at=NOW() WHERE id=$10`,
                    [name, address, description, city, country, JSON.stringify(owners), license_status, property_type, approverUserId, locationId]
                );

                // Handle file changes (additions/deletions) if they exist in the payload
                if (payload.files && payload.files.length > 0) {
                    for (const file of payload.files) {
                        const tableName = getFileTableName(file.fieldname);
                        if (tableName) {
                            await client.query(`INSERT INTO ${tableName} (location_id, file_name, file_url, file_type, file_size) VALUES ($1, $2, $3, $4, $5)`,
                                [locationId, file.originalname, `/uploads/${file.filename}`, file.mimetype, file.size]);
                        }
                    }
                }
                if (payload.filesToDelete) {
                    for (const fileType in payload.filesToDelete) {
                        const idsToDelete = payload.filesToDelete[fileType];
                        if (idsToDelete && idsToDelete.length > 0) {
                            const tableName = getFileTableName(fileType);
                            if (tableName) {
                                await client.query(`DELETE FROM ${tableName} WHERE id = ANY($1::int[]) AND location_id = $2`, [idsToDelete, locationId]);
                            }
                        }
                    }
                }
                
                await logHistory(locationId, approverUserId, 'updated_by_approval', { changes: payload.changes, requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name }, client);
                const completeLocation = await getCompleteLocationData(locationId, client);
                // Notification changed to broadcast
                await createAndEmitNotification(req, 'location_updated', completeLocation, null, client);

            } else if (pendingAction.action_type === 'delete') {
                const locationId = pendingAction.location_id;

                // First, check for child properties before deleting
                const childrenCheck = await client.query('SELECT id FROM locationss WHERE parent_house = $1', [locationId]);
                if (childrenCheck.rows.length > 0) {
                    await client.query('ROLLBACK');
                    return res.status(409).json({ 
                        message: 'Deletion failed: This property is a parent to other split properties. Please delete them first.',
                        children: childrenCheck.rows
                    });
                }
                
                const oldLocation = await getCompleteLocationData(locationId, client) || { id: locationId, name: payload.locationName || 'Unknown' };
                await client.query('DELETE FROM locationss WHERE id = $1', [locationId]);
                await logHistory(locationId, approverUserId, 'deleted_by_approval', { requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name, deleted_data: oldLocation }, client);
                // Notification changed to broadcast
                await createAndEmitNotification(req, 'location_deleted', { id: oldLocation.id, name: oldLocation.name }, null, client);
            }

            // Mark the action as approved
            await client.query(`UPDATE pending_actions SET status = 'approved', processed_at = NOW(), processed_by = $1 WHERE id = $2`, [approverUserId, requestId]);

        } else if (action === 'reject') {
            // ... (rejection logic remains the same) ...
            if (!reason || !reason.trim()) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'A reason is required for rejection.' });
            }
            
            await client.query(`UPDATE pending_actions SET status = 'rejected', rejection_reason = $1, processed_at = NOW(), processed_by = $2 WHERE id = $3`, [reason, approverUserId, requestId]);
            
            const targetLocationName = payload.name || (pendingAction.location_id ? (await getCompleteLocationData(pendingAction.location_id, client))?.name : 'a submission');
            const notificationPayload = { id: pendingAction.location_id, name: targetLocationName, reason: reason };
            await createAndEmitNotification(req, `location_${pendingAction.action_type}_rejected`, notificationPayload, originalRequester, client);
        }
        
        await client.query('COMMIT');
        res.status(200).json({ message: `Request successfully ${action}d.` });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error(`Transaction failed for request ${requestId}:`, error);
        res.status(500).json({ message: 'An internal server error occurred during the transaction.' });
    } finally {
        if (client) client.release();
    }
});


module.exports = router;