# 在 Fedora 或 RHEL 上安裝

使用系統套件管理員安裝 doona v0.1.0-rc.4 標準版。doona lite 請依照[壓縮檔安裝說明](https://doona.daeuniverse.org/zh-TW/install-manual.md)操作。

在閘道器上開啟終端機，進入新建的下載目錄，並在同一 shell 中完成各步。使用 root shell 時省略 `sudo`。安裝後端前先檢查 [honk 的前提條件](https://doona.daeuniverse.org/zh-TW/install.md#install)。

## 1. 準備下載工具

```sh tab="sudo"
sudo dnf install curl ca-certificates
```

```sh tab="root"
dnf install curl ca-certificates
```

## 2. 下載並驗證套件

從 [v0.1.0-rc.4 發行頁](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-rc.4)下載：

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v0.1.0-rc.4
FILE=doona-0.1.0-rc.4-1.noarch.rpm
curl -fL -O "$BASE/$FILE" -O "$BASE/SHA256SUMS"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c -
```

所有選定檔案都顯示 `OK` 後才能繼續。如果驗證失敗或找不到檢查碼項目，先核對檔名並重新下載，再安裝。

下載或執行檔出錯時，見[安裝故障](https://doona.daeuniverse.org/zh-TW/install.md#安裝故障)。

發行的 RPM 未簽章。安裝前須完成上面的 SHA-256 驗證；檢查碼驗證不等於 RPM 簽章驗證。

## 3. 安裝網頁檔案

```sh
sudo dnf install "./$FILE"
ls -l /usr/share/doona/index.html
```

確認最後一條命令列出 `index.html`。在[獨立介面組態](https://doona.daeuniverse.org/zh-TW/install.md)中使用該目錄。

### 選用套件

字型與預先壓縮檔案的用途見[選用資源](https://doona.daeuniverse.org/zh-TW/install.md#doona)。在下列命令中將 `FILE` 設為表中對應的檔名；範例使用字型套件。

| 資源 | 檔名 |
| --- | --- |
| 字型 | `doona-fonts-0.1.0-rc.4-1.noarch.rpm` |
| 預先壓縮的檔案 | `doona-precompressed-0.1.0-rc.4-1.noarch.rpm` |

```sh
FILE=doona-fonts-0.1.0-rc.4-1.noarch.rpm
curl -fL -O "$BASE/$FILE"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c - &&
  sudo dnf install "./$FILE"
```

## 4. 安裝後端

依照[安裝 honk](https://doona.daeuniverse.org/zh-TW/install.md#install)安裝後端後返回本頁。已有相容的 honk 時無需重複安裝。

套用[獨立介面組態](https://doona.daeuniverse.org/zh-TW/install.md)，[啟動 honk](https://doona.daeuniverse.org/zh-TW/service-management.md)，再按[首次登入](https://doona.daeuniverse.org/zh-TW/first-sign-in.md)操作。
