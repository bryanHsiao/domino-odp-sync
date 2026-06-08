# Domino ODP「自動匯入（磁碟 → NSF）」測試記錄

> 內部分享文件
> 測試日期：2026-06-09
> 測試人員：siao.bryan
> 環境：Windows 11 / HCL Domino Designer

---

## 1. 測試目的

驗證 Designer「喜好設定 → 來源控制」中的選項：

> **啟用修改時自動匯入設計元素（從磁碟至 NSF）**

當此選項勾選後，使用**外部工具**修改 ODP 磁碟檔案，變更是否會**自動且即時**回寫到所綁定的 NSF。

分別測試：
- **情境 A：local NSF**（本機）
- **情境 B：server NSF**（伺服器）

---

## 2. 測試環境

| 項目 | 內容 |
|------|------|
| 作業系統 | Windows 11 Home (10.0.26200) |
| Designer 版本 | 待填 |
| Domino Server | 待填 |
| 使用者 ID / ACL 權限 | 待填（server NSF 需 Designer/Manager） |
| 選項狀態 | ☑ 啟用修改時自動匯入設計元素（從磁碟至 NSF） |

---

## 3. 測試對象

| 項目 | 情境 A：local | 情境 B：server |
|------|--------------|----------------|
| NSF | `agentlog_odp-local.nsf` | `agentlog_odp-server.nsf` |
| ODP 資料夾 | `odp-local/` | `odp-server/` |
| 來源控制已綁定 | ☑ | ☑ |
| 受測設計元素 | Form：Log Entry | Form：Log Entry |

---

## 4. 測試步驟（每個情境共用）

1. 建立 NSF，並對其「設定來源控制」綁定對應 ODP 資料夾。
2. 確認「自動匯入」選項已勾選並套用。
3. 選定一個好辨識的設計元素，記錄其磁碟檔案路徑與**修改前內容/時間戳**。
4. 用外部編輯器（非 Designer）修改該檔案並存檔。
5. 記錄**修改後時間戳**。
6. 回 Designer 觀察該設計元素是否更新（內容 / 上次修改時間）。
7. 記錄是否同步、延遲秒數、是否需手動觸發。

---

## 5. 測試結果

本測試分兩個回合：
- **Round 1**：外部工具改磁碟檔後，**不做任何動作**，直接觀察 Designer。
- **Round 2**：在 Designer 對 ODP 專案手動**重新整理（F5）**後再觀察。

對應的 NSF：local = `agentlog_odp-local.nsf`、server = `agentlog_odp-server.nsf`。

### 情境 A：local NSF

| 觀察項目 | 結果 |
|----------|------|
| 受測檔案路徑 | `odp-local/Forms/Log Entry.form` |
| 改檔前時間戳 | 2026-06-09 01:19:11 |
| 改檔後時間戳 | 2026-06-09 01:24:55 |
| **Round 1**：外部改檔後是否自動回寫 | ☑ **否** — 未刷新前完全沒動 |
| **Round 2**：F5 重新整理後是否回寫 | ☑ **是** — Log Entry 表單前次修改時間跳為 **01:29:53**、修改者 Bryan Hsiao/TheNet |
| 是否需手動觸發 | ☑ **是**（需 F5 重新整理 workspace） |
| 備註 | 外部工具改檔不被 Eclipse 即時偵測，刷新後才觸發自動匯入 |

### 情境 B：server NSF

| 觀察項目 | 結果 |
|----------|------|
| 受測檔案路徑 | `odp-server/Forms/Log Entry.form` |
| 改檔前時間戳 | 2026-06-09 01:23:23 |
| 改檔後時間戳 | 2026-06-09 01:25:08 |
| **Round 1**：外部改檔後是否自動回寫 | ☑ **否** — 未刷新前完全沒動 |
| **Round 2**：F5 重新整理後是否回寫 | ☑ **是** — 行為與 local 相同，刷新後回寫成功 |
| 是否需手動觸發 | ☑ **是**（需 F5 重新整理 workspace） |
| 備註 | 行為與 local 一致；未觀察到額外的權限/鎖定阻擋 |

---

## 6. 結論

**核心結論：選項「啟用修改時自動匯入設計元素（從磁碟至 NSF）」確實有效，會把磁碟變更回寫到 NSF；但它不是「即時」監看磁碟，必須 Designer 的 Eclipse workspace 偵測到檔案變更才會觸發。**

1. **用外部工具（VS Code、git、Claude Code 等）改 ODP 檔案，Designer 不會即時察覺** → Round 1 兩邊都沒動。
2. **在 Designer 對專案手動重新整理（F5）後，立刻觸發自動匯入回寫 NSF** → Round 2 兩邊的 Log Entry 表單前次修改時間都更新、修改者變成簽署者本人。
3. **local 與 server 行為一致**：兩者都是「需刷新才回寫」，本次 server 未遇到權限或鎖定阻擋。

**實務建議**：
- 若要讓外部改檔能被自動偵測、減少手動 F5，到 **喜好設定 → 一般 → Workspace** 勾選 **「Refresh using native hooks or polling（使用原生掛勾或輪詢重新整理）」**。
- 在 Designer 自家編輯器內的修改不受此限（本來就會被偵測）；此限制只影響「外部工具改檔」的情境。
- 結論一句話：**這個選項是「磁碟→NSF」的回寫開關，不是即時檔案監看器；外部改檔記得刷新。**

---

## 7. 注意事項與已知陷阱

- 自動匯入由 Designer 偵測檔案系統變更觸發，可能有數秒延遲，**改完不要馬上下結論**。
- server NSF 受**網路延遲**與 **ACL 權限**影響；無反應時先排除權限不足 / 設計元素被鎖定，不一定是選項失效。
- 自動匯入只對**已綁定來源控制**的 NSF 生效。
- 寫回的是 Designer 工作區當下開著的那份 replica（local 綁 local、server 綁 server）。

---

## 8. 變更記錄（由 Claude Code 自動記錄）

> 每次磁碟端改檔會記錄於此表，作為佐證。

| 時間 | 情境 | 檔案 | 動作 | 改前時間戳 | 改後時間戳 |
|------|------|------|------|-----------|-----------|
| 2026-06-09 01:24:55 | A: local | `odp-local/Forms/Log Entry.form` | 標題改為 `Agent Activity Log [SYNC-TEST-LOCAL] - ` | 01:19:11 | 01:24:55 |
| 2026-06-09 01:25:08 | B: server | `odp-server/Forms/Log Entry.form` | 標題改為 `Agent Activity Log [SYNC-TEST-SERVER] - ` | 01:23:23 | 01:25:08 |

> **回寫驗證（Round 2，F5 後）**：兩邊 NSF 的 Log Entry 表單前次修改時間於 **01:29:53** 更新、修改者為簽署者本人，確認磁碟變更已自動匯入 NSF。
