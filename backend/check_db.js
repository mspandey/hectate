const Database = require('better-sqlite3');
const db = new Database('dev.db');
const comments = db.prepare('SELECT * FROM comments').all();
console.log(JSON.stringify(comments, null, 2));
db.close();
