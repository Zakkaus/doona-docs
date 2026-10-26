[English](../en/index.md) / 简体中文 / [繁體中文](../zh-TW/index.md)

# doona 文档

doona 是 daeuniverse 引擎共用原生 API 的静态 Web 界面：目前对接 honk，dae 实现同一份契约后也可对接。honk 是用 Rust 编写的 Linux 透明代理引擎，可以自己在 `/ui/` 提供 doona，也可以由任意 Web 服务器提供。doona 显示引擎当前的状态，并管理节点、组、路由规则与配置文件。

<a name="choose-edition"></a>

## 选择版本

| 标准版 | doona lite |
| --- | --- |
| 适合管理配置并观测流量 | 适合只需编辑配置的初学者 |
| 流量页面、配置表单、配置源编辑器和追踪 | 节点、订阅、组、路由、DNS 和全局设置 |
| [安装标准版](install.md#doona) | [安装 doona lite](lite.md#lite-install) |
| [标准版演示](https://demo.daeuniverse.org/) | [lite 演示](https://demo.daeuniverse.org/lite/) |

功能与切换方式见[标准版与 doona lite](editions.md)。

[使用示例数据体验演示版](https://demo.daeuniverse.org/)。

![活动页](../screenshots/zh-CN/activity-light.webp)

## 原生 API 状态

本文档介绍 doona v0.1.0-beta.19。doona 使用各发布版本附带的 honk-core 构建中的原生 API，构建来自 Glassyiris/honk `feat/native-api` 的 debug 标签。`HONK-SOURCE.txt` 注明附带的构建，见 [honk 版本](requirements.md#honk-version)。上游 daeuniverse/honk `main` 不提供该 API。上游 honk 正式发布之前，配置键与默认值仍可能变化。

安装示例使用 beta.19 文件名与对应的 honk 标签 `debug.2026.10.9.native-api.2`。附件已在[发布页](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-beta.19)发布。

## 页面

部署新的网关时，先阅读系统需求，安装 honk 和所选版本，再依次阅读最小配置与服务管理。之后继续阅读标准版的首次登录或连接 doona lite。

1. 入门：[标准版与 doona lite](editions.md)、[系统要求](requirements.md)。
2. 安装与首次运行：[在 Debian 或 Ubuntu 上安装](install-debian.md)、[在 Fedora 或 RHEL 上安装](install-fedora.md)、[在 Arch Linux 上安装](install-arch.md)、[在 Gentoo 上安装](install-gentoo.md)、[在 OpenWrt 上安装](install-openwrt.md)、[在其他系统上安装](install-manual.md)、[安装详解](install.md)、[最小配置](minimal-configuration.md)、[服务管理](service-management.md)。
3. 标准版：[首次登录](first-sign-in.md)、[界面导览](tour.md)、[观测流量](observe.md)、[路由、节点与规则](routing.md)、[配置与设置](config-and-settings.md)、[常见操作](common-tasks.md)、[功能](features.md)。
4. doona lite：[doona lite](lite.md)、[连接 doona lite](lite-connect.md)、[doona lite 常见操作](lite-tasks.md)。
5. 参考：[配置](configuration.md)、[故障排查](troubleshooting.md)、[开发](development.md)。

## 链接

- [doona 发布页](https://github.com/Zakkaus/doona/releases)：下载 honk-core 构建
- [honk 快速入门](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues)；引擎问题请报告给 [honk](https://github.com/daeuniverse/honk) 或 [dae](https://github.com/daeuniverse/dae)
