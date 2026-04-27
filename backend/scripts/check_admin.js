const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'hecate@hecate.app' }
  });
  console.log('--- ADMIN USER DATA ---');
  console.log(JSON.stringify(user, null, 2));
  console.log('-----------------------');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
