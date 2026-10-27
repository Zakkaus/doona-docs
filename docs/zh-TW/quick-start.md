繁體中文 / [简体中文](../zh-CN/quick-start.md) / [English](../en/quick-start.md)

# 快速入門

使用僅直連的 honk 組態啟動 doona 標準版，登入後驗證閘道器本機的流量。你需要一臺 Debian 或 Ubuntu 閘道器、sudo 權限，以及主控台等備用存取方式。

## 1. 安裝 doona 和相容的 honk 建置

按[在 Debian 或 Ubuntu 上安裝](install-debian.md)安裝 `doona-web` 套件和 honk-core。選擇後端前，先檢視 [honk 版本](requirements.md#honk-version)：doona 需要原生 API。

其他平台：

- Fedora 或 RHEL：[安裝說明](install-fedora.md)。
- Arch Linux：[安裝說明](install-arch.md)。
- Gentoo：[安裝說明](install-gentoo.md)。
- OpenWrt：[安裝說明](install-openwrt.md)。
- Alpine 或其他發行版：[手動安裝](install-manual.md)。

在 Debian 閘道器上執行：

```sh
/usr/local/bin/honk-core --version
ls -l /usr/share/doona-web/index.html
```

第一條命令輸出 honk 的建置資訊。第二條必須列出已安裝介面的 `index.html`。

## 2. 寫入最小組態

在閘道器的同一個終端中執行以下命令。用 `ip -4 addr show` 查詢閘道器的區域網路位址，再替換範例位址：

```sh
ip -4 addr show
LAN_IP=192.168.1.1
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
```

寫入 `/etc/honk/config.dae`：

```sh
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

寫入 `/etc/honk/config.d/api.dae`：

```sh
sudo tee /etc/honk/config.d/api.dae > /dev/null <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '/usr/share/doona-web'
    }
}
EOF
sudo cat /etc/honk/config.dae /etc/honk/config.d/api.dae
```

這些是[最小組態](minimal-configuration.md)中的完整 sudo 範例，介面路徑採用 Debian 的安裝位置。輸出的 API 檔案中，`listen` 行必須包含你的位址。主設定檔讓流量直連，並將 honk 附加到預設路由介面。此組態不設定區域網路網橋；需要網橋時，請使用連結頁面中的對應平台組態。

啟動服務前，執行以下命令檢查檔案：

```sh
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

等待輸出 `native API listener ready` 和 `honk-core is running`。在第二個終端中重新設定 `LAN_IP`，再查詢 API：

```sh
LAN_IP=192.168.1.1
curl "http://$LAN_IP:9527/api"
```

原生 API 回應中出現 `setup_required: true`，說明 API 可以存取，且尚未建立管理員。按 Ctrl+C 停止前景程序。

## 3. 啟動服務

按[服務管理](service-management.md)建立 systemd 單元，並執行其中的 `daemon-reload` 命令。然後在閘道器上執行：

```sh
sudo systemctl enable --now honk-core
sudo systemctl status honk-core
```

狀態必須顯示 `active (running)`。再次執行 `curl` 命令，確認服務提供 API。失敗時，請按連結頁面的說明檢視服務日誌。

## 4. 登入

從閘道器或其區域網路裝置開啟 `http://192.168.1.1:9527/ui/`，將位址替換為你的位址。按[首次登入](first-sign-in.md)輸入使用者名稱、密碼和確認密碼，再選擇**建立並登入**。如果管理員已存在，使用該帳戶登入。

登入成功後會開啟活動頁。開啟**系統狀態**，確認狀態顯示**運作中**，引擎為 honk，並列出後端能力。

## 5. 驗證路由

在閘道器上確認請求可以發出：

```sh
curl -I https://example.com
```

curl 必須收到 HTTP 回應。

在 doona 中開啟**規則**，再開啟**追蹤模擬**。選擇 TCP，輸入網域 `example.com` 和目的連接埠 `443`，然後選擇**開始追蹤**。結果必須以 `direct` 結束。

直連流量由核心轉發，因此不會出現在**連線**頁中。連線頁列出由 honk 在使用者空間處理的流量，例如新增代理群組後經由代理群組送出的流量。

你現在已有一份僅直連的基礎組態。接下來可以[新增訂閱](common-tasks.md#subscription)，或在啟用其他控制項前檢視[功能啟用條件](feature-requirements.md)。
