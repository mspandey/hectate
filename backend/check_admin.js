const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['admin', 'super_admin', 'moderator']
      }
    }
  });
  
  console.log("Found admins:", admins.map(a => ({ id: a.id, email: a.email, role: a.role, status: a.status })));

  if (admins.length === 0) {
    console.log("No admin found. Creating one...");
    const hash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@hectate.com',
        passwordHash: hash,
        name: 'Admin',
        alias: 'admin',
        dob: new Date('1990-01-01'),
        gender: 'Female',
        verified: true,
        role: 'super_admin',
        status: 'active'
      }
    });
    console.log("Created admin:", admin.email, "Password: admin123");
  } else {
    // reset password of the first admin to admin123 for testing
    console.log("Resetting password of", admins[0].email, "to 'admin123'...");
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { id: admins[0].id },
      data: { passwordHash: hash, status: 'active' }
    });
    console.log("Password reset successful.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
