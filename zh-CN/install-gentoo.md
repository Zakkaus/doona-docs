# 在 Gentoo 上安装

本页用 Portage 从 doona 仓库中的 ebuild 模板安装 doona，并从同一个 doona 发布版本安装 honk-core。请使用本地 ebuild 仓库安装此模板。完成最后一步后，请继续阅读[最小配置](https://zakkaus.github.io/doona-docs/zh-CN/minimal-configuration.md)。

> [!NOTE]
> beta.13 下载文件尚未发布。本页命令须在[发布页](https://github.com/Zakkaus/doona/releases)提供文件后执行，详见[原生 API 状态](https://zakkaus.github.io/doona-docs/zh-CN/index.md#原生-api-状态)。

## 开始之前

- Linux 6.12 或更高版本，以及[系统要求](https://zakkaus.github.io/doona-docs/zh-CN/requirements.md#requirements)列出的内核选项。用 `uname -r` 查看内核版本。
- 可使用 sudo 的用户，或 root shell。需要 root 权限的命令分为“sudo”与“root”两个标签页，请选择与当前 shell 相符的一个。
- `net-misc/curl` 与 `app-misc/ca-certificates`。honk 使用系统 CA 证书校验 HTTPS 下载。
- 能够访问 github.com。
- 所有步骤都在同一个终端中执行：后面的步骤会用到前面设置的 `REPO`、`VERSION`、`PV`、`BASE` 与 `TARGET` 变量。

## 1. 创建本地仓库

把 `REPO` 设为仓库路径。如果已有本地 ebuild 仓库，把 `REPO` 设为该仓库的路径，并跳过此步的其余命令。

```sh
REPO=/var/db/repos/local
```

创建仓库并向 Portage 注册：

```sh tab="sudo"
sudo mkdir -p "$REPO/metadata" "$REPO/profiles" /etc/portage/repos.conf
echo local | sudo tee "$REPO/profiles/repo_name"
printf 'masters = gentoo\nauto-sync = false\n' | sudo tee "$REPO/metadata/layout.conf"
printf '[local]\nlocation = %s\n' "$REPO" | sudo tee /etc/portage/repos.conf/local.conf
portageq get_repos /
```

```sh tab="root"
mkdir -p "$REPO/metadata" "$REPO/profiles" /etc/portage/repos.conf
echo local > "$REPO/profiles/repo_name"
printf 'masters = gentoo\nauto-sync = false\n' > "$REPO/metadata/layout.conf"
printf '[local]\nlocation = %s\n' "$REPO" > /etc/portage/repos.conf/local.conf
portageq get_repos /
```

最后一条命令在 `gentoo` 旁列出 `local`。

## 2. 加入 doona 的 ebuild

设置发布版本号及其 Gentoo 写法。源码提交 `ca2eccf0bbced6f4d22948c9f71d96a90705e5ab` 中的模板名为 `doona-0.1.0_beta12.ebuild`；下载已核实的模板，安装 beta.13 时将其保存为 `doona-$PV.ebuild`。ebuild 会根据 `PV` 生成下载网址。

```sh tab="sudo"
VERSION=0.1.0-beta.13
PV=0.1.0_beta13
RAW=https://raw.githubusercontent.com/Zakkaus/doona/ca2eccf0bbced6f4d22948c9f71d96a90705e5ab/install/gentoo/net-proxy/doona
sudo mkdir -p "$REPO/net-proxy/doona"
cd "$REPO/net-proxy/doona"
sudo curl -fL -o "doona-$PV.ebuild" "$RAW/doona-0.1.0_beta12.ebuild" -O "$RAW/metadata.xml"
cd -
```

```sh tab="root"
VERSION=0.1.0-beta.13
PV=0.1.0_beta13
RAW=https://raw.githubusercontent.com/Zakkaus/doona/ca2eccf0bbced6f4d22948c9f71d96a90705e5ab/install/gentoo/net-proxy/doona
mkdir -p "$REPO/net-proxy/doona"
cd "$REPO/net-proxy/doona"
curl -fL -o "doona-$PV.ebuild" "$RAW/doona-0.1.0_beta12.ebuild" -O "$RAW/metadata.xml"
cd -
```

## 3. 下载并校验 doona 归档文件

ebuild 安装发布版本中的程序归档文件；默认启用的 `fonts` USE 标志还会安装字体归档文件。下载这两个文件与 `SHA256SUMS` 并校验。

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/doona-fonts-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep -E " doona(-fonts)?-${VERSION}\.tar\.gz\$" SHA256SUMS | sha256sum -c -
```

应当显示：

```text
doona-0.1.0-beta.13.tar.gz: OK
doona-fonts-0.1.0-beta.13.tar.gz: OK
```

## 4. 把归档文件交给 Portage

把校验过的归档文件以 ebuild 所需的文件名复制到 distfiles 目录，再据此生成仓库的 `Manifest`。

```sh tab="sudo"
DISTDIR=$(portageq distdir)
sudo cp "doona-${VERSION}.tar.gz" "$DISTDIR/doona-$PV.tar.gz"
sudo cp "doona-fonts-${VERSION}.tar.gz" "$DISTDIR/doona-$PV-fonts.tar.gz"
sudo ebuild "$REPO/net-proxy/doona/doona-$PV.ebuild" manifest
```

```sh tab="root"
DISTDIR=$(portageq distdir)
cp "doona-${VERSION}.tar.gz" "$DISTDIR/doona-$PV.tar.gz"
cp "doona-fonts-${VERSION}.tar.gz" "$DISTDIR/doona-$PV-fonts.tar.gz"
ebuild "$REPO/net-proxy/doona/doona-$PV.ebuild" manifest
```

最后一条命令输出 `>>> Creating Manifest for` 及软件包目录，默认为 `/var/db/repos/local/net-proxy/doona`。

## 5. 安装 doona

设置 `ui: embedded` 时，honk 提供内置的 doona，目前为 beta.12，无需单独安装软件包。如需提供此处安装的 beta.13 软件包，请设置 `ui: /usr/share/doona`，详见[最小配置](https://zakkaus.github.io/doona-docs/zh-CN/minimal-configuration.md)。

该 ebuild 的关键字为测试分支（`~amd64`、`~arm64` 等），需要先为这个软件包接受测试关键字。请把 `~amd64` 换成本机架构的关键字。

```sh tab="sudo"
sudo mkdir -p /etc/portage/package.accept_keywords
echo 'net-proxy/doona ~amd64' | sudo tee /etc/portage/package.accept_keywords/doona
sudo emerge --ask net-proxy/doona
ls -l /usr/share/doona/index.html
```

```sh tab="root"
mkdir -p /etc/portage/package.accept_keywords
echo 'net-proxy/doona ~amd64' > /etc/portage/package.accept_keywords/doona
emerge --ask net-proxy/doona
ls -l /usr/share/doona/index.html
```

Portage 最后输出 `Point the engine's ui setting at /usr/share/doona, or serve that directory with any web server.`，`ls` 输出一行以 `/usr/share/doona/index.html` 结尾的内容。该软件包包含 doona 的网页文件与文档，不安装任何服务。如不需要 Noto Sans TC 与 SC 字体，请为 `net-proxy/doona` 设置 `USE=-fonts`。

## 6. 选择 honk-core 构建

```sh
uname -m
```

发布版本附带 8 个 honk-core 归档文件，名称为 `honk-core-debug-<target>.tar.gz`。根据机器类型与 C 库确定 target：

| `uname -m` 输出 | target 开头              |
| --------------- | ------------------------ |
| `x86_64`        | `x86_64-unknown-linux-`  |
| `aarch64`       | `aarch64-unknown-linux-` |

| target 结尾     | 适用情况                                                                              |
| --------------- | ------------------------------------------------------------------------------------- |
| `musl`          | 无法确定，或系统使用 musl 时选择此项。静态链接，不受系统 glibc 版本限制。  |
| `gnu`           | 系统的 glibc 为 2.39 或更高版本。 |
| `-stock` 后缀   | 使用系统内存分配器，而非 mimalloc。                                                 |

例如 `x86_64-unknown-linux-musl`、`aarch64-unknown-linux-gnu` 或 `x86_64-unknown-linux-musl-stock`。

## 7. 下载并校验 honk-core

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

## 8. 安装 honk-core

归档文件内有一个目录，其中包含 `honk-core` 二进制文件。把它安装为 `/usr/local/bin/honk-core`，即[服务管理](https://zakkaus.github.io/doona-docs/zh-CN/service-management.md)中的服务启动的路径。

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

下一步：[最小配置](https://zakkaus.github.io/doona-docs/zh-CN/minimal-configuration.md)。服务相关步骤只涵盖 systemd 与 OpenWrt 的 procd；doona 与 honk 都不提供 OpenRC 脚本。使用 OpenRC 时，[服务管理](https://zakkaus.github.io/doona-docs/zh-CN/service-management.md)给出在前台运行 honk 的命令，用于完成首次登录。

## 遇到问题时

| 看到的内容                                                         | 原因与处理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本号或文件名有误。请对照[发布页](https://github.com/Zakkaus/doona/releases)检查 `VERSION` 与 `PV`。    |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` 没有找到该文件对应的行：当前终端未设置 `VERSION` 或 `TARGET`，或其中有拼写错误。            |
| `FAILED` 与 `WARNING: 1 computed checksum did NOT match`           | 下载的文件损坏或不完整。删除该文件后重新下载。                                                            |
| `emerge` 找不到 `net-proxy/doona`                                  | `portageq get_repos /` 没有列出 `local`：请检查第 1 步写入的三个文件。                                    |
| `emerge` 报告该软件包因 `~amd64` 被屏蔽                            | `/etc/portage/package.accept_keywords/doona` 中的关键字与本机架构不符。                                   |
| `version 'GLIBC_2.38' not found`                                   | `gnu` 构建需要更新的 glibc。请改用 `musl` 构建。                                                          |

安装后遇到的问题请参阅[故障排查](https://zakkaus.github.io/doona-docs/zh-CN/troubleshooting.md#troubleshooting)。
