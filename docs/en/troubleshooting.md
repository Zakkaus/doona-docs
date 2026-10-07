English / [简体中文](../zh-CN/troubleshooting.md) / [繁體中文](../zh-TW/troubleshooting.md)

<a name="troubleshooting"></a>

# Troubleshooting

<a name="unknown-setting"></a>

## native_api settings outside native_api { }

honk refuses the configuration because a `native_api` field sits directly under `experimental`. The `fatal error, shutting down:` line names the setting and the message, such as `experimental.ui: native API setting belongs inside native_api { }`. `enabled` and `secret` also belong to other blocks, so for them honk reports only `unknown experimental setting`. Move the field into `native_api { }`.

> [!NOTE]
> On Debian and Ubuntu, the `doona-web` package installs to `/usr/share/doona-web`. Use `ui: '/usr/share/doona-web'` in the example below.

```dae
# Wrong: "native API setting belongs inside native_api { }"
experimental {
    ui: '/usr/share/doona'
}

# Wrong: "unknown experimental setting"
experimental {
    enabled: true
}

# Right
experimental {
    native_api {
        enabled: true
        password_auth: true
        ui: '/usr/share/doona'
    }
}
```

A build of daeuniverse/honk `main` has no native API and rejects every `native_api` setting with `unknown experimental setting`. A build from Glassyiris/honk `feat/native-api` without the `native-api` feature stops startup with `native-api feature is required` when `native_api` is enabled. Check `honk-core --version` and install the build attached to the doona release; see [honk version](requirements.md#honk-version).

## honk refuses the native_api block

- “configuration administration requires a bearer secret or password login”: `config_write: true` needs `password_auth: true` or `secret`.
- “password login requires an empty secret; a configured secret selects token mode”: remove one of the two.
- “password login cannot be combined with anonymous loopback”: remove `allow_anonymous_loopback`.
- “native API requires a secret, password login, or explicitly anonymous loopback”: `enabled: true` needs `secret`, `password_auth: true`, or `allow_anonymous_loopback: true` with a loopback `listen`.

`allow_anonymous_loopback: true` with a loopback `listen` admits read requests without a token. Configuration writes and protected settings changes still require credentials. Use it for local development only.

<a name="offline-dependency"></a>

## Apply fails: a file the configuration needs was not found

honk checks the local files a configuration depends on before writing it, and refuses the write when one is missing or unreadable. doona shows the explanation below; the API reports one of the codes in the table, with the message `required offline configuration dependency is unavailable` for a missing file. The error does not name the file. Most often it is geodata.

1. For a routing mode or a rule using `geosite:` or `geoip:`, install `geosite.dat` and `geoip.dat` as in [Directories and geodata](install.md#directories-and-geodata). On OpenWrt, use `/etc/honk/data` as in [Install geodata](install-openwrt.md#install-geodata), not the volatile `/var/lib/honk`. Then apply again; if the error remains, restart honk. Settings → Geodata → Update now updates loaded files; it cannot install missing ones.
2. For subscription or node errors, restore missing local files or refresh invalid cached subscription content. Check the node’s `ech_config_path` file; for `dns` errors, check hosts files. Put new dependency files inside the configuration directory or `data_dir`, with read access for the user running honk.

| Code | Meaning | Fix |
| --- | --- | --- |
| `missing-offline-dependency` | A required local dependency is missing. | Install the geodata or restore the referenced file. |
| `offline-dependency-denied` | The file is outside allowed paths or read permission is denied. | Use an allowed path and let the user running honk read the file. |
| `invalid-offline-dependency` | The dependency content is malformed. | Replace it with a valid file or refresh the affected subscription. |
| `unreadable-offline-dependency` | Another I/O error prevents reading the dependency. | Check the file, storage and system log, then retry. |

<a name="state-db"></a>

## State database problems

With `password_auth: true`, as in the example configuration, a database that cannot be opened stops honk at startup, and the log shows `state database:` with the reason. In token mode honk logs a warning and runs without it. Geodata files remain in Settings, but source and schedule controls disappear. Manual updates require a configured URL for every loaded asset. Find the cause in the log:

```sh
sudo journalctl -u honk-core | grep -i 'state database'
sudo ls -la /var/lib/honk/state/
```

The log also keeps messages from earlier starts; read the lines from the latest start.

```text
state database is unavailable
state database path is unsafe
state database is locked by `honk-core admin reset`
state database is corrupt
```

1. unavailable: honk creates `data_dir` when it is missing, and `state/` inside it. The user honk runs as, root with the [systemd unit](service-management.md), must be able to create `data_dir` in its parent directory and write to it.
2. unsafe: `state/` and `honk.db` must belong to that user and grant no group or other permissions. `honk.db` must be a regular file, not a symbolic link or a file replaced while honk opened it.
3. locked: wait for `honk-core admin reset` to finish.
4. corrupt: with `password_auth: true` honk stops. In token mode honk moves the file to `honk.db.corrupt` and starts a new one; if an older `.corrupt` file is already there, honk keeps both and runs without the database until that file is removed.
5. Restart honk after the fix.

“another honk-core has the state database open” and “state database has a foreign application id or a newer schema” always stop startup: stop the other instance, or run the honk build that wrote the database.

<a name="geodata-sources"></a>

## Geodata sources cannot be edited, or auto-update never runs

honk is running without its state database, which keeps the sources and the update schedule. The Datapath card on System status warns that the state database is unavailable, even when the datapath itself cannot be read. The `degradations` list on `/api/v1/runtime` shows it too; `<listen>` is the `listen` address and `<token>` the `secret`:

```sh
curl -s -H 'Authorization: Bearer <token>' http://<listen>/api/v1/runtime
```

An entry with `persistence_unavailable` confirms it, and its `reason` names the cause; see [State database problems](#state-db). Until it is fixed, manual updates use the configuration's `assets.geodata.geosite` and `assets.geodata.geoip` URLs. The `native_api` download URL fields are legacy aliases.

<a name="state-unsafe"></a>

## persistence_unavailable with reason unsafe

honk refuses `state/` in the data directory or `honk.db` in it. Both must belong to the user honk runs as, grant no group or other permissions, and not be symbolic links. With the default file store used in this guide, `global.data_dir` sets the directory, `/var/lib/honk` by default; `--data-dir` does not override it. Pass that same directory to `--data-dir` when running `admin reset`.

```sh
ls -ld /var/lib/honk/state /var/lib/honk/state/honk.db
chmod 700 /var/lib/honk/state
chmod 600 /var/lib/honk/state/honk.db
```

Change only these two, not recursively; `/etc/honk` and `config.d/` are not involved. If `ls` shows another owner, `chown` both to the user honk runs as. Then restart honk.

On OpenWrt `/var` is in memory, so the default `/var/lib/honk` loses the database at every reboot. Keep the data in `/etc/honk/data`, as in [Minimal configuration](minimal-configuration.md).

<a name="geodata-update"></a>

## Geodata update fails with checksum_unavailable

The file downloaded, but `<url>.sha256sum` could not be fetched. A 404 is not a failure: honk keeps the file unverified. File downloads time out after 30 seconds without progress or 10 minutes in all; the checksum request has its own 10-second deadline. HTTP 403 or 429 or a failed route also stops the checksum request. Use another mirror, or turn off Verify checksum only for a trusted mirror whose checksum URL is known to fail.

| Stage                  | Meaning                                                                 | What to try                                                        |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `checksum_mismatch`    | The file does not match its `.sha256sum`.                               | Try another mirror; turn verification off only if a trusted mirror's checksum file is known to be wrong. |
| `download_timeout`     | A file download made no progress for 30 seconds or took over 10 minutes. | Use a faster route or a closer mirror. |
| `http_status_rejected` | The server answered with a status other than 200 or 404, redirects included. | Use the final URL; after 403 or 429, wait and try again.      |
| `http_not_found`       | The file URL returned 404.                                              | Check the URL.                                                     |
| `connection_failed`    | honk could not connect to the server or the node.                      | Check the node, or `bootstrap_resolver` for a direct download.     |
| `tls_failed`           | The TLS handshake or certificate check failed.                          | Check the gateway's clock and the URL's host name.                 |
| `group_unavailable`    | The group the download is routed through has no usable node.            | Check the group on the Policies page.                              |
| `route_blocked`        | The routing rules send the download host to `block`.                    | Change the rule that matches the host.                             |
| `asset_too_large`      | The file exceeds honk's size limit.                                     | Check that the URL points at a geodata file.                       |
| `invalid_source`       | The URL is not a valid HTTP or HTTPS URL.                               | Correct the URL.                                                   |

## Pinning a map fails with Invalid argument

`/sys/fs/bpf` is not bpffs. Mount it as shown in [Requirements](requirements.md#requirements).

## Kernel too old

honk rejects kernels older than 6.12 before attaching. When the verifier rejects compiled routing, use Linux 6.12 or later with BPF and BTF, and keep the full verifier log for a report.

## OpenWrt firewall stop removes honk’s nft table

`service firewall stop` deletes honk’s nft table, which turns off NFQUEUE staging. After starting the firewall again, restart honk with `/etc/init.d/honk-core restart`. `fw4 reload` and `service firewall restart` leave the table intact.

<a name="no-native-api"></a>

## No native API, or 404 on /api or /ui/

Find the latest `honk-core <version> starting` line in the current boot’s `journalctl -u honk-core -b` log, then compare it with [honk version](requirements.md#honk-version).

- The connection to the `listen` address fails: honk is not running, `enabled` is not `true`, or `listen` names another address. With `enabled: false` the listener does not start.
- `/api` returns 404: the server at that address has no native API, such as a honk build from daeuniverse/honk `main`. doona’s sign-in page then says “This honk build has no native API”. Install the build attached to the doona release.
- `/ui/` alone returns 404: the native API runs, but `ui` is empty.
- honk stops at startup with “failed to inspect native UI directory”, “failed to inspect native UI index.html” or “native UI index.html must be a regular file”: extract doona into the `ui` directory, as in [Install doona and start](install.md#doona).

<a name="sign-in"></a>

## Sign-in and cross-origin failures

- First-time setup works only from the gateway or a private-network client.
- A network or CORS failure in Settings: honk is not reachable at the `listen` address, or doona runs on an origin missing from `allow_origins` and `allowed_hosts`.
- For a hostname such as `openwrt.lan`, configure both `allowed_hosts` for the host and port and `allow_origins` for the browser origin, then restart honk. See [hostname and origin access](install.md#other-origin) for the syntax and 403 checks.
- A forgotten password: stop honk, run `sudo /usr/local/bin/honk-core admin reset` (without `sudo` in a root shell; on OpenWrt, `/usr/bin/honk-core --data-dir /etc/honk/data admin reset`), and start honk to set up again.
- An HTTPS page cannot reach an HTTP API; see [doona on another origin](install.md#other-origin).

<a name="read-only"></a>

## Read-only sources

doona marks a source read-only when any of these holds:

- `config_write` is not `true`.
- Neither `password_auth: true` nor `secret` is set.
- The file contains a `secret` inside `native_api` or `clash_api`, or text equal to a listener secret of 8 or more bytes.
- honk is still loading its sources or its write coordinator is not running.
- Only with `--store db`, which this guide does not use: an activated revision could not be recorded, which blocks writes.

Move every secret into `config.d/api.dae`, and restart honk after changing `native_api`.

## A configuration write was refused

When honk reports a known `details.reason`, doona shows the reason in the interface language. For an unknown or missing reason, a configuration write refusal keeps honk’s original message.

| Reason | Action |
| --- | --- |
| `writes_disabled` | Enable `config_write` and set an API secret or `password_auth: true`, then restart honk and sign in again. |
| `configuration_unavailable` | Check honk’s configuration and service status, then retry. |
| `listener_secret_source` | The file declares a listener secret, or the write would add one. Edit it on disk. |
| `listener_secret_in_content` | The content or source path contains an API secret value. Use a random secret absent from other content and paths, restart honk and sign in again. |
| `listener_settings_changed` | Keep `experimental.native_api`, `clash_api.secret` and `global.data_dir` unchanged in UI writes. Edit these on disk and restart honk. |
| `credential_sources_changed` | The sources declaring API secrets changed. Reload honk, then retry. |
| `import_entry_changed` | The import entry differs from the active database entry. Start honk with `-c` pointing to the active entry, then retry the import. |
| `unsafe_path` | Use a regular file inside an allowed configuration directory, then retry. |

Copy error in a failure notice copies that request's error details. Settings -> About -> Copy recent errors copies up to 20 recent errors kept in memory, with secrets and request bodies omitted. Reloading clears the history.

If a write or accepted operation has an unknown result, do not assume it failed or repeat it blindly. Check the reloaded configuration. For an accepted import or revision restore, reopen Backups and revisions and use Refresh to query the original operation. A restart-required diagnostic means nothing was written; edit the listed settings on disk and [restart honk](service-management.md).

## Startup messages are missing from Logs and Events

Log recording in Settings defaults to On log demand. With the pinned honk build, recording starts when a client attaches and can continue for a 60-second grace period; earlier startup messages are not recorded retroactively. Read the system log instead:

```sh
logread -e honk                  # OpenWrt
journalctl -u honk-core -b       # systemd
```

## Connections or Rules stay empty

With Flow recording set to On flow demand, honk records flows only when a client asks for them. doona requests flows while Connections, Rules or Routing log is open; recording continues for 60 seconds after the last demand. Check Flow recording in Settings: Always keeps recording on, Off stops it, and a recorder forbidden by the configuration cannot be enabled there.

## Connections page shows only LAN addresses, all direct

Check `lan_interface`: on OpenWrt, use `br-lan` to handle LAN devices’ traffic. On a side router, also check that clients use its LAN address as their gateway. See [Minimal configuration](minimal-configuration.md).

## doona shows the old version after an upgrade

The service worker serves the cached build until it updates. Reload the page once or twice, or close every doona tab and open it again.

With `ui: embedded`, the honk build fixes the interface version. The pinned build embeds beta.14; install standalone beta.17 files and point `ui` at their directory to use the newer interface.

## Sign-in over plain HTTP fails with crypto.randomUUID is not a function

doona before 0.1.0-beta.8 needs a secure context for this call, which plain HTTP on the LAN is not. Upgrade doona to 0.1.0-beta.8 or later.
