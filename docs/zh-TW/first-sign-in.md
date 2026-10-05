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

doona 在同一位址找到 honk 的 API，並將其儲存為後端。尚未建立管理員時，頁面顯示「建立管理員」。

![建立管理員頁面，右上角為語言、配色與明暗模式控制](../screenshots/zh-TW/login-setup.webp)

登入前可直接使用右上角的三個圖示調整語言、配色與明暗模式。所有螢幕尺寸下，登入表單均顯示為置中的單張卡片。選擇玻璃配色時，[自訂背景圖片](config-and-settings.md#settings-page)也顯示在卡片後方。

## 2. 建立管理員

1. 在「使用者名稱」中輸入 1 至 64 個字元，只能包含英文字母、數字、`_`、`.` 與 `-`。
2. 在「密碼」中輸入 8 至 128 個字元的密碼，並在「確認密碼」中再輸入一次。
3. 選擇「建立並登入」。

doona 登入後開啟「活動」頁。honk 把帳戶儲存在狀態資料庫 `/var/lib/honk/state/honk.db` 中（OpenWrt 上為 `/etc/honk/data/state/honk.db`）。之後頁面標題變為「登入」，要求輸入這組使用者名稱與密碼。

密碼工作階段儲存在此瀏覽器中，同一網站來源的所有分頁共享工作階段。關閉分頁不會結束工作階段；登出、honk 傳回 401 或刪除連線設定檔後，工作階段會清除。honk 將工作階段時限設為 12 小時，重新啟動後會清除所有工作階段。

## 3. 檢查系統狀態

在側邊導覽列中選擇「系統狀態」。手機上先選擇底部導覽列的「活動」，再選擇頁面導覽列中的「系統狀態」。honk 運作時，該頁顯示：

- 頁面頂部的「運作中」。
- 「引擎」卡片：「引擎」下為 `honk` 與版本；「API」下為 `daeuniverse/native v1 (draft)`；「建置」下為 honk 的提交與所安裝建置的 target。
- 「後端能力」卡片，列出這個 honk 提供的功能，例如「連線」「日誌」「組態」。

後端指示器開啟的彈出框顯示 honk 版本與連線狀態。在有流量經過 honk 之前，流量計數保持為 0。

至此設定完成。如需讓區域網路裝置經過 honk、加入節點與規則，請參閱[組態](configuration.md#config)與[功能](features.md#features)。

## 遇到問題時

| 看到的內容                                                     | 原因與處理                                                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 瀏覽器無法連線                                                 | honk 沒有運作，或位址與 `listen` 不一致。請按[服務管理第 3 步](service-management.md)檢查，並在閘道器上執行 `curl http://192.168.1.1:9527/api`。閘道器上的防火牆也可能攔截 9527 埠。 |
| 「此 honk 建置沒有提供原生 API」                                | 已安裝的 honk-core 沒有原生 API。請安裝 doona 發行版本附帶的建置，見 [honk 版本](requirements.md#honk-version)。                                                     |
| 「後端只接受來自本機、私有網路或鏈路本地位址的管理員建立請求。」 | 瀏覽器從公用網路位址存取了 honk。請在區域網路裝置或閘道器本機上開啟 doona。                                                                                                |
| 「使用者名稱或密碼錯誤。」                                        | 重新輸入。如需替換忘記密碼的管理員，先停止 honk，執行 `sudo /usr/local/bin/honk-core admin reset`（在 root shell 中去掉 `sudo`；OpenWrt 上執行 `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`），再啟動 honk，頁面會重新顯示建立管理員。                                        |
| 顯示「需要 Token」而不是建立管理員                           | `api.dae` 設定了 `secret` 而不是 `password_auth: true`。請把該 secret 作為 Token 輸入，或按[最小組態](minimal-configuration.md)修改 `api.dae` 後重新啟動 honk。          |

![Token 登入頁面，顯示 Token 欄位、顯示或隱藏控制與連線按鈕](../screenshots/zh-TW/login-token.webp)

在 Token 欄位輸入後端 secret，可用顯示或隱藏按鈕檢查內容，再按「連線」。doona 將 Token 儲存在目前瀏覽器的連線設定檔中。

更多內容見[登入問題](troubleshooting.md#sign-in)。
