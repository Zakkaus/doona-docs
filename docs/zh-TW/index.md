[English](../en/index.md) · [简体中文](../zh-CN/index.md) · 繁體中文

# doona 文件

doona 是 daeuniverse 引擎共用原生 API 的靜態 Web 介面：目前對接 honk，dae 實作同一份契約後也可對接。honk 是以 Rust 撰寫的 Linux 透明代理引擎，可自行在 `/ui/` 提供 doona，也可由任一 Web 伺服器提供。doona 顯示引擎目前的狀態，並管理節點、群組、路由規則與組態檔案。

[使用範例資料體驗示範版](https://demo.daeuniverse.org/)。

![活動頁](../screenshots/zh-TW/activity-light.webp)

## 原生 API 狀態

doona 需要 honk 的原生 API。此 API 目前只存在於 Glassyiris/honk 的 `feat/native-api` 分支及其持續更新的 `debug` 版本。本文件已對照 `debug.2026.9.26.native-api.4`（提交 `5d8f32c1`）核對。上游 honk 正式發布此 API 之前，組態鍵與預設值仍可能變更。

## 頁面

部署新的閘道器時，請依序閱讀前四頁。

1. [系統需求](requirements.md)：核心、honk 建置、瀏覽器與建置工具。
2. [安裝](install.md)：安裝 honk、doona 與 systemd 服務，啟動 honk 並登入，以及日常更新。
3. [組態](configuration.md)：啟用原生 API 的 honk 範例組態，以及每個 `native_api` 欄位啟用的功能。
4. [功能](features.md)：逐項檢查 doona 功能所需的設定、各頁面讀取的資源，以及 doona 在瀏覽器中儲存的設定。
5. [疑難排解](troubleshooting.md)：啟動錯誤、狀態資料庫、缺少原生 API、登入與唯讀的組態檔案。
6. [開發](development.md)：建置與測試 doona、原始碼配置與 API 契約。

## 連結

- [doona 發布頁](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` 版本](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk 快速入門](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues)；引擎問題請回報給 [honk](https://github.com/daeuniverse/honk) 或 [dae](https://github.com/daeuniverse/dae)
