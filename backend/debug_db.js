const prisma = require('./db');

async function main() {
  const users = await prisma.user.findMany({
    where: {
      role: {
        OR: [
          { contains: 'admin' },
          { contains: 'moderator' }
        ]
      }
    }
  });
  
  console.log("Admin Users in DB:");
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Status: ${u.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
