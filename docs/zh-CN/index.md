[English](../en/index.md) · 简体中文 · [繁體中文](../zh-TW/index.md)

# doona 文档

doona 是 daeuniverse 引擎共用原生 API 的静态 Web 界面：目前对接 honk，dae 实现同一份契约后也可对接。honk 是用 Rust 编写的 Linux 透明代理引擎，可以自己在 `/ui/` 提供 doona，也可以由任意 Web 服务器提供。doona 显示引擎当前的状态，并管理节点、组、路由规则与配置文件。

[使用示例数据体验演示版](https://demo.daeuniverse.org/)。

![活动页](../screenshots/zh-CN/activity-light.webp)

## 原生 API 状态

doona 依赖 honk 的原生 API。该 API 目前只存在于 Glassyiris/honk 的 `feat/native-api` 分支及其滚动发布的 `debug` 版本中。本文档已对照 `debug.2026.9.26.native-api.4`（提交 `5d8f32c1`）核对。上游 honk 正式发布该 API 之前，配置键与默认值仍可能变化。

## 页面

新部署网关时，请按顺序阅读前四页。

1. [系统要求](requirements.md)：内核、honk 构建、浏览器与构建工具。
2. [安装](install.md)：安装 honk、doona 与 systemd 服务，启动 honk 并登录，以及日常更新。
3. [配置](configuration.md)：启用原生 API 的 honk 示例配置，以及每个 `native_api` 字段启用的功能。
4. [功能](features.md)：逐项检查 doona 功能所需的设置、各页面读取的资源，以及 doona 在浏览器中保存的设置。
5. [故障排查](troubleshooting.md)：启动错误、状态数据库、缺少原生 API、登录与只读的配置文件。
6. [开发](development.md)：构建与测试 doona、源码布局与 API 契约。

## 链接

- [doona 发布页](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` 版本](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk 快速入门](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues)；引擎问题请报告给 [honk](https://github.com/daeuniverse/honk) 或 [dae](https://github.com/daeuniverse/dae)
