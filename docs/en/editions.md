[繁體中文](../zh-TW/editions.md) / [简体中文](../zh-CN/editions.md) / English

<a name="editions"></a>

# Standard edition and doona lite

The standard edition manages configuration and observes traffic. Choose it for traffic dashboards, connection controls, logs, advanced routing traces or editing multiple configuration sources.

doona lite focuses on configuration: nodes, subscriptions, groups, routing, DNS and global settings. Choose it for task-specific forms, sharing manual nodes and reviewing configuration drafts without traffic pages.

<a name="editions-compare"></a>

## Compare features

Features depend on the resources and permissions honk advertises; an unavailable backend capability cannot be enabled by changing editions.

| Feature | Standard edition | doona lite |
| --- | --- | --- |
| Traffic monitoring | Activity, System status, Connections, Routing log, Logs and Events | No traffic pages |
| Widgets | Activity widgets and floating or docked widgets | No |
| Close connections; export events | Yes | No |
| Routing tests | Rules → Trace simulation, with advanced traffic fields and resolution options | Routing → Test rules, with matched rules and outbounds; uses the same routing trace API |
| DNS queries, Resolution log, Statistics and Cache | Yes | No standalone query or observation pages; DNS resolution is used in routing tests |
| Nodes, subscriptions and group selection | Yes; groups are under Policies | Yes; separate Nodes, Subscriptions and Groups pages |
| Multi-line share-link import | Yes | Yes, through Add node → Paste links |
| Share links and QR codes | No dedicated sharing dialog | Manual nodes and subscription links; subscription nodes cannot be shared |
| Rename a subscription | Yes, with an option to update group references | No; its name is fixed after creation |
| Group editing | Group form and full source editor | Group form, group text editor, duplicate group and copy members between groups |
| Routing and DNS rules | Forms and full source editor | Forms, reorder controls and per-page visual/text modes |
| DNS upstream presets | Edit upstreams in the source editor; no preset form | Custom upstreams and Ali DNS, DNSPod and Cloudflare presets |
| Global settings | Configuration → Global settings | Settings dialog; restart-only values are read-only with Copy |
| Configuration sources | Select and edit main/include sources; create sources and inspect diagnostics | Edits main only; no full source editor |
| Export configuration | Export the selected source | Export the applied main or the current page’s unsaved draft |
| Backend management | Multiple profiles, sign-out, temporary runtime overrides and geodata management | No corresponding management screens |
| Server configuration backups and revisions | Available when honk advertises the x-honk extensions | No |
| Themes and sign-in | Light/dark themes and palettes; administrator credentials or token | Light, dark or system theme, no palette selector; same honk credentials |

<a name="backend-requirements"></a>

## Backend requirements

Use the native-API honk build in [Requirements](requirements.md#honk-version). Both editions discover authentication through `GET /api` and read `GET /api/v1/capabilities`; password mode uses `POST /api/v1/auth/setup` or `POST /api/v1/auth/login`. Other endpoints are needed for the features below, rather than every connection. Paths in this table start with `/api/v1`.

| Feature | honk resources and endpoints | Editions |
| --- | --- | --- |
| Configuration editing | `config` read/write, `config_validate` and `operations`; `GET /config`, `POST /config/validate`, `PUT /config/sources/{source_id}`, `GET /operations/{operation_id}` | Both; lite requires `full` validation and complete, hash-matching, writable main content. Standard source editing validates when supported. lite’s share-link import also needs `syntax` validation. |
| Nodes, subscriptions and groups | `nodes`, `providers`, `groups`; `GET /nodes`, `GET /providers`, `GET /groups`, `GET /groups/{group_id}`, `POST /providers/{provider_id}/refresh`, `PUT`/`DELETE /groups/{group_id}/selection`; `probes` via `POST /probes` | Both; lite edits declarations through main source replacement. The standard edition also uses node/provider create/delete and group configuration endpoints. |
| Status and service commands | `runtime`, `operations`, and the advertised `reload`/`suspend`/`resume` capabilities; `GET /runtime`, `GET /version` (standard edition), `POST /operations/reload`, `/operations/suspend`, `/operations/resume`, plus operation polling | Both; lite uses status in the shell rather than a traffic dashboard. |
| Routing tests | `routing_trace` via `POST /routing/trace`; `rules` via `GET /rules`; `dns_query` via `POST /dns/query` for name resolution when needed | Both; honk’s resolution modes determine the available tests. |
| Traffic and DNS observations | `traffic_history`, `memory_history`, `runtime_memory`, `runtime_outbounds`, `datapath`, `connections`, `flows`, `events`, `logs`, `dns_log`, `dns_cache`, `dns_query`; `GET /runtime/traffic/history`, `/runtime/memory/history`, `/runtime/memory`, `/runtime/outbounds`, `/datapath`, `/connections`, `/flows`, `/events`, `/logs`, `/dns/log`, `/dns/cache`, `/dns/rules`, plus `POST /dns/query` and connection/cache deletion when writable | Standard edition |
| Source and backend management | `POST /config/sources`; `geodata` via `GET /geodata` and `POST /geodata/update`; `runtime_settings` via `GET`/`PATCH /runtime/settings`; `POST /auth/logout` | Standard edition |
| Server backups and revisions | The advertised `x-honk` configuration export/import/revisions extensions, under `/x-honk/config/` | Standard edition; requires those extensions, beyond the base contract |

lite reuses the standard edition’s `src/api/client.ts` and models backed by the generated `src/api/types.ts`; it has its own UI and state. The [OpenAPI contract](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/openapi.yaml) defines the endpoint schemas. See [common lite tasks](lite-tasks.md) for the editing prerequisites in user terms.

<a name="editions-switch"></a>

## Install and switch editions

Use [Quick start](quick-start.md) for the embedded standard edition, [doona lite](lite.md#lite-install) to switch to lite, or [install UI files separately](install.md) to serve a directory.

## Browser settings

Both editions use the same honk native API and configuration. Configuration changes are shared, but each edition keeps its browser settings separately.

## Demos

Try the [standard edition demo](https://demo.daeuniverse.org/) or the [doona lite demo](https://demo.daeuniverse.org/lite/).
