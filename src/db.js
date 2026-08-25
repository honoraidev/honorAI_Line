const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY_PREFIX = 'linechat:messages:';
const HISTORY_KEY = 'linechat:history';
const CONVERSATIONS_SET_KEY = 'linechat:conversations';
const registeredConversations = new Set();

// 登記對話 ID 至活躍訂閱集合（利用記憶體快取避免重複發起 Redis 網路請求）
async function registerConversation(conversationId) {
  try {
    if (conversationId && !conversationId.startsWith('unknown:') && !registeredConversations.has(conversationId)) {
      registeredConversations.add(conversationId);
      await redis.sadd(CONVERSATIONS_SET_KEY, conversationId);
    }
  } catch (err) {
    console.error('[db] registerConversation error:', err.message);
  }
}

// conversationId 例如 "user:U123" 或 "group:G123" 或 "room:R123"
async function appendMessage(conversationId, message) {
  await registerConversation(conversationId);
  await redis.rpush(KEY_PREFIX + conversationId, JSON.stringify(message));
}

async function getMessages(conversationId) {
  const raw = await redis.lrange(KEY_PREFIX + conversationId, 0, -1);
  return raw.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
}

// 快速取得最近 N 則訊息（極速精簡，專為 AI 即時諮詢加速設計）
async function getRecentMessages(conversationId, limit = 8) {
  try {
    const raw = await redis.lrange(KEY_PREFIX + conversationId, -limit, -1);
    return raw.map((item) => (typeof item === 'string' ? JSON.parse(item) : item)).filter(Boolean);
  } catch (err) {
    console.error('[db] getRecentMessages error:', err.message);
    return [];
  }
}

async function getAllConversationIds() {
  try {
    const registered = (await redis.smembers(CONVERSATIONS_SET_KEY).catch(() => [])) || [];
    const keys = (await redis.keys(`${KEY_PREFIX}*`).catch(() => [])) || [];
    const fromKeys = keys.map((key) => key.slice(KEY_PREFIX.length));
    return Array.from(new Set([...registered, ...fromKeys]));
  } catch (err) {
    console.error('[db] getAllConversationIds error:', err.message);
    return [];
  }
}

function getDayTimestampRange(date = new Date(), timeZone = 'Asia/Taipei') {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(date); // YYYY-MM-DD
  const startOfDay = new Date(`${dateStr}T00:00:00+08:00`).getTime();
  const endOfDay = new Date(`${dateStr}T23:59:59.999+08:00`).getTime();
  return { dateStr, startOfDay, endOfDay };
}

async function getTodayMessages(conversationId, timeZone = 'Asia/Taipei') {
  const messages = await getMessages(conversationId);
  if (!messages || !messages.length) return [];

  const { startOfDay, endOfDay } = getDayTimestampRange(new Date(), timeZone);
  const todayMsgs = messages.filter((m) => {
    const ts = typeof m.timestamp === 'number' ? m.timestamp : new Date(m.timestamp).getTime();
    return ts >= startOfDay && ts <= endOfDay;
  });

  // 若今日時段有訊息則回傳今日全天紀錄；若為跨日或剛過午夜則回傳過去 24 小時內之訊息
  if (todayMsgs.length > 0) return todayMsgs;

  const past24hCutoff = Date.now() - 24 * 60 * 60 * 1000;
  return messages.filter((m) => {
    const ts = typeof m.timestamp === 'number' ? m.timestamp : new Date(m.timestamp).getTime();
    return ts >= past24hCutoff;
  });
}

async function pruneOldMessages(conversationId, maxAgeDays = 3) {
  try {
    const messages = await getMessages(conversationId);
    if (!messages || !messages.length) return;
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    const fresh = messages.filter((m) => {
      const ts = typeof m.timestamp === 'number' ? m.timestamp : new Date(m.timestamp).getTime();
      return ts >= cutoff;
    });
    if (fresh.length !== messages.length) {
      await redis.del(KEY_PREFIX + conversationId);
      if (fresh.length > 0) {
        await redis.rpush(
          KEY_PREFIX + conversationId,
          ...fresh.map((m) => JSON.stringify(m))
        );
      }
    }
  } catch (err) {
    console.error('[db] pruneOldMessages error:', err.message);
  }
}

async function clearMessages(conversationId) {
  await redis.del(KEY_PREFIX + conversationId);
}

const LOCK_PREFIX = 'linechat:lock:';

