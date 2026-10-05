[English](../en/install.md) / 简体中文 / [繁體中文](../zh-TW/install.md)

# 安装详解

先安装 honk 并编写配置，再安装 doona 并启动 honk。开始前确认[系统要求](requirements.md#requirements)，或按[对应系统的安装页](index.md#页面)操作。

> [!NOTE]
> beta.15 命令需要[发布页](https://github.com/Zakkaus/doona/releases)上的对应文件。下载前先确认版本已发布。

<a name="install"></a>

## 安装 honk

每个 doona 发布版本都附带提供原生 API 的 honk-core 构建，构建来自 Glassyiris/honk `feat/native-api` 的 debug 标签。`HONK-SOURCE.txt` 注明构建所用的 honk 提交。请从同一个发行版下载适合网关的归档文件与 `SHA256SUMS`。只有 Glassyiris/honk `feat/native-api` 分支的构建提供原生 API，且须启用 `native-api`；daeuniverse/honk `main` 分支的构建没有原生 API，详见 [honk 版本](requirements.md#honk-version)。

- [doona 发布页](https://github.com/Zakkaus/doona/releases)：下载 honk-core 构建
- [honk 快速入门](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)

| 文件名片段           | 用途                                                              |
| -------------------- | ----------------------------------------------------------------- |
| `x86_64`、`aarch64`  | 网关的 CPU 架构，即 `uname -m` 的输出。                           |
| `unknown-linux-musl` | 静态链接，适用于网关。无法确定时选择此项。                        |
| `unknown-linux-gnu`  | 链接 glibc，适用于常规发行版。                                    |
| 无后缀               | 使用默认内存分配器 mimalloc。                                    |
| `-stock` 后缀        | 使用系统内存分配器，而非 mimalloc。                              |

如需分别下载、校验和安装 honk-core，请先完成[在其他系统上安装](install-manual.md)的第 1 步，再按第 4 至 6 步操作。

```sh
VERSION=0.1.0-beta.15               # the doona release, without v
TARGET=x86_64-unknown-linux-musl   # or aarch64-unknown-linux-musl, -gnu, and a -stock suffix
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/honk-core-debug-$TARGET.tar.gz" -O "$BASE/SHA256SUMS"
grep " honk-core-debug-$TARGET.tar.gz\$" SHA256SUMS | sha256sum -c -
tar -xzf honk-core-debug-$TARGET.tar.gz
sudo install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
honk-core --version   # prints the tag the build came from, such as debug.2026.10.3.native-api.2
```

如需自行构建 honk，请检出 `HONK-SOURCE.txt` 注明的提交，按 honk 快速入门的步骤构建：先构建 eBPF 对象，再执行 `cargo build --release -p honk-core --features ebpf,native-api`。`native-api` 需要显式启用，发布构建已包含此功能；未启用 `ebpf` 时 honk 没有数据路径。发布页同时附有该提交的源码包 `honk-source-<commit>.tar.gz`。

二进制文件已内置 eBPF 对象，无需单独安装该对象。

<a name="directories-and-geodata"></a>

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

设置 `ui: embedded` 时，honk 提供二进制文件中内置的 doona，而非此处安装的文件。当前固定的 honk 构建内置 doona 0.1.0-beta.12。如需提供 beta.15，请设置 `ui: /usr/share/doona` 并按下文安装发布文件，详见[最小配置](minimal-configuration.md)。

同时下载 doona 发布包与 `SHA256SUMS`，再将发布包解压到 `/usr/share/doona`，即 `ui` 指定的目录。最后一条命令必须列出 `index.html`，否则 honk 无法启动。

- [doona 发布页](https://github.com/Zakkaus/doona/releases)

如需逐步下载、校验并解压程序与可选字体，请按[在其他系统上安装](install-manual.md)的第 1 至 3 步操作。

```sh
VERSION=0.1.0-beta.15   # the doona release, without v
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/doona-fonts-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep -E " doona(-fonts)?-${VERSION}\.tar\.gz\$" SHA256SUMS | sha256sum -c -
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

honk 默认会打开 `<data_dir>/state/honk.db`：`global.store_subscribe` 默认开启，本示例也启用了 `native_api`。状态数据库没有需要添加的开关。该数据库保存管理员账户、地理数据来源以及 honk 需要持久保存的其他状态。honk 会自行创建 `state/` 与 `honk.db`，`/var/lib/honk` 不存在时也由 honk 创建。运行 honk 的用户必须能在 `/var/lib` 中创建该目录，并能写入该目录；本示例中该用户为 root。

本示例设置了 `password_auth: true`，数据库无法打开时 honk 不会启动。Token 模式下，数据库不可用、路径不安全或被管理员重置锁定时，honk 可在没有持久存储的情况下启动，并记录警告。数据库属于其他应用、结构版本过新或已被另一个 honk 进程使用时，仍会阻止启动。日志消息的含义见[状态数据库问题](troubleshooting.md#state-db)。

### 首次登录

1. 打开 `http://192.168.1.1:9527/ui/`，即 `listen` 地址。doona 会在同一来源找到 API，并将其保存为后端。
2. 密码模式：登录页面显示“创建管理员”。请在网关本机或局域网设备上填写用户名、密码与确认密码，再点击“创建并登录”。创建账户后会自动登录。
3. Token 模式：输入 `secret` 作为 Token，或打开配对链接。doona 加载后会从地址栏移除 Token。

```text
http://192.168.1.1:9527/ui/#/settings?api=http://192.168.1.1:9527&token=…
```

忘记管理员密码时，先停止 honk，再执行 `sudo /usr/local/bin/honk-core admin reset`（在 root shell 中去掉 `sudo`；OpenWrt 上执行 `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`）；下次启动时会重新进入首次设置。

<a name="other-origin"></a>

### 从其他来源打开 doona

doona 由其他服务器提供时，浏览器会发送跨域请求，honk 只接受 `allow_origins` 中列出的来源与 `allowed_hosts` 中列出的主机。请在设置中填写服务器根地址，例如 `http://192.168.1.1:9527`，不要附加 `/api/v1`。“测试连接”在保存前先检查发现端点，保存后页面会重新加载。

通过 HTTPS 加载的页面无法访问纯 HTTP 的 API，浏览器会将其作为混合内容拦截。请从 honk 的 `/ui/` 打开 doona，或将 honk 置于 TLS 反向代理之后。

任意静态服务器都可以提供解压后的文件，放在网站根目录或 `/ui/` 这类前缀下均可。页面使用 hash 路由（`/ui/#/activity`），不需要重写规则。

反向代理可让 doona 与 honk 同源：将精确路径 `/api`（发现端点）和 `/api/` 下的所有路径转发到 honk 的监听地址，静态文件放在 `/ui/` 下。如果配置了代理路径前缀，两类 API 路径都必须保留该前缀。

### 发行版软件包

发布版本提供与架构无关的 `deb`、`rpm`、Arch、OpenWrt 24.10 `ipk`、OpenWrt 25.12 `apk` 与 Alpine `apk` 软件包。安装步骤见 [Debian 或 Ubuntu](install-debian.md)、[Fedora 或 RHEL](install-fedora.md)、[Arch](install-arch.md)、[OpenWrt](install-openwrt.md#openwrt-packages) 或 [Alpine](install-manual.md#install-alpine)。OpenWrt 签名 apk 索引，Alpine 签名每个 apk 软件包，两者的文件与公钥不能混用。

`doona-fonts` 加入可选的 Noto Sans TC 与 SC 字体。未安装时界面使用后备字体，不会请求缺失的字体文件。`doona-precompressed` 在原文件旁加入文本资源的 `.br` 与 `.gz` 副本，让服务器发送预压缩响应。它需要相同版本的主软件包，约占 1.6 MB 存储空间；不安装时主软件包保持不变。手动安装时，将 `doona-precompressed-<version>.tar.gz` 解压到 doona 目录。

[OpenWrt、Alpine、Gentoo 与 Nix 的打包配置](https://github.com/Zakkaus/doona/blob/main/install/README.md)尚未进入各发行版仓库。[在 Gentoo 上安装](install-gentoo.md)使用 ebuild；AUR 的 `doona-bin` 位于独立仓库。本地打包可使用 `make install DESTDIR=… PREFIX=/usr` 与 `make install-fonts`。

Debian 与 Ubuntu 的软件包名为 `doona-web`，安装目录为 `/usr/share/doona-web`，可选软件包为 `doona-web-fonts` 与 `doona-web-precompressed`。其他格式安装到 `/usr/share/doona`。

<a name="operation"></a>

## 日常维护

<a name="reload-and-restart"></a>

### 重载与重启

```sh
sudo systemctl reload honk-core    # re-read the configuration
sudo systemctl restart honk-core   # needed for native_api, interfaces, data_dir
sudo journalctl -u honk-core -e    # look for applied or rejected
```

重载会重新读取配置，并在日志中记录 `applied` 或 `rejected`。honk 会拒绝修改需要重启的设置，并在日志中列出字段，包括 `native_api`、网卡、TPROXY 设置、`data_dir`、`log_level`、`log_file`、`check_interval`、`tcp_check_url`、`tcp_check_http_method`、`udp_check_dns`、`store_subscribe`、`nfqueue_enable`、`dns.bind`、Clash API 设置、`auto_config_kernel_parameter`、`pprof_port`、`so_mark_from_dae` 与 `experimental.cache_file`。将 `tls_implementation` 改为 `utls` 或从 `utls` 改为其他值也需要重启。

配置页会自动应用可重载的修改。若修改需要重启，API 会在写入前拒绝，doona 会列出相关设置与重启命令。请在主机上编辑这些设置，再重启 honk。

### 更新 honk

从较新的 [doona 发布版本](https://github.com/Zakkaus/doona/releases)下载 honk-core 归档文件，按[安装 honk](#install) 一节安装，然后执行 `sudo systemctl restart honk-core` 并检查 `honk-core --version`。请将版本与 [honk 版本](requirements.md#honk-version)中注明的版本对照。

### 更新 doona

将新版本解压到 `/usr/share/doona`，然后在浏览器中重新加载页面。honk 无需重启。

### 更新地理数据

在设置 → 地理数据中点击“立即更新”，honk 会更新已加载的文件并启用有变化的内容。软件包文件的替换文件会写入 `data_dir`。此操作不能安装缺少的文件；请按[目录与地理数据](#directories-and-geodata)下载，再重启 honk。内容相同的文件不会重写；所有内容均未变化时，更新成功但不激活或重载。自动更新默认开启，每 24 小时检查一次；可在同一卡片中关闭或修改“更新间隔（小时）”。“重置为默认值”会先要求确认，再移除所有地理数据覆盖及取自配置文件的值，恢复内置来源与默认值。该卡片也列出已安装的地理数据文件。

### 文件位置

| 路径                          | 内容                                 |
| ----------------------------- | ------------------------------------ |
| `/etc/honk/config.dae`        | 主配置文件                           |
| `/etc/honk/config.d/api.dae`  | 原生 API 配置块                      |
| `/var/lib/honk/`              | `data_dir`：地理数据文件与运行时数据 |
| `/var/lib/honk/state/honk.db` | 状态数据库                           |
| `/usr/share/doona/`           | 在 `/ui/` 提供的 doona 文件          |
| `journalctl -u honk-core`     | honk 日志                            |
