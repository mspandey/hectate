const prisma = require('./db');
const bcrypt = require('bcrypt');

async function testLogin(email, password) {
  console.log(`Testing login for ${email} with password ${password}...`);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("User not found.");
    return;
  }
  
  console.log("User found:", user.email, "Role:", user.role, "Status:", user.status);
  
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  console.log("Password match:", isMatch);
}

testLogin('admin@hectate.app', 'Admin@Hectate123')
  .catch(console.error)
  .finally(() => prisma.$disconnect());
