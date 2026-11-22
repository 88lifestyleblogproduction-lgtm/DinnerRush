# DinnerRush — 餐廳人流預測（登入版）

用 email 加密碼（或 Google）喺 app 入面登入，每個戶口有自己一份資料，電腦同電話自動同步。
資料儲喺 Netlify Blobs，登入用 Netlify Identity。

## 一次性設定（大約 10 分鐘）

1. **上載去 GitHub**
   - 喺 GitHub 開一個新 repo，例如 `dinnerrush`（Private 都得）。
   - 撳「Add file → Upload files」，將呢個資料夾入面**所有嘢**（`public`、`src`、`netlify`、`netlify.toml`、`package.json`、`README.md`、`.gitignore`）拖入去，再撳 Commit。

2. **喺 Netlify 連接 repo**
   - Netlify → Add new project → Import an existing project → GitHub → 揀 `dinnerrush`。
   - Build 設定會自動由 `netlify.toml` 讀取（build command `npm run build`，publish `public`），直接撳 Deploy。

3. **開啟登入（Identity）**
   - 個 project 入面：Project configuration → Identity → **Enable Identity**。
   - Registration：揀 **Open**（任何人可以註冊），或者 **Invite only**（只有你邀請嘅人）。
   - External providers → Add provider → **Google** → 揀「Use Netlify's app」（唔使自己申請 Google key）。
   - （可選）Emails → Confirmation template → 開 autoconfirm，註冊就唔使收確認 email。

4. **只准自己 / 員工用（建議）**
   - Project configuration → Environment variables → 加 `ALLOWED_EMAILS`，值係准用嘅 email，用逗號分隔，例如 `me@gmail.com,manager@gmail.com`。
   - 加完要 Deploys → Trigger deploy 一次。冇設嘅話，所有登入咗嘅人都可以用。

5. **試用**
   - 打開個網址 → 右上角「登入」→「註冊」→ 填 email 同密碼 → 去 email 撳確認 → 返嚟登入。
   - 見到「已同步」就成功。喺電話用同一個 email 登入，就會見到同一份資料。
   - iPhone：用 Safari 打開 → 分享 → 加入主畫面。

## 要留意
- 呢個版本要經 GitHub 部署，**唔可以用 Netlify Drop 拖放**（拖放唔會建立登入同儲存功能）。
- Identity 喺本機測試唔運作，一定要喺部署咗嘅網址試。
- 喺 iPhone 主畫面 app 用 Google 登入，可能會跳去 Safari；email 加密碼就全程喺 app 入面。
- 登出會清走嗰部機上面嘅資料，資料仍然安全儲喺你個戶口，再登入就返嚟。

## 檔案
- `public/index.html` — app
- `src/auth.js` — 打包成 `public/auth.js`，提供登入功能（Netlify 自動 build）
- `netlify/functions/state.mjs` — `/api/state`，只讀寫登入咗嗰個人自己嘅資料
