const prisma = require('./db');

async function test() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hectate.app' }
    });
    console.log("Admin User Details:", user);
    await prisma.adminAuditLog.create({
      data: {
        adminId: 'test-id',
        adminEmail: 'test@example.com',
        ipAddress: '127.0.0.1',
        action: 'TEST_ACTION'
      }
    });
    console.log("✅ Success!");
  } catch (err) {
    console.error("❌ Failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
