English / [简体中文](../zh-CN/first-sign-in.md) / [繁體中文](../zh-TW/first-sign-in.md)

# First sign-in

This page opens doona in a browser, creates the administrator account and checks that doona shows the running honk. honk must be running, as [Service management](service-management.md) leaves it.

## Before you start

- A computer or phone on the LAN, or the gateway itself. honk accepts the administrator setup only from loopback, private or link-local addresses.
- The `listen` address from [Minimal configuration](minimal-configuration.md), such as `192.168.1.1:9527`.

## 1. Open doona

Open this address in the browser, with your address in place of `192.168.1.1`:

```text
http://192.168.1.1:9527/ui/
```

doona finds honk’s API at the same address and saves it as its backend. Because no administrator exists yet, it shows a page titled Create the administrator with the fields Username, Password and Confirm password.

## 2. Create the administrator

1. Enter a Username: letters, digits, `_`, `.` and `-`, 1 to 64 characters.
2. Enter a Password of 8 to 128 characters, and the same password under Confirm password.
3. Select Create and sign in.

doona signs you in and opens the Activity page. honk keeps the account in its state database, `/var/lib/honk/state/honk.db` (`/etc/honk/data/state/honk.db` on OpenWrt). From now on the page is titled Sign in and asks for this username and password.

## 3. Check the overview

Select Overview in the side navigation. With honk running, it shows:

- Running at the top of the page.
- The Engine card: under Engine, `honk` and the version `honk-core --version` printed, such as `honk debug.2026.9.28.native-api.2`; under API, `dae/honk-native v1 (draft)`; under Build, the honk commit and the build target you installed.
- The Backend features card, listing what this honk provides, such as Connections, Logs and Configuration.

The bottom of the side navigation shows the same honk version. Traffic counters stay at 0 until traffic passes through honk.

Setup is complete. To route LAN devices, add nodes and rules, see [Configuration](configuration.md#config) and [Features](features.md#features).

## If it doesn’t work

| You see                                                                                    | Cause and fix                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The browser cannot connect                                                                 | honk is not running, or the address differs from `listen`. Check [step 3 of Service management](service-management.md) and `curl http://192.168.1.1:9527/api` on the gateway. A firewall on the gateway can also block port 9527. |
| This honk build has no native API                                                      | The installed honk-core lacks the native API. Install the build from the doona release; see [honk version](requirements.md#honk-version).                                                             |
| The backend accepts administrator setup only from loopback, private or link-local addresses. | The browser reached honk from a public address. Open doona from a device on the LAN, or on the gateway itself.                                                                                         |
| The username or password is incorrect.                                                 | Enter them again. To replace a forgotten administrator, stop honk, run `sudo /usr/local/bin/honk-core admin reset` (without `sudo` in a root shell; on OpenWrt, `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`), then start honk; the setup page opens again.                                                    |
| Token required instead of the setup page                                               | `api.dae` sets `secret` instead of `password_auth: true`. Enter that secret as the token, or change `api.dae` as in [Minimal configuration](minimal-configuration.md) and restart honk.                 |

For more, see [Sign-in problems](troubleshooting.md#sign-in).
