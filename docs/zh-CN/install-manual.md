[繁體中文](../zh-TW/install-manual.md) / 简体中文 / [English](../en/install-manual.md)

# 通过压缩包或在 Alpine 上安装

系统没有对应的软件包时，可以通过压缩包安装 doona v0.1.0-rc.2。Alpine 用户也可以选择[已签名的软件包](#install-alpine)。

在网关上打开终端，进入新建的下载目录，并在同一 shell 中完成各步。使用 root shell 时省略 `sudo`。安装后端前先检查 [honk 的前提条件](install.md#install)。

准备好 `curl`、CA 证书、`tar` 和 `sha256sum`。Alpine 用户以 root 执行 `apk add curl ca-certificates`。

## 1. 选择版本

选择一个标签页。版本差异见[版本比较](editions.md)。

```sh tab="标准版"
FILE=doona-0.1.0-rc.2.tar.gz
UI_DIR=/usr/share/doona
```

```sh tab="Lite"
FILE=doona-lite-0.1.0-rc.2.tar.gz
UI_DIR=/usr/share/doona-lite
```

## 2. 下载并校验

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v0.1.0-rc.2
curl -fL -O "$BASE/$FILE" -O "$BASE/SHA256SUMS"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c -
```

所有选定文件都显示 `OK` 后才能继续。如果校验失败或找不到校验和条目，先核对文件名并重新下载，再安装。

下载或执行文件出错时，见[安装故障](install.md#安装故障)。

## 3. 解压网页文件

```sh
sudo mkdir -p "$UI_DIR"
sudo tar -xzf "$FILE" -C "$UI_DIR"
ls -l "$UI_DIR/index.html"
```

最后一条命令必须列出 `index.html`。按[最小配置](minimal-configuration.md)操作时，使用选定的 `UI_DIR` 作为 UI 目录；配置项说明见 [`ui` 参考](configuration.md#config)。

### 标准版可选资源

标准版可以选择下列[可选资源](install.md#doona)。将 `FILE` 设为所选文件名，每个所需压缩包执行一次命令。lite 使用独立目录。

| 资源 | 文件名 |
| --- | --- |
| 字体 | `doona-fonts-0.1.0-rc.2.tar.gz` |
| 预压缩文件 | `doona-precompressed-0.1.0-rc.2.tar.gz` |

```sh
FILE=doona-fonts-0.1.0-rc.2.tar.gz
curl -fL -O "$BASE/$FILE"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c - &&
  sudo tar -xzf "$FILE" -C /usr/share/doona
```

通过压缩包安装后，跳过 Alpine 部分，继续安装后端。

<a name="install-alpine"></a>

## Alpine 软件包安装方式

此方式安装标准版。准备好前述工具后，在新的下载目录中操作。选择名称以 `.alpine.apk` 结尾的 Alpine 资源；OpenWrt 的 apk 文件格式不同。

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v0.1.0-rc.2
FILE=doona-0.1.0-rc.2-r0.alpine.apk
curl -fL -O "$BASE/$FILE" -O "$BASE/doona-alpine.rsa.pub" -O "$BASE/SHA256SUMS"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c -
awk '$2 == "doona-alpine.rsa.pub"' SHA256SUMS | sha256sum -c -
```

两项校验都显示 `OK` 后，以 root 安装已校验的密钥和软件包。保留密钥文件名；每次发布使用各自的密钥。

```sh
mkdir -p /etc/apk/keys
cp "$PWD/doona-alpine.rsa.pub" /etc/apk/keys/doona-alpine.rsa.pub
apk add "./$FILE"
ls -l /usr/share/doona/index.html
```

最后一条命令必须列出 `index.html`。可选软件包为 `doona-fonts-0.1.0-rc.2-r0.alpine.apk` 和 `doona-precompressed-0.1.0-rc.2-r0.alpine.apk`。安装时修改 `FILE`，按前述方式下载并校验，再以 root 执行 `apk add "./$FILE"`。

不添加发布公钥而直接安装时，先按上文校验下载的软件包，再以 root 执行：

```sh
apk add --allow-untrusted "./$FILE"
```

此方式跳过签名信任检查，因此必须保留 SHA-256 校验步骤。

安装可选软件包时，沿用主包所选的公钥验证或直接安装方式。

## 安装后端

按[安装 honk](install.md#install)安装后端后返回本页。已有兼容的 honk 时无需重复安装。

OpenRC 系统可使用[服务管理](service-management.md)中的前台命令完成首次连接；该页不配置 OpenRC 服务。

接着按[快速开始](quick-start.md)配置 honk 并登录。
