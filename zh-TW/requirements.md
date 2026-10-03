<a name="requirements"></a>

# 系統需求

## 閘道器

honk 只能在 Linux 上以 `root` 身分執行。它會載入 eBPF 程式、建立 `dae0` 連結與 `daens` 命名空間並修改 sysctl，因此首次啟動時請保留主控台等第二條管理途徑。

- Linux 6.12 或更新版本。核心版本過舊時，honk 會在掛載任何程式之前拒絕啟動。
- 下列核心選項。桌面與伺服器發行版通常已啟用；OpenWrt、Armbian 與 VyOS 需要逐項檢查。
- `pname(...)` 規則需要 cgroup v2。缺少 cgroup v2 時 honk 仍可啟動，但依程序名稱分流無法使用。
- bpffs 掛載於 `/sys/fs/bpf`。
- CA 憑證，例如 `ca-certificates` 套件。缺少時 honk 會以 `subscription network startup failed` 結束。
- 地理資料更新可能增加小型路由器的記憶體用量。honk 將更新串流寫入磁碟；在 OpenWrt 上使用 mimalloc 建置時，請保留 [procd 服務](https://zakkaus.github.io/doona-docs/zh-TW/service-management.md)中的 `MIMALLOC_PURGE_DELAY=0`，讓已釋放的記憶體及時歸還系統。

```sh
uname -r
zcat /proc/config.gz 2>/dev/null || cat /boot/config-$(uname -r)
```

```text
CONFIG_BPF=y
CONFIG_BPF_SYSCALL=y
CONFIG_BPF_JIT=y
CONFIG_DEBUG_INFO_BTF=y
CONFIG_CGROUP_BPF=y
CONFIG_NET_CLS_BPF=y|m
CONFIG_NET_SCH_INGRESS=y|m
CONFIG_NET_CLS_ACT=y
CONFIG_NET_NS=y
# Held-first-packet UDP (NFQUEUE, on by default) also needs:
CONFIG_NF_TABLES=y|m
CONFIG_NF_TABLES_INET=y|m
CONFIG_NFT_CT=y|m
CONFIG_NETFILTER_NETLINK_QUEUE=y|m
CONFIG_NFT_QUEUE=y|m
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

- 每個 doona 發布版本都附帶提供原生 API 的 honk-core 建置，建置來自 Glassyiris/honk `feat/native-api` 的 debug 標籤。`native-api` 是需明確啟用的建置功能，這些建置已包含此功能。doona 發布流程固定 honk 提交 `464c9b3`（`debug.2026.10.3.native-api.2`），其嵌入介面為 doona beta.12。發布套件中的 `HONK-SOURCE.txt` 記錄 honk 標籤與完整提交。beta.13 下載檔案發布後，請安裝獨立介面以使用本次更新。
- daeuniverse/honk `main` 分支的建置沒有原生 API。honk 會以 `unknown experimental setting` 拒絕所有 `native_api` 設定，存取 `/api` 與 `/ui/` 會回傳 404。
- `feat/native-api` 分支的建置若未啟用 `native-api` 功能，啟用 `native_api` 時會以 `native-api feature is required` 阻止啟動。
- 早期的 `feat/native-api` 建置可以更新地理資料，但無法設定來源。doona beta.8 和 beta.9 附上的建置兩者皆支援。

執行 `honk-core --version` 查看已安裝執行檔的版本；執行中的版本請查看 doona「系統狀態」頁的「引擎」卡片或側邊導覽列底部。

## 瀏覽器與建置

| 元件   | 要求                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 後端   | 實作 [SOURCE.md](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/SOURCE.md) 所釘契約並啟用 API 監聽的引擎                                                      |
| 瀏覽器 | Chrome 或 Edge 120、Firefox 121、Safari 17 及以後。這些是 CSS 建置目標；JavaScript 建置目標是 ES2022。瀏覽器測試使用 Chromium；CI 另加 WebKit 與 Firefox Nightly 相容性測試。 |
| 建置   | 僅從原始碼建置 doona 時需要 Node `^22.13.0 \|\| ^24.0.0 \|\| >=26.0.0` 與 pnpm 11.15.1；打包需要 GNU tar、gzip 與 sha256sum。 |
