[English](../en/service-management.md) / [简体中文](../zh-CN/service-management.md) / 繁體中文

# 服務管理

本頁以 systemd 或 OpenWrt procd 服務的形式運作 honk：先建立一次服務，再列出啟動、停止、重新啟動、重載 honk 以及檢視日誌的命令。本頁不含 OpenRC 步驟。請先完成[最小組態](minimal-configuration.md)。

doona 的套件都不安裝 honk 服務，honk 的發行封存檔中也沒有服務檔案，因此第 1 步需要自行建立。

| 系統                                                       | 服務管理器 | 使用的分頁              |
| ---------------------------------------------------------- | ---------- | ------------------------- |
| Debian、Ubuntu、Fedora、RHEL、Arch Linux、使用 systemd 的 Gentoo | systemd | 「sudo」或「root」     |
| OpenWrt                                                    | procd      | 「OpenWrt」              |
| 使用 OpenRC 的 Gentoo 或 Alpine                            | OpenRC     | 不在本頁範圍內：見下文 OpenRC 一節 |

## OpenRC

doona 與 honk 都不提供 OpenRC 指令碼。如需完成[首次登入](first-sign-in.md)，用[最小組態](minimal-configuration.md)第 6 步的命令在前景啟動 honk：

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae
```

honk 持續運作，直到按下 Ctrl+C 或關閉終端機，日誌直接輸出到該終端機。honk 不會隨開機啟動。本頁其餘內容只適用於 systemd 與 procd。

## 1. 建立服務

此步只需執行一次。systemd 單元與 honk 快速入門給出的相同；procd 指令碼以 OpenWrt 的路徑啟動同一條命令。

```sh tab="sudo"
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

```sh tab="root"
cat > /etc/systemd/system/honk-core.service <<'EOF'
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
systemctl daemon-reload
```

```sh tab="OpenWrt"
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

不要在單元中加入 `NoNewPrivileges=yes`、能力限制或只讀的 `/proc/sys`：honk 啟動時需要 BPF、網路管理、名稱空間、掛載與 sysctl 權限。

在 OpenWrt 上使用 mimalloc 建置時，請保留上述 procd 指令碼中的 `MIMALLOC_PURGE_DELAY=0`，讓已釋放的記憶體及時歸還系統。使用系統配置器的建置不使用此設定。

## 2. 啟動 honk 並設為開機啟動

```sh tab="sudo"
sudo systemctl enable --now honk-core
```

```sh tab="root"
systemctl enable --now honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core enable
/etc/init.d/honk-core start
```

systemd 輸出 `Created symlink '/etc/systemd/system/multi-user.target.wants/honk-core.service' → '/etc/systemd/system/honk-core.service'.`。honk 報告就緒後，命令才返回。

## 3. 檢查 honk 是否在運作

```sh tab="sudo"
sudo systemctl status honk-core
```

```sh tab="root"
systemctl status honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core status
```

正在運作的 honk 如下所示。Debian 13 上的 systemd：

```text
● honk-core.service - honk transparent proxy engine
     Loaded: loaded (/etc/systemd/system/honk-core.service; enabled; preset: enabled)
     Active: active (running) since …
```

procd 輸出 `running`；停止後輸出 `inactive`。

日誌中也會出現 `honk-core is running. Press Ctrl+C to stop.`；把位址換成你的位址後執行 `curl http://192.168.1.1:9527/api`，返回內容與[最小組態第 5 步](minimal-configuration.md)相同。

API 可存取不代表透明分流正常。請在「系統狀態」檢查資料路徑降級情況，並從區域網路用戶端測試流量。

## 檢視日誌

```sh tab="sudo"
sudo journalctl -u honk-core -e
```

```sh tab="root"
journalctl -u honk-core -e
```

```sh tab="OpenWrt"
logread -e honk-core
```

如需持續顯示新寫入的日誌：

```sh tab="sudo"
sudo journalctl -u honk-core -f
```

```sh tab="root"
journalctl -u honk-core -f
```

```sh tab="OpenWrt"
logread -f -e honk-core
```

按 Ctrl+C 結束。systemd 日誌中也保留了之前幾次啟動的內容，請從最後一行 `starting` 開始閱讀。

## 重載組態

修改 `.dae` 檔案後重載 honk。重載會重新讀取組態，不停止 honk。

```sh tab="sudo"
sudo systemctl reload honk-core
```

```sh tab="root"
systemctl reload honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core reload
```

日誌先顯示 `SIGHUP reload request 1 started`，隨後顯示 `applied`，或顯示 `rejected` 與 `reload rejected: changed fields require process restart fields=[…]`。其中列出的欄位需要重新啟動才能生效，包括 `native_api` 下的全部欄位、`log_level` 與各介面。doona 的「組態」頁儲存後會自動重載。

## 重新啟動

重新啟動會停止 honk 並再次啟動。

```sh tab="sudo"
sudo systemctl restart honk-core
```

```sh tab="root"
systemctl restart honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core restart
```

## 停止

```sh tab="sudo"
sudo systemctl stop honk-core
```

```sh tab="root"
systemctl stop honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core stop
```

honk 保持停止，直到下次啟動或開機。

## 取消開機啟動

```sh tab="sudo"
sudo systemctl disable honk-core
```

```sh tab="root"
systemctl disable honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core disable
```

下一步：[首次登入](first-sign-in.md)。

## 遇到問題時

| 看到的內容                                                              | 原因與處理                                                                                          |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Active: failed` 或 `activating (auto-restart)`                         | honk 在啟動階段結束。日誌中以 `fatal error, shutting down:` 開頭的一行給出原因；常見原因見[最小組態](minimal-configuration.md)。 |
| systemd 找不到 `honk-core.service`                                      | 跳過了第 1 步，或第 1 步之後沒有運作 `systemctl daemon-reload`。                                    |
| 重載時出現 `Error: no running honk-core instance; /run/honk-core.lock does not exist` | honk 沒有運作，或以 `--mock-ebpf` 運作（這種方式不持有鎖）。請啟動服務，而不是重載。 |
| 重載後修改沒有生效                                                      | 日誌中顯示 `reload rejected`。請改為重新啟動。                                                          |

更多錯誤訊息見[疑難排解](troubleshooting.md#troubleshooting)。
