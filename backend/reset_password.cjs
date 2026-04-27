const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, 'dev.db');
const db = new Database(DB_PATH);

const email = 'user@example.com';
const newPassword = 'Password123!';
const hash = bcrypt.hashSync(newPassword, 12);

const result = db.prepare('UPDATE users SET passwordHash = ? WHERE email = ?').run(hash, email);

if (result.changes > 0) {
  console.log(`Successfully updated password for ${email} to ${newPassword}`);
} else {
  console.log(`User ${email} not found.`);
}

db.close();
