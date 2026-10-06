[English](../en/index.md) / 简体中文 / [繁體中文](../zh-TW/index.md)

# doona 文档

doona 是 daeuniverse 引擎共用原生 API 的静态 Web 界面：目前对接 honk，dae 实现同一份契约后也可对接。honk 是用 Rust 编写的 Linux 透明代理引擎，可以自己在 `/ui/` 提供 doona，也可以由任意 Web 服务器提供。doona 显示引擎当前的状态，并管理节点、组、路由规则与配置文件。

[使用示例数据体验演示版](https://demo.daeuniverse.org/)。

![活动页](../screenshots/zh-CN/activity-light.webp)

## 原生 API 状态

本文档说明 doona v0.1.0-beta.16。doona 使用各发布版本附带的 honk-core 构建中的原生 API，构建来自 Glassyiris/honk `feat/native-api` 的 debug 标签。`HONK-SOURCE.txt` 注明附带的构建，见 [honk 版本](requirements.md#honk-version)。上游 daeuniverse/honk `main` 不提供该 API。上游 honk 正式发布之前，配置键与默认值仍可能变化。

安装示例使用 beta.16 文件名。下载前确认[发布页](https://github.com/Zakkaus/doona/releases)已提供对应文件。

## 页面

部署新的网关时，请先阅读系统要求与对应系统的安装页，再按顺序阅读“首次运行”下的最小配置、服务管理与首次登录。首次登录后，请继续阅读“指南”中的界面导览。

1. [系统要求](requirements.md)：内核、honk 构建、浏览器与构建工具。
2. 在 [Debian 或 Ubuntu](install-debian.md)、[Fedora 或 RHEL](install-fedora.md)、[Arch Linux](install-arch.md)、[Gentoo](install-gentoo.md)、[OpenWrt](install-openwrt.md)、[Alpine](install-manual.md#install-alpine) 或[其他系统](install-manual.md)上安装 doona 与 honk-core。
3. [安装详解](install.md)：在一页内完成手动安装，以及从其他来源打开 doona、发行版软件包与更新。
4. [最小配置](minimal-configuration.md)：能提供 doona 的最小配置，以及检查方法。
5. [服务管理](service-management.md)：以 systemd 或 procd 服务运行 honk，启动、停止、重载并查看日志。
6. [首次登录](first-sign-in.md)：创建管理员并检查系统状态。
7. [界面导览](tour.md)：页面、顶部栏、详情面板与更改的提交方式。
8. [观测流量](observe.md)：活动、系统状态、连接、分流、DNS、日志与事件页面。
9. [路由、节点与规则](routing.md)：策略组、节点与订阅、规则与追踪模拟。
10. [配置与设置](config-and-settings.md)：配置页与设置页。
11. [常见操作](common-tasks.md)：常见更改的操作步骤。
12. [配置](configuration.md)：启用原生 API 的 honk 示例配置，以及每个 `native_api` 字段启用的功能。
13. [功能](features.md)：逐项检查 doona 功能所需的设置、各页面读取的资源，以及 doona 在浏览器中保存的设置。
14. [故障排查](troubleshooting.md)：启动错误、状态数据库、缺少原生 API、登录与只读的配置文件。
15. [开发](development.md)：构建与测试 doona、源码布局与 API 契约。

## 链接

- [doona 发布页](https://github.com/Zakkaus/doona/releases)：下载 honk-core 构建
- [honk 快速入门](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues)；引擎问题请报告给 [honk](https://github.com/daeuniverse/honk) 或 [dae](https://github.com/daeuniverse/dae)
