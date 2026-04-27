const jwt = require('jsonwebtoken');
const prisma = require('../db');

async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      console.warn("🛡️ Admin Auth: Missing accessToken cookie.");
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🛡️ Admin Auth: Decoded role:", decoded.role);
    if (!decoded || !['admin', 'super_admin', 'moderator'].includes(decoded.role)) {
      console.warn("🛡️ Admin Auth: Invalid role/token.", decoded?.role);
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    // Verify session still exists and is not blocked
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    // Log access attempt if user is valid
    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          adminId: user.id,
          adminEmail: user.email || 'unknown',
          ipAddress: req.ip || 'unknown',
          action: 'ADMIN_PANEL_ACCESS',
          targetType: 'route',
          targetId: req.originalUrl,
          success: user.status === 'active' && ['admin', 'super_admin', 'moderator'].includes(user.role),
          userAgent: req.get('User-Agent') || 'unknown',
          timestamp: new Date()
        }
      });
    }

    if (!user || user.status !== 'active') {
      console.warn("🛡️ Admin Auth: User not found or inactive.", { userId: decoded.userId, exists: !!user, status: user?.status });
      return res.status(404).json({ error: "NOT_FOUND" }); // Still hide existence
    }

    req.admin = {
      ...decoded,
      fullRole: user.role
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "TOKEN_EXPIRED" });
    }
    // Any other error we just say not found or unauthorized
    console.error("❌ Admin Auth Error [CRASH]:", error.message, error.stack);
    return res.status(404).json({ error: "NOT_FOUND" });
  }
}

module.exports = requireAdmin;
