// backend/routes/admin.js

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const db = require('../config/db');
const emailService = require('../services/emailService');
const { createAndEmitNotification } = require('../utils/notificationService');
const _ = require('lodash');
const { getCompleteLocationData, logHistory, getFileTableName, decodeFilename } = require('../utils/locationHelpers');
const { getClient } = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

router.get('/download-pending-file/:filename', [authenticateToken, authorizeAdmin], async (req, res) => {
    // The filename from the URL is automatically decoded by Express
    const { filename } = req.params; 
    const { originalname } = req.query;

    console.log(`[Download] Attempting to download file.`);
    console.log(`[Download] Received filename param: ${filename}`);
    console.log(`[Download] Received originalname query: ${originalname}`);

    // --- Robust Path Construction ---
    // This creates an absolute path to your 'uploads' folder, assuming it's
    // in your project's root directory (a sibling to the 'backend' folder).
    const uploadsDirectory = path.resolve(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDirectory, filename);

    // Security: Ensure the final resolved path is still within the uploads directory.
    if (!filePath.startsWith(uploadsDirectory)) {
        console.error(`[Download] Forbidden attempt to access path outside of uploads directory: ${filePath}`);
        return res.status(403).json({ message: "Forbidden: Access denied." });
    }
    
    console.log(`[Download] Constructed absolute file path: ${filePath}`);

    try {
        // Check if the file exists at the constructed path.
        await fs.access(filePath);
        console.log(`[Download] SUCCESS: File found at path. Initiating download.`);

        // Use res.download() to force download. It sets the correct headers.
        // The second argument sets the name the user sees in the download prompt.
        res.download(filePath, originalname || filename, (err) => {
            if (err) {
                // This error handler is for issues during the file stream itself.
                console.error(`[Download] Error during file stream for ${filePath}:`, err);
            }
        });

    } catch (error) {
        // fs.access will throw an error if the file doesn't exist, which we catch here.
        console.error(`[Download] FAILED: File not found at path: ${filePath}.`);
        res.status(404).json({ message: 'File not found. Please check the filename and path.' });
    }
});
// --- FULLY UPDATED /api/admin/users ROUTE ---
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // --- Main Data Query ---
    let query = `
      SELECT 
        id, full_name, email, status, role, created_at, 
        last_login, login_count, is_locked, lock_reason
      FROM users
    `;
    let params = [];
    let whereClauses = [];

    // Filter by status (e.g., 'approved', 'pending')
    if (req.query.status && req.query.status !== 'all') {
      params.push(req.query.status);
      whereClauses.push(`status = $${params.length}`);
    }

    // Filter by locked status (e.g., is_locked=true)
    if (req.query.is_locked === 'true') {
      whereClauses.push(`is_locked = true`);
    }

    // Filter by search term
    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      whereClauses.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    
    // Combine all filter clauses into the query
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    // Handle pagination
    if (req.query.limit) {
      params.push(parseInt(req.query.limit));
      query += ` LIMIT $${params.length}`;
      
      if (req.query.offset) {
        params.push(parseInt(req.query.offset));
        query += ` OFFSET $${params.length}`;
      }
    }
    
    // Execute the main data query
    const { rows } = await db.query(query, params);
    
    // --- Total Count Query (for pagination) ---
    // This query must mirror the filtering of the main query
    let countQuery = 'SELECT COUNT(*) FROM users';
    let countParams = [];
    let countWhereClauses = [];

    if (req.query.status && req.query.status !== 'all') {
      countParams.push(req.query.status);
      countWhereClauses.push(`status = $${countParams.length}`);
    }
    if (req.query.is_locked === 'true') {
      countWhereClauses.push(`is_locked = true`);
    }
    if (req.query.search) {
      countParams.push(`%${req.query.search}%`);
      countWhereClauses.push(`(full_name ILIKE $${countParams.length} OR email ILIKE $${countParams.length})`);
    }

    if (countWhereClauses.length > 0) {
      countQuery += ' WHERE ' + countWhereClauses.join(' AND ');
    }

    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // --- Final Response ---
    res.json({ 
      users: rows, 
      pagination: {
        total: totalCount,
        limit: req.query.limit ? parseInt(req.query.limit) : null,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      }
    });
  } catch (err) {
    console.error('Server error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Add the 'role' column to the SELECT statement
    const userResult = await db.query(
      `SELECT 
        id, full_name, email, status, role, created_at, 
        last_login, login_count, is_locked, lock_reason, admin_notes
      FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    // ... (the rest of the function remains the same)
    const permissionsResult = await db.query('SELECT * FROM user_permissions WHERE user_id = $1', [id]);
    const loginAttemptsResult = await db.query(`SELECT ip_address, user_agent, success, attempted_at FROM login_attempts WHERE user_id = $1 ORDER BY attempted_at DESC LIMIT 20`, [id]);
    const adminActionsResult = await db.query(
      `SELECT aa.action_type, aa.description, aa.created_at, u.full_name as admin_name, u.email as admin_email
       FROM admin_actions aa
       LEFT JOIN users u ON aa.admin_id = u.id
       WHERE aa.target_type = 'user' AND aa.target_id = $1
       ORDER BY aa.created_at DESC 
       LIMIT 20`,
      [id]
    );

    res.json({
      user: userResult.rows[0],
      permissions: permissionsResult.rows[0] || {},
      loginAttempts: loginAttemptsResult.rows,
      adminActions: adminActionsResult.rows
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/update-user-role/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const adminId = req.user.id;

  // Basic validation
  if (!role || !['user', 'Supervisor'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    // Check if user exists
    const userCheck = await db.query('SELECT id, email, role FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userCheck.rows[0];
    
    // Prevent changing your own role or changing role to 'admin'
    if (user.id === adminId) {
      return res.status(403).json({ message: 'You cannot change your own role.' });
    }

    // Update the user's role in the database
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, role',
      [role, id]
    );

    // Log the admin action
    await db.query(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [adminId, 'update_role', 'user', id, `Changed role for ${user.email} from '${user.role}' to '${role}'`, req.ip, req.get('User-Agent')]
    );
    
    res.json({ message: 'User role updated successfully!', user: result.rows[0] });

  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// This one you already have, it's here for completeness
router.post('/approve-user/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  const { sendEmail } = req.body;
  try {
    const userCheck = await db.query('SELECT id, status, full_name, email FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    if (userCheck.rows[0].status !== 'pending') return res.status(400).json({ message: 'User is not pending approval.' });
    const result = await db.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING id, full_name, email', ['approved', id]);
    try {
        console.log(`[Admin Action] Preparing to log 'approve_user' for user ID: ${id}`);
        await db.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminId, 'approve_user', 'user', id, `Approved user: ${result.rows[0].email}`, req.ip, req.get('User-Agent')]);
        console.log(`[Admin Action] SUCCESS: Logged 'approve_user' action.`);
    } catch (dbError) { console.error(`[Admin Action] FAILED to insert 'approve_user' action:`, dbError); }
    if (sendEmail) { try { await emailService.sendApprovalNotification(result.rows[0]); } catch (emailError) { console.error('Failed to send approval email:', emailError); } }
    res.json({ message: 'User approved successfully!', user: result.rows[0], emailSent: sendEmail || false });
  } catch (err) { console.error('Error in /approve-user route:', err); res.status(500).json({ message: 'Server error' }); }
});

// --- ADD LOGGING TO THIS ROUTE ---
router.post('/reject-user/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason, sendEmail } = req.body;
  const adminId = req.user.id;
  try {
    const userCheck = await db.query('SELECT id, status, full_name, email FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    if (userCheck.rows[0].status !== 'pending') return res.status(400).json({ message: 'User is not pending approval.' });
    const result = await db.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING id, full_name, email', ['rejected', id]);
    try {
        console.log(`[Admin Action] Preparing to log 'reject_user' for user ID: ${id}`);
        await db.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminId, 'reject_user', 'user', id, `Rejected user: ${result.rows[0].email}. Reason: ${reason || 'No reason provided'}`, req.ip, req.get('User-Agent')]);
        console.log(`[Admin Action] SUCCESS: Logged 'reject_user' action.`);
    } catch (dbError) { console.error(`[Admin Action] FAILED to insert 'reject_user' action:`, dbError); }
    if (sendEmail) { try { await emailService.sendRejectionNotification(result.rows[0], reason); } catch (emailError) { console.error('Failed to send rejection email:', emailError); } }
    res.json({ message: 'User rejected successfully!', user: result.rows[0], emailSent: sendEmail || false });
  } catch (err) { console.error('Error in /reject-user route:', err); res.status(500).json({ message: 'Server error' }); }
});

// --- ADD LOGGING TO THIS ROUTE ---


// backend/routes/admin.js

router.post('/send-email', authenticateToken, authorizeAdmin, async (req, res) => {
  const { userId, subject, message } = req.body;
  const adminId = req.user.id;
  try {
    const userResult = await db.query('SELECT id, full_name, email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = userResult.rows[0];
    await emailService.sendCustomNotification(user, subject, message);
    await db.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminId, 'send_email', 'user', userId, `Sent email to: ${user.email} with subject: ${subject}`, req.ip, req.get('User-Agent')]);
    res.json({ message: 'Email sent successfully', email: user.email });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ message: 'Error sending email' });
  }
});

router.post('/lock-user/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminId = req.user.id;
  try {
    const userCheck = await db.query('SELECT id, full_name, email, is_locked FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    if (userCheck.rows[0].is_locked) return res.status(400).json({ message: 'User is already locked.' });
    const result = await db.query('UPDATE users SET is_locked = true, lock_reason = $1 WHERE id = $2 RETURNING id, full_name, email', [reason, id]);
    try {
        console.log(`[Admin Action] Preparing to log 'lock_user' for user ID: ${id}`);
        await db.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminId, 'lock_user', 'user', id, `Locked user: ${result.rows[0].email}. Reason: ${reason || 'No reason provided'}`, req.ip, req.get('User-Agent')]);
        console.log(`[Admin Action] SUCCESS: Logged 'lock_user' action.`);
    } catch (dbError) { console.error(`[Admin Action] FAILED to insert 'lock_user' action:`, dbError); }
    res.json({ message: 'User locked successfully!', user: result.rows[0] });
  } catch (err) { console.error('Error in /lock-user route:', err); res.status(500).json({ message: 'Server error' }); }
});
router.post('/unlock-user/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  try {
    const userCheck = await db.query('SELECT id, full_name, email, is_locked FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    if (!userCheck.rows[0].is_locked) return res.status(400).json({ message: 'User is not locked.' });
    const result = await db.query('UPDATE users SET is_locked = false, lock_reason = NULL WHERE id = $1 RETURNING id, full_name, email', [id]);
    await db.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminId, 'unlock_user', 'user', id, `Unlocked user: ${result.rows[0].email}`, req.ip, req.get('User-Agent')]);
    res.json({ message: 'User unlocked successfully!', user: result.rows[0] });
  } catch (err) {
    console.error('Error unlocking user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/update-user-permissions/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;
  const adminId = req.user.id;
  try {
    const userCheck = await db.query('SELECT id, full_name, email FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    const existingPermissions = await db.query('SELECT id FROM user_permissions WHERE user_id = $1', [id]);
    let result;
    if (existingPermissions.rows.length > 0) {
      result = await db.query(`UPDATE user_permissions SET can_manage_users = $1, can_manage_locations = $2, can_manage_content = $3, can_view_reports = $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5 RETURNING *`, [permissions.can_manage_users || false, permissions.can_manage_locations || false, permissions.can_manage_content || false, permissions.can_view_reports || false, id]);
    } else {
      result = await db.query(`INSERT INTO user_permissions (user_id, can_manage_users, can_manage_locations, can_manage_content, can_view_reports) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [id, permissions.can_manage_users || false, permissions.can_manage_locations || false, permissions.can_manage_content || false, permissions.can_view_reports || false]);
    }
    await db.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminId, 'update_permissions', 'user', id, `Updated permissions for user: ${userCheck.rows[0].email}`, req.ip, req.get('User-Agent')]);
    res.json({ message: 'User permissions updated successfully!', permissions: result.rows[0] });
  } catch (err) {
    console.error('Error updating user permissions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- NEW ROUTE FOR DELETING A USER ---
router.delete('/user/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const userCheck = await client.query('SELECT email FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found.' });
    }
    const userEmail = userCheck.rows[0].email;

    // Delete related data first to avoid foreign key violations
    await client.query('DELETE FROM user_permissions WHERE user_id = $1', [id]);
    await client.query('DELETE FROM login_attempts WHERE user_id = $1', [id]);

    // Delete the user
    const result = await client.query('DELETE FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found during deletion.' });
    }

    // Log the admin action
    await client.query(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [adminId, 'delete_user', 'user', id, `Deleted user: ${userEmail}`, req.ip, req.get('User-Agent')]
    );

    await client.query('COMMIT');

    res.json({ message: `User ${userEmail} deleted successfully!` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});


