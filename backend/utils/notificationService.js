// backend/utils/notificationService.js

const db = require('../config/db');

/**
 * Creates and emits a notification.
 * Can run as part of an existing transaction if a 'client' is provided.
 * @param {object} req - The Express request object.
 * @param {string} actionType - The type of notification action.
 * @param {object} locationObject - The location data payload.
 * @param {object} [targetUser=null] - The specific user to notify.
 * @param {object} [client=null] - An existing pg client for transactions.
 * @returns {Promise<object|null>} The created notification object or null on failure.
 */
// In backend/utils/notificationService.js

async function createAndEmitNotification(req, actionType, locationObject, targetUser = null, client = null) {
    const io = req.app.get('socketio');
    const actor = req.user;
    const dbClient = client || db;

    // Safety check for the actor. If no user is on the request, we can't proceed.
    if (!actor || !actor.id) {
        console.error('[Notification Service] Error: Cannot create notification without a valid actor (req.user).');
        return null;
    }

    const locationId = locationObject?.id || null;
    const locationName = locationObject?.name || 'a submission';

    try {
        let newNotification;
        let result;

        if (targetUser && targetUser.id !== actor.id) {
            // TARGETED notification (e.g., approval, rejection)
            const recipientId = targetUser.id;
            result = await dbClient.query(
                `INSERT INTO notifications (action_type, actor_user_id, recipient_user_id, location_id, location_name, changes) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [actionType, actor.id, recipientId, locationId, locationName, JSON.stringify(locationObject)]
            );
            newNotification = result.rows[0];

            const notificationForTarget = {
                ...newNotification,
                isTargeted: true,
                actorName: actor.full_name,
                isSeen: false,
            };
            io.to(`user_${recipientId}`).emit('new_notification', notificationForTarget);
            console.log(`Sent targeted '${actionType}' notification to user ${targetUser.name || `ID: ${targetUser.id}`}`);

        } else {
            // BROADCAST notification
            result = await dbClient.query(
                `INSERT INTO notifications (action_type, actor_user_id, location_id, location_name) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [actionType, actor.id, locationId, locationName]
            );
            newNotification = result.rows[0];

            const notificationForBroadcast = {
                ...newNotification,
                isTargeted: false,
                actorName: actor.full_name,
                isSeen: false,
            };
            
            const allSockets = await io.fetchSockets();
            
            // --- THIS IS THE CRITICAL FIX ---
            // We loop through all connected sockets and send a notification ONLY if they are authenticated.
            allSockets.forEach(socket => {
                // SAFETY CHECK: Ensure the socket has a user object before trying to access its properties.
                if (socket.request.user && socket.request.user.id !== actor.id) {
                    socket.emit('new_notification', notificationForBroadcast);
                }
            });
            // --- END OF FIX ---
            
            console.log(`Broadcasted general notification for action '${actionType}' by '${actor.full_name}'`);
        }
        return newNotification;
    } catch (error) {
        console.error(`Error during notification creation:`, error);
        return null;
    }
}

module.exports = { createAndEmitNotification };