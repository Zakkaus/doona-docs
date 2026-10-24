<a name="config"></a>

# 組態

主檔案為 `/etc/honk/config.dae`；`include` 引入 `config.d/` 中的所有 `.dae` 檔案，相對路徑以主檔案所在目錄為基準。

![主組態引入 API 與 routing 檔案，監聽密鑰與可寫來源分離](https://zakkaus.github.io/doona-docs/images/include-boundary.svg)

將 API 放在 `config.d/api.dae`，新增 routing 檔案也應與監聽密鑰分離。組態寫入需要 `config_write: true`、完整文字與可寫來源；虛線邊界表示監聽密鑰檔案，不是 doona 可寫回的檔案。

## 主檔案

```dae
# /etc/honk/config.dae
include {
    config.d/*.dae
}

global {
    # The interface LAN clients reach the gateway through.
    # Remove it to proxy only the gateway's own traffic.
    lan_interface: br-lan
    # Follow the IPv4 default-route interface.
    wan_interface: auto
    data_dir: '/var/lib/honk'
    log_level: info
    dial_mode: domain
    auto_config_kernel_parameter: true
    # Resolves proxy and download hostnames without passing through honk.
    bootstrap_resolver: '1.1.1.1:53'
}

subscription {
    # Replace with your provider's subscription URL.
    my_sub: 'https://subscription.example/sub'
}

node {
    # An optional static node; replace or remove it.
    backup: 'socks5://192.0.2.2:1080'
}

group {
    proxy {
        filter: subtag('my_sub')
        filter: name('backup')
        policy: min_moving_avg
    }
}

routing {
    # Keep private destinations off the proxy; this also bypasses private DNS servers.
    dip(geoip: private) -> direct(must)
    domain(geosite: cn) -> direct
    dip(geoip: cn) -> direct
    fallback: proxy
}

dns {
    upstream {
        local_dns: 'udp://223.5.5.5:53' -> direct
        remote_dns: 'https://dns.google/dns-query' -> proxy
    }
    routing {
        request {
            qname(geosite: cn) -> local_dns
            fallback: remote_dns
        }
    }
}

assets {
    geodata {
        geosite: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat'
        geoip: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat'
    }
}
```

- `lan_interface`：將範例中的 `br-lan` 改為區域網路用戶端連到閘道器所用的網路介面；只代理閘道器本身的流量時移除此項。`wan_interface: auto` 同時處理閘道器本身的流量。
- `data_dir`：執行期根目錄，預設為 `/var/lib/honk`，存放地理資料檔案與狀態資料庫 `state/honk.db`。
- `bootstrap_resolver`：直接解析代理伺服器與地理資料下載位址的網域名稱，避免被 honk 攔截。直接下載且網址使用網域名稱時必須設定此項；下載預設依路由規則轉送。
- `subscription` 與 `node`：請換成自己的訂閱與節點。之後可在 doona 的節點頁繼續新增。
- `group proxy`：包含訂閱中的節點與靜態節點；`min_moving_avg` 是 honk 的 URLTest 策略別名，依移動平均延遲選擇成員，並遵循切換容差。
- `routing`：私有位址優先以 `direct(must)` 直連，中國大陸網域與 IP 位址直連，其餘流量經由 `proxy`。
- `dns`：中國大陸網域交給本地解析器，其餘經由代理以 DNS over HTTPS 解析。
- `assets.geodata`：最終 HTTP(S) 下載網址。沒有狀態資料庫時，手動更新需要為已載入資源設定網址。有資料庫時，啟動時以這些欄位寫入儲存的網址；之後在「設定」中修改的網址會保留到下次啟動。

## API 檔案

```dae
# /etc/honk/config.d/api.dae
# Every native_api field needs a restart; a reload rejects changes.
experimental {
    native_api {
        enabled: true
        # The gateway's LAN address. The default, 127.0.0.1:9527,
        # is reachable only from the gateway itself.
        listen: '192.168.1.1:9527'
        # Administrator password login. For token mode, delete this
        # line and set secret instead; the two cannot be combined.
        password_auth: true
        # secret: 'replace-with-a-long-random-token'
        config_write: true
        # Debian/Ubuntu doona-web: /usr/share/doona-web.
        # On other platforms, use the package's installation path.
        ui: '/usr/share/doona'
        # On by default; listed so the names are known.
        record_flows: true
        record_traffic: true
        record_memory: true
        record_logs: true
        record_dns_log: true
        # Asset download URLs belong to assets.geodata in the main file.
    }
}
```

請將 `192.168.1.1` 換成閘道器的區域網路位址。檔案在 `native_api` 或 `clash_api` 中包含 `secret`，或包含與至少 8 位元組監聽密鑰相同的文字時，檔案及其中的群組均為唯讀；honk 隱藏至少 8 位元組的密鑰，寫回隱藏文字會遺失密鑰。

新增節點與訂閱會寫入主檔案，因此主檔案不能包含密鑰。

從其他來源開啟 doona 時，例如經由 TLS 反向代理，還需加入：

```dae
experimental {
    native_api {
        # Only when doona is opened from another origin, such as a TLS reverse proxy.
        allow_origins: 'https://panel.example'
        allowed_hosts: 'panel.example'
    }
}
```

### native_api 欄位

`listen` 為 loopback 位址且設定 `allow_anonymous_loopback: true` 時，讀取請求無需 Token。組態寫入與受保護的設定變更仍需要憑證。此模式僅用於本機開發。

| 欄位                                         | 預設值             | 在 doona 中啟用的功能                                                                                |
| -------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `enabled`                                    | `false`            | API 監聽器。需要 `secret`、`password_auth: true`，或 loopback `listen` 與 `allow_anonymous_loopback: true`。                                                                  |
| `listen`                                     | `'127.0.0.1:9527'` | doona 連線的位址，只接受數字 IP 與連接埠。預設值只能從閘道器本機存取。                               |
| `password_auth`                              | `false`            | 以管理員使用者名稱與密碼登入，不能與 `secret` 或 `allow_anonymous_loopback` 同時使用。                                             |
| `secret`                                     | `''`               | Token 模式，doona 會要求輸入此 Token。沒有最短長度限制；只接受不含空白或逗號的可見 ASCII。不能與 `password_auth` 同時使用。                              |
| `config_write`                               | `false`            | 編輯與新增組態檔案，管理節點、訂閱、群組與規則，以及更新地理資料。需要 `password_auth` 或 `secret`。 |
| `ui`                                         | `''`               | 在 `/ui/` 提供 doona。目錄中必須有 `index.html`；目錄不存在時 honk 無法啟動。`embedded` 需要 `native-ui`；發布建置已包含此功能，並在打包時嵌入 doona。                        |
| `record_flows`                               | `true`             | 從 beta.9 起，連線頁和規則頁依需求顯示流程記錄。設為 `false` 時，執行期開關也無法開啟。                           |
| `record_traffic`                             | `true`             | 流量歷史圖表。                                                                                       |
| `record_memory`                              | `true`             | 記憶體歷史圖表。                                                                                     |
| `record_logs`                                | `true`             | 日誌頁。                                                                                             |
| `record_dns_log`                             | `true`             | DNS 記錄。                                                                                           |
| `geosite_download_url`、`geoip_download_url` | `''`               | `assets.geodata.geosite` 與 `assets.geodata.geoip` 的舊別名，仍接受但會警告。新組態請使用 `assets.geodata`。 |
| `allow_origins`、`allowed_hosts`             | 空                 | 從其他來源或經由反向代理開啟 doona。                                                                 |

`native_api` 的每個欄位都需要重新啟動才會生效。重載會拒絕這些欄位的變更，並保留執行中的監聽。

狀態資料庫可用時，設定頁會把地理資料來源、更新排程和「SHA-256 驗證」儲存在資料庫，而不是寫入 `native_api`。預設開啟驗證；`.sha256sum` 回傳 404 時，未經驗證的檔案本就可以載入。僅當可信鏡像站的`.sha256sum` 網址回傳其他錯誤時才關閉；參閱[更新失敗](https://zakkaus.github.io/doona-docs/zh-TW/troubleshooting.md#geodata-update)。

地理資料問題請參閱[來源無法編輯](https://zakkaus.github.io/doona-docs/zh-TW/troubleshooting.md#geodata-sources)、[reason 為 unsafe](https://zakkaus.github.io/doona-docs/zh-TW/troubleshooting.md#state-unsafe)與[更新失敗](https://zakkaus.github.io/doona-docs/zh-TW/troubleshooting.md#geodata-update)。

## 安裝組態檔案

```sh
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
sudo install -m 0600 config.dae /etc/honk/config.dae
sudo install -m 0600 api.dae /etc/honk/config.d/api.dae
```

接著依[安裝 doona 並啟動](https://zakkaus.github.io/doona-docs/zh-TW/install.md#doona)安裝 doona，之後再啟動 honk。
