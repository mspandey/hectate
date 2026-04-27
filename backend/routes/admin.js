const express = require('express');
const router = express.Router();
const prisma = require('../db');
const requireAdmin = require('../middleware/adminAuth');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');

// ── Auth ──────────────────────────────────
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Only admins can login here
  if (!['admin', 'super_admin', 'moderator'].includes(user.role)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Bypass 2FA - Create session token immediately
    const token = jwt.sign(
      { userId: user.id, role: user.role, sessionVersion: user.sessionVersion },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ADMIN_SESSION_DURATION || '4h' }
    );

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Use exact SameSite attributes for dev vs prod
      path: '/',
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });

    res.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  });

router.post('/auth/verify-2fa', async (req, res) => {
  const { tempToken, totpCode } = req.body;
  if (!tempToken || !totpCode) return res.status(400).json({ error: "Missing required fields" });

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.pending2FA) throw new Error();

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.totpSecret) return res.status(401).json({ error: "2FA not configured" });

    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });

    if (!isValid) return res.status(401).json({ error: "INVALID_2FA" });

    const token = jwt.sign(
      { userId: user.id, role: user.role, sessionVersion: user.sessionVersion },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ADMIN_SESSION_DURATION || '4h' }
    );

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Use exact SameSite attributes for dev vs prod
      path: '/',
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });

    res.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: "Token invalid or expired" });
  }
});

router.post('/auth/logout', requireAdmin, (req, res) => {
  res.clearCookie('accessToken');
  res.json({ success: true });
});

router.get('/auth/me', requireAdmin, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.admin.userId }, select: { id: true, email: true, role: true }});
  res.json({ user });
});

// All routes below require Admin
router.use(requireAdmin);

// ── Dashboard Metrics ─────────────────────
router.get('/metrics', async (req, res) => {
  const totalUsers = await prisma.user.count({ where: { role: 'user' } });
  const pendingVerification = await prisma.verificationAttempt.count({ where: { status: 'pending_review' } });
  const flaggedSosPosts = await prisma.post.count({ where: { flagCount: { gte: 3 } } });
  const flaggedCommunityPosts = await prisma.communityPost.count({ where: { isFlagged: 1 } });
  const totalReports = await prisma.report.count();
  const flaggedContent = flaggedSosPosts + flaggedCommunityPosts + totalReports;
  
  // Start of today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sosToday = await prisma.sOSEvent.count({ where: { createdAt: { gte: today } } });
  const activeSOS = await prisma.sOSEvent.count({ where: { status: 'active' } });

  const activeUsers = await prisma.user.count({ where: { status: 'active' } });
  const verifiedUsers = await prisma.user.count({ where: { verified: true } });
  const rejectedUsers = await prisma.verificationAttempt.count({ where: { status: 'failed' } });

  // Compute newSignups7d
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUsers = await prisma.user.findMany({ where: { createdAt: { gte: sevenDaysAgo } } });
  
  const newSignups7d = [0, 0, 0, 0, 0, 0, 0];
  recentUsers.forEach(u => {
    const diffTime = Math.abs(new Date() - new Date(u.createdAt));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      newSignups7d[6 - diffDays]++; // 6 is today, 0 is oldest
    }
  });

  // Compute verificationBreakdown
  const verifiedList = await prisma.user.findMany({ where: { verified: true } });
  const verificationBreakdown = { aadhaar: 0, college_id: 0, face: 0 };
  verifiedList.forEach(u => {
    if (u.verificationMethod) {
      verificationBreakdown[u.verificationMethod] = (verificationBreakdown[u.verificationMethod] || 0) + 1;
    }
  });

  res.json({
    totalUsers,
    activeUsers,
    verifiedUsers,
    rejectedUsers,
    pendingVerification,
    flaggedContent,
    sosToday,
    activeSOS,
    blockedAccounts: await prisma.user.count({ where: { status: 'blocked' } }),
    newSignups7d,
    verificationBreakdown
  });
});

