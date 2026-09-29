[English](../en/features.md) / [简体中文](../zh-CN/features.md) / 繁體中文

<a name="features"></a>

# 功能

請先確認閘道器能轉送流量。將範例訂閱與節點換成可用的訂閱與節點，再從實際的區域網路用戶端分別測試直連與代理的 TCP、UDP 及 DNS。`honk-core is running`、`dae0` 連結或可存取的 API 都無法證明流量正常。

## 逐項檢查功能

[範例組態](configuration.md#config)提供下表功能所需的設定；替換佔位的訂閱與節點後，再逐項檢查實際執行情況。

| 功能                               | 正常時的表現                                                                             | 依賴的組態                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 登入與所有頁面                     | 登入後，活動頁顯示流量與連線。                                                           | `enabled: true`，以及 `password_auth: true` 或 `secret`                                                                        |
| 組態：編輯檔案                     | 來源清單中的每個檔案開啟後都沒有唯讀標記，套用後會驗證並重載。                           | `config_write: true`；檔案不含密鑰                                                                                             |
| 組態：新增檔案                     | 「新增檔案」會建立由主檔案 `include` 模式引入的 `.dae` 檔案，例如 `config.d/rules.dae`。 | `config_write: true`                                                                                                           |
| 策略：編輯群組                     | 群組卡片提供「編輯」，儲存後生效。                                                       | `config_write: true`；群組位於主檔案，且主檔案不含密鑰                                                                         |
| 節點：新增節點與訂閱               | 節點頁提供「貼上節點連結」與「新增訂閱」。                                               | `config_write: true`；主檔案不含密鑰                                                                                           |
| 節點：重新整理訂閱                 | 每個訂閱列都有「重新整理」。                                                             | 存在 `subscription` 項目，且 honk 的訂閱服務正在執行                                                                           |
| 設定：地理資料來源                 | 地理資料卡片列出可編輯的來源。                                                           | 狀態資料庫                                                                                                                     |
| 設定：地理資料更新                 | 地理資料卡片的「更新」按鈕可用。                                                         | `config_write: true`；`data_dir` 中有 `geosite.dat` 與 `geoip.dat`；狀態資料庫，或同時設定 `geosite_download_url` 與 `geoip_download_url` |
| 設定：後端選項                     | 「流程記錄」可設為「依流程需求」「常開」或「關閉」，「日誌記錄」與「DNS 記錄」可設為「隨面板」「常開」或「關閉」。         | `record_flows`、`record_logs`、`record_dns_log`                                                                                |
| 設定：地理資料驗證                 | 可信鏡像站的 `.sha256sum` 網址回傳錯誤時可關閉「SHA-256 驗證」。                          | 後端提供 `verify_checksum` 且狀態資料庫可用                                                                                   |
| 活動：流量與記憶體歷史             | 歷史圖表在最多 10 分鐘內逐步填滿。                                                       | `record_traffic`、`record_memory`                                                                                              |
| 日誌                               | 開啟日誌頁時持續出現日誌。                                                               | `record_logs`                                                                                                                  |
| DNS：查詢、快取與記錄              | 列出查詢與快取；開啟頁面時記錄持續增加。                                                 | 記錄需要 `record_dns_log`；`dns` 組態區段                                                                                      |
| 連線：關閉與編輯命中規則           | 關閉連線，或在規則頁開啟可編輯的命中規則，只修改其出站。                                 | `enabled: true`；編輯需要規則與可寫入的來源                                                                                   |
| 規則：路由規則、DNS 規則與流程     | 編輯路由規則、DNS 請求規則與回答規則；查看命中、流程記錄和追蹤模擬。                      | 路由規則需要 `routing`；流程需要 `record_flows`；DNS 規則須由後端列出；編輯需要 `config_write: true` 與可寫入的來源                                         |
| DNS：依解析記錄新增規則            | 從解析記錄為目前網域及其子網域新增 DNS 請求規則。                                        | 後端列出 DNS 規則且組態可寫入                                                                                                  |
| 策略：檢測設定                     | 後端允許修改時，可調整群組的「容忍差值」與「閒置逾時」。                                 | `groups` 及 `mutable_config` 中對應的欄位                                                                                     |
| 概覽：執行期降級                   | honk 在故障恢復後以降級方式運作時，「資料路徑」卡片顯示警告。                            | `runtime.degradations`                                                                                                          |
| 延遲測試                           | 節點的「測試」與群組的「測試全部」顯示延遲。                                             | `enabled: true`；私有位址目標另需 `probe_allowed_cidrs`                                                                        |
| 事件                               | 事件頁顯示事件串流。                                                                     | `enabled: true`                                                                                                                |

預設的「依流程需求」模式下，連線頁與規則頁開啟時會請求流程；最後一次請求結束後繼續記錄 60 秒。日誌與 DNS 記錄在有面板連線時進行。已允許但處於閒置狀態的記錄器屬於正常情況。

<a name="still-missing"></a>

## 仍有功能缺少時

- 變更 `native_api` 後沒有重新啟動 honk。重載不會套用這些欄位。
- 缺少 `config_write: true`。`native_api` 的欄位直接寫在 `experimental` 下時，honk 會以 [`unknown experimental setting`](troubleshooting.md#unknown-setting) 拒絕啟動。
- 既沒有 `password_auth: true`，也沒有 `secret`。此時若設定了 `enabled: true`，honk 會拒絕啟動。
- 檔案包含密鑰或與密鑰相同的文字，因此 doona 將其顯示為[唯讀](troubleshooting.md#read-only)。
- honk 是早期的 `feat/native-api` 建置，因此地理資料卡片沒有來源設定。請安裝 doona 發行版本附帶的建置，見 [honk 版本](requirements.md#honk-version)。
- Token 模式下狀態資料庫未能開啟，因此地理資料來源卡片被隱藏，詳見[狀態資料庫問題](troubleshooting.md#state-db)。
- 僅在以 `--store db` 執行時出現，本文件不使用此模式：honk 未能記錄的修訂會阻止後續寫入，直到下一次成功啟用組態。

## 登入之後

登入後的介面由以下指南說明：

- [介面導覽](tour.md)：導覽列、頂端列與變更的提交方式。
- [觀測流量](observe.md)：活動、系統狀態、連線、分流、DNS、日誌與事件頁面。
- [分流、節點與規則](routing.md)：策略群組、節點與訂閱、規則與追蹤模擬。
- [組態與設定](config-and-settings.md)：組態頁與設定頁。
- [常見操作](common-tasks.md)：常見變更的操作步驟。

每一次組態來源的寫入都經過引擎。doona 帶著讀取時的雜湊送出（`If-Match`）；磁碟上已變動的檔案會回傳 412，不會寫入。引擎先驗證整組來源，再儲存並重載；重載失敗時仍沿用先前的世代。預先驗證不會寫入，遮蔽後的文字也不會寫回。執行期設定與群組選擇走各自的端點，各有檢查。

<a name="pages"></a>

## 頁面與所需資源

![策略頁](../screenshots/zh-TW/policies-light.webp)

| 頁面 | 內容                                                                                                       | 需要的資源                          |
| ---- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 活動 | 出站模式、流量與記憶體、活動連線、節點延遲、出站用量、流量最高的用戶端、通知                               | —                                   |
| 系統狀態 | 引擎與 eBPF 狀態、流量計數、後端能力、執行期降級、狀態 JSON 匯出                                   | `runtime`                           |
| 連線 | 即時連線的來源、目的、規則、鏈路與流量；關閉連線、編輯命中規則、可在網址中帶入篩選條件                         | `connections`                       |
| 分流 | 分流總覽與流程記錄，含每筆記錄的追蹤步驟 | `flows` |
| DNS  | 查詢與解析結果、快取、解析記錄；從解析記錄新增 DNS 請求規則；清空快取                                   | `dns_query`、`dns_log`、`dns_cache` |
| 策略 | 群組、成員與健康；選擇、手動固定、恢復自動選擇、測試、編輯與檢測設定                               | `groups`                            |
| 規則 | 路由規則、DNS 規則與追蹤模擬；後端列出 DNS 規則時才顯示對應分頁                  | `rules`、`flows`、`routing_trace`   |
| 節點 | 訂閱與更新間隔、組態內節點、新增與移除、測試、加入群組                                                     | `nodes`、`providers`                |
| 組態 | 來源與診斷、附驗證的編輯器、快速設定、匯出                                                                 | `config`                            |
| 事件 | 後端事件串流                                                                                               | `events`                            |
| 日誌 | 日誌串流，可依等級與模組篩選、暫停、匯出                                                                   | `logs`                              |
| 設定 | 後端、執行期設定與後端操作、語言、外觀與配色                                                               | —                                   |

所有頁面都保留在導覽列中。只有 [registry.ts](https://github.com/Zakkaus/doona/blob/main/src/shell/registry.ts) 為頁面列出的資源全部不可用時，頁面才會標為不可用；開啟後會顯示不可用提示。任何頁面按 `Ctrl K`（macOS 為 `⌘ K`）可搜尋頁面、連線、節點、群組、訂閱、規則與來源。

![規則頁](../screenshots/zh-TW/rules-light.webp)

## 主題與配色

![所有配色的亮色與暗色模式](../screenshots/palettes.webp)

| 配色 | 亮色 | 暗色 |
| ---- | ---- | ---- |
| Rosé Pine Dawn / Main | [Dawn](../screenshots/en/theme-rose-pine-light.webp) | [Main](../screenshots/en/theme-rose-pine-main-dark.webp) |
| Rosé Pine Dawn / Moon | [Dawn](../screenshots/en/theme-rose-pine-light.webp) | [Moon](../screenshots/en/theme-rose-pine-dark.webp) |
| Catppuccin Latte / Frappé | [Latte](../screenshots/en/theme-catppuccin-light.webp) | [Frappé](../screenshots/en/theme-catppuccin-frappe-dark.webp) |
| Catppuccin Latte / Macchiato | [Latte](../screenshots/en/theme-catppuccin-light.webp) | [Macchiato](../screenshots/en/theme-catppuccin-macchiato-dark.webp) |
| Catppuccin Latte / Mocha | [Latte](../screenshots/en/theme-catppuccin-light.webp) | [Mocha](../screenshots/en/theme-catppuccin-dark.webp) |
| Nord | [Snow Storm](../screenshots/en/theme-nord-light.webp) | [Polar Night](../screenshots/en/theme-nord-dark.webp) |
| Kary Pro Colors | [亮色](../screenshots/en/theme-kary-light.webp) | [暗色](../screenshots/en/theme-kary-dark.webp) |
| Ant Design | [預設](../screenshots/en/theme-antd-light.webp) | [暗色](../screenshots/en/theme-antd-dark.webp) |
| Arco Design | [亮色](../screenshots/en/theme-arco-light.webp) | [暗色](../screenshots/en/theme-arco-dark.webp) |
| Semi Design | [亮色](../screenshots/en/theme-semi-light.webp) | [暗色](../screenshots/en/theme-semi-dark.webp) |
| 玻璃 | [亮色](../screenshots/en/theme-glass-light.webp) | [暗色](../screenshots/en/theme-glass-dark.webp) |
| 中國 | [打卡版](../screenshots/en/theme-qiangguo-light.webp) | [通宵版](../screenshots/en/theme-qiangguo-dark.webp) |

## 瀏覽器中儲存的設定

doona 沒有供自身介面設定使用的伺服器端儲存空間。組態與執行期變更透過引擎寫入；doona 的介面設定儲存在瀏覽器中，範圍限於該網站來源的 `localStorage`。下表列出主要的鍵，完整清單見 [storage.ts](https://github.com/Zakkaus/doona/blob/main/src/api/storage.ts)。

| 設定         | 鍵               | 值                                                                                                                                                                                                                                                                                                                         |
| ------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 後端         | `doona-profiles` | `{id, name, api, token}` 的 JSON 陣列；`api` 是伺服器根網址或代理前綴，留空或 `mock` 使用示範資料。密碼模式下，`token` 為空，honk 管理工作階段，doona 將工作階段 token 儲存在目前分頁的 `sessionStorage`。token 模式下，API 請求透過 `Authorization` 標頭傳送 token。配對連結可能把 token 放在網址片段中，並在載入後移除。 |
| 使用中的後端 | `doona-profile`  | 所選後端的 `id`                                                                                                                                                                                                                                                                                                            |
| 語言         | `doona-lang`     | `zh-TW`、`zh-CN`、`en`；未設定時依瀏覽器語言                                                                                                                                                                                                                                                                               |
| 配色方案     | `doona-scheme`   | `system`（預設）、`light`、`dark`                                                                                                                                                                                                                                                                                          |
| 配色         | `doona-palette`  | `rose-pine/moon`（預設）；其他值見 [palettes.ts](https://github.com/Zakkaus/doona/blob/main/src/shell/palettes.ts) 的 `PaletteId`                                                                                                                                                                                                                               |
| 字標         | `doona-wordmark` | `gradient`（預設）、`plain`                                                                                                                                                                                                                                                                                                |

儲存的主題與語言在第一幀之前就套用，重新載入不會閃出預設外觀。

在 HTTPS 或 localhost 下，service worker 預先快取應用程式外殼，並快取字型與圖示，離線也能開啟頁面，網站可安裝成應用程式。API 回應一律不快取。安全問題的回報方式見 [SECURITY.md](https://github.com/Zakkaus/doona/blob/main/.github/SECURITY.md)。

![深色模式的活動頁](../screenshots/zh-TW/activity-dark.webp)
