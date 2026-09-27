<div align="center">

<img src="https://raw.githubusercontent.com/Zakkaus/doona/main/public/logo.svg" width="104" alt="doona">

# doona 文件

**[doona](https://github.com/Zakkaus/doona)（daeuniverse 引擎的 Web 介面）的文件，以及由此建置的文件網站。**

[English](README.md) · [简体中文](README.zh-CN.md) · 繁體中文

[閱讀文件](https://zakkaus.github.io/doona-docs/zh-TW/) • [建置](#建置) • [目錄結構](#目錄結構)

</div>

頁面是 `docs/<locale>/` 下的 Markdown，有英文、簡體中文與繁體中文三種語言，在 GitHub 與網站上都可閱讀。`main` 發布於 https://zakkaus.github.io/doona-docs/。

## 建置

建置時從 doona 的 checkout 讀取配色、尺寸、圖示、標誌與截圖，因此網站與應用程式保持一致。`DOONA_DIR` 指定該 checkout，預設為 `../doona`。需要 Node `^22.18.0 || ^24.0.0 || >=26.0.0` 與 pnpm 11。

```sh
git clone https://github.com/Zakkaus/doona ../doona
pnpm install --frozen-lockfile
DOONA_DIR=../doona pnpm docs:build   # 網站輸出到 dist-docs/，路徑前綴為 DOCS_BASE（預設 /doona-docs/）
pnpm docs:check                      # 檢查 docs/ 與建置結果中的連結、錨點與 id
pnpm test                            # 網站腳本與標題 id 的測試
```

`DOCS_BASE=/ pnpm docs:build` 為獨立網域建置。CI 以 doona 的 `main` 建置；設定儲存庫變數 `DOONA_REF` 可改為固定的 tag。

## 目錄結構

| 路徑                | 用途                                                     |
| ------------------- | -------------------------------------------------------- |
| `docs/<locale>/`    | 頁面，各語言頁面集合相同                                 |
| `docs/anchors.json` | 各固定錨點及其所在頁面；doona 應用程式內的連結須與之相符 |
| `site/`             | 網站的建置腳本、樣式表與前端腳本                         |
| `tools/`            | 文件檢查與測試                                           |

頁面沿用在 doona 時的路徑：指向 `../screenshots/` 或 `../../src/` 的連結代表 doona 的檔案，網站會複製該檔案或連到 GitHub 上的檔案。

## 授權

`docs/` 中的頁面採用 [CC BY 4.0](LICENSES/CC-BY-4.0.txt)；網站建置與檢查工具與 doona 相同，採用 GPL-3.0-only。發布的網站另附 doona 的 `NOTICE`，涵蓋其圖示；見 [NOTICE](NOTICE)。