// ── Alerts ────────────────────────────────
router.get('/alerts', async (req, res) => {
  const activeSOS = await prisma.sOSEvent.findMany({
    where: { status: 'active' },
    include: { user: { select: { name: true, alias: true } } }
  });

  const pendingVerification = await prisma.verificationAttempt.findMany({
    where: { status: 'pending_review' },
    include: { user: { select: { name: true, alias: true } } }
  });

  const flaggedCommunityPosts = await prisma.communityPost.findMany({
    where: { isFlagged: 1 },
    take: 20
  });

  const reports = await prisma.report.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  // Recent lockouts in last 24h
  const yesterday = new Date(Date.now() - 86400000);
  const lockouts = await prisma.securityLog.findMany({
    where: { 
      action: 'lockout',
      createdAt: { gte: yesterday }
    },
    include: { user: { select: { name: true, alias: true } } }
  });

  const alerts = [
    ...activeSOS.map(s => ({ id: s.id, type: 'URGENT', category: 'SOS', message: `Active SOS from ${s.user.name}`, timestamp: s.createdAt })),
    ...pendingVerification.map(v => ({ id: v.id, type: 'SUSPICIOUS', category: 'VERIFICATION', message: `Pending review for ${v.user.name}`, timestamp: v.createdAt })),
    ...flaggedContent.map(p => ({ id: p.id, type: 'SUSPICIOUS', category: 'CONTENT', message: `Post flagged ${p.flagCount} times by ${p.user.name}`, timestamp: p.createdAt })),
    ...flaggedCommunityPosts.map(p => ({ id: p.id, type: 'SUSPICIOUS', category: 'COMMUNITY', message: `Community post auto-flagged (Sentiment)`, timestamp: p.createdAt })),
    ...reports.map(r => ({ id: r.id, type: 'URGENT', category: 'REPORT', message: `Post ${r.postId} reported: ${r.reason}`, timestamp: r.createdAt })),
    ...lockouts.map(l => ({ id: l.id, type: 'SUSPICIOUS', category: 'SECURITY', message: `Account lockout for ${l.user?.name || 'Unknown'}`, timestamp: l.createdAt }))
  ];

  // Sort by urgency then timestamp
  alerts.sort((a, b) => {
    if (a.type === 'URGENT' && b.type !== 'URGENT') return -1;
    if (a.type !== 'URGENT' && b.type === 'URGENT') return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  res.json(alerts);
});

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    take: 25,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, alias: true, name: true, email: true,
      verified: true, verificationMethod: true, status: true,
      createdAt: true
    }
  });
  res.json({ users, total: await prisma.user.count() });
});

router.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      securityLogs: { take: 5, orderBy: { createdAt: 'desc' } },
      posts: { take: 5, orderBy: { createdAt: 'desc' } },
      sosEvents: { take: 1, orderBy: { createdAt: 'desc' } }
    }
  });
  res.json(user);
});

router.post('/users/:id/block', async (req, res) => {
  const { reason, duration } = req.body;
  const userId = req.params.id;

  const unblockAt = duration === "permanent" ? null :
    duration === "24h"  ? new Date(Date.now() + 86400000) :
    duration === "7d"   ? new Date(Date.now() + 604800000) :
    duration === "30d"  ? new Date(Date.now() + 2592000000) : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "blocked",
      blockedAt: new Date(),
      blockedBy: req.admin.userId,
      blockReason: reason,
      unblockAt,
      sessionVersion: { increment: 1 } // Invalidates existing sessions checking this
    }
  });

  await prisma.adminAuditLog.create({
    data: {
      action: "BLOCK_USER",
      targetType: "user",
      targetId: userId,
      adminId: req.admin.userId,
      adminEmail: req.admin.email || "unknown",
      reason,
      metadata: JSON.stringify({ duration }),
      ipAddress: req.ip || 'unknown'
    }
  });

  res.json({ success: true });
});

