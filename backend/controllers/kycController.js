const kycService = require('../services/kycService');
const prisma = require('../db');
const { z } = require('zod');

/**
 * KYC Verification Controller
 */
const verifyKYC = async (req, res) => {
  try {
    const { full_name, id_number, document } = req.body;

    // 1. Validate Input (Zod)
    const kycSchema = z.object({
      full_name: z.string().min(3, "Full name must be at least 3 characters"),
      id_number: z.string().min(5, "ID number must be at least 5 characters"),
      document: z.string().min(1, "Document is required (base64 or reference)")
    });

    const validationResult = kycSchema.safeParse({ full_name, id_number, document });
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'failed',
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors
      });
    }

    // 2. Integration with Provider
    const userId = req.user ? req.user.id : req.body.userId;
    if (!userId) {
      return res.status(400).json({ status: 'failed', message: 'User ID is required' });
    }

    console.log(`[KYCController] Starting verification for ${userId}`);
    const result = await kycService.verifyID(full_name, id_number, document);

    // 2.5 Gender Enforcement Logic (Strictly Women-Only)
    const isWoman = result.gender === 'FEMALE';
    const enforcementActive = process.env.KYC_GENDER_ENFORCEMENT === 'true';

    if (enforcementActive && !isWoman && result.status === 'verified') {
      console.warn(`[KYCController] Gender policy violation for ${userId}: Detected ${result.gender}`);
      
      // Log the rejection precisely
      await prisma.securityLog.create({
        data: {
          userId: userId,
          action: 'kyc_gender_rejection',
          ipAddress: req.ip,
          details: `KYC passed identity check but failed gender policy. Identity detected as ${result.gender}. Access Denied.`
        }
      });

      return res.status(403).json({
        status: 'failed',
        message: 'Hectate is strictly for women. We could not verify a female identity from your document.',
        data: { reason: 'GENDER_MISMATCH' }
      });
    }

    // 3. Persist Attempt to Database
    const attempt = await prisma.kYCVerification.create({
      data: {
        userId: userId,
        fullName: full_name,
        idNumber: id_number, 
        idType: id_number.length === 10 ? 'PAN' : 'AADHAAR',
        status: result.status,
        message: result.message,
        providerResponse: result.providerResponse,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    // 4. Update User Verification Status if success
    if (result.status === 'verified') {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          verified: true,
          verificationMethod: attempt.idType
        }
      });

      // Log security event
      await prisma.securityLog.create({
        data: {
          userId: userId,
          action: 'kyc_success',
          ipAddress: req.ip,
          details: `KYC verified successfully for user ${userId}.`
        }
      });
    } else {
      // Log failure
      await prisma.securityLog.create({
        data: {
          userId: userId,
          action: 'kyc_failed',
          ipAddress: req.ip,
          details: `KYC verification failed for user ${userId}: ${result.message}`
        }
      });
    }

    // 5. Return Response
    return res.status(result.status === 'verified' ? 200 : 400).json({
      status: result.status,
      message: result.message,
      data: {
        attemptId: attempt.id,
        timestamp: attempt.createdAt
      }
    });

  } catch (error) {
    console.error(`[KYCController] Error:`, error);
    return res.status(500).json({
      status: 'failed',
      message: 'An internal server error occurred during KYC processing.',
    });
  }
};

module.exports = {
  verifyKYC
};
