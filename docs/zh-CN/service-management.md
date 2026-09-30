[English](../en/service-management.md) / 简体中文 / [繁體中文](../zh-TW/service-management.md)

# 服务管理

本页把 honk 作为 systemd 或 OpenWrt procd 服务运行：先创建一次服务，再列出启动、停止、重启、重载 honk 以及查看日志的命令。本页不含 OpenRC 步骤。请先完成[最小配置](minimal-configuration.md)。

doona 的软件包都不安装 honk 服务，honk 的发行归档文件中也没有服务文件，因此第 1 步需要自行创建。

| 系统                                                       | 服务管理器 | 使用的标签页              |
| ---------------------------------------------------------- | ---------- | ------------------------- |
| Debian、Ubuntu、Fedora、RHEL、Arch Linux、使用 systemd 的 Gentoo | systemd | “sudo”或“root”     |
| OpenWrt                                                    | procd      | “OpenWrt”              |
| 使用 OpenRC 的 Gentoo 或 Alpine                            | OpenRC     | 不在本页范围内：见下文 OpenRC 一节 |

## OpenRC

doona 与 honk 都不提供 OpenRC 脚本。如需完成[首次登录](first-sign-in.md)，用[最小配置](minimal-configuration.md)第 6 步的命令在前台启动 honk：

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae
```

honk 持续运行，直到按下 Ctrl+C 或关闭终端，日志直接输出到该终端。honk 不会随开机启动。本页其余内容只适用于 systemd 与 procd。

## 1. 创建服务

此步只需执行一次。systemd 单元与 honk 快速入门给出的相同；procd 脚本以 OpenWrt 的路径启动同一条命令。

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

不要在单元中加入 `NoNewPrivileges=yes`、能力限制或只读的 `/proc/sys`：honk 启动时需要 BPF、网络管理、命名空间、挂载与 sysctl 权限。

在 OpenWrt 上，请保留上述 procd 脚本中的 `MIMALLOC_PURGE_DELAY=0`，让 mimalloc 立即将已释放的内存归还给系统。此建议也适用于 `debug.2026.9.28.native-api.4` 及之后将 geodata 更新流式写入磁盘的构建：在 256 MB 路由器上，这类构建未设置时，geodata 更新后仍占用约 120 MB；设置后连续三次更新稳定在 36–46 MB。

## 2. 启动 honk 并设为开机启动

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

systemd 输出 `Created symlink '/etc/systemd/system/multi-user.target.wants/honk-core.service' → '/etc/systemd/system/honk-core.service'.`。honk 报告就绪后，命令才返回。

## 3. 检查 honk 是否在运行

```sh tab="sudo"
sudo systemctl status honk-core
```

```sh tab="root"
systemctl status honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core status
```

正在运行的 honk 如下所示。Debian 13 上的 systemd：

```text
● honk-core.service - honk transparent proxy engine
     Loaded: loaded (/etc/systemd/system/honk-core.service; enabled; preset: enabled)
     Active: active (running) since …
```

procd 输出 `running`；停止后输出 `inactive`。

日志中也会出现 `honk-core is running. Press Ctrl+C to stop.`；把地址换成你的地址后执行 `curl http://192.168.1.1:9527/api`，返回内容与[最小配置第 5 步](minimal-configuration.md)相同。

## 查看日志

```sh tab="sudo"
sudo journalctl -u honk-core -e
```

```sh tab="root"
journalctl -u honk-core -e
```

```sh tab="OpenWrt"
logread -e honk-core
```

如需持续显示新写入的日志：

```sh tab="sudo"
sudo journalctl -u honk-core -f
```

```sh tab="root"
journalctl -u honk-core -f
```

```sh tab="OpenWrt"
logread -f -e honk-core
```

按 Ctrl+C 结束。systemd 日志中也保留了之前几次启动的内容，请从最后一行 `starting` 开始阅读。

## 重载配置

修改 `.dae` 文件后重载 honk。重载会重新读取配置，不停止 honk。

```sh tab="sudo"
sudo systemctl reload honk-core
```

```sh tab="root"
systemctl reload honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core reload
```

日志先显示 `SIGHUP reload request 1 started`，随后显示 `applied`，或显示 `rejected` 与 `reload rejected: changed fields require process restart fields=[…]`。其中列出的字段需要重启才能生效，包括 `native_api` 下的全部字段、`log_level` 与各接口。doona 的“配置”页保存后会自动重载。

## 重启

重启会停止 honk 并再次启动。

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

honk 保持停止，直到下次启动或开机。

## 取消开机启动

```sh tab="sudo"
sudo systemctl disable honk-core
```

```sh tab="root"
systemctl disable honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core disable
```

下一步：[首次登录](first-sign-in.md)。

## 遇到问题时

| 看到的内容                                                              | 原因与处理                                                                                          |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Active: failed` 或 `activating (auto-restart)`                         | honk 在启动阶段退出。日志中以 `fatal error, shutting down:` 开头的一行给出原因；常见原因见[最小配置](minimal-configuration.md)。 |
| systemd 找不到 `honk-core.service`                                      | 跳过了第 1 步，或第 1 步之后没有执行 `systemctl daemon-reload`。                                    |
| 重载时出现 `Error: no running honk-core instance; /run/honk-core.lock does not exist` | honk 没有运行，或以 `--mock-ebpf` 运行（这种方式不持有锁）。请启动服务，而不是重载。 |
| 重载后修改没有生效                                                      | 日志中显示 `reload rejected`。请改为重启。                                                          |

更多报错信息见[故障排查](troubleshooting.md#troubleshooting)。
