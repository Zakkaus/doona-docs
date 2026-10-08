[English](../en/install-openwrt.md) / [简体中文](../zh-CN/install-openwrt.md) / 繁體中文

# 在 OpenWrt 上安裝

在 OpenWrt 25.12 上，從發行套件或封存檔安裝 doona，並從同一個發行版本安裝 honk-core。之後繼續閱讀[最小組態](minimal-configuration.md)。

> [!NOTE]
> 從[發布頁](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-beta.19)下載 beta.19 附件。

OpenWrt 25.12 使用 apk-tools 3；24.10 及更早版本使用 opkg 與 `.ipk` 檔案。Alpine 的 apk 套件不能用於 OpenWrt。官方 24.10 使用 Linux 6.6，低於 honk 要求的 6.12。

## 開始之前

- OpenWrt 25.12 或更高版本（核心為 Linux 6.12），以及[系統需求](requirements.md#requirements)列出的核心選項。用 `uname -r` 檢視核心版本。
- 路由器上的 root shell，例如 `ssh root@192.168.1.1`。OpenWrt 沒有 sudo，所有命令都以 root 身份執行。
- `/` 上須有足夠空間存放 honk-core、解壓縮後的 doona 檔案、地理資料與狀態資料庫。`/tmp` 須能同時存放下載檔案與解壓縮後的 honk-core 封存內容。用 `df -h / /tmp` 檢查；大小隨建置與地理資料來源變化。
- 從 `debug.2026.9.28.native-api.4` 起，包括 doona beta.10 及之後附帶的 honk 建置，geodata 更新會串流寫入磁碟，並使用 inactivity timeout。請保留 [procd 服務](service-management.md)中的 `MIMALLOC_PURGE_DELAY=0`，讓 mimalloc 在更新後將已釋放的記憶體歸還給系統。
- 能夠連線到 github.com。
- 所有步驟都在同一個 shell 中執行：後面的步驟會用到前面設定的 `VERSION`、`BASE` 與 `TARGET` 變數。

安裝 honk 前先安裝核心模組。缺少 `kmod-veth` 時 honk 無法啟動。缺少 `kmod-nft-queue` 時，honk 會停用 NFQUEUE staging，只在啟動日誌中留下一條警告。`kmod-sched-core` 提供入口排程器。

```sh
apk add kmod-veth kmod-nft-queue kmod-sched-core
```

仍使用 `opkg` 的韌體（如 iStoreOS）請用以下指令安裝相同模組：

```sh
opkg update && opkg install kmod-veth kmod-nft-queue kmod-sched-core
```

官方 OpenWrt 24.10 及更早版本的核心低於 6.12，請先用 `uname -r` 對照[系統需求](requirements.md#requirements)確認核心版本。

<a name="openwrt-packages"></a>

## 套件安裝方式

在 root shell 中把套件下載到 `/tmp/doona`，選擇適合目前套件管理器的指令。兩種方式都將網頁檔案安裝到 `/usr/share/doona`。

OpenWrt 25.12 只簽署索引，不簽署個別套件。將 `doona-openwrt.adb` 與套件放在同一目錄，安裝公鑰後透過索引安裝：

```sh
apk update
apk add curl ca-bundle
mkdir -p /tmp/doona
cd /tmp/doona
VERSION=0.1.0-beta.19
APKVER=0.1.0_beta19
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${APKVER}-r1.apk" \
  -O "$BASE/doona-precompressed-${APKVER}-r1.apk" \
  -O "$BASE/doona-openwrt.adb" -O "$BASE/doona-openwrt.pem" -O "$BASE/SHA256SUMS"
grep -E " (doona(-precompressed)?-${APKVER}-r1.apk|doona-openwrt.adb|doona-openwrt.pem)\$" SHA256SUMS | sha256sum -c -
cp doona-openwrt.pem /etc/apk/keys/
apk add -X /tmp/doona/doona-openwrt.adb doona doona-precompressed
ls -l /usr/share/doona/index.html
```

OpenWrt 24.10 及更早版本使用 ipk 套件。honk 仍要求核心至少為 6.12，此方式需要符合需求的韌體：

```sh
opkg update
opkg install curl ca-bundle
mkdir -p /tmp/doona
cd /tmp/doona
VERSION=0.1.0-beta.19
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona_${VERSION}-1_all.ipk" \
  -O "$BASE/doona-precompressed_${VERSION}-1_all.ipk" -O "$BASE/SHA256SUMS"
grep -E " doona(-precompressed)?_${VERSION}-1_all.ipk\$" SHA256SUMS | sha256sum -c -
opkg install doona_${VERSION}-1_all.ipk doona-precompressed_${VERSION}-1_all.ipk
ls -l /usr/share/doona/index.html
```

`ls` 須列出 `/usr/share/doona/index.html`。選用的 `doona-precompressed` 加入 `.br` 與 `.gz` 副本供伺服器傳送預先壓縮的回應，約占 1.6 MB 儲存空間，不需要時可省略。`doona-fonts` 也是選用套件。每次發行都提供新簽章公鑰。沒有 OpenWrt 公鑰與索引時，直接安裝 apk 須用 `apk add --allow-untrusted ./doona-${APKVER}-r1.apk`。

安裝套件後，從[第 5 步](#5-選擇-honk-core-建置)繼續安裝 honk-core。下方第 1–4 步是封存檔安裝方式。

## 1. 安裝 curl 與 CA 憑證

honk 使用系統 CA 憑證驗證透過 HTTPS 下載的訂閱與地理資料。安裝 curl 與 `ca-bundle`：

```sh
apk update
apk add curl ca-bundle
```

## 2. 下載 doona

在 `/tmp` 中操作。`/tmp` 位於記憶體中，重新啟動後清空。設定發行版本號，然後下載封存檔與總和檢查碼檔案。

```sh
cd /tmp
VERSION=0.1.0-beta.19
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 3. 驗證下載的檔案

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

應顯示：

```text
doona-0.1.0-beta.19.tar.gz: OK
```

## 4. 安裝 doona

設定 `ui: embedded` 時，doona beta.19 的 honk `debug.2026.10.9.native-api.2` 附件（提交 `eac5e0c5fba5078a7ff4517a3e3851e7fa0f4f8e`）提供內建的 doona 0.1.0-beta.19，不需單獨安裝介面套件。也可以設定 `ui: /usr/share/doona`，提供此處安裝的 beta.19 檔案，詳見[最小組態](minimal-configuration.md)。

把封存檔解壓縮到 `/usr/share/doona`，honk 從這個目錄提供 doona。

```sh
mkdir -p /usr/share/doona
tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

`ls` 輸出一行以 `/usr/share/doona/index.html` 結尾的內容。選用的字型封存檔 `doona-fonts-${VERSION}.tar.gz` 包含 Noto Sans TC 與 SC 字型，儲存空間不足時可以不裝。

## 5. 選擇 honk-core 建置

```sh
uname -m
```

OpenWrt 使用 musl，因此選擇 `musl` 建置：

| `uname -m` 輸出 | `TARGET`                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| `x86_64`        | `x86_64-unknown-linux-musl` 或 `x86_64-unknown-linux-musl-stock`         |
| `aarch64`       | `aarch64-unknown-linux-musl` 或 `aarch64-unknown-linux-musl-stock`       |

`-stock` 建置使用系統記憶體配置器，而非 mimalloc。發行版本不提供其他路由器 CPU（例如 MIPS 或 32 位元 ARM）的建置。

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
rm -rf honk-core-debug-$TARGET honk-core-debug-$TARGET.tar.gz doona-${VERSION}.tar.gz SHA256SUMS
```

`honk-core --version` 輸出 honk 的建置版本，例如：

```text
honk-core debug.2026.10.9.native-api.2
```

同一個發行版本中的 `HONK-SOURCE.txt` 記錄 honk 建置，並提供 honk 原始碼與對應 doona 原始碼的連結。

<a name="install-geodata"></a>

## 8. 安裝地理資料

使用 `geosite:` 或 `geoip:` 的分流方式與規則分別需要 `geosite.dat` 或 `geoip.dat`。首次啟動前，建立目錄並下載兩個檔案：

```sh
mkdir -p /etc/honk/config.d /etc/honk/data
chmod 0700 /etc/honk /etc/honk/config.d /etc/honk/data
curl -fL --retry 3 -o /etc/honk/data/geosite.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat
curl -fL --retry 3 -o /etc/honk/data/geoip.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat
```

[最小組態](minimal-configuration.md)中的 OpenWrt 組態將 `data_dir` 設為 `/etc/honk/data`，重啟後仍會保留。請保留此設定：`/var` 位於記憶體中，預設目錄 `/var/lib/honk` 中的檔案會在重啟後遺失。

登入後，可在設定 → 地理資料 → 立即更新中更新 honk 已載入的檔案，替換檔案會寫入 `data_dir`。此方式要求檔案已安裝並載入；若缺少任一檔案，請先用 curl 下載，再[重啟 honk](service-management.md)。

也可用 `apk` 或 `opkg` 安裝 `v2ray-geosite` 與 `v2ray-geoip`，並確保 `/usr/share/dae/geosite.dat` 與 `/usr/share/dae/geoip.dat` 分別連結到 `../v2ray/geosite.dat` 與 `../v2ray/geoip.dat`。honk 會搜尋 `/usr/share/dae`，不會直接搜尋 `/usr/share/v2ray`。

下一步：[最小組態](minimal-configuration.md)。該頁凡是提供「OpenWrt」分頁的地方，都選擇它。

## 系統升級時保留 honk

依[服務管理](service-management.md)建立服務後，在升級前將組態目錄和啟動指令碼加入 OpenWrt 的備份清單：

```sh
printf '%s\n' '/etc/honk/' '/etc/init.d/honk-core' >> /etc/sysupgrade.conf
```

系統升級不會保留核心模組、`/usr/share/doona` 或 `/usr/bin/honk-core`。升級後執行 `apk update` 並重新安裝模組：

```sh
apk add kmod-veth kmod-nft-queue kmod-sched-core
```

使用 `opkg` 的系統請用以下指令重新安裝模組：

```sh
opkg update && opkg install kmod-veth kmod-nft-queue kmod-sched-core
```

重新執行上文第 1 至 7 步，重新安裝 doona 與 honk-core，然後恢復服務的開機自動啟動並啟動服務：

```sh
/etc/init.d/honk-core enable
/etc/init.d/honk-core start
```

## 遇到問題時

| 看到的內容                                                         | 原因與處理                                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                 | 版本號或檔名有誤。請對照[發布頁面](https://github.com/Zakkaus/doona/releases)檢查 `VERSION`。            |
| `sha256sum: WARNING: 1 of 1 computed checksums did NOT match`      | 下載的檔案損壞或不完整。刪除該檔案後重新下載。                                                            |
| `sha256sum: -: no checksum lines found`                            | `grep` 沒有找到該檔案對應的行：目前的 shell 未設定 `VERSION` 或 `TARGET`，或其中有拼字錯誤。                |

若 honk 回報 `persistence_unavailable` 且 reason 為 `unsafe`，請參閱[疑難排解](troubleshooting.md#state-unsafe)。

安裝後遇到的問題請參閱[疑難排解](troubleshooting.md#troubleshooting)。
