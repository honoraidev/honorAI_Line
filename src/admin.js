const crypto = require('node:crypto');
const mysql = require('mysql2/promise');

let pool;

function safeEqual(actual, expected) {
  const actualBuffer = Buffer.from(actual || '');
  const expectedBuffer = Buffer.from(expected || '');
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function adminAuth(req, res, next) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    return res.status(503).json({ error: '後台尚未設定 ADMIN_USERNAME 與 ADMIN_PASSWORD。' });
  }

  const header = req.get('authorization') || '';
  const encoded = header.startsWith('Basic ') ? header.slice(6) : '';
  const [providedUser, providedPassword] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
  if (!safeEqual(providedUser, username) || !safeEqual(providedPassword, password)) {
    res.set('WWW-Authenticate', 'Basic realm="LineChat Admin", charset="UTF-8"');
    return res.status(401).json({ error: '需要管理員帳號。' });
  }
  return next();
}

function getPool() {
  if (pool) return pool;
  const required = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DATABASE'];
  if (required.some((key) => !process.env[key])) {
    throw new Error('後台尚未設定 MySQL 連線資訊。');
  }
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    charset: 'utf8mb4',
  });
  return pool;
}

function dateFilter(value, endOfDay = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  return `${value} ${endOfDay ? '23:59:59.999' : '00:00:00.000'}`;
}

function messageWhere(query) {
  const where = [];
  const values = [];
  const from = dateFilter(query.from);
  const to = dateFilter(query.to, true);
  const keyword = String(query.q || '').trim();
  if (from) { where.push('sent_at >= ?'); values.push(from); }
  if (to) { where.push('sent_at <= ?'); values.push(to); }
  if (keyword) {
    where.push('(conversation_id LIKE ? OR display_name LIKE ? OR message_text LIKE ?)');
    values.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }
  return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', values };
}

async function listConversations(query) {
  const { clause, values } = messageWhere(query);
  const [rows] = await getPool().query(
    `SELECT conversation_id, COUNT(*) AS message_count, MAX(sent_at) AS last_message_at,
            GROUP_CONCAT(DISTINCT NULLIF(display_name, '') ORDER BY display_name SEPARATOR '、') AS participants
     FROM conversation_messages ${clause}
     GROUP BY conversation_id
     ORDER BY last_message_at DESC
     LIMIT 100`,
    values
  );
  return rows;
}

async function listMessages(query) {
  const conversationId = String(query.conversationId || '').trim();
  if (!conversationId) throw new Error('請先選擇對話。');
  const { clause, values } = messageWhere(query);
  const where = clause ? `${clause} AND conversation_id = ?` : 'WHERE conversation_id = ?';
  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 200);
  const offset = Math.max(Number(query.offset) || 0, 0);
  const [rows] = await getPool().query(
    `SELECT message_id, conversation_id, display_name, message_type, message_text, sent_at
     FROM conversation_messages ${where}
     ORDER BY sent_at ASC, id ASC LIMIT ? OFFSET ?`,
    [...values, conversationId, limit, offset]
  );
  return rows;
}

async function listSummaries(query) {
  const where = [];
  const values = [];
  const conversationId = String(query.conversationId || '').trim();
  const from = dateFilter(query.from);
  const to = dateFilter(query.to, true);
  if (conversationId) { where.push('conversation_id = ?'); values.push(conversationId); }
  if (from) { where.push('generated_at >= ?'); values.push(from); }
  if (to) { where.push('generated_at <= ?'); values.push(to); }
  const [rows] = await getPool().query(
    `SELECT id, conversation_id, message_count, summary, generated_at
     FROM conversation_summaries ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY generated_at DESC LIMIT 100`,
    values
  );
  return rows;
}

module.exports = { adminAuth, listConversations, listMessages, listSummaries };
