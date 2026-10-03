English / [简体中文](../zh-CN/install-openwrt.md) / [繁體中文](../zh-TW/install-openwrt.md)

# Install on OpenWrt

This page installs doona and honk-core on OpenWrt 25.12 from the release archives. After the last step, continue with [Minimal configuration](minimal-configuration.md).

> [!NOTE]
> These beta.13 commands require the assets to be published on the [release page](https://github.com/Zakkaus/doona/releases). They are not yet available; see [Native API status](index.md#native-api-status).

The release’s `.ipk` package does not fit either current OpenWrt series. OpenWrt 25.12 installs packages with `apk`, which rejects the `.ipk` with `v2 package format error`. OpenWrt 24.10 still uses `opkg`, but runs Linux 6.6, older than the 6.12 honk needs.

## Before you start

- OpenWrt 25.12 or later, which runs Linux 6.12, and the kernel options listed in [Requirements](requirements.md#requirements). Check the kernel with `uname -r`.
- A root shell on the router, such as `ssh root@192.168.1.1`. OpenWrt has no sudo; every command runs as root.
- Free space on `/` for honk-core, the extracted doona files, geodata and the state database. `/tmp` must hold the downloads and the extracted honk-core archive at the same time. Check with `df -h / /tmp`; sizes vary by build and geodata source.
- From `debug.2026.9.28.native-api.4` onward, including the honk builds attached to doona beta.10 and later, geodata updates stream to disk and use an inactivity timeout. Keep `MIMALLOC_PURGE_DELAY=0` in the [procd service](service-management.md) so mimalloc returns freed memory to the system after an update.
- Access to github.com.
- Run every step in the same shell: later steps use the `VERSION`, `BASE` and `TARGET` variables that earlier steps set.

Install the kernel modules before installing honk. honk cannot start without `kmod-veth`. Without `kmod-nft-queue`, honk starts with NFQUEUE staging disabled and only logs a warning at startup. `kmod-sched-core` provides the ingress scheduler.

```sh
apk add kmod-veth kmod-nft-queue kmod-sched-core
```

Firmware that still uses `opkg`, such as iStoreOS, installs the same modules with:

```sh
opkg update && opkg install kmod-veth kmod-nft-queue kmod-sched-core
```

Stock OpenWrt 24.10 and earlier ship kernels older than 6.12, so check `uname -r` against [Requirements](requirements.md#requirements) first.

## 1. Install curl and CA certificates

honk uses the system CA certificates to verify HTTPS subscription and geodata downloads. Install curl and `ca-bundle`:

```sh
apk update
apk add curl ca-bundle
```

## 2. Download doona

Work in `/tmp`, which is in memory and is cleared at reboot. Set the release version, then download the archive and the checksum file.

```sh
cd /tmp
VERSION=0.1.0-beta.13
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 3. Verify the download

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

You should see:

```text
doona-0.1.0-beta.13.tar.gz: OK
```

## 4. Install doona

With `ui: embedded`, honk serves its built-in doona, currently beta.12, and needs no separate package. Set `ui: /usr/share/doona` to serve the beta.13 files installed here; see [Minimal configuration](minimal-configuration.md).

Extract the archive into `/usr/share/doona`, the directory honk serves doona from.

```sh
mkdir -p /usr/share/doona
tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

`ls` prints a line ending in `/usr/share/doona/index.html`. The optional font archive, `doona-fonts-${VERSION}.tar.gz`, adds the Noto Sans TC and SC fonts; skip it where storage is short.

## 5. Choose the honk-core build

```sh
uname -m
```

OpenWrt uses musl, so take a `musl` build:

| `uname -m` prints | `TARGET`                                                                    |
| ----------------- | --------------------------------------------------------------------------- |
| `x86_64`          | `x86_64-unknown-linux-musl`, or `x86_64-unknown-linux-musl-stock`           |
| `aarch64`         | `aarch64-unknown-linux-musl`, or `aarch64-unknown-linux-musl-stock`         |

The `-stock` build uses the system allocator instead of mimalloc. There are no release builds for other router CPUs, such as MIPS or 32-bit ARM.

## 6. Download and verify honk-core

Set `TARGET` to the build you chose, then download it from the same release and check it against the same `SHA256SUMS`.

```sh
TARGET=x86_64-unknown-linux-musl
curl -fL -O "$BASE/honk-core-debug-$TARGET.tar.gz"
grep " honk-core-debug-$TARGET.tar.gz\$" SHA256SUMS | sha256sum -c -
```

You should see:

```text
honk-core-debug-x86_64-unknown-linux-musl.tar.gz: OK
```

## 7. Install honk-core

Install the binary as `/usr/bin/honk-core`, the path the procd service in [Service management](service-management.md) starts. OpenWrt’s BusyBox has no `install` command, so copy the file and set its mode. Then remove the downloads from `/tmp` to free the memory they hold.

```sh
tar -xzf honk-core-debug-$TARGET.tar.gz
cp honk-core-debug-$TARGET/honk-core /usr/bin/honk-core
chmod 0755 /usr/bin/honk-core
honk-core --version
rm -rf honk-core-debug-$TARGET honk-core-debug-$TARGET.tar.gz doona-${VERSION}.tar.gz SHA256SUMS
```

`honk-core --version` prints the honk build, for example:

```text
honk-core debug.2026.10.3.native-api.2
```

`HONK-SOURCE.txt` in the same release names the build it carries.

Next: [Minimal configuration](minimal-configuration.md). Take the OpenWrt tab there wherever one is offered.

## Keep honk across sysupgrade

After creating the service in [Service management](service-management.md), add its configuration and init script to OpenWrt’s backup list before sysupgrade:

```sh
printf '%s\n' '/etc/honk/' '/etc/init.d/honk-core' >> /etc/sysupgrade.conf
```

Sysupgrade does not preserve the kernel modules, `/usr/share/doona` or `/usr/bin/honk-core`. After upgrading, run `apk update` and reinstall the modules:

```sh
apk add kmod-veth kmod-nft-queue kmod-sched-core
```

On systems using `opkg`, reinstall the modules with:

```sh
opkg update && opkg install kmod-veth kmod-nft-queue kmod-sched-core
```

Repeat steps 1–7 above to reinstall doona and honk-core, then restore the service’s boot link and start it:

```sh
/etc/init.d/honk-core enable
/etc/init.d/honk-core start
```

## If it doesn’t work

| You see                                                           | Cause and fix                                                                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                | The version or file name is wrong. Check `VERSION` against the [releases](https://github.com/Zakkaus/doona/releases). |
| `sha256sum: WARNING: 1 of 1 computed checksums did NOT match`     | The download is damaged or incomplete. Delete the file and download it again.                              |
| `sha256sum: -: no checksum lines found`                           | `grep` found no line for that file: `VERSION` or `TARGET` was not set in this shell, or it has a typo.     |

If honk reports `persistence_unavailable` with reason `unsafe`, see [Troubleshooting](troubleshooting.md#state-unsafe).

For problems after installation, see [Troubleshooting](troubleshooting.md#troubleshooting).
