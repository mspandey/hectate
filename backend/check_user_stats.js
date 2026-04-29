const prisma = require('./db');

async function checkUserStats() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      status: true,
      failedLoginAttempts: true,
      lockedUntil: true
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

checkUserStats()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
