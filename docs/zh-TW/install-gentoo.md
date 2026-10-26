[English](../en/install-gentoo.md) / [简体中文](../zh-CN/install-gentoo.md) / 繁體中文

# 在 Gentoo 上安裝

在本機 ebuild 儲存庫中，用 Portage 從 doona 的 ebuild 安裝 doona，並從同一個發行版本安裝 honk-core。之後繼續閱讀[最小組態](minimal-configuration.md)。

> [!NOTE]
> 從[發布頁](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-beta.19)下載 beta.19 附件。

## 開始之前

- Linux 6.12 或更高版本，以及[系統需求](requirements.md#requirements)列出的核心選項。用 `uname -r` 檢視核心版本。
- 可使用 sudo 的使用者，或 root shell。需要 root 權限的命令分為「sudo」與「root」兩個分頁，請選擇與目前的 shell 相符的一個。
- `net-misc/curl` 與 `app-misc/ca-certificates`。honk 使用系統 CA 憑證驗證 HTTPS 下載。
- 能夠連線到 github.com。
- 所有步驟都在同一個終端機中執行：後面的步驟會用到前面設定的 `REPO`、`VERSION`、`PV`、`BASE` 與 `TARGET` 變數。

安裝 lite 時，請先確保 curl 與 CA 憑證已安裝，再直接前往[5. 安裝 doona](#5-安裝-doona)，選擇 doona lite 頁籤。此前的標準版套件、儲存庫、下載與驗證步驟均可略過。

## 1. 建立本機儲存庫

把 `REPO` 設為儲存庫路徑。如果已有本機 ebuild 儲存庫，把 `REPO` 設為該儲存庫的路徑，並跳過此步其餘的命令。

```sh
REPO=/var/db/repos/local
```

建立儲存庫並向 Portage 註冊：

```sh tab="sudo"
sudo mkdir -p "$REPO/metadata" "$REPO/profiles" /etc/portage/repos.conf
echo local | sudo tee "$REPO/profiles/repo_name"
printf 'masters = gentoo\nauto-sync = false\n' | sudo tee "$REPO/metadata/layout.conf"
printf '[local]\nlocation = %s\n' "$REPO" | sudo tee /etc/portage/repos.conf/local.conf
portageq get_repos /
```

```sh tab="root"
mkdir -p "$REPO/metadata" "$REPO/profiles" /etc/portage/repos.conf
echo local > "$REPO/profiles/repo_name"
printf 'masters = gentoo\nauto-sync = false\n' > "$REPO/metadata/layout.conf"
printf '[local]\nlocation = %s\n' "$REPO" > /etc/portage/repos.conf/local.conf
portageq get_repos /
```

最後一條命令在 `gentoo` 旁列出 `local`。

## 2. 加入 doona 的 ebuild

設定發行版本號及其 Gentoo 寫法。ebuild 取自 `v0.1.0-beta.19` 標籤對應的提交，下載網址由 `PV` 決定。

```sh tab="sudo"
VERSION=0.1.0-beta.19
PV=0.1.0_beta19
RAW=https://raw.githubusercontent.com/Zakkaus/doona/v${VERSION}/install/gentoo/net-proxy/doona
sudo mkdir -p "$REPO/net-proxy/doona"
cd "$REPO/net-proxy/doona"
sudo curl -fL -o "doona-$PV.ebuild" "$RAW/doona-$PV.ebuild" -O "$RAW/metadata.xml"
cd -
```

```sh tab="root"
VERSION=0.1.0-beta.19
PV=0.1.0_beta19
RAW=https://raw.githubusercontent.com/Zakkaus/doona/v${VERSION}/install/gentoo/net-proxy/doona
mkdir -p "$REPO/net-proxy/doona"
cd "$REPO/net-proxy/doona"
curl -fL -o "doona-$PV.ebuild" "$RAW/doona-$PV.ebuild" -O "$RAW/metadata.xml"
cd -
```

## 3. 下載並驗證 doona 封存檔

ebuild 安裝發行版本中的程式封存檔；預設啟用的 `fonts` USE 標誌還會安裝字型封存檔。下載這兩個檔案與 `SHA256SUMS` 並驗證。

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/doona-fonts-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep -E " doona(-fonts)?-${VERSION}\.tar\.gz\$" SHA256SUMS | sha256sum -c -
```

應顯示：

```text
doona-0.1.0-beta.19.tar.gz: OK
doona-fonts-0.1.0-beta.19.tar.gz: OK
```

## 4. 把封存檔交給 Portage

把驗證過的封存檔以 ebuild 所需的檔名複製到 distfiles 目錄，再據此生成儲存庫的 `Manifest`。

```sh tab="sudo"
DISTDIR=$(portageq distdir)
sudo cp "doona-${VERSION}.tar.gz" "$DISTDIR/doona-$PV.tar.gz"
sudo cp "doona-fonts-${VERSION}.tar.gz" "$DISTDIR/doona-$PV-fonts.tar.gz"
sudo ebuild "$REPO/net-proxy/doona/doona-$PV.ebuild" manifest
```

```sh tab="root"
DISTDIR=$(portageq distdir)
cp "doona-${VERSION}.tar.gz" "$DISTDIR/doona-$PV.tar.gz"
cp "doona-fonts-${VERSION}.tar.gz" "$DISTDIR/doona-$PV-fonts.tar.gz"
ebuild "$REPO/net-proxy/doona/doona-$PV.ebuild" manifest
```

最後一條命令輸出 `>>> Creating Manifest for` 及套件目錄，預設為 `/var/db/repos/local/net-proxy/doona`。

## 5. 安裝 doona

設定 `ui: embedded` 時，doona beta.19 的 honk `debug.2026.10.9.native-api.2` 附件（提交 `eac5e0c5fba5078a7ff4517a3e3851e7fa0f4f8e`）提供內建的 doona 0.1.0-beta.19，不需單獨安裝介面套件。也可以設定 `ui: /usr/share/doona`，提供此處安裝的 beta.19 套件，詳見[最小組態](minimal-configuration.md)。

該 ebuild 的關鍵字為測試分支（`~amd64`、`~arm64` 等），需要先為這個套件接受測試關鍵字。請把 `~amd64` 換成本機架構的關鍵字。

doona lite 使用壓縮檔，暫不提供發行版套件。請按[安裝 doona lite](lite.md#lite-install)操作，設定 `ui: /usr/share/doona-lite`，然後繼續本頁的 honk 步驟。選擇所需版本與 shell 對應的分頁。

```sh tab="標準版 (sudo)"
sudo mkdir -p /etc/portage/package.accept_keywords
echo 'net-proxy/doona ~amd64' | sudo tee /etc/portage/package.accept_keywords/doona
sudo emerge --ask net-proxy/doona
ls -l /usr/share/doona/index.html
```

```sh tab="標準版 (root)"
mkdir -p /etc/portage/package.accept_keywords
echo 'net-proxy/doona ~amd64' > /etc/portage/package.accept_keywords/doona
emerge --ask net-proxy/doona
ls -l /usr/share/doona/index.html
```

```sh tab="doona lite (sudo)"
VERSION=0.1.0-beta.19
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-lite-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep " doona-lite-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
sudo mkdir -p /usr/share/doona-lite
sudo tar -xzf "doona-lite-${VERSION}.tar.gz" -C /usr/share/doona-lite
ls -l /usr/share/doona-lite/index.html
```

```sh tab="doona lite (root)"
VERSION=0.1.0-beta.19
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-lite-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep " doona-lite-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
mkdir -p /usr/share/doona-lite
tar -xzf "doona-lite-${VERSION}.tar.gz" -C /usr/share/doona-lite
ls -l /usr/share/doona-lite/index.html
```

安裝 lite 後，`ls` 須列出 `/usr/share/doona-lite/index.html`。請繼續[6. 選擇 honk-core 建置](#6-選擇-honk-core-建置)，略過下方的標準版結果說明與選用套件。在[最小組態](minimal-configuration.md)中，將 `ui` 設為 `/usr/share/doona-lite`。

以下為標準版的結果與選用元件：

Portage 最後輸出 `Point the engine's ui setting at /usr/share/doona, or serve that directory with any web server.`，`ls` 輸出一行以 `/usr/share/doona/index.html` 結尾的內容。該套件包含 doona 的網頁檔案與文件，不安裝任何服務。如不需要 Noto Sans TC 與 SC 字型，請為 `net-proxy/doona` 設定 `USE=-fonts`。

## 6. 選擇 honk-core 建置

```sh
uname -m
```

發行版本附帶 8 個 honk-core 封存檔，名稱為 `honk-core-debug-<target>.tar.gz`。根據機器類型與 C 函式庫確定 target：

| `uname -m` 輸出 | target 開頭              |
| --------------- | ------------------------ |
| `x86_64`        | `x86_64-unknown-linux-`  |
| `aarch64`       | `aarch64-unknown-linux-` |

| target 結尾     | 適用情況                                                                              |
| --------------- | ------------------------------------------------------------------------------------- |
| `musl`          | 無法確定，或系統使用 musl 時選擇此項。靜態連結，不受系統 glibc 版本限制。  |
| `gnu`           | 系統的 glibc 為 2.39 或更高版本。 |
| `-stock` 後綴   | 使用系統記憶體配置器，而非 mimalloc。                                               |

例如 `x86_64-unknown-linux-musl`、`aarch64-unknown-linux-gnu` 或 `x86_64-unknown-linux-musl-stock`。

## 7. 下載並驗證 honk-core

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

## 8. 安裝 honk-core

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
honk-core debug.2026.10.9.native-api.2
```

同一個發行版本中的 `HONK-SOURCE.txt` 記錄 honk 建置，並提供 honk 原始碼與對應 doona 原始碼的連結。

首次啟動 honk 前，請按[目錄與地理資料](install.md#directories-and-geodata)安裝 `geosite.dat` 與 `geoip.dat`。

下一步：[最小組態](minimal-configuration.md)。服務相關步驟只涵蓋 systemd 與 OpenWrt 的 procd；doona 與 honk 都不提供 OpenRC 指令碼。使用 OpenRC 時，[服務管理](service-management.md)提供在前景執行 honk 的命令，用於完成首次登入。

## 遇到問題時

| 看到的內容                                                         | 原因與處理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本號或檔名有誤。請對照[發布頁面](https://github.com/Zakkaus/doona/releases)檢查 `VERSION` 與 `PV`。    |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` 沒有找到該檔案對應的行：目前的終端機未設定 `VERSION` 或 `TARGET`，或其中有拼字錯誤。            |
| `FAILED` 與 `WARNING: 1 computed checksum did NOT match`           | 下載的檔案損壞或不完整。刪除該檔案後重新下載。                                                            |
| `emerge` 找不到 `net-proxy/doona`                                  | `portageq get_repos /` 沒有列出 `local`：請檢查第 1 步寫入的三個檔案。                                    |
| `emerge` 報告該套件因 `~amd64` 被遮罩                            | `/etc/portage/package.accept_keywords/doona` 中的關鍵字與本機架構不符。                                   |
| `version 'GLIBC_2.38' not found`                                   | `gnu` 建置需要更新的 glibc。請改用 `musl` 建置。                                                          |

安裝後遇到的問題請參閱[疑難排解](troubleshooting.md#troubleshooting)。
