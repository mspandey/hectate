const db = require('./db.js');
const { v4: uuidv4 } = require('uuid');

async function seedPosts() {
  const newUser = {
    id: uuidv4(),
    email: 'test@example.com',
    passwordHash: 'dummy',
    name: 'Test User',
    alias: 'testuser',
    role: 'user',
    status: 'active',
    verified: 1
  };
  await db.user.create({ data: newUser });

  const newPost = {
    id: `P_${Date.now()}`,
    authorId: newUser.id,
    authorName: newUser.name,
    authorHandle: '@testuser',
    content: 'This is a test post from a different user!',
    category: 'Sharing',
    likes: 5,
    replyCount: 2
  };
  await db.communityPost.create({ data: newPost });
  console.log('Seeded test user and post');

  const posts = await db.communityPost.findMany();
  console.log('Total posts:', posts.length);
  console.log(posts.map(p => ({id: p.id, authorId: p.authorId, authorName: p.authorName, content: p.content})));
}

seedPosts();
