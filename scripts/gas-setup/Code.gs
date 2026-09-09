/**
 * vc-travel-app — 單一旅程後端 (Google Apps Script)  ── 收斂 + 伺服器端 PIN 驗證
 *
 * 一個試算表（Itinerary / Expenses 兩分頁）+ 一個 Web App，行程與記帳都走它，不用 Google Form。
 * 登入 PIN 存在 Script Properties（伺服器端，永不下發到瀏覽器、不進 repo）。
 *
 * 一個 Apps Script 專案 = 一個旅程。三種起手式：
 *
 *   A. 全新旅程        → 改 CONFIG，跑 setupTrip()（建資料夾 + 試算表 + 兩分頁）
 *   B. 擴充現有旅程    → 跑 initExisting("<現有行程試算表ID>")（沿用行程表，補 Expenses 分頁）
 *   C. 都要            → 跑完 A 或 B 後，設 PIN、（B 才需要）搬舊記帳資料、部署 Web App
 *
 * 設 PIN：Apps Script 專案設定 → 指令碼屬性 → 新增 AUTH_PIN = <你的 PIN>
 *         （或在編輯器跑一次 setPin("123456")，值會寫進屬性，不會留在程式碼裡）
 *
 * 部署：部署 → 新增部署 → Web App（執行身分：我；存取：任何人）
 *       → /exec 網址直接寫進 <trip>-YYYY/src/App.jsx 的 config.api.url
 *         （非敏感，已被伺服器端 PIN 保護；不需要 .env、不需要 GitHub secret）
 *
 * 已知父資料夾 ID（旅遊/）：蜜月 1UmSHuESG68cHbzCRFDeN0u16o0EmTk_-
 *   韓國 1znr24DKM5yyAEpC09D_ABG3q13ft15E7 / 日本 1NzIFIsDzomgIFMCffxaoYSuloXrHkO74
 */

// ============ CONFIG — 每個新旅程由使用者/coworker 填（只有 setupTrip() 會用到）============
// 遷移既有旅程走 initExisting()，不讀這裡，可整塊略過。
// 留空時 setupTrip() 會直接報錯（而非誤建垃圾資料夾），這是刻意的保護。
var CONFIG = {
  tripName: '',                 // ← 填：旅程名，例：'蜜月'、'首爾'
  year: 2026,                   // ← 改：該旅程年份（範例值，記得換成當次年份）
  parentFolderId: '',           // ← 填：該地區資料夾 ID（旅遊/◯◯自由行）；見檔頭「已知父資料夾 ID」對照
};

var TABS = {
  itinerary: { name: 'Itinerary', headers: ['id', 'day', 'time', 'title', 'desc', 'icon'] },
  expense:   { name: 'Expenses',  headers: ['id', 'timestamp', 'item', 'amount', 'category', 'payer'] },
};
var PROP_SPREADSHEET_ID = 'TRIP_SPREADSHEET_ID';
var PROP_PIN = 'AUTH_PIN';

// ============ A. 全新旅程 ============
function setupTrip() {
  var c = CONFIG;
  var folder = DriveApp.getFolderById(c.parentFolderId).createFolder(c.tripName + '_' + c.year);
  var ss = SpreadsheetApp.create(c.year + ' ' + c.tripName);
  ss.getSheets()[0].setName(TABS.itinerary.name);
  ensureTabsAndHeaders_(ss);
  moveToFolder_(ss.getId(), folder);
  PropertiesService.getScriptProperties().setProperty(PROP_SPREADSHEET_ID, ss.getId());
  Logger.log('建置完成。資料夾 ' + folder.getUrl() + '\n試算表 ' + ss.getUrl()
    + '\n接著：設 AUTH_PIN、部署 Web App，/exec 寫進 src/App.jsx 的 config.api.url');
}

// ============ B. 擴充現有旅程（沿用現有行程試算表）============
function initExisting(spreadsheetId) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  ensureTabsAndHeaders_(ss); // 補 Expenses 分頁與標題列；Itinerary 若缺標題也補
  PropertiesService.getScriptProperties().setProperty(PROP_SPREADSHEET_ID, spreadsheetId);
  Logger.log('已綁定現有試算表並補好 Expenses 分頁：' + ss.getUrl()
    + '\n接著：設 AUTH_PIN、（要搬舊資料再跑 migrateExpenses）、部署 Web App');
}

function ensureTabsAndHeaders_(ss) {
  Object.keys(TABS).forEach(function (k) {
    var t = TABS[k];
    var sh = ss.getSheetByName(t.name) || ss.insertSheet(t.name);
    var first = sh.getRange(1, 1, 1, t.headers.length).getValues()[0];
    if (first.join('') !== t.headers.join('')) sh.getRange(1, 1, 1, t.headers.length).setValues([t.headers]);
  });
}

// ============ 設 PIN（或直接用專案設定的「指令碼屬性」UI）============
function setPin(pin) {
  PropertiesService.getScriptProperties().setProperty(PROP_PIN, String(pin));
  Logger.log('AUTH_PIN 已設定（存在 Script Properties，不會外流）');
}

