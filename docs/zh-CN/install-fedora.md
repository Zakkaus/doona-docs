[繁體中文](../zh-TW/install-fedora.md) / 简体中文 / [English](../en/install-fedora.md)

# 在 Fedora 或 RHEL 上安装

使用系统包管理器安装 doona v0.1.0-rc.2 标准版。doona lite 请按[压缩包安装说明](install-manual.md)操作。

在网关上打开终端，进入新建的下载目录，并在同一 shell 中完成各步。使用 root shell 时省略 `sudo`。安装后端前先检查 [honk 的前提条件](install.md#install)。

## 1. 准备下载工具

```sh tab="sudo"
sudo dnf install curl ca-certificates
```

```sh tab="root"
dnf install curl ca-certificates
```

## 2. 下载并校验软件包

从 [v0.1.0-rc.2 发布页](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-rc.2)下载：

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v0.1.0-rc.2
FILE=doona-0.1.0-rc.2-1.noarch.rpm
curl -fL -O "$BASE/$FILE" -O "$BASE/SHA256SUMS"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c -
```

所有选定文件都显示 `OK` 后才能继续。如果校验失败或找不到校验和条目，先核对文件名并重新下载，再安装。

下载或执行文件出错时，见[安装故障](install.md#安装故障)。

发布的 RPM 未签名。安装前完成上面的 SHA-256 校验；校验和检查与 RPM 签名验证是不同的检查。

## 3. 安装网页文件

```sh
sudo dnf install "./$FILE"
ls -l /usr/share/doona/index.html
```

最后一条命令必须列出 `/usr/share/doona/index.html`。按[最小配置](minimal-configuration.md)操作时，将 UI 目录设为 `/usr/share/doona`；对应的配置项是 [`ui`](configuration.md#config)。

### 可选软件包

是否需要字体或预压缩文件，见[可选资源](install.md#doona)。安装时在下列命令中将 `FILE` 设为表中对应的文件名。示例选择字体包。

| 资源 | 文件名 |
| --- | --- |
| 字体 | `doona-fonts-0.1.0-rc.2-1.noarch.rpm` |
| 预压缩文件 | `doona-precompressed-0.1.0-rc.2-1.noarch.rpm` |

```sh
FILE=doona-fonts-0.1.0-rc.2-1.noarch.rpm
curl -fL -O "$BASE/$FILE"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c - &&
  sudo dnf install "./$FILE"
```

## 4. 安装后端

按[安装 honk](install.md#install)安装后端后返回本页。已有兼容的 honk 时无需重复安装。

接着按[快速开始](quick-start.md)配置 honk 并登录。
