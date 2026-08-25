require('dotenv').config();

const dns = require('node:dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

const express = require('express');
const { line, config, client, getConversationId, getDisplayName } = require('./line');
const db = require('./db');
const {
  startScheduler,
  runSummaryJob,
  summarizeConversation,
} = require('./scheduler');
const {
  fetchLineContent,
  describeImage,
  transcribeAudio,
  enrichMessageText,
} = require('./multimodal');
const {
  getQuickReply,
  createVideoFlex,
  createWebFlex,
  createImageFlex,
  createAudioFlex,
  createExecutiveSummaryFlex,
  createMenuFlex,
  createAssistantFlex,
  createNotesFlex,
  createNoteHelperFlex,
  createSynthesisFlex,
  createWelcomeFlex,
  createSettingsFlex,
} = require('./flex');
const {
  askAssistant,
  parseNoteFromText,
  synthesizeAll,
} = require('./assistant');

const SUMMARY_KEYWORD = process.env.SUMMARY_KEYWORD || '摘要';
const HISTORY_KEYWORDS = ['歷史紀錄', '歷史記錄', '查歷史', '總結歷史', '摘要歷史'];
const MENU_KEYWORDS = ['選單', '功能', '按鈕', 'menu', 'help', '說明', '開始', '控制台'];
const NOTES_LIST_KEYWORDS = [
  '看記事',
  '記事本',
  '待辦清單',
  '備忘錄',
  '我的記事',
  '代辦清單',
  '記事清單',
  '待辦',
  'notes',
  'todo',
  '待辦記事',
];
const NOTES_HELPER_KEYWORDS = [
  '新增記事',
  '記一筆',
  '快捷記事',
  '記事範本',
  '記事引導',
  '記事教學',
  '怎麼記事',
  '寫記事',
  '新增待辦',
  '新增備忘',
];
const NOTES_CLEAR_KEYWORDS = ['清空記事', '清除記事', '刪除記事', '清空待辦'];
const SYNTHESIS_KEYWORDS = [
  '智能統整',
  '統整',
  '整合',
  '工作統整',
  '彙整',
  '今日進度',
  '跨維度統整',
  '全方位統整',
];
const SETTINGS_KEYWORDS = [
  '推播設定',
  '通知設定',
  '推播',
  '設定',
  '訂閱設定',
  '定時設定',
  'settings',
  '通知',
  '推播管理',
];
const SUMMARY_ENABLE_KEYWORDS = [
  '開啟摘要',
  '訂閱摘要',
  '開啟每日摘要',
  '訂閱每日摘要',
  '開啟對話摘要',
  '訂閱對話摘要',
];
const SUMMARY_DISABLE_KEYWORDS = [
  '關閉摘要',
  '取消摘要',
  '退訂摘要',
  '關閉每日摘要',
  '退訂每日摘要',
  '關閉對話摘要',
  '退訂對話摘要',
];

const app = express();

// 同一個對話的事件依序處理（避免同時收到多筆訊息時競速）
const conversationQueues = new Map();

function runSerialized(conversationId, task) {
  const previous = conversationQueues.get(conversationId) || Promise.resolve();
  const current = previous.then(task, task);
  conversationQueues.set(conversationId, current.catch(() => {}));
  return current;
}

app.post('/webhook', line.middleware(config), async (req, res) => {
  res.sendStatus(200); // 先回200，避免LINE重送；事件非同步處理
  const events = req.body.events || [];
  for (const event of events) {
    const conversationId = getConversationId(event.source);
    await db.registerConversation(conversationId);

    // 處理加好友或加入群組事件，立即回傳曜石黑頂級歡迎與功能導引卡片
    if (event.type === 'follow' || event.type === 'join') {
      try {
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [createWelcomeFlex()],
        });
        console.log(`[webhook] sent welcome card for ${event.type} to ${conversationId}`);
      } catch (err) {
        console.error('[webhook] error sending welcome card:', err.message);
      }
      continue;
    }

    if (event.type === 'postback') {
      runSerialized(conversationId, () => handlePostback(event, conversationId)).catch((err) =>
        console.error('[webhook] postback error:', err)
      );
      continue;
    }

    if (event.type !== 'message') continue;
    runSerialized(conversationId, () => handleEvent(event, conversationId)).catch((err) =>
      console.error('[webhook] event error:', err)
    );
  }
});

