[English](../en/features.md) / 简体中文 / [繁體中文](../zh-TW/features.md)

<a name="features"></a>

# 功能

首先确认网关能够转发流量。将示例订阅与节点替换为可用的订阅与节点，然后在真实的局域网客户端上分别测试直连与代理的 TCP、UDP 以及 DNS。`honk-core is running`、`dae0` 链路或可访问的 API 都不能证明流量正常。

## 逐项检查功能

[示例配置](configuration.md#config)提供下表功能所需的设置；替换占位的订阅与节点后，再逐项检查实际运行情况。

| 功能                               | 正常时的表现                                                                           | 依赖的配置                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 登录与所有页面                     | 登录后，活动页显示流量与连接。                                                         | `enabled: true`，以及 `password_auth: true` 或 `secret`                                                                        |
| 配置：编辑文件                     | 来源列表中的每个文件打开后都没有只读标记，应用后会校验并重载。                         | `config_write: true`；文件中不含密钥                                                                                           |
| 配置：新建文件                     | “新建文件”会创建由主文件 `include` 模式引入的 `.dae` 文件，例如 `config.d/rules.dae`。 | `config_write: true`                                                                                                           |
| 策略：编辑组                       | 组卡片提供“编辑”，保存后生效。                                                         | `config_write: true`；组位于主文件，且主文件不含密钥                                                                           |
| 节点：添加节点与订阅               | 节点页提供“粘贴节点链接”与“添加订阅”。                                                 | `config_write: true`；主文件中不含密钥                                                                                         |
| 节点：刷新订阅                     | 每个订阅行都有“刷新”。                                                                 | 存在 `subscription` 条目，且 honk 的订阅服务正在运行                                                                           |
| 设置：地理数据来源                 | 地理数据卡片列出可编辑的来源。                                                         | 状态数据库                                                                                                                     |
| 设置：地理数据更新                 | 地理数据卡片的“更新”按钮可用。                                                         | `config_write: true`；`data_dir` 中有 `geosite.dat` 与 `geoip.dat`；状态数据库，或同时设置 `geosite_download_url` 与 `geoip_download_url` |
| 设置：后端选项                     | “流程记录”可设为“按流程需求”“常开”或“关闭”，“日志记录”与“DNS 记录”可设为“随面板”“常开”或“关闭”。               | `record_flows`、`record_logs`、`record_dns_log`                                                                                |
| 设置：地理数据校验                 | 可信镜像的 `.sha256sum` 地址返回错误时可关闭“SHA-256 校验”。                            | 后端提供 `verify_checksum` 且状态数据库可用                                                                                   |
| 活动：流量与内存历史               | 历史图表在最多 10 分钟内逐步填满。                                                     | `record_traffic`、`record_memory`                                                                                              |
| 日志                               | 打开日志页时持续出现日志。                                                             | `record_logs`                                                                                                                  |
| DNS：查询、缓存与记录              | 列出查询与缓存；打开页面时记录持续增加。                                               | 记录需要 `record_dns_log`；`dns` 配置段                                                                                        |
| 连接：关闭与编辑命中规则           | 关闭连接，或在规则页打开可编辑的命中规则，只修改其出站。                               | `enabled: true`；编辑需要规则与可写来源                                                                                       |
| 规则：路由规则、DNS 规则与流程     | 编辑路由规则、DNS request 规则与 DNS response 规则；查看命中、流程记录和追踪模拟。      | 路由规则需要 `routing`；流程需要 `record_flows`；DNS 规则须由后端列出；编辑需要 `config_write: true` 和可写来源                                   |
| DNS：根据解析记录新增规则          | 从解析记录为当前域名及其子域名新增 DNS request 规则。                                  | 后端列出 DNS 规则且配置可写                                                                                                    |
| 策略：检测设置                     | 后端允许修改时，可调整组的“容忍差值”与“空闲超时”。                                     | `groups` 及 `mutable_config` 中对应的字段                                                                                     |
| 概览：运行时降级                   | honk 在故障恢复后以降级方式运行时，“数据路径”卡片显示警告。                            | `runtime.degradations`                                                                                                          |
| 延迟测试                           | 节点的“测试”与组的“测试全部”显示延迟。                                                 | `enabled: true`；私有地址目标还需要 `probe_allowed_cidrs`                                                                      |
| 事件                               | 事件页显示事件流。                                                                     | `enabled: true`                                                                                                                |

默认的“按流程需求”模式下，连接页与规则页打开时会请求流程；最后一次请求结束后继续记录 60 秒。日志与 DNS 记录在有面板连接时进行。已允许但处于空闲状态的记录器属于正常情况。

<a name="still-missing"></a>

## 仍有功能缺失时

- 修改 `native_api` 后没有重启 honk。重载不会应用这些字段。
- 缺少 `config_write: true`。`native_api` 的字段直接写在 `experimental` 下时，honk 会以 [`unknown experimental setting`](troubleshooting.md#unknown-setting) 拒绝启动。
- 既没有 `password_auth: true`，也没有 `secret`。此时若设置了 `enabled: true`，honk 会拒绝启动。
- 文件包含密钥或与密钥相同的文本，因此 doona 将其显示为[只读](troubleshooting.md#read-only)。
- honk 是早期的 `feat/native-api` 构建，因此地理数据卡片没有来源设置。请安装 doona 发布版本附带的构建，见 [honk 版本](requirements.md#honk-version)。
- Token 模式下状态数据库未能打开，因此地理数据来源卡片被隐藏，详见[状态数据库问题](troubleshooting.md#state-db)。
- 仅在以 `--store db` 运行时出现，本文档不使用该模式：honk 未能记录的修订会阻止后续写入，直到下一次成功激活配置。

## 登录之后

界面指南与操作步骤见[文档目录](index.md)。

每一次配置来源的写入都经过引擎。doona 带着读取时的哈希发送（`If-Match`）；磁盘上已变动的文件会返回 412，不会写入。引擎先验证整组来源再保存并重载，重载失败时仍沿用先前的世代。预先验证不会写入，脱敏后的文本也不会写回。运行时设置与组选择走各自的端点，各有检查。

<a name="pages"></a>

## 页面与所需资源

![策略页](../screenshots/zh-CN/policies-light.webp)

| 页面 | 内容                                                                                                       | 需要的资源                          |
| ---- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 活动 | 出站模式、流量与内存、活动连接、节点延迟、出站用量、流量最高的客户端、通知                                 | —                                   |
| 系统状态 | 引擎与 eBPF 状态、流量计数、后端能力、运行时降级、状态 JSON 导出                                   | `runtime`                           |
| 连接 | 实时连接的来源、目的、规则、链路与流量；关闭连接、编辑命中规则、可在网址中带入筛选条件                         | `connections`                       |
| 分流 | 分流总览与流程记录，含每条记录的追踪步骤 | `flows` |
| DNS  | 查询与解析结果、缓存、解析记录；从解析记录新增 DNS request 规则；清空缓存                               | `dns_query`、`dns_log`、`dns_cache` |
| 策略 | 组、成员与健康；选择、手动固定、恢复自动选择、测试、编辑与检测设置                                 | `groups`                            |
| 规则 | 路由规则、DNS 规则与追踪模拟；后端列出 DNS 规则时才显示对应分栏                  | `rules`、`flows`、`routing_trace`   |
| 节点 | 订阅与更新间隔、配置内节点、新增与移除、测试、加入组                                                       | `nodes`、`providers`                |
| 配置 | 来源与诊断、带校验的编辑器、快速设置、导出                                                                 | `config`                            |
| 事件 | 后端事件流                                                                                                 | `events`                            |
| 日志 | 日志流，可按级别与模块筛选、暂停、导出                                                                     | `logs`                              |
| 设置 | 后端、运行时设置与后端操作、语言、外观与配色                                                               | —                                   |

所有页面都保留在导航栏中。只有 [registry.ts](https://github.com/Zakkaus/doona/blob/main/src/shell/registry.ts) 为页面列出的资源全部不可用时，页面才会标为不可用；打开后会显示不可用提示。任何页面按 `Ctrl K`（macOS 为 `⌘ K`）可搜索页面、连接、节点、组、订阅、规则与来源。

![规则页](../screenshots/zh-CN/rules-light.webp)

## 主题与配色

![所有配色的浅色和深色模式](../screenshots/palettes.webp)

| 配色 | 浅色 | 深色 |
| ---- | ---- | ---- |
| Rosé Pine Dawn / Main | [Dawn](../screenshots/en/theme-rose-pine-light.webp) | [Main](../screenshots/en/theme-rose-pine-main-dark.webp) |
| Rosé Pine Dawn / Moon | [Dawn](../screenshots/en/theme-rose-pine-light.webp) | [Moon](../screenshots/en/theme-rose-pine-dark.webp) |
| Catppuccin Latte / Frappé | [Latte](../screenshots/en/theme-catppuccin-light.webp) | [Frappé](../screenshots/en/theme-catppuccin-frappe-dark.webp) |
| Catppuccin Latte / Macchiato | [Latte](../screenshots/en/theme-catppuccin-light.webp) | [Macchiato](../screenshots/en/theme-catppuccin-macchiato-dark.webp) |
| Catppuccin Latte / Mocha | [Latte](../screenshots/en/theme-catppuccin-light.webp) | [Mocha](../screenshots/en/theme-catppuccin-dark.webp) |
| Nord | [Snow Storm](../screenshots/en/theme-nord-light.webp) | [Polar Night](../screenshots/en/theme-nord-dark.webp) |
| Kary Pro Colors | [浅色](../screenshots/en/theme-kary-light.webp) | [深色](../screenshots/en/theme-kary-dark.webp) |
| Ant Design | [默认](../screenshots/en/theme-antd-light.webp) | [深色](../screenshots/en/theme-antd-dark.webp) |
| Arco Design | [浅色](../screenshots/en/theme-arco-light.webp) | [深色](../screenshots/en/theme-arco-dark.webp) |
| Semi Design | [浅色](../screenshots/en/theme-semi-light.webp) | [深色](../screenshots/en/theme-semi-dark.webp) |
| 玻璃 | [浅色](../screenshots/en/theme-glass-light.webp) | [深色](../screenshots/en/theme-glass-dark.webp) |
| 中国 | [打卡版](../screenshots/en/theme-qiangguo-light.webp) | [通宵版](../screenshots/en/theme-qiangguo-dark.webp) |

## 浏览器中保存的设置

doona 没有用于存储自身界面设置的服务器端存储。配置与运行时变更通过引擎写入；doona 的界面设置存储在浏览器中，范围限于该网站来源的 `localStorage`。下表列出主要的键，完整列表见 [storage.ts](https://github.com/Zakkaus/doona/blob/main/src/api/storage.ts)。

| 设置         | 键               | 值                                                                                                                                                                                                                                                                                                                    |
| ------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 后端         | `doona-profiles` | `{id, name, api, token}` 的 JSON 数组；`api` 是服务器根地址或代理前缀，留空或 `mock` 使用演示数据。密码模式下，`token` 为空，honk 管理会话，doona 将会话 token 保存在当前标签页的 `sessionStorage` 中。token 模式下，API 请求通过 `Authorization` 头发送 token。配对链接可能把 token 放在网址片段中，并在加载后移除。 |
| 使用中的后端 | `doona-profile`  | 所选后端的 `id`                                                                                                                                                                                                                                                                                                       |
| 语言         | `doona-lang`     | `zh-TW`、`zh-CN`、`en`；未设置时按浏览器语言                                                                                                                                                                                                                                                                          |
| 配色方案     | `doona-scheme`   | `system`（默认）、`light`、`dark`                                                                                                                                                                                                                                                                                     |
| 配色         | `doona-palette`  | `rose-pine/moon`（默认）；其他值见 [palettes.ts](https://github.com/Zakkaus/doona/blob/main/src/shell/palettes.ts) 的 `PaletteId`                                                                                                                                                                                                                          |
| 字标         | `doona-wordmark` | `gradient`（默认）、`plain`                                                                                                                                                                                                                                                                                           |

保存的主题与语言在第一帧之前就应用，重新加载不会闪出默认外观。

在 HTTPS 或 localhost 下，service worker 预先缓存应用外壳，并缓存字体与图标，离线也能打开页面，网站可安装为应用。API 响应一律不缓存。安全问题的报告方式见 [SECURITY.md](https://github.com/Zakkaus/doona/blob/main/.github/SECURITY.md)。

![深色模式的活动页](../screenshots/zh-CN/activity-dark.webp)
