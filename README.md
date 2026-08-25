# LineChat Summarizer

LINE官方帳號(Messaging API) Bot：記錄收到的對話內容，用OpenAI整理成重點摘要，並推播回原對話。支援「每天定時摘要」和「傳關鍵字立即摘要」兩種觸發方式。

## 運作方式

1. `POST /webhook` 接收LINE傳來的訊息事件（支援純文字、含YouTube/網頁連結、圖片、語音訊息）：
   - **YouTube 連結**：自動抓取字幕逐字稿與影片資訊，提煉 2~3 點精華重點
   - **網頁/文章連結**：自動爬梳 OpenGraph 與內文，產出網頁核心摘要
   - **圖片訊息**：透過 OpenAI Vision (GPT-4o-mini) 辨識畫面主體、圖表數據與 OCR 文字
   - **語音訊息**：透過 OpenAI Whisper 語音轉文字
   - 所有訊息與摘要自動存入 Upstash Redis（依 1對1 / 群組 / 聊天室分開存放）
2. 使用者傳送關鍵字（預設「摘要」）時，立即整理自上次晚間自動摘要起累積的對話並回覆；手動查詢不會改變晚間摘要的週期起點。
3. 每天固定時間（預設19:00），由外部排程呼叫 `POST /tasks/summary` 觸發整理；每個對話會從上次成功推播的時間點累積至本次執行時間，再呼叫 OpenAI 摘要並以 `pushMessage` 推播。首次自動推播會回溯最近 24 小時。

線上部署在Render（免費方案），因為免費instance閒置會睡著、且沒有persistent disk，所以：
- 訊息儲存改用 Upstash Redis（獨立於instance之外，重啟不會遺失）
- 正式排程使用 cron-job.org 主動呼叫；GitHub Actions 僅保留為 19:15 的備援，因其排程可能延遲

## 前置需求

