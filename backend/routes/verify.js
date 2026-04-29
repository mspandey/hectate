const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const axios = require('axios');
const multer = require('multer');
const crypto = require('crypto');
const FormData = require('form-data');

// Mock Surepass API if keys are missing
const SUREPASS_API_KEY = process.env.SUREPASS_API_KEY || 'mock';
const SUREPASS_URL = process.env.SUREPASS_BASE_URL || 'https://kyc-api.surepass.io/api/v1';

// Setup Mock for Document Google Vision
const vision = require('@google-cloud/vision');
let visionClient;
if (process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  visionClient = new vision.ImageAnnotatorClient();
}

// 1. Aadhaar Verify
router.post('/aadhaar/send-otp', async (req, res) => {
  const { id_number } = req.body;
  
  if (SUREPASS_API_KEY !== 'mock') {
    try {
      const resp = await axios.post(`${SUREPASS_URL}/aadhaar-v2/generate-otp`, {
        id_number
      }, { headers: { Authorization: `Bearer ${SUREPASS_API_KEY}` } });
      return res.json({ client_id: resp.data.client_id, message: "OTP sent" });
    } catch(e) {
      return res.status(400).json({ error: 'Failed to send OTP to Aadhaar linked number' });
    }
  } else {
    // DEV MODE
    return res.json({ client_id: 'mock_client_id_123', message: 'Mock OTP sent (123456)' });
  }
});

router.post('/aadhaar/verify-otp', async (req, res) => {
  const { userId, client_id, otp, aadhaarNumber } = req.body;
  let gender = 'M';

  if (SUREPASS_API_KEY !== 'mock' && otp !== '123456') {
    try {
      const resp = await axios.post(`${SUREPASS_URL}/aadhaar-v2/submit-otp`, {
        client_id, otp
      }, { headers: { Authorization: `Bearer ${SUREPASS_API_KEY}` } });
      gender = resp.data.data.gender;
    } catch(e) {
      return res.status(400).json({ error: 'Invalid Aadhaar OTP' });
    }
  } else {
    // DEV MODE mock response - safety first
    gender = 'UNKNOWN'; 
  }

  if (gender !== 'F') {
    await db.verificationAttempt.create({ data: { userId, method: 'aadhaar', status: 'failed', ipAddress: req.ip } });
    return res.status(403).json({ error: 'GENDER_MISMATCH', message: 'Hectate is a women-only platform. Verification could not confirm female identity.' });
  }

  // Secure deterministic hash for Aadhaar deduplication
  const AADHAAR_SECRET = process.env.AADHAAR_SECRET || 'Hectate_aadhaar_secret_dev_key';
  const aadhaarHash = crypto.createHmac('sha256', AADHAAR_SECRET).update(aadhaarNumber).digest('hex');
  
  // Store attempt
  await db.verificationAttempt.create({ data: { userId, method: 'aadhaar', status: 'success', ipAddress: req.ip } });
  
  // Mark method on user, but verified happens at final step
  await db.user.update({
    where: { id: userId },
    data: { aadhaarHash, verificationMethod: 'aadhaar' }
  });

  return res.json({ success: true, message: 'Identity verified' });
});

// 2. College ID - Google Vision OCR
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/college-id', upload.single('idCard'), async (req, res) => {
  const { userId } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  let isVerifiedFemale = false;
  let fullText = '';
  let ocrConfidence = 1.0;

  if (visionClient) {
    try {
      const [result] = await visionClient.documentTextDetection(req.file.buffer);
      fullText = result.fullTextAnnotation.text;
      
      const genderPatterns = [/gender[:\s]+female/i, /sex[:\s]+f(?:emale)?/i, /\bF\b.*(?:gender|sex)/i, /(?:ms|miss|mrs|smt)\s+[a-z]/i];
      isVerifiedFemale = genderPatterns.some(p => p.test(fullText));
    } catch (e) {
      return res.status(500).json({ error: 'Vision API Error' });
    }
  } else {
    // DEV MODE Mock - should not pass gender check automatically
    fullText = "OCR result for Review";
    isVerifiedFemale = false;
  }

  if (!isVerifiedFemale) {
    ocrConfidence = 0.5; // Simulate a low confidence requiring review
    await db.verificationAttempt.create({ data: { userId, method: 'college_id', status: 'pending_review', ocrResult: fullText, ipAddress: req.ip } });
    return res.status(202).json({ status: 'under_review', eta: '24 hours', message: 'Manual review required based on OCR confidence.' });
  }

  await db.verificationAttempt.create({ data: { userId, method: 'college_id', status: 'success', ocrResult: fullText, ipAddress: req.ip } });
  await db.user.update({ where: { id: userId }, data: { verificationMethod: 'college_id' } });

  return res.json({ success: true, message: 'College ID verified' });
});

