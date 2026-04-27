/**
 * db.js — Hectate SQLite Database Layer
 * Replaces the MockDb with better-sqlite3.
 * Exports a Prisma-compatible client so all existing routes work unchanged.
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
// Open database
// ─────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'dev.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─────────────────────────────────────────────
// Schema bootstrap
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    mobileNumber TEXT UNIQUE,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL,
    alias TEXT UNIQUE NOT NULL,
    dob TEXT,
    cityState TEXT,
    verified INTEGER DEFAULT 0,
    verificationMethod TEXT,
    aadhaarHash TEXT UNIQUE,
    displayMode TEXT DEFAULT 'public',
    role TEXT DEFAULT 'user',
    googleId TEXT UNIQUE,
    failedLoginAttempts INTEGER DEFAULT 0,
    lockedUntil TEXT,
    totpSecret TEXT,
    sessionVersion INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    blockedAt TEXT,
    blockedBy TEXT,
    blockReason TEXT,
    unblockAt TEXT,
    bio TEXT,
    avatarUrl TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    userAgent TEXT,
    ipAddress TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    expiresAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS adminAuditLog (
    id TEXT PRIMARY KEY,
    adminId TEXT NOT NULL,
    adminEmail TEXT NOT NULL,
    action TEXT NOT NULL,
    targetType TEXT,
    targetId TEXT,
    reason TEXT,
    metadata TEXT,
    ipAddress TEXT NOT NULL,
    userAgent TEXT,
    success INTEGER DEFAULT 1,
    timestamp TEXT DEFAULT (datetime('now')),
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    cwTags TEXT,
    flagCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sosEvents (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    address TEXT,
    status TEXT DEFAULT 'active',
    cancelReason TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    resolvedAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS lawyerProfiles (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    barCouncilNo TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS verificationAttempts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    method TEXT,
    status TEXT,
    imageUrl TEXT,
    ocrResult TEXT,
    matchScore REAL,
    liveness INTEGER,
    ipAddress TEXT,
    deviceInfo TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS kycVerifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    fullName TEXT,
    idNumber TEXT,
    idType TEXT,
    documentUrl TEXT,
    status TEXT,
    message TEXT,
    providerResponse TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS securityLogs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT,
    ipAddress TEXT,
    deviceInfo TEXT,
    details TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS communityPosts (
    id TEXT PRIMARY KEY,
    authorId TEXT,
    authorName TEXT,
    authorHandle TEXT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Sharing',
    likes INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    replyCount INTEGER DEFAULT 0,
    tags TEXT,
    repliesJson TEXT,
    sentimentLabel TEXT,
    sentimentScore REAL,
    isFlagged INTEGER DEFAULT 0,
    timestamp TEXT DEFAULT (datetime('now')),
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    userName TEXT,
    content TEXT NOT NULL,
    supports INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (postId) REFERENCES communityPosts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS postLikes (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    postId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    UNIQUE(userId, postId)
  );

  CREATE TABLE IF NOT EXISTS savedPosts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    postId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    UNIQUE(userId, postId)
  );

  CREATE TABLE IF NOT EXISTS commentLikes (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    commentId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    UNIQUE(userId, commentId)
  );

  CREATE TABLE IF NOT EXISTS womenProfiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT UNIQUE,
    city TEXT,
    state TEXT,
    dob TEXT,
    aadhaarRef TEXT,
    avatarInitials TEXT,
    bio TEXT,
    tags TEXT,
    joined TEXT,
    verified INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lawyerDirectory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    college TEXT,
    quals TEXT,
    specs TEXT,
    rating REAL DEFAULT 0,
    totalReviews INTEGER DEFAULT 0,
    experienceYears INTEGER DEFAULT 0,
    location TEXT,
    reviewsJson TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL,
    reportedBy TEXT NOT NULL,
    reason TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (postId) REFERENCES communityPosts(id) ON DELETE CASCADE,
    FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(postId, reportedBy)
  );
`);

// ─── Migrations ──────────────────────────────────────────────
try { db.exec("ALTER TABLE communityPosts ADD COLUMN sentimentLabel TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE communityPosts ADD COLUMN sentimentScore REAL"); } catch (e) {}
try { db.exec("ALTER TABLE communityPosts ADD COLUMN isFlagged INTEGER DEFAULT 0"); } catch (e) {}

// ─────────────────────────────────────────────
// Migration: add updatedAt to new tables if missing, and migrate JSON comments
// ─────────────────────────────────────────────
['communityPosts', 'womenProfiles', 'lawyerDirectory', 'users'].forEach(table => {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  const colsToAdd = ['updatedAt', 'bio', 'avatarUrl'];
  // Add category column to communityPosts specifically
  if (table === 'communityPosts' && !cols.includes('category')) {
    try {
      db.prepare(`ALTER TABLE communityPosts ADD COLUMN category TEXT DEFAULT 'Sharing'`).run();
      console.log('[DB] Added category column to communityPosts');
    } catch (e) { /* already exists */ }
  }
  colsToAdd.forEach(col => {
    if (!cols.includes(col)) {
      try {
        db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT`).run();
        console.log(`[DB] Added ${col} column to ${table}`);
      } catch (e) {
        // Might already exist or table is special
      }
    }
  });
});

// One-time migration: communityPosts.repliesJson → comments table
const postsWithJSON = db.prepare("SELECT id, repliesJson FROM communityPosts WHERE repliesJson IS NOT NULL AND repliesJson != '[]'").all();
if (postsWithJSON.length > 0) {
  console.log(`[DB] Migrating comments for ${postsWithJSON.length} posts...`);
  const insertComment = db.prepare(`
    INSERT OR IGNORE INTO comments (id, postId, userId, userName, content, supports, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  postsWithJSON.forEach(post => {
    try {
      const replies = JSON.parse(post.repliesJson);
      if (Array.isArray(replies)) {
        replies.forEach(r => {
          insertComment.run(
            r.id || uuidv4(),
            post.id,
            r.user_id || 'unknown',
            r.user_name || 'Member',
            r.content || '',
            r.supports || 0,
            r.created_at || new Date().toISOString()
          );
        });
      }
      // Clear JSON after successful migration to prevent re-runs
      db.prepare("UPDATE communityPosts SET repliesJson = '[]' WHERE id = ?").run(post.id);
    } catch (e) {
      console.error(`[DB] Failed to migrate comments for post ${post.id}:`, e.message);
    }
  });
  console.log('[DB] Comment migration complete.');
}

// ─────────────────────────────────────────────
// Seed admin user
// ─────────────────────────────────────────────
const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
if (!adminExists) {
  const hash = bcrypt.hashSync('Admin@Hectate123', 12);
  db.prepare(`
    INSERT OR IGNORE INTO users
      (id, email, passwordHash, name, alias, dob, cityState, role, status, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), 'admin@hectate.app', hash,
         'Hectate Admin', 'hectate_admin', '1990-01-01', 'Global', 'admin', 'active', 1);
  console.log('[DB] Admin seeded → admin@hectate.app / Admin@Hectate123');
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function parseRow(row) {
  if (!row) return null;
  const out = { ...row };
  if ('verified'  in out) out.verified  = Boolean(out.verified);
  if ('success'   in out) out.success   = Boolean(out.success);
  if ('liveness'  in out) out.liveness  = out.liveness == null ? null : Boolean(out.liveness);
  return out;
}

/**
 * Convert a Prisma-style `where` object to SQL WHERE clause + params.
 * Supports: { col: val }, { OR: [...] }, { col: { gte, lte, gt, lt, contains } }
 */
function buildWhere(where) {
  if (!where || Object.keys(where).length === 0) return { sql: '', params: [] };

  const clauses = [];
  const params = [];

  for (const [col, val] of Object.entries(where)) {
    if (col === 'OR') {
      const orParts = val.map(clause => {
        const sub = buildWhere(clause);
        params.push(...sub.params);
        return `(${sub.sql.replace('WHERE ', '')})`;
      });
      clauses.push(`(${orParts.join(' OR ')})`);
    } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      // Prisma filter operators
      if ('gte' in val) { clauses.push(`${col} >= ?`); params.push(val.gte instanceof Date ? val.gte.toISOString() : val.gte); }
      if ('lte' in val) { clauses.push(`${col} <= ?`); params.push(val.lte instanceof Date ? val.lte.toISOString() : val.lte); }
      if ('gt'  in val) { clauses.push(`${col} > ?`);  params.push(val.gt  instanceof Date ? val.gt.toISOString()  : val.gt); }
      if ('lt'  in val) { clauses.push(`${col} < ?`);  params.push(val.lt  instanceof Date ? val.lt.toISOString()  : val.lt); }
      if ('contains' in val) { clauses.push(`${col} LIKE ?`); params.push(`%${val.contains}%`); }
      if ('in' in val && Array.isArray(val.in)) {
        if (val.in.length === 0) {
          clauses.push("1 = 0"); // Always false
        } else {
          const placeholders = val.in.map(() => '?').join(', ');
          clauses.push(`${col} IN (${placeholders})`);
          params.push(...val.in);
        }
      }
    } else {
      let v = val;
      if (v instanceof Date) v = v.toISOString();
      if (typeof v === 'boolean') v = v ? 1 : 0;
      clauses.push(`${col} = ?`);
      params.push(v);
    }
  }

  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

/**
 * Convert a data object for INSERT/UPDATE, serialising Dates and booleans.
 * Handles Prisma `{ increment: N }` shorthand.
 */
function prepareData(data, table, whereCol) {
  const prepared = {};
  const incrementMap = {}; // col → increment value

  for (const [k, v] of Object.entries(data)) {
    if (v !== null && typeof v === 'object' && !(v instanceof Date) && 'increment' in v) {
      incrementMap[k] = v.increment;
    } else if (v instanceof Date) {
      prepared[k] = v.toISOString();
    } else if (typeof v === 'boolean') {
      prepared[k] = v ? 1 : 0;
    } else {
      prepared[k] = v;
    }
  }
  return { prepared, incrementMap };
}

// ─────────────────────────────────────────────
// Model factory
// ─────────────────────────────────────────────
const tableColumns = {};
function getColumns(table) {
  if (!tableColumns[table]) {
    try {
      const info = db.pragma(`table_info(${table})`);
      tableColumns[table] = info.map(c => c.name);
    } catch (e) {
      console.warn(`[DB] Could not fetch columns for ${table}`, e);
      return [];
    }
  }
  return tableColumns[table];
}

function makeModel(table) {
  return {

    findUnique({ where, select }) {
      const [col, val] = Object.entries(where)[0];
      const v = val instanceof Date ? val.toISOString() : val;
      const row = db.prepare(`SELECT * FROM ${table} WHERE ${col} = ? LIMIT 1`).get(v);
      return Promise.resolve(applySelect(parseRow(row), select));
    },

    findFirst({ where } = {}) {
      const { sql, params } = buildWhere(where);
      const row = db.prepare(`SELECT * FROM ${table} ${sql} LIMIT 1`).get(...params);
      return Promise.resolve(parseRow(row));
    },

    findMany({ where, orderBy, take, select, include } = {}) {
      const { sql, params } = buildWhere(where);
      let query = `SELECT * FROM ${table} ${sql}`;
      if (orderBy) {
        const [col, dir] = Object.entries(orderBy)[0];
        query += ` ORDER BY ${col} ${dir === 'desc' ? 'DESC' : 'ASC'}`;
      }
      if (take) query += ` LIMIT ${Number(take)}`;
      const rows = db.prepare(query).all(...params).map(parseRow);
      if (select) return Promise.resolve(rows.map(r => applySelect(r, select)));
      return Promise.resolve(rows);
    },

    count({ where } = {}) {
      const { sql, params } = buildWhere(where);
      const result = db.prepare(`SELECT COUNT(*) as n FROM ${table} ${sql}`).get(...params);
      return Promise.resolve(result.n);
    },

    create({ data }) {
      const id = data.id || uuidv4();
      const now = new Date().toISOString();
      const colsInTable = getColumns(table);
      
      const fullData = { id, ...data };
      if (colsInTable.includes('createdAt') && !fullData.createdAt) {
        fullData.createdAt = now;
      }
      if (colsInTable.includes('updatedAt') && !fullData.updatedAt) {
        fullData.updatedAt = now;
      }
      
      const { prepared: rawPrepared } = prepareData(fullData);

      // Filter by table columns
      const prepared = {};
      for (const col of colsInTable) {
        if (col in rawPrepared) {
          prepared[col] = rawPrepared[col];
        }
      }

      const cols = Object.keys(prepared).join(', ');
      const placeholders = Object.keys(prepared).map(() => '?').join(', ');
      
      try {
        db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`)
          .run(...Object.values(prepared));
      } catch (err) {
        console.error(`[DB Error] Create failed in ${table}:`, err.message);
        throw err;
      }

      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
      return Promise.resolve(parseRow(row));
    },

    update({ where, data }) {
      const [col, val] = Object.entries(where)[0];
      const v = val instanceof Date ? val.toISOString() : val;
      const now = new Date().toISOString();
      const colsInTable = getColumns(table);
      
      const updatePayload = { ...data };
      if (colsInTable.includes('updatedAt')) {
        updatePayload.updatedAt = now;
      }
      
      const { prepared: rawPrepared, incrementMap } = prepareData(updatePayload);
      
      // Filter by table columns
      const prepared = {};
      for (const col of colsInTable) {
        if (col in rawPrepared) {
          prepared[col] = rawPrepared[col];
        }
      }

      const setClauses = [];
      const setParams = [];

      // Regular SET col = ?
      for (const [k, fieldVal] of Object.entries(prepared)) {
        setClauses.push(`${k} = ?`);
        setParams.push(fieldVal);
      }
      // Increment SET col = col + N
      for (const [k, n] of Object.entries(incrementMap)) {
        setClauses.push(`${k} = ${k} + ?`);
        setParams.push(n);
      }

      if (setClauses.length === 0) {
        const row = db.prepare(`SELECT * FROM ${table} WHERE ${col} = ? LIMIT 1`).get(v);
        return Promise.resolve(parseRow(row));
      }

      db.prepare(`UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${col} = ?`)
        .run(...setParams, v);

      const row = db.prepare(`SELECT * FROM ${table} WHERE ${col} = ? LIMIT 1`).get(v);
      return Promise.resolve(parseRow(row));
    },

    upsert({ where, update: updateData, create: createData }) {
      const [col, val] = Object.entries(where)[0];
      const existing = db.prepare(`SELECT * FROM ${table} WHERE ${col} = ? LIMIT 1`).get(val);
      if (existing) {
        return this.update({ where, data: updateData });
      } else {
        return this.create({ data: { ...createData, [col]: val } });
      }
    },

    delete({ where }) {
      const [col, val] = Object.entries(where)[0];
      const row = db.prepare(`SELECT * FROM ${table} WHERE ${col} = ? LIMIT 1`).get(val);
      db.prepare(`DELETE FROM ${table} WHERE ${col} = ?`).run(val);
      return Promise.resolve(parseRow(row));
    }
  };
}

/** Apply a Prisma `select` mask to a row object */
function applySelect(row, select) {
  if (!row || !select) return row;
  const out = {};
  for (const [k, v] of Object.entries(select)) {
    if (v) out[k] = row[k];
  }
  return out;
}

// ─────────────────────────────────────────────
// Export Prisma-compatible client
// ─────────────────────────────────────────────
const prisma = {
  user:                makeModel('users'),
  session:             makeModel('sessions'),
  adminAuditLog:       makeModel('adminAuditLog'),
  post:                makeModel('posts'),
  sOSEvent:            makeModel('sosEvents'),
  lawyerProfile:       makeModel('lawyerProfiles'),
  verificationAttempt: makeModel('verificationAttempts'),
  kYCVerification:     makeModel('kycVerifications'),
  securityLog:         makeModel('securityLogs'),
  // ── New databases ──
  communityPost:       makeModel('communityPosts'),
  comment:             makeModel('comments'),
  postLike:            makeModel('postLikes'),
  savedPost:           makeModel('savedPosts'),
  commentLike:         makeModel('commentLikes'),
  womanProfile:        makeModel('womenProfiles'),
  lawyerDirectory:     makeModel('lawyerDirectory'),
  report:              makeModel('reports'),

  async $connect()    { return Promise.resolve(); },
  async $disconnect() { db.close(); },
  _raw: db,
};

console.log(`[DB] Connected → ${DB_PATH}`);
module.exports = prisma;
