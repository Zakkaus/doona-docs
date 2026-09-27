[English](../en/troubleshooting.md) / [简体中文](../zh-CN/troubleshooting.md) / 繁體中文

<a name="troubleshooting"></a>

# 疑難排解

<a name="unknown-setting"></a>

## native_api 設定寫在 native_api { } 之外

`native_api` 的欄位直接寫在 `experimental` 下，honk 因此拒絕此組態。`fatal error, shutting down:` 一行會列出設定路徑與訊息，例如 `experimental.ui: native API setting belongs inside native_api { }`。`enabled` 與 `secret` 也屬於其他組態區塊，因此 honk 對這兩個欄位只回報 `unknown experimental setting`。請將欄位移入 `native_api { }`。

```dae
# Wrong: "native API setting belongs inside native_api { }"
experimental {
    ui: '/usr/share/doona'
}

# Wrong: "unknown experimental setting"
experimental {
    enabled: true
}

# Right
experimental {
    native_api {
        enabled: true
        password_auth: true
        ui: '/usr/share/doona'
    }
}
```

由 main 分支建置的 honk 沒有原生 API，會以 `unknown experimental setting` 拒絕整個 `native_api { }` 組態區塊。請執行 `honk-core --version` 檢查版本並安裝 `debug` 版本，詳見 [honk 版本](requirements.md#honk-version)。

## honk 拒絕 native_api 組態區塊

- `configuration administration requires a bearer secret or password login`：`config_write: true` 需要 `password_auth: true` 或 `secret`。
- `password login requires an empty secret; a configured secret selects token mode`：兩者只能保留一個。
- `password login cannot be combined with anonymous loopback`：刪除 `allow_anonymous_loopback`。
- `native API requires a secret, password login, or explicitly anonymous loopback`：`enabled: true` 需要 `password_auth: true` 或 `secret`。

<a name="state-db"></a>

## 狀態資料庫問題

範例組態設定了 `password_auth: true`，資料庫無法開啟時 honk 會在啟動時結束，日誌顯示 `state database:` 與原因。Token 模式下 honk 會記錄警告並在沒有資料庫的情況下執行：地理資料來源卡片消失，只有同時設定兩個下載網址，「更新」按鈕才會保留。請在日誌中尋找原因：

```sh
sudo journalctl -u honk-core | grep -i 'state database'
sudo ls -la /var/lib/honk/state/
```

日誌也會保留先前每次啟動的訊息，請查看最近一次啟動的記錄。

```text
state database is unavailable
state database path is unsafe
state database is locked by `honk-core admin reset`
state database is corrupt
```

1. unavailable：`data_dir` 不存在時由 honk 建立，`state/` 也由 honk 在其中建立。執行 honk 的使用者必須能在父目錄中建立 `data_dir`，並能寫入該目錄；使用[安裝](install.md#install)中的 systemd 單元時該使用者為 root。
2. unsafe：`state/` 與 `honk.db` 必須屬於該使用者，且不授予群組或其他使用者任何權限。`honk.db` 必須是一般檔案，不能是符號連結，也不能在 honk 開啟時被替換。
3. locked：等待 `honk-core admin reset` 執行完畢。
4. corrupt：設定 `password_auth: true` 時 honk 會結束。Token 模式下 honk 會將檔案移至 `honk.db.corrupt` 並建立新的資料庫；若已存在較早的 `.corrupt` 檔案，honk 會保留兩者，並在該檔案刪除之前不使用資料庫執行。
5. 修正後重新啟動 honk。

`another honk-core has the state database open` 與 `state database has a foreign application id or a newer schema` 一律會阻止啟動：請停止另一個執行個體，或使用寫入該資料庫的 honk 版本。

## 固定映射時出現 Invalid argument

`/sys/fs/bpf` 不是 bpffs。請依[系統需求](requirements.md#requirements)掛載。

## 核心版本過舊

honk 會在掛載前拒絕早於 6.12 的核心。驗證器拒絕編譯後的分流程式時，請使用啟用 BPF 與 BTF 的 Linux 6.12 或更新版本，並保留完整的驗證器日誌以便回報。

<a name="no-native-api"></a>

## 沒有原生 API，或 /api、/ui/ 回傳 404

從 `journalctl -u honk-core -b` 的本次開機日誌中找到最近一筆 `honk-core <版本> starting`，再與 [honk 版本](requirements.md#honk-version)對照。

- 無法連線到 `listen` 位址：honk 未執行、`enabled` 不是 `true`，或 `listen` 指向其他位址。`enabled: false` 時監聽不會啟動。
- `/api` 回傳 404：該位址上的服務沒有原生 API，例如由 main 分支建置的 honk。doona 的登入頁面此時顯示「此 honk 建置沒有提供原生 API」。請安裝 `debug` 版本。
- 只有 `/ui/` 回傳 404：原生 API 正在執行，但 `ui` 為空。
- honk 啟動時以 `failed to inspect native UI directory`、`failed to inspect native UI index.html` 或 `native UI index.html must be a regular file` 結束：請依[安裝 doona 並啟動](install.md#doona)將 doona 解壓縮到 `ui` 目錄。

<a name="sign-in"></a>

## 登入與跨網域失敗

- 首次設定只能在閘道器本機或私有網路中的用戶端完成。
- 設定中顯示「網路連線失敗」或「網路或跨網域請求失敗」：無法透過 `listen` 位址存取 honk，或 doona 所在來源未列入 `allow_origins` 與 `allowed_hosts`。
- 忘記密碼：停止 honk，執行 `sudo /usr/local/bin/honk-core admin reset`（在 root shell 中去掉 `sudo`；OpenWrt 上執行 `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`），再啟動 honk 重新設定。
- HTTPS 頁面無法存取 HTTP API，請參閱[從其他來源開啟 doona](install.md#other-origin)。

<a name="read-only"></a>

## 唯讀的組態檔案

符合下列任一條件時，doona 會將組態檔案標記為唯讀：

- `config_write` 不是 `true`。
- 既沒有 `password_auth: true`，也沒有 `secret`。
- 檔案在 `native_api` 或 `clash_api` 中包含 `secret`，或包含與 8 個字元以上監聽密鑰相同的文字。
- honk 仍在載入組態檔案，或其寫入協調器未執行。
- 僅在以 `--store db` 執行時出現，本文件不使用此模式：已啟用的修訂未能記錄，導致寫入被阻止。

請將所有密鑰移入 `config.d/api.dae`，並在變更 `native_api` 後重新啟動 honk。
