# Install on Arch Linux

Install the standard edition of doona v0.1.0-rc.4 with your system package manager. For doona lite, use the [archive instructions](https://doona.daeuniverse.org/en/install-manual.md).

Use a terminal on the gateway and a new download directory. Run the steps in the same shell; in a root shell, omit `sudo`. Check the [honk prerequisites](https://doona.daeuniverse.org/en/install.md#install) before installing the backend.

## 1. Prepare the download tools

```sh tab="sudo"
sudo pacman -Syu --needed curl ca-certificates
```

```sh tab="root"
pacman -Syu --needed curl ca-certificates
```

## 2. Download and verify the package

Download from the [v0.1.0-rc.4 release](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-rc.4):

```sh
BASE=https://github.com/Zakkaus/doona/releases/download/v0.1.0-rc.4
FILE=doona-0.1.0rc4-1-any.pkg.tar.zst
curl -fL -O "$BASE/$FILE" -O "$BASE/SHA256SUMS"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c -
```

Continue only when every selected file reports `OK`. If verification fails or finds no checksum line, check the filenames and download again before installing.

For download or binary errors, see [Installation errors](https://doona.daeuniverse.org/en/install.md#installation-errors).

## 3. Install the web files

```sh
sudo pacman -U "./$FILE"
ls -l /usr/share/doona/index.html
```

The last command must list `index.html`. Use that directory in the [separate UI configuration](https://doona.daeuniverse.org/en/install.md).

### Optional packages

See [optional assets](https://doona.daeuniverse.org/en/install.md#doona) to choose fonts or precompressed files. Use the chosen filename from the table as `FILE` below. The example selects fonts.

| Asset | Filename |
| --- | --- |
| Fonts | `doona-fonts-0.1.0rc4-1-any.pkg.tar.zst` |
| Precompressed files | `doona-precompressed-0.1.0rc4-1-any.pkg.tar.zst` |

```sh
FILE=doona-fonts-0.1.0rc4-1-any.pkg.tar.zst
curl -fL -O "$BASE/$FILE"
awk -v file="$FILE" '$2 == file' SHA256SUMS | sha256sum -c - &&
  sudo pacman -U "./$FILE"
```

## 4. Install the backend

If you already have a compatible honk, keep it. Otherwise, follow [Install honk](https://doona.daeuniverse.org/en/install.md#install), then return here.

Apply the [separate UI configuration](https://doona.daeuniverse.org/en/install.md), [start honk](https://doona.daeuniverse.org/en/service-management.md), then follow [First sign-in](https://doona.daeuniverse.org/en/first-sign-in.md).
