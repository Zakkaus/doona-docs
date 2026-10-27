[繁體中文](../zh-TW/quick-start.md) / 简体中文 / [English](../en/quick-start.md)

# 快速入门

使用仅直连的 honk 配置启动 doona 标准版，登录后验证网关本机的流量。你需要一台 Debian 或 Ubuntu 网关、sudo 权限，以及控制台等备用访问方式。

## 1. 安装 doona 和兼容的 honk 构建

按[在 Debian 或 Ubuntu 上安装](install-debian.md)安装 `doona-web` 软件包和 honk-core。选择后端前，先查看 [honk 版本](requirements.md#honk-version)：doona 需要原生 API。

其他平台：

- Fedora 或 RHEL：[安装说明](install-fedora.md)。
- Arch Linux：[安装说明](install-arch.md)。
- Gentoo：[安装说明](install-gentoo.md)。
- OpenWrt：[安装说明](install-openwrt.md)。
- Alpine 或其他发行版：[手动安装](install-manual.md)。

在 Debian 网关上执行：

```sh
/usr/local/bin/honk-core --version
ls -l /usr/share/doona-web/index.html
```

第一条命令输出 honk 的构建信息。第二条必须列出已安装界面的 `index.html`。

## 2. 写入最小配置

在网关的同一个终端中执行以下命令。用 `ip -4 addr show` 查找网关的局域网地址，再替换示例地址：

```sh
ip -4 addr show
LAN_IP=192.168.1.1
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
```

写入 `/etc/honk/config.dae`：

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

写入 `/etc/honk/config.d/api.dae`：

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

这些是[最小配置](minimal-configuration.md)中的完整 sudo 示例，界面路径采用 Debian 的安装位置。输出的 API 文件中，`listen` 行必须包含你的地址。主文件让流量直连，并将 honk 附加到默认路由接口。此配置不设置局域网网桥；需要网桥时，请使用链接页面中的对应平台配置。

启动服务前，执行以下命令检查文件：

```sh
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

等待输出 `native API listener ready` 和 `honk-core is running`。在第二个终端中重新设置 `LAN_IP`，再查询 API：

```sh
LAN_IP=192.168.1.1
curl "http://$LAN_IP:9527/api"
```

原生 API 响应中出现 `setup_required: true`，说明 API 可以访问，且尚未创建管理员。按 Ctrl+C 停止前台进程。

## 3. 启动服务

按[服务管理](service-management.md)创建 systemd 单元，并执行其中的 `daemon-reload` 命令。然后在网关上执行：

```sh
sudo systemctl enable --now honk-core
sudo systemctl status honk-core
```

状态必须显示 `active (running)`。再次执行 `curl` 命令，确认服务提供 API。失败时，请按链接页面的说明查看服务日志。

## 4. 登录

从网关或其局域网设备打开 `http://192.168.1.1:9527/ui/`，将地址替换为你的地址。按[首次登录](first-sign-in.md)输入用户名、密码和确认密码，再选择**创建并登录**。如果管理员已存在，使用该账户登录。

登录成功后会打开活动页。打开**系统状态**，确认状态显示**运行中**，引擎为 honk，并列出后端能力。

## 5. 验证路由

在网关上确认请求可以发出：

```sh
curl -I https://example.com
```

curl 必须收到 HTTP 响应。

在 doona 中打开**规则**，再打开**追踪模拟**。选择 TCP，输入域名 `example.com` 和目标端口 `443`，然后选择**开始追踪**。结果必须以 `direct` 结束。

直连流量由内核转发，因此不会出现在**连接**页中。连接页列出由 honk 在用户空间处理的流量，例如添加代理组后经由代理组发出的流量。

你现在已有一份仅直连的基础配置。接下来可以[添加订阅](common-tasks.md#subscription)，或在启用其他控制项前查看[功能启用条件](feature-requirements.md)。
