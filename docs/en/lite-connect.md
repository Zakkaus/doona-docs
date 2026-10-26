English / [简体中文](../zh-CN/lite-connect.md) / [繁體中文](../zh-TW/lite-connect.md)

<a name="lite-connect"></a>

# Connect doona lite

Connect doona lite to the honk native API, or open the demo without a backend.

1. Open honk’s `/ui/` address, or the separately hosted lite page. On first use, enter the server root in **Backend URL**, for example `http://192.168.1.1:9527`, without `/api/v1`. For a different origin, configure [origin access](install.md#other-origin) on honk.
2. Select **Continue** to check the connection and discover the sign-in method.
3. If **Set up administrator** appears, enter **Username**, **Password** and **Confirm password**, then select **Create and sign in**. honk accepts administrator creation only when the client address it sees is loopback, private or link-local. See [First sign-in](first-sign-in.md) for account requirements and setup troubleshooting.
4. If **Sign in** appears, enter the existing administrator’s **Username** and **Password**, then select **Sign in**.
5. In token mode, enter the configured `secret` in **Token**, then select **Connect**. Both editions use the same honk credentials.

To explore without a backend, select **Try the demo**. Demo changes stay in memory and reset when the page reloads.
