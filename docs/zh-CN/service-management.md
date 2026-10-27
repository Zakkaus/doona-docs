[繁體中文](../zh-TW/service-management.md) / 简体中文 / [English](../en/service-management.md)

# 服务管理

创建 systemd 或 OpenWrt procd 的 honk 服务，再按本页管理服务和查看日志。先完成[快速开始](quick-start.md)或[最小配置](minimal-configuration.md)中的配置检查，并停止前台测试进程。

## 1. 创建服务

选择当前服务管理器对应的部分。已有 honk 服务时，替换前先检查可执行文件与配置路径。以下示例使用本站安装指南中的路径。

### systemd

在网关上执行。使用 root shell 时省略 `sudo`。此单元使用 `/usr/local/bin/honk-core` 和 `/etc/honk/config.dae`。

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

此单元依据 [honk 的 systemd 示例](https://github.com/daeuniverse/honk/blob/main/doc/en/how-to-start.md#run-with-systemd)。为服务添加权限限制前，先检查该指南。

### OpenWrt procd

在路由器上以 root 执行。此脚本使用 `/usr/bin/honk-core`，以及 [OpenWrt 安装](install-openwrt.md#install-geodata)中准备的数据目录。

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

`MIMALLOC_PURGE_DELAY=0` 要求 mimalloc 立即回收释放的内存页。说明见 [honk CLI 参考](https://github.com/daeuniverse/honk/blob/main/doc/en/reference/cli.md)。

## 2. 启用并启动 honk

```sh tab="systemd"
sudo systemctl enable --now honk-core
sudo systemctl status honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core enable
/etc/init.d/honk-core start
/etc/init.d/honk-core status
```

systemd 状态应显示 `active (running)`；OpenWrt 状态应显示 `running`。重复[快速开始](quick-start.md)中的 API 检查，确认监听地址可以访问。

## 查看日志

```sh tab="systemd"
sudo journalctl -u honk-core -e
```

```sh tab="OpenWrt"
logread -e honk-core
```

持续查看新消息时，systemd 使用 `sudo journalctl -u honk-core -f`，OpenWrt 使用 `logread -f -e honk-core`。按 Ctrl+C 停止跟踪。启动失败时，根据日志中的错误查阅[故障排查](troubleshooting.md#troubleshooting)。

journal 包含历次服务运行的日志。排查本次启动时，从最新的 `honk-core … starting` 消息开始查看；该消息也会显示引擎版本。

## 重新加载、重启或停止

选择重新加载或重启前，先查[doona 可以更改什么](what-doona-can-change.md)。执行后查看日志，确认结果。

| 操作 | systemd | OpenWrt |
| --- | --- | --- |
| 启动 | `sudo systemctl start honk-core` | `/etc/init.d/honk-core start` |
| 重新加载配置 | `sudo systemctl reload honk-core` | `/etc/init.d/honk-core reload` |
| 重启 | `sudo systemctl restart honk-core` | `/etc/init.d/honk-core restart` |
| 停止 | `sudo systemctl stop honk-core` | `/etc/init.d/honk-core stop` |
| 禁用开机启动 | `sudo systemctl disable honk-core` | `/etc/init.d/honk-core disable` |

禁用开机启动不会停止正在运行的服务。如需让 honk 在重启后仍保持停止状态，执行停止和禁用两项操作。

## 服务与重新加载故障

| 现象或日志消息 | 含义与处理方法 |
| --- | --- |
| systemd 找不到 `honk-core.service` | 按第 1 步创建 unit 并执行 `sudo systemctl daemon-reload`，再按第 2 步启动。 |
| 重新加载时报 `no running honk-core instance` | 没有实际实例持有进程锁。使用 `--mock-ebpf` 的前台进程不会持有该锁；按第 2 步启动要使用的实际服务。 |
| `SIGHUP reload applied` | 新配置已应用。 |
| `SIGHUP reload rejected` | 结合 `stage` 和同时出现的错误，判断新配置是否已应用；若被拒绝是因为需要重启，在主机上编辑列出的设置后[重启 honk](what-doona-can-change.md)。 |
| `SIGHUP reload committed with degraded datapath` | 配置已提交，但数据路径已降级。先检查同时出现的错误，再判断服务是否正常。 |

重新加载命令成功退出，不代表新配置已经应用；必须查看服务日志中的结果。

## OpenRC 或前台测试

本页不提供 OpenRC 服务脚本。配置 honk 后，可在终端中启动它，完成首次登录：

```sh
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae
```

保持终端打开，并按[快速开始](quick-start.md)中的浏览器步骤操作。日志显示在终端中，Ctrl+C 停止 honk。此命令不会启用开机启动。
