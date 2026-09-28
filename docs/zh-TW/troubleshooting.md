[English](../en/troubleshooting.md) / [简体中文](../zh-CN/troubleshooting.md) / 繁體中文

<a name="troubleshooting"></a>

# 疑難排解

<a name="unknown-setting"></a>

## native_api 設定寫在 native_api { } 之外

`native_api` 的欄位直接寫在 `experimental` 下，honk 因此拒絕此組態。`fatal error, shutting down:` 一行會列出設定路徑與訊息，例如 `experimental.ui: native API setting belongs inside native_api { }`。`enabled` 與 `secret` 也屬於其他組態區塊，因此 honk 對這兩個欄位只回報 `unknown experimental setting`。請將欄位移入 `native_api { }`。

```dae
# Wrong: "native API setting belongs inside native_api { }"
experimental {
    ui: '/usr/share/doona'
}

# Wrong: "unknown experimental setting"
experimental {
    enabled: true
}

# Right
experimental {
    native_api {
        enabled: true
        password_auth: true
        ui: '/usr/share/doona'
    }
}
```

由 main 分支建置的 honk 沒有原生 API，會以 `unknown experimental setting` 拒絕整個 `native_api { }` 組態區塊。請執行 `honk-core --version` 檢查版本並安裝 `debug` 版本，詳見 [honk 版本](requirements.md#honk-version)。

## honk 拒絕 native_api 組態區塊

- `configuration administration requires a bearer secret or password login`：`config_write: true` 需要 `password_auth: true` 或 `secret`。
- `password login requires an empty secret; a configured secret selects token mode`：兩者只能保留一個。
- `password login cannot be combined with anonymous loopback`：刪除 `allow_anonymous_loopback`。
- `native API requires a secret, password login, or explicitly anonymous loopback`：`enabled: true` 需要 `password_auth: true` 或 `secret`。

<a name="state-db"></a>

## 狀態資料庫問題

範例組態設定了 `password_auth: true`，資料庫無法開啟時 honk 會在啟動時結束，日誌顯示 `state database:` 與原因。Token 模式下 honk 會記錄警告並在沒有資料庫的情況下執行：地理資料來源卡片消失，只有同時設定兩個下載網址，「更新」按鈕才會保留。請在日誌中尋找原因：

```sh
sudo journalctl -u honk-core | grep -i 'state database'
sudo ls -la /var/lib/honk/state/
```

日誌也會保留先前每次啟動的訊息，請查看最近一次啟動的記錄。

```text
state database is unavailable
state database path is unsafe
state database is locked by `honk-core admin reset`
state database is corrupt
```

1. unavailable：`data_dir` 不存在時由 honk 建立，`state/` 也由 honk 在其中建立。執行 honk 的使用者必須能在父目錄中建立 `data_dir`，並能寫入該目錄；使用[安裝](install.md#install)中的 systemd 單元時該使用者為 root。
2. unsafe：`state/` 與 `honk.db` 必須屬於該使用者，且不授予群組或其他使用者任何權限。`honk.db` 必須是一般檔案，不能是符號連結，也不能在 honk 開啟時被替換。
3. locked：等待 `honk-core admin reset` 執行完畢。
4. corrupt：設定 `password_auth: true` 時 honk 會結束。Token 模式下 honk 會將檔案移至 `honk.db.corrupt` 並建立新的資料庫；若已存在較早的 `.corrupt` 檔案，honk 會保留兩者，並在該檔案刪除之前不使用資料庫執行。
5. 修正後重新啟動 honk。

`another honk-core has the state database open` 與 `state database has a foreign application id or a newer schema` 一律會阻止啟動：請停止另一個執行個體，或使用寫入該資料庫的 honk 版本。

<a name="geodata-sources"></a>

## 地理資料來源無法編輯，或自動更新從未執行

honk 正在沒有狀態資料庫的情況下執行，而來源與更新排程都存在該資料庫中。自 doona beta.9 起，概覽頁的「資料路徑」卡片會提示狀態資料庫無法使用，即使無法讀取資料路徑也會顯示。`/api/v1/runtime` 的 `degradations` 清單也會列出該項；`<listen>` 為 `listen` 位址，`<token>` 為 `secret`：

```sh
curl -s -H 'Authorization: Bearer <token>' http://<listen>/api/v1/runtime
```

出現 `persistence_unavailable` 項目即可確認，其 `reason` 指出原因，請參閱[狀態資料庫問題](#state-db)。修正之前，「更新」從 `native_api` 中的 `geosite_download_url` 與 `geoip_download_url` 下載，且只在手動按下時執行。

<a name="state-unsafe"></a>

## persistence_unavailable 的 reason 為 unsafe

honk 拒絕使用資料目錄中的 `state/` 或其中的 `honk.db`。兩者都必須屬於執行 honk 的使用者，不授予群組或其他使用者任何權限，且不能是符號連結。資料目錄為 `ps w | grep '[h]onk-core'` 顯示的 `--data-dir` 值；沒有此參數時為組態中的 `data_dir`，預設為 `/var/lib/honk`。

```sh
ls -ld /var/lib/honk/state /var/lib/honk/state/honk.db
chmod 700 /var/lib/honk/state
chmod 600 /var/lib/honk/state/honk.db
```

只變更這兩項，不要遞迴變更；`/etc/honk` 與 `config.d/` 不受影響。若 `ls` 顯示擁有者不同，請以 `chown` 將兩者改為執行 honk 的使用者。之後重新啟動 honk。

OpenWrt 的 `/var` 位於記憶體中，因此預設的 `/var/lib/honk` 每次重新開機都會遺失資料庫。請依[最小組態](minimal-configuration.md)將資料存放在 `/etc/honk/data`。

<a name="geodata-update"></a>

## 地理資料更新失敗並顯示 checksum_unavailable

檔案已下載，但無法取得 `<url>.sha256sum`。404 不算失敗：honk 會保留未經驗證的檔案。beta.9 附帶的建置在檔案下載連續 30 秒無進展或總計超過 10 分鐘時逾時；校驗和請求有獨立的 10 秒期限。HTTP 403、429 或路由故障也會讓校驗和請求失敗。可改用其他鏡像站；僅當可信鏡像站的`.sha256sum` 網址確定無法使用時，才關閉「SHA-256 驗證」。

| 階段                   | 意義                                                   | 處理方式                                                   |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `checksum_mismatch`    | 檔案與其 `.sha256sum` 不符。                           | 改用其他鏡像站；僅當確認可信鏡像站的`.sha256sum` 檔案有誤時，才關閉驗證。 |
| `download_timeout`     | 檔案下載連續 30 秒無進展，或總計超過 10 分鐘。 | 改用較快的路由或較近的鏡像站。 |
| `http_status_rejected` | 伺服器回應 200 與 404 以外的狀態碼，包括重新導向。     | 改用最終網址；遇到 403 或 429 時稍後重試。                 |
| `http_not_found`       | 檔案網址回應 404。                                     | 檢查網址。                                                 |
| `connection_failed`    | honk 無法連線到伺服器或節點。                          | 檢查節點；直接下載時檢查 `bootstrap_resolver`。            |
| `tls_failed`           | TLS 交握或憑證檢查失敗。                               | 檢查閘道器的時鐘與網址的主機名稱。                         |
| `group_unavailable`    | 下載所經的群組沒有可用節點。                           | 在「策略」頁檢查該群組。                                   |
| `route_blocked`        | 路由規則將下載主機導向 `block`。                       | 修改符合該主機的規則。                                     |
| `destination_rejected` | 網址的位址或連接埠不允許用於下載。                     | 改用連接埠 80 或 443 上的公開位址。                        |
| `asset_too_large`      | 檔案超過 honk 的大小上限。                             | 確認網址指向地理資料檔案。                                 |
| `invalid_source`       | 網址不是有效的 HTTP 或 HTTPS 網址。                    | 修正網址。                                                 |

## 固定映射時出現 Invalid argument

`/sys/fs/bpf` 不是 bpffs。請依[系統需求](requirements.md#requirements)掛載。

## 核心版本過舊

honk 會在掛載前拒絕早於 6.12 的核心。驗證器拒絕編譯後的分流程式時，請使用啟用 BPF 與 BTF 的 Linux 6.12 或更新版本，並保留完整的驗證器日誌以便回報。

## 停止 OpenWrt 防火牆會刪除 honk 的 nft 表

`service firewall stop` 會刪除 honk 的 nft 表，NFQUEUE staging 隨之失效。重新啟動防火牆後，執行 `/etc/init.d/honk-core restart`。`fw4 reload` 和 `service firewall restart` 不會刪除該表。

<a name="no-native-api"></a>

## 沒有原生 API，或 /api、/ui/ 回傳 404

從 `journalctl -u honk-core -b` 的本次開機日誌中找到最近一筆 `honk-core <版本> starting`，再與 [honk 版本](requirements.md#honk-version)對照。

- 無法連線到 `listen` 位址：honk 未執行、`enabled` 不是 `true`，或 `listen` 指向其他位址。`enabled: false` 時監聽不會啟動。
- `/api` 回傳 404：該位址上的服務沒有原生 API，例如由 main 分支建置的 honk。doona 的登入頁面此時顯示「此 honk 建置沒有提供原生 API」。請安裝 `debug` 版本。
- 只有 `/ui/` 回傳 404：原生 API 正在執行，但 `ui` 為空。
- honk 啟動時以 `failed to inspect native UI directory`、`failed to inspect native UI index.html` 或 `native UI index.html must be a regular file` 結束：請依[安裝 doona 並啟動](install.md#doona)將 doona 解壓縮到 `ui` 目錄。

<a name="sign-in"></a>

## 登入與跨網域失敗

- 首次設定只能在閘道器本機或私有網路中的用戶端完成。
- 設定中顯示「網路連線失敗」或「網路或跨網域請求失敗」：無法透過 `listen` 位址存取 honk，或 doona 所在來源未列入 `allow_origins` 與 `allowed_hosts`。
- 透過 `openwrt.lan` 存取 API 時，若主機名稱不在 `native_api` 的 `allowed_hosts` 中，會回傳 403。請改用區域網路 IP，或在 `native_api` 中加入 `allowed_hosts: 'openwrt.lan'` 並重新啟動 honk。
- 忘記密碼：停止 honk，執行 `sudo /usr/local/bin/honk-core admin reset`（在 root shell 中去掉 `sudo`；OpenWrt 上執行 `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`），再啟動 honk 重新設定。
- HTTPS 頁面無法存取 HTTP API，請參閱[從其他來源開啟 doona](install.md#other-origin)。

<a name="read-only"></a>

## 唯讀的組態檔案

符合下列任一條件時，doona 會將組態檔案標記為唯讀：

- `config_write` 不是 `true`。
- 既沒有 `password_auth: true`，也沒有 `secret`。
- 檔案在 `native_api` 或 `clash_api` 中包含 `secret`，或包含與 8 個字元以上監聽密鑰相同的文字。
- honk 仍在載入組態檔案，或其寫入協調器未執行。
- 僅在以 `--store db` 執行時出現，本文件不使用此模式：已啟用的修訂未能記錄，導致寫入被阻止。

請將所有密鑰移入 `config.d/api.dae`，並在變更 `native_api` 後重新啟動 honk。

## 「日誌」與「事件」中沒有啟動訊息

「設定」中的「日誌記錄」預設為「隨面板」，只在 doona 連線時記錄。請改為查看系統日誌：

```sh
logread -e honk                  # OpenWrt
journalctl -u honk-core -b       # systemd
```

## 「連線」或「規則」頁保持空白

「流程記錄」設為「依流程需求」時，honk 只在用戶端請求時記錄。beta.9 的 doona 在「連線」或「規則」頁開啟時請求流程，最後一次請求結束後繼續記錄 60 秒。使用 beta.8 或更早版本且看不到流程時，可在「設定」中將「流程記錄」設為「常開」。

## 升級後 doona 仍顯示舊版本

Service worker 在更新完成前會提供快取的版本。請重新載入頁面一至兩次，或關閉所有 doona 分頁後重新開啟。

## 透過 HTTP 登入時出現 crypto.randomUUID is not a function

0.1.0-beta.8 之前的 doona 需要安全環境才能呼叫此函式，而區域網路上的純 HTTP 不屬於安全環境。請將 doona 升級至 0.1.0-beta.8 或更新版本。
