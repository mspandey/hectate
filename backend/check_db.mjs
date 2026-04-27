import Database from 'better-sqlite3';

const db = new Database('backend/dev.db');

const tables = ['communityPosts', 'reports', 'users', 'postLikes', 'savedPosts', 'comments', 'commentLikes'];

tables.forEach(table => {
    try {
        const columns = db.prepare(`PRAGMA table_info(${table})`).all();
        console.log(`\nTable: ${table}`);
        columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
        });
    } catch (e) {
        console.log(`\nTable: ${table} NOT FOUND or ERROR: ${e.message}`);
    }
});
