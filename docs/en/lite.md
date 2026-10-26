English / [简体中文](../zh-CN/lite.md) / [繁體中文](../zh-TW/lite.md)

<a name="lite"></a>

# doona lite

doona lite edits honk configuration through a smaller interface for beginners.

Pages: **Nodes**, **Subscriptions**, **Groups**, **Routing**, **DNS**. The Settings dialog edits global settings. Search finds resources, and manual nodes can be shared as links or QR codes. The demo works with sample data.

There are no traffic pages, advanced Trace tab or full configuration source editor. **Routing** offers **Test rules** to check matched rules and outbounds. See [the edition comparison](editions.md#editions-compare).

![Nodes](../images/lite-nodes-light.webp)

<a name="lite-install"></a>

## Install doona lite

Install honk and write its [minimal configuration](minimal-configuration.md) first. In a writable working directory, download the lite archive and `SHA256SUMS` from the same release, verify the download, and extract it. These commands use sudo; omit it in a root shell.

[doona releases](https://github.com/Zakkaus/doona/releases)

```sh
VERSION=0.1.0-beta.19
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-lite-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep " doona-lite-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
sudo mkdir -p /usr/share/doona-lite
sudo tar -xzf "doona-lite-${VERSION}.tar.gz" -C /usr/share/doona-lite
ls -l /usr/share/doona-lite/index.html
```

The checksum must report `OK`, and `ls` must list `/usr/share/doona-lite/index.html`. In the existing `experimental` → `native_api` block, set:

```dae
ui: '/usr/share/doona-lite'
```

[Restart honk](service-management.md), then open its `/ui/` address, for example `http://192.168.1.1:9527/ui/`. Continue with [Connect doona lite](lite-connect.md).

<a name="lite-switch"></a>

## Switch back to the standard edition

Set `ui` to the installed standard edition directory, normally `/usr/share/doona` (`/usr/share/doona-web` for Debian or Ubuntu packages), or use `ui: embedded`. Restart honk and reload `/ui/`. You can keep both directories installed; see [Install and switch editions](editions.md#editions-switch).
