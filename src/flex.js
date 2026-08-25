/**
 * 🏛️ LINE Flex Message 頂級建築美學設計系統 (Unified Obsidian & Architectural Slate Palette)
 * 嚴格遵循統一色系：曜石黑 (#0A0F1D) Header + 香檳金 (#D97706 / #F59E0B) 點綴 + 雅緻微卡片 (#F8FAFC)
 * 全面消除雜亂彩虹配色，提供最高標準之商務主管與建築智庫視覺體驗
 */

const THEME = {
  // Header: 頂級深邃曜石夜黑
  headerBg: '#0B0F19',
  headerBorder: '#1E293B',

  // 標籤 Pill Badge (香檳金色系 / 頂級商務)
  badgeBg: '#1E293B',
  badgeText: '#F59E0B',
  badgeSub: '#94A3B8',
  headerTitle: '#FFFFFF',

  // 內容主背景 (乾淨透亮純白)
  bodyBg: '#FFFFFF',

  // 模組微卡片 (圓潤 12px 倒角 + 柔和高對比灰階 + 隱約邊界)
  cardBg: '#F8FAFC',
  cardBorder: '#E2E8F0',
  cardHighlightBg: '#FFFBEB', // 暖琥珀色（用於核心結論、重要決策）
  cardHighlightBorder: '#FDE68A',
  cardEmeraldBg: '#F0FDF4', // 翡翠綠（用於待辦行動、已完成、正常狀態）
  cardEmeraldBorder: '#BBF7D0',
  cardRoseBg: '#FEF2F2', // 珊瑚紅（用於風險警示、注意事項）
  cardRoseBorder: '#FECACA',
  cardBlueBg: '#EFF6FF', // 科技藍（用於智庫觀點、延伸補充）
  cardBlueBorder: '#BFDBFE',

  // 文字層級 (專為手機螢幕清晰閱讀優化)
  titleText: '#0F172A',
  bodyText: '#334155',
  subText: '#475569',
  mutedText: '#64748B',

  // 強調色
  accentGold: '#D97706',
  accentGoldBg: '#FEF3C7',
  accentGoldText: '#92400E',
  accentEmerald: '#059669',
  accentEmeraldBg: '#D1FAE5',
  accentEmeraldText: '#065F46',
  accentBlue: '#2563EB',
  accentBlueBg: '#DBEAFE',
  accentBlueText: '#1E40AF',
  accentRose: '#DC2626',
  accentRoseBg: '#FEE2E2',
  accentRoseText: '#991B1B',

  // 按鈕色彩
  btnPrimaryBg: '#0F172A',
  btnPrimaryText: '#FFFFFF',
  btnGoldBg: '#D97706',
  btnGoldText: '#FFFFFF',
  btnSecondaryBg: '#F1F5F9',
  btnSecondaryText: '#1E293B',
};

/**
 * 產生常駐底部 LINE Quick Reply 快捷按鈕列 (精簡乾淨 5 核心按鈕)
 */
function getQuickReply() {
  const items = [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '➕ 記一筆',
        text: '新增記事',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📝 看記事',
        text: '看記事',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📊 智能統整',
        text: '智能統整',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '⚙️ 推播設定',
        text: '推播設定',
      },
    },
  ];

  return { items };
}

/**
 * 建立 YouTube / 影片精華 Flex 卡片
 */
