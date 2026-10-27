繁體中文 / [简体中文](../zh-CN/lite.md) / [English](../en/lite.md)

<a name="lite"></a>

# doona lite

doona lite 透過表單完成常見的 honk 組態任務，目前是測試中的預覽版。為閘道器選擇介面前，請先閱讀[版本比較](editions.md)。

使用**節點**、**訂閱**、**策略群組**、**路由**和 **DNS** 管理資源，透過**設定**修改全域設定。先[連線至 doona lite](lite-connect.md)，再按[常用任務](lite-tasks.md)操作。

![節點](../images/lite-nodes-light.webp)

<a name="lite-install"></a>

## 安裝 doona lite

1. 安裝[相容的 honk 建置](requirements.md#honk-version)，準備[最小組態](minimal-configuration.md)。
2. 在閘道器上可寫入的下載目錄中，下載並校驗封存檔。以下命令使用 sudo，root shell 中省略 sudo。

```sh
VERSION=0.1.0-rc.2
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-lite-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep " doona-lite-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

3. 校驗結果為 `OK` 後再解壓縮：

```sh
sudo install -d -m 0755 /usr/share/doona-lite
sudo tar -xzf "doona-lite-${VERSION}.tar.gz" -C /usr/share/doona-lite
ls -l /usr/share/doona-lite/index.html
```

4. 確認 `index.html` 存在。在既有的 `experimental.native_api` 區塊中設定：

```dae
ui: '/usr/share/doona-lite'
```

5. 根據 [UI 重新啟動規則](what-doona-can-change.md#restart-native)，按[服務管理](service-management.md)操作。開啟 honk 的 `/ui/` 位址，按[連線至 doona lite](lite-connect.md)繼續。

其他 API 欄位見[組態參考](configuration.md)。

<a name="lite-switch"></a>

## 切換至標準版

按[安裝與切換版本](editions.md#editions-switch)選擇標準版檔案或內嵌介面。
