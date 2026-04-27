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

// 3. Face Liveness proxy to Python Service
const FACE_SERVICE_URL = process.env.FACE_VERIFY_SERVICE_URL || 'http://127.0.0.1:5001';
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001';

router.post('/face', async (req, res) => {
  const { userId, livenessFrames, selfieFrame, documentPhoto } = req.body;

  try {
    const response = await axios.post(`${FACE_SERVICE_URL}/verify-face`, {
      liveness_frames: livenessFrames,
      selfie_frame: selfieFrame,
      document_photo: documentPhoto
    }, { timeout: 30000 });

    const result = response.data;
    if (result.success && result.gender === 'female') {
      await db.verificationAttempt.create({ data: { userId, method: 'face', status: 'success', matchScore: result.match_score, liveness: result.liveness, ipAddress: req.ip } });
      await db.user.update({ where: { id: userId }, data: { verificationMethod: 'face' } });
      return res.json({ success: true, message: 'Face verification passed' });
    } else {
      await db.verificationAttempt.create({ data: { userId, method: 'face', status: 'failed', matchScore: result.match_score, liveness: result.liveness, ipAddress: req.ip } });
      return res.status(400).json({ error: 'FACE_VERIFY_FAIL', message: 'Failed gender or liveness checks.' });
    }
  } catch (error) {
    const msg = error.response ? error.response.data.message : 'Face verification service unavailable';
    return res.status(400).json({ error: 'FACE_API_ERROR', message: msg });
  }
});

// ── 4. Gender Identity Check (webcam frame → Python gender classifier) ────────
router.post('/gender-check', async (req, res) => {
  const { frame, votes } = req.body;
  console.log(`[NODE] Gender check request. Votes received: ${Array.isArray(votes) ? votes.length : 'none'}`);
  
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/verify-gender`, { frame, votes: votes || [] }, { timeout: 30000 });
    console.log(`[NODE] Gender check response status: ${response.data.status}, Votes returned: ${response.data.votes?.length || 0}`);
    return res.json(response.data);
  } catch (err) {
    console.error('Gender check error:', err.message, err.response?.data || '');
    return res.status(500).json({ error: 'Gender service offline', detail: err.message });
  }
});

// ── 5. Aadhaar Card OCR (image upload → Python Tesseract OCR) ─────────────────
const aadhaarUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/aadhaar-ocr', aadhaarUpload.single('aadhaar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const form = new FormData();
    form.append('aadhaar', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });

    console.log(`[NODE] Proxying Aadhaar OCR to ${PYTHON_SERVICE_URL}/verify-aadhaar`);
    const response = await axios.post(`${PYTHON_SERVICE_URL}/verify-aadhaar`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });
    console.log(`[NODE] Python service responded with status: ${response.status}`);

    const result = response.data;

    // ----- Check Aadhaar Uniqueness -----
    if (result.passed && result.aadhaar_number) {
      const AADHAAR_SECRET = process.env.AADHAAR_SECRET || 'Hectate_aadhaar_secret_dev_key';
      const aadhaarHash = crypto.createHmac('sha256', AADHAAR_SECRET).update(result.aadhaar_number.replace(/\s/g, '')).digest('hex');
      
      const existingUser = await db.user.findFirst({ where: { aadhaarHash } });
      const existingWoman = await db.womanProfile.findFirst({ where: { aadhaarRef: aadhaarHash } });

      if (existingUser || existingWoman) {
        result.passed = false;
        result.reason = "An account with this Aadhaar number already exists. One Aadhaar registration per account.";
      } else {
        result.aadhaarHash = aadhaarHash;
      }
    }

    // Log the attempt if userId provided
    if (req.body?.userId) {
      const status = result.passed ? 'success' : 'failed';
      await db.verificationAttempt.create({
        data: { userId: req.body.userId, method: 'aadhaar_ocr', status, ocrResult: result.ocr_text_preview || '', ipAddress: req.ip }
      });
    }

    return res.json(result);
  } catch (err) {
    console.error(`[NODE] Aadhaar OCR Error:`, err.message);
    if (err.response) {
      console.error(`[NODE] Python Response Data:`, err.response.data);
      console.error(`[NODE] Python Response Status:`, err.response.status);
    }
    return res.status(500).json({ passed: false, error: 'Verification system issue', detail: 'The ID verification service is currently unreachable. Please ensure the Python backend is running.' });
  }
});

module.exports = router;
