/**
 * analyzeExistingPosts.js
 * Analyzes sentiment for all posts currently in the database.
 */

const Database = require('better-sqlite3');
const path = require('path');
const axios = require('axios');

const DB_PATH = path.join(__dirname, 'dev.db');
const PYTHON_SERVICE_URL = 'http://localhost:5002/analyze-sentiment';

const db = new Database(DB_PATH);

async function run() {
  console.log('--- Analyzing Sentiment for Existing Posts ---');
  
  const posts = db.prepare('SELECT id, content FROM communityPosts WHERE sentimentLabel IS NULL').all();
  console.log(`Found ${posts.length} posts to analyze.`);

  const update = db.prepare('UPDATE communityPosts SET sentimentLabel = ?, sentimentScore = ? WHERE id = ?');

  for (const post of posts) {
    try {
      console.log(`Analyzing post ${post.id}...`);
      const response = await axios.post(PYTHON_SERVICE_URL, { text: post.content });
      
      if (response.data.success) {
        const { label, score } = response.data;
        update.run(label, score, post.id);
        console.log(`  Result: ${label} (${score})`);
      }
    } catch (e) {
      console.error(`  Failed to analyze post ${post.id}:`, e.message);
      // If the Python service is not running, we should stop and tell the user.
      if (e.code === 'ECONNREFUSED') {
        console.error('Python service is not running on port 5001. Please start it first.');
        break;
      }
    }
  }

  console.log('Finished analyzing posts.');
}

run().then(() => db.close());
