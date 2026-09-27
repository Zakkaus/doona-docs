English · [简体中文](../zh-CN/configuration.md) · [繁體中文](../zh-TW/configuration.md)

<a name="config"></a>

# Configuration

The configuration is two files. The main file, `/etc/honk/config.dae`, holds interfaces, nodes, groups, routing and DNS. `/etc/honk/config.d/api.dae` holds the native API that doona uses. The main file includes every `.dae` file in `config.d/`; a relative include resolves against the main file’s directory.

## Main file

```dae
# /etc/honk/config.dae
include {
    config.d/*.dae
}

global {
    # The interface LAN clients reach the gateway through.
    # Remove it to proxy only the gateway's own traffic.
    lan_interface: br-lan
    # Follow the IPv4 default-route interface.
    wan_interface: auto
    data_dir: '/var/lib/honk'
    log_level: info
    dial_mode: domain
    auto_config_kernel_parameter: true
    # Resolves proxy and download hostnames without passing through honk.
    bootstrap_resolver: '1.1.1.1:53'
}

subscription {
    # Replace with your provider's subscription URL.
    my_sub: 'https://subscription.example/sub'
}

node {
    # An optional static node; replace or remove it.
    backup: 'socks5://192.0.2.2:1080'
}

group {
    proxy {
        filter: subtag('my_sub')
        filter: name('backup')
        policy: min_moving_avg
    }
}

routing {
    # Keep private destinations off the proxy; this also bypasses private DNS servers.
    dip(geoip: private) -> direct(must)
    domain(geosite: cn) -> direct
    dip(geoip: cn) -> direct
    fallback: proxy
}

dns {
    upstream {
        local_dns: 'udp://223.5.5.5:53' -> direct
        remote_dns: 'https://dns.google/dns-query' -> proxy
    }
    routing {
        request {
            qname(geosite: cn) -> local_dns
            fallback: remote_dns
        }
    }
}
```

- `lan_interface`: replace `br-lan` with the interface LAN clients use to reach the gateway. Remove this field to proxy only the gateway’s own traffic. `wan_interface: auto` also covers the gateway’s own traffic.
- `data_dir`: the runtime root, `/var/lib/honk` by default. It holds the geodata files and the state database `state/honk.db`.
- `bootstrap_resolver`: resolves proxy server names and geodata download hosts without honk intercepting the query. A direct download from a URL with a hostname needs it; by default downloads follow the routing rules.
- `subscription` and `node`: replace them with your own. doona’s Nodes page adds more later.
- `group proxy`: the subscription’s nodes plus the static node; `min_moving_avg` selects the member with the lowest latency.
- `routing`: private destinations first with `direct(must)`, then Chinese mainland domains and IP addresses directly, everything else through `proxy`.
- `dns`: Chinese mainland domains go to a local resolver, the rest to DNS over HTTPS through the proxy.

## API file

```dae
# /etc/honk/config.d/api.dae
# Every native_api field needs a restart; a reload rejects changes.
experimental {
    native_api {
        enabled: true
        # The gateway's LAN address. The default, 127.0.0.1:9527,
        # is reachable only from the gateway itself.
        listen: '192.168.1.1:9527'
        # Administrator password login. For token mode, delete this
        # line and set secret instead; the two cannot be combined.
        password_auth: true
        # secret: 'replace-with-a-long-random-token'
        config_write: true
        ui: '/usr/share/doona'
        # On by default; listed so the names are known.
        record_flows: true
        record_traffic: true
        record_memory: true
        record_logs: true
        record_dns_log: true
        # Geodata Update works even without a state db. Direct, final
        # HTTP(S) URLs only; a redirect is refused.
        geosite_download_url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat'
        geoip_download_url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat'
    }
}
```

Replace `192.168.1.1` with the gateway’s LAN address. Keep this block in its own file. doona shows a file as read-only when it contains a `secret` inside `native_api` or `clash_api`, or any text equal to a listener secret of 8 or more characters. honk hides the secret, so writing the file back would lose it. Groups declared in that file become read-only too.

Adding nodes and subscriptions writes to the main file, so the main file must not contain any secret.

When doona is opened from another origin, such as a TLS reverse proxy, also add:

```dae
experimental {
    native_api {
        # Only when doona is opened from another origin, such as a TLS reverse proxy.
        allow_origins: 'https://panel.example'
        allowed_hosts: 'panel.example'
    }
}
```

### native_api fields

| Field                                        | Default            | What it enables in doona                                                                                                                |
| -------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                                    | `false`            | The API listener, and so all of doona.                                                                                                  |
| `listen`                                     | `'127.0.0.1:9527'` | The address doona connects to. A numeric IP and a port; the default is reachable only from the gateway.                                 |
| `password_auth`                              | `false`            | Sign-in with an administrator username and password. Cannot be combined with `secret`.                                                  |
| `secret`                                     | `''`               | Token mode: doona asks for this token. Cannot be combined with `password_auth`.                                                         |
| `config_write`                               | `false`            | Editing and adding sources, managing nodes, subscriptions, groups and rules, and geodata updates. Requires `password_auth` or `secret`. |
| `ui`                                         | `''`               | Serves doona at `/ui/`. The directory must hold `index.html`; a missing directory stops startup.                                        |
| `record_flows`                               | `true`             | Flow records on the Rules page. `false` also disables the runtime switch.                                                               |
| `record_traffic`                             | `true`             | Traffic history charts.                                                                                                                 |
| `record_memory`                              | `true`             | Memory history charts.                                                                                                                  |
| `record_logs`                                | `true`             | The Logs page.                                                                                                                          |
| `record_dns_log`                             | `true`             | The DNS log.                                                                                                                            |
| `geosite_download_url`, `geoip_download_url` | `''`               | Geodata Update without a state database. With one, these URLs replace the stored ones at startup.                                       |
| `allow_origins`, `allowed_hosts`             | empty              | doona served from another origin or through a reverse proxy.                                                                            |

Every `native_api` field needs a restart. A reload rejects a change to one and keeps the running listener.

## Install the files

```sh
sudo install -m 0600 config.dae /etc/honk/config.dae
sudo install -m 0600 api.dae /etc/honk/config.d/api.dae
```

Install doona next, as in [Install doona and start](install.md#doona); honk starts after that.
