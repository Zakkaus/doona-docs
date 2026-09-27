English · [简体中文](../zh-CN/install.md) · [繁體中文](../zh-TW/install.md)

# Installation details

Install honk, write its configuration, then install doona and start honk. Check [Requirements](requirements.md#requirements) first. The Getting started pages walk through the same installation one system at a time, starting with [Debian or Ubuntu](install-debian.md).

<a name="install"></a>

## Install honk

Each doona release attaches honk-core builds with the native API, and `HONK-SOURCE.txt` names the honk commit they were built from. Download the archive for the gateway and `SHA256SUMS` from the same release. Other honk builds lack the native API; see [honk version](requirements.md#honk-version). Releases up to v0.1.0-beta.7 carry no honk; take the same archive from the Glassyiris/honk `debug` release, which each new honk build replaces.

- [doona releases](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` release](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk quick start](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)

| Asset name part      | Use                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `x86_64`, `aarch64`  | The gateway's CPU, as `uname -m` prints it.                                                                |
| `unknown-linux-musl` | Static binary for gateways. Choose this one when unsure.                                                   |
| `unknown-linux-gnu`  | Linked against glibc, for ordinary distributions.                                                          |
| no suffix            | mimalloc, the default; faster for QUIC.                                                                    |
| `-stock` suffix      | The system allocator instead of mimalloc, for small devices where memory use matters more than throughput. |

```sh
VERSION=0.1.0-beta.8               # the doona release, without v
TARGET=x86_64-unknown-linux-musl   # or aarch64-unknown-linux-musl, -gnu, and a -stock suffix
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/honk-core-debug-$TARGET.tar.gz" -O "$BASE/SHA256SUMS"
grep " honk-core-debug-$TARGET.tar.gz\$" SHA256SUMS | sha256sum -c -
tar -xzf honk-core-debug-$TARGET.tar.gz
sudo install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
honk-core --version   # prints the tag the build came from, such as debug.2026.9.26.native-api.4
```

To build honk yourself, check out the commit `HONK-SOURCE.txt` names and build it as honk’s quick start describes: the eBPF object first, then `cargo build --release -p honk-core --features ebpf`. `native-api` is a default feature; without `ebpf` honk has no datapath. The release also attaches that commit’s source archive, `honk-source-<commit>.tar.gz`.

The binary embeds the eBPF object; no separate object file is needed.

### Directories and geodata

Create the configuration and data directories, then download the geosite and geoip files that the example rules use. honk finds them in `data_dir`; these are the files its geodata update downloads.

```sh
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
sudo curl -fL --retry 3 -o /var/lib/honk/geosite.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat
sudo curl -fL --retry 3 -o /var/lib/honk/geoip.dat \
  https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat
```

### systemd service

The release ships no unit. Create `/etc/systemd/system/honk-core.service`:

```ini
[Unit]
Description=honk transparent proxy engine
Wants=network-online.target
After=network-online.target

[Service]
Type=notify
User=root
WorkingDirectory=/var/lib/honk
ExecStart=/usr/local/bin/honk-core --config /etc/honk/config.dae --disable-timestamp
ExecReload=/usr/local/bin/honk-core reload
Restart=on-failure
RestartSec=2s
TimeoutStopSec=30s
LimitNOFILE=1048576
LimitMEMLOCK=infinity
UMask=0077

[Install]
WantedBy=multi-user.target
```

Do not start the service yet. The example configuration serves doona from `/usr/share/doona`, and honk refuses to start until that directory holds `index.html`; [Install doona and start](#doona) starts honk.

Do not add `NoNewPrivileges=yes`, capability bounding or a read-only `/proc/sys`: startup needs BPF, network administration, namespace, mount and sysctl privileges.

## Write the configuration

Write and install `/etc/honk/config.dae` and `/etc/honk/config.d/api.dae` as described in [Configuration](configuration.md#config), then continue below.

<a name="doona"></a>

## Install doona and start

Download a doona release archive and `SHA256SUMS`, then extract the archive into `/usr/share/doona`, the directory `ui` names. The last command must list `index.html`; without it honk does not start.

- [doona releases](https://github.com/Zakkaus/doona/releases)

```sh
VERSION=0.1.0-beta.8   # the doona release, without v
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/doona-${VERSION}.tar.gz" -O "$BASE/doona-fonts-${VERSION}.tar.gz" -O "$BASE/SHA256SUMS"
grep -E " doona(-fonts)?-${VERSION}\.tar\.gz\$" SHA256SUMS | sha256sum -c -
sudo mkdir -p /usr/share/doona
sudo tar -xzf "doona-${VERSION}.tar.gz" -C /usr/share/doona
# Optional Noto Sans TC and SC fonts:
if [ -f "doona-fonts-${VERSION}.tar.gz" ]; then
    sudo tar -xzf "doona-fonts-${VERSION}.tar.gz" -C /usr/share/doona
fi
ls -l /usr/share/doona/index.html
```

honk reads these files from disk on each request, so replacing them later needs no restart.

### Start honk

Enable and start the service, then read its log:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now honk-core
sudo systemctl status honk-core
sudo journalctl -u honk-core -e
```

honk is ready when the log shows `honk-core is running`.

### State database

honk opens `<data_dir>/state/honk.db` by default: `global.store_subscribe` is on unless turned off, and `native_api` is enabled here. There is no switch to add. The database keeps the administrator account, the geodata sources and other state honk persists. honk creates `state/` and `honk.db` itself; `/var/lib/honk` must exist and be writable by root.

With `password_auth: true`, as in this example, honk does not start when the database cannot be opened, so a running honk has it open. In token mode honk starts without it and logs a warning; a missing state database then means it failed to open. Either way, [State database problems](troubleshooting.md#state-db) explains the log messages.

### First sign-in

1. Open `http://192.168.1.1:9527/ui/`, the `listen` address. doona finds the API on the same origin and saves it as a backend.
2. Password mode: the sign-in page shows Create the administrator. Create the administrator from the gateway or a device on the LAN, then sign in.
3. Token mode: enter the `secret` as the token, or open a pairing link. doona removes the token from the address bar after loading.

```text
http://192.168.1.1:9527/ui/#/settings?api=http://192.168.1.1:9527&token=…
```

To replace a forgotten administrator, stop honk and run `sudo honk-core admin reset`; the next start opens setup again.

<a name="other-origin"></a>

### doona on another origin

When doona is served elsewhere, the browser sends cross-origin requests, and honk accepts only origins listed in `allow_origins` and hosts listed in `allowed_hosts`. In Settings, enter the server root, such as `http://192.168.1.1:9527`, without `/api/v1`. Test connection checks discovery before saving, and saving reloads the page.

A page loaded over HTTPS cannot call an API over plain HTTP; browsers block it as mixed content. Open doona from honk at `/ui/`, or put honk behind a TLS reverse proxy.

Any static server can serve the extracted files, at the web root or under a prefix such as `/ui/`. The pages use hash routes (`/ui/#/activity`), so no rewrite rules are needed.

A reverse proxy keeps doona and honk on one origin. Forward the exact `/api` discovery endpoint and the `/api/` subtree to honk's listener, and serve the files under `/ui/`. Preserve any configured proxy prefix for both API routes.

### Distribution packages

No distribution repository carries doona yet. Each release attaches architecture-independent `deb`, `rpm`, `ipk` and Arch packages built by [nfpm](../../install/nfpm) from the prebuilt program and font archives; `doona-fonts` is a separate optional package. The recipes in [install/](../../install/README.md) for OpenWrt, Alpine, Gentoo and Nix are unpublished templates that install the same archives. The AUR `doona-bin` recipe lives in a separate repository. Use `make install DESTDIR=… PREFIX=/usr` and `make install-fonts` when packaging a local build.

<a name="operation"></a>

## Everyday operation

### Reload and restart

```sh
sudo systemctl reload honk-core    # re-read the configuration
sudo systemctl restart honk-core   # needed for native_api, interfaces, data_dir
sudo journalctl -u honk-core -e    # look for applied or rejected
```

A reload re-reads the configuration and logs `applied` or `rejected`. Changes to `native_api`, interfaces, TPROXY settings, `data_dir`, `log_level`, health-check settings, the NFQUEUE switch, the DNS listener or the Clash API listener need a restart; a rejected reload names the fields in the log. doona’s Configuration page reloads by itself after saving.

### Update honk

Download the honk-core archive from a newer doona release, or a newer build from the honk `debug` release, install it as in [Install honk](#install), then run `sudo systemctl restart honk-core` and check `honk-core --version`. The `debug` tag moves with every build, so compare the version with the one [honk version](requirements.md#honk-version) names.

### Update doona

Extract the new release into `/usr/share/doona` and reload the page in the browser. honk needs no restart.

### Update geodata

Settings, Geodata, Update downloads both files and activates them. Automatic updates are on by default and check every 24 hours; the same card turns them off or changes the interval.

### Where things live

| Path                          | Contents                                   |
| ----------------------------- | ------------------------------------------ |
| `/etc/honk/config.dae`        | Main configuration                         |
| `/etc/honk/config.d/api.dae`  | Native API block                           |
| `/var/lib/honk/`              | `data_dir`: geodata files and runtime data |
| `/var/lib/honk/state/honk.db` | State database                             |
| `/usr/share/doona/`           | doona files served at `/ui/`               |
| `journalctl -u honk-core`     | honk’s log                                 |
