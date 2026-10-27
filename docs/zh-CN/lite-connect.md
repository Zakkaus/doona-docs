[English](../en/lite-connect.md) / 简体中文 / [繁體中文](../zh-TW/lite-connect.md)

<a name="lite-connect"></a>

# 连接 doona lite

将已安装或独立托管的 lite 页面连接到 honk 原生 API。尚未安装时，先阅读 [doona lite](lite.md#lite-install)。

## 1. 选择后端

1. 打开 lite 页面；由 honk 托管时，使用其 `/ui/` 地址。
2. 在**后端地址**输入服务器根地址，例如 `http://192.168.1.1:9527`，不要加 `/api/v1`。
3. 选择**继续**，发现登录方式。

使用独立托管的页面或主机名时，先配置[主机名与来源访问](install.md#other-origin)。发现失败时，查看[登录要求](feature-requirements.md#req-sign-in)。

## 2. 登录

| 表单 | 操作 |
| --- | --- |
| **设置管理员** | 输入**用户名**、**密码**和**确认密码**，选择**创建并登录**。账号格式见[首次登录](first-sign-in.md)，创建条件见[登录要求](feature-requirements.md#req-sign-in)。 |
| **登录** | 输入已有 honk 管理员的**用户名**和**密码**，选择**登录**。 |
| 令牌字段 | 在**令牌**中输入已配置的密钥，选择**连接后端**。 |

连接后，继续阅读 [doona lite 常用任务](lite-tasks.md)。凭据被拒绝时，查看[登录故障排查](troubleshooting.md#sign-in)。

## 不连接后端体验界面

在连接页面选择**试用演示**，使用示例数据。重新加载页面会重置演示中的修改。
