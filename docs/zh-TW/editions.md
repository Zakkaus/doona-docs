[English](../en/editions.md) / [简体中文](../zh-CN/editions.md) / 繁體中文

<a name="editions"></a>

# 標準版與 doona lite

標準版是現有的 doona 介面，用於管理組態與觀測流量。需要連線詳細資料、日誌、Trace 或組態來源編輯器時，選擇標準版。

doona lite 面向只需編輯組態的初學者，介面較小。它管理節點、訂閱、群組、路由規則、DNS 與全域設定，不提供流量頁面。

<a name="editions-compare"></a>

## 功能比較

| 功能 | 標準版 | doona lite |
| --- | --- | --- |
| 流量頁面 | 活動、系統狀態、連線、分流、日誌與事件 | 不提供 |
| 節點與訂閱 | 支援 | 支援 |
| 群組 | 支援 | 支援 |
| 路由規則 | 支援 | 支援 |
| DNS | 組態與觀測 | 組態 |
| 全域設定 | 設定頁面 | 設定對話框 |
| 組態來源編輯器 | 支援 | 不提供 |
| Trace | 支援 | 不提供 |
| 佈景主題與配色 | 淺色、深色佈景主題與配色 | 淺色、深色或跟隨系統；無配色選擇器 |
| 登入 | 管理員密碼或權杖 | 管理員密碼或權杖 |

<a name="editions-switch"></a>

## 安裝與切換

兩個版本在[同一發布版本](https://github.com/Zakkaus/doona/releases)中提供。[標準版](install.md#doona)使用 `doona-<version>.tar.gz`，安裝到 `/usr/share/doona`；[doona lite](lite.md#lite-install) 使用 `doona-lite-<version>.tar.gz`，安裝到 `/usr/share/doona-lite`。壓縮檔名稱與安裝目錄不重疊，安裝其中一個不會覆蓋另一個。lite 暫無發行版套件。

honk 的 `/ui/` 一次只提供一個版本。將 `experimental` → `native_api` → `ui` 指向所需版本的目錄，然後[重新啟動 honk](service-management.md)。每個 `native_api` 欄位都需要重新啟動，重載不足以生效。`ui: embedded` 僅提供 honk-core 發布建置內嵌的標準版，見[最小組態](minimal-configuration.md)。

要同時使用兩個版本，讓 honk 在 `/ui/` 提供其中一個，再用任意靜態伺服器提供另一個目錄。按[透過主機名稱或其他來源存取](install.md#other-origin)允許第二個來源。

## 獨立的瀏覽器設定

兩個版本使用相同的 honk 原生 API 與組態。組態修改由兩者共享，但各自儲存瀏覽器設定。

## 線上示範

體驗[標準版示範](https://demo.daeuniverse.org/)或 [doona lite 示範](https://demo.daeuniverse.org/lite/)。
