[繁體中文](../zh-TW/install-debian.md) / [简体中文](../zh-CN/install-debian.md) / English

# Install on Debian or Ubuntu

Install the standard edition of doona v0.1.0-rc.3 with your system package manager. For doona lite, use the [archive instructions](install-manual.md).

Use a terminal on the gateway and a new download directory. Run the steps in the same shell; in a root shell, omit `sudo`. Check the [honk prerequisites](install.md#install) before installing the backend.

## 1. Prepare the download tools

```sh tab="sudo"
sudo apt update
sudo apt install curl ca-certificates
```

```sh tab="root"
apt update
apt install curl ca-certificates
```

## 2. Download and verify the package

Download from the [v0.1.0-rc.3 release](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-rc.3):

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v0.1.0-rc.3
FILE=doona-web_0.1.0-rc.3-1_all.deb
curl -fL -O "$BASE/$FILE" -O "$BASE/SHA256SUMS"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c -
```

Continue only when every selected file reports `OK`. If verification fails or finds no checksum line, check the filenames and download again before installing.

For download or binary errors, see [Installation errors](install.md#installation-errors).

## 3. Install the web files

```sh
sudo apt install "./$FILE"
ls -l /usr/share/doona-web/index.html
```

The last command must list `index.html`. Use that directory in the [separate UI configuration](install.md).

Use the Debian package `doona-web`. Do not substitute `apt install doona`: that name belongs to a different package in Debian and Ubuntu.

### Recover a UI replaced by Debian’s doona package

If `apt upgrade` replaced an older `doona` web package with the unrelated network fuzzer and the UI disappeared:

1. Install the verified `doona-web` package using the steps above, and `doona-web-fonts` below if needed. These packages replace or conflict with the old web packages below version 1.0.
2. Change the existing [`ui` setting](configuration.md#config) to `/usr/share/doona-web`, then [restart honk](service-management.md) and reload the browser page.
3. If the unrelated `doona` remains installed, run `sudo apt remove doona`. This leaves `doona-web` installed.

### Optional packages

See [optional assets](install.md#doona) to choose fonts or precompressed files. Use the chosen filename from the table as `FILE` below. The example selects fonts.

| Asset | Filename |
| --- | --- |
| Fonts | `doona-web-fonts_0.1.0-rc.3-1_all.deb` |
| Precompressed files | `doona-web-precompressed_0.1.0-rc.3-1_all.deb` |

```sh
FILE=doona-web-fonts_0.1.0-rc.3-1_all.deb
curl -fL -O "$BASE/$FILE"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c - &&
  sudo apt install "./$FILE"
```

## 4. Install the backend

If you already have a compatible honk, keep it. Otherwise, follow [Install honk](install.md#install), then return here.

Apply the [separate UI configuration](install.md), [start honk](service-management.md), then follow [First sign-in](first-sign-in.md).