async function handleEvent(event, conversationId) {
  const messageType = event.message.type;
  let textContent = null;
  let replyMessages = [];

  if (messageType === 'text') {
    const rawText = event.message.text.trim();
    const lowerText = rawText.toLowerCase();

    // 0. 推播與定時通知設定指令
    if (SETTINGS_KEYWORDS.includes(lowerText) || SETTINGS_KEYWORDS.includes(rawText)) {
      return replyImmediateSettings(event.replyToken, conversationId);
    }
    if (SUMMARY_ENABLE_KEYWORDS.includes(rawText)) {
      return replyToggleSetting(event.replyToken, conversationId, 'summary', true);
    }
    if (SUMMARY_DISABLE_KEYWORDS.includes(rawText)) {
      return replyToggleSetting(event.replyToken, conversationId, 'summary', false);
    }

    // 1. 快捷選單指令
    if (MENU_KEYWORDS.includes(lowerText)) {
      return replyImmediateMenu(event.replyToken);
    }

    // 2. 記事本管理指令（清空記事）
    if (NOTES_CLEAR_KEYWORDS.includes(rawText)) {
      await db.clearNotes(conversationId);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: '🧹 已為您清空所有待辦記事本清單！隨時傳送「記下：明日會勘」即可新增。',
            quickReply: getQuickReply(),
          },
        ],
      });
    }

    // 4. 查看記事本 / 待辦清單
    if (NOTES_LIST_KEYWORDS.includes(lowerText)) {
      return replyImmediateNotes(event.replyToken, conversationId);
    }

    // 5. 記事範本與快捷引導 (解決記不住指令問題)
    if (NOTES_HELPER_KEYWORDS.includes(rawText) || NOTES_HELPER_KEYWORDS.includes(lowerText)) {
      return replyImmediateNoteHelper(event.replyToken);
    }

    // 6. 跨維度智能全方位統整 (對話 + 記事 + 數據 + 風險)
    if (SYNTHESIS_KEYWORDS.includes(rawText)) {
      return replyImmediateSynthesis(event.replyToken, conversationId, event.source);
    }

    // 6. 新增記事 / 備忘 (識別「記下」、「幫我記」、「記事」、「備忘」、「提醒我」、「待辦」)
    const isNoteCreation =
      rawText.startsWith('記下') ||
      rawText.startsWith('幫我記') ||
      rawText.startsWith('記事') ||
      rawText.startsWith('備忘') ||
      rawText.startsWith('提醒我') ||
      rawText.startsWith('待辦') ||
      lowerText.startsWith('todo') ||
      lowerText.startsWith('note');

    if (isNoteCreation) {
      return replyImmediateNoteCreation(event.replyToken, conversationId, rawText);
    }

    // 7. 對話即時摘要 (純對話)
    if (rawText === SUMMARY_KEYWORD || rawText === '摘要' || rawText === '對話摘要') {
      return replyImmediateSummary(event.replyToken, conversationId);
    }

    // 7b. 查詢過往已產生的總結歷史紀錄
    if (HISTORY_KEYWORDS.includes(rawText)) {
      return replyImmediateHistory(event.replyToken, conversationId);
    }

    // 8. 檢查是否有網址（YouTube/網頁）並豐富化內容
    const { enrichedText, items } = await enrichMessageText(event.message.text);
    textContent = enrichedText;

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.type === 'youtube') {
          replyMessages.push(
            createVideoFlex({
              title: item.title,
              points: item.points,
              supplement: item.supplement,
              url: item.url,
            })
          );
        } else if (item.type === 'web') {
          replyMessages.push(
            createWebFlex({
              title: item.title,
              summary: item.summary,
              supplement: item.supplement,
              url: item.url,
            })
          );
        }
      }
    } else {
      // 判斷是否為 1對1 私聊
      const isOneOnOne = event.source.type === 'user';

      // 嚴格判斷 @AI 標註（支援 @AI、@ai、＠AI、＠ai）。
      // 群組內的 LINE 原生 @ 標註可能是其他成員，不能拿來當作 AI 觸發條件。
      const hasAiMention = /(?:^|\s)[@＠]\s*ai(?=$|[\s:：])/i.test(rawText);

      // 群組中僅在輸入 @AI 時觸發；私聊則直接輸入即可提問。
      const isAiTrigger = isOneOnOne || hasAiMention;

      if (isAiTrigger) {
        // 精準提取 @AI 後面的題目文字（例：「@AI 介紹什麼是RC?」 -> 「介紹什麼是RC?」）
        let cleanQuestion = rawText;
        if (hasAiMention) {
          cleanQuestion = rawText.replace(/^.*?[@＠]\s*ai[:：\s]*/i, '').trim();
        }

        const promptQuestion = cleanQuestion || rawText.trim();
        if (!promptQuestion) return;

        const [displayName, recentMessages, notes] = await Promise.all([
          getDisplayName(event.source),
          db.getRecentMessages(conversationId, 6),
          db.getNotes(conversationId),
        ]);

        const assistantResult = await askAssistant({
          question: promptQuestion,
          displayName,
          recentMessages,
          notes,
        });

        replyMessages.push(
          createAssistantFlex({
            question: promptQuestion,
            data: assistantResult,
          })
        );
      }
    }
  } else if (messageType === 'image') {
    try {
      const buffer = await fetchLineContent(event.message.id);
      const imgData = await describeImage(buffer);
      textContent = imgData.textSummary;
      replyMessages.push(
        createImageFlex({
          description: imgData.description,
          ocr: imgData.ocr,
          supplement: imgData.supplement,
        })
      );
    } catch (err) {
      console.error('[webhook] image processing error:', err.message);
      textContent = '[🖼️ 傳送了圖片]';
    }
  } else if (messageType === 'audio') {
    try {
      const buffer = await fetchLineContent(event.message.id);
      const transcript = await transcribeAudio(buffer);
      textContent = `[🎙️ 語音訊息: "${transcript}"]`;
      replyMessages.push(
        createAudioFlex({
          transcript,
        })
      );
    } catch (err) {
      console.error('[webhook] audio processing error:', err.message);
      textContent = '[🎙️ 傳送了語音訊息]';
    }
  } else if (messageType === 'video') {
    textContent = '[🎬 傳送了一段影片檔案]';
  } else if (messageType === 'file') {
    const fileName = event.message.fileName || '檔案';
    textContent = `[📎 傳送了檔案: ${fileName}]`;
  }

  if (!textContent) return;

  // 1. 若有卡片訊息，優先即時回覆 LINE，確保用戶第一時間看到卡片
  const replyPromise = (replyMessages.length > 0 && event.replyToken)
    ? client.replyMessage({
        replyToken: event.replyToken,
        messages: replyMessages.slice(0, 5), // LINE 限制單次回覆最多 5 則訊息
      }).then(() => {
        console.log(`[webhook] sent reply for ${messageType} to ${conversationId}`);
      }).catch(async (err) => {
        console.error('[webhook] reply error, falling back to text:', err.message);
        try {
          let fallbackText = '🤖 已為您處理完成！';
          if (replyMessages[0]?.type === 'flex') {
            fallbackText = replyMessages[0]?.altText || fallbackText;
          } else if (replyMessages[0]?.type === 'text') {
            fallbackText = replyMessages[0].text;
          }
          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: 'text',
                text: fallbackText,
                quickReply: getQuickReply(),
              },
            ],
          });
        } catch (_) {}
      })
    : Promise.resolve();

  // 2. 非同步背景寫入訊息庫，不阻塞用戶即時體感
  const dbPromise = (async () => {
    const authorName = await getDisplayName(event.source);
    await db.appendMessage(conversationId, {
      userId: event.source.userId,
      displayName: authorName,
      text: textContent,
      timestamp: event.timestamp,
    });
  })().catch((err) => console.error('[webhook] appendMessage error:', err.message));

  await Promise.all([replyPromise, dbPromise]);
}

