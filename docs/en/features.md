English · [简体中文](../zh-CN/features.md) · [繁體中文](../zh-TW/features.md)

<a name="features"></a>

# Features

First confirm that the gateway carries traffic. Replace the example subscription and node with working ones, then from a real LAN client test direct and proxied TCP, UDP and DNS. `honk-core is running`, the `dae0` link or a reachable API does not prove that traffic flows.

## Check every feature

The [example configuration](configuration.md#config) sets the options used by the features below. Replace the placeholder subscription and node, then verify each feature.

| Feature                                      | Works when                                                                                                     | Depends on                                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Sign-in and every page                       | After sign-in, Activity shows traffic and connections.                                                         | `enabled: true`, and `password_auth: true` or `secret`                                                                              |
| Configuration: edit sources                  | Every file in the source picker opens without a read-only mark, and Apply and reload validates and reloads.    | `config_write: true`; the file contains no secret                                                                                   |
| Configuration: new files                     | New file creates a `.dae` file that an `include` pattern of the main file loads, such as `config.d/rules.dae`. | `config_write: true`                                                                                                                |
| Policies: edit groups                        | A group card offers Edit, and saving applies it.                                                               | `config_write: true`; the group is in the main file, which contains no secret                                                       |
| Nodes: add nodes and subscriptions           | The Nodes page offers Paste node link and Add subscription.                                                    | `config_write: true`; the main file contains no secret                                                                              |
| Nodes: refresh subscriptions                 | Each subscription row has Refresh.                                                                             | A `subscription` entry, and honk’s subscription service running                                                                     |
| Settings: geodata sources                    | The Geodata card lists sources you can edit.                                                                   | The state database                                                                                                                  |
| Settings: geodata Update                     | Update on the Geodata card is enabled.                                                                         | `config_write: true`; `geosite.dat` and `geoip.dat` in `data_dir`; the state database, or both `geosite_download_url` and `geoip_download_url` |
| Settings: backend options                    | The Backend options card sets Flow recording, Log recording and DNS log to With panel, Always or Off.          | `record_flows`, `record_logs`, `record_dns_log`                                                                                     |
| Activity: traffic and memory history         | The history charts fill over up to 10 minutes.                                                                 | `record_traffic`, `record_memory`                                                                                                   |
| Logs                                         | Log lines appear while the page is open.                                                                       | `record_logs`                                                                                                                       |
| DNS: queries, cache and log                  | Queries and the cache are listed; the log fills while the page is open.                                        | `record_dns_log` for the log; the `dns` section                                                                                     |
| Connections: close                           | Rows can be closed one by one or all at once.                                                                  | `enabled: true`                                                                                                                     |
| Rules: rule list, flows and Trace simulation | Rules show hits, flow records appear, and Trace simulation explains a chosen target.                           | `record_flows` for flows; the `routing` section                                                                                     |
| Latency tests                                | Test on a node and Test all on a group show latency.                                                           | `enabled: true`; a private target also needs `probe_allowed_cidrs`                                                                  |
| Events                                       | The Events page shows the event stream.                                                                        | `enabled: true`                                                                                                                     |

In the default With panel mode, flow recording runs on demand, and log recording and the DNS log run only while a panel is attached. A recorder that is allowed but idle is normal.

<a name="still-missing"></a>

## If a feature is still missing

- honk was not restarted after `native_api` changed. A reload does not apply these fields.
- `config_write: true` is absent. A `native_api` field written directly under `experimental` stops honk with “[unknown experimental setting](troubleshooting.md#unknown-setting)”.
- Neither `password_auth: true` nor `secret` is set. With `enabled: true`, honk then refuses to start.
- The file contains a secret or text equal to one, so doona shows it [read-only](troubleshooting.md#read-only).
- honk is an early `feat/native-api` build, so the Geodata card has no source settings. Install the build from the doona release; see [honk version](requirements.md#honk-version).
- In token mode, the state database did not open, so the geodata sources card is hidden; see [State database problems](troubleshooting.md#state-db).
- Only when honk runs with `--store db`, which this guide does not use: a revision honk could not record blocks writes until the next successful activation.

## After sign-in

The activity page shows the running engine. The usual route through the rest:

1. Nodes: add a subscription (a name and its URL) or paste share links; nodes appear with their protocol, latency and groups. Set how often a subscription refreshes, test a node, or add it to a group from its row.
2. Policies: each group is a card with its members' latency. Pick a member of a selector group, pin one in an automatic group and release it again, test them all, or edit the group's policy and filters.
3. Rules: the routing dictionary in evaluation order with the flows each rule decided. Add a rule from a kind and its values (a domain suffix, a geosite category, a port, a process name) or as an expression, before any rule or at the end.
4. Configuration: the accepted sources with their diagnostics. Edit a file in place, validate, save and reload; a quick setup covers the main file's common settings.

Every configuration-source write goes through the engine. doona sends the hash it read the source at (`If-Match`); a file changed on disk answers 412 and nothing is written. The engine validates the whole source set before saving and reloading, and a failed reload keeps the previous generation active. Dry-run validation never writes, and redacted text is never written back. Runtime settings and group selection are separate endpoints with their own checks.

<a name="pages"></a>

## Pages and the resources they need

![The policies page](../screenshots/en/policies-light.webp)

| Page          | Shows                                                                                                                                                                                        | Needs                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Activity      | Outbound mode, traffic and memory, active connections, node latency, outbound usage, top clients and notifications                                                                           | —                                   |
| Overview      | Engine and eBPF state, traffic counters, backend capabilities, and the status as JSON                                                                                                        | `runtime`                           |
| Connections   | Live connections with source, destination, rule, chain and traffic; close one or all; filters from the URL                                                                                   | `connections`                       |
| DNS           | Queries with their answers, the cache, and the log; a flush                                                                                                                                  | `dns_query`, `dns_log`, `dns_cache` |
| Policies      | Groups, their members and health; selection, pinning, probing and editing                                                                                                                    | `groups`                            |
| Rules         | A routing tree from rules (or devices) through outbounds to the nodes they select, the rule list with hits, the flow log with a rule one click away, and a routing trace for a chosen target | `rules`, `flows`, `routing_trace`   |
| Nodes         | Subscriptions and their refresh interval, inline nodes, add and remove, probe and join a group                                                                                               | `nodes`, `providers`                |
| Configuration | Sources with diagnostics, an editor with validation, quick setup and export                                                                                                                  | `config`                            |
| Events        | The backend event stream                                                                                                                                                                     | `events`                            |
| Logs          | The log stream with level and module filters, pause and export                                                                                                                               | `logs`                              |
| Settings      | Backends, runtime settings and backend actions, language, appearance and palette                                                                                                             | —                                   |

Every page remains in navigation. A page is marked unavailable only when every resource listed for it in [registry.ts](../../src/shell/registry.ts) is unavailable; opening it shows an unavailable notice. `Ctrl K` (`⌘ K` on macOS) searches pages, connections, nodes, groups, subscriptions, rules and sources from anywhere.

![The rules page](../screenshots/en/rules-light.webp)

## Settings stored in the browser

doona has no server-side store for its own UI settings. Configuration and runtime changes are written through the engine; doona's UI settings live in the browser's `localStorage` for the site's origin. The main keys are below; [storage.ts](../../src/api/storage.ts) lists all of them.

| Setting       | Key              | Values                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backends      | `doona-profiles` | JSON list of `{id, name, api, token}`; `api` is a server root or proxy prefix, empty or `mock` for demo data. For password backends, `token` is empty and honk manages the session; doona keeps its session token in this tab's `sessionStorage`. In token mode, API requests send the token in the `Authorization` header. Pairing links may carry it in the URL fragment and remove it on load. |
| Active one    | `doona-profile`  | `id` of the selected backend                                                                                                                                                                                                                                                                                                                                                                      |
| Language      | `doona-lang`     | `zh-TW`, `zh-CN`, `en`; unset follows the browser language                                                                                                                                                                                                                                                                                                                                        |
| Colour scheme | `doona-scheme`   | `system` (default), `light`, `dark`                                                                                                                                                                                                                                                                                                                                                               |
| Palette       | `doona-palette`  | `rose-pine/moon` (default); the other ids are the `PaletteId` union in [palettes.ts](../../src/shell/palettes.ts)                                                                                                                                                                                                                                                                                 |
| Wordmark      | `doona-wordmark` | `gradient` (default), `plain`                                                                                                                                                                                                                                                                                                                                                                     |

The saved theme and language are applied before the first paint, so a reload does not flash the default look.

Over HTTPS or on localhost a service worker precaches the application shell and caches fonts and icons, so the pages open offline and the site can be installed as an app. API responses are never cached. See [SECURITY.md](../../.github/SECURITY.md) for reporting a vulnerability.

![The activity page in dark mode](../screenshots/en/activity-dark.webp)
