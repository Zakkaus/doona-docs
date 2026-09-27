[English](../en/install-debian.md) · [简体中文](../zh-CN/install-debian.md) · 繁體中文

# 在 Debian 或 Ubuntu 上安裝

本頁在 Debian、Ubuntu 及其他使用 APT 的系統上，用 `.deb` 套件安裝 doona，並從同一個 doona 發行版本安裝 honk-core。完成最後一步後，請繼續閱讀[最小組態](minimal-configuration.md)。

## 開始之前

- Linux 6.12 或更高版本，以及[系統需求](requirements.md#requirements)列出的核心選項。用 `uname -r` 檢視核心版本。
- 可使用 sudo 的使用者，或 root shell。需要 root 權限的命令分為「sudo」與「root」兩個分頁，請選擇與目前的 shell 相符的一個。
- 能夠連線到 github.com。
- 所有步驟都在同一個終端機中執行：後面的步驟會用到前面設定的 `VERSION`、`BASE` 與 `TARGET` 變數。

## 1. 安裝 curl 與 CA 憑證

honk 透過 HTTPS 下載訂閱與地理資料，缺少 CA 憑證時會在啟動階段結束。

```sh tab="sudo"
sudo apt update
sudo apt install curl ca-certificates
```

```sh tab="root"
apt update
apt install curl ca-certificates
```

## 2. 下載 doona

設定發行版本號，然後把套件與總和檢查碼檔案下載到目前目錄。

```sh
VERSION=0.1.0-beta.8
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona_${VERSION}-1_all.deb" -O "$BASE/SHA256SUMS"
```

## 3. 驗證下載的檔案

```sh
grep " doona_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
```

應顯示：

```text
doona_0.1.0-beta.8-1_all.deb: OK
```

## 4. 安裝 doona

```sh tab="sudo"
sudo apt install ./doona_${VERSION}-1_all.deb
ls -l /usr/share/doona/index.html
```

```sh tab="root"
apt install ./doona_${VERSION}-1_all.deb
ls -l /usr/share/doona/index.html
```

`ls` 輸出一行以 `/usr/share/doona/index.html` 結尾的內容。該套件只包含 doona 的網頁檔案，不安裝任何服務。

可選：`doona-fonts` 套件為中文介面加入 Noto Sans TC 與 SC 字型。

```sh tab="sudo"
curl -fL -O "$BASE/doona-fonts_${VERSION}-1_all.deb"
grep " doona-fonts_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
sudo apt install ./doona-fonts_${VERSION}-1_all.deb
```

```sh tab="root"
curl -fL -O "$BASE/doona-fonts_${VERSION}-1_all.deb"
grep " doona-fonts_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
apt install ./doona-fonts_${VERSION}-1_all.deb
```

## 5. 選擇 honk-core 建置

```sh
uname -m
```

發行版本附帶 8 個 honk-core 封存檔，名稱為 `honk-core-debug-<target>.tar.gz`。根據機器類型與 C 函式庫確定 target：

| `uname -m` 輸出 | target 開頭              |
| --------------- | ------------------------ |
| `x86_64`        | `x86_64-unknown-linux-`  |
| `aarch64`       | `aarch64-unknown-linux-` |

| target 結尾     | 適用情況                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `musl`          | 無法確定時選擇此項。靜態連結，不受系統 glibc 版本限制。                                   |
| `gnu`           | 系統的 glibc 為 2.39 或更高版本，例如 Debian 13 或 Ubuntu 24.04。在 Debian 12 上會顯示錯誤 `GLIBC_2.38' not found` 並結束。 |
| `-stock` 後綴   | 記憶體比速度更重要，例如小型裝置。使用系統記憶體分配器而不是 mimalloc。                                 |

例如 `x86_64-unknown-linux-musl`、`aarch64-unknown-linux-gnu` 或 `x86_64-unknown-linux-musl-stock`。

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

封存檔內有一個目錄，其中包含 `honk-core` 二進位檔。把它安裝為 `/usr/local/bin/honk-core`，即[服務管理](service-management.md)中的服務啟動的路徑。

```sh tab="sudo"
tar -xzf honk-core-debug-$TARGET.tar.gz
sudo install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
/usr/local/bin/honk-core --version
```

```sh tab="root"
tar -xzf honk-core-debug-$TARGET.tar.gz
install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
/usr/local/bin/honk-core --version
```

最後一條命令輸出 honk 的建置版本，例如：

```text
honk-core debug.2026.9.28.native-api.1
```

同一個發行版本中的 `HONK-SOURCE.txt` 註明其附帶的建置。

下一步：[最小組態](minimal-configuration.md)。

## 遇到問題時

| 看到的內容                                                         | 原因與處理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本號或檔名有誤。請對照[發布頁面](https://github.com/Zakkaus/doona/releases)檢查 `VERSION`。            |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` 沒有找到該檔案對應的行：目前的終端機未設定 `VERSION` 或 `TARGET`，或其中有拼字錯誤。            |
| `FAILED` 與 `WARNING: 1 computed checksum did NOT match`           | 下載的檔案損壞或不完整。刪除該檔案後重新下載。                                                            |
| `version 'GLIBC_2.38' not found`                                   | `gnu` 建置需要更新的 glibc。請改用 `musl` 建置。                                                          |

安裝後遇到的問題請參閱[疑難排解](troubleshooting.md#troubleshooting)。
