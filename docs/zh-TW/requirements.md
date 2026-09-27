[English](../en/requirements.md) · [简体中文](../zh-CN/requirements.md) · 繁體中文

<a name="requirements"></a>

# 系統需求

## 閘道器

honk 只能在 Linux 上以 `root` 身分執行。它會載入 eBPF 程式、建立 `dae0` 連結與 `daens` 命名空間並修改 sysctl，因此首次啟動時請保留主控台等第二條管理途徑。

- Linux 6.12 或更新版本。核心版本過舊時，honk 會在掛載任何程式之前拒絕啟動。
- 下列核心選項。桌面與伺服器發行版通常已啟用；OpenWrt、Armbian 與 VyOS 需要逐項檢查。
- `pname(...)` 規則需要 cgroup v2。缺少 cgroup v2 時 honk 仍可啟動，但依程序名稱分流無法使用。
- bpffs 掛載於 `/sys/fs/bpf`。

```sh
uname -r
zcat /proc/config.gz 2>/dev/null || cat /boot/config-$(uname -r)
```

```text
CONFIG_BPF=y
CONFIG_BPF_SYSCALL=y
CONFIG_BPF_JIT=y
CONFIG_CGROUP_BPF=y
CONFIG_NET_CLS_BPF=y|m
CONFIG_NET_SCH_INGRESS=y|m
CONFIG_NET_CLS_ACT=y
CONFIG_NET_NS=y
# Held-first-packet UDP (NFQUEUE, on by default) also needs:
CONFIG_NF_TABLES=y|m
CONFIG_NF_TABLES_INET=y|m
CONFIG_NETFILTER_NETLINK_QUEUE=y|m
CONFIG_NFNETLINK_QUEUE=y|m
```

系統未自動掛載 bpffs 時，請執行：

```sh
sudo install -d -m 0755 /sys/fs/bpf
mountpoint -q /sys/fs/bpf || sudo mount -t bpf bpf /sys/fs/bpf
mountpoint /sys/fs/bpf
# To mount it at boot, add this line to /etc/fstab:
# bpf /sys/fs/bpf bpf defaults 0 0
```

<a name="honk-version"></a>

## honk 版本

- 只有 Glassyiris/honk `feat/native-api` 分支的建置提供原生 API，也就是持續更新的 `debug` 版本，目前由標籤 `debug.2026.9.26.native-api.4`（提交 `5d8f32c1`）建置。每個 doona 發行版附上發行當時的建置，其 `HONK-SOURCE.txt` 註明標籤與提交。
- 由 main 分支建置的版本（例如 `debug.2026.9.24.1`）沒有原生 API。honk 會以 `unknown experimental setting` 拒絕所有 `native_api` 設定，存取 `/api` 與 `/ui/` 會回傳 404。
- 地理資料來源設定需要 `debug.2026.9.26.native-api.1` 或更新版本。`debug.2026.9.24.native-api.*` 可以更新地理資料，但無法設定來源。

執行 `honk-core --version` 查看已安裝執行檔的版本；執行中的版本請查看 doona 概覽頁的「引擎」卡片或側邊導覽列底部。

## 瀏覽器與建置

| 元件   | 要求                                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 後端   | 實作 [SOURCE.md](../../contract/api-standardize/SOURCE.md) 所釘契約並啟用 API 監聽的引擎                                      |
| 瀏覽器 | Chrome 或 Edge 120、Firefox 121、Safari 17 及以後。這些是 CSS 建置目標；JavaScript 建置目標是 ES2022。自動化測試只用 Chromium |
| 建置   | 僅從原始碼建置 doona 時需要 Node `^22.18.0 \|\| ^24.0.0 \|\| >=26.0.0` 與 pnpm 11.15.1；打包需要 GNU tar、gzip 與 sha256sum   |
