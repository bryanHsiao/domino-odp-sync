# Domino ODP 測試二：前端框架打包後丟進 WebContent → 是否能同步上 Server

> 內部分享文件
> 測試日期：2026-06-09
> 測試人員：siao.bryan
> 延續測試一（[test-record.md](test-record.md)）的環境與兩個 NSF

---

## 1. 測試目的

驗證一個實務情境：

> 把**前端框架（Vite / CRA / Vue 等）打包後的產出**直接丟進 ODP 的 `WebContent/` 資料夾，
> 是否能比照測試一的方式（外部改檔 → Designer 重新整理 → 自動匯入 NSF）一路同步上 server，
> 並能從瀏覽器存取。

### 與測試一的關鍵差異

| | 測試一 | 測試二（本測試） |
|---|---|---|
| 動作 | **修改**現有設計元素（Form） | **新增**一整包檔案 + **巢狀資料夾** |
| 驗證重點 | 修改能否回寫 | 選項對「**新檔案 / 新資料夾 / 多檔型**」吃不吃 |

> 選項名稱是「**修改**時自動匯入」，所以「新增整包檔案」會不會被一起匯入，是本測試的核心問題。

---

## 2. 模擬的打包產出

放在兩邊的 `WebContent/app/`（模擬把 SPA 部署到子路徑），刻意涵蓋有代表性的情況：

```
WebContent/app/
├─ index.html                       ← 入口
└─ assets/
   ├─ index-e5f6a7b8.css            ← hash 檔名 CSS
   ├─ index-a1b2c3d4.js             ← hash 檔名 JS（type=module）
   └─ img/
      └─ logo-9f8e7d.svg            ← 更深一層巢狀 + 圖檔
```

涵蓋：hash 檔名、巢狀 `assets/`、再一層 `img/`、多種檔型（html / css / js / svg）。

local 與 server 兩包內容相同，只有環境標記不同（`[LOCAL]` / `[SERVER]`、`SYNC-TEST-WEBCONTENT-LOCAL/SERVER`）以利辨識。

---

## 3. 測試對象

| 項目 | 情境 A：local | 情境 B：server |
|------|--------------|----------------|
| NSF | `agentlog_odp-local.nsf` | `agentlog_odp-server.nsf` |
| 放置路徑 | `odp-local/WebContent/app/` | `odp-server/WebContent/app/` |
| 放置時間（磁碟） | 2026-06-09 01:34 | 2026-06-09 01:34 |

---

## 4. 測試步驟

1.（已完成）把打包產出放進兩邊 `WebContent/app/`，記錄檔案與時間戳。
2. 在 Designer 對 ODP 專案 **重新整理（F5）**。
3. 觀察 Designer 設計清單的 **WebContent / 檔案資源** 下，是否出現 `app/index.html`、`app/assets/...` 等元素。
4. 確認這些元素是否已匯入 NSF（出現在設計清單、有修改時間）。
5. **從瀏覽器存取**驗證 server 真的能服務：
   - 預期 URL（依實際設定調整）：`http://<server>/.../agentlog_odp-server.nsf/app/index.html`
   - 看頁面是否正確載入、CSS/JS/SVG 是否都跟著載到、`[SERVER]` 標記是否正確。

---

## 5. 測試結果（待 F5 + 瀏覽器驗證後填寫）

### 情境 A：local NSF

| 觀察項目 | 結果 |
|----------|------|
| F5 後 WebContent 下是否出現新元素 | ☑ **是** — 設計清單可見匯入的檔案 |
| 巢狀資料夾（assets / img）是否完整匯入 | ☑ 是（與 server 相同來源） |
| 全部檔案（html/css/js/svg）是否都進去 | ☑ 是 |
| 是否需手動觸發（F5） | ☑ 是 |
| 瀏覽器渲染驗證 | 打包產出以 `file://` 開啟可正常渲染（CSS/JS/SVG 皆正確）；local NSF 經 Domino HTTP 服務未進一步測 |
| 備註 | 匯入機制已確認成功；「經 Domino 服務」取決於該 NSF 是否在 HTTP-enabled 的資料目錄下，此處依測試目的（核心為同步機制）不再深入 |

