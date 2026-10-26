[English](../en/lite.md) / [简体中文](../zh-CN/lite.md) / 繁體中文

<a name="lite"></a>

# doona lite

doona lite 為初學者提供較小的介面，用於編輯 honk 組態。

頁面包括：**節點**、**訂閱**、**策略群組**、**路由**、**DNS**。**設定**對話框用於編輯全域設定。搜尋可尋找資源，手動節點可透過連結或 QR code 分享。示範模式使用範例資料。

不提供流量頁面、進階追蹤頁籤或完整組態來源編輯器。**路由**中的**測試規則**可檢查命中規則與出站。見[功能比較](editions.md#editions-compare)。

![節點](../images/lite-nodes-light.webp)

<a name="lite-install"></a>

## 安裝 doona lite

先安裝 honk 並寫入[最小組態](minimal-configuration.md)。在可寫入的工作目錄中，從同一發布版本下載 lite 壓縮檔與 `SHA256SUMS`，驗證後解壓縮。以下命令使用 sudo；在 root shell 中省略 sudo。

[doona releases](https://github.com/Zakkaus/doona/releases)

```sh
VERSION=0.1.0-beta.19
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-lite-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep " doona-lite-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
sudo mkdir -p /usr/share/doona-lite
sudo tar -xzf "doona-lite-${VERSION}.tar.gz" -C /usr/share/doona-lite
ls -l /usr/share/doona-lite/index.html
```

驗證結果應為 `OK`，`ls` 應列出 `/usr/share/doona-lite/index.html`。在現有 `experimental` → `native_api` 區塊中設定：

```dae
ui: '/usr/share/doona-lite'
```

[重新啟動 honk](service-management.md)，然後開啟其 `/ui/` 位址，例如 `http://192.168.1.1:9527/ui/`。繼續閱讀[連線 doona lite](lite-connect.md)。

<a name="lite-switch"></a>

## 切回標準版

將 `ui` 指向已安裝的標準版目錄，通常為 `/usr/share/doona`（Debian 或 Ubuntu 套件使用 `/usr/share/doona-web`），也可使用 `ui: embedded`。重新啟動 honk 並重新載入 `/ui/`。兩個目錄可以同時保留，見[安裝與切換](editions.md#editions-switch)。
