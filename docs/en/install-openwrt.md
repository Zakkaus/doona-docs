English / [简体中文](../zh-CN/install-openwrt.md) / [繁體中文](../zh-TW/install-openwrt.md)

# Install on OpenWrt

Install doona from a release package or archive and honk-core from the same release on OpenWrt 25.12. Then continue with [Minimal configuration](minimal-configuration.md).

> [!NOTE]
> Download the beta.18 assets from the [release page](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-beta.18).

OpenWrt 25.12 uses apk-tools 3; OpenWrt 24.10 and earlier use opkg and `.ipk` files. Alpine apk packages do not work on OpenWrt. Stock 24.10 runs Linux 6.6, below honk's 6.12 requirement.

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

<a name="openwrt-packages"></a>

## Package routes

In a root shell, download the packages into `/tmp/doona`. Choose the commands for your package manager. Both install the web files into `/usr/share/doona`.

OpenWrt 25.12 signs the index, not the individual packages. Keep `doona-openwrt.adb` and the packages together, then install the public key and use that index:

```sh
apk update
apk add curl ca-bundle
mkdir -p /tmp/doona
cd /tmp/doona
VERSION=0.1.0-beta.18
APKVER=0.1.0_beta18
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${APKVER}-r1.apk" \
  -O "$BASE/doona-precompressed-${APKVER}-r1.apk" \
  -O "$BASE/doona-openwrt.adb" -O "$BASE/doona-openwrt.pem" -O "$BASE/SHA256SUMS"
grep -E " (doona(-precompressed)?-${APKVER}-r1.apk|doona-openwrt.adb|doona-openwrt.pem)\$" SHA256SUMS | sha256sum -c -
cp doona-openwrt.pem /etc/apk/keys/
apk add -X /tmp/doona/doona-openwrt.adb doona doona-precompressed
ls -l /usr/share/doona/index.html
```

OpenWrt 24.10 and earlier use the ipk packages. honk still needs a kernel of at least 6.12, so this route requires suitable firmware:

```sh
opkg update
opkg install curl ca-bundle
mkdir -p /tmp/doona
cd /tmp/doona
VERSION=0.1.0-beta.18
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona_${VERSION}-1_all.ipk" \
  -O "$BASE/doona-precompressed_${VERSION}-1_all.ipk" -O "$BASE/SHA256SUMS"
grep -E " doona(-precompressed)?_${VERSION}-1_all.ipk\$" SHA256SUMS | sha256sum -c -
opkg install doona_${VERSION}-1_all.ipk doona-precompressed_${VERSION}-1_all.ipk
ls -l /usr/share/doona/index.html
```

`ls` must list `/usr/share/doona/index.html`. The optional `doona-precompressed` package adds `.br` and `.gz` copies for precompressed responses and uses about 1.6 MB of storage; omit it if not needed. `doona-fonts` is also optional. Each release supplies a new signing key. Without the OpenWrt key and index, direct apk installation requires `apk add --allow-untrusted ./doona-${APKVER}-r1.apk`.

After installing a package, continue at [step 5](#5-choose-the-honk-core-build) for honk-core. Steps 1–4 below are the archive alternative.

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
VERSION=0.1.0-beta.18
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 3. Verify the download

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

You should see:

```text
doona-0.1.0-beta.18.tar.gz: OK
```

## 4. Install doona

With `ui: embedded`, the honk `debug.2026.10.8.native-api.1` assets for doona beta.18 (commit `6ad0ab89bfdf2a72d3e08b00714bb8434ffdc1df`) serve bundled doona 0.1.0-beta.18 without a separate UI package. You can also serve the beta.18 files installed here with `ui: /usr/share/doona`; see [Minimal configuration](minimal-configuration.md).

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
honk-core debug.2026.10.8.native-api.1
```

`HONK-SOURCE.txt` in the same release records the honk build and links both its source and the matching doona source.

<a name="install-geodata"></a>

## 8. Install geodata

Routing modes and rules using `geosite:` or `geoip:` need `geosite.dat` or `geoip.dat`, respectively. Create the directories and download both files before the first start:

```sh
mkdir -p /etc/honk/config.d /etc/honk/data
chmod 0700 /etc/honk /etc/honk/config.d /etc/honk/data
curl -fL --retry 3 -o /etc/honk/data/geosite.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat
curl -fL --retry 3 -o /etc/honk/data/geoip.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat
```

The OpenWrt configuration in [Minimal configuration](minimal-configuration.md) sets `data_dir` to `/etc/honk/data`, which survives reboot. Keep that setting: `/var` is in memory, so files in the default `/var/lib/honk` are lost at reboot.

After signing in, Settings → Geodata → Update now updates the files honk has loaded, writing replacements into `data_dir`. This option requires installed, loaded files; if either file is missing, download it with curl first, then [restart honk](service-management.md).

Alternatively, install `v2ray-geosite` and `v2ray-geoip` with `apk` or `opkg` and ensure `/usr/share/dae/geosite.dat` and `/usr/share/dae/geoip.dat` link to `../v2ray/geosite.dat` and `../v2ray/geoip.dat`. honk searches `/usr/share/dae`; it does not search `/usr/share/v2ray` directly.

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
