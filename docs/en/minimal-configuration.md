[繁體中文](../zh-TW/minimal-configuration.md) / [简体中文](../zh-CN/minimal-configuration.md) / English

# Minimal configuration

Copy these two files for a new, direct-only honk setup with the standard interface. Install [honk and doona](install.md) first; for a guided first run use [Quick start](quick-start.md), and for subscriptions and proxy routing use the [tutorial](tutorial.md).

These commands replace `/etc/honk/config.dae` and `/etc/honk/config.d/api.dae`. Use them for a new setup; keep an existing configuration if you are already running honk.

## 1. Set the address and UI directory

In one terminal on the gateway, find its LAN address and set these variables. Replace the example IP and choose the directory that contains your installed `index.html`:

```sh
ip -4 addr show
LAN_IP=192.168.1.1
UI_DIR=/usr/share/doona
```

For Debian or Ubuntu packages, set `UI_DIR=/usr/share/doona-web`. Other installation paths are listed in [Installation](install.md#doona). Use the same terminal for the remaining file-writing commands.

## 2. Write the main file

Choose the tab for your shell or platform. The sudo and root examples cover the gateway's own traffic. The OpenWrt example also attaches to `br-lan`; change that name if your LAN bridge differs.

```sh tab="sudo"
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
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
install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
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
mkdir -p /etc/honk/config.d /etc/honk/data
chmod 0700 /etc/honk /etc/honk/config.d /etc/honk/data
cat > /etc/honk/config.dae <<'EOF'
include {
    config.d/*.dae
}

global {
    wan_interface: auto
    lan_interface: br-lan
    data_dir: '/etc/honk/data'
    bootstrap_resolver: '127.0.0.1:53'
}

routing {
    fallback: direct
}
EOF
```

For interface selection and field meanings, see [Configuration](configuration.md). This example has no proxy nodes or DNS routing rules.

To handle LAN clients, add `lan_interface` to `global` with the interface facing those clients. On a main router, use the LAN bridge, commonly `br-lan`; clients already use this router as their gateway. On a side router, set clients' gateway and DNS to the side router's LAN address, either on each client or through the main router's DHCP settings.

Do not assume `lan_interface: auto` selects the LAN: it selects the interface with the lowest-metric IPv4 default route, usually the WAN interface on a main router.

## 3. Write the API include

```sh tab="sudo"
sudo tee /etc/honk/config.d/api.dae > /dev/null <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '${UI_DIR}'
    }
}
EOF
sudo cat /etc/honk/config.d/api.dae
```

```sh tab="root / OpenWrt"
cat > /etc/honk/config.d/api.dae <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '${UI_DIR}'
    }
}
EOF
cat /etc/honk/config.d/api.dae
```

The printed file must show your LAN address and the installed UI directory. See [Configuration](configuration.md) for the API keys, [sign-in requirements](feature-requirements.md#req-sign-in) for authentication, and [hostname and origin access](install.md#other-origin) if you use a hostname.

## 4. Check startup without attaching eBPF

If honk is already running, stop that instance using [Service management](service-management.md) before starting another listener. In the gateway terminal, run:

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

```sh tab="OpenWrt"
honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data --mock-ebpf
```

With `--mock-ebpf`, the warning `NFQUEUE is unavailable at startup; continuing with NFQUEUE staging disabled` is expected when its reason is `the mock eBPF backend was selected`.

A successful start does not confirm that every setting was used. The parser warns about and ignores unknown scalar keys in `global`; read the startup diagnostics before continuing.

Wait for `native API listener ready` and `honk-core is running`. In a second terminal, query the API, replacing the IP:

```sh
curl http://192.168.1.1:9527/api
```

A JSON response containing `setup_required: true` means the API is reachable and no administrator exists yet. This check does not prove that the real eBPF backend can start or route traffic.

Press Ctrl+C in the first terminal. Continue with [Service management](service-management.md) to start the real backend, then [First sign-in](first-sign-in.md). If startup fails, use [Troubleshooting](troubleshooting.md).

## If the startup check fails

| Message | Check |
| --- | --- |
| `native API listener bind failed` | Confirm that `listen` names an address on this gateway and that another process is not using the port. |
| `Subscription HTTP client creation failed`, followed by `subscription network startup failed` | Read the underlying TLS error and check the system CA certificate store. Install your distribution's certificate package, such as `ca-certificates` or OpenWrt's `ca-bundle`. |
| `command not found` or a missing executable | Compare the honk-core path in the command with your platform's [installation instructions](install.md). |
