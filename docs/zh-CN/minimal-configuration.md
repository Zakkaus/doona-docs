[English](../en/minimal-configuration.md) / 简体中文 / [繁體中文](../zh-TW/minimal-configuration.md)

# 最小配置

用以下两个文件建立全新的 honk 直连配置，并启用标准版界面。先[安装 honk 和 doona](install.md)；首次操作可按[快速开始](quick-start.md)逐步完成，订阅与代理路由的解释见[教程](tutorial.md)。

以下命令会替换 `/etc/honk/config.dae` 与 `/etc/honk/config.d/api.dae`。它们适用于全新配置；已经运行 honk 时，请保留现有配置。

## 1. 设置地址与界面目录

在网关的一个终端中查找局域网地址，并设置变量。替换示例 IP，界面目录应包含已安装的 `index.html`：

```sh
ip -4 addr show
LAN_IP=192.168.1.1
UI_DIR=/usr/share/doona
```

Debian 或 Ubuntu 软件包使用 `UI_DIR=/usr/share/doona-web`。其他安装路径见[安装](install.md#doona)。后续写文件命令都在同一终端执行。

## 2. 写入主配置

选择适用于当前 shell 或平台的标签。sudo 与 root 示例处理网关自身的流量；OpenWrt 示例还会挂载到 `br-lan`，如果局域网桥名称不同，请替换它。

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

接口选择与字段含义见[配置参考](configuration.md)。本例没有代理节点或 DNS 路由规则。

要处理局域网客户端的流量，在 `global` 中添加 `lan_interface`，指定连接这些客户端的接口。主路由使用 LAN 网桥，通常为 `br-lan`；客户端已将主路由作为网关。使用旁路由时，还需将客户端的网关和 DNS 设为旁路由的 LAN 地址，可逐台设置，也可通过主路由的 DHCP 设置下发。

不要假定 `lan_interface: auto` 会选择 LAN：它选择 metric 最低的 IPv4 默认路由所在接口，在主路由上通常是 WAN 接口。

## 3. 写入 API 包含文件

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

输出的文件应包含你的局域网地址与已安装的界面目录。API 配置项见[配置参考](configuration.md)，认证条件见[登录要求](feature-requirements.md#req-sign-in)。使用主机名时，另见[主机名与来源访问](install.md#other-origin)。

## 4. 不挂载 eBPF 检查启动

如果 honk 已运行，先按[服务管理](service-management.md)停止该实例，再启动另一个监听器。在网关终端执行：

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data --mock-ebpf
```

使用 `--mock-ebpf` 时，如果原因是 `the mock eBPF backend was selected`，出现 `NFQUEUE is unavailable at startup; continuing with NFQUEUE staging disabled` 警告属于预期行为。

启动成功不代表每项配置都已使用。解析器会对 `global` 中未知的标量键发出警告并忽略它们；继续操作前，请阅读启动诊断。

等待 `native API listener ready` 和 `honk-core is running`。在第二个终端查询 API，并替换示例 IP：

```sh
curl http://192.168.1.1:9527/api
```

JSON 响应包含 `setup_required: true`，表示 API 可访问且尚未创建管理员。这项检查不能证明实际 eBPF 后端能够启动或路由流量。

在第一个终端按 Ctrl+C。接着按[服务管理](service-management.md)启动实际后端，再[首次登录](first-sign-in.md)。启动失败时，查看[故障排查](troubleshooting.md)。

## 启动检查失败时

| 消息 | 检查方法 |
| --- | --- |
| `native API listener bind failed` | 确认 `listen` 指定的地址属于此网关，且端口未被其他进程占用。 |
| `Subscription HTTP client creation failed`，随后出现 `subscription network startup failed` | 阅读底层 TLS 错误并检查系统 CA 证书库。安装发行版的证书软件包，如 `ca-certificates` 或 OpenWrt 的 `ca-bundle`。 |
| `command not found` 或找不到可执行文件 | 按对应平台的[安装说明](install.md)，核对命令中的 honk-core 路径。 |
