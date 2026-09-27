English · [简体中文](../zh-CN/minimal-configuration.md) · [繁體中文](../zh-TW/minimal-configuration.md)

# Minimal configuration

This page writes the smallest honk configuration that starts honk and serves doona, then checks it by starting honk by hand. It assumes doona is in `/usr/share/doona` and honk-core is installed, as the install pages leave them.

The configuration is two files. `/etc/honk/config.dae` is the main file. `/etc/honk/config.d/api.dae` turns on the native API that doona talks to. Every connection goes out directly until you add nodes and rules; [Configuration](configuration.md#config) has a fuller example.

## Before you start

- A shell on the gateway: a user with sudo, or root. On OpenWrt, pick the OpenWrt tab wherever one is offered; it runs as root and keeps honk’s data in `/etc/honk/data`, because `/var` on OpenWrt is in memory and is cleared at reboot.
- A second way into the machine, such as a console, for step 6. honk changes the gateway’s networking when it starts for real.

## 1. Find the gateway’s LAN address

doona is opened at this address from the LAN.

```sh
ip -4 addr show
```

Find the interface your LAN devices connect to (on OpenWrt, `br-lan`) and note the address after `inet`, without the `/24`. For example:

```text
    inet 192.168.1.1/24 brd 192.168.1.255 scope global eth0
```

Set it for the next steps:

```sh
LAN_IP=192.168.1.1
```

## 2. Create the directories

```sh tab="sudo"
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
```

```sh tab="root"
install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
```

```sh tab="OpenWrt"
mkdir -p /etc/honk/config.d /etc/honk/data
chmod 0700 /etc/honk /etc/honk/config.d /etc/honk/data
```

The directories are readable by root only: the configuration and the state database hold credentials.

## 3. Write the main file

```sh tab="sudo"
sudo tee /etc/honk/config.dae > /dev/null <<'EOF'
include {
    config.d/*.dae
}

global {
    wan_interface: auto
}

routing {
    fallback: direct
}
EOF
```

```sh tab="root"
cat > /etc/honk/config.dae <<'EOF'
include {
    config.d/*.dae
}

global {
    wan_interface: auto
}

routing {
    fallback: direct
}
EOF
```

```sh tab="OpenWrt"
cat > /etc/honk/config.dae <<'EOF'
include {
    config.d/*.dae
}

global {
    wan_interface: auto
    data_dir: '/etc/honk/data'
}

routing {
    fallback: direct
}
EOF
```

| Line                           | What it does                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `include { config.d/*.dae }`   | Reads every `.dae` file in `/etc/honk/config.d/`, relative to this file. The API file in step 4 is one of them.                        |
| `wan_interface: auto`          | Attaches honk to the interface of the IPv4 default route, so honk handles the gateway’s own traffic.                                   |
| `data_dir: '/etc/honk/data'`   | OpenWrt only. Where honk keeps geodata and its state database, including the administrator account. Elsewhere the default, `/var/lib/honk`, applies. |
| `routing { fallback: direct }` | Sends every connection directly, without a proxy. Nodes, groups and rules come later, from doona or [Configuration](configuration.md#config). |

The file sets no `lan_interface`, so devices on the LAN are not routed through honk yet. [Configuration](configuration.md#config) shows how to add it.

## 4. Write the API file

This file uses `LAN_IP` from step 1.

```sh tab="sudo"
sudo tee /etc/honk/config.d/api.dae > /dev/null <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '/usr/share/doona'
    }
}
EOF
sudo cat /etc/honk/config.d/api.dae
```

```sh tab="root"
cat > /etc/honk/config.d/api.dae <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '/usr/share/doona'
    }
}
EOF
cat /etc/honk/config.d/api.dae
```

```sh tab="OpenWrt"
cat > /etc/honk/config.d/api.dae <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '/usr/share/doona'
    }
}
EOF
cat /etc/honk/config.d/api.dae
```

The printed file shows your address on the `listen` line, such as `listen: '192.168.1.1:9527'`.

| Line                         | What it does                                                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `experimental { native_api` | The native API block. It must sit inside `experimental`.                                                                                        |
| `enabled: true`             | Starts the API listener. doona needs it.                                                                                                        |
| `listen: '…:9527'`          | The address and port doona is opened at. The default, `127.0.0.1:9527`, is reachable only from the gateway itself.                              |
| `password_auth: true`       | Sign-in with an administrator username and password. You create the administrator in [First sign-in](first-sign-in.md). honk refuses to start with the API enabled and no sign-in method. |
| `config_write: true`        | Lets doona edit the configuration, nodes, subscriptions, groups and rules. Remove it to keep doona read-only.                                   |
| `ui: '/usr/share/doona'`    | Serves doona’s files at `/ui/`. honk refuses to start if the directory has no `index.html`.                                                     |

Every `native_api` field takes effect only after a restart. The [field table](configuration.md#config) lists the rest.

## 5. Check the configuration

honk has no separate check command. Start it once with `--mock-ebpf`: it reads and admits the whole configuration, starts the API and serves doona, but leaves the network alone.

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data --mock-ebpf
```

honk keeps running in the foreground. Each line starts with a timestamp; among them you should see:

```text
INFO honk_core: honk-core debug.2026.9.26.native-api.4 starting
INFO honk_core: Config: /etc/honk/config.dae
INFO honk_core: Loaded 2 nodes, 0 groups, 0 routing rules
WARN honk_core: NFQUEUE is unavailable at startup; continuing with NFQUEUE staging disabled requested=true reason=the mock eBPF backend was selected
INFO honk_core: Using mock eBPF backend
INFO honk_core: listen=192.168.1.1:9527 native API listener ready
INFO honk_core: honk-core is running. Press Ctrl+C to stop.
```

The `WARN` line is expected under `--mock-ebpf`. While honk runs, ask the API from a second terminal, with your address in place of `192.168.1.1`:

```sh
curl http://192.168.1.1:9527/api
```

It answers with one line; `setup_required: true` means no administrator exists yet:

```text
{"api_major":1,"auth":{"mode":"password","setup_required":true},"links":{"auth_login":"/api/v1/auth/login","auth_setup":"/api/v1/auth/setup"},"name":"dae/honk-native"}
```

Press Ctrl+C in the first terminal. honk logs `Received SIGINT, shutting down...` and ends with `honk-core stopped`.

## 6. Start honk for real once

This start loads eBPF programs and attaches them to the WAN interface. Keep the second way into the machine ready.

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data
```

The log shows the same `native API listener ready` and `honk-core is running. Press Ctrl+C to stop.` lines, without the mock lines. Press Ctrl+C to stop honk; the service in the next step runs it from now on.

Next: [Service management](service-management.md).

## If it doesn’t work

honk prints the reason on a line starting `fatal error, shutting down:` or as an `ERROR`.

| You see                                                                                   | Cause and fix                                                                                                                    |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `native API listener bind failed`                                                         | The `listen` address is not on this machine. Repeat step 1 and step 4.                                                           |
| `failed to inspect native UI index.html: No such file or directory`                       | doona is not in `/usr/share/doona`. Repeat the doona steps of the install page.                                                  |
| `Subscription network owner failed error="subscription HTTP client creation failed"`, then `subscription network startup failed` | CA certificates are missing. Install the `ca-certificates` package (`ca-bundle` on OpenWrt).                     |
| `native API requires a secret, password login, or explicitly anonymous loopback`          | The `password_auth: true` line is missing from `api.dae`.                                                                         |
| `unknown experimental setting`                                                            | A `native_api` field sits directly under `experimental`, or this honk build has no native API. See [unknown experimental setting](troubleshooting.md#unknown-setting). |
| `command not found`                                                                       | honk-core is not where the command expects it. Repeat the honk-core install step.                                                |

A clean start does not prove that every value means what you intended: honk accepts some unknown values without an error. For more messages, see [Troubleshooting](troubleshooting.md#troubleshooting).
