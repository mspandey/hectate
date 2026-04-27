const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);
  let email, password, role = 'super_admin';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email') email = args[i+1];
    if (args[i] === '--password') password = args[i+1];
    if (args[i] === '--role') role = args[i+1];
  }

  if (!email || !password) {
    console.error("Usage: node create-admin.js --email admin@hecate.app --password 'StrongPass!2025' [--role super_admin]");
    process.exit(1);
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`Admin user with email ${email} already exists.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate TOTP Secret
    const secret = speakeasy.generateSecret({
      name: `HECATE Admin (${email})`
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        name: 'Super Admin',
        alias: `admin_${Math.floor(Math.random() * 1000)}`,
        dob: new Date(),
        verified: true,
        verificationMethod: 'manual',
        status: 'active',
        totpSecret: secret.base32
      }
    });

    console.log(`\n✅ Admin created successfully (ID: ${user.id})!`);
    console.log(`\n🔑 **IMPORTANT - SCAN THIS QR CODE IN GOOGLE AUTHENTICATOR**\n`);
    
    qrcode.toString(secret.otpauth_url, { type: 'terminal', small: true }, function (err, url) {
      console.log(url);
      console.log(`\nOr enter this manual code: ${secret.base32}`);
      console.log(`Store this safely, it will not be shown again.\n`);
      process.exit(0);
    });

  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