function createVideoFlex({ title, points = [], supplement = '', url = '' }) {
  const pointContents = points.map((p, idx) => ({
    type: 'box',
    layout: 'horizontal',
    spacing: 'md',
    margin: 'md',
    contents: [
      {
        type: 'box',
        layout: 'vertical',
        width: '20px',
        height: '20px',
        backgroundColor: THEME.accentGoldBg,
        cornerRadius: '6px',
        alignItems: 'center',
        justifyContent: 'center',
        contents: [
          {
            type: 'text',
            text: `${idx + 1}`,
            size: 'xxs',
            weight: 'bold',
            color: THEME.accentGoldText,
            align: 'center',
          },
        ],
      },
      {
        type: 'text',
        text: p,
        size: 'sm',
        color: THEME.bodyText,
        flex: 1,
        wrap: true,
      },
    ],
  }));

  const bodyContents = [
    {
      type: 'text',
      text: '📌 核心重點精華',
      size: 'xs',
      weight: 'bold',
      color: THEME.accentGold,
    },
    ...pointContents,
  ];

  if (supplement) {
    bodyContents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: THEME.cardBorder,
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: THEME.cardBg,
        cornerRadius: '10px',
        borderWidth: '1px',
        borderColor: THEME.cardBorder,
        contents: [
          {
            type: 'text',
            text: '💡 AI 智庫補充與延伸脈絡',
            size: 'xs',
            weight: 'bold',
            color: THEME.titleText,
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: THEME.subText,
            wrap: true,
            margin: 'sm',
          },
        ],
      }
    );
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🎬 YOUTUBE INSIGHT',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '影音智慧解析',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: title || 'YouTube 影片',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, wrap: true, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents: bodyContents,
    },
  };

  if (url) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '▶️ 觀看原影片',
            uri: url,
          },
          style: 'primary',
          height: 'sm',
          color: THEME.btnPrimaryBg,
        },
      ],
    };
  }

  return {
    type: 'flex',
    altText: `🎬 影片摘要：${title}`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立網頁連結 Flex 卡片
 */
function createWebFlex({ title, summary = '', supplement = '', url = '' }) {
  const bodyContents = [
    {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '📌 網頁核心速讀',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: summary,
          size: 'sm',
          color: THEME.bodyText,
          wrap: true,
          margin: 'sm',
        },
      ],
    },
  ];

  if (supplement) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '12px',
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      contents: [
        {
          type: 'text',
          text: '💡 延伸背景與智庫知識',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: supplement,
          size: 'xs',
          color: THEME.subText,
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🌐 WEB ARTICLE',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '網頁智能導讀',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: title || '網頁連結',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, wrap: true, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents: bodyContents,
    },
  };

  if (url) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '🌐 閱讀完整原文',
            uri: url,
          },
          style: 'primary',
          height: 'sm',
          color: THEME.btnPrimaryBg,
        },
      ],
    };
  }

  return {
    type: 'flex',
    altText: `🔗 網頁速讀：${title}`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立圖片 Vision 分析與延伸卡片
 */
function createImageFlex({ description = '', ocr = '', supplement = '' }) {
  const bodyContents = [
    {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '🖼️ 畫面主體解析',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: description,
          size: 'sm',
          color: THEME.bodyText,
          wrap: true,
          margin: 'sm',
        },
      ],
    },
  ];

  if (ocr && ocr !== '無重要文字') {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '10px',
      backgroundColor: THEME.cardBg,
      cornerRadius: '8px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'text',
          text: '🔍 提取文字與數據資訊',
          size: 'xxs',
          weight: 'bold',
          color: THEME.subText,
        },
        {
          type: 'text',
          text: ocr,
          size: 'xs',
          color: THEME.titleText,
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  if (supplement) {
    bodyContents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: THEME.cardBorder,
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: THEME.cardHighlightBg,
        cornerRadius: '10px',
        borderWidth: '1px',
        borderColor: THEME.cardHighlightBorder,
        contents: [
          {
            type: 'text',
            text: '💡 專業洞察與補充建議',
            size: 'xs',
            weight: 'bold',
            color: THEME.titleText,
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: THEME.subText,
            wrap: true,
            margin: 'sm',
          },
        ],
      }
    );
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '👁️ VISION & OCR',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '影像智慧辨識',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '圖片內容與數據洞察',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents: bodyContents,
    },
  };

  return {
    type: 'flex',
    altText: `🖼️ 圖片解析洞察`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立語音辨識 Flex 卡片
 */
function createAudioFlex({ transcript = '' }) {
  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🎙️ AUDIO TRANSCRIPT',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: 'Whisper AI 辨識',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '語音訊息逐字稿',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          backgroundColor: THEME.cardBg,
          cornerRadius: '10px',
          borderWidth: '1px',
          borderColor: THEME.cardBorder,
          paddingAll: '12px',
          contents: [
            {
              type: 'text',
              text: '📝 語音轉譯內容',
              size: 'xs',
              weight: 'bold',
              color: THEME.titleText,
            },
            {
              type: 'text',
              text: transcript || '（無內容）',
              size: 'sm',
              color: THEME.bodyText,
              wrap: true,
              margin: 'sm',
            },
          ],
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `🎙️ 語音辨識：${transcript.length > 50 ? transcript.slice(0, 48) : transcript}`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 解析對話總結報告區塊
 */
function parseSummarySections(summaryText) {
  const sectionDefs = [
    {
      key: 'topics',
      pattern: /📊|對話紀錄|發言摘要|討論主軸|核心議題/,
      title: '對話紀錄與各人發言摘要',
      badge: 'SPEECHES',
    },
    {
      key: 'decisions',
      pattern: /💡|討論焦點|共同事項|重要結論|關鍵決策/,
      title: '討論焦點與共同事項',
      badge: 'TOPICS',
    },
    {
      key: 'todos',
      pattern: /🎯|交辦|待辦|約定事項|行動清單/,
      title: '交辦／待辦／約定事項',
      badge: 'ACTION ITEMS',
    },
    {
      key: 'insights',
      pattern: /📚|備忘|延伸提醒|智庫補充|延伸洞察/,
      title: '備忘與延伸提醒',
      badge: 'NOTES',
    },
  ];

  const sections = [];
  const lines = summaryText.split('\n');
  let currentSection = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const matchedDef = sectionDefs.find(
      (def) =>
        def.pattern.test(line) &&
        (line.includes('【') || line.includes('#') || line.includes('：') || line.includes(':') || line.length < 35)
    );

    if (matchedDef) {
      currentSection = {
        def: matchedDef,
        title: line.replace(/[【】#\*\:]/g, '').trim(),
        items: [],
      };
      sections.push(currentSection);
    } else {
      if (!currentSection) {
        currentSection = {
          def: {
            key: 'general',
            title: '會議與對話摘要',
            badge: 'SUMMARY',
          },
          title: '會議與對話摘要',
          items: [],
        };
        sections.push(currentSection);
      }
      const cleanItem = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
      if (cleanItem) {
        currentSection.items.push(cleanItem);
      }
    }
  }

  return sections;
}

/**
 * 建立對話全貌整合 Flex 卡片
 */
function createExecutiveSummaryFlex({ title = '📋 對話深度總結報告', summaryText = '' }) {
  const sections = parseSummarySections(summaryText);

  const sectionCards = sections.map((sec, secIdx) => {
    const itemsContents = sec.items.map((item) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '•',
          size: 'sm',
          color: THEME.accentGold,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: item,
          size: 'xs',
          color: THEME.bodyText,
          flex: 1,
          wrap: true,
        },
      ],
    }));

    return {
      type: 'box',
      layout: 'vertical',
      margin: secIdx === 0 ? 'none' : 'md',
      paddingAll: '12px',
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'md',
              paddingStart: '6px',
              paddingEnd: '6px',
              paddingTop: '2px',
              paddingBottom: '2px',
              contents: [
                {
                  type: 'text',
                  text: sec.def.badge || 'REPORT',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: sec.title,
              size: 'xs',
              weight: 'bold',
              color: THEME.titleText,
              margin: 'sm',
              gravity: 'center',
            },
          ],
        },
        ...itemsContents,
      ],
    };
  });

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '📋 EXECUTIVE SUMMARY',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: new Date().toLocaleDateString('zh-TW'),
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: title,
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents:
        sectionCards.length > 0
          ? sectionCards
          : [
              {
                type: 'text',
                text: summaryText,
                size: 'sm',
                color: THEME.bodyText,
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `📋 對話深度總結報告 (${new Date().toLocaleDateString('zh-TW')})`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立今日建築情報 Flex 卡片 (曜石黑 + 香檳金 · 手機美學優化)
 */
function createConstructionNewsFlex(digest) {
  const dateStr = digest.date || new Date().toLocaleDateString('zh-TW');
  const categoryTitle = digest.categoryName || '綜合全訊';

  const bodyContents = [];

  // 今日核心概述
  if (digest.overview) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      paddingAll: '14px',
      contents: [
        {
          type: 'text',
          text: '📌 產業焦點總覽',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentGoldText,
        },
        {
          type: 'text',
          text: digest.overview,
          size: 'sm',
          color: THEME.bodyText,
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  // 新聞條目微卡片
  (digest.items || []).forEach((item, idx) => {
    const newsCardContents = [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: THEME.badgeBg,
            cornerRadius: 'md',
            paddingStart: '8px',
            paddingEnd: '8px',
            paddingTop: '3px',
            paddingBottom: '3px',
            contents: [
              {
                type: 'text',
                text: item.category || '🏗️ 產業即時',
                size: 'xs', weight: 'bold', color: THEME.badgeText,
              },
            ],
          },
          {
            type: 'text',
            text: `${item.source || '即時情報'}${item.timeAgo ? ' · ' + item.timeAgo : ''}`,
            size: 'xs',
            color: THEME.subText,
            align: 'end',
            gravity: 'center',
          },
        ],
      },
      {
        type: 'text',
        text: item.title,
        weight: 'bold',
        size: 'md',
        color: THEME.titleText,
        wrap: true,
        margin: 'sm',
      },
      {
        type: 'text',
        text: item.summary,
        size: 'sm',
        color: THEME.bodyText,
        wrap: true,
        margin: 'xs',
      },
    ];

    // 智庫觀點
    if (item.insight) {
      newsCardContents.push({
        type: 'box',
        layout: 'vertical',
        margin: 'sm',
        paddingAll: '10px',
        backgroundColor: THEME.cardBlueBg,
        cornerRadius: '8px',
        borderWidth: '1px',
        borderColor: THEME.cardBlueBorder,
        contents: [
          {
            type: 'text',
            text: `💡 智庫解讀：${item.insight}`,
            size: 'xs',
            color: THEME.accentBlueText,
            wrap: true,
          },
        ],
      });
    }

    // 操作按鈕列
    const actionButtons = [];
    if (item.url && typeof item.url === 'string' && item.url.startsWith('http')) {
      actionButtons.push({
        type: 'button',
        action: {
          type: 'uri',
          label: '🔗 原文報導',
          uri: item.url.trim(),
        },
        style: 'secondary',
        height: 'sm',
        flex: 1,
      });
    }

    actionButtons.push({
      type: 'button',
      action: {
        type: 'message',
        label: '💡 深度剖析',
        text: `剖析新聞: ${item.title}`,
      },
      style: 'primary',
      height: 'sm',
      color: THEME.btnPrimaryBg,
      flex: 1,
    });

    newsCardContents.push({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'md',
      contents: actionButtons,
    });

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: idx === 0 && !digest.overview ? 'none' : 'md',
      paddingAll: '14px',
      backgroundColor: THEME.cardBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: newsCardContents,
    });
  });

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🏗️ ARCHITECTURE BRIEF',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: dateStr,
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: `今日建築情報 · ${categoryTitle}`,
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents: bodyContents,
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🔄 換下一批',
            text: '換新聞',
          },
          style: 'primary',
          height: 'sm',
          color: THEME.btnGoldBg,
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `🏗️ 今日建築情報 · ${categoryTitle} (${dateStr})`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 🎛️ 智能控制台 / 快捷功能選單 Flex 卡片 (極簡典雅曜石黑)
 */
