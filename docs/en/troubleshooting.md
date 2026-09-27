English · [简体中文](../zh-CN/troubleshooting.md) · [繁體中文](../zh-TW/troubleshooting.md)

<a name="troubleshooting"></a>

# Troubleshooting

<a name="unknown-setting"></a>

## native_api settings outside native_api { }

honk refuses the configuration because a `native_api` field sits directly under `experimental`. The `fatal error, shutting down:` line names the setting and the message, such as `experimental.ui: native API setting belongs inside native_api { }`. `enabled` and `secret` also belong to other blocks, so for them honk reports only `unknown experimental setting`. Move the field into `native_api { }`.

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

A build from main has no native API and rejects the `native_api { }` block itself with `unknown experimental setting`. Check `honk-core --version` and install the `debug` build; see [honk version](requirements.md#honk-version).

## honk refuses the native_api block

- “configuration administration requires a bearer secret or password login”: `config_write: true` needs `password_auth: true` or `secret`.
- “password login requires an empty secret; a configured secret selects token mode”: remove one of the two.
- “password login cannot be combined with anonymous loopback”: remove `allow_anonymous_loopback`.
- “native API requires a secret, password login, or explicitly anonymous loopback”: `enabled: true` needs `password_auth: true` or `secret`.

<a name="state-db"></a>

## State database problems

With `password_auth: true`, as in the example configuration, a database that cannot be opened stops honk at startup, and the log shows `state database:` with the reason. In token mode honk logs a warning and runs without it: the geodata sources card disappears, and Update remains only when both download URLs are set. Find the cause in the log:

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

1. unavailable: honk creates `data_dir` when it is missing, and `state/` inside it. The user honk runs as, root with the [systemd unit](install.md#install), must be able to create `data_dir` in its parent directory and write to it.
2. unsafe: `state/` and `honk.db` must belong to that user and grant no group or other permissions. `honk.db` must be a regular file, not a symbolic link or a file replaced while honk opened it.
3. locked: wait for `honk-core admin reset` to finish.
4. corrupt: with `password_auth: true` honk stops. In token mode honk moves the file to `honk.db.corrupt` and starts a new one; if an older `.corrupt` file is already there, honk keeps both and runs without the database until that file is removed.
5. Restart honk after the fix.

“another honk-core has the state database open” and “state database has a foreign application id or a newer schema” always stop startup: stop the other instance, or run the honk build that wrote the database.

## Pinning a map fails with Invalid argument

`/sys/fs/bpf` is not bpffs. Mount it as shown in [Requirements](requirements.md#requirements).

## Kernel too old

honk rejects kernels older than 6.12 before attaching. When the verifier rejects compiled routing, use Linux 6.12 or later with BPF and BTF, and keep the full verifier log for a report.

<a name="no-native-api"></a>

## No native API, or 404 on /api or /ui/

Find the latest `honk-core <version> starting` line in the current boot’s `journalctl -u honk-core -b` log, then compare it with [honk version](requirements.md#honk-version).

- The connection to the `listen` address fails: honk is not running, `enabled` is not `true`, or `listen` names another address. With `enabled: false` the listener does not start.
- `/api` returns 404: the server at that address has no native API, such as a honk build from main. doona’s sign-in page then says “This honk build has no native API”. Install the `debug` build.
- `/ui/` alone returns 404: the native API runs, but `ui` is empty.
- honk stops at startup with “failed to inspect native UI directory”, “failed to inspect native UI index.html” or “native UI index.html must be a regular file”: extract doona into the `ui` directory, as in [Install doona and start](install.md#doona).

<a name="sign-in"></a>

## Sign-in and cross-origin failures

- First-time setup works only from the gateway or a private-network client.
- “Network connection failed” or “Network or CORS request failed” in Settings: honk is not reachable at the `listen` address, or doona runs on an origin missing from `allow_origins` and `allowed_hosts`.
- A forgotten password: stop honk, run `sudo honk-core admin reset`, and start honk to set up again.
- An HTTPS page cannot reach an HTTP API; see [doona on another origin](install.md#other-origin).

<a name="read-only"></a>

## Read-only sources

doona marks a source read-only when any of these holds:

- `config_write` is not `true`.
- Neither `password_auth: true` nor `secret` is set.
- The file contains a `secret` inside `native_api` or `clash_api`, or text equal to a listener secret of 8 or more characters.
- honk is still loading its sources or its write coordinator is not running.
- Only with `--store db`, which this guide does not use: an activated revision could not be recorded, which blocks writes.

Move every secret into `config.d/api.dae`, and restart honk after changing `native_api`.
