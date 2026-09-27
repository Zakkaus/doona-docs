[English](../en/configuration.md) · [简体中文](../zh-CN/configuration.md) · 繁體中文

<a name="config"></a>

# 組態

組態分為兩個檔案。主檔案 `/etc/honk/config.dae` 包含網路介面、節點、群組、分流與 DNS；`/etc/honk/config.d/api.dae` 包含 doona 使用的原生 API。主檔案引入 `config.d/` 中的所有 `.dae` 檔案，相對路徑以主檔案所在目錄為基準。

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
```

- `lan_interface`：將範例中的 `br-lan` 改為區域網路用戶端連到閘道器所用的網路介面；只代理閘道器本身的流量時移除此項。`wan_interface: auto` 同時處理閘道器本身的流量。
- `data_dir`：執行期根目錄，預設為 `/var/lib/honk`，存放地理資料檔案與狀態資料庫 `state/honk.db`。
- `bootstrap_resolver`：直接解析代理伺服器與地理資料下載位址的網域名稱，避免被 honk 攔截。下載網址使用網域名稱時必須設定此項。
- `subscription` 與 `node`：請換成自己的訂閱與節點。之後可在 doona 的節點頁繼續新增。
- `group proxy`：包含訂閱中的節點與靜態節點；`min_moving_avg` 選擇延遲最低的成員。
- `routing`：私有位址優先以 `direct(must)` 直連，中國大陸網域與 IP 位址直連，其餘流量經由 `proxy`。
- `dns`：中國大陸網域交給本地解析器，其餘經由代理以 DNS over HTTPS 解析。

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
        ui: '/usr/share/doona'
        # On by default; listed so the names are known.
        record_flows: true
        record_traffic: true
        record_memory: true
        record_logs: true
        record_dns_log: true
        # Geodata Update works even without a state db. Direct, final
        # HTTP(S) URLs only; a redirect is refused.
        geosite_download_url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat'
        geoip_download_url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat'
    }
}
```

請將 `192.168.1.1` 換成閘道器的區域網路位址，並將此組態區塊單獨放在一個檔案。檔案在 `native_api` 或 `clash_api` 中包含 `secret`，或包含與 8 個字元以上監聽密鑰相同的文字時，doona 會將該檔案顯示為唯讀，因為 honk 會隱藏密鑰，寫回檔案會遺失密鑰。該檔案中宣告的群組同樣變為唯讀。

新增節點與訂閱會寫入主檔案，因此主檔案不能包含任何密鑰。

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

| 欄位                                         | 預設值             | 在 doona 中啟用的功能                                                                                |
| -------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `enabled`                                    | `false`            | API 監聽，也就是 doona 的所有功能。                                                                  |
| `listen`                                     | `'127.0.0.1:9527'` | doona 連線的位址，只接受數字 IP 與連接埠。預設值只能從閘道器本機存取。                               |
| `password_auth`                              | `false`            | 以管理員使用者名稱與密碼登入，不能與 `secret` 同時使用。                                             |
| `secret`                                     | `''`               | Token 模式，doona 會要求輸入此 Token。不能與 `password_auth` 同時使用。                              |
| `config_write`                               | `false`            | 編輯與新增組態檔案，管理節點、訂閱、群組與規則，以及更新地理資料。需要 `password_auth` 或 `secret`。 |
| `ui`                                         | `''`               | 在 `/ui/` 提供 doona。目錄中必須有 `index.html`；目錄不存在時 honk 無法啟動。                        |
| `record_flows`                               | `true`             | 規則頁的流程記錄。設為 `false` 時，執行期開關也無法開啟。                                            |
| `record_traffic`                             | `true`             | 流量歷史圖表。                                                                                       |
| `record_memory`                              | `true`             | 記憶體歷史圖表。                                                                                     |
| `record_logs`                                | `true`             | 日誌頁。                                                                                             |
| `record_dns_log`                             | `true`             | DNS 記錄。                                                                                           |
| `geosite_download_url`、`geoip_download_url` | `''`               | 沒有狀態資料庫時的地理資料更新。有狀態資料庫時，啟動時以這兩個網址覆寫已儲存的網址。                 |
| `allow_origins`、`allowed_hosts`             | 空                 | 從其他來源或經由反向代理開啟 doona。                                                                 |

`native_api` 的每個欄位都需要重新啟動才會生效。重載會拒絕這些欄位的變更，並保留執行中的監聽。

## 安裝組態檔案

```sh
sudo install -m 0600 config.dae /etc/honk/config.dae
sudo install -m 0600 api.dae /etc/honk/config.d/api.dae
```

接著依[安裝 doona 並啟動](install.md#doona)安裝 doona，之後再啟動 honk。
