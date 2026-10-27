[English](../en/minimal-configuration.md) / [简体中文](../zh-CN/minimal-configuration.md) / 繁體中文

# 最小組態

用以下兩個檔案建立全新的 honk 直連組態，並啟用標準版介面。先[安裝 honk 和 doona](install.md)；首次操作可按[快速開始](quick-start.md)逐步完成，訂閱與代理路由的解釋見[教學](tutorial.md)。

以下命令會替換 `/etc/honk/config.dae` 與 `/etc/honk/config.d/api.dae`。它們適用於全新組態；已經執行 honk 時，請保留現有組態。

## 1. 設定位址與介面目錄

在閘道器的一個終端中查找區域網路位址，並設定變數。替換範例 IP，介面目錄應包含已安裝的 `index.html`：

```sh
ip -4 addr show
LAN_IP=192.168.1.1
UI_DIR=/usr/share/doona
```

Debian 或 Ubuntu 套件使用 `UI_DIR=/usr/share/doona-web`。其他安裝路徑見[安裝](install.md#doona)。後續寫入檔案的命令都在同一終端執行。

## 2. 寫入主組態

選擇適用於目前 shell 或平台的分頁。sudo 與 root 範例處理閘道器自身的流量；OpenWrt 範例還會附加至 `br-lan`，如果區域網路橋接器名稱不同，請替換它。

```sh tab="sudo"
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
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
install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
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
mkdir -p /etc/honk/config.d /etc/honk/data
chmod 0700 /etc/honk /etc/honk/config.d /etc/honk/data
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

介面選擇與欄位含義見[組態參考](configuration.md)。本例沒有代理節點或 DNS 路由規則。

要處理區域網路用戶端的流量，在 `global` 中新增 `lan_interface`，指定連接這些用戶端的介面。主路由使用 LAN 橋接器，通常為 `br-lan`；用戶端已將主路由作為閘道器。使用旁路由時，還需將用戶端的閘道器與 DNS 設為旁路由的 LAN 位址，可逐台設定，也可透過主路由的 DHCP 設定派送。

不要假定 `lan_interface: auto` 會選擇 LAN：它選擇 metric 最低的 IPv4 預設路由所在介面，在主路由上通常是 WAN 介面。

## 3. 寫入 API 引入檔案

```sh tab="sudo"
sudo tee /etc/honk/config.d/api.dae > /dev/null <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '${UI_DIR}'
    }
}
EOF
sudo cat /etc/honk/config.d/api.dae
```

```sh tab="root / OpenWrt"
cat > /etc/honk/config.d/api.dae <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '${UI_DIR}'
    }
}
EOF
cat /etc/honk/config.d/api.dae
```

輸出的檔案應包含你的區域網路位址與已安裝的介面目錄。API 欄位見[組態參考](configuration.md)，身分驗證條件見[登入需求](feature-requirements.md#req-sign-in)。使用主機名稱時，另見[主機名稱與來源存取](install.md#other-origin)。

## 4. 不附加 eBPF 檢查啟動

如果 honk 已啟動，先按[服務管理](service-management.md)停止該執行個體，再啟動另一個監聽器。在閘道器終端執行：

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data --mock-ebpf
```

使用 `--mock-ebpf` 時，如果原因是 `the mock eBPF backend was selected`，出現 `NFQUEUE is unavailable at startup; continuing with NFQUEUE staging disabled` 警告屬於預期行為。

啟動成功不代表每項組態都已使用。解析器會對 `global` 中未知的純量鍵發出警告並忽略它們；繼續操作前，請閱讀啟動診斷。

等待 `native API listener ready` 和 `honk-core is running`。在第二個終端查詢 API，並替換範例 IP：

```sh
curl http://192.168.1.1:9527/api
```

JSON 回應包含 `setup_required: true`，表示 API 可存取且尚未建立管理員。這項檢查不能證明實際 eBPF 後端能夠啟動或路由流量。

在第一個終端按 Ctrl+C。接著按[服務管理](service-management.md)啟動實際後端，再[首次登入](first-sign-in.md)。啟動失敗時，查看[疑難排解](troubleshooting.md)。

## 啟動檢查失敗時

| 訊息 | 檢查方式 |
| --- | --- |
| `native API listener bind failed` | 確認 `listen` 指定的位址屬於此閘道器，且連接埠未被其他程序占用。 |
| `Subscription HTTP client creation failed`，隨後出現 `subscription network startup failed` | 閱讀底層 TLS 錯誤並檢查系統 CA 憑證庫。安裝發行版的憑證套件，如 `ca-certificates` 或 OpenWrt 的 `ca-bundle`。 |
| `command not found` 或找不到執行檔 | 按對應平台的[安裝說明](install.md)，核對命令中的 honk-core 路徑。 |
