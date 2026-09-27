[English](../en/install.md) · [简体中文](../zh-CN/install.md) · 繁體中文

# 安裝詳解

先安裝 honk 並撰寫組態，再安裝 doona 並啟動 honk。開始前請確認[系統需求](requirements.md#requirements)。「安裝」下的其他頁面按系統逐步介紹同樣的安裝過程，從 [Debian 或 Ubuntu](install-debian.md) 開始。

<a name="install"></a>

## 安裝 honk

每個 doona 發行版都附有具備原生 API 的 honk-core 建置，`HONK-SOURCE.txt` 註明建置所用的 honk 提交。請從同一個發行版下載適合閘道器的封存檔與 `SHA256SUMS`。其他 honk 建置沒有原生 API，詳見 [honk 版本](requirements.md#honk-version)。v0.1.0-beta.7 及更早的發行版不含 honk，請改從 Glassyiris/honk 的 `debug` 版本下載同名封存檔；每次新的 honk 建置都會取代該版本的檔案。

- [doona 發布頁](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` 版本](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk 快速入門](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)

| 檔名片段             | 用途                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `x86_64`、`aarch64`  | 閘道器的 CPU 架構，即 `uname -m` 的輸出。                             |
| `unknown-linux-musl` | 靜態連結，適用於閘道器。無法確定時請選擇此項。                        |
| `unknown-linux-gnu`  | 連結 glibc，適用於一般發行版。                                        |
| 無後綴               | 使用 mimalloc，為預設建置，QUIC 效能較佳。                            |
| `-stock` 後綴        | 使用系統記憶體配置器而非 mimalloc，適用於較重視記憶體用量的小型裝置。 |

```sh
VERSION=0.1.0-beta.8               # the doona release, without v
TARGET=x86_64-unknown-linux-musl   # or aarch64-unknown-linux-musl, -gnu, and a -stock suffix
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/honk-core-debug-$TARGET.tar.gz" -O "$BASE/SHA256SUMS"
grep " honk-core-debug-$TARGET.tar.gz\$" SHA256SUMS | sha256sum -c -
tar -xzf honk-core-debug-$TARGET.tar.gz
sudo install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
honk-core --version   # prints the tag the build came from, such as debug.2026.9.28.native-api.2
```

如需自行建置 honk，請簽出 `HONK-SOURCE.txt` 註明的提交，依 honk 快速入門的步驟建置：先建置 eBPF 物件，再執行 `cargo build --release -p honk-core --features ebpf`。`native-api` 是預設功能；未啟用 `ebpf` 時 honk 沒有資料路徑。發布頁同時附有該提交的原始碼封存 `honk-source-<commit>.tar.gz`。

執行檔已內建 eBPF 物件，不需另行安裝該物件。

### 目錄與地理資料

建立組態目錄與資料目錄，再下載範例規則使用的 geosite 與 geoip 檔案。honk 會在 `data_dir` 中尋找這兩個檔案；它們也是 honk 更新地理資料時下載的檔案。

```sh
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
sudo curl -fL --retry 3 -o /var/lib/honk/geosite.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat
sudo curl -fL --retry 3 -o /var/lib/honk/geoip.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat
```

### systemd 服務

發布套件不含 systemd 單元。請建立 `/etc/systemd/system/honk-core.service`：

```ini
[Unit]
Description=honk transparent proxy engine
Wants=network-online.target
After=network-online.target

[Service]
Type=notify
User=root
WorkingDirectory=/var/lib/honk
ExecStart=/usr/local/bin/honk-core --config /etc/honk/config.dae --disable-timestamp
ExecReload=/usr/local/bin/honk-core reload
Restart=on-failure
RestartSec=2s
TimeoutStopSec=30s
LimitNOFILE=1048576
LimitMEMLOCK=infinity
UMask=0077

[Install]
WantedBy=multi-user.target
```

此時請勿啟動服務。範例組態從 `/usr/share/doona` 提供 doona，該目錄沒有 `index.html` 時 honk 會拒絕啟動；啟動步驟位於[安裝 doona 並啟動](#doona)。

請勿加入 `NoNewPrivileges=yes`、能力邊界限制或唯讀 `/proc/sys`，因為啟動過程需要 BPF、網路管理、命名空間、掛載與 sysctl 權限。

## 撰寫組態

依[組態](configuration.md#config)一頁撰寫並安裝 `/etc/honk/config.dae` 與 `/etc/honk/config.d/api.dae`，再繼續下一節。

<a name="doona"></a>

## 安裝 doona 並啟動

同時下載 doona 發布套件與 `SHA256SUMS`，再將套件解壓縮到 `/usr/share/doona`，也就是 `ui` 指定的目錄。最後一個指令必須列出 `index.html`，否則 honk 無法啟動。

- [doona 發布頁](https://github.com/Zakkaus/doona/releases)

```sh
VERSION=0.1.0-beta.8   # the doona release, without v
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/doona-fonts-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep -E " doona(-fonts)?-${VERSION}\.tar\.gz\$" SHA256SUMS | sha256sum -c -
sudo mkdir -p /usr/share/doona
sudo tar -xzf "doona-${VERSION}.tar.gz" -C /usr/share/doona
# Optional Noto Sans TC and SC fonts:
if [ -f "doona-fonts-${VERSION}.tar.gz" ]; then
    sudo tar -xzf "doona-fonts-${VERSION}.tar.gz" -C /usr/share/doona
fi
ls -l /usr/share/doona/index.html
```

honk 每次請求都從磁碟讀取這些檔案，因此日後替換檔案不需重新啟動。

### 啟動 honk

啟用並啟動服務，再查看日誌：

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now honk-core
sudo systemctl status honk-core
sudo journalctl -u honk-core -e
```

日誌出現 `honk-core is running` 即表示啟動完成。

### 狀態資料庫

honk 預設會開啟 `<data_dir>/state/honk.db`：`global.store_subscribe` 預設為開啟，本範例也啟用了 `native_api`。狀態資料庫沒有需要加入的開關。此資料庫儲存管理員帳號、地理資料來源，以及 honk 需要持久保存的其他狀態。honk 會自行建立 `state/` 與 `honk.db`，`/var/lib/honk` 不存在時也由 honk 建立。執行 honk 的使用者必須能在 `/var/lib` 中建立該目錄，並能寫入該目錄；本範例中該使用者為 root。

本範例設定了 `password_auth: true`，資料庫無法開啟時 honk 不會啟動，因此 honk 正在執行即代表資料庫已開啟。Token 模式下 honk 不使用資料庫也會啟動，並記錄一則警告；此時缺少狀態資料庫代表它未能開啟。日誌訊息的意義請參閱[狀態資料庫問題](troubleshooting.md#state-db)。

### 首次登入

1. 開啟 `http://192.168.1.1:9527/ui/`，也就是 `listen` 位址。doona 會在同一來源找到 API，並將其儲存為後端。
2. 密碼模式：登入頁面顯示「建立管理員」。請在閘道器本機或區域網路裝置上建立管理員，再登入。
3. Token 模式：輸入 `secret` 作為 Token，或開啟配對連結。doona 載入後會從網址列移除 Token。

```text
http://192.168.1.1:9527/ui/#/settings?api=http://192.168.1.1:9527&token=…
```

忘記管理員密碼時，請先停止 honk，再執行 `sudo honk-core admin reset`；下次啟動時會重新進入首次設定。

<a name="other-origin"></a>

### 從其他來源開啟 doona

doona 由其他伺服器提供時，瀏覽器會送出跨網域請求，honk 只接受 `allow_origins` 列出的來源與 `allowed_hosts` 列出的主機。請在設定中填寫伺服器根網址，例如 `http://192.168.1.1:9527`，不要附加 `/api/v1`。「測試連線」會在儲存前檢查探索端點，儲存後頁面會重新載入。

透過 HTTPS 載入的頁面無法存取純 HTTP 的 API，瀏覽器會將其視為混合內容並封鎖。請從 honk 的 `/ui/` 開啟 doona，或將 honk 置於 TLS 反向代理之後。

任一靜態伺服器都能提供解壓縮後的檔案，放在網站根目錄或 `/ui/` 這類前綴下皆可。頁面使用 hash 路由（`/ui/#/activity`），不需要改寫規則。

反向代理可讓 doona 與 honk 同源：將精確路徑 `/api`（探索端點）和 `/api/` 下的所有路徑轉送至 honk 的監聽位址，靜態檔案放在 `/ui/` 下。如果設定了代理路徑前綴，兩類 API 路徑都必須保留該前綴。

### 發行版套件

目前尚無發行版套件庫收錄 doona。每個發布版本附有 [nfpm](../../install/nfpm) 以預先建置的程式封存檔與字型封存檔產生的 `deb`、`rpm`、`ipk` 與 Arch 套件，全部與架構無關；`doona-fonts` 是獨立的選用套件。[install/](../../install/README.md) 中 OpenWrt、Alpine、Gentoo 與 Nix 的打包設定是尚未提交的範本，安裝的也是同一批封存檔。AUR 的 `doona-bin` 位於獨立倉庫。封裝本機建置結果時，可使用 `make install DESTDIR=… PREFIX=/usr` 與 `make install-fonts`。

<a name="operation"></a>

## 日常維護

### 重載與重新啟動

```sh
sudo systemctl reload honk-core    # re-read the configuration
sudo systemctl restart honk-core   # needed for native_api, interfaces, data_dir
sudo journalctl -u honk-core -e    # look for applied or rejected
```

重載會重新讀取組態，並在日誌中記錄 `applied` 或 `rejected`。變更 `native_api`、網路介面、TPROXY 設定、`data_dir`、`log_level`、健康檢查設定、NFQUEUE 開關、DNS 監聽或 Clash API 監聽後需要重新啟動；被拒絕的重載會在日誌中列出這些欄位。doona 的組態頁在套用後會自動重載。

### 更新 honk

從較新的 doona 發行版下載 honk-core 封存檔，或從 honk `debug` 版本下載較新的建置，依[安裝 honk](#install) 一節安裝，再執行 `sudo systemctl restart honk-core` 並檢查 `honk-core --version`。`debug` 標籤會隨每次建置移動，請將版本與 [honk 版本](requirements.md#honk-version)註明的版本對照。

### 更新 doona

將新版本解壓縮到 `/usr/share/doona`，再於瀏覽器中重新載入頁面。honk 不需重新啟動。

### 更新地理資料

在設定的地理資料卡片中按下「更新」，honk 會下載並啟用兩個檔案。自動更新預設開啟，每 24 小時檢查一次；可在同一卡片關閉或變更間隔。

### 檔案位置

| 路徑                          | 內容                                 |
| ----------------------------- | ------------------------------------ |
| `/etc/honk/config.dae`        | 主組態檔案                           |
| `/etc/honk/config.d/api.dae`  | 原生 API 組態區塊                    |
| `/var/lib/honk/`              | `data_dir`：地理資料檔案與執行期資料 |
| `/var/lib/honk/state/honk.db` | 狀態資料庫                           |
| `/usr/share/doona/`           | 在 `/ui/` 提供的 doona 檔案          |
| `journalctl -u honk-core`     | honk 日誌                            |
