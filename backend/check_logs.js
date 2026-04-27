const prisma = require('./db');

async function main() {
  const logs = await prisma.securityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.log("Recent Security Logs:");
  logs.forEach(l => {
    console.log(`- Time: ${l.createdAt}, Action: ${l.action}, Details: ${l.details}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
