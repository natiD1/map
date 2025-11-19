

// middleware/auth.js

const jwt = require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ 
        message: 'Invalid or expired token.' 
      });
    }
    req.user = user;  // Attach user payload (id, email, role, etc.)
    next();
  });
};


const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Forbidden: Admin access required.',
      yourRole: req.user.role 
    });
  }

  next();
};

const authorizeSupervisor = (req, res, next) => {
    if (req.user.role !== 'supervisor') {
        return res.status(403).json({
            message: 'Forbidden: Supervisor access required.',
            yourRole: req.user.role
        });
    }
    next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeSupervisor
};