[繁體中文](../zh-TW/editions.md) / 简体中文 / [English](../en/editions.md)

<a name="editions"></a>

# 标准版与 doona lite

标准版用于管理配置与观测流量。需要流量仪表板、连接控制、日志、进阶路由追踪或多配置源编辑时，应选择标准版。

doona lite 专注于配置节点、订阅、策略组、路由、DNS 与全局设置。需要任务专用表单、手动节点分享与配置草稿确认流程，且无需流量页面时，可选择 lite。

<a name="editions-compare"></a>

## 功能比较

功能取决于 honk 声明的资源与权限；切换版本无法启用后端未提供的能力。

| 功能 | 标准版 | doona lite |
| --- | --- | --- |
| 流量监控 | 活动、系统状态、连接、分流、日志与事件 | 无流量页面 |
| 小工具 | 活动小工具，以及悬浮或嵌入侧边栏的小工具 | 不提供 |
| 关闭连接；导出事件 | 支持 | 不提供 |
| 路由测试 | 规则 → 追踪模拟，含进阶流量字段与解析选项 | 路由 → 测试规则，显示命中规则与出站；使用相同的路由追踪 API |
| DNS 查询、解析记录、统计与缓存 | 支持 | 无独立查询或观测页面；路由测试会使用 DNS 解析 |
| 节点、订阅与策略组选择 | 支持；策略组位于策略页面 | 支持；节点、订阅与策略组各有独立页面 |
| 多行分享链接导入 | 支持 | 支持，入口为添加节点 → 粘贴链接 |
| 分享链接与二维码 | 无专用分享对话框 | 可分享手动节点与订阅链接；无法分享订阅节点 |
| 重命名订阅 | 支持，可选择同步更新策略组引用 | 不支持；名称创建后固定 |
| 策略组编辑 | 策略组表单与完整配置源编辑器 | 策略组表单、策略组文本编辑器、创建策略组副本及跨组复制成员 |
| 路由与 DNS 规则 | 表单与完整配置源编辑器 | 表单、排序控件与页面内的可视化／文本模式 |
| DNS 上游预设 | 在配置源编辑器中修改上游；无预设表单 | 自定义上游，以及阿里 DNS、DNSPod 与 Cloudflare 预设 |
| 全局设置 | 配置 → 全局设置 | 设置对话框；需重启的值为只读，并提供复制按钮 |
| 配置源 | 选择与编辑 main/include 配置源，创建配置源并查看诊断 | 仅编辑 main；无完整配置源编辑器 |
| 导出配置 | 导出选定的配置源 | 导出已应用的 main，或当前页面尚未保存的草稿 |
| 后端管理 | 多后端连接、退出登录、临时运行时覆盖与地理数据管理 | 无对应管理界面 |
| 服务器配置备份与修订 | honk 声明 x-honk 扩展时可用 | 不提供 |
| 主题与登录 | 浅色／深色主题及配色；管理员凭据或令牌 | 浅色、深色或跟随系统，无配色选择器；使用相同的 honk 凭据 |

<a name="backend-requirements"></a>

## 后端要求

请使用[运行要求](requirements.md#honk-version)指定的原生 API honk 构建。两个版本均通过 `GET /api` 获取认证方式，并读取 `GET /api/v1/capabilities`；密码模式使用 `POST /api/v1/auth/setup` 或 `POST /api/v1/auth/login`。其余端点按功能需要调用，并非每次连接均需支持。下表路径均以 `/api/v1` 开头。

| 功能 | honk 资源与端点 | 版本 |
| --- | --- | --- |
| 配置编辑 | 可读写的 `config`、`config_validate` 与 `operations`；`GET /config`、`POST /config/validate`、`PUT /config/sources/{source_id}`、`GET /operations/{operation_id}` | 两者均使用；lite 要求 `full` 验证，以及完整、哈希一致且可写的 main 内容。后端支持时，标准版会验证配置源的修改。lite 的分享链接导入还需要 `syntax` 验证。 |
| 节点、订阅与策略组 | `nodes`、`providers`、`groups`；`GET /nodes`、`GET /providers`、`GET /groups`、`GET /groups/{group_id}`、`POST /providers/{provider_id}/refresh`、`PUT`/`DELETE /groups/{group_id}/selection`；`probes` 使用 `POST /probes` | 两者均使用；lite 通过替换 main 配置源编辑声明。标准版还使用节点／订阅的创建、删除及策略组配置端点。 |
| 状态与服务命令 | `runtime`、`operations`，以及后端声明的 `reload`/`suspend`/`resume` 能力；`GET /runtime`、`GET /version`（仅标准版）、`POST /operations/reload`、`/operations/suspend`、`/operations/resume`，以及操作状态查询 | 两者均使用；lite 在界面顶栏显示状态，无流量仪表板。 |
| 路由测试 | `routing_trace` 使用 `POST /routing/trace`；`rules` 使用 `GET /rules`；需要解析域名时，`dns_query` 使用 `POST /dns/query` | 两者均使用；可用测试取决于 honk 的解析模式。 |
| 流量与 DNS 观测 | `traffic_history`、`memory_history`、`runtime_memory`、`runtime_outbounds`、`datapath`、`connections`、`flows`、`events`、`logs`、`dns_log`、`dns_cache`、`dns_query`；`GET /runtime/traffic/history`、`/runtime/memory/history`、`/runtime/memory`、`/runtime/outbounds`、`/datapath`、`/connections`、`/flows`、`/events`、`/logs`、`/dns/log`、`/dns/cache`、`/dns/rules`，以及 `POST /dns/query` 与允许写入时的连接／缓存删除端点 | 标准版 |
| 配置源与后端管理 | `POST /config/sources`；`geodata` 使用 `GET /geodata` 与 `POST /geodata/update`；`runtime_settings` 使用 `GET`/`PATCH /runtime/settings`；`POST /auth/logout` | 标准版 |
| 服务器备份与修订 | 后端声明的 `x-honk` 配置导出／导入／修订扩展，位于 `/x-honk/config/` 下 | 标准版；除基本契约外，还须支持这些扩展 |

lite 复用标准版的 `src/api/client.ts`，以及基于生成的 `src/api/types.ts` 的模型；界面与状态独立。[OpenAPI 契约](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/openapi.yaml)定义端点结构。编辑前需满足的条件见 [lite 常见操作](lite-tasks.md)。

<a name="editions-switch"></a>

## 安装与切换

内嵌标准版请见[快速入门](quick-start.md)，切换到 lite 请见 [doona lite](lite.md#lite-install)，使用独立目录请见[单独安装界面文件](install.md)。

## 独立的浏览器设置

两个版本使用相同的 honk 原生 API 和配置。配置修改由两者共享，但各自保存浏览器设置。

## 在线演示

体验[标准版演示](https://demo.daeuniverse.org/)或 [doona lite 演示](https://demo.daeuniverse.org/lite/)。
