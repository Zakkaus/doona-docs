English / [简体中文](../zh-CN/install-gentoo.md) / [繁體中文](../zh-TW/install-gentoo.md)

# Install on Gentoo

Install doona with Portage from the repository's ebuild in a local ebuild repository, and honk-core from the same release. Then continue with [Minimal configuration](minimal-configuration.md).

> [!NOTE]
> These beta.16 commands need the matching assets on the [release page](https://github.com/Zakkaus/doona/releases). Check that the release is published before downloading.

## Before you start

- Linux 6.12 or later and the kernel options listed in [Requirements](requirements.md#requirements). Check the kernel with `uname -r`.
- A user account with sudo, or a root shell. Commands that need root have a sudo tab and a root tab; pick the one that matches your shell.
- `net-misc/curl` and `app-misc/ca-certificates`. honk uses the system CA certificates to verify HTTPS downloads.
- Access to github.com.
- Run every step in the same terminal: later steps use the `REPO`, `VERSION`, `PV`, `BASE` and `TARGET` variables that earlier steps set.

## 1. Create a local repository

Set `REPO` to the repository path. If you already have a local ebuild repository, set `REPO` to its path and skip the rest of this step.

```sh
REPO=/var/db/repos/local
```

Create the repository and register it with Portage:

```sh tab="sudo"
sudo mkdir -p "$REPO/metadata" "$REPO/profiles" /etc/portage/repos.conf
echo local | sudo tee "$REPO/profiles/repo_name"
printf 'masters = gentoo\nauto-sync = false\n' | sudo tee "$REPO/metadata/layout.conf"
printf '[local]\nlocation = %s\n' "$REPO" | sudo tee /etc/portage/repos.conf/local.conf
portageq get_repos /
```

```sh tab="root"
mkdir -p "$REPO/metadata" "$REPO/profiles" /etc/portage/repos.conf
echo local > "$REPO/profiles/repo_name"
printf 'masters = gentoo\nauto-sync = false\n' > "$REPO/metadata/layout.conf"
printf '[local]\nlocation = %s\n' "$REPO" > /etc/portage/repos.conf/local.conf
portageq get_repos /
```

The last command lists `local` next to `gentoo`.

## 2. Add the doona ebuild

Set the release version and its Gentoo form. The ebuild is fetched from the `v0.1.0-beta.16` tag commit, and its download URLs follow `PV`.

```sh tab="sudo"
VERSION=0.1.0-beta.16
PV=0.1.0_beta16
RAW=https://raw.githubusercontent.com/Zakkaus/doona/v${VERSION}/install/gentoo/net-proxy/doona
sudo mkdir -p "$REPO/net-proxy/doona"
cd "$REPO/net-proxy/doona"
sudo curl -fL -o "doona-$PV.ebuild" "$RAW/doona-$PV.ebuild" -O "$RAW/metadata.xml"
cd -
```

```sh tab="root"
VERSION=0.1.0-beta.16
PV=0.1.0_beta16
RAW=https://raw.githubusercontent.com/Zakkaus/doona/v${VERSION}/install/gentoo/net-proxy/doona
mkdir -p "$REPO/net-proxy/doona"
cd "$REPO/net-proxy/doona"
curl -fL -o "doona-$PV.ebuild" "$RAW/doona-$PV.ebuild" -O "$RAW/metadata.xml"
cd -
```

## 3. Download and verify the doona archives

The ebuild installs the release’s program archive and, with the default `fonts` USE flag, its font archive. Download both with `SHA256SUMS` and check them.

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/doona-fonts-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep -E " doona(-fonts)?-${VERSION}\.tar\.gz\$" SHA256SUMS | sha256sum -c -
```

You should see:

```text
doona-0.1.0-beta.16.tar.gz: OK
doona-fonts-0.1.0-beta.16.tar.gz: OK
```

## 4. Hand the archives to Portage

Copy the checked archives into the distfiles directory under the names the ebuild expects, then write the repository’s `Manifest` from them.

```sh tab="sudo"
DISTDIR=$(portageq distdir)
sudo cp "doona-${VERSION}.tar.gz" "$DISTDIR/doona-$PV.tar.gz"
sudo cp "doona-fonts-${VERSION}.tar.gz" "$DISTDIR/doona-$PV-fonts.tar.gz"
sudo ebuild "$REPO/net-proxy/doona/doona-$PV.ebuild" manifest
```

```sh tab="root"
DISTDIR=$(portageq distdir)
cp "doona-${VERSION}.tar.gz" "$DISTDIR/doona-$PV.tar.gz"
cp "doona-fonts-${VERSION}.tar.gz" "$DISTDIR/doona-$PV-fonts.tar.gz"
ebuild "$REPO/net-proxy/doona/doona-$PV.ebuild" manifest
```

The last command prints `>>> Creating Manifest for` and the package directory, `/var/db/repos/local/net-proxy/doona` by default.

## 5. Install doona

With `ui: embedded`, honk serves its built-in doona, currently beta.14, and needs no separate package. Set `ui: /usr/share/doona` to serve the beta.16 package installed here; see [Minimal configuration](minimal-configuration.md).

The ebuild is keyworded testing (`~amd64`, `~arm64` and others), so accept it for this package first. Replace `~amd64` with your architecture’s keyword.

```sh tab="sudo"
sudo mkdir -p /etc/portage/package.accept_keywords
echo 'net-proxy/doona ~amd64' | sudo tee /etc/portage/package.accept_keywords/doona
sudo emerge --ask net-proxy/doona
ls -l /usr/share/doona/index.html
```

```sh tab="root"
mkdir -p /etc/portage/package.accept_keywords
echo 'net-proxy/doona ~amd64' > /etc/portage/package.accept_keywords/doona
emerge --ask net-proxy/doona
ls -l /usr/share/doona/index.html
```

Portage ends with `Point the engine's ui setting at /usr/share/doona, or serve that directory with any web server.`, and `ls` prints a line ending in `/usr/share/doona/index.html`. The package holds doona’s web files and documentation; it installs no service. Set `USE=-fonts` for `net-proxy/doona` to leave out the Noto Sans TC and SC fonts.

## 6. Choose the honk-core build

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
| `musl`           | Unsure, or the system uses musl. Statically linked, so the system’s glibc version does not matter.                                          |
| `gnu`            | The system has glibc 2.39 or later. |
| `-stock` suffix  | Uses the system allocator instead of mimalloc.                                                                    |

For example, `x86_64-unknown-linux-musl`, `aarch64-unknown-linux-gnu` or `x86_64-unknown-linux-musl-stock`.

## 7. Download and verify honk-core

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

## 8. Install honk-core

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

Next: [Minimal configuration](minimal-configuration.md). The service steps cover systemd and OpenWrt’s procd only; doona and honk ship no OpenRC script. With OpenRC, [Service management](service-management.md) gives the foreground command that runs honk for the first sign-in.

## If it doesn’t work

| You see                                                           | Cause and fix                                                                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `curl: (22) The requested URL returned error: 404`                | The version or file name is wrong. Check `VERSION` and `PV` against the [releases](https://github.com/Zakkaus/doona/releases). |
| `sha256sum: 'standard input': no properly formatted checksum lines found` | `grep` found no line for that file: `VERSION` or `TARGET` was not set in this terminal, or it has a typo. |
| `FAILED` and `WARNING: 1 computed checksum did NOT match`         | The download is damaged or incomplete. Delete the file and download it again.                              |
| `emerge` finds no `net-proxy/doona`                               | `portageq get_repos /` does not list `local`: check the three files from step 1.                           |
| `emerge` reports the package as masked by the `~amd64` keyword    | The keyword in `/etc/portage/package.accept_keywords/doona` does not match your architecture.              |
| `version 'GLIBC_2.38' not found`                                  | The `gnu` build needs a newer glibc. Use the `musl` build.                                                 |

For problems after installation, see [Troubleshooting](troubleshooting.md#troubleshooting).
