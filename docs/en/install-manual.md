English / [简体中文](../zh-CN/install-manual.md) / [繁體中文](../zh-TW/install-manual.md)

# Install on other systems

Install doona and honk-core from release archives on an x86_64 or aarch64 Linux system that meets the kernel requirements below. Alpine can use the [signed apk packages](#install-alpine) instead. Then continue with [Minimal configuration](minimal-configuration.md).

> [!NOTE]
> These beta.16 commands need the matching assets on the [release page](https://github.com/Zakkaus/doona/releases). Check that the release is published before downloading.

## Before you start

- Linux 6.12 or later and the kernel options listed in [Requirements](requirements.md#requirements). Check the kernel with `uname -r`.
- A user account with sudo, or a root shell. Commands that need root have a sudo tab and a root tab; pick the one that matches your shell.
- curl, tar, gzip, `sha256sum` and CA certificates. honk uses the system CA certificates to verify HTTPS downloads. On Alpine, install them with `sudo apk add curl ca-certificates`, or with `apk add curl ca-certificates` in a root shell; other systems name the packages similarly.
- Access to github.com.
- Run every step in the same terminal: later steps use the `VERSION`, `BASE` and `TARGET` variables that earlier steps set.

<a name="install-alpine"></a>

## Install on Alpine

The Alpine `.apk` files are not interchangeable with OpenWrt's. In the current directory, download the Alpine packages, release key and checksums:

```sh
VERSION=0.1.0-beta.16
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}-r0.alpine.apk" \
  -O "$BASE/doona-precompressed-${VERSION}-r0.alpine.apk" \
  -O "$BASE/doona-alpine.rsa.pub" -O "$BASE/SHA256SUMS"
grep -E " (doona(-precompressed)?-${VERSION}-r0.alpine.apk|doona-alpine.rsa.pub)\$" SHA256SUMS | sha256sum -c -
```

Each release signs its packages with a new key. Keep the name `doona-alpine.rsa.pub` when installing it; a later release replaces it.

```sh tab="sudo"
sudo wget -O /etc/apk/keys/doona-alpine.rsa.pub "$BASE/doona-alpine.rsa.pub"
sudo apk add ./doona-${VERSION}-r0.alpine.apk ./doona-precompressed-${VERSION}-r0.alpine.apk
ls -l /usr/share/doona/index.html
```

```sh tab="root"
wget -O /etc/apk/keys/doona-alpine.rsa.pub "$BASE/doona-alpine.rsa.pub"
apk add ./doona-${VERSION}-r0.alpine.apk ./doona-precompressed-${VERSION}-r0.alpine.apk
ls -l /usr/share/doona/index.html
```

`ls` must list `/usr/share/doona/index.html`. The optional `doona-precompressed` package adds `.br` and `.gz` copies for servers that serve precompressed responses; omit its download and install argument if not needed. The optional fonts package is `doona-fonts-${VERSION}-r0.alpine.apk`.

Without the signing key, `apk add --allow-untrusted` can install the files directly. To install honk-core, continue at [step 4](#4-choose-the-honk-core-build) below and choose a musl build. The remaining numbered steps describe the archive route for other systems.

## 1. Download doona

Set the release version, then download the program archive and the checksum file into the current directory.

```sh
VERSION=0.1.0-beta.16
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
```

## 2. Verify the download

The command works with both GNU and BusyBox `sha256sum`.

```sh
grep " doona-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
```

You should see:

```text
doona-0.1.0-beta.16.tar.gz: OK
```

## 3. Install doona

With `ui: embedded`, honk serves its built-in doona, currently beta.14, and needs no separate package. Set `ui: /usr/share/doona` to serve the beta.16 files installed here; see [Minimal configuration](minimal-configuration.md).

Extract the archive into `/usr/share/doona`, the directory honk serves doona from.

```sh tab="sudo"
sudo mkdir -p /usr/share/doona
sudo tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

```sh tab="root"
mkdir -p /usr/share/doona
tar -xzf doona-${VERSION}.tar.gz -C /usr/share/doona
ls -l /usr/share/doona/index.html
```

`ls` prints a line ending in `/usr/share/doona/index.html`.

Optional: the font archive adds the Noto Sans TC and SC fonts for the Chinese interface.

```sh tab="sudo"
curl -fL -O "$BASE/doona-fonts-${VERSION}.tar.gz"
grep " doona-fonts-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
sudo tar -xzf doona-fonts-${VERSION}.tar.gz -C /usr/share/doona
```

```sh tab="root"
curl -fL -O "$BASE/doona-fonts-${VERSION}.tar.gz"
grep " doona-fonts-${VERSION}.tar.gz\$" SHA256SUMS | sha256sum -c -
tar -xzf doona-fonts-${VERSION}.tar.gz -C /usr/share/doona
```

The optional `doona-precompressed-${VERSION}.tar.gz` archive adds `.br` and `.gz` copies beside the web files so a server can send precompressed responses. Download and verify it from the same release, then extract it into `/usr/share/doona`, as with the fonts archive.

## 4. Choose the honk-core build

```sh
uname -m
```

The release carries eight honk-core archives, named `honk-core-debug-<target>.tar.gz`. Build the target from the machine type and the C library:

| `uname -m` prints | Target starts with            |
| ----------------- | ----------------------------- |
| `x86_64`          | `x86_64-unknown-linux-`       |
| `aarch64`         | `aarch64-unknown-linux-`      |

| Target ends with | Choose it when                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `musl`           | Unsure, or the system uses musl, as Alpine does. Statically linked, so the system’s glibc version does not matter.                          |
| `gnu`            | The system has glibc 2.39 or later. |
| `-stock` suffix  | Uses the system allocator instead of mimalloc.                                                                    |

For example, `x86_64-unknown-linux-musl`, `aarch64-unknown-linux-gnu` or `x86_64-unknown-linux-musl-stock`.

## 5. Download and verify honk-core

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

## 6. Install honk-core

The archive holds one directory with the `honk-core` binary. Install it as `/usr/local/bin/honk-core`, the path the service in [Service management](service-management.md) starts.

```sh tab="sudo"
tar -xzf honk-core-debug-$TARGET.tar.gz
sudo install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
/usr/local/bin/honk-core --version
```

```sh tab="root"
tar -xzf honk-core-debug-$TARGET.tar.gz
install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
/usr/local/bin/honk-core --version
```

The last command prints the honk build, for example:

```text
honk-core debug.2026.10.6.native-api.1
```

`HONK-SOURCE.txt` in the same release names the build it carries.

Before starting honk, follow [Directories and geodata](install.md#directories-and-geodata) to install `geosite.dat` and `geoip.dat`.

Next: [Minimal configuration](minimal-configuration.md). The service steps cover systemd and OpenWrt’s procd only; doona and honk ship no OpenRC script. With OpenRC, as on Alpine, [Service management](service-management.md) gives the foreground command that runs honk for the first sign-in.

## If it doesn’t work

| You see                                                           | Cause and fix                                                                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                | The version or file name is wrong. Check `VERSION` against the [releases](https://github.com/Zakkaus/doona/releases). |
| `no properly formatted checksum lines found` (GNU) or `no checksum lines found` (BusyBox) | `grep` found no line for that file: `VERSION` or `TARGET` was not set in this terminal, or it has a typo. |
| `FAILED` and a `WARNING` that the checksum did not match          | The download is damaged or incomplete. Delete the file and download it again.                              |
| `sha256sum: unrecognized option: ignore-missing`                  | BusyBox has no `--ignore-missing`. Use the `grep` form from step 2.                                              |
| `version 'GLIBC_2.38' not found`                                  | The `gnu` build needs a newer glibc. Use the `musl` build.                                                 |

For problems after installation, see [Troubleshooting](troubleshooting.md#troubleshooting).
