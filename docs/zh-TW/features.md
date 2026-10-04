[English](../en/features.md) / [简体中文](../zh-CN/features.md) / 繁體中文

<a name="features"></a>

# 功能

請先確認閘道器能轉送流量。將範例訂閱與節點換成可用的訂閱與節點，再從實際的區域網路用戶端分別測試直連與代理的 TCP、UDP 及 DNS。`honk-core is running`、`dae0` 連結或可存取的 API 都無法證明流量正常。

## 逐項檢查功能

[範例組態](configuration.md#config)提供下表功能所需的設定；替換佔位的訂閱與節點後，再逐項檢查實際執行情況。

| 功能                               | 正常時的表現                                                                             | 依賴的組態                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 登入與所有頁面                     | 登入後，活動頁顯示流量與連線。                                                           | `enabled: true`，以及 `password_auth: true` 或 `secret`                                                                        |
| 組態：編輯檔案 | 在「設定檔」中開啟完整、可寫入的檔案；「套用」驗證、寫入並重載。 | `config_write: true`；可寫入且不含密鑰的來源 |
| 組態：新增檔案                     | 「新增檔案」會建立由主檔案 `include` 模式引入的 `.dae` 檔案，例如 `config.d/rules.dae`。 | `config_write: true`                                                                                                           |
| 策略：編輯群組 | 「編輯群組」在共用對話框中修改成員與策略；「套用」驗證、寫入並重載。 | `config_write: true`；定義群組的主檔案或 include 檔案可寫入 |
| 節點：新增節點與訂閱               | 節點頁提供「貼上節點連結」與「新增訂閱」。                                               | `config_write: true`；主檔案不含密鑰                                                                                           |
| 節點：更新訂閱 | 每張訂閱卡片提供「更新 {name}」。 | `subscription` 項目與後端訂閱更新能力 |
| 設定：地理資料來源                 | 地理資料卡片列出可編輯的來源。                                                           | 狀態資料庫                                                                                                                     |
| 設定：地理資料更新與重設 | 無法設定來源時，地理資料卡片仍列出檔案。「立即更新」更新檔案；「重設為預設值」經確認後移除覆寫值。 | 檔案清單需要地理資料讀取能力；手動更新需要已設定的網址與更新能力，不要求可設定的來源；重設需要可寫入的地理資料設定 |
| 設定：暫時執行期覆寫 | 「流程記錄」提供「依流程需求」「常開」與「關閉」；「日誌記錄」與「DNS 記錄」分別提供「依日誌需求」與「依 DNS 日誌需求」，以及「常開」與「關閉」。 | `record_flows`、`record_logs`、`record_dns_log` |
| 設定：地理資料驗證                 | 可信鏡像站的 `.sha256sum` 網址回傳錯誤時可關閉「SHA-256 驗證」。                          | 後端提供 `verify_checksum` 且狀態資料庫可用                                                                                   |
| 活動：流量與記憶體歷史             | 歷史圖表在最多 10 分鐘內逐步填滿。                                                       | `record_traffic`、`record_memory`                                                                                              |
| 日誌                               | 開啟日誌頁時持續出現日誌。                                                               | `record_logs`                                                                                                                  |
| DNS：查詢、快取與記錄              | 列出查詢與快取；開啟頁面時記錄持續增加。                                                 | 記錄需要 `record_dns_log`；`dns` 組態區段                                                                                      |
| 連線：關閉與編輯命中規則 | 關閉連線，或在規則頁開啟可寫入的命中規則，修改條件與目標。 | `connections`；編輯需要 `rules` 與可寫入來源 |
| 規則：路由規則、DNS 規則與流程 | 編輯路由規則、DNS request 與 response 規則；查看命中、流程與追蹤模擬，包括可選的 0 至 63 DSCP 值。 | 對應的規則、流程與追蹤資源；編輯需要 `config_write: true` 與可寫入來源 |
| DNS：依解析記錄新增規則 | 列內圖示開啟精確比對網域的 DNS request 規則；「網域後綴」包含子網域。不提供 DNS 規則時開啟路由規則。 | 支援的規則清單；套用需要可寫入組態 |
| 策略：檢測設定                     | 後端允許修改時，可調整群組的「容忍差值」與「閒置逾時」。                                 | `groups` 及 `mutable_config` 中對應的欄位                                                                                     |
| 系統狀態：執行期降級 | honk 在故障恢復後以降級方式運作時，「資料路徑」卡片顯示警告。 | `runtime.degradations` |
| 延遲探測 | 節點的「測試 {name}」與群組的「測試全部」使用「設定 > 延遲探測」。「以選項探測…」可選擇支援的方法、IP 位址族、冷探測與巢狀群組節點。 | 後端 `probes` 能力與已設定的探測目標；已移除的 `probe_allowed_cidrs` 與 `probe_allowed_ports` 會被忽略並產生警告 |
| 事件                               | 事件頁顯示事件串流。                                                                     | `enabled: true`                                                                                                                |
| DNS：刪除符合的快取項目 | 「刪除符合項目」在確認前顯示數量；可依完整網域、後綴、關鍵字、正規表示式、記錄類型或兩者組合比對。沒有快取清單時也可依精確名稱刪除。 | 後端快取刪除能力 |
| DNS：查詢上游 | 「上游」提供遵循 `dns.routing` 的「自動」，或 `dns.upstream` 中的命名上游。 | DNS 查詢與定義命名上游的可讀組態 |
| 組態：備份與修訂 | 「匯出組態」下載已接受的組態；「匯入伺服器檔案」讀取伺服器啟動檔案；修訂詳細資料提供經確認的還原。不會上傳本機備份；匯出不含 listener secrets，但可能保留其他憑證。 | 後端組態匯出、匯入或修訂能力 |
| 錯誤診斷 | 「複製錯誤」複製失敗詳細資料；「設定 > 關於」的「複製最近錯誤」複製記憶體中最近 20 筆錯誤，不含密鑰與請求本文。 | 已記錄的失敗或結果未知的操作 |

自動記錄模式下，流程請求、日誌串流與 DNS 記錄讀取各自啟用對應記錄器，並分別有 60 秒寬限期。連線、分流與規則頁開啟時會請求流程。已允許但處於閒置狀態的記錄器屬於正常情況。

<a name="still-missing"></a>

## 仍有功能缺少時

- 變更 `native_api` 後沒有重新啟動 honk。重載不會套用這些欄位。
- 缺少 `config_write: true`。`native_api` 的欄位直接寫在 `experimental` 下時，honk 會以 [`unknown experimental setting`](troubleshooting.md#unknown-setting) 拒絕啟動。
- 既沒有 `password_auth: true`，也沒有 `secret`，且未啟用匿名 loopback。此時若設定了 `enabled: true`，honk 會拒絕啟動。`listen` 為 loopback 位址且設定 `allow_anonymous_loopback: true` 時，讀取請求無需 Token。組態寫入與受保護的設定變更仍需要憑證。此模式僅用於本機開發。
- 檔案包含密鑰或與密鑰相同的文字，因此 doona 將其顯示為[唯讀](troubleshooting.md#read-only)。
- honk 是早期的 `feat/native-api` 建置，因此地理資料卡片沒有來源設定。請安裝 doona 發行版本附帶的建置，見 [honk 版本](requirements.md#honk-version)。
- Token 模式下狀態資料庫未能開啟，因此地理資料卡片沒有可設定的來源與排程控制項。檔案表格仍會顯示；已設定網址且後端支援更新時，仍可手動更新。詳見[狀態資料庫問題](troubleshooting.md#state-db)。
- 僅在以 `--store db` 執行時出現，本文件不使用此模式：honk 未能記錄的修訂會阻止後續寫入，直到下一次成功啟用組態。

## 登入之後

介面指南與操作步驟請參閱[文件目錄](index.md)。

每一次組態來源的寫入都經過引擎。doona 帶著讀取時的雜湊送出（`If-Match`）；磁碟上已變動的檔案會回傳 412，不會寫入。引擎先驗證整組來源，再儲存並重載；重載失敗時仍沿用先前的世代。預先驗證不會寫入，遮蔽後的文字也不會寫回。執行期設定與群組選擇走各自的端點，各有檢查。

<a name="pages"></a>

## 頁面與所需資源

![策略頁](../screenshots/zh-TW/policies-light.webp)

| 頁面 | 內容                                                                                                       | 需要的資源                          |
| ---- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 活動 | 出站模式、流量與記憶體、活動連線、節點延遲、出站用量、流量最高的用戶端、通知 | 無 |
| 系統狀態 | 引擎與 eBPF 狀態、流量計數、後端能力、執行期降級、狀態 JSON 匯出                                   | `runtime`                           |
| 連線 | 即時連線的來源、目的、規則、鏈路與流量；關閉連線、編輯命中規則、可在網址中帶入篩選條件                         | `connections`                       |
| 分流 | 分流總覽與流程記錄，含每筆記錄的追蹤步驟 | `flows` |
| DNS | 查詢與回應、上游選擇、快取與解析記錄；列內新增規則、比對刪除與清空快取 | `dns_query`、`dns_log`、`dns_cache` |
| 策略 | 群組、成員與健康；選擇、固定、探測、編輯與檢測設定 | `groups`、`config` |
| 規則 | 路由範本、可編輯的路由與 DNS 規則、追蹤模擬；沒有規則 API 時也可使用範本 | `rules`、`dns_rules`、`flows`、`routing_trace` |
| 節點 | 訂閱與更新間隔、組態內節點、新增與移除、各類探測結果與共用群組編輯器 | `nodes`、`providers` |
| 組態 | 模組、全域設定、含診斷與驗證的設定檔編輯器、來源匯出、備份與修訂 | `config`；組態匯出、匯入或修訂能力也允許存取 |
| 事件 | 後端事件串流                                                                                               | `events`                            |
| 日誌 | 日誌串流，可依等級與模組篩選、暫停、匯出                                                                   | `logs`                              |
| 設定 | 後端、執行期設定、延遲探測偏好、地理資料來源與檔案、語言、外觀與配色 | 無 |

所有頁面都保留在導覽列中。只有 [registry.ts](https://github.com/Zakkaus/doona/blob/main/src/shell/registry.ts) 為頁面列出的資源全部不可用時，頁面才會標為不可用；後端提供匯出、匯入或修訂時，組態頁也可用。開啟無法使用的頁面會顯示提示。`Ctrl K`（macOS 為 `⌘ K`）可搜尋頁面與即時資料，也涵蓋設定欄位與動作、持久化 `global` 設定、組態區段與功能入口；選擇結果會開啟並聚焦控制項，不會執行動作，見[搜尋範例](tour.md#top-bar)。

![規則頁](../screenshots/zh-TW/rules-light.webp)

<a name="widgets"></a>

## 小工具

活動頁儀表板與浮動面板共用小工具庫。兩處都提供「出站失敗」「節點可用性」「DNS 延遲」與「訂閱額度」。「訂閱額度」不在預設版面中，列出每個訂閱的到期時間與配額計量器；未回報額度時只顯示用量。「來源狀態」在提供方回報額度時也會顯示用量計量器。

記憶體預設使用圖表。選擇「迷你折線圖」可顯示為類似「下載」與「上傳」的數值卡片，儀表板寬度可從一列的五分之一到整列。面板的中型記憶體小工具顯示常駐記憶體及 cgroup 用量與上限，大型才顯示圖表。

記憶體計量器標為「cgroup 已用」。上限為零或缺少時不顯示計量器，並區分未回報上限與明確未設定上限。發生 OOM kill 後，「鍵值清單」也會顯示次數。位元組比值兩側單位相同時只寫一次，例如 `70／268 MB`。

- 圖表卡片至少占一列的三分之二時，每條序列的峰值與平均值顯示在圖表旁，包括自動寬度的流量卡片與數值卡片。寬鍵值指標卡片在讀數旁顯示相同統計。
- 至少有四列的寬清單小工具使用兩欄。長名稱換行，不再截斷。通知依內容增加高度，不再設定列數。
- 環形圖從儀表板寬度的三分之二起放大圓環、縮窄圖例。節點延遲從半列寬起將最低與最高值放在圖例列上。方格圖在圖例上方置中。
- 窄環形圖的名稱、數值與占比保持在同一列；面板的大型環形圖不需捲動即可顯示全部項目。面板的小型通知占整列，小型節點延遲以名稱與數值代替狹窄的圖。窄面積圖省略會重疊的時間標籤。
- 累計流量、DNS 應答與網路分類最多占半列，快速切換群組最多占三分之二且不重複標題。兩種分類顯示全部類別，不再設定列數。已儲存但不再提供的尺寸會採用最接近的可用尺寸。
- 面板的鍵值指標小工具不再提供與中型相同的大型尺寸。迷你折線圖在第二個樣本到達前顯示基線；速率圖例不會隨讀數變化而改變高度。

面板移動、固定、嵌入與編輯器捲動見[介面導覽](tour.md)。

![「活動」頁的「出站失敗」「節點可用性」「DNS 延遲」卡片](../screenshots/zh-TW/widgets-health.webp)

## 主題與配色

![所有配色的亮色與暗色模式](../screenshots/palettes.webp)

亮色主題的提示徽章、警告與資訊提示訊息使用白色文字，包括黃色提示。

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
| 強國 | [白班](../screenshots/en/theme-qiangguo-light.webp) | [夜班](../screenshots/en/theme-qiangguo-dark.webp) |

## 瀏覽器中儲存的設定

![localStorage、sessionStorage 與 honk 的儲存邊界](../images/storage-boundary.svg)

`localStorage` 儲存目前網站來源的偏好、布局與連線設定檔，包括 Token；`sessionStorage` 儲存目前分頁的密碼登入工作階段 token。honk 儲存後端組態並管理密碼工作階段；清除瀏覽器資料會遺失連線設定檔與偏好，不會刪除 honk 的組態。

Token 模式下，請求透過 `Authorization` 傳送已儲存的 Token；配對連結可透過網址片段傳遞 Token，載入後移除該片段。儲存鍵見 [storage.ts](https://github.com/Zakkaus/doona/blob/main/src/api/storage.ts)。

儲存的主題與語言在第一幀之前就套用，重新載入不會閃出預設外觀。

「設定 > 外觀」在「語言」旁提供「日期格式」與「時間格式」。「日期格式」預設為「自動（瀏覽器地區）」，與介面語言無關。「日/月/年」「月/日/年」與「年-月-日」可覆寫瀏覽器的日期順序。

「時間格式」預設為「24 小時制」。「12 小時制」使用介面語言的上午、下午文字；「自動（瀏覽器地區）」依瀏覽器地區的慣例顯示。此設定適用於頁面上的所有時間，包括圖表座標軸與日誌熱圖，可與每種日期格式組合，並儲存在目前瀏覽器中。

在 HTTPS 或 localhost 下，service worker 預先快取應用程式外殼，並快取字型與圖示，離線也能開啟頁面，網站可安裝成應用程式。API 回應一律不快取。安全問題的回報方式見 [SECURITY.md](https://github.com/Zakkaus/doona/blob/main/.github/SECURITY.md)。

登入前不會下載其他頁面。安裝更新時，不會重新下載頁面已有的檔案。

![深色模式的活動頁](../screenshots/zh-TW/activity-dark.webp)
