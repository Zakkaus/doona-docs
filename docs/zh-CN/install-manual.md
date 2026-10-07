[English](../en/install-manual.md) / 简体中文 / [繁體中文](../zh-TW/install-manual.md)

# 在其他系统上安装

在符合以下内核要求的 x86_64 或 aarch64 Linux 系统上，从发布归档安装 doona 与 honk-core。Alpine 也可使用[已签名的 apk 软件包](#install-alpine)。之后继续阅读[最小配置](minimal-configuration.md)。

> [!NOTE]
> beta.17 命令需要[发布页](https://github.com/Zakkaus/doona/releases)上的对应文件。下载前先确认版本已发布。

## 开始之前

- Linux 6.12 或更高版本，以及[系统要求](requirements.md#requirements)列出的内核选项。用 `uname -r` 查看内核版本。
- 可使用 sudo 的用户，或 root shell。需要 root 权限的命令分为“sudo”与“root”两个标签页，请选择与当前 shell 相符的一个。
- curl、tar、gzip、`sha256sum` 与 CA 证书。honk 使用系统 CA 证书校验 HTTPS 下载。在 Alpine 上用 `sudo apk add curl ca-certificates` 安装，或在 root shell 中执行 `apk add curl ca-certificates`；其他系统的软件包名称相近。
- 能够访问 github.com。
- 所有步骤都在同一个终端中执行：后面的步骤会用到前面设置的 `VERSION`、`BASE` 与 `TARGET` 变量。

<a name="install-alpine"></a>

## 在 Alpine 上安装

Alpine 的 `.apk` 文件不能与 OpenWrt 的混用。在当前目录下载 Alpine 软件包、发布公钥与校验和：

```sh
VERSION=0.1.0-beta.17
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}-r0.alpine.apk" \
  -O "$BASE/doona-precompressed-${VERSION}-r0.alpine.apk" \
  -O "$BASE/doona-alpine.rsa.pub" -O "$BASE/SHA256SUMS"
grep -E " (doona(-precompressed)?-${VERSION}-r0.alpine.apk|doona-alpine.rsa.pub)\$" SHA256SUMS | sha256sum -c -
```

每次发布都用新密钥签名软件包。安装公钥时保留名称 `doona-alpine.rsa.pub`，后续版本会替换它。

```sh tab="sudo"
sudo wget -O /etc/apk/keys/doona-alpine.rsa.pub "$BASE/doona-alpine.rsa.pub"
sudo apk add ./doona-${VERSION}-r0.alpine.apk ./doona-precompressed-${VERSION}-r0.alpine.apk
ls -l /usr/share/doona/index.html
```

```sh tab="root"
wget -O /etc/apk/keys/doona-alpine.rsa.pub "$BASE/doona-alpine.rsa.pub"
apk add ./doona-${VERSION}-r0.alpine.apk ./doona-precompressed-${VERSION}-r0.alpine.apk
ls -l /usr/share/doona/index.html
```

`ls` 须列出 `/usr/share/doona/index.html`。可选的 `doona-precompressed` 为支持预压缩响应的服务器加入 `.br` 与 `.gz` 副本；不需要时省略其下载与安装参数。可选字体软件包为 `doona-fonts-${VERSION}-r0.alpine.apk`。

没有签名公钥时，可用 `apk add --allow-untrusted` 直接安装文件。安装 honk-core 请从下方[第 4 步](#4-选择-honk-core-构建)继续，选择 musl 构建。其余编号步骤说明其他系统的归档安装方式。

## 1. 下载 doona

设置发布版本号，然后把程序归档文件与校验和文件下载到当前目录。

```sh
VERSION=0.1.0-beta.17
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 2. 校验下载的文件

该命令适用于 GNU 与 BusyBox 的 `sha256sum`。

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

应当显示：

```text
doona-0.1.0-beta.17.tar.gz: OK
```

## 3. 安装 doona

设置 `ui: embedded` 时，honk 提供内置的 doona，目前为 beta.14，无需单独安装软件包。如需提供此处安装的 beta.17 文件，请设置 `ui: /usr/share/doona`，详见[最小配置](minimal-configuration.md)。

把归档文件解压到 `/usr/share/doona`，honk 从这个目录提供 doona。

```sh tab="sudo"
sudo mkdir -p /usr/share/doona
sudo tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

```sh tab="root"
mkdir -p /usr/share/doona
tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

`ls` 输出一行以 `/usr/share/doona/index.html` 结尾的内容。

可选：字体归档文件为中文界面加入 Noto Sans TC 与 SC 字体。

```sh tab="sudo"
curl -fL -O "$BASE/doona-fonts-${VERSION}.tar.gz"
grep " doona-fonts-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
sudo tar -xzf doona-fonts-${VERSION}.tar.gz -C /usr/share/doona
```

```sh tab="root"
curl -fL -O "$BASE/doona-fonts-${VERSION}.tar.gz"
grep " doona-fonts-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
tar -xzf doona-fonts-${VERSION}.tar.gz -C /usr/share/doona
```

可选的 `doona-precompressed-${VERSION}.tar.gz` 归档在网页文件旁加入 `.br` 与 `.gz` 副本，让服务器发送预压缩响应。从同一个发布版本下载并校验，再像字体归档一样解压到 `/usr/share/doona`。

## 4. 选择 honk-core 构建

```sh
uname -m
```

发布版本附带 8 个 honk-core 归档文件，名称为 `honk-core-debug-<target>.tar.gz`。根据机器类型与 C 库确定 target：

| `uname -m` 输出 | target 开头              |
| --------------- | ------------------------ |
| `x86_64`        | `x86_64-unknown-linux-`  |
| `aarch64`       | `aarch64-unknown-linux-` |

| target 结尾     | 适用情况                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `musl`          | 无法确定，或系统使用 musl（例如 Alpine）时选择此项。静态链接，不受系统 glibc 版本限制。 |
| `gnu`           | 系统的 glibc 为 2.39 或更高版本。 |
| `-stock` 后缀   | 使用系统内存分配器，而非 mimalloc。                                                           |

例如 `x86_64-unknown-linux-musl`、`aarch64-unknown-linux-gnu` 或 `x86_64-unknown-linux-musl-stock`。

## 5. 下载并校验 honk-core

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

## 6. 安装 honk-core

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
honk-core debug.2026.10.6.native-api.1
```

同一个发布版本中的 `HONK-SOURCE.txt` 注明其附带的构建。

首次启动 honk 前，请按[目录与地理数据](install.md#directories-and-geodata)安装 `geosite.dat` 与 `geoip.dat`。

下一步：[最小配置](minimal-configuration.md)。服务相关步骤只涵盖 systemd 与 OpenWrt 的 procd；doona 与 honk 都不提供 OpenRC 脚本。使用 OpenRC 时（例如 Alpine），[服务管理](service-management.md)给出在前台运行 honk 的命令，用于完成首次登录。

## 遇到问题时

| 看到的内容                                                         | 原因与处理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本号或文件名有误。请对照[发布页](https://github.com/Zakkaus/doona/releases)检查 `VERSION`。            |
| `no properly formatted checksum lines found`（GNU）或 `no checksum lines found`（BusyBox） | `grep` 没有找到该文件对应的行：当前终端未设置 `VERSION` 或 `TARGET`，或其中有拼写错误。 |
| `FAILED` 以及校验和不匹配的 `WARNING`                              | 下载的文件损坏或不完整。删除该文件后重新下载。                                                            |
| `sha256sum: unrecognized option: ignore-missing`                   | BusyBox 没有 `--ignore-missing` 选项。请使用第 2 步的 `grep` 写法。                                         |
| `version 'GLIBC_2.38' not found`                                   | `gnu` 构建需要更新的 glibc。请改用 `musl` 构建。                                                          |

安装后遇到的问题请参阅[故障排查](troubleshooting.md#troubleshooting)。
