[English](../en/troubleshooting.md) · 简体中文 · [繁體中文](../zh-TW/troubleshooting.md)

<a name="troubleshooting"></a>

# 故障排查

<a name="unknown-setting"></a>

## native_api 设置写在 native_api { } 之外

`native_api` 的字段直接写在 `experimental` 下，honk 因此拒绝该配置。`fatal error, shutting down:` 一行会给出设置路径与消息，例如 `experimental.ui: native API setting belongs inside native_api { }`。`enabled` 与 `secret` 也属于其他配置块，因此 honk 对这两个字段只报告 `unknown experimental setting`。请将字段移入 `native_api { }`。

```dae
# Wrong: "native API setting belongs inside native_api { }"
experimental {
    ui: '/usr/share/doona'
}

# Wrong: "unknown experimental setting"
experimental {
    enabled: true
}

# Right
experimental {
    native_api {
        enabled: true
        password_auth: true
        ui: '/usr/share/doona'
    }
}
```

由 main 分支构建的 honk 没有原生 API，会以 `unknown experimental setting` 拒绝整个 `native_api { }` 配置块。请执行 `honk-core --version` 检查版本并安装 `debug` 版本，详见 [honk 版本](requirements.md#honk-version)。

## honk 拒绝 native_api 配置块

- `configuration administration requires a bearer secret or password login`：`config_write: true` 需要 `password_auth: true` 或 `secret`。
- `password login requires an empty secret; a configured secret selects token mode`：两者只能保留一个。
- `password login cannot be combined with anonymous loopback`：删除 `allow_anonymous_loopback`。
- `native API requires a secret, password login, or explicitly anonymous loopback`：`enabled: true` 需要 `password_auth: true` 或 `secret`。

<a name="state-db"></a>

## 状态数据库问题

示例配置设置了 `password_auth: true`，数据库无法打开时 honk 会在启动时退出，日志显示 `state database:` 及原因。Token 模式下 honk 会记录警告并在没有数据库的情况下运行：地理数据来源卡片消失，只有同时设置两个下载地址，“更新”按钮才会保留。请在日志中查找原因：

```sh
sudo journalctl -u honk-core | grep -i 'state database'
sudo ls -la /var/lib/honk/state/
```

日志也保留之前各次启动的消息，请查看最近一次启动的记录。

```text
state database is unavailable
state database path is unsafe
state database is locked by `honk-core admin reset`
state database is corrupt
```

1. unavailable：`data_dir` 必须存在，并且运行 honk 的用户可写；使用[安装](install.md#install)中的 systemd 单元时该用户为 root。`state/` 由 honk 自行创建。
2. unsafe：`state/` 与 `honk.db` 必须属于该用户，且不授予组或其他用户任何权限。`honk.db` 必须是普通文件，不能是符号链接，也不能在 honk 打开时被替换。
3. locked：等待 `honk-core admin reset` 执行完毕。
4. corrupt：设置 `password_auth: true` 时 honk 会退出。Token 模式下 honk 会将文件移至 `honk.db.corrupt` 并新建数据库；若已存在较早的 `.corrupt` 文件，honk 会保留两者，并在该文件删除之前不使用数据库运行。
5. 修复后重启 honk。

`another honk-core has the state database open` 与 `state database has a foreign application id or a newer schema` 总会阻止启动：请停止另一个实例，或使用写入该数据库的 honk 版本。

## 固定映射时出现 Invalid argument

`/sys/fs/bpf` 不是 bpffs。请按[系统要求](requirements.md#requirements)挂载。

## 内核版本过低

honk 会在挂载前拒绝低于 6.12 的内核。验证器拒绝编译后的分流程序时，请使用启用 BPF 与 BTF 的 Linux 6.12 或更高版本，并保留完整的验证器日志以便报告。

<a name="no-native-api"></a>

## 没有原生 API，或 /api、/ui/ 返回 404

从 `journalctl -u honk-core -b` 的本次开机日志中找到最近一条 `honk-core <版本> starting`，再与 [honk 版本](requirements.md#honk-version)对照。

- 无法连接 `listen` 地址：honk 未运行、`enabled` 不是 `true`，或 `listen` 指向其他地址。`enabled: false` 时监听不会启动。
- `/api` 返回 404：该地址上的服务没有原生 API，例如由 main 分支构建的 honk。doona 的登录页面此时显示“此 honk 构建未提供原生 API”。请安装 `debug` 版本。
- 只有 `/ui/` 返回 404：原生 API 正在运行，但 `ui` 为空。
- honk 启动时以 `failed to inspect native UI directory`、`failed to inspect native UI index.html` 或 `native UI index.html must be a regular file` 退出：请按[安装 doona 并启动](install.md#doona)将 doona 解压到 `ui` 目录。

<a name="sign-in"></a>

## 登录与跨域失败

- 首次设置只能在网关本机或私有网络中的客户端上完成。
- 设置中显示“网络连接失败”或“网络或跨域请求失败”：无法通过 `listen` 地址访问 honk，或 doona 所在来源未列入 `allow_origins` 与 `allowed_hosts`。
- 忘记密码：停止 honk，执行 `sudo honk-core admin reset`，再启动 honk 重新设置。
- HTTPS 页面无法访问 HTTP API，请参阅[从其他来源打开 doona](install.md#other-origin)。

<a name="read-only"></a>

## 只读的配置文件

满足下列任一条件时，doona 会将配置文件标记为只读：

- `config_write` 不是 `true`。
- 既没有 `password_auth: true`，也没有 `secret`。
- 文件在 `native_api` 或 `clash_api` 中包含 `secret`，或包含与 8 个字符以上监听密钥相同的文本。
- honk 仍在加载配置文件，或其写入协调器未运行。
- 仅在以 `--store db` 运行时出现，本文档不使用该模式：已激活的修订未能记录，导致写入被阻止。

请将所有密钥移入 `config.d/api.dae`，并在修改 `native_api` 后重启 honk。