async function replyImmediateMenu(replyToken) {
  try {
    const flexCard = createMenuFlex();
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[menu] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '🎛️ 核心功能選單：\n1. 記一筆（新增記事）\n2. 看記事（待辦清單）\n3. 智能統整\n4. 推播設定',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateNotes(replyToken, conversationId) {
  try {
    const notes = await db.getNotes(conversationId);
    const flexCard = createNotesFlex(notes);
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[notes] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '📝 讀取記事本發生錯誤，請稍候再試。',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateNoteHelper(replyToken) {
  try {
    const flexCard = createNoteHelperFlex();
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[notes-helper] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '📝 快捷記事範本：\n1. 記下：明天上午9點結構技師工地會勘\n2. 記下：下週三向建管處送審執照變更案\n3. 備忘：鋼筋每噸最新報價 21,500 元\n4. 記下：連續壁厚度由70cm調整至80cm\n5. 備忘：爭取危老容積獎勵滿額40%',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateNoteCreation(replyToken, conversationId, userText) {
  try {
    const parsed = await parseNoteFromText(userText);
    await db.addNote(conversationId, parsed);
    const notes = await db.getNotes(conversationId);
    const flexCard = createNotesFlex(notes);
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
    console.log(`[notes] added note for ${conversationId}: ${parsed.title}`);
  } catch (err) {
    console.error('[notes] creation error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: `📝 已為您記錄：「${userText}」`,
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateSynthesis(replyToken, conversationId, source) {
  try {
    const messages = await db.getMessages(conversationId);
    const notes = await db.getNotes(conversationId);
    const displayName = await getDisplayName(source);

    const synthData = await synthesizeAll({
      messages,
      notes,
      displayName,
    });

    const flexCard = createSynthesisFlex({ data: synthData });
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
    console.log(`[synthesis] replied all-in-one synthesis for ${conversationId}`);
  } catch (err) {
    console.error('[synthesis] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '📊 智能統整報告生成中發生錯誤，請稍後重試。',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyImmediateSummary(replyToken, conversationId) {
  // On-demand summaries use the current automatic-summary window, whose start
  // is the last successful 19:00 run. They intentionally do not move that
  // cursor, so repeated requests during the same cycle have the same start.
  const requestedAt = Date.now();
  const { messages, startAt } = await db.getMessagesSinceSummaryCursor(conversationId, requestedAt);
  if (!messages.length) {
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '目前今日還沒有累積新的對話內容。您可以直接向 AI 諮詢！',
          quickReply: getQuickReply(),
        },
      ],
    });
    return;
  }

  const summary = await summarizeConversation(messages);
  try {
    const flexCard = createExecutiveSummaryFlex({
      title: '📋 今日即時對話總結',
      summaryText: summary,
    });
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[summary] flex failed, fallback to text:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: `📋 今日即時對話總結\n\n${summary}`,
          quickReply: getQuickReply(),
        },
      ],
    });
  }

  await db.appendHistory({
    conversationId,
    messages,
    summary,
    type: 'on_demand',
    generatedAt: new Date().toISOString(),
    windowStartAt: new Date(startAt).toISOString(),
    windowEndAt: new Date(requestedAt).toISOString(),
  });
  console.log(`[summary] replied on-demand (retained ${messages.length} messages) for ${conversationId}`);
}

async function replyImmediateHistory(replyToken, conversationId) {
  const records = await db.getHistory(conversationId, 5);
  if (!records.length) {
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '目前還查不到已存檔的總結歷史紀錄（可能尚未產生過，或已被同步搬移至長期資料庫）。',
          quickReply: getQuickReply(),
        },
      ],
    });
    return;
  }

  const lines = records
    .slice()
    .reverse()
    .map((r, i) => {
      const date = new Date(r.generatedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
      const tag = r.type === 'on_demand' ? '（即時查詢）' : '（每日排程）';
      return `${i + 1}. ${date} ${tag}\n${r.summary}`;
    });

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text: `🗂️ 最近 ${records.length} 筆總結歷史紀錄：\n\n${lines.join('\n\n')}`,
        quickReply: getQuickReply(),
      },
    ],
  });
  console.log(`[history] replied ${records.length} record(s) for ${conversationId}`);
}

