const prisma = require('./db');
const bcrypt = require('bcrypt');

async function verifyAllUsers() {
  const users = await prisma.user.findMany();
  console.log('--- Verifying Passwords ---');
  
  const testPasswords = {
    'admin@hectate.app': 'Admin@Hectate123',
    'admin_test@hectate.app': 'admin123',
    'user@example.com': 'Password123!',
    'test@example.com': 'password123'
  };

  for (const user of users) {
    const testPass = testPasswords[user.email];
    if (testPass) {
      const isMatch = await bcrypt.compare(testPass, user.passwordHash);
      console.log(`Email: ${user.email} | Provided: ${testPass} | Match: ${isMatch}`);
    } else {
      console.log(`Email: ${user.email} | No test password defined.`);
    }
  }
}

verifyAllUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
