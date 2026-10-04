[English](../en/features.md) / 简体中文 / [繁體中文](../zh-TW/features.md)

<a name="features"></a>

# 功能

首先确认网关能够转发流量。将示例订阅与节点替换为可用的订阅与节点，然后在真实的局域网客户端上分别测试直连与代理的 TCP、UDP 以及 DNS。`honk-core is running`、`dae0` 链路或可访问的 API 都不能证明流量正常。

## 逐项检查功能

[示例配置](configuration.md#config)提供下表功能所需的设置；替换占位的订阅与节点后，再逐项检查实际运行情况。

| 功能                               | 正常时的表现                                                                           | 依赖的配置                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 登录与所有页面                     | 登录后，活动页显示流量与连接。                                                         | `enabled: true`，以及 `password_auth: true` 或 `secret`                                                                        |
| 配置：编辑文件 | 在“配置文件”中打开完整、可写的文件；“应用”校验、写入并重载。 | `config_write: true`；可写且不含密钥的来源 |
| 配置：新建文件                     | “新建文件”会创建由主文件 `include` 模式引入的 `.dae` 文件，例如 `config.d/rules.dae`。 | `config_write: true`                                                                                                           |
| 策略：编辑组 | “编辑群组”在共用对话框中修改成员与策略；“应用”校验、写入并重载。 | `config_write: true`；定义组的主文件或 include 文件可写 |
| 节点：添加节点与订阅               | 节点页提供“粘贴节点链接”与“添加订阅”。                                                 | `config_write: true`；主文件中不含密钥                                                                                         |
| 节点：更新订阅 | 每张订阅卡片提供“更新 {name}”。 | `subscription` 条目与后端订阅更新能力 |
| 设置：地理数据来源                 | 地理数据卡片列出可编辑的来源。                                                         | 状态数据库                                                                                                                     |
| 设置：地理数据更新与重置 | 无法配置来源时，地理数据卡片仍列出文件。“立即更新”更新文件；“重置为默认值”经确认后移除覆盖值。 | 文件列表需要地理数据读取能力；手动更新需要已配置的网址与更新能力，不要求可配置的设置；重置需要可写的地理数据设置 |
| 设置：临时运行时覆盖 | “流程记录”提供“按流程需求”“常开”与“关闭”；“日志记录”与“DNS 记录”分别提供“按日志需求”与“按 DNS 日志需求”，以及“常开”与“关闭”。 | `record_flows`、`record_logs`、`record_dns_log` |
| 设置：地理数据校验                 | 可信镜像的 `.sha256sum` 地址返回错误时可关闭“SHA-256 校验”。                            | 后端提供 `verify_checksum` 且状态数据库可用                                                                                   |
| 活动：流量与内存历史               | 历史图表在最多 10 分钟内逐步填满。                                                     | `record_traffic`、`record_memory`                                                                                              |
| 日志                               | 打开日志页时持续出现日志。                                                             | `record_logs`                                                                                                                  |
| DNS：查询、缓存与记录              | 列出查询与缓存；打开页面时记录持续增加。                                               | 记录需要 `record_dns_log`；`dns` 配置段                                                                                        |
| 连接：关闭与编辑命中规则 | 关闭连接，或在规则页打开可写的命中规则，修改条件与目标。 | `connections`；编辑需要 `rules` 与可写来源 |
| 规则：路由规则、DNS 规则与流程 | 编辑路由规则、DNS request 与 response 规则；查看命中、流程与追踪模拟，包括可选的 0 至 63 DSCP 值。 | 对应的规则、流程与追踪资源；编辑需要 `config_write: true` 与可写来源 |
| DNS：根据解析记录新建规则 | 行内图标打开精确匹配域名的 DNS request 规则；“域名后缀”包含子域名。不提供 DNS 规则时打开路由规则。 | 支持的规则列表；应用需要可写配置 |
| 策略：检测设置                     | 后端允许修改时，可调整组的“容忍差值”与“空闲超时”。                                     | `groups` 及 `mutable_config` 中对应的字段                                                                                     |
| 系统状态：运行时降级 | honk 在故障恢复后以降级方式运行时，“数据路径”卡片显示警告。 | `runtime.degradations` |
| 延迟探测 | 节点的“测试 {name}”与组的“测试全部”使用“设置 > 延迟探测”。“按选项探测…”可选择支持的方法、IP 地址族、冷探测与嵌套组节点。 | 后端 `probes` 能力与已配置的探测目标；已移除的 `probe_allowed_cidrs` 与 `probe_allowed_ports` 会被忽略并产生警告 |
| 事件                               | 事件页显示事件流。                                                                     | `enabled: true`                                                                                                                |
| DNS：删除匹配的缓存项 | “删除匹配项”在确认前显示数量；可按完整域名、后缀、关键字、正则表达式、记录类型或两者组合匹配。没有缓存列表时也可按精确名称删除。 | 后端缓存删除能力 |
| DNS：查询上游 | “上游”提供遵循 `dns.routing` 的“自动”，或 `dns.upstream` 中的命名上游。 | DNS 查询与定义命名上游的可读配置 |
| 配置：备份与修订 | “导出配置”下载已接受的配置；“导入服务器文件”读取服务器启动文件；修订详情提供经确认的恢复。不上传本地备份；导出不含 listener secrets，但可能保留其他凭据。 | 后端配置导出、导入或修订能力 |
| 错误诊断 | “复制错误”复制失败详情；“设置 > 关于”的“复制最近错误”复制内存中最近 20 条错误，不含密钥与请求体。 | 已记录的失败或结果未知的操作 |

自动记录模式下，流程请求、日志流与 DNS 记录读取各自启用对应记录器，并分别有 60 秒宽限期。连接、分流与规则页打开时会请求流程。已允许但处于空闲状态的记录器属于正常情况。

<a name="still-missing"></a>

## 仍有功能缺失时

- 修改 `native_api` 后没有重启 honk。重载不会应用这些字段。
- 缺少 `config_write: true`。`native_api` 的字段直接写在 `experimental` 下时，honk 会以 [`unknown experimental setting`](troubleshooting.md#unknown-setting) 拒绝启动。
- 既没有 `password_auth: true`，也没有 `secret`，且未启用匿名 loopback。此时若设置了 `enabled: true`，honk 会拒绝启动。`listen` 为 loopback 地址且设置 `allow_anonymous_loopback: true` 时，读取请求无需 Token。配置写入与受保护的设置修改仍需要凭据。此模式仅用于本地开发。
- 文件包含密钥或与密钥相同的文本，因此 doona 将其显示为[只读](troubleshooting.md#read-only)。
- honk 是早期的 `feat/native-api` 构建，因此地理数据卡片没有来源设置。请安装 doona 发布版本附带的构建，见 [honk 版本](requirements.md#honk-version)。
- Token 模式下状态数据库未能打开，因此地理数据卡片没有可配置的来源与计划控件。文件表格仍会显示；已配置网址且后端支持更新时，仍可手动更新。详见[状态数据库问题](troubleshooting.md#state-db)。
- 仅在以 `--store db` 运行时出现，本文档不使用该模式：honk 未能记录的修订会阻止后续写入，直到下一次成功激活配置。

## 登录之后

界面指南与操作步骤见[文档目录](index.md)。

每一次配置来源的写入都经过引擎。doona 带着读取时的哈希发送（`If-Match`）；磁盘上已变动的文件会返回 412，不会写入。引擎先验证整组来源再保存并重载，重载失败时仍沿用先前的世代。预先验证不会写入，脱敏后的文本也不会写回。运行时设置与组选择走各自的端点，各有检查。

<a name="pages"></a>

## 页面与所需资源

![策略页](../screenshots/zh-CN/policies-light.webp)

| 页面 | 内容                                                                                                       | 需要的资源                          |
| ---- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 活动 | 出站模式、流量与内存、活动连接、节点延迟、出站用量、流量最高的客户端、通知 | 无 |
| 系统状态 | 引擎与 eBPF 状态、流量计数、后端能力、运行时降级、状态 JSON 导出                                   | `runtime`                           |
| 连接 | 实时连接的来源、目的、规则、链路与流量；关闭连接、编辑命中规则、可在网址中带入筛选条件                         | `connections`                       |
| 分流 | 分流总览与流程记录，含每条记录的追踪步骤 | `flows` |
| DNS | 查询与应答、上游选择、缓存与解析记录；行内新建规则、匹配删除与清空缓存 | `dns_query`、`dns_log`、`dns_cache` |
| 策略 | 组、成员与健康；选择、固定、探测、编辑与检测设置 | `groups`、`config` |
| 规则 | 路由模板、可编辑的路由与 DNS 规则、追踪模拟；没有规则 API 时也可使用模板 | `rules`、`dns_rules`、`flows`、`routing_trace` |
| 节点 | 订阅与更新间隔、配置内节点、新增与移除、各类探测结果与共用组编辑器 | `nodes`、`providers` |
| 配置 | 模块、全局设置、含诊断与校验的配置文件编辑器、来源导出、备份与修订 | `config`；配置导出、导入或修订能力也允许访问 |
| 事件 | 后端事件流                                                                                                 | `events`                            |
| 日志 | 日志流，可按级别与模块筛选、暂停、导出                                                                     | `logs`                              |
| 设置 | 后端、运行时设置、延迟探测偏好、地理数据来源与文件、语言、外观与配色 | 无 |

所有页面都保留在导航栏中。只有 [registry.ts](https://github.com/Zakkaus/doona/blob/main/src/shell/registry.ts) 为页面列出的资源全部不可用时，页面才会标为不可用；后端提供导出、导入或修订时，配置页也可用。打开不可用的页面会显示提示。`Ctrl K`（macOS 为 `⌘ K`）可搜索页面与实时数据，也涵盖设置字段与动作、持久化 `global` 设置、配置区段与功能入口；选择结果会打开并聚焦控件，不会执行动作，见[搜索示例](tour.md#top-bar)。

![规则页](../screenshots/zh-CN/rules-light.webp)

<a name="widgets"></a>

## 小工具

活动页仪表盘与浮动面板共用小工具库。两处都提供「出站失败」「节点可用性」「DNS 延迟」与「订阅额度」。「订阅额度」不在默认布局中，列出每个订阅的到期时间与配额仪表；未报告额度时只显示用量。「来源状态」在提供方报告额度时也会显示用量仪表。

内存默认使用图表。选择「迷你折线图」可显示为类似「下载」与「上传」的数值卡片，仪表盘宽度可从一行的五分之一到整行。面板的中型内存小工具显示常驻内存及 cgroup 用量与上限，大型才显示图表。

内存仪表标为「cgroup 已用」。上限为零或缺失时不显示仪表，并区分未报告上限与明确未设置上限。发生 OOM kill 后，「键值列表」也会显示次数。字节比值两侧单位相同时只写一次，例如 `70／268 MB`。

- 图表卡片至少占一行的三分之二时，每条序列的峰值与平均值显示在图表旁，包括自动宽度的流量卡片与数值卡片。宽键值指标卡片在读数旁显示相同统计。
- 至少有四行的宽列表小工具使用两列。长名称换行，不再截断。通知按内容增加高度，不再设置行数。
- 环形图从仪表盘宽度的三分之二起放大圆环、缩窄图例。节点延迟从半行宽起将最低与最高值放在图例行上。方格图在图例上方居中。
- 窄环形图的名称、数值与占比保持在同一行；面板的大型环形图无需滚动即可显示全部项目。面板的小型通知占整行，小型节点延迟以名称与数值代替狭窄的图。窄面积图省略会重叠的时间标签。
- 累计流量、DNS 应答与网络分类最多占半行，快速切换组最多占三分之二且不重复标题。两种分类显示全部类别，不再设置行数。已保存但不再提供的尺寸会采用最接近的可用尺寸。
- 面板的键值指标小工具不再提供与中型相同的大型尺寸。迷你折线图在第二个样本到达前显示基线；速率图例不会随读数变化而改变高度。

面板移动、固定、嵌入与编辑器滚动见[界面导览](tour.md)。

![「活动」页的「出站失败」「节点可用性」「DNS 延迟」卡片](../screenshots/zh-CN/widgets-health.webp)

## 主题与配色

![所有配色的浅色和深色模式](../screenshots/palettes.webp)

浅色主题的提示徽标、警告与信息提示消息使用白色文字，包括黄色提示。

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
| 强国 | [白班](../screenshots/en/theme-qiangguo-light.webp) | [夜班](../screenshots/en/theme-qiangguo-dark.webp) |

## 浏览器中保存的设置

![localStorage、sessionStorage 与 honk 的存储边界](../images/storage-boundary.svg)

`localStorage` 保存当前网站来源的偏好、布局与连接配置方案，包括 Token；`sessionStorage` 保存当前标签页的密码登录会话 token。honk 保存后端配置并管理密码会话；清除浏览器数据会丢失配置方案与偏好，不会删除 honk 的配置。

Token 模式下，请求通过 `Authorization` 发送已保存的 Token；配对链接可通过网址片段传递 Token，加载后移除该片段。存储键见 [storage.ts](https://github.com/Zakkaus/doona/blob/main/src/api/storage.ts)。

保存的主题与语言在第一帧之前就应用，重新加载不会闪出默认外观。

「设置 > 外观」在「语言」旁提供「日期格式」与「时间格式」。「日期格式」默认为「自动（浏览器地区）」，与界面语言无关。「日/月/年」「月/日/年」与「年-月-日」可覆盖浏览器的日期顺序。

「时间格式」默认为「24 小时制」。「12 小时制」使用界面语言的上午、下午文字；「自动（浏览器地区）」按浏览器地区的习惯显示。此设置适用于页面上的所有时间，包括图表坐标轴与日志热图，可与每种日期格式组合，并保存在当前浏览器中。

在 HTTPS 或 localhost 下，service worker 预先缓存应用外壳，并缓存字体与图标，离线也能打开页面，网站可安装为应用。API 响应一律不缓存。安全问题的报告方式见 [SECURITY.md](https://github.com/Zakkaus/doona/blob/main/.github/SECURITY.md)。

登录前不会下载其他页面。安装更新时，不会重新下载页面已有的文件。

![深色模式的活动页](../screenshots/zh-CN/activity-dark.webp)
