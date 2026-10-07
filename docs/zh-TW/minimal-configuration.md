[English](../en/minimal-configuration.md) / [简体中文](../zh-CN/minimal-configuration.md) / 繁體中文

# 最小組態

本頁撰寫能啟動 honk 並提供 doona 的最小 honk 組態，然後手動啟動 honk 檢查組態。本頁假定 doona 已位於 `/usr/share/doona`，honk-core 也已安裝，即[各安裝頁](install.md)完成後的狀態。

> [!NOTE]
> Debian 與 Ubuntu 的套件名稱為 `doona-web` 與 `doona-web-fonts`，安裝於 `/usr/share/doona-web` 下。請將下文範例中的 `ui: '/usr/share/doona'` 改為 `ui: '/usr/share/doona-web'`。

此範例使用兩個檔案。`/etc/honk/config.dae` 是主檔案。`/etc/honk/config.d/api.dae` 啟用 doona 所用的原生 API。在加入節點與規則之前，所有連線都直接發出；更完整的範例見[組態](configuration.md#config)。

## 開始之前

- 閘道器上的 shell：可使用 sudo 的使用者，或 root。在 OpenWrt 上，凡是提供「OpenWrt」分頁的地方都選擇它。該分頁的命令以 root 執行，並把 honk 的資料放在 `/etc/honk/data`，因為 OpenWrt 的 `/var` 位於記憶體中，重新啟動後清空。
- 進入這台機器的第二種途徑，例如主控台，供第 6 步使用。honk 正式啟動時會改動閘道器的網路設定。

## 1. 檢視閘道器的區域網路位址

區域網路裝置透過這個位址開啟 doona。

```sh
ip -4 addr show
```

找到區域網路裝置所連線的介面（OpenWrt 上為 `br-lan`），記下 `inet` 後面的位址，不含 `/24`。例如：

```text
    inet 192.168.1.1/24 brd 192.168.1.255 scope global eth0
```

為後續步驟設定該位址：

```sh
LAN_IP=192.168.1.1
```

## 2. 建立目錄

```sh tab="sudo"
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
```

```sh tab="root"
install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
```

```sh tab="OpenWrt"
mkdir -p /etc/honk/config.d /etc/honk/data
chmod 0700 /etc/honk /etc/honk/config.d /etc/honk/data
```

這些目錄只有 root 可以讀取，因為組態與狀態資料庫中儲存著憑證。

## 3. 撰寫主檔案

```sh tab="sudo"
sudo tee /etc/honk/config.dae > /dev/null <<'EOF'
include {
    config.d/*.dae
}

global {
    wan_interface: auto
}

routing {
    fallback: direct
}
EOF
```

```sh tab="root"
cat > /etc/honk/config.dae <<'EOF'
include {
    config.d/*.dae
}

global {
    wan_interface: auto
}

routing {
    fallback: direct
}
EOF
```

```sh tab="OpenWrt"
cat > /etc/honk/config.dae <<'EOF'
include {
    config.d/*.dae
}

global {
    wan_interface: auto
    lan_interface: br-lan
    data_dir: '/etc/honk/data'
    bootstrap_resolver: '127.0.0.1:53'
}

routing {
    fallback: direct
}
EOF
```

| 行                             | 作用                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `include { config.d/*.dae }`   | 讀取 `/etc/honk/config.d/` 中的每個 `.dae` 檔案，路徑相對於主檔案。第 4 步的 API 檔案即在其中。              |
| `wan_interface: auto`          | 把 honk 掛到 IPv4 預設路由所在的介面上，由 honk 處理閘道器自身的流量。                                         |
| `lan_interface: br-lan`        | 將 honk 掛到 OpenWrt 的區域網路橋接介面，處理區域網路裝置的流量。                                             |
| `data_dir: '/etc/honk/data'`   | 僅用於 OpenWrt。honk 存放地理資料與狀態資料庫（包括管理員帳戶）的目錄。其他系統使用預設值 `/var/lib/honk`。  |
| `routing { fallback: direct }` | 所有連線都直接發出，不經過代理。節點、群組與規則稍後在 doona 或按[組態](configuration.md#config)一頁加入。   |

在 OpenWrt 上，`bootstrap_resolver: '127.0.0.1:53'` 使用 dnsmasq 解析直接下載網址的網域名稱。地理資料網址不得重新導向：使用 `raw.githubusercontent.com` 等最終網址，不要使用 GitHub 發行版本的網址。

依要處理的流量設定 `lan_interface`：

- 主路由器：使用 `br-lan`，用戶端已將這台路由器設為閘道器。
- 旁路由器：使用 `br-lan`，並將用戶端的閘道器與 DNS 設為旁路由器的區域網路位址；可逐一設定用戶端，也可修改主路由器的 DHCP 設定。
- 僅處理本機流量：省略 `lan_interface`，與 sudo、root 兩個範例相同。

`lan_interface: auto` 會選取預設路由所在的介面，在主路由器上通常是 WAN。

## 4. 撰寫 API 檔案

該檔案使用第 1 步設定的 `LAN_IP`。

```sh tab="sudo"
sudo tee /etc/honk/config.d/api.dae > /dev/null <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '/usr/share/doona'
    }
}
EOF
sudo cat /etc/honk/config.d/api.dae
```

```sh tab="root"
cat > /etc/honk/config.d/api.dae <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '/usr/share/doona'
    }
}
EOF
cat /etc/honk/config.d/api.dae
```

```sh tab="OpenWrt"
cat > /etc/honk/config.d/api.dae <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '/usr/share/doona'
    }
}
EOF
cat /etc/honk/config.d/api.dae
```

輸出的檔案中，`listen` 一行應為你的位址，例如 `listen: '192.168.1.1:9527'`。

使用 `openwrt.lan` 等網域名稱時，須分別在 `allowed_hosts` 中設定主機與連接埠，在 `allow_origins` 中設定瀏覽器來源，然後重新啟動 honk。語法與 403 檢查步驟見[網域名稱與來源存取](install.md#other-origin)。

| 行                           | 作用                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `experimental { native_api` | 原生 API 組態塊，必須位於 `experimental` 之內。                                                                            |
| `enabled: true`             | 啟動 API 監聽。doona 需要它。                                                                                              |
| `listen: '…:9527'`          | 開啟 doona 所用的位址與埠。預設值 `127.0.0.1:9527` 只能從閘道器本機存取。                                                  |
| `password_auth: true`       | 使用管理員使用者名稱與密碼登入。管理員在[首次登入](first-sign-in.md)時建立。啟用 API 卻沒有設定任何登入方式時，honk 拒絕啟動。 |
| `config_write: true`        | 允許 doona 編輯組態、節點、訂閱、群組與規則。刪除此行則 doona 只能讀取。                                                   |
| `ui: '/usr/share/doona'`    | 在 `/ui/` 提供 doona 的檔案。該目錄中沒有 `index.html` 時，honk 拒絕啟動。                                                 |

每個 `native_api` 欄位都要重新啟動後才生效。其餘欄位見[欄位表](configuration.md#config)。

doona beta.17 發行版中已修正的 honk-core 附件內建 doona 0.1.0-beta.17。已經下載舊的 honk 附件時，請用已修正的發行附件替換；如果 honk 正在運作，請重新啟動 honk。要在 `/ui/` 提供內建介面，將上面的 `ui` 行改為：

```dae
ui: embedded
```

使用 `ui: embedded` 時，獨立的介面套件是可選項。內建介面不含 Noto Sans TC/SC，瀏覽器會使用系統字型。如需提供外部介面檔案或這些字型，安裝 `doona` 和 `doona-fonts`，並將 `ui` 指向安裝目錄，例如 `/usr/share/doona`；Debian 或 Ubuntu 則使用 `doona-web`、`doona-web-fonts` 和 `/usr/share/doona-web`。

## 5. 檢查組態

honk 沒有單獨的檢查命令。用 `--mock-ebpf` 啟動一次：honk 會讀取並接受整份組態，啟動 API 並提供 doona，但不改動網路。

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data --mock-ebpf
```

honk 在前景持續運作。每行以時間戳開頭，其中應包括：

```text
INFO honk_core: honk-core debug.2026.10.7.native-api.1 starting
INFO honk_core: Config: /etc/honk/config.dae
INFO honk_core: Loaded 2 nodes, 0 groups, 0 routing rules
WARN honk_core: NFQUEUE is unavailable at startup; continuing with NFQUEUE staging disabled requested=true reason=the mock eBPF backend was selected
INFO honk_core: Using mock eBPF backend
INFO honk_core: listen=192.168.1.1:9527 native API listener ready
INFO honk_core: honk-core is running. Press Ctrl+C to stop.
```

使用 `--mock-ebpf` 時出現 `WARN` 一行屬於正常情況。honk 運作期間，在第二個終端機中查詢 API，並把 `192.168.1.1` 換成你的位址：

```sh
curl http://192.168.1.1:9527/api
```

API 返回一行內容；`setup_required: true` 表示尚未建立管理員：

```text
{"api_major":1,"auth":{"mode":"password","setup_required":true},"links":{"auth_login":"/api/v1/auth/login","auth_setup":"/api/v1/auth/setup"},"name":"dae/honk-native"}
```

在第一個終端機中按 Ctrl+C。honk 輸出 `Received SIGINT, shutting down...`，最後輸出 `honk-core stopped`。

## 6. 正式啟動 honk 一次

這次啟動會載入 eBPF 程式並掛到組態指定的介面上。請準備好進入機器的第二種途徑。

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data
```

日誌中出現同樣的 `native API listener ready` 與 `honk-core is running. Press Ctrl+C to stop.`，但沒有 mock 相關的行。按 Ctrl+C 停止 honk；之後由下一頁的服務運作 honk。

下一步：[服務管理](service-management.md)。

## 遇到問題時

honk 在以 `fatal error, shutting down:` 開頭的行或 `ERROR` 行中給出原因。

| 看到的內容                                                                                | 原因與處理                                                                                                   |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `native API listener bind failed`                                                         | `listen` 位址不屬於這台機器。請重做第 1 步與第 4 步。                                                         |
| `failed to inspect native UI index.html: No such file or directory` | 檢查 `ui` 實際指向的目錄是否包含 `index.html`：Debian 或 Ubuntu 為 `/usr/share/doona-web`，其他平台通常為 `/usr/share/doona`。按對應平台的安裝頁安裝 doona。 |
| `Subscription network owner failed error="subscription HTTP client creation failed"`，隨後是 `subscription network startup failed` | 缺少 CA 憑證。請安裝 `ca-certificates` 套件（OpenWrt 上為 `ca-bundle`）。 |
| `native API requires a secret, password login, or explicitly anonymous loopback`          | `api.dae` 缺少 `password_auth: true` 一行。                                                                   |
| `native API setting belongs inside native_api { }`                                        | 某個 `native_api` 欄位直接寫在了 `experimental` 下。請把它移入 `native_api { }`。 |
| `unknown experimental setting`                                                            | `enabled` 直接寫在了 `experimental` 下，或這是沒有原生 API 的 daeuniverse/honk `main` 分支建置。見 [unknown experimental setting](troubleshooting.md#unknown-setting)。 |
| `command not found`                                                                       | honk-core 不在命令所指的路徑上。請重做安裝 honk-core 的步驟。                                                 |

啟動成功並不代表每個值都符合預期：honk 會接受某些未知的值而不報錯。更多錯誤訊息見[疑難排解](troubleshooting.md#troubleshooting)。
