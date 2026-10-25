[English](../en/lite-connect.md) / [简体中文](../zh-CN/lite-connect.md) / 繁體中文

<a name="lite-connect"></a>

# 連線 doona lite

將 doona lite 連線至 honk 原生 API，或在沒有後端時開啟示範。

1. 開啟 honk 的 `/ui/` 位址。頁面由 honk 提供時，doona lite 會填入後端位址。
2. 從其他來源開啟時，在**後端網址**中輸入伺服器根位址，例如 `http://192.168.1.1:9527`，不含 `/api/v1`。在 honk 中設定[來源存取權限](install.md#other-origin)。
3. 啟用 `password_auth` 時，使用管理員密碼登入。權杖模式下，在**權杖**中輸入設定的 `secret`，然後選擇**連線至後端**。兩個版本使用相同的登入方式。
4. 不連線後端時，選擇**試用示範**。示範中的修改僅儲存在記憶體中，重新載入頁面後重設。
