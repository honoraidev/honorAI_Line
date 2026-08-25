// 定期把Redis裡累積的摘要歷史記錄同步進NAS上的MySQL，成功寫入後才從Redis移除。
// 設計給在內網（例如Synology NAS）執行，因為NAS的MySQL通常不對外網開放。
require('dotenv').config();

const { Redis } = require('@upstash/redis');
const mysql = require('mysql2/promise');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const HISTORY_KEY = 'linechat:history';
const MESSAGE_KEY_PREFIX = 'linechat:messages:';
const CONVERSATIONS_SET_KEY = 'linechat:conversations';
const MAX_RECORDS_PER_RUN = 500;

function sourceTypeOf(conversationId) {
  return conversationId.split(':')[0];
}

async function ensureTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS conversation_summaries (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      conversation_id VARCHAR(255) NOT NULL,
      source_type VARCHAR(16) NOT NULL,
      message_count INT NOT NULL,
      summary TEXT NOT NULL,
      messages_json LONGTEXT NOT NULL,
      generated_at DATETIME NOT NULL,
      synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_conversation_generated (conversation_id, generated_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS conversation_messages (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      message_id VARCHAR(255) NOT NULL,
      conversation_id VARCHAR(255) NOT NULL,
      source_type VARCHAR(16) NOT NULL,
      line_user_id VARCHAR(255) NULL,
      display_name VARCHAR(255) NULL,
      message_type VARCHAR(32) NOT NULL,
      message_text LONGTEXT NOT NULL,
      raw_message_json LONGTEXT NULL,
      sent_at DATETIME(3) NOT NULL,
      synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_message_id (message_id),
      KEY idx_conversation_sent_at (conversation_id, sent_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
  `);
}

async function syncMessages(conn) {
  const registered = (await redis.smembers(CONVERSATIONS_SET_KEY).catch(() => [])) || [];
  const keys = (await redis.keys(`${MESSAGE_KEY_PREFIX}*`).catch(() => [])) || [];
  const conversationIds = Array.from(new Set([
    ...registered,
    ...keys.map((key) => key.slice(MESSAGE_KEY_PREFIX.length)),
  ]));
  let synced = 0;

  for (const conversationId of conversationIds) {
    const rawMessages = (await redis.lrange(MESSAGE_KEY_PREFIX + conversationId, 0, -1)) || [];
    for (const raw of rawMessages) {
      const message = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!message?.messageId) continue;
      const [result] = await conn.query(
        `INSERT IGNORE INTO conversation_messages
         (message_id, conversation_id, source_type, line_user_id, display_name,
          message_type, message_text, raw_message_json, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.messageId,
          conversationId,
          sourceTypeOf(conversationId),
          message.userId || null,
          message.displayName || null,
          message.messageType || 'unknown',
          message.text || '',
          message.rawMessage ? JSON.stringify(message.rawMessage) : null,
          new Date(message.timestamp),
        ]
      );
      synced += result.affectedRows || 0;
    }
  }
  return synced;
}

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  await ensureTable(conn);

  let synced = 0;
  let syncedMessages = 0;
  try {
    syncedMessages = await syncMessages(conn);
    for (let i = 0; i < MAX_RECORDS_PER_RUN; i++) {
      const raw = await redis.lindex(HISTORY_KEY, 0);
      if (!raw) break;

      const record = typeof raw === 'string' ? JSON.parse(raw) : raw;

      await conn.query(
        `INSERT IGNORE INTO conversation_summaries
         (conversation_id, source_type, message_count, summary, messages_json, generated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          record.conversationId,
          sourceTypeOf(record.conversationId),
          record.messages.length,
          record.summary,
          JSON.stringify(record.messages),
          new Date(record.generatedAt),
        ]
      );

      // 確認寫入MySQL成功後，才把這筆從Redis的歷史清單移除
      await redis.lpop(HISTORY_KEY);
      synced++;
    }
  } finally {
    await conn.end();
  }

  console.log(`[sync] synced ${syncedMessages} message(s) and ${synced} summary record(s) to MySQL at ${new Date().toISOString()}`);
}

run().catch((err) => {
  console.error('[sync] failed:', err.message);
  process.exit(1);
});
