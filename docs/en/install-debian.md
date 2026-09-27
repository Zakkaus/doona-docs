English · [简体中文](../zh-CN/install-debian.md) · [繁體中文](../zh-TW/install-debian.md)

# Install on Debian or Ubuntu

This page installs doona from its `.deb` package and honk-core from the same doona release on Debian, Ubuntu and other APT-based systems. After the last step, continue with [Minimal configuration](minimal-configuration.md).

## Before you start

- Linux 6.12 or later and the kernel options listed in [Requirements](requirements.md#requirements). Check the kernel with `uname -r`.
- A user account with sudo, or a root shell. Commands that need root have a sudo tab and a root tab; pick the one that matches your shell.
- Access to github.com.
- Run every step in the same terminal: later steps use the `VERSION`, `BASE` and `TARGET` variables that earlier steps set.

## 1. Install curl and CA certificates

honk downloads subscriptions and geodata over HTTPS and stops at startup without CA certificates.

```sh tab="sudo"
sudo apt update
sudo apt install curl ca-certificates
```

```sh tab="root"
apt update
apt install curl ca-certificates
```

## 2. Download doona

Set the release version, then download the package and the checksum file into the current directory.

```sh
VERSION=0.1.0-beta.8
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona_${VERSION}-1_all.deb" -O "$BASE/SHA256SUMS"
```

## 3. Verify the download

```sh
grep " doona_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
```

You should see:

```text
doona_0.1.0-beta.8-1_all.deb: OK
```

## 4. Install doona

```sh tab="sudo"
sudo apt install ./doona_${VERSION}-1_all.deb
ls -l /usr/share/doona/index.html
```

```sh tab="root"
apt install ./doona_${VERSION}-1_all.deb
ls -l /usr/share/doona/index.html
```

`ls` prints a line ending in `/usr/share/doona/index.html`. The package holds only doona’s web files; it installs no service.

Optional: the `doona-fonts` package adds the Noto Sans TC and SC fonts for the Chinese interface.

```sh tab="sudo"
curl -fL -O "$BASE/doona-fonts_${VERSION}-1_all.deb"
grep " doona-fonts_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
sudo apt install ./doona-fonts_${VERSION}-1_all.deb
```

```sh tab="root"
curl -fL -O "$BASE/doona-fonts_${VERSION}-1_all.deb"
grep " doona-fonts_${VERSION}-1_all.deb\$" SHA256SUMS | sha256sum -c -
apt install ./doona-fonts_${VERSION}-1_all.deb
```

## 5. Choose the honk-core build

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
| `musl`           | Unsure. A static binary that runs on any Linux.                                                                    |
| `gnu`            | The system has glibc 2.39 or later, such as Debian 13 or Ubuntu 24.04. On Debian 12 it stops with `GLIBC_2.38' not found`. |
| `-stock` suffix  | Memory matters more than speed, as on a small device. Uses the system allocator instead of mimalloc.              |

For example, `x86_64-unknown-linux-musl`, `aarch64-unknown-linux-gnu` or `x86_64-unknown-linux-musl-stock`.

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
honk-core debug.2026.9.26.native-api.4
```

`HONK-SOURCE.txt` in the same release names the build it carries.

Next: [Minimal configuration](minimal-configuration.md).

## If it doesn’t work

| You see                                                           | Cause and fix                                                                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                | The version or file name is wrong. Check `VERSION` against the [releases](https://github.com/Zakkaus/doona/releases). |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` found no line for that file: `VERSION` or `TARGET` was not set in this terminal, or it has a typo. |
| `FAILED` and `WARNING: 1 computed checksum did NOT match`         | The download is damaged or incomplete. Delete the file and download it again.                              |
| `version 'GLIBC_2.38' not found`                                  | The `gnu` build needs a newer glibc. Use the `musl` build.                                                 |

For problems after installation, see [Troubleshooting](troubleshooting.md#troubleshooting).
