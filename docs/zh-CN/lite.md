[English](../en/lite.md) / 简体中文 / [繁體中文](../zh-TW/lite.md)

<a name="lite"></a>

# doona lite

doona lite 通过表单完成常见的 honk 配置任务，目前是测试中的预览版。为网关选择界面前，请先阅读[版本比较](editions.md)。

使用**节点**、**订阅**、**策略组**、**路由**和 **DNS** 管理资源，通过**设置**修改全局设置。先[连接 doona lite](lite-connect.md)，再按[常用任务](lite-tasks.md)操作。

![节点](../images/lite-nodes-light.webp)

<a name="lite-install"></a>

## 安装 doona lite

1. 安装[兼容的 honk 构建](requirements.md#honk-version)，准备[最小配置](minimal-configuration.md)。
2. 在网关上可写的下载目录中，下载并校验归档。以下命令使用 sudo，root shell 中省略 sudo。

```sh
VERSION=0.1.0-rc.2
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-lite-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep " doona-lite-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

3. 校验结果为 `OK` 后再解压：

```sh
sudo install -d -m 0755 /usr/share/doona-lite
sudo tar -xzf "doona-lite-${VERSION}.tar.gz" -C /usr/share/doona-lite
ls -l /usr/share/doona-lite/index.html
```

4. 确认 `index.html` 存在。在已有的 `experimental.native_api` 块中设置：

```dae
ui: '/usr/share/doona-lite'
```

5. 根据 [UI 重启规则](what-doona-can-change.md#restart-native)，按[服务管理](service-management.md)操作。打开 honk 的 `/ui/` 地址，按[连接 doona lite](lite-connect.md)继续。

其他 API 字段见[配置参考](configuration.md)。

<a name="lite-switch"></a>

## 切换到标准版

按[安装与切换版本](editions.md#editions-switch)选择标准版文件或内嵌界面。
