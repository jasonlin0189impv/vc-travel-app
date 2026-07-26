# Google Apps Script Web App 效能排錯指南

當 Web App 在操作 Google Sheets 出現延遲或卡死時，請依照以下步驟進行診斷與優化：

## 一、 診斷工具 (Diagnostics)

### 1. 執行紀錄 (Executions)
- **路徑**： Apps Script 編輯器左側 > 「執行紀錄」。
- **檢查重點**： 找出狀態為「已逾時」或「失敗」的紀錄，查看其「持續時間」。

### 2. 埋設時間標記 (Time Logs)
使用 `console.time()` 找出程式碼中具體的耗時斷點：

```javascript
function myFunction() {
  console.time("讀取資料");
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data").getDataRange().getValues();
  console.timeEnd("讀取資料"); // 會在執行紀錄中顯示耗費毫秒數
}
```

## 二、 核心優化策略

### 1. 批次處理 (Batch Operations) — 效能提升關鍵
- **❌ 錯誤做法**： 在 for 迴圈中使用 `getValue()` 或 `setValue()`（每執行一次都會與伺服器通訊，極慢）。
- **✅ 正確做法**：
    1. 使用 `getValues()` 一次讀取整片區域到 Array。
    2. 在記憶體中處理 Array。
    3. 使用 `setValues()` 一次寫回。

### 2. 併發處理 (LockService)
當多人同時存取 Web App 時，為了防止資料衝突導致的鎖定掛起，必須加上鎖定機制：

```javascript
const lock = LockService.getScriptLock();
try {
  lock.waitLock(15000); // 等待最多 15 秒
  // 執行 CRUD 邏輯...
  SpreadsheetApp.flush(); // 強制同步
} finally {
  lock.releaseLock();
}
```

### 3. 減少試算表負擔
- **減少公式**： 若 Sheet 中有數千行 VLOOKUP 或複雜公式，每次寫入都會觸發重新計算。建議將計算邏輯移至 Script 中處理。
- **資料封存**： 避免單一 Sheet 行數過大（如超過 10,000 行），應定期將舊資料移至封存檔。

## 三、 快速檢查清單 (Checklist)

| 檢查項目 | 說明 |
| :--- | :--- |
| **Batching** | 我是否避免了在迴圈內讀寫儲存格？ |
| **LockService** | 我是否有處理多人同時寫入的排隊機制？ |
| **Sheet Formulas** | 試算表內是否有過多導致重算的公式？ |
| **Network** | 檢查瀏覽器 F12 Network，確認是否為前端傳輸過大封包？ |
| **Flush** | 在腳本結束前是否有執行 `SpreadsheetApp.flush()`？ |

---

**下一步建議**：如果你想找出具體的效能瓶頸，可以提供你目前負責「寫入/更新」的那段程式碼，我可以幫你直接進行優化改寫。
