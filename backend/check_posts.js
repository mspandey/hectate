const db = require('./db.js');
async function main() {
  const posts = await db.communityPost.findMany();
  console.log('Total posts:', posts.length);
  console.log(posts.map(p => ({id: p.id, authorId: p.authorId, authorName: p.authorName})));
}
main();
