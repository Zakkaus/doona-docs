# Installation details

Install honk, write its configuration, then install doona and start honk. Check [Requirements](https://zakkaus.github.io/doona-docs/en/requirements.md#requirements) first. The other pages under Install walk through the same installation one system at a time, starting with [Debian or Ubuntu](https://zakkaus.github.io/doona-docs/en/install-debian.md).

> [!NOTE]
> These beta.13 commands require the assets to be published on the [release page](https://github.com/Zakkaus/doona/releases). They are not yet available; see [Native API status](https://zakkaus.github.io/doona-docs/en/index.md#native-api-status).

<a name="install"></a>

## Install honk

Each doona release attaches honk-core builds with the native API, built from Glassyiris/honk `feat/native-api` debug tags. `HONK-SOURCE.txt` names the honk commit they were built from. Download the archive for the gateway and `SHA256SUMS` from the same release. The native API exists only in builds from Glassyiris/honk `feat/native-api`, where the `native-api` feature must be enabled. Builds of daeuniverse/honk `main` have no native API; see [honk version](https://zakkaus.github.io/doona-docs/en/requirements.md#honk-version).

- [doona releases](https://github.com/Zakkaus/doona/releases) for honk-core downloads
- [honk quick start](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)

| Asset name part      | Use                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `x86_64`, `aarch64`  | The gateway's CPU, as `uname -m` prints it.                                                                |
| `unknown-linux-musl` | Static binary for gateways. Choose this one when unsure.                                                   |
| `unknown-linux-gnu`  | Linked against glibc, for ordinary distributions.                                                          |
| no suffix            | mimalloc, the default allocator.                                                                           |
| `-stock` suffix      | The system allocator instead of mimalloc.                                                                 |

For separate honk-core download, verification and installation commands, complete step 1, then follow steps 4–6 of [Install on other systems](https://zakkaus.github.io/doona-docs/en/install-manual.md).

```sh
VERSION=0.1.0-beta.13               # the doona release, without v
TARGET=x86_64-unknown-linux-musl   # or aarch64-unknown-linux-musl, -gnu, and a -stock suffix
BASE=https://github.com/Zakkaus/doona/releases/download/v$VERSION
curl -fL -O "$BASE/honk-core-debug-$TARGET.tar.gz" -O "$BASE/SHA256SUMS"
grep " honk-core-debug-$TARGET.tar.gz\$" SHA256SUMS | sha256sum -c -
tar -xzf honk-core-debug-$TARGET.tar.gz
sudo install -m 0755 honk-core-debug-$TARGET/honk-core /usr/local/bin/honk-core
honk-core --version   # prints the tag the build came from, such as debug.2026.10.3.native-api.2
```

To build honk yourself, check out the commit `HONK-SOURCE.txt` names and build it as honk’s quick start describes: the eBPF object first, then `cargo build --release -p honk-core --features ebpf,native-api`. `native-api` is opt-in; release builds include it; without `ebpf` honk has no datapath. The release also attaches that commit’s source archive, `honk-source-<commit>.tar.gz`.

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

Do not start the service yet. The example configuration serves doona from `/usr/share/doona`, and honk refuses to start until that directory holds `index.html`; [Install doona and start](https://zakkaus.github.io/doona-docs/en/install.md#doona) starts honk.

Do not add `NoNewPrivileges=yes`, capability bounding or a read-only `/proc/sys`: startup needs BPF, network administration, namespace, mount and sysctl privileges.

## Write the configuration

Write and install `/etc/honk/config.dae` and `/etc/honk/config.d/api.dae` as described in [Configuration](https://zakkaus.github.io/doona-docs/en/configuration.md#config), then continue below.

<a name="doona"></a>

## Install doona and start

With `ui: embedded`, honk serves the doona version built into its binary, not the files installed here. The pinned honk build embeds doona 0.1.0-beta.12. To serve beta.13, set `ui: /usr/share/doona` and install the release files below; see [Minimal configuration](https://zakkaus.github.io/doona-docs/en/minimal-configuration.md).

Download a doona release archive and `SHA256SUMS`, then extract the archive into `/usr/share/doona`, the directory `ui` names. The last command must list `index.html`; without it honk does not start.

- [doona releases](https://github.com/Zakkaus/doona/releases)

To download, verify and unpack the program and optional fonts step by step, follow steps 1–3 of [Install on other systems](https://zakkaus.github.io/doona-docs/en/install-manual.md).

```sh
VERSION=0.1.0-beta.13   # the doona release, without v
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

honk opens `<data_dir>/state/honk.db` by default: `global.store_subscribe` is on unless turned off, and `native_api` is enabled here. There is no switch to add. The database keeps the administrator account, the geodata sources and other state honk persists. honk creates `state/` and `honk.db` itself, and creates `/var/lib/honk` when it is missing. The user honk runs as, root here, must be able to create that directory in `/var/lib` and write to it.

With `password_auth: true`, as in this example, honk does not start when the database cannot be opened. In token mode, an unavailable, unsafe or administrator-reset-locked database allows startup with a warning and no persistence. A foreign database, a newer schema or a database already used by another honk process still prevents startup. See [State database problems](https://zakkaus.github.io/doona-docs/en/troubleshooting.md#state-db) for the log messages.

### First sign-in

1. Open `http://192.168.1.1:9527/ui/`, the `listen` address. doona finds the API on the same origin and saves it as a backend.
2. Password mode: the sign-in page shows Create the administrator. From the gateway or a device on the LAN, enter a username and password, confirm the password, then select Create and sign in. This creates the account and signs you in.
3. Token mode: enter the `secret` as the token, or open a pairing link. doona removes the token from the address bar after loading.

```text
http://192.168.1.1:9527/ui/#/settings?api=http://192.168.1.1:9527&token=…
```

To replace a forgotten administrator, stop honk and run `sudo /usr/local/bin/honk-core admin reset` (without `sudo` in a root shell; on OpenWrt, `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`); the next start opens setup again.

<a name="other-origin"></a>

### doona on another origin

When doona is served elsewhere, the browser sends cross-origin requests, and honk accepts only origins listed in `allow_origins` and hosts listed in `allowed_hosts`. In Settings, enter the server root, such as `http://192.168.1.1:9527`, without `/api/v1`. Test connection checks discovery before saving, and saving reloads the page.

A page loaded over HTTPS cannot call an API over plain HTTP; browsers block it as mixed content. Open doona from honk at `/ui/`, or put honk behind a TLS reverse proxy.

Any static server can serve the extracted files, at the web root or under a prefix such as `/ui/`. The pages use hash routes (`/ui/#/activity`), so no rewrite rules are needed.

A reverse proxy keeps doona and honk on one origin. Forward the exact `/api` discovery endpoint and the `/api/` subtree to honk's listener, and serve the files under `/ui/`. Preserve any configured proxy prefix for both API routes.

### Distribution packages

Each release attaches architecture-independent `deb`, `rpm`, `ipk` and Arch packages built by [nfpm](https://github.com/Zakkaus/doona/tree/main/install/nfpm) from the prebuilt program and font archives; `doona-fonts` is a separate optional package. The recipes in [install/](https://github.com/Zakkaus/doona/blob/main/install/README.md) for OpenWrt, Alpine, Gentoo and Nix are unpublished templates, currently versioned for beta.12. Adapt their versions and replace the marked hashes before packaging beta.13; [Install on Gentoo](https://zakkaus.github.io/doona-docs/en/install-gentoo.md) shows how to adapt the ebuild. The AUR `doona-bin` recipe lives in a separate repository. Use `make install DESTDIR=… PREFIX=/usr` and `make install-fonts` when packaging a local build.

On Debian and Ubuntu, the package is named `doona-web` and installs to `/usr/share/doona-web`; its optional font package is `doona-web-fonts`.

<a name="operation"></a>

## Everyday operation

<a name="reload-and-restart"></a>

### Reload and restart

```sh
sudo systemctl reload honk-core    # re-read the configuration
sudo systemctl restart honk-core   # needed for native_api, interfaces, data_dir
sudo journalctl -u honk-core -e    # look for applied or rejected
```

A reload re-reads the configuration and logs `applied` or `rejected`. honk rejects changes to restart-only settings and names the fields in the log. These include `native_api`, interfaces, TPROXY settings, `data_dir`, `log_level`, `log_file`, `check_interval`, `tcp_check_url`, `tcp_check_http_method`, `udp_check_dns`, `store_subscribe`, `nfqueue_enable`, `dns.bind`, Clash API settings, `auto_config_kernel_parameter`, `pprof_port`, `so_mark_from_dae` and `experimental.cache_file`. Switching `tls_implementation` into or out of `utls` also needs a restart.

Configuration applies reloadable edits automatically. If an edit requires a restart, the API refuses it before writing; doona lists the settings and the restart command. Edit those settings on the host, then restart honk.

### Update honk

Download the honk-core archive from a newer [doona release](https://github.com/Zakkaus/doona/releases), install it as in [Install honk](https://zakkaus.github.io/doona-docs/en/install.md#install), then run `sudo systemctl restart honk-core` and check `honk-core --version`. Compare the version with the one [honk version](https://zakkaus.github.io/doona-docs/en/requirements.md#honk-version) names.

### Update doona

Extract the new release into `/usr/share/doona` and reload the page in the browser. honk needs no restart.

### Update geodata

In Settings → Geodata, Update now downloads both files and activates changed content. Identical files are not rewritten; an entirely unchanged update succeeds without activation or reload. Automatic updates are on by default and check every 24 hours; the same card turns them off or changes Interval (hours). Reset to defaults asks for confirmation, then removes all geodata overrides and values taken from the configuration file, restoring the built-in sources and defaults. The installed geodata files are listed in this card.

### Where things live

| Path                          | Contents                                   |
| ----------------------------- | ------------------------------------------ |
| `/etc/honk/config.dae`        | Main configuration                         |
| `/etc/honk/config.d/api.dae`  | Native API block                           |
| `/var/lib/honk/`              | `data_dir`: geodata files and runtime data |
| `/var/lib/honk/state/honk.db` | State database                             |
| `/usr/share/doona/`           | doona files served at `/ui/`               |
| `journalctl -u honk-core`     | honk’s log                                 |