// 3. Selfie & Liveness (Step 1)
router.post('/selfie', async (req, res) => {
  const { livenessFrames } = req.body;

  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/verify/selfie`, {
      livenessFrames: livenessFrames
    }, { timeout: 30000 });

    return res.json(response.data);
  } catch (error) {
    console.error(`[NODE] Selfie Error:`, error.message);
    const msg = error.response ? error.response.data.error : 'Selfie verification service unavailable';
    return res.status(error.response?.status || 400).json({ success: false, error: msg });
  }
});

// 3.1 Face Match (Step 3)
router.post('/match', async (req, res) => {
  const { selfie_b64, aadhaar_face_b64 } = req.body;

  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/verify/match`, {
      selfie_b64,
      aadhaar_face_b64
    }, { timeout: 30000 });

    return res.json(response.data);
  } catch (error) {
    console.error(`[NODE] Match Error:`, error.message);
    const msg = error.response ? error.response.data.error : 'Matching service unavailable';
    return res.status(error.response?.status || 400).json({ success: false, error: msg });
  }
});

// ── 4. Gender Check — DEPRECATED (returns 410) ──────────────────────────────────────
router.post('/gender-check', async (req, res) => {
  console.warn('[NODE] /gender-check called — this endpoint is deprecated.');
  return res.status(410).json({
    status: 'deprecated',
    message: 'Face-based gender detection has been removed. Gender is now verified via Aadhaar OCR (/api/verify/aadhaar-ocr).'
  });
});

const aadhaarUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001';

// ── 0. Health Check Proxy ──────────────────────────────────────────────────
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, { timeout: 2000 });
    return res.json({ node: 'ok', python: response.data });
  } catch (error) {
    return res.status(503).json({ 
      node: 'ok', 
      python: 'offline', 
      error: error.message,
      help: "Ensure the Python Vision Service is running on port 5001."
    });
  }
});

// 5. Aadhaar OCR + Face Match (Step 2)
router.post('/aadhaar-match', aadhaarUpload.single('aadhaar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No Aadhaar file uploaded' });
  const { selfie_b64, userId } = req.body;

  try {
    const form = new FormData();
    form.append('aadhaar', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
    if (selfie_b64) {
      form.append('selfie_b64', selfie_b64);
    }

    console.log(`[NODE] Proxying Aadhaar Match to ${PYTHON_SERVICE_URL}/verify/aadhaar`);
    const response = await axios.post(`${PYTHON_SERVICE_URL}/verify/aadhaar`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const result = response.data;

    // ----- Check Aadhaar Uniqueness -----
    if (result.success && result.ocr_data?.aadhaar_number) {
      const AADHAAR_SECRET = process.env.AADHAAR_SECRET || 'Hectate_aadhaar_secret_dev_key';
      const aadhaarHash = crypto.createHmac('sha256', AADHAAR_SECRET).update(result.ocr_data.aadhaar_number.replace(/\s/g, '')).digest('hex');
      
      const existingUser = await db.user.findFirst({ where: { aadhaarHash } });
      if (existingUser && existingUser.id !== userId) {
        result.success = false;
        result.passed = false;
        result.error = "An account with this Aadhaar number already exists.";
      } else {
        result.aadhaarHash = aadhaarHash;
      }
    }

    // Log the attempt
    if (userId) {
      await db.verificationAttempt.create({
        data: { userId, method: 'aadhaar_match', status: result.success ? 'success' : 'failed', ocrResult: result.error || 'Success', ipAddress: req.ip }
      });
    }

    return res.json(result);
  } catch (err) {
    console.error(`[NODE] Aadhaar Match Error:`, err.message);
    const msg = err.response?.data?.error || 'Verification system unreachable. Please ensure the Python service is running.';
    return res.status(err.response?.status || 500).json({ success: false, error: msg });
  }
});

module.exports = router;