router.post('/users/:id/unblock', async (req, res) => {
  const userId = req.params.id;
  await prisma.user.update({
    where: { id: userId },
    data: { status: "active", blockedAt: null, blockedBy: null, blockReason: null, unblockAt: null }
  });

  await prisma.adminAuditLog.create({
    data: {
      action: "UNBLOCK_USER",
      targetType: "user",
      targetId: userId,
      adminId: req.admin.userId,
      adminEmail: req.admin.email || "unknown",
      ipAddress: req.ip || 'unknown'
    }
  });

  res.json({ success: true });
});

router.post('/users/:id/flag', async (req, res) => {
  const userId = req.params.id;
  const { reason } = req.body;

  await prisma.user.update({
    where: { id: userId },
    data: { status: "flagged" }
  });

  await prisma.adminAuditLog.create({
    data: {
      action: "FLAG_USER",
      targetType: "user",
      targetId: userId,
      adminId: req.admin.userId,
      adminEmail: req.admin.email || "unknown",
      reason: reason || 'Flagged by admin',
      ipAddress: req.ip || 'unknown'
    }
  });

  res.json({ success: true });
});

router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await prisma.user.delete({ where: { id: userId } });
    
    await prisma.adminAuditLog.create({
      data: {
        action: 'DELETE_USER',
        targetType: 'user',
        targetId: userId,
        adminId: req.admin.userId,
        adminEmail: req.admin.email || 'unknown',
        ipAddress: req.ip || 'unknown'
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ── Audit Log ──────────────────────────────
router.get('/audit-log', async (req, res) => {
  const logs = await prisma.adminAuditLog.findMany({
    take: 50,
    orderBy: { timestamp: 'desc' }
  });
  res.json(logs);
});

// ── Verification Queue ────────────────────
router.get('/verification-queue', async (req, res) => {
  const attempts = await prisma.verificationAttempt.findMany({
    where: { status: 'pending_review' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: {
        select: { id: true, alias: true, name: true, email: true }
      }
    }
  });
  res.json({ attempts, total: attempts.length });
});

router.post('/verification-queue/:id/approve', async (req, res) => {
  const attemptId = req.params.id;
  const attempt = await prisma.verificationAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  await prisma.verificationAttempt.update({
    where: { id: attemptId },
    data: { status: 'success' }
  });

  await prisma.user.update({
    where: { id: attempt.userId },
    data: { verified: true, verificationMethod: attempt.method }
  });

  await prisma.adminAuditLog.create({
    data: {
      action: 'APPROVE_VERIFICATION',
      targetType: 'verification_attempt',
      targetId: attemptId,
      adminId: req.admin.userId,
      adminEmail: req.admin.email || 'unknown',
      ipAddress: req.ip || 'unknown'
    }
  });

  res.json({ success: true });
});

router.post('/verification-queue/:id/reject', async (req, res) => {
  const attemptId = req.params.id;
  const { reason } = req.body;
  const attempt = await prisma.verificationAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  await prisma.verificationAttempt.update({
    where: { id: attemptId },
    data: { status: 'failed' }
  });

  await prisma.adminAuditLog.create({
    data: {
      action: 'REJECT_VERIFICATION',
      targetType: 'verification_attempt',
      targetId: attemptId,
      adminId: req.admin.userId,
      adminEmail: req.admin.email || 'unknown',
      reason: reason || 'No reason provided',
      ipAddress: req.ip || 'unknown'
    }
  });

  res.json({ success: true });
});

// ── Flagged Content ───────────────────────
router.get('/flagged-content', async (req, res) => {
  const sosPosts = await prisma.post.findMany({
    where: { flagCount: { gte: 3 } },
    orderBy: { flagCount: 'desc' },
    take: 50,
    include: { user: { select: { id: true, alias: true, name: true } } }
  });

  const communityPosts = await prisma.communityPost.findMany({
    where: { isFlagged: 1 },
    orderBy: { timestamp: 'desc' },
    take: 50
  });

  const reports = await prisma.report.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' }
  });

  res.json({ 
    posts: sosPosts, 
    communityPosts, 
    reports,
    total: sosPosts.length + communityPosts.length + reports.length 
  });
});

router.post('/flagged-content/:id/dismiss', async (req, res) => {
  const postId = req.params.id;
  await prisma.post.update({
    where: { id: postId },
    data: { flagCount: 0 }
  });

  await prisma.adminAuditLog.create({
    data: {
      action: 'DISMISS_FLAG',
      targetType: 'post',
      targetId: postId,
      adminId: req.admin.userId,
      adminEmail: req.admin.email || 'unknown',
      ipAddress: req.ip || 'unknown'
    }
  });

  res.json({ success: true });
});

router.post('/flagged-content/:id/remove', async (req, res) => {
  const postId = req.params.id;
  const { reason } = req.body;

  try {
    await prisma.post.delete({ where: { id: postId } });

    await prisma.adminAuditLog.create({
      data: {
        action: 'REMOVE_POST',
        targetType: 'post',
        targetId: postId,
        adminId: req.admin.userId,
        adminEmail: req.admin.email || 'unknown',
        reason: reason || 'Violation of terms',
        ipAddress: req.ip || 'unknown'
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ── Community Flagged Content Actions ──────
router.post('/flagged-content/:id/community/dismiss', async (req, res) => {
  const postId = req.params.id;
  await prisma.communityPost.update({
    where: { id: postId },
    data: { isFlagged: 0 }
  });

  // Also remove reports for this post
  try {
    const reports = await prisma.report.findMany({ where: { postId } });
    for (const r of reports) {
      await prisma.report.delete({ where: { id: r.id } });
    }
  } catch (e) {
    console.warn('[Admin] Failed to clear reports for post:', postId, e.message);
  }

  await prisma.adminAuditLog.create({
    data: {
      action: 'DISMISS_COMMUNITY_FLAG',
      targetType: 'community_post',
      targetId: postId,
      adminId: req.admin.userId,
      adminEmail: req.admin.email || 'unknown',
      ipAddress: req.ip || 'unknown'
    }
  });

  res.json({ success: true });
});

router.post('/flagged-content/:id/community/remove', async (req, res) => {
  const postId = req.params.id;
  const { reason } = req.body;

  try {
    await prisma.communityPost.delete({ where: { id: postId } });

    await prisma.adminAuditLog.create({
      data: {
        action: 'REMOVE_COMMUNITY_POST',
        targetType: 'community_post',
        targetId: postId,
        adminId: req.admin.userId,
        adminEmail: req.admin.email || 'unknown',
        reason: reason || 'Removed by admin',
        ipAddress: req.ip || 'unknown'
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove community post' });
  }
});

// ── SOS Log ───────────────────────────────
router.get('/sos-log', async (req, res) => {
  const events = await prisma.sOSEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: {
        select: { id: true, alias: true, name: true }
      }
    }
  });
  res.json({ events, total: events.length });
});

router.post('/sos-log/:id/resolve', async (req, res) => {
  const eventId = req.params.id;
  const { reason } = req.body;

  try {
    await prisma.sOSEvent.update({
      where: { id: eventId },
      data: { status: 'resolved', resolvedAt: new Date(), cancelReason: reason || 'Resolved by admin' }
    });

    await prisma.adminAuditLog.create({
      data: {
        action: 'RESOLVE_SOS',
        targetType: 'sos_event',
        targetId: eventId,
        adminId: req.admin.userId,
        adminEmail: req.admin.email || 'unknown',
        reason: reason || 'Resolved by admin',
        ipAddress: req.ip || 'unknown'
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve SOS event' });
  }
});

// ── Settings ──────────────────────────────────
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings', async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Key and value are required' });
  }

  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    });

    await prisma.adminAuditLog.create({
      data: {
        action: 'UPDATE_SETTING',
        targetType: 'setting',
        targetId: key,
        adminId: req.admin.userId,
        adminEmail: req.admin.email || 'unknown',
        metadata: JSON.stringify({ key, value }),
        ipAddress: req.ip || 'unknown'
      }
    });

    res.json({ success: true, setting });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

module.exports = router;
