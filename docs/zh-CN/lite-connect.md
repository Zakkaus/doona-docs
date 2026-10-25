[English](../en/lite-connect.md) / 简体中文 / [繁體中文](../zh-TW/lite-connect.md)

<a name="lite-connect"></a>

# 连接 doona lite

将 doona lite 连接到 honk 原生 API，或在没有后端时打开演示。

1. 打开 honk 的 `/ui/` 地址。页面由 honk 提供时，doona lite 会填入后端地址。
2. 从其他来源打开时，在**后端地址**中输入服务器根地址，例如 `http://192.168.1.1:9527`，不含 `/api/v1`。在 honk 中配置[来源访问权限](install.md#other-origin)。
3. 启用 `password_auth` 时，使用管理员密码登录。令牌模式下，在**令牌**中输入配置的 `secret`，然后选择**连接后端**。两个版本使用相同的登录方式。
4. 不连接后端时，选择**试用演示**。演示中的修改仅保存在内存中，重新加载页面后重置。
