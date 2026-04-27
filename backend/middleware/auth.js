const jwt = require('jsonwebtoken');
const prisma = require('../db');

/**
 * Generic JWT Authentication Middleware
 * Verifies the 'jwt' from cookies or Authorization header.
 * Attaches the 'user' object to the request.
 */
const authenticateUser = async (req, res, next) => {
  try {
    let token = req.cookies.jwt;
    
    // Also support Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ 
        status: 'failed', 
        message: 'Authentication required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user directly from DB (Stateless JWT)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.status === 'blocked') {
      return res.status(401).json({ 
        status: 'failed', 
        message: 'User not found or account blocked' 
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'failed', 
        message: 'Token expired' 
      });
    }
    return res.status(401).json({ 
      status: 'failed', 
      message: 'Invalid token' 
    });
  }
};

module.exports = authenticateUser;
