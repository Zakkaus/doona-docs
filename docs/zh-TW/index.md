[English](../en/index.md) / [简体中文](../zh-CN/index.md) / 繁體中文

# doona 文件

doona 是 daeuniverse 引擎共用原生 API 的靜態 Web 介面：目前對接 honk，dae 實作同一份契約後也可對接。honk 是以 Rust 撰寫的 Linux 透明代理引擎，可自行在 `/ui/` 提供 doona，也可由任一 Web 伺服器提供。doona 顯示引擎目前的狀態，並管理節點、群組、路由規則與組態檔案。

[使用範例資料體驗示範版](https://demo.daeuniverse.org/)。

![活動頁](../screenshots/zh-TW/activity-light.webp)

## 原生 API 狀態

doona 需要 honk 的原生 API。此 API 目前只存在於 Glassyiris/honk 的 `feat/native-api` 分支及其持續更新的 `debug` 版本。本文件已對照 `debug.2026.9.28.native-api.4`（提交 `3ff52762`）核對。上游 honk 正式發布此 API 之前，組態鍵與預設值仍可能變更。

## 頁面

部署新的閘道器時，請先閱讀系統需求與對應系統的安裝頁，再依序閱讀「首次執行」下的最小組態、服務管理與首次登入。首次登入後，請繼續閱讀「指南」中的介面導覽。

1. [系統需求](requirements.md)：核心、honk 建置、瀏覽器與建置工具。
2. 在 [Debian 或 Ubuntu](install-debian.md)、[Fedora 或 RHEL](install-fedora.md)、[Arch Linux](install-arch.md)、[Gentoo](install-gentoo.md)、[OpenWrt](install-openwrt.md) 或[其他系統](install-manual.md)上安裝 doona 與 honk-core。
3. [安裝詳解](install.md)：在一頁內完成手動安裝，以及從其他來源開啟 doona、發行版套件與更新。
4. [最小組態](minimal-configuration.md)：能提供 doona 的最小組態，以及檢查方法。
5. [服務管理](service-management.md)：以 systemd 或 procd 服務執行 honk，啟動、停止、重載並查看日誌。
6. [首次登入](first-sign-in.md)：建立管理員並檢查概覽。
7. [介面導覽](tour.md)：頁面、頂端列、詳細資料面板與變更的提交方式。
8. [觀測流量](observe.md)：活動、系統狀態、連線、分流、DNS、日誌與事件頁面。
9. [路由、節點與規則](routing.md)：策略群組、節點與訂閱、規則與追蹤模擬。
10. [組態與設定](config-and-settings.md)：組態頁與設定頁。
11. [常見操作](common-tasks.md)：常見變更的操作步驟。
12. [組態](configuration.md)：啟用原生 API 的 honk 範例組態，以及每個 `native_api` 欄位啟用的功能。
13. [功能](features.md)：逐項檢查 doona 功能所需的設定、各頁面讀取的資源，以及 doona 在瀏覽器中儲存的設定。
14. [疑難排解](troubleshooting.md)：啟動錯誤、狀態資料庫、缺少原生 API、登入與唯讀的組態檔案。
15. [開發](development.md)：建置與測試 doona、原始碼配置與 API 契約。

## 連結

- [doona 發布頁](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` 版本](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk 快速入門](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues)；引擎問題請回報給 [honk](https://github.com/daeuniverse/honk) 或 [dae](https://github.com/daeuniverse/dae)
