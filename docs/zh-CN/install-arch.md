[English](../en/install-arch.md) / 简体中文 / [繁體中文](../zh-TW/install-arch.md)

# 在 Arch Linux 上安装

本页在 Arch Linux 及其他使用 pacman 的系统上，用 `.pkg.tar.zst` 软件包安装 doona，并从同一个 doona 发布版本安装 honk-core。完成最后一步后，请继续阅读[最小配置](minimal-configuration.md)。

## 开始之前

- Linux 6.12 或更高版本，以及[系统要求](requirements.md#requirements)列出的内核选项。用 `uname -r` 查看内核版本。
- 可使用 sudo 的用户，或 root shell。需要 root 权限的命令分为“sudo”与“root”两个标签页，请选择与当前 shell 相符的一个。
- 能够访问 github.com。
- 所有步骤都在同一个终端中执行：后面的步骤会用到前面设置的 `VERSION`、`BASE` 与 `TARGET` 变量。

## 1. 安装 curl 与 CA 证书

honk 通过 HTTPS 下载订阅与地理数据，缺少 CA 证书时会在启动阶段退出。

```sh tab="sudo"
sudo pacman -Syu --needed curl ca-certificates
```

```sh tab="root"
pacman -Syu --needed curl ca-certificates
```

## 2. 下载 doona

设置发布版本号，然后把软件包与校验和文件下载到当前目录。Arch 软件包名称中的预发布版本号去掉了 `-` 与 `.`，`PKGVER` 保存这种写法。

```sh
VERSION=0.1.0-beta.12
PKGVER=0.1.0beta9
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${PKGVER}-1-any.pkg.tar.zst" -O "$BASE/SHA256SUMS"
```

## 3. 校验下载的文件

```sh
grep " doona-${PKGVER}-1-any.pkg.tar.zst\$" SHA256SUMS | sha256sum -c -
```

应当显示：

```text
doona-0.1.0beta9-1-any.pkg.tar.zst: OK
```

## 4. 安装 doona

使用 doona 0.1.0-beta.12 附带的 honk-core 构建并设置 `ui: embedded` 时，`doona` 软件包可省略，详见[最小配置](minimal-configuration.md)。

```sh tab="sudo"
sudo pacman -U ./doona-${PKGVER}-1-any.pkg.tar.zst
ls -l /usr/share/doona/index.html
```

```sh tab="root"
pacman -U ./doona-${PKGVER}-1-any.pkg.tar.zst
ls -l /usr/share/doona/index.html
```

`ls` 输出一行以 `/usr/share/doona/index.html` 结尾的内容。该软件包只包含 doona 的网页文件，不安装任何服务。

可选：`doona-fonts` 软件包为中文界面加入 Noto Sans TC 与 SC 字体。

```sh tab="sudo"
curl -fL -O "$BASE/doona-fonts-${PKGVER}-1-any.pkg.tar.zst"
grep " doona-fonts-${PKGVER}-1-any.pkg.tar.zst\$" SHA256SUMS | sha256sum -c -
sudo pacman -U ./doona-fonts-${PKGVER}-1-any.pkg.tar.zst
```

```sh tab="root"
curl -fL -O "$BASE/doona-fonts-${PKGVER}-1-any.pkg.tar.zst"
grep " doona-fonts-${PKGVER}-1-any.pkg.tar.zst\$" SHA256SUMS | sha256sum -c -
pacman -U ./doona-fonts-${PKGVER}-1-any.pkg.tar.zst
```

## 5. 选择 honk-core 构建

```sh
uname -m
```

发布版本附带 8 个 honk-core 归档文件，名称为 `honk-core-debug-<target>.tar.gz`。根据机器类型与 C 库确定 target：

| `uname -m` 输出 | target 开头              |
| --------------- | ------------------------ |
| `x86_64`        | `x86_64-unknown-linux-`  |
| `aarch64`       | `aarch64-unknown-linux-` |

| target 结尾     | 适用情况                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `musl`          | 无法确定时选择此项。静态链接，不受系统 glibc 版本限制。                                   |
| `gnu`           | 系统的 glibc 为 2.39 或更高版本，当前的 Arch Linux 即满足。glibc 较旧时会报错 `GLIBC_2.38' not found` 并退出。 |
| `-stock` 后缀   | 内存比速度更重要，例如小型设备。使用系统内存分配器而不是 mimalloc。                                 |

例如 `x86_64-unknown-linux-musl`、`aarch64-unknown-linux-gnu` 或 `x86_64-unknown-linux-musl-stock`。

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

归档文件内有一个目录，其中包含 `honk-core` 二进制文件。把它安装为 `/usr/local/bin/honk-core`，即[服务管理](service-management.md)中的服务启动的路径。

```sh tab="sudo"
tar -xzf honk-core-debug-$TARGET.tar.gz
sudo install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
/usr/local/bin/honk-core --version
```

```sh tab="root"
tar -xzf honk-core-debug-$TARGET.tar.gz
install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
/usr/local/bin/honk-core --version
```

最后一条命令输出 honk 的构建版本，例如：

```text
honk-core debug.2026.9.30.native-api.5
```

同一个发布版本中的 `HONK-SOURCE.txt` 注明其附带的构建。

下一步：[最小配置](minimal-configuration.md)。

## 遇到问题时

| 看到的内容                                                         | 原因与处理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本号或文件名有误。请对照[发布页](https://github.com/Zakkaus/doona/releases)检查 `VERSION`。            |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` 没有找到该文件对应的行：当前终端未设置 `VERSION`、`PKGVER` 或 `TARGET`，或其中有拼写错误。            |
| `FAILED` 与 `WARNING: 1 computed checksum did NOT match`           | 下载的文件损坏或不完整。删除该文件后重新下载。                                                            |
| `version 'GLIBC_2.38' not found`                                   | `gnu` 构建需要更新的 glibc。请改用 `musl` 构建。                                                          |

安装后遇到的问题请参阅[故障排查](troubleshooting.md#troubleshooting)。