- Node.js 18+
- 一個LINE官方帳號的 Messaging API Channel
- 一組OpenAI API key
- 一個Upstash Redis免費資料庫（[console.upstash.com](https://console.upstash.com)）

## LINE Developers 申請步驟

1. 前往 [LINE Developers Console](https://developers.line.biz/console/) 登入
2. 建立 Provider → 在其下建立 Channel，類型選 **Messaging API**
3. 「Basic settings」分頁取得 **Channel secret**
4. 「Messaging API」分頁點 Issue 取得 **Channel access token**（長期）
5. 到 [LINE Official Account Manager](https://manager.line.biz) → 設定 → 回應設定，把 **聊天**、**加入好友的歡迎訊息**、**自動回應訊息** 都關閉，**Webhook** 開啟
6. 用手機LINE掃QR code，把這個官方帳號加為好友

## 本機安裝與設定

```bash
npm install
copy .env.example .env
```

編輯 `.env`，填入LINE、OpenAI、Upstash Redis的金鑰（見 `.env.example` 註解說明）。

## 本機測試（需要外網能連到你的webhook）

```bash
npm start
# 另開一個終端機
ngrok http 3000
```

把ngrok給的 `https://xxxx.ngrok-free.app/webhook` 貼回LINE Developers Console的Webhook URL，並打開 **Use webhook**。

本機測試 `/tasks/summary` 端點（`SUMMARY_TRIGGER_SECRET` 留空時不需要帶密鑰）：

```bash
curl -X POST http://localhost:3000/tasks/summary
```

## 推播訂閱與個人化開關控制

所有群組或個人使用者皆可自主控制定時推播，無需所有人被動接收：
- 傳送 **「推播設定」** 或點擊快捷列上的 **「⚙️ 推播設定」**，即可查看與操作目前的推播狀態卡片。
- **晚間總結 (19:00)**：傳送 **「開啟摘要」** 或 **「關閉摘要」**。
- 在群組中設定將套用於該群組；在私聊中設定僅套用於個人。

## 正式部署與定時精準觸發（Render + cron-job.org / GitHub Actions）

1. 把程式碼push到GitHub repo
2. 在 [Render](https://render.com) 建立 **Web Service**，連接該repo：
   - Build Command：`npm install`
   - Start Command：`npm start`
   - Instance Type：Free
   - Environment Variables：把 `.env` 裡的所有變數都加進去，`SUMMARY_TRIGGER_SECRET` 務必設定（保護觸發端點不被任意呼叫）
3. 部署完成後拿到固定網址，回LINE Developers Console把Webhook URL改成 `https://你的服務.onrender.com/webhook`
4. **準時推播（使用 cron-job.org 作為主要排程）**：
   - 免費註冊 [cron-job.org](https://cron-job.org)
   - 建立下列 2 個排程，時區都選 **Asia/Taipei**：
     1. **每日 18:57 預熱服務**：
        - URL: `https://你的服務.onrender.com/ping`
        - Method: `GET`
     2. **每日 19:00 晚間總結**：
        - URL: `https://你的服務.onrender.com/tasks/summary`
        - Method: `POST`
        - Header: `x-trigger-secret: 你的密鑰`
   - 免費 Render 若已休眠，預熱請求會先完成冷啟動，避免它拖延 19:00 的摘要請求。若必須把送達時間壓到秒級，請使用不會休眠的 Render 方案（或其他常駐主機）。
5. GitHub Actions workflow 會在 **19:15** 作備援；若 cron-job.org 已成功執行，Redis 每日鎖會自動略過它。請在 GitHub repo 的 **Settings → Secrets and variables → Actions** 新增 `SUMMARY_TRIGGER_SECRET`。

## 查詢歷史總結紀錄

每次產生摘要（不論排程或即時查詢）都會存一份完整紀錄到 Redis（`linechat:history`）。想查看該對話最近產生過的摘要，傳送 **「歷史紀錄」**（或「查歷史」、「總結歷史」、「摘要歷史」）即可回覆最近 5 筆。

若紀錄已被 `npm run sync` 同步搬到NAS MySQL（見下方），Redis 裡會被移除，屆時「歷史紀錄」關鍵字只會顯示尚未同步走的較新紀錄；更早的要直接查 MySQL 的 `conversation_summaries` 表。

## 長期歸檔到NAS MySQL（選用）

`scripts/sync-to-mysql.js` 會把 Redis 裡累積的 `linechat:history` 寫入NAS上的MySQL（`conversation_summaries` 表），成功寫入後才從Redis移除。因為NAS的MySQL通常只開放內網，**這支腳本必須在能連到NAS的機器上執行**（例如NAS本機、或同一區網內的伺服器），不能放進Render或GitHub Actions（兩者都是雲端、連不到內網IP）。

它預設**不會自動執行**，需要自行排程，例如在Synology NAS上：

1. `.env` 填好 `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`（見 `.env.example`）以及 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
2. 把整個repo（或至少 `scripts/sync-to-mysql.js`、`package.json`、`node_modules`、`.env`）放到NAS上
3. DSM → **控制台 → 工作排程器 → 新增 → 已排程的工作 → 使用者定義的指令碼**
   - 排程頻率：例如每小時或每天固定時間
   - 使用者：有權限存取MySQL的帳號
   - 執行指令：
     ```bash
     cd /volume1/path/to/LineChat && /usr/local/bin/node scripts/sync-to-mysql.js >> logs/sync.log 2>&1
     ```
     （Node路徑用 `which node` 或DSM套件安裝路徑確認；`logs/` 資料夾需自行建立）
4. 也可先手動跑一次確認連線正常：`npm run sync`

## 環境變數說明

見 `.env.example`，重點有：

- `DEFAULT_SUMMARY_ENABLED`：新對話預設是否推播晚間總結（預設 `true`）
- `SUMMARY_CRON`：伺服器內建node-cron的排程表達式（預設 `0 19 * * *`）
- `MAX_MESSAGES_PER_SUMMARY`：單次摘要最多帶入的訊息則數，超過會自動分段摘要後再合併
- `SUMMARY_KEYWORD`：使用者傳送這個關鍵字（預設「摘要」）會立即回覆目前累積的摘要
- `SUMMARY_TRIGGER_SECRET`：保護 `/tasks/summary` 端點的密鑰，正式環境務必設定

## 注意事項

- 群組/多人聊天室要能取得成員暱稱，需LINE官方帳號有權限讀取該成員資料（對方需為官方帳號好友或群組設定允許），否則會顯示「未知使用者」
- Render免費方案會有冷啟動延遲（instance睡著時第一個請求會慢幾秒到十幾秒）
