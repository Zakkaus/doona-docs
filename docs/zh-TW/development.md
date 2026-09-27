[English](../en/development.md) · [简体中文](../zh-CN/development.md) · 繁體中文

# 開發

送出 pull request 前先讀 [CONTRIBUTING.md](../../CONTRIBUTING.md)。修正翻譯或提議新增語言，見其中的 [Translations](../../CONTRIBUTING.md#translations) 一節。

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
pnpm docs:check                  # links and anchors in docs/
```

`pnpm dev` 以 Vite 開發伺服器提供模擬後端。封存檔的版本號在本機取自 `package.json`，在標籤上取自 Git 描述；時間戳用 `SOURCE_DATE_EPOCH`，未設定時用 HEAD 提交時間。

## 對實際後端測試

在倉庫根目錄執行 `DOONA_API=http://router:9527 DOONA_TOKEN=… pnpm e2e:live`，可對實際後端執行唯讀的無障礙、行動裝置導覽與鍵盤測試。`DOONA_API` 必填；後端不要求身分驗證時可省略 `DOONA_TOKEN`。測試拒絕透過 fixture 儲存覆寫後端設定，並中止控制請求，包括 DNS 查詢。一般 `pnpm e2e` 測試在設定了 `DOONA_API` 時拒絕執行，除非明確設定 `DOONA_LIVE_OBSERVE=1`。

## 截圖

`node tools/screenshots.mjs <url> docs/screenshots` 從執行中的建置擷取頁面截圖、配色總覽、手機拼圖與兩段動畫，輸出 WebP，需要安裝 `cwebp` 和 `img2webp`。

## 原始碼配置

| 路徑            | 用途                                              |
| --------------- | ------------------------------------------------- |
| `src/features/` | 各頁面及其 hook 與文案，一頁一個資料夾            |
| `src/shell/`    | 應用程式外殼、導覽與搜尋                          |
| `src/ui/`       | 共用元件、主題與圖示                              |
| `src/api/`      | 用戶端、後端設定檔、模擬後端與產生的型別          |
| `src/store/`    | 資源監聽、讀取快取與操作 hook                     |
| `src/i18n/`     | 翻譯與地區設定輔助                                |
| `contract/`     | 內嵌的 OpenAPI 契約與釘點                         |
| `public/`       | 靜態資源、字型與 service worker                   |
| `e2e/`          | 瀏覽器測試                                        |
| `tools/`        | 建置、打包、一致性檢查與截圖工具                  |
| `install/`      | nfpm 設定與 OpenWrt、Alpine、Gentoo、Nix 打包設定 |
| `docs/`         | 本文件、`anchors.json` 與截圖                     |

## 契約

[SOURCE.md](../../contract/api-standardize/SOURCE.md) 記錄 [openapi.yaml](../../contract/api-standardize/openapi.yaml) 的釘點。移動釘點後執行 `pnpm gen:api` 重新產生 [src/api/types.ts](../../src/api/types.ts)。`node tools/conformance.mjs http://router:9527 --token …` 依契約檢查線上後端的探索端點、能力與唯讀回應，不送出任何修改。

版本變更見 [CHANGELOG.md](../../CHANGELOG.md)。
