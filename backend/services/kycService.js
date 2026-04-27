const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Real-time KYC Service using Google Gemini
 */
class KYCService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GENAI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Verify ID using Gemini Multimodal Analysis
   */
  async verifyID(fullName, idNumber, documentBase64) {
    console.log(`[KYCService] Verifying ${idNumber} for ${fullName} via Gemini`);
    
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Prepare the multimodal prompt
      const prompt = `
        Analyze this identity document (Aadhaar/PAN Card) for the following:
        1. Extract the Full Name.
        2. Extract the Gender (Identified as MALE, FEMALE, or OTHER).
        3. Identify the ID Type (AADHAAR, PAN).
        4. Validate if the document looks authentic and matches the provided ID number: ${idNumber}.
        5. Check for any obvious signs of tampering or photo-of-a-photo characteristics.

        Return the response STRICTLY as a JSON object with these fields:
        {
          "name": "string",
          "gender": "FEMALE" | "MALE" | "OTHER",
          "idType": "string",
          "isAuthentic": boolean,
          "confidence": number (0-1),
          "errorMsg": "string if any",
          "reasoning": "brief explanation"
        }
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: documentBase64.split(",")[1] || documentBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response (handling potential markdown wrapping)
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(jsonStr);

      console.log("[KYCService] AI Analysis Result:", analysis);

      // Business Logic: Check if Name matches roughly
      const nameMatch = analysis.name?.toLowerCase().includes(fullName.split(' ')[0].toLowerCase());
      
      if (!analysis.isAuthentic || analysis.confidence < 0.7) {
        return {
          status: 'failed',
          message: 'Document verification failed: Authenticity could not be verified.',
          providerResponse: text
        };
      }

      if (process.env.KYC_GENDER_ENFORCEMENT === 'true' && analysis.gender !== 'FEMALE') {
        return {
          status: 'failed',
          message: 'Access Restricted: Hectate is a community for women. This ID does not match the registration policy.',
          gender: analysis.gender,
          providerResponse: text
        };
      }

      return {
        status: 'verified',
        message: 'KYC Verification Successful',
        gender: analysis.gender,
        providerResponse: text
      };

    } catch (error) {
      console.error("[KYCService] Gemini Error:", error);
      return {
        status: 'error',
        message: 'KYC Service is temporarily unavailable. Please try again later.',
      };
    }
  }
}

module.exports = new KYCService();
