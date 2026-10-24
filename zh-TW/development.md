# 開發

送出 pull request 前先讀 [CONTRIBUTING.md](https://github.com/Zakkaus/doona/blob/main/CONTRIBUTING.md)。修正翻譯或提議新增語言，見其中的 [Translations](https://github.com/Zakkaus/doona/blob/main/CONTRIBUTING.md#translations) 一節。

本文件及其網站的原始碼在 [Zakkaus/doona-docs](https://github.com/Zakkaus/doona-docs)。

## 指令

在倉庫根目錄執行：

```sh
pnpm install --frozen-lockfile
pnpm build                       # writes dist/
pnpm check                       # types, lint, translations, formatting, unit tests, generated API types
pnpm check:size                  # gzip budgets for the dist/ build
pnpm e2e:install --with-deps     # once, for the browser tests
pnpm e2e                         # rebuild, then test against the mock at the root and under /ui/
pnpm package                     # release/doona-<version>.tar.gz, doona-fonts-<version>.tar.gz, SHA256SUMS
```

`pnpm dev` 以 Vite 開發伺服器提供模擬後端。`pnpm package` 使用 `package.json` 中的版本號；`pnpm package --git-version` 使用去掉開頭 `v` 的 `git describe --tags --always` 輸出。時間戳使用 `SOURCE_DATE_EPOCH`，未設定時使用 HEAD 提交時間。

## 對實際後端測試

在倉庫根目錄執行 `DOONA_API=http://router:9527 DOONA_TOKEN=… pnpm e2e:live`，可對實際後端執行唯讀的無障礙、行動裝置導覽與鍵盤測試。`DOONA_API` 必填；後端不要求身分驗證時可省略 `DOONA_TOKEN`。測試拒絕透過 fixture 儲存覆寫後端設定，並中止控制請求，包括 DNS 查詢。一般 `pnpm e2e` 測試在設定了 `DOONA_API` 時拒絕執行，除非明確設定 `DOONA_LIVE_OBSERVE=1`。

## 截圖

`node tools/screenshots.mjs <url> docs/screenshots` 擷取各語言的模擬後端頁面、配色總覽、英文主題圖庫、手機拼圖、頁面導覽靜態影格與路由動畫，輸出 WebP。需要安裝 `cwebp`、`img2webp` 與 Playwright 的 Chromium。

## 原始碼配置

| 路徑            | 用途                                              |
| --------------- | ------------------------------------------------- |
| `src/features/` | 各頁面及其 hook 與文案，一頁一個資料夾            |
| `src/shell/`    | 應用程式外殼、導覽與搜尋                          |
| `src/ui/`       | 共用元件、主題與圖示                              |
| `src/api/`      | 用戶端、後端設定檔、引擎轉接器與產生的型別 |
| `mock/`         | 示範、預覽與測試使用的模擬後端 |
| `src/store/`    | 資源監聽、讀取快取與操作 hook                     |
| `src/i18n/`     | 翻譯與地區設定輔助                                |
| `contract/`     | 內嵌的 OpenAPI 契約與釘點                         |
| `public/`       | 靜態圖示、manifest 與 service worker |
| `e2e/`          | 瀏覽器測試                                        |
| `tools/`        | 建置、打包、一致性檢查與截圖工具                  |
| `install/`      | nfpm 設定與 OpenWrt、Alpine、Gentoo、Nix 打包設定 |
| `docs/`         | 國旗與字型文件 |
| `node_modules/@fontsource-variable/` | Vite 打包的 Noto Sans TC/SC 字型原始碼 |

截圖工具在執行時建立 `docs/screenshots/`；截圖不在原始碼樹中。

## 契約

[SOURCE.md](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/SOURCE.md) 記錄 [openapi.yaml](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/openapi.yaml) 的釘點。移動釘點後執行 `pnpm gen:api` 重新產生 [src/api/types.ts](https://github.com/Zakkaus/doona/blob/main/src/api/types.ts)。`node tools/conformance.mjs http://router:9527 --token …` 依契約檢查線上後端的探索端點、能力與唯讀回應，不送出任何修改。

版本變更見 [CHANGELOG.md](https://github.com/Zakkaus/doona/blob/main/CHANGELOG.md)。
