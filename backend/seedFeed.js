/**
 * seedFeed.js
 * Loads posts from client/src/data/community_feed.js into the SQLite database.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'dev.db');
const FEED_DATA_PATH = path.join(__dirname, '../client/src/data/community_feed.js');

const db = new Database(DB_PATH);

function seed() {
  console.log('--- Seeding Community Feed ---');
  
  if (!fs.existsSync(FEED_DATA_PATH)) {
    console.error('Source file not found:', FEED_DATA_PATH);
    return;
  }

  const content = fs.readFileSync(FEED_DATA_PATH, 'utf8');
  const searchStr = 'export const COMMUNITY_FEED = ';
  const startIdx = content.indexOf(searchStr);
  
  if (startIdx === -1) {
    console.error('Could not find COMMUNITY_FEED export.');
    return;
  }

  const arrayStart = content.indexOf('[', startIdx);
  const arrayEnd = content.lastIndexOf(']');
  
  if (arrayStart === -1 || arrayEnd === -1) {
    console.error('Could not find COMMUNITY_FEED array bounds.');
    return;
  }

  let dataStr = content.substring(arrayStart, arrayEnd + 1);
  // console.log('dataStr head:', dataStr.substring(0, 50));
  // console.log('dataStr tail:', dataStr.substring(dataStr.length - 50));
  
  let COMMUNITY_FEED;
  try {
    COMMUNITY_FEED = eval(`(${dataStr})`);
  } catch (e) {
    console.error('Failed to parse COMMUNITY_FEED array:', e.message);
    return;
  }

  console.log(`Found ${COMMUNITY_FEED.length} posts to seed.`);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO communityPosts (
      id, authorId, authorName, authorHandle, content, 
      likes, reposts, replyCount, tags, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((posts) => {
    for (const p of posts) {
      insert.run(
        p.id,
        p.author_id,
        p.author_name,
        p.author_handle,
        p.content,
        p.likes || 0,
        p.reposts || 0,
        p.reply_count || 0,
        Array.isArray(p.tags) ? p.tags.join(',') : '',
        p.timestamp || new Date().toISOString()
      );
    }
  });

  insertMany(COMMUNITY_FEED);
  console.log('Successfully seeded community feed.');
}

seed();
db.close();
