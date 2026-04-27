const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const authenticateUser = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for KYC Attempts (Fintech Grade)
 * Max 5 attempts per 1 hour to prevent brute-forcing and abuse.
 */
const kycLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    status: 'failed',
    message: 'Too many KYC verification attempts from this IP. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Route: POST /api/kyc/52596605-40f6-469b-b8d0-38f1fbb53e1f
 * Required for identity verification.
 */
router.post('/52596605-40f6-469b-b8d0-38f1fbb53e1f', 
  kycLimiter, 
  // authenticateUser, // Optional during registration
  kycController.verifyKYC
);

module.exports = router;
