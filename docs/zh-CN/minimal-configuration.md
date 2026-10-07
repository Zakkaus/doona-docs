[English](../en/minimal-configuration.md) / 简体中文 / [繁體中文](../zh-TW/minimal-configuration.md)

# 最小配置

本页编写能启动 honk 并提供 doona 的最小 honk 配置，然后手动启动 honk 检查配置。本页假定 doona 已位于 `/usr/share/doona`，honk-core 也已安装，即[各安装页](install.md)完成后的状态。

> [!NOTE]
> Debian 与 Ubuntu 的软件包名为 `doona-web` 与 `doona-web-fonts`，安装在 `/usr/share/doona-web` 下。请将下文示例中的 `ui: '/usr/share/doona'` 改为 `ui: '/usr/share/doona-web'`。

此示例使用两个文件。`/etc/honk/config.dae` 是主文件。`/etc/honk/config.d/api.dae` 启用 doona 所用的原生 API。在加入节点与规则之前，所有连接都直接发出；更完整的示例见[配置](configuration.md#config)。

## 开始之前

- 网关上的 shell：可使用 sudo 的用户，或 root。在 OpenWrt 上，凡是提供“OpenWrt”标签页的地方都选择它。该标签页的命令以 root 执行，并把 honk 的数据放在 `/etc/honk/data`，因为 OpenWrt 的 `/var` 位于内存中，重启后清空。
- 进入这台机器的第二种途径，例如控制台，供第 6 步使用。honk 正式启动时会改动网关的网络设置。

## 1. 查看网关的局域网地址

局域网设备通过这个地址打开 doona。

```sh
ip -4 addr show
```

找到局域网设备所连接的接口（OpenWrt 上为 `br-lan`），记下 `inet` 后面的地址，不含 `/24`。例如：

```text
    inet 192.168.1.1/24 brd 192.168.1.255 scope global eth0
```

为后续步骤设置该地址：

```sh
LAN_IP=192.168.1.1
```

## 2. 创建目录

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

这些目录只有 root 可以读取，因为配置与状态数据库中保存着凭据。

## 3. 编写主文件

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
| `include { config.d/*.dae }`   | 读取 `/etc/honk/config.d/` 中的每个 `.dae` 文件，路径相对于主文件。第 4 步的 API 文件即在其中。              |
| `wan_interface: auto`          | 把 honk 挂到 IPv4 默认路由所在的接口上，由 honk 处理网关自身的流量。                                         |
| `lan_interface: br-lan`        | 将 honk 挂到 OpenWrt 的局域网桥接接口，处理局域网设备的流量。                                              |
| `data_dir: '/etc/honk/data'`   | 仅用于 OpenWrt。honk 存放地理数据与状态数据库（包括管理员账户）的目录。其他系统使用默认值 `/var/lib/honk`。  |
| `routing { fallback: direct }` | 所有连接都直接发出，不经过代理。节点、分组与规则稍后在 doona 或按[配置](configuration.md#config)一页加入。   |

在 OpenWrt 上，`bootstrap_resolver: '127.0.0.1:53'` 使用 dnsmasq 解析直连下载地址的域名。地理数据地址不得重定向：使用 `raw.githubusercontent.com` 等最终地址，不要使用 GitHub 发布版本的地址。

根据需要处理的流量设置 `lan_interface`：

- 主路由：使用 `br-lan`，客户端已将这台路由器作为网关。
- 旁路由：使用 `br-lan`，并将客户端的网关与 DNS 设为旁路由的局域网地址；可在客户端逐台设置，也可修改主路由的 DHCP 设置。
- 仅处理本机流量：省略 `lan_interface`，与 sudo、root 两个示例相同。

`lan_interface: auto` 选择默认路由所在的接口，在主路由上通常是 WAN。

## 4. 编写 API 文件

该文件使用第 1 步设置的 `LAN_IP`。

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

输出的文件中，`listen` 一行应为你的地址，例如 `listen: '192.168.1.1:9527'`。

使用 `openwrt.lan` 等域名时，须分别在 `allowed_hosts` 中配置主机与端口，在 `allow_origins` 中配置浏览器来源，然后重启 honk。语法与 403 检查步骤见[域名与来源访问](install.md#other-origin)。

| 行                           | 作用                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `experimental { native_api` | 原生 API 配置块，必须位于 `experimental` 之内。                                                                            |
| `enabled: true`             | 启动 API 监听。doona 需要它。                                                                                              |
| `listen: '…:9527'`          | 打开 doona 所用的地址与端口。默认值 `127.0.0.1:9527` 只能从网关本机访问。                                                  |
| `password_auth: true`       | 使用管理员用户名与密码登录。管理员在[首次登录](first-sign-in.md)时创建。启用 API 却没有设置任何登录方式时，honk 拒绝启动。 |
| `config_write: true`        | 允许 doona 编辑配置、节点、订阅、分组与规则。删除此行则 doona 只能读取。                                                   |
| `ui: '/usr/share/doona'`    | 在 `/ui/` 提供 doona 的文件。该目录中没有 `index.html` 时，honk 拒绝启动。                                                 |

每个 `native_api` 字段都要重启后才生效。其余字段见[字段表](configuration.md#config)。

固定的 honk-core 构建嵌入 doona 0.1.0-beta.14，并非独立的 beta.17 界面。要在 `/ui/` 提供嵌入版本，将上面的 `ui` 行改为：

```dae
ui: embedded
```

使用 `ui: embedded` 时，可省略独立 UI 软件包。嵌入版本由 honk 构建固定，不含 Noto Sans TC/SC，浏览器使用系统字体。如需这些字体或新版 doona，安装 `doona` 与 `doona-fonts`，并将 `ui` 指向实际安装目录，例如 `/usr/share/doona`；Debian 或 Ubuntu 使用 `doona-web`、`doona-web-fonts` 与 `/usr/share/doona-web`。

## 5. 检查配置

honk 没有单独的检查命令。用 `--mock-ebpf` 启动一次：honk 会读取并接受整份配置，启动 API 并提供 doona，但不改动网络。

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data --mock-ebpf
```

honk 在前台持续运行。每行以时间戳开头，其中应当包括：

```text
INFO honk_core: honk-core debug.2026.10.6.native-api.1 starting
INFO honk_core: Config: /etc/honk/config.dae
INFO honk_core: Loaded 2 nodes, 0 groups, 0 routing rules
WARN honk_core: NFQUEUE is unavailable at startup; continuing with NFQUEUE staging disabled requested=true reason=the mock eBPF backend was selected
INFO honk_core: Using mock eBPF backend
INFO honk_core: listen=192.168.1.1:9527 native API listener ready
INFO honk_core: honk-core is running. Press Ctrl+C to stop.
```

使用 `--mock-ebpf` 时出现 `WARN` 一行属于正常情况。honk 运行期间，在第二个终端中查询 API，并把 `192.168.1.1` 换成你的地址：

```sh
curl http://192.168.1.1:9527/api
```

API 返回一行内容；`setup_required: true` 表示尚未创建管理员：

```text
{"api_major":1,"auth":{"mode":"password","setup_required":true},"links":{"auth_login":"/api/v1/auth/login","auth_setup":"/api/v1/auth/setup"},"name":"dae/honk-native"}
```

在第一个终端中按 Ctrl+C。honk 输出 `Received SIGINT, shutting down...`，最后输出 `honk-core stopped`。

## 6. 正式启动 honk 一次

这次启动会加载 eBPF 程序并挂到配置的接口上。请准备好进入机器的第二种途径。

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data
```

日志中出现同样的 `native API listener ready` 与 `honk-core is running. Press Ctrl+C to stop.`，但没有 mock 相关的行。按 Ctrl+C 停止 honk；此后由下一页的服务运行 honk。

下一步：[服务管理](service-management.md)。

## 遇到问题时

honk 在以 `fatal error, shutting down:` 开头的行或 `ERROR` 行中给出原因。

| 看到的内容                                                                                | 原因与处理                                                                                                   |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `native API listener bind failed`                                                         | `listen` 地址不属于这台机器。请重做第 1 步与第 4 步。                                                         |
| `failed to inspect native UI index.html: No such file or directory` | 检查 `ui` 实际指向的目录是否包含 `index.html`：Debian 或 Ubuntu 为 `/usr/share/doona-web`，其他平台通常为 `/usr/share/doona`。按对应平台的安装页安装 doona。 |
| `Subscription network owner failed error="subscription HTTP client creation failed"`，随后是 `subscription network startup failed` | 缺少 CA 证书。请安装 `ca-certificates` 软件包（OpenWrt 上为 `ca-bundle`）。 |
| `native API requires a secret, password login, or explicitly anonymous loopback`          | `api.dae` 缺少 `password_auth: true` 一行。                                                                   |
| `native API setting belongs inside native_api { }`                                        | 某个 `native_api` 字段直接写在了 `experimental` 下。请把它移入 `native_api { }`。 |
| `unknown experimental setting`                                                            | `enabled` 直接写在了 `experimental` 下，或这是没有原生 API 的 daeuniverse/honk `main` 分支构建。见 [unknown experimental setting](troubleshooting.md#unknown-setting)。 |
| `command not found`                                                                       | honk-core 不在命令所指的路径上。请重做安装 honk-core 的步骤。                                                 |

启动成功并不代表每个值都符合预期：honk 会接受某些未知的值而不报错。更多报错信息见[故障排查](troubleshooting.md#troubleshooting)。