// 確保同一個排程任務（如晚間總結、晨間新聞）在同一天不論被幾個來源觸發，都只真正執行一次
// 回傳 true 代表本次呼叫成功取得鎖（應執行任務），false 代表今日已執行過（應跳過）
async function acquireDailyLock(jobName, timeZone = 'Asia/Taipei') {
  try {
    const { dateStr } = getDayTimestampRange(new Date(), timeZone);
    const key = `${LOCK_PREFIX}${jobName}:${dateStr}`;
    const result = await redis.set(key, new Date().toISOString(), { nx: true, ex: 25 * 60 * 60 });
    return result === 'OK' || result === true;
  } catch (err) {
    console.error('[db] acquireDailyLock error:', err.message);
    // Redis 異常時放行，避免鎖機制故障導致任務完全無法執行
    return true;
  }
}

// 每次產生摘要時留一份完整記錄（含原始訊息），供同步程式備份到外部資料庫後再清除
async function appendHistory(record) {
  await redis.rpush(HISTORY_KEY, JSON.stringify(record));
}

// 讀取指定對話最近的歷史總結紀錄（未被 sync-to-mysql.js 搬走前，仍留在 Redis 裡）
async function getHistory(conversationId, limit = 5) {
  try {
    const raw = (await redis.lrange(HISTORY_KEY, -200, -1).catch(() => [])) || [];
    const records = raw
      .map((item) => (typeof item === 'string' ? JSON.parse(item) : item))
      .filter((r) => r && r.conversationId === conversationId);
    return records.slice(-limit);
  } catch (err) {
    console.error('[db] getHistory error:', err.message);
    return [];
  }
}

const SEEN_NEWS_KEY = 'linechat:seen_news';
const inMemorySeen = new Set();

async function getSeenNewsUrls() {
  try {
    const urls = (await redis.smembers(SEEN_NEWS_KEY).catch(() => [])) || [];
    if (urls && Array.isArray(urls)) {
      urls.forEach((u) => inMemorySeen.add(u));
    }
    return Array.from(inMemorySeen);
  } catch (err) {
    console.error('[db] getSeenNewsUrls error:', err.message);
    return Array.from(inMemorySeen);
  }
}

async function recordSeenNews(items) {
  if (!items || !items.length) return;
  const list = (Array.isArray(items) ? items : [items]).filter(Boolean);
  if (!list.length) return;
  list.forEach((item) => inMemorySeen.add(item));
  try {
    await redis.sadd(SEEN_NEWS_KEY, ...list);
  } catch (err) {
    console.error('[db] recordSeenNews error:', err.message);
  }
}

async function clearSeenNews() {
  inMemorySeen.clear();
  try {
    await redis.del(SEEN_NEWS_KEY);
  } catch (err) {
    console.error('[db] clearSeenNews error:', err.message);
  }
}

const NOTES_PREFIX = 'linechat:notes:';

