[English](../en/first-sign-in.md) / [简体中文](../zh-CN/first-sign-in.md) / 繁體中文

# 首次登入

本頁在瀏覽器中開啟 doona，建立管理員帳戶，並檢查 doona 是否顯示正在運作的 honk。honk 必須處於運作狀態，即[服務管理](service-management.md)完成後的狀態。

## 開始之前

- 區域網路中的電腦或手機，或閘道器本機。honk 只接受來自本機、私有網路或鏈路本地位址的管理員建立請求。
- [最小組態](minimal-configuration.md)中設定的 `listen` 位址，例如 `192.168.1.1:9527`。

## 1. 開啟 doona

在瀏覽器中開啟以下位址，並把 `192.168.1.1` 換成你的位址：

```text
http://192.168.1.1:9527/ui/
```

doona 在同一位址找到 honk 的 API，並將其儲存為後端。由於尚未建立管理員，頁面標題為「建立管理員」，包含「使用者名稱」「密碼」「確認密碼」三個欄位。頁面還提供語言、配色與主題控制項。

## 2. 建立管理員

1. 在「使用者名稱」中輸入 1 至 64 個字元，只能包含英文字母、數字、`_`、`.` 與 `-`。
2. 在「密碼」中輸入 8 至 128 個字元的密碼，並在「確認密碼」中再輸入一次。
3. 選擇「建立並登入」。

doona 登入後開啟「活動」頁。honk 把帳戶儲存在狀態資料庫 `/var/lib/honk/state/honk.db` 中（OpenWrt 上為 `/etc/honk/data/state/honk.db`）。之後頁面標題變為「登入」，要求輸入這組使用者名稱與密碼。

## 3. 檢查概覽

在側邊導覽列中選擇「概覽」。honk 運作時，該頁顯示：

- 頁面頂部的「運作中」。
- 「引擎」卡片：「引擎」下為 `honk` 與 `honk-core --version` 輸出的版本，例如 `honk debug.2026.9.28.native-api.4`；「API」下為 `dae/honk-native v1 (draft)`；「建置」下為 honk 的提交與所安裝建置的 target。
- 「後端能力」卡片，列出這個 honk 提供的功能，例如「連線」「日誌」「組態」。

側邊導覽列底部顯示同一個 honk 版本。在有流量經過 honk 之前，流量計數保持為 0。

至此設定完成。如需讓區域網路裝置經過 honk、加入節點與規則，請參閱[組態](configuration.md#config)與[功能](features.md#features)。

## 遇到問題時

| 看到的內容                                                     | 原因與處理                                                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 瀏覽器無法連線                                                 | honk 沒有運作，或位址與 `listen` 不一致。請按[服務管理第 3 步](service-management.md)檢查，並在閘道器上執行 `curl http://192.168.1.1:9527/api`。閘道器上的防火牆也可能攔截 9527 埠。 |
| 「此 honk 建置沒有提供原生 API」                                | 已安裝的 honk-core 沒有原生 API。請安裝 doona 發行版本附帶的建置，見 [honk 版本](requirements.md#honk-version)。                                                     |
| 「後端只接受來自本機、私有網路或鏈路本地位址的管理員建立請求。」 | 瀏覽器從公用網路位址存取了 honk。請在區域網路裝置或閘道器本機上開啟 doona。                                                                                                |
| 「使用者名稱或密碼錯誤。」                                        | 重新輸入。如需替換忘記密碼的管理員，先停止 honk，執行 `sudo /usr/local/bin/honk-core admin reset`（在 root shell 中去掉 `sudo`；OpenWrt 上執行 `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`），再啟動 honk，頁面會重新顯示建立管理員。                                        |
| 顯示「需要 Token」而不是建立管理員                           | `api.dae` 設定了 `secret` 而不是 `password_auth: true`。請把該 secret 作為 Token 輸入，或按[最小組態](minimal-configuration.md)修改 `api.dae` 後重新啟動 honk。          |

更多內容見[登入問題](troubleshooting.md#sign-in)。
