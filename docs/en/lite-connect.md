English / [简体中文](../zh-CN/lite-connect.md) / [繁體中文](../zh-TW/lite-connect.md)

<a name="lite-connect"></a>

# Connect doona lite

Connect an installed or separately hosted lite page to honk's native API. For installation, start with [doona lite](lite.md#lite-install).

## 1. Select the backend

1. Open the lite page. If honk serves it, use its `/ui/` address.
2. Enter the server root in **Backend URL**, for example `http://192.168.1.1:9527`, without `/api/v1`.
3. Select **Continue** to discover the sign-in method.

For a separately hosted page or a hostname, configure [hostname and origin access](install.md#other-origin). If discovery fails, check [sign-in requirements](feature-requirements.md#req-sign-in).

## 2. Sign in

| Form | Action |
| --- | --- |
| **Set up administrator** | Enter **Username**, **Password** and **Confirm password**, then select **Create and sign in**. Use the [account format](first-sign-in.md) and [setup requirements](feature-requirements.md#req-sign-in). |
| **Sign in** | Enter the existing honk administrator's **Username** and **Password**, then select **Sign in**. |
| Token field | Enter the configured secret in **Token**, then select **Connect**. |

After connecting, continue with [Common tasks in doona lite](lite-tasks.md). For rejected credentials, use [sign-in troubleshooting](troubleshooting.md#sign-in).

## Explore without a backend

Select **Try the demo** on the connection page to use sample data. Demo changes reset when the page reloads.
