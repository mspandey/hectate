/**
 * Self-contained admin seeder — no local db.js dependency
 * Run: node scripts/create-admin-now.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const EMAIL    = 'hecate@hecate.app';
  const PASSWORD = 'amishapandey';

  console.log('🔍 Checking for existing admin...');
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });

  if (existing) {
    console.log(`ℹ️  User already exists (role: ${existing.role}). Promoting to admin...`);
    await prisma.user.update({
      where: { email: EMAIL },
      data: { role: 'admin', status: 'active' },
    });
    console.log('✅ Role updated to admin. Try logging in now.');
    return;
  }

  const hash = await bcrypt.hash(PASSWORD, 10);
  const admin = await prisma.user.create({
    data: {
      email:        EMAIL,
      passwordHash: hash,
      name:         'Amisha Admin',
      alias:        'hecate_admin',
      dob:          new Date('1990-01-01'),
      cityState:    'Global',
      role:         'admin',
      status:       'active',
      verified:     true,
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
