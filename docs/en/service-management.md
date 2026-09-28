English / [简体中文](../zh-CN/service-management.md) / [繁體中文](../zh-TW/service-management.md)

# Service management

This page runs honk as a systemd or OpenWrt procd service: it creates the service once, then lists the commands that start, stop, restart and reload honk and read its log. It has no OpenRC steps. Finish [Minimal configuration](minimal-configuration.md) first.

No doona package installs a honk service, and honk’s release archives carry none, so step 1 creates it.

| System                                           | Service manager | Tabs to use       |
| ------------------------------------------------ | --------------- | ----------------- |
| Debian, Ubuntu, Fedora, RHEL, Arch Linux, Gentoo with systemd | systemd | sudo or root |
| OpenWrt                                          | procd           | OpenWrt       |
| Gentoo or Alpine with OpenRC                     | OpenRC          | Not covered: see OpenRC below |

## OpenRC

doona and honk ship no OpenRC script. To reach [First sign-in](first-sign-in.md), start honk in the foreground with the command from step 6 of [Minimal configuration](minimal-configuration.md):

```sh tab="sudo"
sudo /usr/local/bin/honk-core --config /etc/honk/config.dae
```

```sh tab="root"
/usr/local/bin/honk-core --config /etc/honk/config.dae
```

honk runs until you press Ctrl+C or close the terminal, and prints its log there. It does not start at boot. The rest of this page applies to systemd and procd only.

## 1. Create the service

Do this once. The systemd unit is the one honk’s quick start gives; the procd script starts the same command with OpenWrt’s paths.

```sh tab="sudo"
sudo tee /etc/systemd/system/honk-core.service > /dev/null <<'EOF'
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
EOF
sudo systemctl daemon-reload
```

```sh tab="root"
cat > /etc/systemd/system/honk-core.service <<'EOF'
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
EOF
systemctl daemon-reload
```

```sh tab="OpenWrt"
cat > /etc/init.d/honk-core <<'EOF'
#!/bin/sh /etc/rc.common

START=99
STOP=10
USE_PROCD=1

start_service() {
	procd_open_instance
	procd_set_param command /usr/bin/honk-core --config /etc/honk/config.dae --data-dir /etc/honk/data --disable-timestamp
	procd_set_param limits nofile="1048576 1048576"
	procd_set_param env MIMALLOC_PURGE_DELAY=0
	procd_set_param respawn
	procd_set_param stdout 1
	procd_set_param stderr 1
	procd_close_instance
}

reload_service() {
	/usr/bin/honk-core reload
}
EOF
chmod 0755 /etc/init.d/honk-core
```

Do not add `NoNewPrivileges=yes`, capability limits or a read-only `/proc/sys` to the unit: honk needs BPF, network administration, namespace, mount and sysctl privileges at startup.

On OpenWrt, `MIMALLOC_PURGE_DELAY=0` makes honk return freed memory to the system at once. Without it, a build before `debug.2026.9.28.native-api.4` on a router with 256 MB keeps about 120 MB after a geodata update and runs out of memory on the next one.

## 2. Start honk and start it at boot

```sh tab="sudo"
sudo systemctl enable --now honk-core
```

```sh tab="root"
systemctl enable --now honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core enable
/etc/init.d/honk-core start
```

systemd prints `Created symlink '/etc/systemd/system/multi-user.target.wants/honk-core.service' → '/etc/systemd/system/honk-core.service'.` The command returns once honk reports that it is ready.

## 3. Check that honk is running

```sh tab="sudo"
sudo systemctl status honk-core
```

```sh tab="root"
systemctl status honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core status
```

A running honk looks like this. systemd on Debian 13:

```text
● honk-core.service - honk transparent proxy engine
     Loaded: loaded (/etc/systemd/system/honk-core.service; enabled; preset: enabled)
     Active: active (running) since …
```

procd prints `running`; after a stop it prints `inactive`.

The log also shows `honk-core is running. Press Ctrl+C to stop.`, and `curl http://192.168.1.1:9527/api`, with your address, answers as in [step 5 of Minimal configuration](minimal-configuration.md).

## Read the log

```sh tab="sudo"
sudo journalctl -u honk-core -e
```

```sh tab="root"
journalctl -u honk-core -e
```

```sh tab="OpenWrt"
logread -e honk-core
```

To follow new lines as they arrive:

```sh tab="sudo"
sudo journalctl -u honk-core -f
```

```sh tab="root"
journalctl -u honk-core -f
```

```sh tab="OpenWrt"
logread -f -e honk-core
```

Press Ctrl+C to stop following. The systemd journal keeps lines from earlier starts too; read from the last `starting` line.

## Reload the configuration

After editing a `.dae` file, reload honk. A reload re-reads the configuration without stopping honk.

```sh tab="sudo"
sudo systemctl reload honk-core
```

```sh tab="root"
systemctl reload honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core reload
```

The log shows `SIGHUP reload request 1 started`, then `applied`, or `rejected` with `reload rejected: changed fields require process restart fields=[…]`. The listed fields, which include everything under `native_api`, `log_level` and the interfaces, need a restart. doona’s Configuration page reloads by itself after saving.

## Restart

A restart stops honk and starts it again.

```sh tab="sudo"
sudo systemctl restart honk-core
```

```sh tab="root"
systemctl restart honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core restart
```

## Stop

```sh tab="sudo"
sudo systemctl stop honk-core
```

```sh tab="root"
systemctl stop honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core stop
```

honk stays stopped until the next start or boot.

## Stop starting at boot

```sh tab="sudo"
sudo systemctl disable honk-core
```

```sh tab="root"
systemctl disable honk-core
```

```sh tab="OpenWrt"
/etc/init.d/honk-core disable
```

Next: [First sign-in](first-sign-in.md).

## If it doesn’t work

| You see                                                                 | Cause and fix                                                                                                         |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Active: failed` or `activating (auto-restart)`                         | honk stopped at startup. The log names the reason on a `fatal error, shutting down:` line; [Minimal configuration](minimal-configuration.md) lists the common ones. |
| systemd cannot find `honk-core.service`                                 | Step 1 was skipped, or `systemctl daemon-reload` did not run after it.                                                |
| `Error: no running honk-core instance; /run/honk-core.lock does not exist` on reload | honk is not running, or it runs with `--mock-ebpf`, which takes no lock. Start the service instead of reloading. |
| A change has no effect after a reload                                   | The log shows `reload rejected`. Restart instead.                                                                     |

For more messages, see [Troubleshooting](troubleshooting.md#troubleshooting).
