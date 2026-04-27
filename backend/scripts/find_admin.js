const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAdmin() {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['admin', 'super_admin', 'moderator'] },
      status: 'active'
    }
  });
  console.log(JSON.stringify(admins, null, 2));
}

findAdmin().finally(() => prisma.$disconnect());
