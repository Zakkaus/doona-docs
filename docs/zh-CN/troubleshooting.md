[English](../en/troubleshooting.md) / 简体中文 / [繁體中文](../zh-TW/troubleshooting.md)

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

daeuniverse/honk `main` 分支的构建没有原生 API，会以 `unknown experimental setting` 拒绝所有 `native_api` 设置。Glassyiris/honk `feat/native-api` 分支的构建若未启用 `native-api` 功能，启用 `native_api` 时会以 `native-api feature is required` 阻止启动。请执行 `honk-core --version` 检查版本并安装 doona 发行版附带的构建，详见 [honk 版本](requirements.md#honk-version)。

## honk 拒绝 native_api 配置块

- `configuration administration requires a bearer secret or password login`：`config_write: true` 需要 `password_auth: true` 或 `secret`。
- `password login requires an empty secret; a configured secret selects token mode`：两者只能保留一个。
- `password login cannot be combined with anonymous loopback`：删除 `allow_anonymous_loopback`。
- `native API requires a secret, password login, or explicitly anonymous loopback`：`enabled: true` 需要 `secret`、`password_auth: true`，或 loopback `listen` 与 `allow_anonymous_loopback: true`。

`listen` 为 loopback 地址且设置 `allow_anonymous_loopback: true` 时，读取请求无需 Token。配置写入与受保护的设置修改仍需要凭据。此模式仅用于本地开发。

<a name="state-db"></a>

## 状态数据库问题

示例配置设置了 `password_auth: true`，数据库无法打开时 honk 会在启动时退出，日志显示 `state database:` 及原因。Token 模式下 honk 会记录警告并在没有数据库的情况下运行。「设置」仍显示地理数据文件，但来源与计划控件消失。手动更新需要为每个已加载资源配置地址。请在日志中查找原因：

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

1. unavailable：`data_dir` 不存在时由 honk 创建，`state/` 也由 honk 在其中创建。运行 honk 的用户必须能在父目录中创建 `data_dir`，并能写入该目录；使用 [systemd 单元](service-management.md)时该用户为 root。
2. unsafe：`state/` 与 `honk.db` 必须属于该用户，且不授予组或其他用户任何权限。`honk.db` 必须是普通文件，不能是符号链接，也不能在 honk 打开时被替换。
3. locked：等待 `honk-core admin reset` 执行完毕。
4. corrupt：设置 `password_auth: true` 时 honk 会退出。Token 模式下 honk 会将文件移至 `honk.db.corrupt` 并新建数据库；若已存在较早的 `.corrupt` 文件，honk 会保留两者，并在该文件删除之前不使用数据库运行。
5. 修复后重启 honk。

`another honk-core has the state database open` 与 `state database has a foreign application id or a newer schema` 总会阻止启动：请停止另一个实例，或使用写入该数据库的 honk 版本。

<a name="geodata-sources"></a>

## 地理数据来源无法编辑，或自动更新从未运行

honk 正在没有状态数据库的情况下运行，而来源与更新计划都保存在该数据库中。「系统状态」页的「数据路径」卡片会提示状态数据库不可用，即使无法读取数据路径也会显示。`/api/v1/runtime` 的 `degradations` 列表也会列出该项；`<listen>` 为 `listen` 地址，`<token>` 为 `secret`：

```sh
curl -s -H 'Authorization: Bearer <token>' http://<listen>/api/v1/runtime
```

出现 `persistence_unavailable` 条目即可确认，其 `reason` 指出原因，请参阅[状态数据库问题](#state-db)。修复之前，手动更新使用配置中的 `assets.geodata.geosite` 与 `assets.geodata.geoip` 地址；`native_api` 中的下载地址字段是旧别名。

<a name="state-unsafe"></a>

## persistence_unavailable 的 reason 为 unsafe

honk 拒绝使用数据目录中的 `state/` 或其中的 `honk.db`。两者都必须属于运行 honk 的用户，不授予组或其他用户任何权限，且不能是符号链接。本指南使用默认的文件存储模式，目录由 `global.data_dir` 指定，默认为 `/var/lib/honk`；`--data-dir` 不会覆盖此值。执行 `admin reset` 时，将同一目录传给 `--data-dir`。

```sh
ls -ld /var/lib/honk/state /var/lib/honk/state/honk.db
chmod 700 /var/lib/honk/state
chmod 600 /var/lib/honk/state/honk.db
```

只修改这两项，不要递归修改；`/etc/honk` 与 `config.d/` 不受影响。若 `ls` 显示所有者不同，请用 `chown` 将两者改为运行 honk 的用户。之后重启 honk。

OpenWrt 的 `/var` 位于内存中，因此默认的 `/var/lib/honk` 每次重启都会丢失数据库。请按[最小配置](minimal-configuration.md)将数据存放在 `/etc/honk/data`。

<a name="geodata-update"></a>

## 地理数据更新失败并显示 checksum_unavailable

文件已下载，但无法获取 `<url>.sha256sum`。404 不算失败：honk 会保留未经校验的文件。文件下载连续 30 秒无进展或总计超过 10 分钟时超时；校验和请求有独立的 10 秒期限。HTTP 403、429 或路由故障也会让校验和请求失败。可改用其他镜像站；仅当可信镜像站的 `.sha256sum` 地址确定无法使用时，才关闭「SHA-256 校验」。

| 阶段                   | 含义                                                   | 处理方法                                                   |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `checksum_mismatch`    | 文件与其 `.sha256sum` 不符。                           | 改用其他镜像；仅当确认可信镜像的`.sha256sum` 文件有误时，才关闭校验。 |
| `download_timeout`     | 文件下载连续 30 秒无进展，或总计超过 10 分钟。 | 改用较快的路由或较近的镜像站。 |
| `http_status_rejected` | 服务器返回 200 与 404 以外的状态码，包括重定向。       | 改用最终地址；遇到 403 或 429 时稍后重试。                 |
| `http_not_found`       | 文件地址返回 404。                                     | 检查地址。                                                 |
| `connection_failed`    | honk 无法连接到服务器或节点。                          | 检查节点；直接下载时检查 `bootstrap_resolver`。            |
| `tls_failed`           | TLS 握手或证书检查失败。                               | 检查网关的时钟与地址的主机名。                             |
| `group_unavailable`    | 下载所经的组没有可用节点。                             | 在“策略”页检查该组。                                       |
| `route_blocked`        | 路由规则将下载主机导向 `block`。                       | 修改匹配该主机的规则。                                     |
| `asset_too_large`      | 文件超过 honk 的大小上限。                             | 确认地址指向地理数据文件。                                 |
| `invalid_source`       | 地址不是有效的 HTTP 或 HTTPS 地址。                    | 修正地址。                                                 |

## 固定映射时出现 Invalid argument

`/sys/fs/bpf` 不是 bpffs。请按[系统要求](requirements.md#requirements)挂载。

## 内核版本过低

honk 会在挂载前拒绝低于 6.12 的内核。验证器拒绝编译后的分流程序时，请使用启用 BPF 与 BTF 的 Linux 6.12 或更高版本，并保留完整的验证器日志以便报告。

## 停止 OpenWrt 防火墙会删除 honk 的 nft 表

`service firewall stop` 会删除 honk 的 nft 表，NFQUEUE staging 随之失效。重新启动防火墙后，执行 `/etc/init.d/honk-core restart`。`fw4 reload` 和 `service firewall restart` 不会删除该表。

<a name="no-native-api"></a>

## 没有原生 API，或 /api、/ui/ 返回 404

从 `journalctl -u honk-core -b` 的本次开机日志中找到最近一条 `honk-core <版本> starting`，再与 [honk 版本](requirements.md#honk-version)对照。

- 无法连接 `listen` 地址：honk 未运行、`enabled` 不是 `true`，或 `listen` 指向其他地址。`enabled: false` 时监听不会启动。
- `/api` 返回 404：该地址上的服务没有原生 API，例如 daeuniverse/honk `main` 分支的构建。doona 的登录页面此时显示“此 honk 构建未提供原生 API”。请安装 doona 发行版附带的构建。
- 只有 `/ui/` 返回 404：原生 API 正在运行，但 `ui` 为空。
- honk 启动时以 `failed to inspect native UI directory`、`failed to inspect native UI index.html` 或 `native UI index.html must be a regular file` 退出：请按[安装 doona 并启动](install.md#doona)将 doona 解压到 `ui` 目录。

<a name="sign-in"></a>

## 登录与跨域失败

- 首次设置只能在网关本机或私有网络中的客户端上完成。
- 「设置」中出现网络或跨域请求失败：无法通过 `listen` 地址访问 honk，或 doona 所在来源未列入 `allow_origins` 与 `allowed_hosts`。
- 通过 `openwrt.lan` 访问 API 时，若主机名与端口不在 `native_api` 的 `allowed_hosts` 中，会返回 403。请改用局域网 IP，或在 `native_api` 中加入 `allowed_hosts: 'openwrt.lan:9527'` 并重启 honk。未指定端口的主机条目表示端口 80。
- 忘记密码：停止 honk，执行 `sudo /usr/local/bin/honk-core admin reset`（在 root shell 中去掉 `sudo`；OpenWrt 上执行 `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`），再启动 honk 重新设置。
- HTTPS 页面无法访问 HTTP API，请参阅[从其他来源打开 doona](install.md#other-origin)。

<a name="read-only"></a>

## 只读的配置文件

满足下列任一条件时，doona 会将配置文件标记为只读：

- `config_write` 不是 `true`。
- 既没有 `password_auth: true`，也没有 `secret`。
- 文件在 `native_api` 或 `clash_api` 中包含 `secret`，或包含与 8 字节以上监听密钥相同的文本。
- honk 仍在加载配置文件，或其写入协调器未运行。
- 仅在以 `--store db` 运行时出现，本文档不使用该模式：已激活的修订未能记录，导致写入被阻止。

请将所有密钥移入 `config.d/api.dae`，并在修改 `native_api` 后重启 honk。

## 配置写入被拒绝

honk 返回已知的 `details.reason` 时，doona 以界面语言显示原因。原因未知或缺失时，配置写入拒绝消息保留 honk 的原文。

| 原因 | 处理方法 |
| --- | --- |
| `writes_disabled` | 启用 `config_write`，并设置 API 密钥或 `password_auth: true`，然后重启 honk 并重新登录。 |
| `configuration_unavailable` | 检查 honk 的配置和服务状态，然后重试。 |
| `listener_secret_source` | 文件声明了监听器密钥，或此次写入会新增此类声明。须在磁盘上编辑。 |
| `listener_secret_in_content` | 内容或源路径包含 API 密钥值。使用未在其他内容和路径中出现的随机密钥，然后重启 honk 并重新登录。 |
| `listener_settings_changed` | 界面写入时须保持 `experimental.native_api`、`clash_api.secret` 和 `global.data_dir` 不变。在磁盘上修改这些设置，然后重启 honk。 |
| `credential_sources_changed` | 声明 API 密钥的配置源已更改。重新加载 honk，然后重试。 |
| `import_entry_changed` | 导入入口与当前数据库入口不同。使用 `-c` 指定当前入口启动 honk，然后重试导入。 |
| `unsafe_path` | 使用允许的配置目录中的常规文件，然后重试。 |

失败提示中的「复制错误」复制该请求的错误详情。「设置」中的「关于」提供「复制最近错误」，可复制内存中保留的最多 20 条最近错误，不含密钥与请求正文。重新加载页面会清除记录。

写入或已接受操作的结果未知时，不要假定失败或直接重复操作。请检查重新加载的配置。已接受的导入或修订恢复可在重新打开「备份与修订」后点击「刷新」，查询原操作。需重启的诊断表示没有写入；请在磁盘上修改列出的设置，再[重启 honk](service-management.md)。

## “日志”与“事件”中没有启动消息

「设置」中的「日志记录」默认为「按日志需求」。本次固定的 honk 构建在客户端连接时开始记录，并可在 60 秒宽限期内继续记录；此前的启动消息不会补录。请改为查看系统日志：

```sh
logread -e honk                  # OpenWrt
journalctl -u honk-core -b       # systemd
```

## “连接”或“规则”页一直为空

「流程记录」设为「按流程需求」时，honk 只在客户端请求时记录。doona 在「连接」「规则」或「分流」页打开时请求流程，最后一次需求结束后继续记录 60 秒。请检查「设置」中的「流程记录」：「常开」持续记录，「关闭」停止记录；配置中禁止的记录功能不能在此启用。

## “连接”页只显示局域网地址，全部直连

检查 `lan_interface`：在 OpenWrt 上设为 `br-lan`，让 honk 处理局域网设备的流量。使用旁路由时，还要确认客户端的网关指向旁路由的局域网地址。参见[最小配置](minimal-configuration.md)。

## 升级后 doona 仍显示旧版本

Service worker 在更新完成前会提供缓存的版本。请刷新页面一到两次，或关闭所有 doona 标签页后重新打开。

使用 `ui: embedded` 时，界面版本由 honk 构建固定。本次发布附带的 honk 构建嵌入 beta.12；请安装独立的 beta.13 界面，并将 `ui` 指向其目录以使用新版界面。

## 通过 HTTP 登录时出现 crypto.randomUUID is not a function

0.1.0-beta.8 之前的 doona 需要安全上下文才能调用此函数，而局域网上的纯 HTTP 不属于安全上下文。请将 doona 升级到 0.1.0-beta.8 或更高版本。
