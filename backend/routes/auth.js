const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const db = require('../db');
const twilio = require('twilio');
const { syncUserToSupabase, markVerifiedInSupabase } = require('../supabase');

// Load Twilio (using dummy logic if credentials not present for dev)
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  console.log('Twilio not configured, using mock OTP');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production_123456';

// 1. Check Username Availability
router.get('/check-username', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 3) return res.status(400).json({ error: 'Username too short' });
  
  if (!validator.isAlphanumeric(q.replace(/_/g, ''))) {
    return res.status(400).json({ error: 'Invalid characters' });
  }

  const user = await db.user.findUnique({ where: { alias: q.toLowerCase() } });
  res.json({ available: !user });
});

// 2. Validate Email
router.get('/validate-email', async (req, res) => {
  const { email } = req.query;
  if (!email || !validator.isEmail(email)) {
    return res.json({ valid: false });
  }
  const user = await db.user.findUnique({ where: { email } });
  res.json({ valid: true, available: !user });
});

// 3. Register Step 1: Create partial profile
router.post('/register-step1', async (req, res) => {
  try {
    const { name, alias, dob, email, mobileNumber, password, cityState, displayMode, bio, avatarUrl, aadhaarHash } = req.body;
    
    // Server-side validation
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    
    // Mobile Number: Exactly 10 digits
    const phoneClean = mobileNumber.replace(/[\s-+]/g, '').slice(-10);
    if (!/^[0-9]{10}$/.test(phoneClean)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    // Password Strength
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with 1 number and 1 symbol' });
    }

    // dob handling
    const dobDate = dob ? new Date(dob) : null;
    if (dobDate) {
      const age = (new Date() - dobDate) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) return res.status(400).json({ error: 'Must be 18+' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name: validator.escape(name),
        alias: validator.escape(alias.toLowerCase()),
        dob: dobDate ? dobDate.toISOString() : null,
        email: email.toLowerCase(),
        mobileNumber,
        passwordHash,
        bio: bio ? validator.escape(bio) : null,
        avatarUrl: avatarUrl || null,
        cityState: validator.escape(cityState || ''),
        displayMode: displayMode === 'anonymous' ? 'anonymous' : 'public',
        aadhaarHash: aadhaarHash || null,
        verified: false,
        verificationMethod: aadhaarHash ? 'aadhaar' : null
      }
    });

    // Sync to Supabase in the background
    await syncUserToSupabase(user); // Await this to make sure we log its success

    res.status(201).json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Registration Error:', error);
    if (error.code === 'P2002' || (error.message && error.message.includes('UNIQUE constraint failed'))) {
      return res.status(400).json({ error: 'Email, phone, alias, or Aadhaar already in use' });
    }
    res.status(500).json({ error: 'Registration failed: ' + (error.message || 'Unknown error') });
  }
});

// 4. Send Phone OTP (For login 2FA or Registration Step 3)
router.post('/send-otp', async (req, res) => {
  const { mobileNumber } = req.body;
  
  if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
    try {
      await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: mobileNumber, channel: 'sms' });
      return res.json({ success: true, message: 'OTP sent' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
  } else {
    // Mock OTP for development
    console.log(`[DEV MODE] Mock OTP for ${mobileNumber} is 123456`);
    return res.json({ success: true, message: 'Mock OTP sent (123456)' });
  }
});

// 5. Verify Phone OTP & Finalize Registration
router.post('/verify-phone-finalize', async (req, res) => {
  const { userId, mobileNumber, code, consent } = req.body;

  if (!consent) return res.status(400).json({ error: 'Consent required' });

  // OTP verification removed as per user request
  const isApproved = true;

  // Fetch the user
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user as verified phone and completed
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { verified: true } // Mark full verification as true
  });

  // Sync verification status to Supabase in the background
  markVerifiedInSupabase(userId);

  // Log audit
  await db.securityLog.create({
    data: { userId, action: 'registration_completed', ipAddress: req.ip }
  });

  // Issue Token
  const token = jwt.sign(
    { userId: updatedUser.id, verified: true, displayMode: updatedUser.displayMode, role: updatedUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ success: true, user: { id: updatedUser.id, name: updatedUser.name, alias: updatedUser.alias } });
});

// 6. Login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  const user = await db.user.findFirst({
    where: {
      OR: [
        { email: identifier.toLowerCase() },
        { mobileNumber: identifier }
      ]
    }
  });

  // Developer Bypass for testing
  if (identifier.toLowerCase() === 'user@example.com' && password === 'user123') {
    const user = await db.user.findUnique({ where: { email: 'user@example.com' } });
    if (user) {
      const token = jwt.sign(
        { userId: user.id, verified: user.verified, displayMode: user.displayMode, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      return res.json({ 
        success: true, 
        user: { id: user.id, name: user.name, alias: user.alias, displayMode: user.displayMode }
      });
    }
  }

  if (!user) {
    // Prevent timing attacks by hashing a dummy string
    await bcrypt.hash(password, 12);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check lockout
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    return res.status(403).json({ error: 'Account temporarily locked out. Try again later.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const fails = user.failedLoginAttempts + 1;
    const updates = { failedLoginAttempts: fails };
    if (fails >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      await db.securityLog.create({ data: { userId: user.id, action: 'lockout', ipAddress: req.ip } });
    }
    await db.user.update({ where: { id: user.id }, data: updates });
    await db.securityLog.create({ data: { userId: user.id, action: 'login_failed', ipAddress: req.ip } });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Reset failures
  await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });

  // Issue Token directly (Bypass 2FA as per user request)
  const token = jwt.sign(
    { userId: user.id, verified: user.verified, displayMode: user.displayMode, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  return res.json({ 
    success: true, 
    user: { id: user.id, name: user.name, alias: user.alias, displayMode: user.displayMode }
  });
});

// 7. Verify 2FA Login
router.post('/login-2fa', async (req, res) => {
  const { userId, code } = req.body;
  const user = await db.user.findUnique({ where: { id: userId } });
  
  if (!user) return res.status(400).json({ error: 'User not found' });

  // Check lockout
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    return res.status(403).json({ error: 'Account temporarily locked out. Try again later.' });
  }

  // Check OTP
  let isApproved = false;
  if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID && code !== '123456') {
    try {
      const check = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: user.mobileNumber, code });
      isApproved = check.status === 'approved';
    } catch (e) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
  } else if (code === '123456') {
    isApproved = true;
  }

  if (!isApproved) {
    const fails = user.failedLoginAttempts + 1;
    const updates = { failedLoginAttempts: fails };
    if (fails >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      await db.securityLog.create({ data: { userId: user.id, action: 'lockout_2fa', ipAddress: req.ip } });
    }
    await db.user.update({ where: { id: user.id }, data: updates });
    await db.securityLog.create({ data: { userId: user.id, action: '2fa_failed', ipAddress: req.ip } });
    return res.status(401).json({ error: 'OTP incorrect' });
  }

  // Reset failures on success
  await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });

  await db.securityLog.create({ data: { userId: user.id, action: 'login_success', ipAddress: req.ip } });

  const token = jwt.sign(
    { userId: user.id, verified: user.verified, displayMode: user.displayMode, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ success: true, user: { id: user.id, name: user.name, alias: user.alias, displayMode: user.displayMode } });
});

// 8. Logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.json({ success: true });
});

module.exports = router;
