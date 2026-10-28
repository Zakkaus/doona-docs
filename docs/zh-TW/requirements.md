繁體中文 / [简体中文](../zh-CN/requirements.md) / [English](../en/requirements.md)

<a name="requirements"></a>

# 執行需求

安裝 doona 與 honk 前，先檢查閘道器與瀏覽器。個別頁面或操作的條件見[功能需求](feature-requirements.md)。

## 閘道器

啟動後端前，請按 honk 的 [Linux 核心要求](https://github.com/daeuniverse/honk/blob/main/doc/zh/how-to-start.md#linux-内核要求)與 [bpffs 設定](https://github.com/daeuniverse/honk/blob/main/doc/zh/how-to-start.md#bpffs)檢查閘道器。

<a name="honk-version"></a>

## honk 版本

使用實作 doona 原生 API 契約且啟用 `native-api` 建置功能的 honk。僅憑版本號無法判斷相容性。缺少該建置功能的程式，即使新增 API 組態也無法提供 API。

按[安裝指南](install.md)選擇相容的 honk-core 壓縮檔。應用程式的[契約版本記錄](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/SOURCE.md)列出預期的 API。

在閘道器上執行：

```sh
honk-core --version
```

登入後，在**系統狀態**中核對正在運作的引擎版本是否與已安裝的程式一致。API 缺失或建置遭拒時，查看[原生 API 疑難排解](troubleshooting.md#no-native-api)。

## 瀏覽器與原始碼建置

| 元件 | 需求 |
| --- | --- |
| 瀏覽器 | 標準版建置目標：Chrome 或 Edge 120、Firefox 121、Safari 17 或更新版本；JavaScript 目標為 ES2022。 |
| 建置應用程式 | Node `^22.13.0 \|\| ^24.0.0 \|\| >=26.0.0`，pnpm 11.15.1。 |
| 建置本文件網站 | Node `^22.18.0 \|\| ^24.0.0 \|\| >=26.0.0`，pnpm 11.15.1。 |

只有[開發](development.md)時才需要 Node 與 pnpm，託管已建置的介面不需要。依程序名稱路由的額外條件見[功能需求](feature-requirements.md#req-process-routing)。
