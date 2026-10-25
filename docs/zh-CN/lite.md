[English](../en/lite.md) / 简体中文 / [繁體中文](../zh-TW/lite.md)

<a name="lite"></a>

# doona lite

doona lite 为初学者提供较小的界面，用于编辑 honk 配置。

页面包括：**节点**、**订阅**、**策略组**、**路由**、**DNS**。**设置**对话框用于编辑全局设置。搜索可查找资源，手动节点可通过链接或二维码分享。演示模式使用示例数据。

lite 不提供流量页面、Trace 或配置源编辑器页面，见[功能比较](editions.md#editions-compare)。

![节点](../images/lite-nodes-light.webp)

<a name="lite-install"></a>

## 安装 doona lite

先安装 honk 并写入[最小配置](minimal-configuration.md)。在可写的工作目录中，从同一发布版本下载 lite 压缩包和 `SHA256SUMS`，校验后解压。以下命令使用 sudo；在 root shell 中省略 sudo。

[doona releases](https://github.com/Zakkaus/doona/releases)

```sh
VERSION=0.1.0-beta.19
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-lite-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep " doona-lite-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
sudo mkdir -p /usr/share/doona-lite
sudo tar -xzf "doona-lite-${VERSION}.tar.gz" -C /usr/share/doona-lite
ls -l /usr/share/doona-lite/index.html
```

校验结果应为 `OK`，`ls` 应列出 `/usr/share/doona-lite/index.html`。在现有 `experimental` → `native_api` 块中设置：

```dae
ui: /usr/share/doona-lite
```

[重启 honk](service-management.md)，然后打开其 `/ui/` 地址，例如 `http://192.168.1.1:9527/ui/`。继续阅读[连接 doona lite](lite-connect.md)。

<a name="lite-switch"></a>

## 切回标准版

将 `ui` 指向已安装的标准版目录，通常为 `/usr/share/doona`（Debian 或 Ubuntu 软件包使用 `/usr/share/doona-web`），也可使用 `ui: embedded`。重启 honk 并重新加载 `/ui/`。两个目录可以同时保留，见[安装与切换](editions.md#editions-switch)。
