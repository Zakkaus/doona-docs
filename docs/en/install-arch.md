English / [简体中文](../zh-CN/install-arch.md) / [繁體中文](../zh-TW/install-arch.md)

# Install on Arch Linux

Install doona from its `.pkg.tar.zst` package and honk-core from the same release on Arch Linux or another pacman-based system. Then continue with [Minimal configuration](minimal-configuration.md).

> [!NOTE]
> Download the beta.18 assets from the [release page](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-beta.18).

## Before you start

- Linux 6.12 or later and the kernel options listed in [Requirements](requirements.md#requirements). Check the kernel with `uname -r`.
- A user account with sudo, or a root shell. Commands that need root have a sudo tab and a root tab; pick the one that matches your shell.
- Access to github.com.
- Run every step in the same terminal: later steps use the `VERSION`, `PKGVER`, `BASE` and `TARGET` variables that earlier steps set.

## 1. Install curl and CA certificates

honk uses the system CA certificates to verify HTTPS subscription and geodata downloads.

```sh tab="sudo"
sudo pacman -Syu --needed curl ca-certificates
```

```sh tab="root"
pacman -Syu --needed curl ca-certificates
```

## 2. Download doona

Set the release version, then download the package and the checksum file into the current directory. Arch package names write the prerelease without its `-` and `.`, so `PKGVER` holds that form.

```sh
VERSION=0.1.0-beta.18
PKGVER=0.1.0beta18
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${PKGVER}-1-any.pkg.tar.zst" -O "$BASE/SHA256SUMS"
```

## 3. Verify the download

```sh
grep " doona-${PKGVER}-1-any.pkg.tar.zst\$" SHA256SUMS | sha256sum -c -
```

You should see:

```text
doona-0.1.0beta18-1-any.pkg.tar.zst: OK
```

## 4. Install doona

With `ui: embedded`, the honk `debug.2026.10.8.native-api.1` assets for doona beta.18 (commit `6ad0ab89bfdf2a72d3e08b00714bb8434ffdc1df`) serve bundled doona 0.1.0-beta.18 without a separate UI package. You can also serve the beta.18 package installed here with `ui: /usr/share/doona`; see [Minimal configuration](minimal-configuration.md).

```sh tab="sudo"
sudo pacman -U ./doona-${PKGVER}-1-any.pkg.tar.zst
ls -l /usr/share/doona/index.html
```

```sh tab="root"
pacman -U ./doona-${PKGVER}-1-any.pkg.tar.zst
ls -l /usr/share/doona/index.html
```

`ls` prints a line ending in `/usr/share/doona/index.html`. The package holds doona’s web files and documentation; it installs no service.

The optional `doona-precompressed` package adds `.br` and `.gz` copies beside the web files so a server can send precompressed responses. Install the same version as `doona`; without it, the main package stays unchanged.

Optional: the `doona-fonts` package adds the Noto Sans TC and SC fonts for the Chinese interface.

```sh tab="sudo"
curl -fL -O "$BASE/doona-fonts-${PKGVER}-1-any.pkg.tar.zst"
grep " doona-fonts-${PKGVER}-1-any.pkg.tar.zst\$" SHA256SUMS | sha256sum -c -
sudo pacman -U ./doona-fonts-${PKGVER}-1-any.pkg.tar.zst
```

```sh tab="root"
curl -fL -O "$BASE/doona-fonts-${PKGVER}-1-any.pkg.tar.zst"
grep " doona-fonts-${PKGVER}-1-any.pkg.tar.zst\$" SHA256SUMS | sha256sum -c -
pacman -U ./doona-fonts-${PKGVER}-1-any.pkg.tar.zst
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
| `musl`           | Unsure. Statically linked, so the system’s glibc version does not matter.                                                                    |
| `gnu`            | The system has glibc 2.39 or later. |
| `-stock` suffix  | Uses the system allocator instead of mimalloc.                                                                    |

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
honk-core debug.2026.10.8.native-api.1
```

`HONK-SOURCE.txt` in the same release records the honk build and links both its source and the matching doona source.

Before starting honk, follow [Directories and geodata](install.md#directories-and-geodata) to install `geosite.dat` and `geoip.dat`.

Next: [Minimal configuration](minimal-configuration.md).

## If it doesn’t work

| You see                                                           | Cause and fix                                                                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                | The version or file name is wrong. Check `VERSION` against the [releases](https://github.com/Zakkaus/doona/releases). |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` found no line for that file: `VERSION`, `PKGVER` or `TARGET` was not set in this terminal, or it has a typo. |
| `FAILED` and `WARNING: 1 computed checksum did NOT match`         | The download is damaged or incomplete. Delete the file and download it again.                              |
| `version 'GLIBC_2.38' not found`                                  | The `gnu` build needs a newer glibc. Use the `musl` build.                                                 |

For problems after installation, see [Troubleshooting](troubleshooting.md#troubleshooting).
