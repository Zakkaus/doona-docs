<a name="lite"></a>

# doona lite

doona lite 通过表单编辑 honk 配置，目前是测试中的预览版。为网关选择界面前，请先阅读[版本比较](https://doona.daeuniverse.org/zh-CN/editions.md)。

使用**节点**、**订阅**、**策略组**、**路由**和 **DNS** 管理资源，通过**设置**修改全局设置。先[连接 doona lite](https://doona.daeuniverse.org/zh-CN/lite-connect.md)，再按[常用任务](https://doona.daeuniverse.org/zh-CN/lite-tasks.md)操作。

![节点](https://doona.daeuniverse.org/images/lite-nodes-light.webp)

<a name="lite-install"></a>

## 安装 doona lite

自 honk v0.1.0-beta.4 起，honk 内嵌 doona lite。按[快速入门](https://doona.daeuniverse.org/zh-CN/quick-start.md)安装 honk，再把 honk 配置中 `experimental.native_api` 块的 `ui` 改为 `'embedded-lite'`。`listen` 等其他行保持不变，doona lite 仍从原地址打开：

```dae
experimental {
    native_api {
        # 保留原有的 enabled、listen、password_auth 和 config_write
        ui: 'embedded-lite'
    }
}
```

若要单独安装，请使用[手动安装](https://doona.daeuniverse.org/zh-CN/install-manual.md)中的 lite 压缩包；lite 尚无发行版软件包。

选择任一方式后，按 [UI 重启规则](https://doona.daeuniverse.org/zh-CN/what-doona-can-change.md#restart-native)应用更改，打开[快速入门](https://doona.daeuniverse.org/zh-CN/quick-start.md)中的地址，再[连接 doona lite](https://doona.daeuniverse.org/zh-CN/lite-connect.md)。

<a name="lite-switch"></a>

## 切换到标准版

按[安装与切换版本](https://doona.daeuniverse.org/zh-CN/editions.md#editions-switch)选择标准版文件或内嵌界面。
