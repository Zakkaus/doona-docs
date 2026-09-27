[English](../en/first-sign-in.md) · 简体中文 · [繁體中文](../zh-TW/first-sign-in.md)

# 首次登录

本页在浏览器中打开 doona，创建管理员账户，并检查 doona 是否显示正在运行的 honk。honk 必须处于运行状态，即[服务管理](service-management.md)完成后的状态。

## 开始之前

- 局域网中的电脑或手机，或网关本机。honk 只接受来自本机、私有网络或链路本地地址的管理员创建请求。
- [最小配置](minimal-configuration.md)中设置的 `listen` 地址，例如 `192.168.1.1:9527`。

## 1. 打开 doona

在浏览器中打开以下地址，并把 `192.168.1.1` 换成你的地址：

```text
http://192.168.1.1:9527/ui/
```

doona 在同一地址找到 honk 的 API，并将其保存为后端。由于尚未创建管理员，页面标题为“创建管理员”，包含“用户名”“密码”“确认密码”三个字段。

## 2. 创建管理员

1. 在“用户名”中输入 1 至 64 个字符，只能包含英文字母、数字、`_`、`.` 与 `-`。
2. 在“密码”中输入 8 至 128 个字符的密码，并在“确认密码”中再输入一次。
3. 选择“创建并登录”。

doona 登录后打开“活动”页。honk 把账户保存在状态数据库 `/var/lib/honk/state/honk.db` 中（OpenWrt 上为 `/etc/honk/data/state/honk.db`）。此后页面标题变为“登录”，要求输入这组用户名与密码。

## 3. 检查概览

在侧边导航栏中选择“概览”。honk 运行时，该页显示：

- 页面顶部的“运行中”。
- “引擎”卡片：“引擎”下为 `honk` 与 `honk-core --version` 输出的版本，例如 `honk debug.2026.9.28.native-api.1`；“API”下为 `dae/honk-native v1 (draft)`；“构建”下为 honk 的提交与所安装构建的 target。
- “后端能力”卡片，列出这个 honk 提供的功能，例如“连接”“日志”“配置”。

侧边导航栏底部显示同一个 honk 版本。在有流量经过 honk 之前，流量计数保持为 0。

至此设置完成。如需让局域网设备经过 honk、加入节点与规则，请参阅[配置](configuration.md#config)与[功能](features.md#features)。

## 遇到问题时

| 看到的内容                                                     | 原因与处理                                                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 浏览器无法连接                                                 | honk 没有运行，或地址与 `listen` 不一致。请按[服务管理第 3 步](service-management.md)检查，并在网关上执行 `curl http://192.168.1.1:9527/api`。网关上的防火墙也可能拦截 9527 端口。 |
| “此 honk 构建未提供原生 API”                                | 已安装的 honk-core 没有原生 API。请安装 doona 发布版本附带的构建，见 [honk 版本](requirements.md#honk-version)。                                                     |
| “后端只接受来自本机、私有网络或链路本地地址的管理员创建请求。” | 浏览器从公网地址访问了 honk。请在局域网设备或网关本机上打开 doona。                                                                                                |
| “用户名或密码错误。”                                        | 重新输入。如需替换忘记密码的管理员，先停止 honk，执行 `sudo /usr/local/bin/honk-core admin reset`（在 root shell 中去掉 `sudo`；OpenWrt 上执行 `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`），再启动 honk，页面会重新显示创建管理员。                                        |
| 显示“需要 Token”而不是创建管理员                           | `api.dae` 设置了 `secret` 而不是 `password_auth: true`。请把该 secret 作为 Token 输入，或按[最小配置](minimal-configuration.md)修改 `api.dae` 后重启 honk。          |

更多内容见[登录问题](troubleshooting.md#sign-in)。