async function addNote(conversationId, note) {
  try {
    const noteRecord = {
      id: note.id || `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: note.title || '一般記事',
      category: note.category || '📋 待辦',
      details: note.details || '',
      dueDate: note.dueDate || '',
      createdAt: note.createdAt || new Date().toISOString(),
    };
    await redis.rpush(NOTES_PREFIX + conversationId, JSON.stringify(noteRecord));
    return noteRecord;
  } catch (err) {
    console.error('[db] addNote error:', err.message);
    return null;
  }
}

async function getNotes(conversationId) {
  try {
    const raw = (await redis.lrange(NOTES_PREFIX + conversationId, 0, -1).catch(() => [])) || [];
    return raw.map((item) => (typeof item === 'string' ? JSON.parse(item) : item)).filter(Boolean);
  } catch (err) {
    console.error('[db] getNotes error:', err.message);
    return [];
  }
}

async function removeNote(conversationId, noteIdOrIndex) {
  try {
    const notes = await getNotes(conversationId);
    let filtered;
    if (typeof noteIdOrIndex === 'number') {
      filtered = notes.filter((_, idx) => idx !== noteIdOrIndex);
    } else {
      filtered = notes.filter((n) => n.id !== noteIdOrIndex && !n.title.includes(noteIdOrIndex));
    }
    await redis.del(NOTES_PREFIX + conversationId);
    for (const n of filtered) {
      await redis.rpush(NOTES_PREFIX + conversationId, JSON.stringify(n));
    }
    return filtered;
  } catch (err) {
    console.error('[db] removeNote error:', err.message);
    return [];
  }
}

async function clearNotes(conversationId) {
  try {
    await redis.del(NOTES_PREFIX + conversationId);
  } catch (err) {
    console.error('[db] clearNotes error:', err.message);
  }
}

const SETTINGS_PREFIX = 'linechat:settings:';
const SUMMARY_CURSOR_PREFIX = 'linechat:summary-cursor:';
const settingsCache = new Map();
const SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000; // 快取 5 分鐘

async function getConversationSettings(conversationId) {
  const cached = settingsCache.get(conversationId);
  if (cached && Date.now() - cached.time < SETTINGS_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const raw = await redis.get(SETTINGS_PREFIX + conversationId);
    const defaultNews = process.env.DEFAULT_NEWS_ENABLED === 'true';
    const defaultSummary = process.env.DEFAULT_SUMMARY_ENABLED !== 'false';
    let data;
    if (!raw) {
      data = {
        newsEnabled: defaultNews,
        summaryEnabled: defaultSummary,
        isDefault: true,
      };
    } else {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      data = {
        newsEnabled: typeof parsed.newsEnabled === 'boolean' ? parsed.newsEnabled : defaultNews,
        summaryEnabled: typeof parsed.summaryEnabled === 'boolean' ? parsed.summaryEnabled : defaultSummary,
        updatedAt: parsed.updatedAt,
        isDefault: false,
      };
    }
    settingsCache.set(conversationId, { data, time: Date.now() });
    return data;
  } catch (err) {
    console.error('[db] getConversationSettings error:', err.message);
    return {
      newsEnabled: process.env.DEFAULT_NEWS_ENABLED === 'true',
      summaryEnabled: process.env.DEFAULT_SUMMARY_ENABLED !== 'false',
      isDefault: true,
    };
  }
}

async function updateConversationSettings(conversationId, partial) {
  try {
    await registerConversation(conversationId);
    const current = await getConversationSettings(conversationId);
    const updated = {
      ...current,
      ...partial,
      isDefault: false,
      updatedAt: new Date().toISOString(),
    };
    settingsCache.set(conversationId, { data: updated, time: Date.now() });
    await redis.set(SETTINGS_PREFIX + conversationId, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('[db] updateConversationSettings error:', err.message);
    return {
      newsEnabled: partial.newsEnabled ?? false,
      summaryEnabled: partial.summaryEnabled ?? true,
      isDefault: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

async function getNewsSubscriberIds() {
  try {
    const allConvs = await getAllConversationIds();
    const subscribers = [];
    for (const convId of allConvs) {
      const settings = await getConversationSettings(convId);
      if (settings.newsEnabled) {
        subscribers.push(convId);
      }
    }
    return subscribers;
  } catch (err) {
    console.error('[db] getNewsSubscriberIds error:', err.message);
    return [];
  }
}

async function getSummarySubscriberIds() {
  try {
    const allConvs = await getAllConversationIds();
    const subscribers = [];
    for (const convId of allConvs) {
      const settings = await getConversationSettings(convId);
      if (settings.summaryEnabled) {
        subscribers.push(convId);
      }
    }
    return subscribers;
  } catch (err) {
    console.error('[db] getSummarySubscriberIds error:', err.message);
    return [];
  }
}

async function getSummaryCursor(conversationId) {
  try {
    const raw = await redis.get(SUMMARY_CURSOR_PREFIX + conversationId);
    if (!raw) return null;
    const timestamp = new Date(typeof raw === 'string' ? raw : String(raw)).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  } catch (err) {
    console.error('[db] getSummaryCursor error:', err.message);
    return null;
  }
}

async function setSummaryCursor(conversationId, timestamp) {
  try {
    await redis.set(SUMMARY_CURSOR_PREFIX + conversationId, new Date(timestamp).toISOString());
  } catch (err) {
    console.error('[db] setSummaryCursor error:', err.message);
    throw err;
  }
}

async function getMessagesSinceSummaryCursor(conversationId, endAt = Date.now()) {
  const messages = await getMessages(conversationId);
  const savedCursor = await getSummaryCursor(conversationId);
  // On a newly subscribed conversation, start with the prior 24 hours. The
  // cursor is advanced only by a successful automatic summary run.
  const startAt = savedCursor ?? endAt - 24 * 60 * 60 * 1000;
  const pending = messages.filter((m) => {
    const timestamp = typeof m.timestamp === 'number' ? m.timestamp : new Date(m.timestamp).getTime();
    // Including the exact boundary is preferable to ever losing a message that
    // happens to share a timestamp with the last completed run.
    return Number.isFinite(timestamp) && timestamp >= startAt && timestamp <= endAt;
  });
  return { messages: pending, startAt, endAt };
}

module.exports = {
  registerConversation,
  appendMessage,
  getMessages,
  getRecentMessages,
  getTodayMessages,
  pruneOldMessages,
  getAllConversationIds,
  clearMessages,
  acquireDailyLock,
  appendHistory,
  getHistory,
  getSeenNewsUrls,
  recordSeenNews,
  clearSeenNews,
  addNote,
  getNotes,
  removeNote,
  clearNotes,
  getConversationSettings,
  updateConversationSettings,
  getNewsSubscriberIds,
  getSummarySubscriberIds,
  getSummaryCursor,
  setSummaryCursor,
  getMessagesSinceSummaryCursor,
  HISTORY_KEY,
  CONVERSATIONS_SET_KEY,
  SEEN_NEWS_KEY,
  NOTES_PREFIX,
  SETTINGS_PREFIX,
  SUMMARY_CURSOR_PREFIX,
};

