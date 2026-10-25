[English](../en/editions.md) / 简体中文 / [繁體中文](../zh-TW/editions.md)

<a name="editions"></a>

# 标准版与 doona lite

标准版是现有的 doona 界面，用于管理配置和观测流量。需要连接详情、日志、Trace 或配置源编辑器时，选择标准版。

doona lite 面向只需编辑配置的初学者，界面较小。它管理节点、订阅、组、路由规则、DNS 和全局设置，不提供流量页面。

<a name="editions-compare"></a>

## 功能比较

| 功能 | 标准版 | doona lite |
| --- | --- | --- |
| 流量页面 | 活动、系统状态、连接、分流、日志和事件 | 不提供 |
| 节点与订阅 | 支持 | 支持 |
| 组 | 支持 | 支持 |
| 路由规则 | 支持 | 支持 |
| DNS | 配置与观测 | 配置 |
| 全局设置 | 设置页面 | 设置对话框 |
| 配置源编辑器 | 支持 | 不提供 |
| Trace | 支持 | 不提供 |
| 主题与配色 | 浅色、深色主题与配色 | 浅色、深色或跟随系统；无配色选择器 |
| 登录 | 管理员密码或令牌 | 管理员密码或令牌 |

<a name="editions-switch"></a>

## 安装与切换

两个版本在[同一发布版本](https://github.com/Zakkaus/doona/releases)中提供。[标准版](install.md#doona)使用 `doona-<version>.tar.gz`，安装到 `/usr/share/doona`；[doona lite](lite.md#lite-install) 使用 `doona-lite-<version>.tar.gz`，安装到 `/usr/share/doona-lite`。压缩包名称和安装目录不重叠，安装其中一个不会覆盖另一个。lite 暂无发行版软件包。

honk 的 `/ui/` 一次只提供一个版本。将 `experimental` → `native_api` → `ui` 指向所需版本的目录，然后[重启 honk](service-management.md)。每个 `native_api` 字段都需要重启，重载不足以生效。`ui: embedded` 仅提供 honk-core 发布构建内嵌的标准版，见[最小配置](minimal-configuration.md)。

要同时使用两个版本，让 honk 在 `/ui/` 提供其中一个，再用任意静态服务器提供另一个目录。按[通过主机名或其他来源访问](install.md#other-origin)允许第二个来源。

## 独立的浏览器设置

两个版本使用相同的 honk 原生 API 和配置。配置修改由两者共享，但各自保存浏览器设置。

## 在线演示

体验[标准版演示](https://demo.daeuniverse.org/)或 [doona lite 演示](https://demo.daeuniverse.org/lite/)。
