[English](../en/install-openwrt.md) / [简体中文](../zh-CN/install-openwrt.md) / 繁體中文

# 在 OpenWrt 上安裝

本頁在 OpenWrt 25.12 上用發行版本中的封存檔安裝 doona 與 honk-core。完成最後一步後，請繼續閱讀[最小組態](minimal-configuration.md)。

發行版本中的 `.ipk` 套件不適用於目前任何一個 OpenWrt 系列。OpenWrt 25.12 用 `apk` 安裝套件，`apk` 拒絕 `.ipk` 並報錯 `v2 package format error`。OpenWrt 24.10 仍使用 `opkg`，但核心是 Linux 6.6，低於 honk 要求的 6.12。

## 開始之前

- OpenWrt 25.12 或更高版本（核心為 Linux 6.12），以及[系統需求](requirements.md#requirements)列出的核心選項。用 `uname -r` 檢視核心版本。
- 路由器上的 root shell，例如 `ssh root@192.168.1.1`。OpenWrt 沒有 sudo，所有命令都以 root 身份執行。
- `/` 上約 30 MB 可用空間，用於 honk-core 二進位檔（27 MB）與 doona（2.2 MB）；`/tmp` 上約 15 MB 可用空間，用於存放下載的檔案。用 `df -h / /tmp` 檢視。
- 能夠連線到 github.com。
- 所有步驟都在同一個 shell 中執行：後面的步驟會用到前面設定的 `VERSION`、`BASE` 與 `TARGET` 變數。

## 1. 安裝 curl 與 CA 憑證

honk 透過 HTTPS 下載訂閱與地理資料，缺少 CA 憑證時會在啟動階段結束。OpenWrt 25.12 已包含 `ca-bundle`；下面的命令保留它並安裝 curl。

```sh
apk update
apk add curl ca-bundle
```

## 2. 下載 doona

在 `/tmp` 中操作。`/tmp` 位於記憶體中，重新啟動後清空。設定發行版本號，然後下載封存檔與總和檢查碼檔案。

```sh
cd /tmp
VERSION=0.1.0-beta.8
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 3. 驗證下載的檔案

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

應顯示：

```text
doona-0.1.0-beta.8.tar.gz: OK
```

## 4. 安裝 doona

把封存檔解壓縮到 `/usr/share/doona`，honk 從這個目錄提供 doona。

```sh
mkdir -p /usr/share/doona
tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

`ls` 輸出一行以 `/usr/share/doona/index.html` 結尾的內容。可選的字型封存檔 `doona-fonts-${VERSION}.tar.gz` 包含 8.7 MB 中文字型，儲存空間不足時可以不裝。

## 5. 選擇 honk-core 建置

```sh
uname -m
```

OpenWrt 使用 musl，因此選擇 `musl` 建置：

| `uname -m` 輸出 | `TARGET`                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| `x86_64`        | `x86_64-unknown-linux-musl` 或 `x86_64-unknown-linux-musl-stock`         |
| `aarch64`       | `aarch64-unknown-linux-musl` 或 `aarch64-unknown-linux-musl-stock`       |

`-stock` 建置使用系統記憶體分配器而不是 mimalloc，適合記憶體比速度更重要的裝置。其他路由器 CPU（例如 MIPS 或 32 位 ARM）沒有對應的建置。

## 6. 下載並驗證 honk-core

把 `TARGET` 設為所選的建置，然後從同一個發行版本下載，並用同一個 `SHA256SUMS` 驗證。

```sh
TARGET=x86_64-unknown-linux-musl
curl -fL -O "$BASE/honk-core-debug-$TARGET.tar.gz"
grep " honk-core-debug-$TARGET.tar.gz\$" SHA256SUMS | sha256sum -c -
```

應顯示：

```text
honk-core-debug-x86_64-unknown-linux-musl.tar.gz: OK
```

## 7. 安裝 honk-core

把二進位檔安裝為 `/usr/bin/honk-core`，即[服務管理](service-management.md)中的 procd 服務啟動的路徑。OpenWrt 的 BusyBox 沒有 `install` 命令，因此複製檔案後再設定權限。最後刪除 `/tmp` 中下載的檔案，釋放其佔用的記憶體。

```sh
tar -xzf honk-core-debug-$TARGET.tar.gz
cp honk-core-debug-$TARGET/honk-core /usr/bin/honk-core
chmod 0755 /usr/bin/honk-core
honk-core --version
rm -rf honk-core-debug-$TARGET honk-core-debug-$TARGET.tar.gz doona-${VERSION}.tar.gz
```

`honk-core --version` 輸出 honk 的建置版本，例如：

```text
honk-core debug.2026.9.28.native-api.2
```

同一個發行版本中的 `HONK-SOURCE.txt` 註明其附帶的建置。

下一步：[最小組態](minimal-configuration.md)。該頁凡是提供「OpenWrt」分頁的地方，都選擇它。

## 遇到問題時

| 看到的內容                                                         | 原因與處理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本號或檔名有誤。請對照[發布頁面](https://github.com/Zakkaus/doona/releases)檢查 `VERSION`。            |
| `sha256sum: WARNING: 1 of 1 computed checksums did NOT match`      | 下載的檔案損壞或不完整。刪除該檔案後重新下載。                                                            |
| `sha256sum: -: no checksum lines found`                            | `grep` 沒有找到該檔案對應的行：目前的 shell 未設定 `VERSION` 或 `TARGET`，或其中有拼字錯誤。                |

安裝後遇到的問題請參閱[疑難排解](troubleshooting.md#troubleshooting)。
