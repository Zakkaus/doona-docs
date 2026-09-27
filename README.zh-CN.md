<div align="center">

<img src="https://raw.githubusercontent.com/Zakkaus/doona/main/public/logo.svg" width="104" alt="doona">

# doona 文档

**[doona](https://github.com/Zakkaus/doona)（daeuniverse 引擎的 Web 界面）的文档，以及由此构建的文档站点。**

[English](README.md) · 简体中文 · [繁體中文](README.zh-TW.md)

[阅读文档](https://zakkaus.github.io/doona-docs/zh-CN/) • [构建](#构建) • [目录结构](#目录结构)

</div>

页面是 `docs/<locale>/` 下的 Markdown，有英文、简体中文与繁体中文三种语言，在 GitHub 与站点上都可阅读。`main` 发布于 https://zakkaus.github.io/doona-docs/。

## 构建

构建时从 doona 的 checkout 读取配色、尺寸、图标、标志与截图，因此站点与应用保持一致。`DOONA_DIR` 指定该 checkout，默认为 `../doona`。需要 Node `^22.18.0 || ^24.0.0 || >=26.0.0` 与 pnpm 11。

```sh
git clone https://github.com/Zakkaus/doona ../doona
pnpm install --frozen-lockfile
DOONA_DIR=../doona pnpm docs:build   # 站点输出到 dist-docs/，路径前缀为 DOCS_BASE（默认 /doona-docs/）
pnpm docs:check                      # 检查 docs/ 与构建结果中的链接、锚点与 id
pnpm test                            # 站点脚本与标题 id 的测试
```

`DOCS_BASE=/ pnpm docs:build` 为独立域名构建。CI 以 doona 的 `main` 构建；设置仓库变量 `DOONA_REF` 可改为固定的 tag。

## 目录结构

| 路径                | 用途                                                 |
| ------------------- | ---------------------------------------------------- |
| `docs/<locale>/`    | 页面，各语言的页面集合相同                           |
| `docs/anchors.json` | 各固定锚点及其所在页面；doona 应用内的链接须与之一致 |
| `site/`             | 站点的构建脚本、样式表与前端脚本                     |
| `tools/`            | 文档检查与测试                                       |

页面沿用在 doona 时的路径：指向 `../screenshots/` 或 `../../src/` 的链接代表 doona 的文件，站点会复制该文件或链接到 GitHub 上的文件。

## 许可证

`docs/` 中的页面采用 [CC BY 4.0](LICENSES/CC-BY-4.0.txt)；站点构建与检查工具与 doona 相同，采用 GPL-3.0-only。发布的站点另附 doona 的 `NOTICE`，涵盖其图标；见 [NOTICE](NOTICE)。
