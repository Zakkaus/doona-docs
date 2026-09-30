[English](../en/install-openwrt.md) / 简体中文 / [繁體中文](../zh-TW/install-openwrt.md)

# 在 OpenWrt 上安装

本页在 OpenWrt 25.12 上用发布版本中的归档文件安装 doona 与 honk-core。完成最后一步后，请继续阅读[最小配置](minimal-configuration.md)。

发布版本中的 `.ipk` 软件包不适用于当前任何一个 OpenWrt 系列。OpenWrt 25.12 用 `apk` 安装软件包，`apk` 拒绝 `.ipk` 并报错 `v2 package format error`。OpenWrt 24.10 仍使用 `opkg`，但内核是 Linux 6.6，低于 honk 要求的 6.12。

## 开始之前

- OpenWrt 25.12 或更高版本（内核为 Linux 6.12），以及[系统要求](requirements.md#requirements)列出的内核选项。用 `uname -r` 查看内核版本。
- 路由器上的 root shell，例如 `ssh root@192.168.1.1`。OpenWrt 没有 sudo，所有命令都以 root 身份执行。
- `/` 上约 30 MB 可用空间，用于 honk-core 二进制文件（27 MB）与 doona（2.2 MB）；`/tmp` 上约 15 MB 可用空间，用于存放下载的文件。用 `df -h / /tmp` 查看。
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

## 1. 安装 curl 与 CA 证书

honk 通过 HTTPS 下载订阅与地理数据，缺少 CA 证书时会在启动阶段退出。OpenWrt 25.12 已包含 `ca-bundle`；下面的命令保留它并安装 curl。

```sh
apk update
apk add curl ca-bundle
```

## 2. 下载 doona

在 `/tmp` 中操作。`/tmp` 位于内存中，重启后清空。设置发布版本号，然后下载归档文件与校验和文件。

```sh
cd /tmp
VERSION=0.1.0-beta.12
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 3. 校验下载的文件

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

应当显示：

```text
doona-0.1.0-beta.12.tar.gz: OK
```

## 4. 安装 doona

使用 doona 0.1.0-beta.12 附带的 honk-core 构建并设置 `ui: embedded` 时，`doona` 软件包可省略，详见[最小配置](minimal-configuration.md)。

把归档文件解压到 `/usr/share/doona`，honk 从这个目录提供 doona。

```sh
mkdir -p /usr/share/doona
tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

`ls` 输出一行以 `/usr/share/doona/index.html` 结尾的内容。可选的字体归档文件 `doona-fonts-${VERSION}.tar.gz` 包含 8.7 MB 中文字体，存储空间不足时可以不装。

## 5. 选择 honk-core 构建

```sh
uname -m
```

OpenWrt 使用 musl，因此选择 `musl` 构建：

| `uname -m` 输出 | `TARGET`                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| `x86_64`        | `x86_64-unknown-linux-musl` 或 `x86_64-unknown-linux-musl-stock`         |
| `aarch64`       | `aarch64-unknown-linux-musl` 或 `aarch64-unknown-linux-musl-stock`       |

`-stock` 构建使用系统内存分配器而不是 mimalloc，适合内存比速度更重要的设备。其他路由器 CPU（例如 MIPS 或 32 位 ARM）没有对应的构建。

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
honk-core debug.2026.9.30.native-api.5
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
