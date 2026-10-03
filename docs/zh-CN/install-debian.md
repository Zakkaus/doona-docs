[English](../en/install-debian.md) / 简体中文 / [繁體中文](../zh-TW/install-debian.md)

# 在 Debian 或 Ubuntu 上安装

本页在 Debian、Ubuntu 及其他使用 APT 的系统上，用 `doona-web` `.deb` 软件包安装 doona，并从同一个 doona 发布版本安装 honk-core。完成最后一步后，请继续阅读[最小配置](minimal-configuration.md)。

> [!NOTE]
> beta.13 下载文件尚未发布。本页命令须在[发布页](https://github.com/Zakkaus/doona/releases)提供文件后执行，详见[原生 API 状态](index.md#原生-api-状态)。

## 开始之前

- Linux 6.12 或更高版本，以及[系统要求](requirements.md#requirements)列出的内核选项。用 `uname -r` 查看内核版本。
- 可使用 sudo 的用户，或 root shell。需要 root 权限的命令分为“sudo”与“root”两个标签页，请选择与当前 shell 相符的一个。
- 能够访问 github.com。
- 所有步骤都在同一个终端中执行：后面的步骤会用到前面设置的 `VERSION`、`BASE` 与 `TARGET` 变量。

## 1. 安装 curl 与 CA 证书

honk 使用系统 CA 证书校验通过 HTTPS 下载的订阅与地理数据。

```sh tab="sudo"
sudo apt update
sudo apt install curl ca-certificates
```

```sh tab="root"
apt update
apt install curl ca-certificates
```

## 2. 下载 doona

设置发布版本号，然后把软件包与校验和文件下载到当前目录。

```sh
VERSION=0.1.0-beta.13
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-web_${VERSION}-1_all.deb" -O "$BASE/SHA256SUMS"
```

## 3. 校验下载的文件

```sh
grep " doona-web_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
```

应当显示：

```text
doona-web_0.1.0-beta.13-1_all.deb: OK
```

## 4. 安装 doona

设置 `ui: embedded` 时，honk 提供内置的 doona，目前为 beta.12，无需单独安装软件包。如需提供此处安装的 beta.13 软件包，请设置 `ui: /usr/share/doona-web`，详见[最小配置](minimal-configuration.md)。

```sh tab="sudo"
sudo apt install ./doona-web_${VERSION}-1_all.deb
ls -l /usr/share/doona-web/index.html
```

```sh tab="root"
apt install ./doona-web_${VERSION}-1_all.deb
ls -l /usr/share/doona-web/index.html
```

`ls` 输出一行以 `/usr/share/doona-web/index.html` 结尾的内容。`doona-web` 软件包将 doona 的网页文件安装到 `/usr/share/doona-web`，文档安装到 `/usr/share/doc/doona-web`，不安装任何服务。

可选：`doona-web-fonts` 软件包将中文界面的 Noto Sans TC 与 SC 字体安装到 `/usr/share/doona-web/fonts`，依赖 `doona-web`。

```sh tab="sudo"
curl -fL -O "$BASE/doona-web-fonts_${VERSION}-1_all.deb"
grep " doona-web-fonts_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
sudo apt install ./doona-web-fonts_${VERSION}-1_all.deb
```

```sh tab="root"
curl -fL -O "$BASE/doona-web-fonts_${VERSION}-1_all.deb"
grep " doona-web-fonts_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
apt install ./doona-web-fonts_${VERSION}-1_all.deb
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
| `gnu`           | 系统的 glibc 为 2.39 或更高版本。 |
| `-stock` 后缀   | 使用系统内存分配器，而非 mimalloc。                                                               |

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
honk-core debug.2026.10.3.native-api.2
```

同一个发布版本中的 `HONK-SOURCE.txt` 注明其附带的构建。

下一步：[最小配置](minimal-configuration.md)。

## 如果 apt 将 doona 替换为无关软件包

如果执行 `apt upgrade` 后，`doona` 的版本变成 `1.0+git20190108-2`，网页界面也无法访问，说明 Debian 或 Ubuntu 安装了同名但版本号更高的网络模糊测试工具，与本项目无关。

按第 2–4 步下载并校验 `doona-web` 与 `doona-web-fonts`，然后在下载目录中安装：

```sh tab="sudo"
sudo apt install ./doona-web_${VERSION}-1_all.deb ./doona-web-fonts_${VERSION}-1_all.deb
```

```sh tab="root"
apt install ./doona-web_${VERSION}-1_all.deb ./doona-web-fonts_${VERSION}-1_all.deb
```

在 honk 的 `native_api` 配置中设置 `ui: /usr/share/doona-web`。安装新软件包会移除本项目版本低于 `1.0` 的旧 `doona` 与 `doona-fonts` 软件包。

如果系统中仍留有无关的 `doona` 软件包，可以将其移除，`doona-web` 不受影响：

```sh tab="sudo"
sudo apt remove doona
```

```sh tab="root"
apt remove doona
```

## 遇到问题时

| 看到的内容                                                         | 原因与处理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本号或文件名有误。请对照[发布页](https://github.com/Zakkaus/doona/releases)检查 `VERSION`。            |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` 没有找到该文件对应的行：当前终端未设置 `VERSION` 或 `TARGET`，或其中有拼写错误。            |
| `FAILED` 与 `WARNING: 1 computed checksum did NOT match`           | 下载的文件损坏或不完整。删除该文件后重新下载。                                                            |
| `version 'GLIBC_2.38' not found`                                   | `gnu` 构建需要更新的 glibc。请改用 `musl` 构建。                                                          |

安装后遇到的问题请参阅[故障排查](troubleshooting.md#troubleshooting)。
