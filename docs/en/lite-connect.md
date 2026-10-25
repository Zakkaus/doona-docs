English / [简体中文](../zh-CN/lite-connect.md) / [繁體中文](../zh-TW/lite-connect.md)

<a name="lite-connect"></a>

# Connect doona lite

Connect doona lite to the honk native API, or open the demo without a backend.

1. Open honk’s `/ui/` address. When honk serves the page, doona lite fills in the backend address.
2. From another origin, enter the server root in **Backend URL**, for example `http://192.168.1.1:9527`, without `/api/v1`. Configure [origin access](install.md#other-origin) on honk.
3. Sign in with the administrator password when `password_auth` is enabled. In token mode, enter the configured `secret` in **Token**, then select **Connect**. Both editions use the same sign-in method.
4. To explore without a backend, select **Try the demo**. Demo changes stay in memory and reset when the page reloads.
