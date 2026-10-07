[English](../en/install-manual.md) / [简体中文](../zh-CN/install-manual.md) / 繁體中文

# 在其他系統上安裝

在符合以下核心需求的 x86_64 或 aarch64 Linux 系統上，從發行封存檔安裝 doona 與 honk-core。Alpine 也可使用[已簽章的 apk 套件](#install-alpine)。之後繼續閱讀[最小組態](minimal-configuration.md)。

> [!NOTE]
> beta.17 指令需要[發布頁](https://github.com/Zakkaus/doona/releases)上的對應檔案。下載前先確認版本已發布。

## 開始之前

- Linux 6.12 或更高版本，以及[系統需求](requirements.md#requirements)列出的核心選項。用 `uname -r` 檢視核心版本。
- 可使用 sudo 的使用者，或 root shell。需要 root 權限的命令分為「sudo」與「root」兩個分頁，請選擇與目前的 shell 相符的一個。
- curl、tar、gzip、`sha256sum` 與 CA 憑證。honk 使用系統 CA 憑證驗證 HTTPS 下載。在 Alpine 上用 `sudo apk add curl ca-certificates` 安裝，或在 root shell 中執行 `apk add curl ca-certificates`；其他系統的套件名稱相近。
- 能夠連線到 github.com。
- 所有步驟都在同一個終端機中執行：後面的步驟會用到前面設定的 `VERSION`、`BASE` 與 `TARGET` 變數。

<a name="install-alpine"></a>

## 在 Alpine 上安裝

Alpine 的 `.apk` 檔案不能與 OpenWrt 的混用。在目前目錄下載 Alpine 套件、發行公鑰與總和檢查碼：

```sh
VERSION=0.1.0-beta.17
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}-r0.alpine.apk" \
  -O "$BASE/doona-precompressed-${VERSION}-r0.alpine.apk" \
  -O "$BASE/doona-alpine.rsa.pub" -O "$BASE/SHA256SUMS"
grep -E " (doona(-precompressed)?-${VERSION}-r0.alpine.apk|doona-alpine.rsa.pub)\$" SHA256SUMS | sha256sum -c -
```

每次發行都用新金鑰簽署套件。安裝公鑰時保留名稱 `doona-alpine.rsa.pub`，後續版本會替換它。

```sh tab="sudo"
sudo wget -O /etc/apk/keys/doona-alpine.rsa.pub "$BASE/doona-alpine.rsa.pub"
sudo apk add ./doona-${VERSION}-r0.alpine.apk ./doona-precompressed-${VERSION}-r0.alpine.apk
ls -l /usr/share/doona/index.html
```

```sh tab="root"
wget -O /etc/apk/keys/doona-alpine.rsa.pub "$BASE/doona-alpine.rsa.pub"
apk add ./doona-${VERSION}-r0.alpine.apk ./doona-precompressed-${VERSION}-r0.alpine.apk
ls -l /usr/share/doona/index.html
```

`ls` 須列出 `/usr/share/doona/index.html`。選用的 `doona-precompressed` 為支援預先壓縮回應的伺服器加入 `.br` 與 `.gz` 副本；不需要時省略其下載與安裝參數。選用字型套件為 `doona-fonts-${VERSION}-r0.alpine.apk`。

沒有簽章公鑰時，可用 `apk add --allow-untrusted` 直接安裝檔案。安裝 honk-core 請從下方[第 4 步](#4-選擇-honk-core-建置)繼續，選擇 musl 建置。其餘編號步驟說明其他系統的封存檔安裝方式。

## 1. 下載 doona

設定發行版本號，然後把程式封存檔與總和檢查碼檔案下載到目前目錄。

```sh
VERSION=0.1.0-beta.17
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 2. 驗證下載的檔案

該命令適用於 GNU 與 BusyBox 的 `sha256sum`。

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

應顯示：

```text
doona-0.1.0-beta.17.tar.gz: OK
```

## 3. 安裝 doona

設定 `ui: embedded` 時，doona beta.17 發行版中已修正的 honk 附件提供內建的 doona 0.1.0-beta.17，不需單獨安裝介面套件。如果已經下載舊的 honk 附件，請用已修正的發行附件替換；如果 honk 正在運作，請重新啟動 honk。也可以設定 `ui: /usr/share/doona`，提供此處安裝的 beta.17 檔案，詳見[最小組態](minimal-configuration.md)。

把封存檔解壓縮到 `/usr/share/doona`，honk 從這個目錄提供 doona。

```sh tab="sudo"
sudo mkdir -p /usr/share/doona
sudo tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

```sh tab="root"
mkdir -p /usr/share/doona
tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

`ls` 輸出一行以 `/usr/share/doona/index.html` 結尾的內容。

可選：字型封存檔為中文介面加入 Noto Sans TC 與 SC 字型。

```sh tab="sudo"
curl -fL -O "$BASE/doona-fonts-${VERSION}.tar.gz"
grep " doona-fonts-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
sudo tar -xzf doona-fonts-${VERSION}.tar.gz -C /usr/share/doona
```

```sh tab="root"
curl -fL -O "$BASE/doona-fonts-${VERSION}.tar.gz"
grep " doona-fonts-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
tar -xzf doona-fonts-${VERSION}.tar.gz -C /usr/share/doona
```

選用的 `doona-precompressed-${VERSION}.tar.gz` 封存檔在網頁檔案旁加入 `.br` 與 `.gz` 副本，讓伺服器傳送預先壓縮的回應。從同一個發行版本下載並驗證，再像字型封存檔一樣解壓縮到 `/usr/share/doona`。

## 4. 選擇 honk-core 建置

```sh
uname -m
```

發行版本附帶 8 個 honk-core 封存檔，名稱為 `honk-core-debug-<target>.tar.gz`。根據機器類型與 C 函式庫確定 target：

| `uname -m` 輸出 | target 開頭              |
| --------------- | ------------------------ |
| `x86_64`        | `x86_64-unknown-linux-`  |
| `aarch64`       | `aarch64-unknown-linux-` |

| target 結尾     | 適用情況                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `musl`          | 無法確定，或系統使用 musl（例如 Alpine）時選擇此項。靜態連結，不受系統 glibc 版本限制。 |
| `gnu`           | 系統的 glibc 為 2.39 或更高版本。 |
| `-stock` 後綴   | 使用系統記憶體配置器，而非 mimalloc。                                                         |

例如 `x86_64-unknown-linux-musl`、`aarch64-unknown-linux-gnu` 或 `x86_64-unknown-linux-musl-stock`。

## 5. 下載並驗證 honk-core

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

## 6. 安裝 honk-core

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
honk-core debug.2026.10.7.native-api.1
```

同一個發行版本中的 `HONK-SOURCE.txt` 記錄 honk 建置，並提供 honk 原始碼與對應 doona 原始碼的連結。

首次啟動 honk 前，請按[目錄與地理資料](install.md#directories-and-geodata)安裝 `geosite.dat` 與 `geoip.dat`。

下一步：[最小組態](minimal-configuration.md)。服務相關步驟只涵蓋 systemd 與 OpenWrt 的 procd；doona 與 honk 都不提供 OpenRC 指令碼。使用 OpenRC 時（例如 Alpine），[服務管理](service-management.md)提供在前景執行 honk 的命令，用於完成首次登入。

## 遇到問題時

| 看到的內容                                                         | 原因與處理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本號或檔名有誤。請對照[發布頁面](https://github.com/Zakkaus/doona/releases)檢查 `VERSION`。            |
| `no properly formatted checksum lines found`（GNU）或 `no checksum lines found`（BusyBox） | `grep` 沒有找到該檔案對應的行：目前的終端機未設定 `VERSION` 或 `TARGET`，或其中有拼字錯誤。 |
| `FAILED` 以及總和檢查碼不符的 `WARNING`                          | 下載的檔案損壞或不完整。刪除該檔案後重新下載。                                                            |
| `sha256sum: unrecognized option: ignore-missing`                   | BusyBox 沒有 `--ignore-missing` 選項。請使用第 2 步的 `grep` 寫法。                                         |
| `version 'GLIBC_2.38' not found`                                   | `gnu` 建置需要更新的 glibc。請改用 `musl` 建置。                                                          |

安裝後遇到的問題請參閱[疑難排解](troubleshooting.md#troubleshooting)。