async function replyImmediateSettings(replyToken, conversationId) {
  try {
    const settings = await db.getConversationSettings(conversationId);
    const flexCard = createSettingsFlex(settings);
    await client.replyMessage({
      replyToken,
      messages: [flexCard],
    });
  } catch (err) {
    console.error('[settings] reply error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '⚙️ 讀取推播設定發生錯誤，請稍候重試。',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function replyToggleSetting(replyToken, conversationId, type, enabled) {
  try {
    const updateObj = { summaryEnabled: enabled };
    const updated = await db.updateConversationSettings(conversationId, updateObj);
    const flexCard = createSettingsFlex(updated);
    const label = '📋 晚間對話總結 (19:00)';
    const actionText = enabled ? '已成功開啟 🟢' : '已成功關閉 ⚪';

    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: `⚙️ ${label} ${actionText}\n\n已更新您的定時推播偏好設定！`,
        },
        flexCard,
      ],
    });
    console.log(`[settings] updated ${type} to ${enabled} for ${conversationId}`);
  } catch (err) {
    console.error('[settings] update error:', err.message);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '⚙️ 更新推播設定失敗，請稍候重試。',
          quickReply: getQuickReply(),
        },
      ],
    });
  }
}

async function handlePostback(event, conversationId) {
  const data = event.postback?.data || '';
  const params = new URLSearchParams(data);
  const action = params.get('action');

  if (action === 'toggle_summary') {
    const current = await db.getConversationSettings(conversationId);
    return replyToggleSetting(event.replyToken, conversationId, 'summary', !current.summaryEnabled);
  }
  if (action === 'set_summary') {
    const enabled = params.get('enabled') === 'true';
    return replyToggleSetting(event.replyToken, conversationId, 'summary', enabled);
  }
  if (action === 'view_settings') {
    return replyImmediateSettings(event.replyToken, conversationId);
  }
}

// 健康檢查與防休眠 Ping 端點
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.send('LineChat Bot is online and running!'));

// 手動觸發晚間對話摘要排程
app.post('/tasks/summary', express.json(), async (req, res) => {
  const secret = process.env.SUMMARY_TRIGGER_SECRET;
  if (secret && req.get('x-trigger-secret') !== secret) {
    return res.sendStatus(401);
  }
  await runSummaryJob();
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
  startScheduler();

  // 自我防休眠保活機制（Render 免費方案每 12 分鐘自我 ping 一次，徹底根絕 20~30 秒冷啟動延遲）
  const serviceUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVICE_URL || 'https://honorai-line.onrender.com';
  if (serviceUrl && !serviceUrl.includes('localhost')) {
    console.log(`[server] registered anti-sleep keep-alive for ${serviceUrl}`);
    setInterval(() => {
      fetch(`${serviceUrl}/ping`)
        .then(() => console.log('[keep-alive] pinged self successfully'))
        .catch((err) => console.log('[keep-alive] ping skipped/error:', err.message));
    }, 12 * 60 * 1000);
  }
});
