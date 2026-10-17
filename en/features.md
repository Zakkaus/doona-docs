<a name="features"></a>

# Features

First confirm that the gateway carries traffic. Replace the example subscription and node with working ones, then from a real LAN client test direct and proxied TCP, UDP and DNS. `honk-core is running`, the `dae0` link or a reachable API does not prove that traffic flows.

## Check every feature

The [example configuration](https://zakkaus.github.io/doona-docs/en/configuration.md#config) sets the options used by the features below. Replace the placeholder subscription and node, then verify each feature.

| Feature                                      | Works when                                                                                                     | Depends on                                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Sign-in and every page                       | After sign-in, Activity shows traffic and connections.                                                         | `enabled: true`, and `password_auth: true` or `secret`                                                                              |
| Configuration: edit sources | A writable, complete file opens in Config files; Apply validates, writes and reloads it. | `config_write: true`; a writable source without secrets |
| Configuration: new files                     | New file creates a `.dae` file that an `include` pattern of the main file loads, such as `config.d/rules.dae`. | `config_write: true`                                                                                                                |
| Policies: edit groups | Edit group changes membership and policy in the shared dialog; Apply validates, writes and reloads. | `config_write: true`; the defining main or include file is writable |
| Nodes: add nodes and subscriptions           | The Nodes page offers Paste node link and Add subscription.                                                    | `config_write: true`; the main file contains no secret                                                                              |
| Nodes: update subscriptions | Each subscription card has Update {name}. | A `subscription` entry and backend subscription refresh support |
| Settings: geodata sources                    | The Geodata card lists sources you can edit.                                                                   | The state database                                                                                                                |
| Settings: geodata update and reset | The Geodata card lists files even without configurable sources. Update now updates the files; Reset to defaults removes overrides after confirmation. | File listing needs geodata read support; manual updates need configured URLs and update capability, not configurable settings; reset needs writable geodata settings |
| Settings: temporary runtime overrides | Flow recording offers On flow demand, Always or Off; Log recording and DNS log offer On log demand and On DNS log demand respectively, Always or Off. | `record_flows`, `record_logs`, `record_dns_log` |
| Settings: geodata checksum                   | Verify checksum can be turned off for a trusted mirror that returns an error for its `.sha256sum` URL.         | A backend that offers `verify_checksum` and the state database                                                                    |
| Activity: traffic and memory history         | The history charts fill over up to 10 minutes.                                                                 | `record_traffic`, `record_memory`                                                                                                   |
| Logs                                         | Log lines appear while the page is open.                                                                       | `record_logs`                                                                                                                       |
| DNS: queries, cache and log                  | Queries and the cache are listed; the log fills while the page is open.                                        | `record_dns_log` for the log; the `dns` section                                                                                     |
| Connections: close and edit matched rule | Close connections, or open a writable matched rule on Rules to edit its conditions and target. | `connections`; editing needs `rules` and a writable source |
| Rules: routing and DNS rules, flows, Trace | Edit routing and DNS request and response rules; view hits, flows and Trace simulation, including optional DSCP from 0 to 63. | The corresponding rule, flow and trace resources; edits need `config_write: true` and a writable source |
| DNS: create a rule from a resolution | The row's add-rule icon opens a DNS request rule matching the exact domain; Domain suffix includes subdomains. Without DNS rules it opens a routing rule. | A supported rule list; applying needs a writable configuration |
| Policies: check settings                     | Edit a group's tolerance and idle timeout when the backend marks them changeable.                               | `groups` and the fields in `mutable_config`                                                                                       |
| System status: runtime degradations | The Datapath card warns when honk continues with a reduced feature after a recovered failure. | `runtime.degradations` |
| Latency probes | Test {name} on a node and Test all on a group use Settings > Latency probes. Probe with options… selects a supported method, IP family, cold measurement and nested group nodes. | Backend `probes` capabilities and configured probe targets; the removed `probe_allowed_cidrs` and `probe_allowed_ports` keys are ignored with warnings |
| Events                                       | The Events page shows the event stream.                                                                        | `enabled: true`                                                                                                                     |
| DNS: delete matching cache entries | Delete matching shows the count before confirmation; match a full domain, suffix, keyword or regex, a record type, or both. Exact-name deletion also works without cache listing. | Backend cache deletion capabilities |
| DNS: query upstream | Upstream offers Automatic, following `dns.routing`, or a named upstream from `dns.upstream`. | DNS queries and readable configuration with named upstreams |
| Configuration: backups and revisions | Export configuration downloads accepted configuration; Import server files reads server startup files; revision details offer confirmed restore. No local backup is uploaded; exports omit listener secrets but may retain other credentials. | Backend configuration export, import or revision capabilities |
| Error diagnostics | Copy error copies failure details; Settings > About offers Copy recent errors for the last 20 errors kept in memory, excluding secrets and request bodies. | A recorded failure or unknown-result operation |

In automatic recording modes, flow requests, log streams and DNS log reads activate their own recorders, each with an independent 60-second grace period. Connections, Routing log and Rules request flows while open. A recorder that is allowed but idle is normal.

<a name="still-missing"></a>

## If a feature is still missing

- honk was not restarted after `native_api` changed. A reload does not apply these fields.
- `config_write: true` is absent. A `native_api` field written directly under `experimental` stops honk with “[unknown experimental setting](https://zakkaus.github.io/doona-docs/en/troubleshooting.md#unknown-setting)”.
- Neither `password_auth: true` nor `secret` is set, and anonymous loopback is not enabled. With `enabled: true`, honk then refuses to start. `allow_anonymous_loopback: true` with a loopback `listen` admits read requests without a token. Configuration writes and protected settings changes still require credentials. Use it for local development only.
- The file contains a secret or text equal to one, so doona shows it [read-only](https://zakkaus.github.io/doona-docs/en/troubleshooting.md#read-only).
- honk is an early `feat/native-api` build, so the Geodata card has no source settings. Install the build from the doona release; see [honk version](https://zakkaus.github.io/doona-docs/en/requirements.md#honk-version).
- In token mode, the state database did not open, so Geodata has no configurable source or schedule controls. The files table remains, and manual updates can still work with configured URLs and update capability; see [State database problems](https://zakkaus.github.io/doona-docs/en/troubleshooting.md#state-db).
- Only when honk runs with `--store db`, which this guide does not use: a revision honk could not record blocks writes until the next successful activation.

## After sign-in

For interface guides and task procedures, see the [documentation index](https://zakkaus.github.io/doona-docs/en/index.md).

Every configuration-source write goes through the engine. doona sends the hash it read the source at (`If-Match`); a file changed on disk answers 412 and nothing is written. The engine validates the whole source set before saving and reloading, and a failed reload keeps the previous generation active. Dry-run validation never writes, and redacted text is never written back. Runtime settings and group selection are separate endpoints with their own checks.

<a name="pages"></a>

## Pages and the resources they need

![The policies page](https://zakkaus.github.io/doona-docs/screenshots/en/policies-light.webp)

| Page          | Shows                                                                                                                                                                                        | Needs                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Activity | Outbound mode, traffic and memory, active connections, node latency, outbound usage, top clients and notifications | None |
| System status | Engine and eBPF state, traffic counters, backend capabilities, runtime degradations and status as JSON                                                                        | `runtime`                           |
| Connections   | Live connections with source, destination, rule, chain and traffic; close one or all, or edit a matched rule; URL filters                                                     | `connections`                       |
| Routing log   | The routing map and flow records with their trace steps | `flows` |
| DNS | Queries and answers, upstream selection, cache and resolution log; row-level rule creation, matching deletion and cache flush | `dns_query`, `dns_log`, `dns_cache` |
| Policies | Groups, members and health; selection, pinning, probing, editing and check settings | `groups`, `config` |
| Rules | Routing templates, editable routing and DNS rules, and Trace simulation; templates can work without the rules API | `rules`, `dns_rules`, `flows`, `routing_trace` |
| Nodes | Subscriptions and update intervals, inline nodes, add and remove, probe results by kind and shared group editing | `nodes`, `providers` |
| Configuration | Modules, Global settings, Config files with diagnostics, validation and source export, Backups and revisions | `config`; configuration export, import or revision capabilities also allow access |
| Events        | The backend event stream                                                                                                                                                                     | `events`                            |
| Logs          | The log stream with level and module filters, pause and export                                                                                                                               | `logs`                              |
| Settings | Backends, runtime settings, latency probe preferences, geodata sources and files, language, appearance and palette | None |

Every page remains in navigation. A page is marked unavailable only when every resource listed for it in [registry.ts](https://github.com/Zakkaus/doona/blob/main/src/shell/registry.ts) is unavailable; Configuration is also available when the backend offers export, import or revisions. Opening an unavailable page shows a notice. `Ctrl K` (`⌘ K` on macOS) searches pages and live data as well as settings fields and actions, persistent `global` settings, configuration sections and feature entry points; selecting a result opens and focuses its control, without executing the action. See the [search example](https://zakkaus.github.io/doona-docs/en/tour.md#top-bar).

![The rules page](https://zakkaus.github.io/doona-docs/screenshots/en/rules-light.webp)

<a name="widgets"></a>

## Widgets

Activity's dashboard and the floating panel share a widget gallery. Both offer Outbound failures, Node availability, DNS latency and Subscription quota. Subscription quota is not in the default layout. It lists each subscription's expiry and quota meter, or its usage when the provider reports no allowance. Source health also meters usage when a provider reports an allowance.

Memory defaults to a chart. Select Sparkline for a value tile like Download and Upload; dashboard widths range from one fifth of a row to full width. The panel's medium Memory widget shows resident memory and cgroup usage against its limit; its chart starts at the large size.

The memory meter reads cgroup used. It shows no meter for a zero or absent limit and distinguishes an unreported limit from one reported as unset. The Key-value list also names OOM kills when any have occurred. A byte fraction with a shared unit writes it once, such as `70／268 MB`.

- Chart cards at least two thirds of a row wide show each series' peak and average beside the chart. This includes Auto-width traffic cards and value tiles. Wide key-value metric cards show the same statistics beside their readings.
- Wide list widgets with at least four rows use two columns. Long names wrap instead of being cut off. Notices grow with their contents rather than a row-count setting.
- Donuts from two thirds of dashboard width draw larger rings and narrower legends. From half width, node latency puts its lowest and highest values on the legend line. A stacked waffle chart is centred above its legend.
- Narrow donut legends keep names with their values and shares; large panel donuts show every entry without scrolling. Small panel notices take the whole row, and small node latency uses names and values instead of a cramped plot. Narrow area charts omit overlapping time labels.
- Cumulative traffic, DNS answer and network splits offer widths up to half a row. The group switch goes up to two thirds and does not repeat its title. The two splits show every category, with no row-count setting. Saved sizes no longer offered use the nearest available size.
- Panel key-value metric widgets do not offer a large size identical to medium. A waiting sparkline draws its baseline until its second sample; the speed legend keeps its height as rates change.

See the [tour](https://zakkaus.github.io/doona-docs/en/tour.md) for panel movement, pinning, docking and editor scrolling.

![Outbound failures, Node availability and DNS latency cards on Activity](https://zakkaus.github.io/doona-docs/screenshots/en/widgets-health.webp)

## Theme gallery

![Every palette in light and dark](https://zakkaus.github.io/doona-docs/screenshots/palettes.webp)

Light themes use white text on notice badges and warning and information toasts, including yellow notices.

The Glass section has four palettes: Liquid Glass, Glass, Frosted and Tinted. Liquid Glass refracts only in Chromium browsers; Firefox and Safari draw it as Glass.

[Settings > Appearance](https://zakkaus.github.io/doona-docs/en/config-and-settings.md#settings-page) shows the palette boxes and, with a Glass palette selected, the wallpaper, readability veil and blur controls. A custom wallpaper also appears behind the sign-in page.

| Palette | Light | Dark |
| ------- | ----- | ---- |
| Rosé Pine Dawn / Main | [Dawn](https://zakkaus.github.io/doona-docs/screenshots/en/theme-rose-pine-light.webp) | [Main](https://zakkaus.github.io/doona-docs/screenshots/en/theme-rose-pine-main-dark.webp) |
| Rosé Pine Dawn / Moon | [Dawn](https://zakkaus.github.io/doona-docs/screenshots/en/theme-rose-pine-light.webp) | [Moon](https://zakkaus.github.io/doona-docs/screenshots/en/theme-rose-pine-dark.webp) |
| Catppuccin Latte / Frappé | [Latte](https://zakkaus.github.io/doona-docs/screenshots/en/theme-catppuccin-light.webp) | [Frappé](https://zakkaus.github.io/doona-docs/screenshots/en/theme-catppuccin-frappe-dark.webp) |
| Catppuccin Latte / Macchiato | [Latte](https://zakkaus.github.io/doona-docs/screenshots/en/theme-catppuccin-light.webp) | [Macchiato](https://zakkaus.github.io/doona-docs/screenshots/en/theme-catppuccin-macchiato-dark.webp) |
| Catppuccin Latte / Mocha | [Latte](https://zakkaus.github.io/doona-docs/screenshots/en/theme-catppuccin-light.webp) | [Mocha](https://zakkaus.github.io/doona-docs/screenshots/en/theme-catppuccin-dark.webp) |
| Nord | [Snow Storm](https://zakkaus.github.io/doona-docs/screenshots/en/theme-nord-light.webp) | [Polar Night](https://zakkaus.github.io/doona-docs/screenshots/en/theme-nord-dark.webp) |
| Kary Pro Colors | [Light](https://zakkaus.github.io/doona-docs/screenshots/en/theme-kary-light.webp) | [Dark](https://zakkaus.github.io/doona-docs/screenshots/en/theme-kary-dark.webp) |
| Ant Design | [Default](https://zakkaus.github.io/doona-docs/screenshots/en/theme-antd-light.webp) | [Dark](https://zakkaus.github.io/doona-docs/screenshots/en/theme-antd-dark.webp) |
| Arco Design | [Light](https://zakkaus.github.io/doona-docs/screenshots/en/theme-arco-light.webp) | [Dark](https://zakkaus.github.io/doona-docs/screenshots/en/theme-arco-dark.webp) |
| Semi Design | [Light](https://zakkaus.github.io/doona-docs/screenshots/en/theme-semi-light.webp) | [Dark](https://zakkaus.github.io/doona-docs/screenshots/en/theme-semi-dark.webp) |
| Liquid Glass | [Light](https://zakkaus.github.io/doona-docs/screenshots/en/theme-glass-light.webp) | [Dark](https://zakkaus.github.io/doona-docs/screenshots/en/theme-glass-dark.webp) |
| Glass | [Light](https://zakkaus.github.io/doona-docs/screenshots/en/theme-glass-clear-light.webp) | [Dark](https://zakkaus.github.io/doona-docs/screenshots/en/theme-glass-clear-dark.webp) |
| Frosted | [Light](https://zakkaus.github.io/doona-docs/screenshots/en/theme-glass-frosted-light.webp) | [Dark](https://zakkaus.github.io/doona-docs/screenshots/en/theme-glass-frosted-dark.webp) |
| Tinted | [Light](https://zakkaus.github.io/doona-docs/screenshots/en/theme-glass-tinted-light.webp) | [Dark](https://zakkaus.github.io/doona-docs/screenshots/en/theme-glass-tinted-dark.webp) |
| Qiangguo | [Day shift](https://zakkaus.github.io/doona-docs/screenshots/en/theme-qiangguo-light.webp) | [Night shift](https://zakkaus.github.io/doona-docs/screenshots/en/theme-qiangguo-dark.webp) |

## Settings stored in the browser

![Storage boundaries between localStorage, sessionStorage and honk](https://zakkaus.github.io/doona-docs/images/storage-boundary.svg)

`localStorage` holds this origin's preferences, layouts and connection profiles, including the Token, and the password sign-in session token. The session is shared by every tab and lasts until you sign out, honk answers 401 or its profile is deleted; closing a tab does not end it. `sessionStorage` keeps only per-tab state, such as each section's last page. honk stores the backend configuration and manages password sessions; it limits a session to 12 hours and forgets sessions when it restarts. Clearing browser data loses the saved profiles, preferences and session token, not honk's configuration.

In token mode, requests send the saved Token in `Authorization`; a pairing link may carry it in the URL fragment, removed on load. For storage keys, see [storage.ts](https://github.com/Zakkaus/doona/blob/main/src/api/storage.ts).

The saved theme and language are applied before the first paint, so a reload does not flash the default look.

Settings > Appearance places Date format and Time format next to Language. Date format defaults to Automatic (browser region), independent of the interface language. Day/Month/Year, Month/Day/Year and Year-Month-Day override the browser's order.

Time format defaults to 24-hour. 12-hour uses the interface language's AM/PM words; Automatic (browser region) follows the regional clock. It applies to every page time, including chart axes and the log heatmap, and works with each date format. The choices are saved in this browser.

Over HTTPS or on localhost a service worker precaches the application shell and caches fonts and icons, so the pages open offline and the site can be installed as an app. API responses are never cached. See [SECURITY.md](https://github.com/Zakkaus/doona/blob/main/.github/SECURITY.md) for reporting a vulnerability.

Sign-in does not download the other pages before authentication. Installing an update does not download files the page already has.

![The activity page in dark mode](https://zakkaus.github.io/doona-docs/screenshots/en/activity-dark.webp)