### 情境 B：server NSF

| 觀察項目 | 結果 |
|----------|------|
| F5 後 WebContent 下是否出現新元素 | ☑ **是** |
| 巢狀資料夾（assets / img）是否完整匯入 | ☑ **是** — SVG 在 `app/assets/img/` 正常載出 |
| 全部檔案（html/css/js/svg）是否都進去 | ☑ **是** |
| 瀏覽器能否存取 `127.0.0.1/agentlog_odp-server.nsf/app/index.html` | ☑ **是** |
| CSS / JS / SVG 相對路徑是否正確載入 | ☑ **是** — CSS 樣式套用、SVG 顯示、JS 執行 |
| 備註 | 頁面下方 `rendered @ runtime` 字樣由 JS 動態補上 → 證明 JS 確實執行，非僅靜態檔 |

---

## 6. 結論

**核心結論：把前端框架打包後的產出丟進 ODP 的 `WebContent/`，比照測試一（外部改檔 → Designer 重新整理 → 自動匯入）即可同步上 server，且能從瀏覽器正常服務。**

1. **「新增整包檔案 + 巢狀資料夾」一樣有效**：選項雖名為「修改時自動匯入」，但 F5 重新整理後，**新增的檔案與多層巢狀資料夾（`app/assets/img/`）都被完整匯入** NSF，不限於修改既有元素。
2. **巢狀結構與相對路徑在 NSF 內完整保留**：server 端以 `127.0.0.1/agentlog_odp-server.nsf/app/index.html` 存取，HTML/CSS/JS/SVG 全數正確載入，相對路徑解析正常。
3. **JS 確實執行**：頁面 `rendered @ runtime` 字樣由 JS 動態產生，證明不只是靜態檔案被服務，前端程式有實際執行。
4. **server NSF：完整通過**（瀏覽器實機驗證）。
5. **local NSF：同步機制通過**——設計清單可見匯入的檔案，打包產出本身以 `file://` 驗證可正常渲染。至於「local NSF 經 Domino HTTP 服務」未進一步測（local 非部署對象，視需求而定）。

**實務結論**：此流程可作為「前端框架 build → 丟進 ODP/WebContent → 重新整理 → 部署到 Domino」的可行管線；唯一的人工步驟是 **Designer 重新整理（F5）** 來觸發匯入（可用測試一提到的 native hooks / polling 設定減少手動）。

---

## 7. 待觀察的已知風險點

- **相對路徑**：`index.html` 用相對路徑引用 `assets/...`，要確認在 NSF 內 `db.nsf/app/index.html` 的 base path 下能正確解析。
- **檔案被視為設計元素**：WebContent 下的檔案會變成「檔案資源」設計元素；數量多時匯入/簽署時間會拉長。
- **簽署（Sign）**：匯入後可能需要以伺服器可信任的 ID 簽署，否則 server 端執行/存取可能被擋。
- **新增 vs 修改**：若 F5 後新檔案「沒被自動加入」，可能要在專案上手動 include 或確認 .project 是否涵蓋該路徑。
- **大型打包**：真實 build 常有數十～數百檔（含 source map），本測試為精簡代表性樣本，數量級差異需留意。

---

## 8. 變更記錄（由 Claude Code 自動記錄）

| 時間 | 情境 | 路徑 | 動作 | 檔案數 |
|------|------|------|------|--------|
| 2026-06-09 01:34 | A: local | `odp-local/WebContent/app/` | 新增模擬打包產出（含巢狀 assets/img） | 4 |
| 2026-06-09 01:34 | B: server | `odp-server/WebContent/app/` | 新增模擬打包產出（含巢狀 assets/img） | 4 |
