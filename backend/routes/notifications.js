const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET: Fetch all uncleared notifications for the currently logged-in user
// backend/routes/notifications.js

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await db.query(
      `SELECT 
         n.id,
         n.action_type,
         n.location_id,
         n.location_name,
         n.created_at,
         n.actor_user_id,
         (n.recipient_user_id IS NOT NULL) AS "isTargeted",
         u.full_name AS "actorName",
         COALESCE(un.is_seen, FALSE) AS "isSeen"
       FROM notifications n
       JOIN users u ON n.actor_user_id = u.id
       LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = $1
       WHERE
         (n.recipient_user_id = $1 OR n.recipient_user_id IS NULL)
         AND n.actor_user_id != $1 -- Don't show users their own actions
         AND COALESCE(un.is_cleared, FALSE) = FALSE
       ORDER BY n.created_at DESC
       LIMIT 30`,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error while fetching notifications' });
  }
});

// POST: Mark a list of notifications as "seen" for the current user
router.post('/seen', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { notificationIds } = req.body; // Expects an array of notification IDs from the client

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ message: 'notificationIds must be a non-empty array.' });
  }

  try {
    // We use a transaction to ensure all updates succeed or none do.
    await db.query('BEGIN');
    
    // This is an "UPSERT" operation for each ID.
    // If a row for this user/notification combo exists, it updates `is_seen` to true.
    // If it doesn't exist, it inserts a new row with `is_seen` as true.
    const queries = notificationIds.map(id => {
      return db.query(
        `INSERT INTO user_notifications (user_id, notification_id, is_seen)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (user_id, notification_id)
         DO UPDATE SET is_seen = TRUE`,
        [userId, id]
      );
    });

    await Promise.all(queries);
    await db.query('COMMIT');
    
    res.status(200).json({ message: 'Notifications successfully marked as seen.' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error marking notifications as seen:', error);
    res.status(500).json({ message: 'Internal server error while marking notifications as seen' });
  }
});

// POST: Mark ALL notifications as "cleared" for the current user
router.post('/clear', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // This is a more advanced UPSERT that finds all existing notification IDs
    // and inserts/updates a `user_notifications` record for each one, setting `is_cleared` to true.
    // This effectively hides all past and present notifications from the user's view.
    await db.query(
      `INSERT INTO user_notifications (user_id, notification_id, is_cleared)
       SELECT $1, id, TRUE FROM notifications
       ON CONFLICT (user_id, notification_id)
       DO UPDATE SET is_cleared = TRUE`,
      [userId]
    );
    res.status(200).json({ message: 'All notifications have been cleared.' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Internal server error while clearing notifications' });
  }
});

module.exports = router;