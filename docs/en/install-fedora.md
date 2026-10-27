[繁體中文](../zh-TW/install-fedora.md) / [简体中文](../zh-CN/install-fedora.md) / English

# Install on Fedora or RHEL

Install the standard edition of doona v0.1.0-rc.2 with your system package manager. For doona lite, use the [archive instructions](install-manual.md).

Use a terminal on the gateway and a new download directory. Run the steps in the same shell; in a root shell, omit `sudo`. Check the [honk prerequisites](install.md#install) before installing the backend.

## 1. Prepare the download tools

```sh tab="sudo"
sudo dnf install curl ca-certificates
```

```sh tab="root"
dnf install curl ca-certificates
```

## 2. Download and verify the package

Download from the [v0.1.0-rc.2 release](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-rc.2):

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v0.1.0-rc.2
FILE=doona-0.1.0-rc.2-1.noarch.rpm
curl -fL -O "$BASE/$FILE" -O "$BASE/SHA256SUMS"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c -
```

Continue only when every selected file reports `OK`. If verification fails or finds no checksum line, check the filenames and download again before installing.

For download or binary errors, see [Installation errors](install.md#installation-errors).

The release RPM is unsigned. Complete the SHA-256 verification above before installation; checksum verification is separate from RPM signature verification.

## 3. Install the web files

```sh
sudo dnf install "./$FILE"
ls -l /usr/share/doona/index.html
```

The last command must list `/usr/share/doona/index.html`. Use `/usr/share/doona` as the UI directory when following [Minimal configuration](minimal-configuration.md); the [`ui` setting](configuration.md#config) selects it.

### Optional packages

See [optional assets](install.md#doona) to decide whether you need fonts or precompressed files. To install one, use its filename from the table as `FILE` in the commands below. The example selects fonts.

| Asset | Filename |
| --- | --- |
| Fonts | `doona-fonts-0.1.0-rc.2-1.noarch.rpm` |
| Precompressed files | `doona-precompressed-0.1.0-rc.2-1.noarch.rpm` |

```sh
FILE=doona-fonts-0.1.0-rc.2-1.noarch.rpm
curl -fL -O "$BASE/$FILE"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c - &&
  sudo dnf install "./$FILE"
```

## 4. Install the backend

Install the backend using [Install honk](install.md#install), then return here. If a compatible honk is already installed, keep it.

Continue with [Quick start](quick-start.md) to configure honk and sign in.
