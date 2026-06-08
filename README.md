# Domino ODP 自動同步測試

測試 HCL Domino Designer 來源控制選項 **「啟用修改時自動匯入設計元素（從磁碟至 NSF）」** 的實際行為：
在外部編輯器修改 ODP（On-Disk Project）磁碟檔案時，變更是否會自動回寫到 NSF。

分別針對 **local NSF** 與 **server NSF** 兩種情境各測一次。

## 文件

| 文件 | 內容 |
|------|------|
| [docs/test-record.md](docs/test-record.md) | 測試一：來源控制「自動匯入（磁碟 → NSF）」機制驗證 |
| [docs/test-record-2-webcontent.md](docs/test-record-2-webcontent.md) | 測試二：前端框架打包產出丟進 WebContent → 部署上 server |

> 註：實際測試用的 ODP 工作目錄（`odp-local/`、`odp-server/`）為本機實驗檔，已透過 `.gitignore` 排除，不納入版控。

## 重點結論

- **選項確實有效，但不是即時監看**：用外部工具（VS Code、git 等）改 ODP 磁碟檔，Designer 不會即時察覺，需在專案上 **重新整理（F5）** 才會觸發自動匯入回寫 NSF。
- **新增整包檔案 + 巢狀資料夾一樣吃**：把前端框架打包產出丟進 `WebContent/`，F5 後完整匯入 NSF，server 端瀏覽器可正常服務（HTML/CSS/JS/SVG 全通，JS 確實執行）。
- **local 與 server 行為一致**。
- **想免去手動 F5**：到 Designer「喜好設定 → 一般 → Workspace」勾選 **Refresh using native hooks or polling**，讓 Eclipse 主動偵測外部檔案變更。

實務上可作為「前端 build → 丟 ODP/WebContent → 重新整理 → 部署到 Domino」的可行管線。詳細步驟與佐證見上方兩份文件。
