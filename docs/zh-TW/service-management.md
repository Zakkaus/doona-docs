繁體中文 / [简体中文](../zh-CN/service-management.md) / [English](../en/service-management.md)

# 服務管理

建立 systemd 或 OpenWrt procd 的 honk 服務，再依本頁管理服務和查看日誌。先完成[快速開始](quick-start.md)或[最小設定](minimal-configuration.md)中的設定檢查，並停止前景測試程序。

## 1. 建立服務

選擇目前服務管理員對應的部分。已有 honk 服務時，替換前先檢查執行檔與設定路徑。以下範例使用本站安裝指南中的路徑。

### systemd

在閘道器上執行。使用 root shell 時省略 `sudo`。此單元使用 `/usr/local/bin/honk-core` 和 `/etc/honk/config.dae`。

```sh
sudo install -d -m 0700 /var/lib/honk
sudo tee /etc/systemd/system/honk-core.service > /dev/null <<'EOF'
[Unit]
Description=honk transparent proxy engine
Wants=network-online.target
After=network-online.target

[Service]
Type=notify
User=root
WorkingDirectory=/var/lib/honk
ExecStart=/usr/local/bin/honk-core --config /etc/honk/config.dae --disable-timestamp
ExecReload=/usr/local/bin/honk-core reload
Restart=on-failure
RestartSec=2s
TimeoutStopSec=30s
LimitNOFILE=1048576
LimitMEMLOCK=infinity
UMask=0077

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
```

此單元依據 [honk 的 systemd 範例](https://github.com/daeuniverse/honk/blob/main/doc/en/how-to-start.md#run-with-systemd)。為服務新增權限限制前，先檢查該指南。

### OpenWrt procd

在路由器上以 root 執行。此指令稿使用 `/usr/bin/honk-core`，以及 [OpenWrt 安裝](install-openwrt.md#install-geodata)中準備的資料目錄。

```sh
cat > /etc/init.d/honk-core <<'EOF'
#!/bin/sh /etc/rc.common

START=99
STOP=10
USE_PROCD=1

start_service() {
    procd_open_instance
    procd_set_param command /usr/bin/honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data --disable-timestamp
    procd_set_param limits nofile="1048576 1048576"
    procd_set_param env MIMALLOC_PURGE_DELAY=0
    procd_set_param respawn
    procd_set_param stdout 1
    procd_set_param stderr 1
    procd_close_instance
}

reload_service() {
    /usr/bin/honk-core reload
}
EOF
chmod 0755 /etc/init.d/honk-core
```

`MIMALLOC_PURGE_DELAY=0` 要求 mimalloc 立即回收釋放的記憶體頁。說明見 [honk CLI 參考](https://github.com/daeuniverse/honk/blob/main/doc/en/reference/cli.md)。

## 2. 啟用並啟動 honk

```sh tab="systemd"
sudo systemctl enable --now honk-core
sudo systemctl status honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core enable
/etc/init.d/honk-core start
/etc/init.d/honk-core status
```

systemd 狀態應顯示 `active (running)`；OpenWrt 狀態應顯示 `running`。重複[快速開始](quick-start.md)中的 API 檢查，確認監聽位址可以存取。

## 查看日誌

```sh tab="systemd"
sudo journalctl -u honk-core -e
```

```sh tab="OpenWrt"
logread -e honk-core
```

持續查看新訊息時，systemd 使用 `sudo journalctl -u honk-core -f`，OpenWrt 使用 `logread -f -e honk-core`。按 Ctrl+C 停止追蹤。啟動失敗時，依據日誌中的錯誤查閱[疑難排解](troubleshooting.md#troubleshooting)。

journal 包含歷次服務運作的日誌。排查本次啟動時，從最新的 `honk-core … starting` 訊息開始查看；該訊息也會顯示引擎版本。

## 重新載入、重新啟動或停止

選擇重新載入或重新啟動前，先查[doona 可以變更什麼](what-doona-can-change.md)。執行後查看日誌，確認結果。

| 操作 | systemd | OpenWrt |
| --- | --- | --- |
| 啟動 | `sudo systemctl start honk-core` | `/etc/init.d/honk-core start` |
| 重新載入設定 | `sudo systemctl reload honk-core` | `/etc/init.d/honk-core reload` |
| 重新啟動 | `sudo systemctl restart honk-core` | `/etc/init.d/honk-core restart` |
| 停止 | `sudo systemctl stop honk-core` | `/etc/init.d/honk-core stop` |
| 停用開機啟動 | `sudo systemctl disable honk-core` | `/etc/init.d/honk-core disable` |

停用開機啟動不會停止正在執行的服務。如需讓 honk 在重新開機後仍保持停止狀態，執行停止和停用兩項操作。

## 服務與重新載入故障

| 現象或日誌訊息 | 含義與處理方式 |
| --- | --- |
| systemd 找不到 `honk-core.service` | 依照第 1 步建立 unit 並執行 `sudo systemctl daemon-reload`，再依照第 2 步啟動。 |
| 重新載入時報錯 `no running honk-core instance` | 沒有實際執行個體持有行程鎖。使用 `--mock-ebpf` 的前景行程不會持有該鎖；依照第 2 步啟動要使用的實際服務。 |
| `SIGHUP reload applied` | 新設定已套用。 |
| `SIGHUP reload rejected` | 結合 `stage` 和同時出現的錯誤，判斷新設定是否已套用；若被拒絕是因為需要重新啟動，在主機上編輯列出的設定後[重新啟動 honk](what-doona-can-change.md)。 |
| `SIGHUP reload committed with degraded datapath` | 設定已提交，但資料路徑已降級。先檢查同時出現的錯誤，再判斷服務是否正常。 |

重新載入命令成功結束，不代表新設定已經套用；必須查看服務日誌中的結果。

## OpenRC 或前景測試

本頁不提供 OpenRC 服務指令稿。設定 honk 後，可在終端機中啟動它，完成首次登入：

```sh
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae
```

保持終端機開啟，並依照[快速開始](quick-start.md)中的瀏覽器步驟操作。日誌顯示在終端機中，Ctrl+C 停止 honk。此命令不會啟用開機啟動。
