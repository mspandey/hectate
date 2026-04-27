require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany();
  
  console.log("Users in PRISMA DB (backend/prisma/dev.db):");
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Status: ${u.status}`);
  });
  await prisma.$disconnect();
}

main().catch(console.error);
