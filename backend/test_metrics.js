const prisma = require('./db');

async function test() {
  try {
    console.log('Testing metrics queries...');
    
    const totalUsers = await prisma.user.count({ where: { role: 'user' } });
    console.log('totalUsers:', totalUsers);
    
    const pendingVerification = await prisma.verificationAttempt.count({ where: { status: 'pending_review' } });
    console.log('pendingVerification:', pendingVerification);
    
    const flaggedContent = await prisma.post.count({ where: { flagCount: { gte: 3 } } });
    console.log('flaggedContent:', flaggedContent);
    
    // Check others
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sosToday = await prisma.sOSEvent.count({ where: { createdAt: { gte: today } } });
    console.log('sosToday:', sosToday);
    
    const activeSOS = await prisma.sOSEvent.count({ where: { status: 'active' } });
    console.log('activeSOS:', activeSOS);

    const activeUsers = await prisma.user.count({ where: { status: 'active' } });
    console.log('activeUsers:', activeUsers);
    
    const verifiedUsers = await prisma.user.count({ where: { verified: true } });
    console.log('verifiedUsers:', verifiedUsers);
    
    const rejectedUsers = await prisma.verificationAttempt.count({ where: { status: 'failed' } });
    console.log('rejectedUsers:', rejectedUsers);

    console.log('All queries succeeded!');
  } catch (error) {
    console.error('Query failed:', error.message);
    console.error(error.stack);
  }
}

test();
