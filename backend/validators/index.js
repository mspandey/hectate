const { z } = require('zod');

// Point 2 from Image: Strict input validation & sanitization
const postSchema = z.object({
  body: z.string().min(1).max(500).trim(),
  anonymous: z.boolean(),
  cw: z.string().max(20).optional(),
  tags: z.array(z.string()).max(5).optional(),
  revealed: z.boolean().default(true),
}).strict(); // Reject unexpected fields

const verificationSchema = z.object({
  method: z.enum(['aadhaar', 'college', 'face']),
  aadhaarNumber: z.string().length(12, "Aadhaar must be 12 digits").regex(/^\d+$/).optional(),
  mobileNumber: z.string().min(10).max(15).optional(),
  idPhotoUrl: z.string().url().optional(),
  alias: z.string().min(3).max(24).trim(),
}).strict();

const sosSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  token: z.string(),
  contacts: z.array(z.string()).optional(),
}).strict();

module.exports = {
  postSchema,
  verificationSchema,
  sosSchema
};