router.post('/update-user-notes/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const adminId = req.user.id;
  try {
    const userCheck = await db.query('SELECT id, full_name, email FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    const result = await db.query('UPDATE users SET admin_notes = $1 WHERE id = $2 RETURNING id, full_name, email, admin_notes', [notes, id]);
    await db.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminId, 'update_notes', 'user', id, `Updated admin notes for user: ${userCheck.rows[0].email}`, req.ip, req.get('User-Agent')]);
    res.json({ message: 'User notes updated successfully!', user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user notes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// In your backend/routes/admin.js file, replace the entire /stats route

// In backend/routes/admin.js

// In backend/routes/admin.js

// In backend/routes/admin.js
// --- FINAL, ROBUST /stats ROUTE ---
router.get('/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // --- Define a clear date range in JavaScript ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [
      totalUsersCount, pendingUsersCount, approvedCount, rejectedCount, lockedCount,
      approvedToday, rejectedToday, totalLogins, activeToday, adminActionsToday,
      pendingLocationActionsCount
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM users WHERE status = $1', ['pending']),
      db.query('SELECT COUNT(*) FROM users WHERE status = $1', ['approved']),
      db.query('SELECT COUNT(*) FROM users WHERE status = $1', ['rejected']),
      db.query('SELECT COUNT(*) FROM users WHERE is_locked = true'),
      db.query('SELECT COUNT(*) FROM users WHERE status = $1 AND created_at >= $2', ['approved', todayStart]),
      db.query('SELECT COUNT(*) FROM users WHERE status = $1 AND created_at >= $2', ['rejected', todayStart]),
      db.query('SELECT COALESCE(SUM(login_count), 0) as total_logins FROM users'),
      // --- NEW, SIMPLER QUERY LOGIC FOR THE COUNT ---
      db.query(
        `SELECT COUNT(DISTINCT user_id) as active_today 
         FROM login_attempts 
         WHERE success = true AND attempted_at >= $1 AND attempted_at < $2`,
        [todayStart, tomorrowStart]
      ),
      db.query('SELECT COUNT(*) as actions_today FROM admin_actions WHERE created_at >= $1', [todayStart]),
      db.query(`SELECT COUNT(*) FROM pending_actions WHERE status = 'pending'`)
    ]);

    const totalPendingUsers = parseInt(pendingUsersCount.rows[0].count);
    const totalPendingLocations = parseInt(pendingLocationActionsCount.rows[0].count);

    res.json({
      users: {
        total: parseInt(totalUsersCount.rows[0].count),
        totalPending: totalPendingUsers,
        totalApproved: parseInt(approvedCount.rows[0].count),
        totalRejected: parseInt(rejectedCount.rows[0].count),
        totalLocked: parseInt(lockedCount.rows[0].count),
        approvedToday: parseInt(approvedToday.rows[0].count),
        rejectedToday: parseInt(rejectedToday.rows[0].count)
      },
      activity: {
        totalLogins: parseInt(totalLogins.rows[0].total_logins) || 0,
        activeToday: parseInt(activeToday.rows[0].active_today) || 0,
        adminActionsToday: parseInt(adminActionsToday.rows[0].actions_today) || 0
      },
      summary: {
          totalPendingActions: totalPendingUsers + totalPendingLocations
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all-pending-actions', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        // Query 1: Get pending users
        const pendingUsersQuery = db.query(`
            SELECT id, full_name, email, created_at
            FROM users 
            WHERE status = 'pending'
        `);

        // Query 2: Get pending location actions
        const pendingLocationsQuery = db.query(`
            SELECT pa.id, pa.action_type, pa.payload, pa.created_at, u.full_name as requested_by
            FROM pending_actions pa
            JOIN users u ON pa.requested_by = u.id
            WHERE pa.status = 'pending'
        `);

        // Run both queries in parallel for efficiency
        const [pendingUsersResult, pendingLocationsResult] = await Promise.all([
            pendingUsersQuery,
            pendingLocationsQuery
        ]);

        // Format user data into the standard format the frontend expects
        const formattedUsers = pendingUsersResult.rows.map(user => ({
            id: `user-${user.id}`,
            type: 'New User Registration',
            title: user.full_name || user.email,
            description: `Awaiting approval for new user account.`,
            date: user.created_at,
            requester: 'System (User Signup)'
        }));

        // Format location data into the standard format
        const formattedLocations = pendingLocationsResult.rows.map(loc => ({
            id: `location-${loc.id}`,
            type: `Location ${loc.action_type.charAt(0).toUpperCase() + loc.action_type.slice(1)}`,
            title: loc.payload.name || `Location ID: ${loc.payload.id || 'N/A'}`,
            description: `Awaiting approval for a location ${loc.action_type}.`,
            date: loc.created_at,
            requester: loc.requested_by
        }));

        // Combine both arrays and sort the final list by the most recent date
        const allActions = [...formattedUsers, ...formattedLocations]
            .sort((a, b) => new Date(b.date) - new Date(a.date)); 

        res.json(allActions);

    } catch (err) {
        console.error('Error fetching all pending actions:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Add this new route to backend/routes/admin.js

// --- IMPROVED /api/admin/logins ROUTE ---
// In backend/routes/admin.js
// --- FINAL, ROBUST /logins ROUTE ---
router.get('/logins', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        let query;
        let params = [];
        
        // This part for "Active Today" already works correctly.
        if (req.query.date_range === 'today') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const tomorrowStart = new Date(todayStart);
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);
            params = [todayStart, tomorrowStart];
            
            query = `
                SELECT DISTINCT ON (la.user_id) 
                    la.id, la.success, la.ip_address, la.attempted_at, u.full_name, u.email
                FROM login_attempts la
                LEFT JOIN users u ON la.user_id = u.id
                WHERE 
                    la.success = true 
                    AND la.attempted_at >= $1 AND la.attempted_at < $2
                ORDER BY la.user_id, la.attempted_at DESC;
            `;
        } else {
             // --- FIX: This is the default case for the "Total Logins" card ---
             // It fetches the 100 most recent login attempts from the database.
             query = `
                SELECT la.id, la.success, la.ip_address, la.attempted_at, u.full_name, u.email
                FROM login_attempts la
                LEFT JOIN users u ON la.user_id = u.id
                ORDER BY la.attempted_at DESC
                LIMIT 100; 
             `;
             // No params are needed for this general query.
        }
        
        const { rows } = await db.query(query, params);
        
        // The frontend expects the response in a { logins: [...] } object.
        res.json({ logins: rows });

    } catch (err) {
        console.error('Error fetching login activity:', err);
        res.status(500).json({ message: 'Server error' });
    }
});



router.get('/recent-activities', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    let query = `
      SELECT aa.id, aa.action_type, aa.description, aa.created_at,
             u.full_name as admin_name
      FROM admin_actions aa
      LEFT JOIN users u ON aa.admin_id = u.id
    `;
    const params = [];
    const whereClauses = [];

    if (req.query.date_range === 'today') {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        params.push(today);
        whereClauses.push(`aa.created_at >= $${params.length}`);
    }
    
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY aa.created_at DESC LIMIT 50';

    const { rows } = await db.query(query, params);
    res.json({ activities: rows });
  } catch (err) {
    console.error('Server error fetching recent activities:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pending-location-actions', [authenticateToken, authorizeAdmin], async (req, res) => {
    try {
        const result = await db.query(`
            SELECT pa.*, u.full_name as username, u.id as user_id
            FROM pending_actions pa
            JOIN users u ON pa.requested_by = u.id
            WHERE pa.status = 'pending' -- Only fetch actions that need review
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
        console.error('Error fetching pending actions for admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// In backend/routes/admin.js, replace the entire /handle-location-action route

// router.post('/handle-location-action/:requestId', [authenticateToken, authorizeAdmin], async (req, res) => {
//     const { requestId } = req.params;
//     const { action, reason } = req.body;
//     const adminUserId = req.user.id;
//     const client = await getClient();

//     try {
//         await client.query('BEGIN');

//         const pendingResult = await client.query(`SELECT pa.*, u.full_name as requester_name FROM pending_actions pa JOIN users u ON pa.requested_by = u.id WHERE pa.id = $1 AND pa.status = 'pending' FOR UPDATE`, [requestId]);
        
//         if (pendingResult.rows.length === 0) {
//             await client.query('ROLLBACK');
//             return res.status(404).json({ message: 'Pending action not found or has already been processed.' });
//         }

//         const pendingAction = pendingResult.rows[0];
//         const payload = pendingAction.payload;
//         const originalRequester = { id: pendingAction.requested_by, name: pendingAction.requester_name || 'a user' };
        
//         // Helper to get a name for logging, even if it's just an ID
//         const locationNameForLog = payload.name || `ID ${pendingAction.location_id}`;

//         if (action === 'approve') {
//             let completeLocation;
//             // ... (your existing logic for create, update, delete is correct and remains unchanged) ...
//             if (pendingAction.action_type === 'create') {
//                 const { name, owners, boundaryCoords, files, ...otherData } = payload;
//                 const result = await client.query(`INSERT INTO locationss (name, address, description, city, country, owners, license_status, boundary_coords, gush_num, gush_suffix, parcel_num, legal_area, created_by, updated_by, parent_house, property_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`, [name, otherData.address, otherData.description, otherData.city, otherData.country, JSON.stringify(owners), otherData.license_status, JSON.stringify(boundaryCoords), otherData.gush_num, otherData.gush_suffix, otherData.parcel_num, otherData.legal_area, pendingAction.requested_by, adminUserId, otherData.parent_house, otherData.property_type]);
//                 const newLocationId = result.rows[0].id;
//                 if (files && files.length > 0) {
//                     for (const file of files) {
//                         const tableName = getFileTableName(file.fieldname);
//                         if (tableName) await client.query(`INSERT INTO ${tableName} (location_id, file_name, file_url, file_type, file_size) VALUES ($1, $2, $3, $4, $5)`, [newLocationId, file.originalname, `/uploads/${file.filename}`, file.file_extension || path.extname(file.originalname).substring(1).toLowerCase(), file.size]);
//                     }
//                 }
//                 await logHistory(newLocationId, adminUserId, 'created_by_approval', { requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name }, client);
//                 completeLocation = await getCompleteLocationData(newLocationId, client);
//                 await createAndEmitNotification(req, 'location_created', completeLocation, originalRequester, client);
//             } else if (pendingAction.action_type === 'update') {
//                 // ... (update logic) ...
//                 const locationId = pendingAction.location_id;
//                 const { name, owners, files, filesToDelete, ...otherData } = payload;
//                 await client.query(`UPDATE locationss SET name=$1, address=$2, description=$3, city=$4, country=$5, owners=$6, license_status=$7, updated_by=$8, updated_at=NOW() WHERE id=$9`, [name, otherData.address, otherData.description, otherData.city, otherData.country, JSON.stringify(owners), otherData.license_status, adminUserId, locationId]);
//                 if (files && files.length > 0) { for (const file of files) { const tableName = getFileTableName(file.fieldname); if (tableName) await client.query(`INSERT INTO ${tableName} (location_id, file_name, file_url, file_type, file_size) VALUES ($1, $2, $3, $4, $5)`, [locationId, file.originalname, `/uploads/${file.filename}`, file.mimetype, file.size]); } }
//                 await logHistory(locationId, adminUserId, 'updated_by_approval', { changes: payload.changes, requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name }, client);
//                 completeLocation = await getCompleteLocationData(locationId, client);
//                 await createAndEmitNotification(req, 'location_updated', completeLocation, originalRequester, client);
//             } else if (pendingAction.action_type === 'delete') {
//                 // ... (delete logic) ...
//                 const locationId = pendingAction.location_id;
//                 const oldLocation = await getCompleteLocationData(locationId, client) || { id: locationId, name: payload.locationName || 'Unknown' };
//                 const childrenCheck = await client.query('SELECT id, name FROM locationss WHERE parent_house = $1', [locationId]);
//                 if (childrenCheck.rows.length > 0) { await client.query('ROLLBACK'); return res.status(409).json({ message: 'Deletion failed: This property is a parent to other split properties. Please delete them first.', children: childrenCheck.rows }); }
//                 await client.query('DELETE FROM locationss WHERE id = $1', [locationId]);
//                 await logHistory(locationId, adminUserId, 'deleted_by_approval', { requested_by_user_id: originalRequester.id, requested_by_user_name: originalRequester.name }, client);
//                 await createAndEmitNotification(req, 'location_deleted', { id: oldLocation.id, name: oldLocation.name }, originalRequester, client);
//             }
            
//             await client.query(`UPDATE pending_actions SET status = 'approved', processed_at = NOW(), processed_by = $1 WHERE id = $2`, [adminUserId, requestId]);

//             // --- ACTION LOGGING ADDED HERE ---
//             try {
//                 const description = `Approved location '${pendingAction.action_type}' for: ${locationNameForLog}`;
//                 await client.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminUserId, `approve_location_${pendingAction.action_type}`, 'location', pendingAction.location_id, description, req.ip, req.get('User-Agent')]);
//                 console.log(`[Admin Action] SUCCESS: Logged '${description}'`);
//             } catch (dbError) {
//                 console.error(`[Admin Action] FAILED to log approved location action:`, dbError);
//             }
//             // --- END LOGGING ---

//         } else if (action === 'reject') {
//             if (!reason || !reason.trim()) {
//                 await client.query('ROLLBACK');
//                 return res.status(400).json({ message: 'A reason is required for rejection.' });
//             }
            
//             await client.query(`UPDATE pending_actions SET status = 'rejected', rejection_reason = $1, processed_at = NOW(), processed_by = $2 WHERE id = $3`, [reason, adminUserId, requestId]);
            
//             // --- ACTION LOGGING ADDED HERE ---
//             try {
//                 const description = `Rejected location '${pendingAction.action_type}' for: ${locationNameForLog}`;
//                 await client.query(`INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminUserId, `reject_location_${pendingAction.action_type}`, 'location', pendingAction.location_id, description, req.ip, req.get('User-Agent')]);
//                 console.log(`[Admin Action] SUCCESS: Logged '${description}'`);
//             } catch (dbError) {
//                 console.error(`[Admin Action] FAILED to log rejected location action:`, dbError);
//             }
//             // --- END LOGGING ---
            
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



router.post('/handle-location-action/:requestId', [authenticateToken, authorizeAdmin], async (req, res) => {
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