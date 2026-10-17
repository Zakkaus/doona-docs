# 开发

提交 pull request 前先读 [CONTRIBUTING.md](https://github.com/Zakkaus/doona/blob/main/CONTRIBUTING.md)。修正翻译或提议新增语言，见其中的 [Translations](https://github.com/Zakkaus/doona/blob/main/CONTRIBUTING.md#translations) 一节。

本文档及其站点的源码在 [Zakkaus/doona-docs](https://github.com/Zakkaus/doona-docs)。

## 命令

在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm build                       # writes dist/
pnpm check                       # types, lint, translations, formatting, unit tests, generated API types
pnpm check:size                  # gzip budgets for the dist/ build
pnpm e2e:install --with-deps     # once, for the browser tests
pnpm e2e                         # rebuild, then test against the mock at the root and under /ui/
pnpm package                     # release/doona-<version>.tar.gz, doona-fonts-<version>.tar.gz, SHA256SUMS
```

`pnpm dev` 以 Vite 开发服务器提供模拟后端。`pnpm package` 使用 `package.json` 中的版本号；`pnpm package --git-version` 使用去掉开头 `v` 的 `git describe --tags --always` 输出。时间戳使用 `SOURCE_DATE_EPOCH`，未设置时使用 HEAD 提交时间。

## 对实际后端测试

在仓库根目录执行 `DOONA_API=http://router:9527 DOONA_TOKEN=… pnpm e2e:live`，可对实际后端执行只读的无障碍、移动端导航与键盘测试。`DOONA_API` 必填；后端不要求身份验证时可省略 `DOONA_TOKEN`。测试拒绝通过 fixture 存储覆盖后端设置，并中止控制请求，包括 DNS 查询。普通 `pnpm e2e` 测试在设置了 `DOONA_API` 时拒绝执行，除非显式设置 `DOONA_LIVE_OBSERVE=1`。

## 截图

`node tools/screenshots.mjs <url> docs/screenshots` 截取各语言的模拟后端页面、配色总览、英文主题图库、手机拼图、页面导览静帧与路由动画，输出 WebP。需要安装 `cwebp`、`img2webp` 与 Playwright 的 Chromium。

## 源码布局

| 路径            | 用途                                              |
| --------------- | ------------------------------------------------- |
| `src/features/` | 各页面及其 hook 与文案，一页一个文件夹            |
| `src/shell/`    | 应用外壳、导航与搜索                              |
| `src/ui/`       | 共用组件、主题与图标                              |
| `src/api/`      | 客户端、后端档案、引擎适配器与生成的类型 |
| `mock/`         | 演示、预览与测试使用的模拟后端 |
| `src/store/`    | 资源监听、读取缓存与操作 hook                     |
| `src/i18n/`     | 翻译与区域设置辅助                                |
| `contract/`     | 内嵌的 OpenAPI 契约与钉点                         |
| `public/`       | 静态图标、manifest 与 service worker |
| `e2e/`          | 浏览器测试                                        |
| `tools/`        | 构建、打包、一致性检查与截图工具                  |
| `install/`      | nfpm 配置与 OpenWrt、Alpine、Gentoo、Nix 打包配置 |
| `docs/`         | 国旗与字体文档 |
| `node_modules/@fontsource-variable/` | Vite 打包的 Noto Sans TC/SC 字体源码 |

截图工具在运行时创建 `docs/screenshots/`；截图不在源码树中。

## 契约

[SOURCE.md](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/SOURCE.md) 记录 [openapi.yaml](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/openapi.yaml) 的钉点。移动钉点后执行 `pnpm gen:api` 重新生成 [src/api/types.ts](https://github.com/Zakkaus/doona/blob/main/src/api/types.ts)。`node tools/conformance.mjs http://router:9527 --token …` 按契约检查线上后端的发现端点、能力与只读响应，不发送任何修改。

版本变更见 [CHANGELOG.md](https://github.com/Zakkaus/doona/blob/main/CHANGELOG.md)。
