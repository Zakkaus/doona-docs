[English](../en/configuration.md) / 简体中文 / [繁體中文](../zh-TW/configuration.md)

<a name="config"></a>

# 配置

配置分为两个文件。主文件 `/etc/honk/config.dae` 包含网卡、节点、组、分流与 DNS；`/etc/honk/config.d/api.dae` 包含 doona 使用的原生 API。主文件引入 `config.d/` 中的全部 `.dae` 文件，相对路径以主文件所在目录为基准。

## 主文件

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

- `lan_interface`：将示例中的 `br-lan` 改为局域网客户端连接网关所用的网卡；只代理网关自身流量时删除此项。`wan_interface: auto` 同时处理网关自身的流量。
- `data_dir`：运行时根目录，默认为 `/var/lib/honk`，存放地理数据文件与状态数据库 `state/honk.db`。
- `bootstrap_resolver`：直接解析代理服务器与地理数据下载地址的域名，避免被 honk 拦截。直接下载且地址使用域名时必须设置此项；下载默认按路由规则转发。
- `subscription` 与 `node`：替换为自己的订阅与节点。之后可在 doona 的节点页继续添加。
- `group proxy`：包含订阅中的节点与静态节点；`min_moving_avg` 选择延迟最低的成员。
- `routing`：私有地址优先以 `direct(must)` 直连，中国大陆域名与 IP 地址直连，其余流量经由 `proxy`。
- `dns`：中国大陆域名交给本地解析器，其余经由代理以 DNS over HTTPS 解析。

## API 文件

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

请将 `192.168.1.1` 替换为网关的局域网地址，并将此配置块单独放在一个文件中。文件在 `native_api` 或 `clash_api` 中包含 `secret`，或包含与 8 字节以上监听密钥相同的文本时，doona 会将该文件显示为只读，因为 honk 会隐藏至少 8 字节的密钥，写回隐藏后的文本会丢失密钥。该文件中声明的组同样变为只读。

添加节点与订阅会写入主文件，因此主文件中不能包含任何密钥。

从其他来源打开 doona 时，例如经由 TLS 反向代理，还需添加：

```dae
experimental {
    native_api {
        # Only when doona is opened from another origin, such as a TLS reverse proxy.
        allow_origins: 'https://panel.example'
        allowed_hosts: 'panel.example'
    }
}
```

### native_api 字段

`listen` 为 loopback 地址且设置 `allow_anonymous_loopback: true` 时，请求无需 Token 即可获准访问，权限与通过 bearer Token 验证的请求相同。此模式仅用于本地开发。

| 字段                                         | 默认值             | 在 doona 中启用的功能                                                                              |
| -------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `enabled`                                    | `false`            | API 监听器。需要 `secret`、`password_auth: true`，或 loopback `listen` 与 `allow_anonymous_loopback: true`。                                                                  |
| `listen`                                     | `'127.0.0.1:9527'` | doona 连接的地址，只接受数字 IP 与端口。默认值只能从网关本机访问。                                 |
| `password_auth`                              | `false`            | 以管理员用户名与密码登录，不能与 `secret` 或 `allow_anonymous_loopback` 同时使用。                                               |
| `secret`                                     | `''`               | Token 模式，doona 会要求输入此 Token。没有最短长度限制；只接受不含空白或逗号的可见 ASCII。不能与 `password_auth` 同时使用。                            |
| `config_write`                               | `false`            | 编辑与新建配置文件，管理节点、订阅、组与规则，以及更新地理数据。需要 `password_auth` 或 `secret`。 |
| `ui`                                         | `''`               | 在 `/ui/` 提供 doona。目录中必须有 `index.html`；目录不存在时 honk 无法启动。`embedded` 需要 `native-ui`；发布构建已包含此功能，并在打包时嵌入 doona。                      |
| `record_flows`                               | `true`             | 从 beta.9 起，连接页和规则页按需显示流程记录。设为 `false` 时运行时开关也无法开启。                               |
| `record_traffic`                             | `true`             | 流量历史图表。                                                                                     |
| `record_memory`                              | `true`             | 内存历史图表。                                                                                     |
| `record_logs`                                | `true`             | 日志页。                                                                                           |
| `record_dns_log`                             | `true`             | DNS 记录。                                                                                         |
| `geosite_download_url`、`geoip_download_url` | `''`               | `assets.geodata.geosite` 与 `assets.geodata.geoip` 的旧别名，仍接受但会警告。没有状态数据库时，更新需要这两个地址；有数据库时，启动时覆盖已存储的地址。             |
| `allow_origins`、`allowed_hosts`             | 空                 | 从其他来源或经由反向代理打开 doona。                                                               |

`native_api` 的每个字段都需要重启才能生效。重载会拒绝对这些字段的修改，并保留正在运行的监听。

状态数据库可用时，设置页会把地理数据来源、更新计划和“SHA-256 校验”保存在数据库中，而不是写入 `native_api`。默认开启校验；`.sha256sum` 返回 404 时，未经校验的文件本就可以加载。仅当可信镜像的`.sha256sum` 地址返回其他错误时才关闭；参阅[更新失败](troubleshooting.md#geodata-update)。

地理数据问题请参阅[来源无法编辑](troubleshooting.md#geodata-sources)、[reason 为 unsafe](troubleshooting.md#state-unsafe)与[更新失败](troubleshooting.md#geodata-update)。

## 安装配置文件

```sh
sudo install -m 0600 config.dae /etc/honk/config.dae
sudo install -m 0600 api.dae /etc/honk/config.d/api.dae
```

接下来按[安装 doona 并启动](install.md#doona)安装 doona，之后再启动 honk。
