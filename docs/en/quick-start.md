[繁體中文](../zh-TW/quick-start.md) / [简体中文](../zh-CN/quick-start.md) / English

# Quick start

Start the standard edition of doona with a direct-only honk configuration, sign in, and verify traffic from the gateway itself. Use a Debian or Ubuntu gateway with sudo access and a second way into the machine, such as a console.

## 1. Install doona and a compatible honk build

Follow [Install on Debian or Ubuntu](install-debian.md) to install the `doona-web` package and honk-core. Check [honk version](requirements.md#honk-version) before choosing the backend: doona needs the native API.

Other platforms:

- Fedora or RHEL: [installation](install-fedora.md).
- Arch Linux: [installation](install-arch.md).
- Gentoo: [installation](install-gentoo.md).
- OpenWrt: [installation](install-openwrt.md).
- Alpine or another distribution: [manual installation](install-manual.md).

On the Debian gateway, run:

```sh
/usr/local/bin/honk-core --version
ls -l /usr/share/doona-web/index.html
```

The first command prints the honk build. The second must list the installed UI's `index.html`.

## 2. Write the minimal configuration

Run the following commands in one terminal on the gateway. Use `ip -4 addr show` to find its LAN address, then replace the example address:

```sh
ip -4 addr show
LAN_IP=192.168.1.1
sudo install -d -m 0700 /etc/honk /etc/honk/config.d /var/lib/honk
```

Write `/etc/honk/config.dae`:

```sh
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

Write `/etc/honk/config.d/api.dae`:

```sh
sudo tee /etc/honk/config.d/api.dae > /dev/null <<EOF
experimental {
    native_api {
        enabled: true
        listen: '${LAN_IP}:9527'
        password_auth: true
        config_write: true
        ui: '/usr/share/doona-web'
    }
}
EOF
sudo cat /etc/honk/config.dae /etc/honk/config.d/api.dae
```

These are the complete sudo examples from [Minimal configuration](minimal-configuration.md), with its Debian UI path. The printed API file must contain your address on the `listen` line. The main file sends traffic directly and attaches honk to the default-route interface. It does not configure a LAN bridge; use the platform variants on the linked page for that setup.

Before starting the service, check the files with:

```sh
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae --mock-ebpf
```

Wait for `native API listener ready` and `honk-core is running`. In a second terminal, set `LAN_IP` again and query the API:

```sh
LAN_IP=192.168.1.1
curl "http://$LAN_IP:9527/api"
```

A native API response with `setup_required: true` confirms that the API is reachable and no administrator exists yet. Stop the foreground process with Ctrl+C.

## 3. Start the service

Create the systemd unit in [Service management](service-management.md), including its `daemon-reload` command. Then run on the gateway:

```sh
sudo systemctl enable --now honk-core
sudo systemctl status honk-core
```

The status must show `active (running)`. Run the `curl` command again to confirm that the service serves the API. If it fails, use the service log instructions on the linked page.

## 4. Sign in

From the gateway or a device on its LAN, open `http://192.168.1.1:9527/ui/`, substituting your address. Follow [First sign-in](first-sign-in.md) to enter a username, password, and password confirmation, then select **Create and sign in**. If an administrator already exists, sign in with that account.

Successful sign-in opens Activity. Open **System status** and check that it reports **Running**, identifies the engine as honk, and lists backend features.

## 5. Verify routing

On the gateway, check that a request goes out:

```sh
curl -I https://example.com
```

curl must receive an HTTP response.

In doona, open **Rules**, then **Trace simulation**. Choose TCP, enter the domain `example.com` and the destination port `443`, and choose **Run trace**. The result must end at `direct`.

Direct traffic is forwarded by the kernel, so it does not appear in **Connections**. Connections lists the traffic that honk handles in userspace, such as traffic sent through a proxy group after you add one.

You now have a direct-only baseline. Continue with [adding a subscription](common-tasks.md#subscription), or check [feature requirements](feature-requirements.md) before enabling additional controls.
