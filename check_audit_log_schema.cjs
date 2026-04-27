const prisma = require('./backend/db');
async function run() {
  try {
    const info = prisma._raw.prepare("PRAGMA table_info(adminAuditLog)").all();
    console.log(JSON.stringify(info, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    prisma.$disconnect();
  }
}
run();
