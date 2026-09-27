[English](../en/install.md) · 简体中文 · [繁體中文](../zh-TW/install.md)

# 安装

先安装 honk 并编写配置，再安装 doona 并启动 honk。开始前请确认[系统要求](requirements.md#requirements)。

<a name="install"></a>

## 安装 honk

每个 doona 发行版都附带具备原生 API 的 honk-core 构建，`HONK-SOURCE.txt` 注明构建所用的 honk 提交。请从同一个发行版下载适合网关的归档文件与 `SHA256SUMS`。其他 honk 构建没有原生 API，详见 [honk 版本](requirements.md#honk-version)。v0.1.0-beta.7 及更早的发行版不含 honk，请改从 Glassyiris/honk 的 `debug` 版本下载同名归档文件；每次新的 honk 构建都会替换该版本的文件。

- [doona 发布页](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` 版本](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk 快速入门](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)

| 文件名片段           | 用途                                                              |
| -------------------- | ----------------------------------------------------------------- |
| `x86_64`、`aarch64`  | 网关的 CPU 架构，即 `uname -m` 的输出。                           |
| `unknown-linux-musl` | 静态链接，适用于网关。无法确定时选择此项。                        |
| `unknown-linux-gnu`  | 链接 glibc，适用于常规发行版。                                    |
| 无后缀               | 使用 mimalloc，为默认构建，QUIC 性能更好。                        |
| `-stock` 后缀        | 使用系统内存分配器而非 mimalloc，适用于更重视内存占用的小型设备。 |

```sh
VERSION=0.3.0-beta.1               # the doona release, without v
TARGET=x86_64-unknown-linux-musl   # or aarch64-unknown-linux-musl, -gnu, and a -stock suffix
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/honk-core-debug-$TARGET.tar.gz" -O "$BASE/SHA256SUMS"
sha256sum --ignore-missing -c SHA256SUMS
tar -xzf honk-core-debug-$TARGET.tar.gz
sudo install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
honk-core --version   # prints the tag the build came from, such as debug.2026.9.26.native-api.4
```

如需自行构建 honk，请检出 `HONK-SOURCE.txt` 注明的提交，并启用 `native-api` 特性构建 `honk-core`。

二进制文件已内置 eBPF 对象，无需单独安装该对象。

### 目录与地理数据

创建配置目录与数据目录，然后下载示例规则使用的 geosite 与 geoip 文件。honk 会在 `data_dir` 中查找这两个文件；它们也是 honk 更新地理数据时下载的文件。

```sh
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
sudo curl -fL --retry 3 -o /var/lib/honk/geosite.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat
sudo curl -fL --retry 3 -o /var/lib/honk/geoip.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat
```

### systemd 服务

发布包不含 systemd 单元。请创建 `/etc/systemd/system/honk-core.service`：

```ini
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
```

此时不要启动服务。示例配置从 `/usr/share/doona` 提供 doona，该目录中没有 `index.html` 时 honk 会拒绝启动；启动步骤位于[安装 doona 并启动](#doona)。

请勿添加 `NoNewPrivileges=yes`、能力边界限制或只读 `/proc/sys`，因为启动过程需要 BPF、网络管理、命名空间、挂载与 sysctl 权限。

## 编写配置

按[配置](configuration.md#config)一页编写并安装 `/etc/honk/config.dae` 与 `/etc/honk/config.d/api.dae`，然后继续下一节。

<a name="doona"></a>

## 安装 doona 并启动

同时下载 doona 发布包与 `SHA256SUMS`，再将发布包解压到 `/usr/share/doona`，即 `ui` 指定的目录。最后一条命令必须列出 `index.html`，否则 honk 无法启动。

- [doona 发布页](https://github.com/Zakkaus/doona/releases)

```sh
VERSION=0.3.0-beta.1   # the release you downloaded, without v
sha256sum --ignore-missing -c SHA256SUMS
sudo mkdir -p /usr/share/doona
sudo tar -xzf "doona-${VERSION}.tar.gz" -C /usr/share/doona
# Optional Noto Sans TC and SC fonts:
if [ -f "doona-fonts-${VERSION}.tar.gz" ]; then
    sudo tar -xzf "doona-fonts-${VERSION}.tar.gz" -C /usr/share/doona
fi
ls -l /usr/share/doona/index.html
```

honk 每次请求都从磁盘读取这些文件，因此以后替换文件无需重启。

### 启动 honk

启用并启动服务，然后查看日志：

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now honk-core
sudo systemctl status honk-core
sudo journalctl -u honk-core -e
```

日志出现 `honk-core is running` 即表示启动完成。

### 状态数据库

honk 默认会打开 `<data_dir>/state/honk.db`：`global.store_subscribe` 默认开启，本示例也启用了 `native_api`。状态数据库没有需要添加的开关。该数据库保存管理员账户、地理数据来源以及 honk 需要持久保存的其他状态。honk 会自行创建 `state/` 与 `honk.db`；`/var/lib/honk` 必须存在且 root 可写。

本示例设置了 `password_auth: true`，数据库无法打开时 honk 不会启动，因此 honk 正在运行即表示数据库已打开。Token 模式下 honk 不使用数据库也会启动，并记录一条警告；此时缺少状态数据库表示它未能打开。日志消息的含义见[状态数据库问题](troubleshooting.md#state-db)。

### 首次登录

1. 打开 `http://192.168.1.1:9527/ui/`，即 `listen` 地址。doona 会在同一来源找到 API，并将其保存为后端。
2. 密码模式：登录对话框提供首次设置。请在网关本机或局域网设备上创建管理员，然后登录。
3. Token 模式：输入 `secret` 作为 Token，或打开配对链接。doona 加载后会从地址栏移除 Token。

```text
http://192.168.1.1:9527/ui/#/settings?api=http://192.168.1.1:9527&token=…
```

忘记管理员密码时，先停止 honk，再执行 `sudo honk-core admin reset`；下次启动时会重新进入首次设置。

<a name="other-origin"></a>

### 从其他来源打开 doona

doona 由其他服务器提供时，浏览器会发送跨域请求，honk 只接受 `allow_origins` 中列出的来源与 `allowed_hosts` 中列出的主机。请在设置中填写服务器根地址，例如 `http://192.168.1.1:9527`，不要附加 `/api/v1`。“测试连接”在保存前先检查发现端点，保存后页面会重新加载。

通过 HTTPS 加载的页面无法访问纯 HTTP 的 API，浏览器会将其作为混合内容拦截。请从 honk 的 `/ui/` 打开 doona，或将 honk 置于 TLS 反向代理之后。

任意静态服务器都可以提供解压后的文件，放在网站根目录或 `/ui/` 这类前缀下均可。页面使用 hash 路由（`/ui/#/activity`），不需要重写规则。

反向代理可让 doona 与 honk 同源：将精确路径 `/api`（发现端点）和 `/api/` 下的所有路径转发到 honk 的监听地址，静态文件放在 `/ui/` 下。如果配置了代理路径前缀，两类 API 路径都必须保留该前缀。

### 发行版软件包

目前还没有发行版软件仓库收录 doona。每个发布版本附带 [nfpm](../../install/nfpm) 基于预构建的程序包与字体包生成的 `deb`、`rpm`、`ipk` 与 Arch 软件包，全部与架构无关；`doona-fonts` 是独立的可选软件包。[install/](../../install/README.md) 中 OpenWrt、Alpine、Gentoo 与 Nix 的打包配置是尚未提交的模板，安装的也是同一批发布包。AUR 的 `doona-bin` 位于独立仓库。打包本地构建结果时，可使用 `make install DESTDIR=… PREFIX=/usr` 和 `make install-fonts`。

<a name="operation"></a>

## 日常维护

### 重载与重启

```sh
sudo systemctl reload honk-core    # re-read the configuration
sudo systemctl restart honk-core   # needed for native_api, interfaces, data_dir
sudo journalctl -u honk-core -e    # look for applied or rejected
```

重载会重新读取配置，并在日志中记录 `applied` 或 `rejected`。修改 `native_api`、网卡、TPROXY 设置、`data_dir`、NFQUEUE 开关、DNS 监听或 Clash API 监听后需要重启。doona 的配置页在应用后会自动重载。

### 更新 honk

从较新的 doona 发行版下载 honk-core 归档文件，或从 honk `debug` 版本下载较新的构建，按[安装 honk](#install) 一节安装，然后执行 `sudo systemctl restart honk-core` 并检查 `honk-core --version`。`debug` 标签随每次构建移动，请将版本与 [honk 版本](requirements.md#honk-version)中注明的版本对照。

### 更新 doona

将新版本解压到 `/usr/share/doona`，然后在浏览器中重新加载页面。honk 无需重启。

### 更新地理数据

在设置的地理数据卡片中点击“更新”，honk 会下载并启用两个文件。自动更新默认开启，每 24 小时检查一次；可在同一卡片中关闭或修改间隔。

### 文件位置

| 路径                          | 内容                                 |
| ----------------------------- | ------------------------------------ |
| `/etc/honk/config.dae`        | 主配置文件                           |
| `/etc/honk/config.d/api.dae`  | 原生 API 配置块                      |
| `/var/lib/honk/`              | `data_dir`：地理数据文件与运行时数据 |
| `/var/lib/honk/state/honk.db` | 状态数据库                           |
| `/usr/share/doona/`           | 在 `/ui/` 提供的 doona 文件          |
| `journalctl -u honk-core`     | honk 日志                            |
