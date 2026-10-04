[English](../en/install-openwrt.md) / 简体中文 / [繁體中文](../zh-TW/install-openwrt.md)

# 在 OpenWrt 上安装

在 OpenWrt 25.12 上，从发布软件包或归档安装 doona，并从同一个发布版本安装 honk-core。之后继续阅读[最小配置](minimal-configuration.md)。

> [!NOTE]
> beta.14 命令需要[发布页](https://github.com/Zakkaus/doona/releases)上的对应文件。下载前先确认版本已发布。

OpenWrt 25.12 使用 apk-tools 3；24.10 及更早版本使用 opkg 与 `.ipk` 文件。Alpine 的 apk 软件包不能用于 OpenWrt。官方 24.10 使用 Linux 6.6，低于 honk 要求的 6.12。

## 开始之前

- OpenWrt 25.12 或更高版本（内核为 Linux 6.12），以及[系统要求](requirements.md#requirements)列出的内核选项。用 `uname -r` 查看内核版本。
- 路由器上的 root shell，例如 `ssh root@192.168.1.1`。OpenWrt 没有 sudo，所有命令都以 root 身份执行。
- `/` 上须有足够空间存放 honk-core、解压后的 doona 文件、地理数据与状态数据库。`/tmp` 须能同时存放下载文件与解压后的 honk-core 归档内容。用 `df -h / /tmp` 检查；大小随构建与地理数据来源变化。
- 从 `debug.2026.9.28.native-api.4` 起，包括 doona beta.10 及之后附带的 honk 构建，geodata 更新会流式写入磁盘，并使用 inactivity timeout。请保留 [procd 服务](service-management.md)中的 `MIMALLOC_PURGE_DELAY=0`，让 mimalloc 在更新后将已释放的内存归还给系统。
- 能够访问 github.com。
- 所有步骤都在同一个 shell 中执行：后面的步骤会用到前面设置的 `VERSION`、`BASE` 与 `TARGET` 变量。

安装 honk 前先安装内核模块。缺少 `kmod-veth` 时 honk 无法启动。缺少 `kmod-nft-queue` 时，honk 会停用 NFQUEUE staging，只在启动日志中留下一条警告。`kmod-sched-core` 提供入站调度器。

```sh
apk add kmod-veth kmod-nft-queue kmod-sched-core
```

仍使用 `opkg` 的固件（如 iStoreOS）用以下命令安装相同模块：

```sh
opkg update && opkg install kmod-veth kmod-nft-queue kmod-sched-core
```

官方 OpenWrt 24.10 及更早版本的内核低于 6.12，请先用 `uname -r` 对照[系统要求](requirements.md#requirements)确认内核版本。

<a name="openwrt-packages"></a>

## 软件包安装方式

在 root shell 中把软件包下载到 `/tmp/doona`，选择适合当前软件包管理器的命令。两种方式都将网页文件安装到 `/usr/share/doona`。

OpenWrt 25.12 只签名索引，不签名单个软件包。将 `doona-openwrt.adb` 与软件包放在同一目录，安装公钥后通过索引安装：

```sh
apk update
apk add curl ca-bundle
mkdir -p /tmp/doona
cd /tmp/doona
VERSION=0.1.0-beta.14
APKVER=0.1.0_beta14
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${APKVER}-r1.apk" \
  -O "$BASE/doona-precompressed-${APKVER}-r1.apk" \
  -O "$BASE/doona-openwrt.adb" -O "$BASE/doona-openwrt.pem" -O "$BASE/SHA256SUMS"
grep -E " (doona(-precompressed)?-${APKVER}-r1.apk|doona-openwrt.adb|doona-openwrt.pem)\$" SHA256SUMS | sha256sum -c -
cp doona-openwrt.pem /etc/apk/keys/
apk add -X /tmp/doona/doona-openwrt.adb doona doona-precompressed
ls -l /usr/share/doona/index.html
```

OpenWrt 24.10 及更早版本使用 ipk 软件包。honk 仍要求内核至少为 6.12，此方式需要符合要求的固件：

```sh
opkg update
opkg install curl ca-bundle
mkdir -p /tmp/doona
cd /tmp/doona
VERSION=0.1.0-beta.14
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona_${VERSION}-1_all.ipk" \
  -O "$BASE/doona-precompressed_${VERSION}-1_all.ipk" -O "$BASE/SHA256SUMS"
grep -E " doona(-precompressed)?_${VERSION}-1_all.ipk\$" SHA256SUMS | sha256sum -c -
opkg install doona_${VERSION}-1_all.ipk doona-precompressed_${VERSION}-1_all.ipk
ls -l /usr/share/doona/index.html
```

`ls` 须列出 `/usr/share/doona/index.html`。可选的 `doona-precompressed` 加入 `.br` 与 `.gz` 副本供服务器发送预压缩响应，约占 1.6 MB 存储空间，不需要时可省略。`doona-fonts` 也是可选软件包。每次发布都提供新签名公钥。没有 OpenWrt 公钥与索引时，直接安装 apk 须用 `apk add --allow-untrusted ./doona-${APKVER}-r1.apk`。

安装软件包后，从[第 5 步](#5-选择-honk-core-构建)继续安装 honk-core。下方第 1–4 步是归档安装方式。

## 1. 安装 curl 与 CA 证书

honk 使用系统 CA 证书校验通过 HTTPS 下载的订阅与地理数据。安装 curl 与 `ca-bundle`：

```sh
apk update
apk add curl ca-bundle
```

## 2. 下载 doona

在 `/tmp` 中操作。`/tmp` 位于内存中，重启后清空。设置发布版本号，然后下载归档文件与校验和文件。

```sh
cd /tmp
VERSION=0.1.0-beta.14
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 3. 校验下载的文件

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

应当显示：

```text
doona-0.1.0-beta.14.tar.gz: OK
```

## 4. 安装 doona

设置 `ui: embedded` 时，honk 提供内置的 doona，目前为 beta.12，无需单独安装软件包。如需提供此处安装的 beta.14 文件，请设置 `ui: /usr/share/doona`，详见[最小配置](minimal-configuration.md)。

把归档文件解压到 `/usr/share/doona`，honk 从这个目录提供 doona。

```sh
mkdir -p /usr/share/doona
tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

`ls` 输出一行以 `/usr/share/doona/index.html` 结尾的内容。可选的字体归档文件 `doona-fonts-${VERSION}.tar.gz` 包含 Noto Sans TC 与 SC 字体，存储空间不足时可以不装。

## 5. 选择 honk-core 构建

```sh
uname -m
```

OpenWrt 使用 musl，因此选择 `musl` 构建：

| `uname -m` 输出 | `TARGET`                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| `x86_64`        | `x86_64-unknown-linux-musl` 或 `x86_64-unknown-linux-musl-stock`         |
| `aarch64`       | `aarch64-unknown-linux-musl` 或 `aarch64-unknown-linux-musl-stock`       |

`-stock` 构建使用系统内存分配器，而非 mimalloc。发布版本不提供其他路由器 CPU（例如 MIPS 或 32 位 ARM）的构建。

## 6. 下载并校验 honk-core

把 `TARGET` 设为所选的构建，然后从同一个发布版本下载，并用同一个 `SHA256SUMS` 校验。

```sh
TARGET=x86_64-unknown-linux-musl
curl -fL -O "$BASE/honk-core-debug-$TARGET.tar.gz"
grep " honk-core-debug-$TARGET.tar.gz\$" SHA256SUMS | sha256sum -c -
```

应当显示：

```text
honk-core-debug-x86_64-unknown-linux-musl.tar.gz: OK
```

## 7. 安装 honk-core

把二进制文件安装为 `/usr/bin/honk-core`，即[服务管理](service-management.md)中的 procd 服务启动的路径。OpenWrt 的 BusyBox 没有 `install` 命令，因此复制文件后再设置权限。最后删除 `/tmp` 中下载的文件，释放其占用的内存。

```sh
tar -xzf honk-core-debug-$TARGET.tar.gz
cp honk-core-debug-$TARGET/honk-core /usr/bin/honk-core
chmod 0755 /usr/bin/honk-core
honk-core --version
rm -rf honk-core-debug-$TARGET honk-core-debug-$TARGET.tar.gz doona-${VERSION}.tar.gz SHA256SUMS
```

`honk-core --version` 输出 honk 的构建版本，例如：

```text
honk-core debug.2026.10.3.native-api.2
```

同一个发布版本中的 `HONK-SOURCE.txt` 注明其附带的构建。

下一步：[最小配置](minimal-configuration.md)。该页凡是提供“OpenWrt”标签页的地方，都选择它。

## 系统升级时保留 honk

按[服务管理](service-management.md)创建服务后，在升级前将配置目录和启动脚本加入 OpenWrt 的备份列表：

```sh
printf '%s\n' '/etc/honk/' '/etc/init.d/honk-core' >> /etc/sysupgrade.conf
```

系统升级不会保留内核模块、`/usr/share/doona` 或 `/usr/bin/honk-core`。升级后执行 `apk update` 并重新安装模块：

```sh
apk add kmod-veth kmod-nft-queue kmod-sched-core
```

使用 `opkg` 的系统用以下命令重新安装模块：

```sh
opkg update && opkg install kmod-veth kmod-nft-queue kmod-sched-core
```

重做上文第 1 至 7 步，重新安装 doona 与 honk-core，然后恢复服务的开机自启并启动服务：

```sh
/etc/init.d/honk-core enable
/etc/init.d/honk-core start
```

## 遇到问题时

| 看到的内容                                                         | 原因与处理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本号或文件名有误。请对照[发布页](https://github.com/Zakkaus/doona/releases)检查 `VERSION`。            |
| `sha256sum: WARNING: 1 of 1 computed checksums did NOT match`      | 下载的文件损坏或不完整。删除该文件后重新下载。                                                            |
| `sha256sum: -: no checksum lines found`                            | `grep` 没有找到该文件对应的行：当前 shell 未设置 `VERSION` 或 `TARGET`，或其中有拼写错误。                |

若 honk 报告 `persistence_unavailable` 且 reason 为 `unsafe`，请参阅[故障排查](troubleshooting.md#state-unsafe)。

安装后遇到的问题请参阅[故障排查](troubleshooting.md#troubleshooting)。