function createMenuFlex() {
  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '⚡ QUICK MENU',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '快捷功能選單',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '🏛️ AI 建築特助 · 核心控制台',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
        {
          type: 'text',
          text: '點選下方快捷功能即可直接執行。',
          size: 'xs',
          color: THEME.badgeSub,
          margin: 'xs',
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      spacing: 'md',
      contents: [
        // 區塊 1: 待辦與工程記事
        {
          type: 'text',
          text: '📝 待辦與工程記事',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '➕ 記一筆',
                text: '新增記事',
              },
              style: 'primary',
              height: 'sm',
              color: THEME.btnGoldBg,
              flex: 1,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '📋 看記事',
                text: '看記事',
              },
              style: 'primary',
              height: 'sm',
              color: THEME.btnPrimaryBg,
              flex: 1,
            },
          ],
        },
        {
          type: 'separator',
          margin: 'md',
          color: THEME.cardBorder,
        },
        // 區塊 2: 智能統整與對話摘要
        {
          type: 'text',
          text: '📊 智能統整與摘要',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '📊 智能統整',
                text: '智能統整',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '📋 對話摘要',
                text: '摘要',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
          ],
        },
        {
          type: 'separator',
          margin: 'md',
          color: THEME.cardBorder,
        },
        // 區塊 3: 推播設定
        {
          type: 'text',
          text: '⚙️ 推播設定',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '⚙️ 推播設定',
                text: '推播設定',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardBg,
      paddingAll: '10px',
      contents: [
        {
          type: 'text',
          text: '💡 隨時傳送「記下：明日會勘」或「@AI 諮詢題目」即可互動',
          size: 'xxs',
          color: THEME.mutedText,
          align: 'center',
          wrap: true,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: '🎛️ AI 建築特助 · 快捷功能選單',
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立新聞深度智庫剖析 Flex 卡片 (曜石黑 + 香檳金 · 手機美學優化)
 */
function createNewsAnalysisFlex({ title = '', data = null, analysisText = '' }) {
  const analysis = data || {
    category: '💡 產業深度剖析',
    context: analysisText,
    techImpact: '',
    policyImpact: '',
    marketOpportunity: '',
    strategyAdvice: '',
  };

  const sections = [
    { title: '📌 事件核心與背景脈絡', text: analysis.context },
    { title: '🏗️ 工程工法與設計面衝擊', text: analysis.techImpact },
    { title: '📜 法規政策與制度規範影響', text: analysis.policyImpact },
    { title: '📈 產業供應鏈與市場商機', text: analysis.marketOpportunity },
    { title: '💡 專家因應策略建議', text: analysis.strategyAdvice, highlight: true },
  ].filter((s) => Boolean(s.text));

  const bodyContents = sections.map((sec, idx) => ({
    type: 'box',
    layout: 'vertical',
    margin: idx === 0 ? 'none' : 'md',
    backgroundColor: sec.highlight ? THEME.cardHighlightBg : THEME.cardBg,
    cornerRadius: '12px',
    borderWidth: '1px',
    borderColor: sec.highlight ? THEME.cardHighlightBorder : THEME.cardBorder,
    paddingAll: '14px',
    contents: [
      {
        type: 'text',
        text: sec.title,
        size: 'xs',
        weight: 'bold',
        color: THEME.titleText,
      },
      {
        type: 'text',
        text: sec.text,
        size: 'xs',
        color: THEME.bodyText,
        wrap: true,
        margin: 'sm',
      },
    ],
  }));

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: analysis.category || '💡 IN-DEPTH ANALYSIS',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '智庫首席剖析',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: title || '新聞深度剖析',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, wrap: true, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: analysisText || analysis.rawText || '無剖析內容',
                size: 'sm',
                color: THEME.bodyText,
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🔄 換批新聞',
            text: '換新聞',
          },
          style: 'primary',
          height: 'sm',
          color: THEME.btnGoldBg,
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `💡 深度剖析：${title}`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 AI 顧問問答 Flex 卡片 (曜石黑 + 香檳金 · 手機美學優化)
 */
function createAssistantFlex({ question = '', data = null, answer = '' }) {
  const result = data || {
    category: '🤖 AI ARCH-CONSULTANT',
    conclusion: answer,
    details: [],
    risks: '',
    nextStep: '',
  };

  const bodyContents = [];

  // 1. 核心結論
  if (result.conclusion) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      paddingAll: '14px',
      contents: [
        {
          type: 'text',
          text: '💎 核心結論與策略解法',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentGoldText,
        },
        {
          type: 'text',
          text: result.conclusion,
          size: 'md',
          color: THEME.titleText,
          weight: 'bold',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 2. 關鍵要點或法規技術條列
  if (result.details && result.details.length > 0) {
    const detailRows = result.details.map((item) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '•',
          size: 'md',
          color: THEME.accentGold,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: item,
          size: 'sm',
          color: THEME.bodyText,
          flex: 1,
          wrap: true,
        },
      ],
    }));

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '14px',
      backgroundColor: THEME.cardBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'text',
          text: '📐 關鍵法規與技術要點',
          size: 'sm',
          weight: 'bold',
          color: THEME.titleText,
        },
        ...detailRows,
      ],
    });
  }

  // 3. 實務風險避坑
  if (result.risks && result.risks !== '無特定風險' && result.risks !== '無') {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: THEME.cardRoseBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardRoseBorder,
      paddingAll: '14px',
      contents: [
        {
          type: 'text',
          text: '⚠️ 實務風險與避坑指南',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentRoseText,
        },
        {
          type: 'text',
          text: result.risks,
          size: 'sm',
          color: THEME.bodyText,
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  // 4. 下一步行動方案
  if (result.nextStep) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: THEME.cardEmeraldBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardEmeraldBorder,
      paddingAll: '14px',
      contents: [
        {
          type: 'text',
          text: '🚀 建議下一步行動',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentEmeraldText,
        },
        {
          type: 'text',
          text: result.nextStep,
          size: 'sm',
          color: THEME.bodyText,
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: result.category || '🤖 AI ARCH-CONSULTANT',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '智庫特助解答',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: question,
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, wrap: true, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: answer || result.rawText || '無解答內容',
                size: 'sm',
                color: THEME.bodyText,
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `🤖 AI 特助解答：${question.length > 50 ? question.slice(0, 48) : question}`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 📝 智能記事本與待辦清單 Flex 卡片 (曜石黑 + 香檳金 · 手機美學優化)
 */
function createNotesFlex(notes = []) {
  const noteCards = notes.map((note, idx) => {
    const cardContents = [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: THEME.badgeBg,
            cornerRadius: 'md',
            paddingStart: '8px',
            paddingEnd: '8px',
            paddingTop: '3px',
            paddingBottom: '3px',
            contents: [
              {
                type: 'text',
                text: `${idx + 1}. ${note.category || '📋 待辦'}`,
                size: 'xs', weight: 'bold', color: THEME.badgeText,
              },
            ],
          },
          {
            type: 'text',
            text: note.dueDate && note.dueDate !== '未指定' ? `⏳ ${note.dueDate}` : '進行中',
            size: 'xs',
            color: THEME.subText,
            align: 'end',
            gravity: 'center',
          },
        ],
      },
      {
        type: 'text',
        text: note.title,
        weight: 'bold',
        size: 'md',
        color: THEME.titleText,
        wrap: true,
        margin: 'sm',
      },
    ];

    if (note.details) {
      cardContents.push({
        type: 'text',
        text: note.details,
        size: 'sm',
        color: THEME.bodyText,
        wrap: true,
        margin: 'xs',
      });
    }

    return {
      type: 'box',
      layout: 'vertical',
      margin: idx === 0 ? 'none' : 'md',
      paddingAll: '14px',
      backgroundColor: THEME.cardBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: cardContents,
    };
  });

  const bodyContents =
    notes.length > 0
      ? noteCards
      : [
          {
            type: 'box',
            layout: 'vertical',
            paddingAll: '18px',
            backgroundColor: THEME.cardBg,
            cornerRadius: '12px',
            borderWidth: '1px',
            borderColor: THEME.cardBorder,
            contents: [
              {
                type: 'text',
                text: '📭 目前尚無待辦記事',
                size: 'md',
                weight: 'bold',
                color: THEME.titleText,
                align: 'center',
              },
              {
                type: 'text',
                text: '點選「➕ 記一筆」查看範本，或傳送「記下：下週三送審」即可建立！',
                size: 'sm',
                color: THEME.subText,
                wrap: true,
                margin: 'sm',
                align: 'center',
              },
            ],
          },
        ];

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '📝 SMART MEMO HUB',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: `${notes.length} 項紀錄`,
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '📌 專屬智能記事本與待辦清單',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents: bodyContents,
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '➕ 記一筆',
            text: '新增記事',
          },
          style: 'primary',
          height: 'sm',
          color: THEME.btnGoldBg,
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📊 智能統整',
            text: '智能統整',
          },
          style: 'primary',
          height: 'sm',
          color: THEME.btnPrimaryBg,
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🧹 清空',
            text: '清空記事',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `📝 智能記事本 (${notes.length} 項待辦)`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 📝 智能記事快捷引導選單 / 範本 Flex 卡片 (統一黑曜金)
 */
function createNoteHelperFlex() {
  const templates = [
    {
      badge: '📅 日程會議',
      title: '工程會勘 / 會議日程',
      example: '記下：明天上午9點結構技師工地會勘',
    },
    {
      badge: '📋 待辦交辦',
      title: '法規送審 / 待辦交辦',
      example: '記下：下週三向建管處送審執照變更案',
    },
    {
      badge: '💰 報價成本',
      title: '建材報價 / 發包成本',
      example: '備忘：鋼筋每噸最新報價 21,500 元',
    },
    {
      badge: '📐 工程技術',
      title: '工法規格 / 結構變更',
      example: '記下：連續壁厚度由70cm調整至80cm',
    },
    {
      badge: '💡 靈感策略',
      title: '都更危老 / 獎勵策略',
      example: '備忘：爭取危老容積獎勵滿額40%',
    },
  ];

  const templateRows = templates.map((tpl, idx) => ({
    type: 'box',
    layout: 'vertical',
    margin: idx === 0 ? 'none' : 'md',
    paddingAll: '12px',
    backgroundColor: THEME.cardBg,
    cornerRadius: '12px',
    borderWidth: '1px',
    borderColor: THEME.cardBorder,
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: THEME.badgeBg,
            cornerRadius: 'md',
            paddingStart: '8px',
            paddingEnd: '8px',
            paddingTop: '3px',
            paddingBottom: '3px',
            contents: [
              {
                type: 'text',
                text: tpl.badge,
                size: 'xs', weight: 'bold', color: THEME.badgeText,
              },
            ],
          },
          {
            type: 'text',
            text: tpl.title,
            size: 'xs',
            weight: 'bold',
            color: THEME.titleText,
            margin: 'sm',
            gravity: 'center',
          },
        ],
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'sm',
        paddingAll: '8px',
        backgroundColor: '#FFFFFF',
        cornerRadius: '8px',
        borderWidth: '1px',
        borderColor: THEME.cardBorder,
        contents: [
          {
            type: 'text',
            text: tpl.example,
            size: 'xs',
            color: THEME.bodyText,
            wrap: true,
          },
        ],
      },
      {
        type: 'button',
        action: {
          type: 'message',
          label: '✍️ 一鍵填入此範本',
          text: tpl.example,
        },
        style: 'primary',
        color: THEME.btnPrimaryBg,
        height: 'sm',
        margin: 'sm',
      },
    ],
  }));

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '⚡ QUICK NOTE ASSISTANT',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '一鍵快速記事',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '📝 智能記事快捷選單 & 範本引導',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
        {
          type: 'text',
          text: '無需硬記指令！點擊下方任一範本即可直接填入或修改發送：',
          size: 'xs',
          color: THEME.badgeSub,
          margin: 'xs',
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '14px',
      contents: templateRows,
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📝 待辦清單',
            text: '看記事',
          },
          style: 'primary',
          height: 'sm',
          color: THEME.btnPrimaryBg,
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: '📝 智能記事快捷選單 & 範本引導',
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 📊 全方位智能統整報告 Flex 卡片 (曜石黑 + 香檳金 · 手機美學優化)
 */
