[繁體中文](../zh-TW/quick-start.md) / 简体中文 / [English](../en/quick-start.md)

# 快速入门

使用 honk 内嵌的 doona，无需另行下载界面文件。

## 1. 安装 honk

在 64 位 OpenWrt 或 ImmortalWrt 25.12 上，从 [daeuniverse 软件源](https://openwrt.daeuniverse.org/zh-cn/)安装 honk。

其他 Linux 系统请从 [honk 发布页](https://github.com/daeuniverse/honk/releases)下载名称含 `full` 的压缩包，写入配置后按[服务管理](service-management.md)启动服务。

## 2. 配置 honk

将以下块写入 honk 配置，替换原有的 `native_api` 块：

```dae
experimental {
    native_api {
        enabled: true
        listen: '127.0.0.1:9527'
        password_auth: true
        config_write: true
        ui: 'embedded'
    }
}
```

其他选项见[配置参考](configuration.md)。[启动或重启 honk](service-management.md)后，更改才会生效。

## 3. 打开 doona

在运行 honk 的机器上打开 <http://127.0.0.1:9527/>。若 honk 在路由器上，请在电脑执行以下命令，将 `<router>` 替换为路由器的 SSH 地址，并保持连接：

```sh
ssh -L 9527:127.0.0.1:9527 root@<router>
```

在电脑打开相同网址。首次访问会创建管理员，详见[首次登录](first-sign-in.md)。

若要改用 doona lite，设置 `ui: 'embedded-lite'`（自 honk v0.1.0-beta.4 起提供），详见 [doona lite](lite.md)。
