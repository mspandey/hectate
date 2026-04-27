const prisma = require('./db');

async function main() {
  const users = await prisma.user.findMany();
  
  console.log("All Users in DB:");
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Status: ${u.status}, Verified: ${u.verified}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
