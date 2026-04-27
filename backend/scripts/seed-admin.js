const bcrypt = require('bcrypt');
const prisma = require('./db');
require('dotenv').config();

/**
 * Seed Admin Account
 * Credentials: hecate@hecate.app / amishapandey
 */
async function seedAdmin() {
  console.log('Seeding administrative account...');
  try {
    const email = 'hecate@hecate.app';
    const password = 'amishapandey';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      console.log('Admin user already exists. Updating role to admin...');
      await prisma.user.update({
        where: { email: email },
        data: { role: 'admin', status: 'active' }
      });
      return;
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create Admin User
    const admin = await prisma.user.create({
      data: {
        email: email,
        passwordHash: hash,
        name: 'Amisha Admin',
        alias: 'hecate_admin',
        dob: new Date('1990-01-01'),
        cityState: 'Global',
        role: 'admin',
        status: 'active',
        verified: true
      }
    });

    console.log(`Admin account created: ${admin.email}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