function createSynthesisFlex({ data = null, rawText = '' }) {
  const report = data || {
    overview: rawText,
    coreDecisions: [],
    actionItems: [],
    keyData: [],
    risksAndWatch: '',
    strategicAdvice: '',
  };

  const bodyContents = [];

  // 1. 今日工作推進總結
  if (report.overview) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      paddingAll: '14px',
      contents: [
        {
          type: 'text',
          text: '🎯 今日工作與對話推進總結',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentGoldText,
        },
        {
          type: 'text',
          text: report.overview,
          size: 'sm',
          color: THEME.bodyText,
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  // 2. 重要決策與共識
  if (report.coreDecisions && report.coreDecisions.length > 0) {
    const decisionRows = report.coreDecisions.map((d) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '•',
          size: 'md',
          color: THEME.accentGold,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: d,
          size: 'sm',
          color: THEME.bodyText,
          flex: 1,
          wrap: true,
        },
      ],
    }));

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '14px',
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      contents: [
        {
          type: 'text',
          text: '💡 重要決策與共識定案',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentGoldText,
        },
        ...decisionRows,
      ],
    });
  }

  // 3. 待辦與工程交辦事項
  if (report.actionItems && report.actionItems.length > 0) {
    const actionRows = report.actionItems.map((a) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '✓',
          size: 'md',
          color: THEME.accentEmerald,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: a,
          size: 'sm',
          color: THEME.bodyText,
          flex: 1,
          wrap: true,
        },
      ],
    }));

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '14px',
      backgroundColor: THEME.cardEmeraldBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardEmeraldBorder,
      contents: [
        {
          type: 'text',
          text: '📌 待辦與工程交辦清單',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentEmeraldText,
        },
        ...actionRows,
      ],
    });
  }

  // 4. 關鍵數據與備忘
  if (report.keyData && report.keyData.length > 0) {
    const dataRows = report.keyData.map((k) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '▸',
          size: 'md',
          color: THEME.accentBlue,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: k,
          size: 'sm',
          color: THEME.bodyText,
          flex: 1,
          wrap: true,
        },
      ],
    }));

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '14px',
      backgroundColor: THEME.cardBlueBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardBlueBorder,
      contents: [
        {
          type: 'text',
          text: '💰 關鍵數據與報價備忘',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentBlueText,
        },
        ...dataRows,
      ],
    });
  }

  // 5. 實務風險與預警
  if (report.risksAndWatch) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: THEME.cardRoseBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardRoseBorder,
      paddingAll: '14px',
      contents: [
        {
          type: 'text',
          text: '⚠️ 工程介面與時程風險預警',
          size: 'sm',
          weight: 'bold',
          color: THEME.accentRoseText,
        },
        {
          type: 'text',
          text: report.risksAndWatch,
          size: 'sm',
          color: THEME.bodyText,
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  // 6. 總監級戰略建議
  if (report.strategicAdvice) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '12px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      paddingAll: '14px',
      contents: [
        {
          type: 'text',
          text: '🚀 總監級下一步推進戰略',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: report.strategicAdvice,
          size: 'xs',
          color: THEME.bodyText,
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '📊 EXECUTIVE ALL-IN-ONE',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: new Date().toLocaleDateString('zh-TW'),
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '全方位對話、記事與工程智能統整',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: rawText || '目前無可統整之內容',
                size: 'sm',
                color: THEME.bodyText,
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📝 記事清單',
            text: '看記事',
          },
          style: 'primary',
          height: 'sm',
          color: THEME.btnPrimaryBg,
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: '📊 全方位對話與工程智能統整報告',
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立新加入好友/群組的歡迎與功能導引 Flex 卡片
 */
function createWelcomeFlex() {
  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🏛️ AI 建築智庫特助',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '全功能上線',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '大家好！我是「丞石建築 AI 機器人」，很高興加入此對話。\n\n我是來協助紀錄群組中的重要聊天內容，並自動統整重點、待辦事項與重要決議；每天晚上 19:00，也會統整當日討論內容，讓公司團隊能快速掌握溝通脈絡、明確確認需求與後續執行方向，減少資訊遺漏與重複溝通。',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, wrap: true, margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          backgroundColor: THEME.cardHighlightBg,
          cornerRadius: '10px',
          borderWidth: '1px',
          borderColor: THEME.cardHighlightBorder,
          paddingAll: '12px',
          contents: [
            {
              type: 'text',
              text: '🏛️ 我加入群組的目的',
              size: 'xs',
              weight: 'bold',
              color: THEME.titleText,
            },
            {
              type: 'text',
              text: '我的主要工作是協助團隊完整紀錄群組中的聊天內容，並將分散的討論統整為清楚的重點、客戶需求、待辦事項與重要決議。\n\n透過有系統地保留討論脈絡，讓團隊能快速確認客戶需求、掌握後續執行方向，降低資訊遺漏與重複溝通的情況。',
              size: 'xs',
              color: THEME.bodyText,
              wrap: true,
              margin: 'sm',
            },
          ],
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          paddingAll: '12px',
          backgroundColor: THEME.cardBg,
          cornerRadius: '10px',
          borderWidth: '1px',
          borderColor: THEME.cardBorder,
          contents: [
            {
              type: 'text',
              text: '🔒 訊息留存與調閱說明',
              size: 'xs',
              weight: 'bold',
              color: THEME.titleText,
            },
            {
              type: 'text',
              text: '本群組由公司官方帳號進行訊息留存，作為案件管理、交接、爭議處理與稽核用途。已接收並留存的訊息，即使日後在 LINE 中被收回，系統仍可能保留原始紀錄；相關紀錄僅限授權人員依業務需要調閱。',
              size: 'xs',
              color: THEME.bodyText,
              wrap: true,
              margin: 'sm',
            },
          ],
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          paddingAll: '12px',
          backgroundColor: THEME.cardBg,
          cornerRadius: '10px',
          borderWidth: '1px',
          borderColor: THEME.cardBorder,
          contents: [
            {
              type: 'text',
              text: '⚡ 您可以這樣使用我',
              size: 'xs',
              weight: 'bold',
              color: THEME.titleText,
            },
            {
              type: 'text',
              text: '1. 🗓️ 每日 19:00 自動統整全天的聊天重點與待辦事項\n2. 📝 需要即時整理時，可輸入「摘要」取得目前對話重點\n3. 📝 要記錄事項時，可輸入「記下：明天上午 9 點會勘」\n4. 📋 輸入「看記事」查看待辦；輸入「智能統整」進行跨面向整理\n5. 💬 如需建築、工程或專案協助，可呼叫「大大」、「@AI」、「請問」、「請教」或「幫我」開始提問',
              size: 'xs',
              color: THEME.bodyText,
              wrap: true,
              margin: 'sm',
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'primary',
          color: THEME.btnPrimaryBg,
          height: 'sm',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '➕ 快速記事',
            text: '新增記事',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: '🏛️ 您好！我是「丞石建築 AI 機器人」',
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 ⚙️ 推播與定時通知設定 Flex 卡片 (曜石黑 + 香檳金 · 手機美學優化)
 */
function createSettingsFlex(settings = { newsEnabled: false, summaryEnabled: true }) {
  const summaryEnabled = settings.summaryEnabled !== false;
  return {
    type: 'flex',
    altText: `⚙️ 推播通知設定（每日 19:00 對話摘要：${summaryEnabled ? '開啟' : '關閉'}）`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: THEME.headerBg, paddingAll: '18px',
        contents: [
          { type: 'text', text: '⚙️ 推播偏好設定', weight: 'bold', size: 'lg', color: THEME.headerTitle },
          { type: 'text', text: '管理每日對話摘要通知', size: 'xs', color: THEME.badgeSub, margin: 'sm' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', backgroundColor: THEME.bodyBg, paddingAll: '18px',
        contents: [
          { type: 'text', text: '📋 每日對話摘要（19:00）', weight: 'bold', size: 'sm', color: THEME.titleText },
          { type: 'text', text: `目前狀態：${summaryEnabled ? '🟢 每日 19:00 準時推播' : '⚪ 已關閉推播'}`, size: 'xs', color: summaryEnabled ? THEME.accentGold : THEME.subText, margin: 'sm' },
          { type: 'text', text: '智能整理今日對話重點、待辦事項與重要數字。', size: 'xxs', color: THEME.mutedText, wrap: true, margin: 'sm' },
          {
            type: 'button', margin: 'md', height: 'sm', style: summaryEnabled ? 'secondary' : 'primary',
            color: summaryEnabled ? undefined : THEME.btnGoldBg,
            action: { type: 'message', label: summaryEnabled ? '🛑 關閉摘要推播' : '🔔 開啟摘要推播', text: summaryEnabled ? '關閉摘要' : '開啟摘要' },
          },
        ],
      },
    },
    quickReply: getQuickReply(),
  };

  const newsStatusText = settings.newsEnabled ? '🟢 每日 08:00 準時推播' : '⚪ 已關閉推播';
  const newsBtnText = settings.newsEnabled ? '關閉新聞' : '開啟新聞';
  const newsBtnStyle = settings.newsEnabled ? 'secondary' : 'primary';

  const summaryStatusText = settings.summaryEnabled ? '🟢 每日 19:00 準時推播' : '⚪ 已關閉推播';
  const summaryBtnText = settings.summaryEnabled ? '關閉摘要' : '開啟摘要';
  const summaryBtnStyle = settings.summaryEnabled ? 'secondary' : 'primary';

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '⚙️ NOTIFICATION SETTINGS',
                  size: 'xs', weight: 'bold', color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '推播偏好設定',
              size: 'xs', color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '🏛️ 定時推播與通知管理',
          weight: 'bold',
          size: 'lg', color: THEME.headerTitle, margin: 'md',
        },
        {
          type: 'text',
          text: '您可以依需求個別開啟或關閉晨間新聞與晚間對話總結。',
          size: 'xs',
          color: THEME.badgeSub,
          margin: 'xs',
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '18px',
      spacing: 'md',
      contents: [
        // 模組 1: 晨間新聞
        {
          type: 'box',
          layout: 'vertical',
          paddingAll: '12px',
          backgroundColor: THEME.cardBg,
          cornerRadius: '10px',
          borderWidth: '1px',
          borderColor: THEME.cardBorder,
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '📰 晨間建築新聞 (08:00)',
                  weight: 'bold',
                  size: 'sm',
                  color: THEME.titleText,
                },
              ],
            },
            {
              type: 'text',
              text: `目前狀態：${newsStatusText}`,
              size: 'xs',
              color: settings.newsEnabled ? THEME.accentGold : THEME.subText,
              weight: settings.newsEnabled ? 'bold' : 'regular',
              margin: 'sm',
            },
            {
              type: 'text',
              text: '彙整每日最新營造工料、房市都更、ESG綠建築與工程要聞。',
              size: 'xxs',
              color: THEME.mutedText,
              wrap: true,
              margin: 'xs',
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: settings.newsEnabled ? '🛑 關閉新聞推播' : '🔔 開啟新聞推播',
                text: newsBtnText,
              },
              style: newsBtnStyle,
              height: 'sm',
              color: settings.newsEnabled ? undefined : THEME.btnGoldBg,
              margin: 'md',
            },
          ],
        },
        // 模組 2: 晚間對話總結
        {
          type: 'box',
          layout: 'vertical',
          paddingAll: '12px',
          backgroundColor: THEME.cardBg,
          cornerRadius: '10px',
          borderWidth: '1px',
          borderColor: THEME.cardBorder,
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '📋 晚間對話總結 (19:00)',
                  weight: 'bold',
                  size: 'sm',
                  color: THEME.titleText,
                },
              ],
            },
            {
              type: 'text',
              text: `目前狀態：${summaryStatusText}`,
              size: 'xs',
              color: settings.summaryEnabled ? THEME.accentGold : THEME.subText,
              weight: settings.summaryEnabled ? 'bold' : 'regular',
              margin: 'sm',
            },
            {
              type: 'text',
              text: '智能整理今日群組交流重點、工程決議、待辦事項與重要數字。',
              size: 'xxs',
              color: THEME.mutedText,
              wrap: true,
              margin: 'xs',
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: settings.summaryEnabled ? '🛑 關閉摘要推播' : '🔔 開啟摘要推播',
                text: summaryBtnText,
              },
              style: summaryBtnStyle,
              height: 'sm',
              color: settings.summaryEnabled ? undefined : THEME.btnGoldBg,
              margin: 'md',
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardBg,
      paddingAll: '10px',
      contents: [
        {
          type: 'text',
          text: '💡 提示：在群組中操作會套用至該群組；在私聊中操作僅套用至個人。',
          size: 'xxs',
          color: THEME.mutedText,
          align: 'center',
          wrap: true,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `⚙️ 推播通知設定 (新聞:${settings.newsEnabled ? '開啟' : '關閉'} / 摘要:${settings.summaryEnabled ? '開啟' : '關閉'})`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

module.exports = {
  THEME,
  getQuickReply,
  createVideoFlex,
  createWebFlex,
  createImageFlex,
  createAudioFlex,
  createExecutiveSummaryFlex,
  createConstructionNewsFlex,
  createMenuFlex,
  createNewsAnalysisFlex,
  createAssistantFlex,
  createNotesFlex,
  createNoteHelperFlex,
  createSynthesisFlex,
  createWelcomeFlex,
  createSettingsFlex,
};
