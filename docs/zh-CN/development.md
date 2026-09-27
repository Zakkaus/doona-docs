[English](../en/development.md) · 简体中文 · [繁體中文](../zh-TW/development.md)

# 开发

提交 pull request 前先读 [CONTRIBUTING.md](../../CONTRIBUTING.md)。修正翻译或提议新增语言，见其中的 [Translations](../../CONTRIBUTING.md#translations) 一节。

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
pnpm docs:check                  # links and anchors in docs/
```

`pnpm dev` 以 Vite 开发服务器提供模拟后端。发布包的版本号在本地取自 `package.json`，在标签上取自 Git 描述；时间戳用 `SOURCE_DATE_EPOCH`，未设置时用 HEAD 提交时间。

## 对实际后端测试

在仓库根目录执行 `DOONA_API=http://router:9527 DOONA_TOKEN=… pnpm e2e:live`，可对实际后端执行只读的无障碍、移动端导航与键盘测试。`DOONA_API` 必填；后端不要求身份验证时可省略 `DOONA_TOKEN`。测试拒绝通过 fixture 存储覆盖后端设置，并中止控制请求，包括 DNS 查询。普通 `pnpm e2e` 测试在设置了 `DOONA_API` 时拒绝执行，除非显式设置 `DOONA_LIVE_OBSERVE=1`。

## 截图

`node tools/screenshots.mjs <url> docs/screenshots` 从运行中的构建截取页面、配色总览、手机拼图与两段动画，输出 WebP，需要安装 `cwebp` 和 `img2webp`。

## 源码布局

| 路径            | 用途                                              |
| --------------- | ------------------------------------------------- |
| `src/features/` | 各页面及其 hook 与文案，一页一个文件夹            |
| `src/shell/`    | 应用外壳、导航与搜索                              |
| `src/ui/`       | 共用组件、主题与图标                              |
| `src/api/`      | 客户端、后端档案、模拟后端与生成的类型            |
| `src/store/`    | 资源监听、读取缓存与操作 hook                     |
| `src/i18n/`     | 翻译与区域设置辅助                                |
| `contract/`     | 内嵌的 OpenAPI 契约与钉点                         |
| `public/`       | 静态资源、字体与 service worker                   |
| `e2e/`          | 浏览器测试                                        |
| `tools/`        | 构建、打包、一致性检查与截图工具                  |
| `install/`      | nfpm 配置与 OpenWrt、Alpine、Gentoo、Nix 打包配置 |
| `docs/`         | 本文档、`anchors.json` 与截图                     |

## 契约

[SOURCE.md](../../contract/api-standardize/SOURCE.md) 记录 [openapi.yaml](../../contract/api-standardize/openapi.yaml) 的钉点。移动钉点后执行 `pnpm gen:api` 重新生成 [src/api/types.ts](../../src/api/types.ts)。`node tools/conformance.mjs http://router:9527 --token …` 按契约检查线上后端的发现端点、能力与只读响应，不发送任何修改。

版本变更见 [CHANGELOG.md](../../CHANGELOG.md)。
