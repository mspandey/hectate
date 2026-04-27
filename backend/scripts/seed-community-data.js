/**
 * server/scripts/seed-community-data.js
 * Seeds communityPosts, womenProfiles, and lawyerDirectory tables.
 * Run: node server/scripts/seed-community-data.js
 */

'use strict';
const path   = require('path');
const fs     = require('fs');
const prisma = require('../db');

// ── Load ES module files by transpiling export → CommonJS assignment ──────────
function requireESM(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  // Replace  "export const FOO = ..."  →  "exports.FOO = ..."
  src = src.replace(/export\s+const\s+(\w+)/g, 'exports.$1');
  // Remove  "export default FOO;"
  src = src.replace(/export\s+default\s+\w+\s*;?/g, '');
  const m = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('exports', 'require', '__dirname', '__filename', src)(
    m.exports, require, path.dirname(filePath), filePath
  );
  return m.exports;
}

const root = path.join(__dirname, '..', '..', 'src', 'data');
const { LAWYERS_DATABASE } = requireESM(path.join(root, 'lawyers_database.js'));
const { COMMUNITY_FEED }   = requireESM(path.join(root, 'community_feed.js'));
const { WOMEN_DATABASE }   = requireESM(path.join(root, 'women_database.js'));

async function seed() {
  console.log(`[SEED] Lawyers: ${LAWYERS_DATABASE.length}, Posts: ${COMMUNITY_FEED.length}, Women: ${WOMEN_DATABASE.length}`);

  // ── lawyerDirectory ──
  let lIns = 0;
  for (const l of LAWYERS_DATABASE) {
    const ex = await prisma.lawyerDirectory.findUnique({ where: { id: l.id } });
    if (!ex) {
      await prisma.lawyerDirectory.create({ data: {
        id: l.id, name: l.name, title: l.title, college: l.college,
        quals: JSON.stringify(l.quals), specs: JSON.stringify(l.specs),
        rating: l.rating, totalReviews: l.total_reviews,
        experienceYears: l.experience_years, location: l.location,
        reviewsJson: JSON.stringify(l.reviews),
      }});
      lIns++;
    }
  }
  console.log(`[SEED] lawyerDirectory: ${lIns} inserted, ${LAWYERS_DATABASE.length - lIns} skipped`);

  // ── communityPosts ──
  let pIns = 0;
  for (const p of COMMUNITY_FEED) {
    const ex = await prisma.communityPost.findUnique({ where: { id: p.id } });
    if (!ex) {
      await prisma.communityPost.create({ data: {
        id: p.id, authorId: p.author_id, authorName: p.author_name,
        authorHandle: p.author_handle, content: p.content,
        likes: p.likes, reposts: p.reposts, replyCount: p.reply_count,
        tags: JSON.stringify(p.tags), repliesJson: JSON.stringify(p.replies),
        timestamp: p.timestamp,
      }});
      pIns++;
    }
  }
  console.log(`[SEED] communityPosts: ${pIns} inserted, ${COMMUNITY_FEED.length - pIns} skipped`);

  // ── womenProfiles ──
  let wIns = 0;
  for (const w of WOMEN_DATABASE) {
    const ex = await prisma.womanProfile.findUnique({ where: { id: w.id } });
    if (!ex) {
      await prisma.womanProfile.create({ data: {
        id: w.id, name: w.name, handle: w.handle,
        city: w.city, state: w.state, dob: w.dob,
        aadhaarRef: w.aadhaar_ref, avatarInitials: w.avatar_initials,
        bio: w.bio, tags: JSON.stringify(w.tags),
        joined: w.joined, verified: w.verified ? 1 : 0,
      }});
      wIns++;
    }
  }
  console.log(`[SEED] womenProfiles: ${wIns} inserted, ${WOMEN_DATABASE.length - wIns} skipped`);

  console.log('[SEED] ✅ All done.');
  await prisma.$disconnect();
}

seed().catch(err => { console.error('[SEED] Fatal:', err.message); process.exit(1); });
