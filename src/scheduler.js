const cron = require('node-cron');
const { client } = require('./line');
const db = require('./db');
const { summarizeConversation } = require('./summarize');
const { createExecutiveSummaryFlex, createConstructionNewsFlex } = require('./flex');
const { getDailyConstructionDigest } = require('./news');

function extractTargetId(conversationId) {
  if (!conversationId) return null;
  if (conversationId.includes(':')) {
    const [, id] = conversationId.split(':');
    return id;
  }
  return conversationId;
}

/**
 * 執行每日晚間對話總結與歸檔（僅推播給有開啟摘要訂閱的對話）
 */
async function runSummaryJob() {
  const acquired = await db.acquireDailyLock('summary');
  if (!acquired) {
    console.log('[summary-job] Already sent today, skipping duplicate trigger.');
    return;
  }

  console.log('[summary-job] Starting daily conversation summary push...');
  const conversationIds = await db.getSummarySubscriberIds();
  console.log(`[summary-job] Found ${conversationIds.length} subscribed conversation(s) for summary.`);
  // Keep a fixed cutoff for this run. Messages received during summarisation
  // remain after the cutoff and will be handled by the following run.
  const runCutoffAt = Date.now();

  for (const conversationId of conversationIds) {
    const { messages, startAt } = await db.getMessagesSinceSummaryCursor(conversationId, runCutoffAt);
    if (!messages.length) {
      // Advance an empty window as well, so a quiet conversation does not keep
      // falling back to the initial 24-hour window.
      await db.setSummaryCursor(conversationId, runCutoffAt);
      console.log(`[summary] No new messages for ${conversationId}; cursor advanced.`);
      continue;
    }

    try {
      const summary = await summarizeConversation(messages);
      const targetId = extractTargetId(conversationId);
      if (!targetId) continue;

      let pushMsg;
      try {
        pushMsg = createExecutiveSummaryFlex({
          title: '🗓️ 今日全天對話總結與智庫簡報',
          summaryText: summary,
        });
      } catch (_) {
        pushMsg = { type: 'text', text: `🗓️ 今日全天對話總結\n\n${summary}` };
      }

      await client.pushMessage({
        to: targetId,
        messages: [pushMsg],
      });
      await db.appendHistory({
        conversationId,
        messages,
        summary,
        generatedAt: new Date().toISOString(),
        windowStartAt: new Date(startAt).toISOString(),
        windowEndAt: new Date(runCutoffAt).toISOString(),
      });
      // Do this only after successful delivery and archiving. A failed push is
      // therefore still eligible for the next scheduled summary.
      await db.setSummaryCursor(conversationId, runCutoffAt);
      // 清理超過 3 天的舊紀錄，保留最近對話供查閱與 AI 諮詢
      await db.pruneOldMessages(conversationId, 3);
      console.log(`[summary] pushed & archived for ${conversationId} (${messages.length} messages)`);
    } catch (err) {
      console.error(`[summary] failed for ${conversationId}:`, err.message);
    }
  }
}

/**
 * 執行每日晨間建築與營造產業新聞推播（僅推播給有開啟新聞訂閱的對話）
 */
async function runNewsJob() {
  const acquired = await db.acquireDailyLock('news');
  if (!acquired) {
    console.log('[news-job] Already sent today, skipping duplicate trigger.');
    return { success: true, count: 0, skipped: true };
  }

  console.log('[news-job] Starting daily construction news push...');
  try {
    const digest = await getDailyConstructionDigest();
    let pushMsg;
    try {
      pushMsg = createConstructionNewsFlex(digest);
    } catch (err) {
      console.error('[news-job] Flex generation failed, fallback to text:', err.message);
      const textLines = [
        `🏗️ 今日建築與營造產業情報 (${digest.date})`,
        '',
        `📈 今日產業核心脈動：\n${digest.overview}`,
        '',
        '📌 重點精選：',
        ...digest.items.map(
          (it, i) =>
            `${i + 1}. [${it.category}] ${it.title}\n${it.summary}\n💡 觀點: ${it.insight}\n🔗 ${it.url}`
        ),
      ];
      pushMsg = { type: 'text', text: textLines.join('\n') };
    }

    // 取得推播目標（可由環境變數指定，若未指定則推播給所有開啟新聞訂閱之對話）
    let targetIds = [];
    if (process.env.NEWS_PUSH_TARGET) {
      targetIds = process.env.NEWS_PUSH_TARGET.split(',')
        .map((t) => extractTargetId(t.trim()))
        .filter(Boolean);
    } else {
      const subscriberConvs = await db.getNewsSubscriberIds();
      targetIds = subscriberConvs.map(extractTargetId).filter(Boolean);
    }

    // 去除重複 ID
    targetIds = Array.from(new Set(targetIds));

    if (targetIds.length === 0) {
      console.log('[news-job] No subscribed targets found (all opted-out or empty).');
      return { success: true, count: 0 };
    }

    console.log(`[news-job] Pushing construction news to ${targetIds.length} subscribed target(s)...`);
    for (const targetId of targetIds) {
      try {
        await client.pushMessage({
          to: targetId,
          messages: [pushMsg],
        });
        console.log(`[news-job] Pushed news to ${targetId}`);
      } catch (err) {
        console.error(`[news-job] Failed pushing news to ${targetId}:`, err.message);
      }
    }

    return { success: true, count: targetIds.length };
  } catch (err) {
    console.error('[news-job] Fatal error in runNewsJob:', err);
    throw err;
  }
}

function startScheduler() {
  // 晚間對話總結（預設 19:00 台北時區）
  const summaryCron = process.env.SUMMARY_CRON || '0 19 * * *';
  cron.schedule(
    summaryCron,
    () => {
      console.log(`[scheduler] running summary job (${new Date().toISOString()})`);
      runSummaryJob();
    },
    { timezone: 'Asia/Taipei' }
  );
  console.log(`[scheduler] registered summary cron: ${summaryCron} (Asia/Taipei)`);

}

module.exports = {
  startScheduler,
  runSummaryJob,
  runNewsJob,
  summarizeConversation,
  extractTargetId,
};
