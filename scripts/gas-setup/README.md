# 旅程 Google 後端 — Runbook

> 太久沒用、忘記怎麼弄時照這份做。給人看，也給 coworker 在執行階段照著跑。
> **架構**：一個試算表(兩分頁) + 一個 Web App，行程與記帳都走它，**PIN 由伺服器端驗證**，不用 Google Form。

## 0. 先回想這在幹嘛（30 秒）

一個旅程的後端 = **1 個試算表（兩分頁）+ 1 個 Web App**，由 `Code.gs` 生：

| 分頁 | 欄位 | 用途 |
|---|---|---|
| `Itinerary` | id, day, time, title, desc, icon | 行程 CRUD |
| `Expenses` | id, timestamp, item, amount, category, payer | 記帳 CRUD（`#split:` 藏在 item） |

前端只打一個 Web App：`POST { pin, type:'itinerary'|'expense', action, ...payload }`。
web app 先驗 `pin`（存在 Script Properties 的 `AUTH_PIN`）→ 錯就不回資料。

**為什麼這樣**：Form 只能 append、改刪不了、coworker 建不了；個人 Gmail 的 service account 不能建 Drive 檔。
一支 GAS 全走 Web App 最穩；PIN 放伺服器端才不會被編進公開 bundle。

## 1. 全新旅程

1. script.google.com → 新增專案 → 貼上 `Code.gs`。
2. 改 `CONFIG`（`tripName` / `year` / `parentFolderId`）。父資料夾 ID：
   | 地區 | ID |
   |---|---|
   | 蜜月自由行 | `1UmSHuESG68cHbzCRFDeN0u16o0EmTk_-` |
   | 韓國自由行 | `1znr24DKM5yyAEpC09D_ABG3q13ft15E7` |
   | 日本自由行 | `1NzIFIsDzomgIFMCffxaoYSuloXrHkO74` |
   | 新地區 | 先在 Drive 手動建「◯◯自由行」資料夾，複製其 ID |
3. 🖐️ 執行 `setupTrip()` → 第一次跳授權，按「允許」。
4. 設 PIN：專案設定 → 指令碼屬性 → `AUTH_PIN = <你的 PIN>`（或跑一次 `setPin("123456")`）。
5. 🖐️ 部署 → 新增部署 → Web App（執行身分：我；存取：任何人）→ 複製 `/exec` 網址。
6. app 端：把 `/exec` 網址**直接寫進** `src/App.jsx` 的 `config.api.url`（非敏感，PIN 已在伺服器擋著）。
   **不需要 .env、不需要 GitHub secret。** 邏輯都在 `shared/components/TripApp.jsx`，不必逐 app 改。
7. （驗）跑 `test_()` 應印「CRUD 自我檢查通過 ✅」；`npm run test && build` 全綠。

## 2. 遷移既有旅程（seoul / honeymoon → 收斂後端）

既有 app 已有可用的**行程試算表 + 行程 web app**。做法是「就地擴充」那個 web app，不換網址：

1. 打開該旅程**行程 web app 的 Apps Script 專案**（從行程試算表 Extensions → Apps Script，
   或原本部署它的專案），把 `Code.gs` **整份貼上覆蓋**。
2. 綁定 + 補分頁：跑 `initExisting("<行程試算表ID>")`（ID 從試算表網址取）。
   會沿用行程分頁、自動補 `Expenses` 分頁與標題列。
3. 設 PIN：指令碼屬性 `AUTH_PIN = <原本那組 PIN>`（seoul=260115、honeymoon=260416），
   或跑 `setPin("260115")`。
4. 搬舊記帳：跑 `migrateExpenses("<舊◯◯記帳試算表ID>")`（留空第二參數＝第一個分頁／表單回應）。
   會依中文標題自動對應搬進 `Expenses`。跑一次就好。
5. 🖐️ **重新部署同一個部署**（部署 → 管理部署 → 編輯 → 版本選「新版本」→ 部署）→ **網址不變**。
   若網址真的變了，更新該 app 的 `config.api.url`。
6. 關掉舊記帳試算表的「發佈到網路」（檔案 → 共用 → 發佈到網路 → 停止發佈），共用設「限制」。
7. 刪掉該旅程在 GitHub 的舊 secret（`_AUTH_PIN` / `_FORM_ACTION_URL` / `_SHEET_CSV_URL` / `_SHEET_PLAN_CSV_URL`）。
8. （驗）跑 `test_()`。

**⚠️ 順序很重要**：先做完這個 GAS 遷移（後端 endpoint 就緒），**再**部署新前端。
反過來的話，新前端會打不存在的記帳 endpoint。

## 3. 驗收（做完打勾）

- [ ] 試算表有 `Itinerary` + `Expenses` 兩分頁與標題列；舊記帳已搬入 `Expenses`
- [ ] 指令碼屬性有 `AUTH_PIN`
- [ ] `/exec` 網址已寫進 `config.api.url`；**沒有任何 GitHub secret / .env 變數**
- [ ] 舊記帳試算表已「停止發佈」、共用設「限制」；舊的 4 個 GitHub secret 已刪
- [ ] `test_()` 通過
- [ ] `cd <trip>-YYYY && npm install && npm run test && npm run build` 全綠
- [ ] 部署後開 app：輸入 PIN 能進、行程與記帳都讀寫正常、記帳可刪

> 一個 Apps Script 專案 = 一個旅程。PIN 存伺服器端，前端 bundle 不含任何祕密。