// ============ 搬舊記帳資料（B 用）============
// oldSpreadsheetId：舊「◯◯記帳」試算表 ID；oldSheetName：留空＝第一個分頁（表單回應）
// 依舊表的中文標題自動對應到新 Expenses 欄位。
function migrateExpenses(oldSpreadsheetId, oldSheetName) {
  var oldSheet = oldSheetName
    ? SpreadsheetApp.openById(oldSpreadsheetId).getSheetByName(oldSheetName)
    : SpreadsheetApp.openById(oldSpreadsheetId).getSheets()[0];
  var values = oldSheet.getDataRange().getValues();
  if (values.length < 2) { Logger.log('舊表沒有資料'); return; }

  var head = values[0].map(function (h) { return String(h).trim(); });
  var find = function (names) { for (var i = 0; i < head.length; i++) if (names.indexOf(head[i]) > -1) return i; return -1; };
  var col = {
    timestamp: find(['時間戳記', 'Timestamp', '時間']),
    item:      find(['項目', 'item', '品項']),
    amount:    find(['金額', 'amount']),
    category:  find(['類別', '分類', 'category']),
    payer:     find(['付款人', 'payer', '付費人']),
  };

  var dest = getSheet_(TABS.expense.name);
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (col.item > -1 && String(row[col.item]).trim() === '') continue;
    rows.push([
      'exp-' + (Date.now() + r), // 唯一 id
      col.timestamp > -1 ? row[col.timestamp] : new Date(),
      col.item > -1 ? row[col.item] : '',
      col.amount > -1 ? row[col.amount] : '',
      col.category > -1 ? row[col.category] : '',
      col.payer > -1 ? row[col.payer] : '',
    ]);
  }
  if (rows.length) dest.getRange(dest.getLastRow() + 1, 1, rows.length, TABS.expense.headers.length).setValues(rows);
  Logger.log('已搬入 ' + rows.length + ' 筆記帳');
}

// ============ Web App ============
// 前端合約：POST { pin, type, action, ...payload }
//   auth   / login                                  -> 驗 PIN，對回 {status:'success'}
//   itinerary/expense: read / create / update / delete
function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);

    // ── 伺服器端 PIN 驗證：錯就一律擋掉，不回任何資料 ──
    // ponytail: 6 碼 PIN 無防暴力破解，家庭 app 夠用；要更硬就加長 PIN / 真帳號
    var pin = PropertiesService.getScriptProperties().getProperty(PROP_PIN);
    if (pin && String(req.pin) !== pin) return json_({ status: 'error', message: 'unauthorized' });

    if (req.type === 'auth') return json_({ status: 'success' }); // 走到這代表 PIN 對

    var tab = TABS[req.type];
    if (!tab) return json_({ status: 'error', message: 'unknown type: ' + req.type });
    var sheet = getSheet_(tab.name);

    // read 不改資料 → 不搶鎖，才不會被寫入序列化拖慢（read 佔了大多數請求）
    if (req.action === 'read') return json_({ status: 'success', data: readRows_(sheet, tab.headers) });

    // 只有寫入需要全域鎖序列化
    // ponytail: 全域鎖，人少夠用
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var out;
      switch (req.action) {
        case 'create': createRow_(sheet, tab, req); out = { status: 'success' }; break;
        case 'update': updateRow_(sheet, tab, req); out = { status: 'success' }; break;
        case 'delete': deleteRow_(sheet, String(req.id)); out = { status: 'success' }; break;
        default:       out = { status: 'error', message: 'unknown action: ' + req.action };
      }
      SpreadsheetApp.flush();
      return json_(out);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ status: 'error', message: String(err) });
  }
}

function getSheet_(name) {
  var id = PropertiesService.getScriptProperties().getProperty(PROP_SPREADSHEET_ID);
  if (!id) throw new Error('尚未設定試算表 ID，先跑 setupTrip() 或 initExisting()');
  return SpreadsheetApp.openById(id).getSheetByName(name);
}

function readRows_(sheet, headers) {
  var values = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === '') continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j];
    rows.push(obj);
  }
  return rows;
}

function createRow_(sheet, tab, p) {
  var prefix = tab.name === TABS.expense.name ? 'exp-' : 'itm-';
  var row = tab.headers.map(function (h) {
    if (h === 'id') return prefix + Date.now();
    if (h === 'timestamp') return new Date();
    return p[h] !== undefined ? p[h] : '';
  });
  sheet.appendRow(row);
}

function updateRow_(sheet, tab, p) {
  var r = findRowById_(sheet, String(p.id));
  if (r < 0) throw new Error('找不到 id: ' + p.id);
  var range = sheet.getRange(r, 1, 1, tab.headers.length);
  var cur = range.getValues()[0];
  tab.headers.forEach(function (h, i) {
    if (h !== 'id' && h !== 'timestamp' && p[h] !== undefined) cur[i] = p[h];
  });
  range.setValues([cur]);
}

function deleteRow_(sheet, id) {
  var r = findRowById_(sheet, id);
  if (r < 0) throw new Error('找不到 id: ' + id);
  sheet.deleteRow(r);
}

function findRowById_(sheet, id) {
  var ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (var i = 1; i < ids.length; i++) if (String(ids[i][0]) === id) return i + 1;
  return -1;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function moveToFolder_(fileId, folder) {
  var file = DriveApp.getFileById(fileId);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}

// ============ 自我檢查（設好 PIN/ID 後可在編輯器跑）============
function runTest() {
  ['itinerary', 'expense'].forEach(function (type) {
    var tab = TABS[type], sheet = getSheet_(tab.name);
    var before = readRows_(sheet, tab.headers).length;
    createRow_(sheet, tab, { day: 1, time: '09:00', title: '__t__', desc: 'x', icon: 'default',
      item: '__t__ #split:信,屏', amount: 100, category: '食物', payer: '信' });
    var rows = readRows_(sheet, tab.headers);
    if (rows.length !== before + 1) throw new Error(type + ' create 失敗');
    var id = rows[rows.length - 1].id;
    if (type === 'itinerary') updateRow_(sheet, tab, { id: id, title: '__t2__' });
    deleteRow_(sheet, id);
    if (readRows_(sheet, tab.headers).length !== before) throw new Error(type + ' delete 失敗');
  });
  Logger.log('CRUD 自我檢查通過 ✅');
}
