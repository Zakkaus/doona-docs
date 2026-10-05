[English](../en/install-fedora.md) / [简体中文](../zh-CN/install-fedora.md) / 繁體中文

# 在 Fedora 或 RHEL 上安裝

在 Fedora、RHEL 或其他使用 DNF 的系統上，從 `.rpm` 套件安裝 doona，並從同一個發行版本安裝 honk-core。之後繼續閱讀[最小組態](minimal-configuration.md)。

> [!NOTE]
> beta.14 指令需要[發布頁](https://github.com/Zakkaus/doona/releases)上的對應檔案。下載前先確認版本已發布。

## 開始之前

- Linux 6.12 或更高版本，以及[系統需求](requirements.md#requirements)列出的核心選項。用 `uname -r` 檢視核心版本。
- 可使用 sudo 的使用者，或 root shell。需要 root 權限的命令分為「sudo」與「root」兩個分頁，請選擇與目前的 shell 相符的一個。
- 能夠連線到 github.com。
- 所有步驟都在同一個終端機中執行：後面的步驟會用到前面設定的 `VERSION`、`BASE` 與 `TARGET` 變數。

## 1. 安裝 curl 與 CA 憑證

honk 使用系統 CA 憑證驗證透過 HTTPS 下載的訂閱與地理資料。

```sh tab="sudo"
sudo dnf install curl ca-certificates
```

```sh tab="root"
dnf install curl ca-certificates
```

## 2. 下載 doona

設定發行版本號，然後把套件與總和檢查碼檔案下載到目前目錄。

```sh
VERSION=0.1.0-beta.14
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}-1.noarch.rpm" -O "$BASE/SHA256SUMS"
```

## 3. 驗證下載的檔案

```sh
grep " doona-${VERSION}-1.noarch.rpm\$" SHA256SUMS | sha256sum -c -
```

應顯示：

```text
doona-0.1.0-beta.14-1.noarch.rpm: OK
```

## 4. 安裝 doona

設定 `ui: embedded` 時，honk 提供內建的 doona，目前為 beta.12，不需單獨安裝套件。如需提供此處安裝的 beta.14 套件，請設定 `ui: /usr/share/doona`，詳見[最小組態](minimal-configuration.md)。

```sh tab="sudo"
sudo dnf install ./doona-${VERSION}-1.noarch.rpm
ls -l /usr/share/doona/index.html
```

```sh tab="root"
dnf install ./doona-${VERSION}-1.noarch.rpm
ls -l /usr/share/doona/index.html
```

發布的 RPM 未簽章；第 3 步在安裝前驗證其總和檢查碼。`ls` 輸出一行以 `/usr/share/doona/index.html` 結尾的內容。該套件只包含 doona 的網頁檔案與文件，不安裝任何服務。

選用的 `doona-precompressed` 套件在網頁檔案旁加入 `.br` 與 `.gz` 副本，讓伺服器傳送預先壓縮的回應。須與 `doona` 安裝相同版本；未安裝時主套件保持不變。

可選：`doona-fonts` 套件為中文介面加入 Noto Sans TC 與 SC 字型。

```sh tab="sudo"
curl -fL -O "$BASE/doona-fonts-${VERSION}-1.noarch.rpm"
grep " doona-fonts-${VERSION}-1.noarch.rpm\$" SHA256SUMS | sha256sum -c -
sudo dnf install ./doona-fonts-${VERSION}-1.noarch.rpm
```

```sh tab="root"
curl -fL -O "$BASE/doona-fonts-${VERSION}-1.noarch.rpm"
grep " doona-fonts-${VERSION}-1.noarch.rpm\$" SHA256SUMS | sha256sum -c -
dnf install ./doona-fonts-${VERSION}-1.noarch.rpm
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
| `gnu`           | 系統的 glibc 為 2.39 或更高版本。 |
| `-stock` 後綴   | 使用系統記憶體配置器，而非 mimalloc。                                                             |

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
honk-core debug.2026.10.3.native-api.2
```

同一個發行版本中的 `HONK-SOURCE.txt` 註明其附帶的建置。

首次啟動 honk 前，請按[目錄與地理資料](install.md#directories-and-geodata)安裝 `geosite.dat` 與 `geoip.dat`。

下一步：[最小組態](minimal-configuration.md)。

## 遇到問題時

| 看到的內容                                                         | 原因與處理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本號或檔名有誤。請對照[發布頁面](https://github.com/Zakkaus/doona/releases)檢查 `VERSION`。            |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` 沒有找到該檔案對應的行：目前的終端機未設定 `VERSION` 或 `TARGET`，或其中有拼字錯誤。            |
| `FAILED` 與 `WARNING: 1 computed checksum did NOT match`           | 下載的檔案損壞或不完整。刪除該檔案後重新下載。                                                            |
| `version 'GLIBC_2.38' not found`                                   | `gnu` 建置需要更新的 glibc。請改用 `musl` 建置。                                                          |

安裝後遇到的問題請參閱[疑難排解](troubleshooting.md#troubleshooting)。
