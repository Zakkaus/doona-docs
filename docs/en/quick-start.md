[繁體中文](../zh-TW/quick-start.md) / [简体中文](../zh-CN/quick-start.md) / English

# Quick start

Use the doona interface embedded in honk without downloading separate UI files.

Check the [gateway requirements](requirements.md) first. Keep your existing honk configuration; for a new backend, prepare honk's [minimal configuration](https://github.com/daeuniverse/honk/blob/main/doc/en/how-to-start.md#minimal-configuration) before adding the API block below.

## 1. Get honk

On 64-bit OpenWrt or ImmortalWrt 25.12, install honk from the [daeuniverse feed](https://openwrt.daeuniverse.org/en/).

On other Linux systems, follow [Install honk](install.md#install) and choose an archive whose name contains `full` from [honk releases](https://github.com/daeuniverse/honk/releases).

## 2. Configure honk

Add this block to the honk configuration, replacing any existing `native_api` block:

```dae
experimental {
    native_api {
        enabled: true
        listen: '127.0.0.1:9527'
        password_auth: true
        config_write: true
        ui: 'embedded'
    }
}
```

To run doona lite instead, set `ui: 'embedded-lite'` (available from honk v0.1.0-beta.4); see [doona lite](lite.md).

For other options, see [Configuration](configuration.md). [Start or restart honk](service-management.md) to apply the change.

## 3. Open doona

On the machine running honk, open <http://127.0.0.1:9527/>. For a router, run this command on your computer, replacing `<router>` with its SSH address, and keep the connection open:

```sh
ssh -L 9527:127.0.0.1:9527 root@<router>
```

Open the same URL on your computer. The first visit creates the administrator; see [First sign-in](first-sign-in.md).
