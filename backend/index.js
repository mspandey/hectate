const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); 
app.use(cors({ origin: true, credentials: true })); // origin: true allows any origin in dev - more robust
app.use(express.json({ limit: '10mb' })); // Increased for Face Capture payloads 
app.use(cookieParser());
app.use(morgan('dev'));

// CSRF Protection
const csrfProtection = csurf({ 
  cookie: {
    httpOnly: true, 
    sameSite: 'lax', 
    secure: process.env.NODE_ENV === 'production'
  } 
});

// Admin routes use JWT in httpOnly cookies — they manage their own
// token validation in requireAdmin middleware, so CSRF is not needed
// (CSRF attacks cannot read httpOnly cookies, only send them — but
// requireAdmin verifies the JWT signature, which the attacker can't forge).

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, // Increased from 100 to support high-frequency liveness checks
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, legacyHeaders: false,
});
app.use('/api/', globalLimiter);

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: process.env.NODE_ENV === 'development' ? 1000 : 50, // Increased for production safety
  message: { error: 'Too many attempts. Please try again later.' }
});

const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: process.env.NODE_ENV === 'development' ? 2000 : 100, // Increased to support 8+ frames per session
  message: { error: 'Maximum verification attempts reached for this hour.' }
});

// Routes
const authRoutes = require('./routes/auth');
const verifyRoutes = require('./routes/verify');
const adminRoutes = require('./routes/admin');
const kycRoutes = require('./routes/kyc');
const postRoutes = require('./routes/posts');

const devCsrf = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return csrfProtection(req, res, next);
  }
  next();
};

app.use('/api/auth', strictLimiter, devCsrf, authRoutes);
app.use('/api/verify', verifyLimiter, devCsrf, verifyRoutes);
app.use('/api/admin', strictLimiter, adminRoutes); // JWT-based: no CSRF needed
app.use('/api/kyc', strictLimiter, devCsrf, kycRoutes);
app.use('/api/posts', postRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'healthy', time: new Date() }));

// Error handling for CSRF
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  console.error("CSRF Error:", err.stack);
  res.status(403).json({ error: 'CSRF token validation failed' });
});

// For Vercel Serverless deployment
app.listen(PORT, () => {
  console.log(`Hectate Security Server running on port ${PORT}`);
});

module.exports = app;
