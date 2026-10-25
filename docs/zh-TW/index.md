[English](../en/index.md) / [简体中文](../zh-CN/index.md) / 繁體中文

# doona 文件

doona 是 daeuniverse 引擎共用原生 API 的靜態 Web 介面：目前對接 honk，dae 實作同一份契約後也可對接。honk 是以 Rust 撰寫的 Linux 透明代理引擎，可自行在 `/ui/` 提供 doona，也可由任一 Web 伺服器提供。doona 顯示引擎目前的狀態，並管理節點、群組、路由規則與組態檔案。

<a name="choose-edition"></a>

## 選擇版本

| 標準版 | doona lite |
| --- | --- |
| 適合管理組態並觀測流量 | 適合只需編輯組態的初學者 |
| 流量頁面、組態表單、組態來源編輯器與 Trace | 節點、訂閱、群組、路由、DNS 與全域設定 |
| [安裝標準版](install.md#doona) | [安裝 doona lite](lite.md#lite-install) |
| [標準版示範](https://demo.daeuniverse.org/) | [lite 示範](https://demo.daeuniverse.org/lite/) |

功能與切換方式見[標準版與 doona lite](editions.md)。

[使用範例資料體驗示範版](https://demo.daeuniverse.org/)。

![活動頁](../screenshots/zh-TW/activity-light.webp)

## 原生 API 狀態

本文件介紹 doona v0.1.0-beta.19。doona 使用各發行版本附帶的 honk-core 建置中的原生 API，建置來自 Glassyiris/honk `feat/native-api` 的 debug 標籤。`HONK-SOURCE.txt` 註明附帶的建置，見 [honk 版本](requirements.md#honk-version)。上游 daeuniverse/honk `main` 不提供此 API。上游 honk 正式發布之前，組態鍵與預設值仍可能變更。

安裝範例使用 beta.19 檔名與對應的 honk 標籤 `debug.2026.10.9.native-api.2`。附件已在[發布頁](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-beta.19)發布。

## 頁面

部署新的閘道器時，先閱讀系統需求，安裝 honk 與所選版本，再依序閱讀最小組態與服務管理。之後繼續閱讀標準版的首次登入或連線 doona lite。

1. 入門：[標準版與 doona lite](editions.md)、[系統需求](requirements.md)。
2. 安裝與首次執行：[在 Debian 或 Ubuntu 上安裝](install-debian.md)、[在 Fedora 或 RHEL 上安裝](install-fedora.md)、[在 Arch Linux 上安裝](install-arch.md)、[在 Gentoo 上安裝](install-gentoo.md)、[在 OpenWrt 上安裝](install-openwrt.md)、[在其他系統上安裝](install-manual.md)、[安裝詳解](install.md)、[最小組態](minimal-configuration.md)、[服務管理](service-management.md)。
3. 標準版：[首次登入](first-sign-in.md)、[介面導覽](tour.md)、[觀測流量](observe.md)、[路由、節點與規則](routing.md)、[組態與設定](config-and-settings.md)、[常見操作](common-tasks.md)、[功能](features.md)。
4. doona lite：[doona lite](lite.md)、[連線 doona lite](lite-connect.md)、[doona lite 常見操作](lite-tasks.md)。
5. 參考：[組態](configuration.md)、[疑難排解](troubleshooting.md)、[開發](development.md)。

## 連結

- [doona 發布頁](https://github.com/Zakkaus/doona/releases)：下載 honk-core 建置
- [honk 快速入門](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues)；引擎問題請回報給 [honk](https://github.com/daeuniverse/honk) 或 [dae](https://github.com/daeuniverse/dae)
