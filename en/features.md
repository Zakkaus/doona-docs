<a name="features"></a>

# Find the right page

Find a task in the standard edition of doona. For a first setup, follow [Quick start](https://doona.daeuniverse.org/en/quick-start.md) and [Route your first connection](https://doona.daeuniverse.org/en/tutorial.md); for the smaller interface, see [doona lite](https://doona.daeuniverse.org/en/lite.md).

Validate routing from a real LAN client using working nodes: test direct and proxied TCP, UDP and DNS. `honk-core is running`, the `dae0` link and a reachable API do not prove that traffic flows.

<a name="pages"></a>

## Pages

| Page | What to do there | Availability |
| --- | --- | --- |
| [Activity](https://doona.daeuniverse.org/en/observe.md#activity) | Watch traffic, memory, connections and node health on a dashboard. | [Live metrics](https://doona.daeuniverse.org/en/feature-requirements.md#req-runtime-status), [history](https://doona.daeuniverse.org/en/feature-requirements.md#req-traffic-history) |
| [System status](https://doona.daeuniverse.org/en/observe.md#overview) | Check the engine, datapath and explanations for limited features. | [Runtime status](https://doona.daeuniverse.org/en/feature-requirements.md#req-runtime-status) |
| [Connections](https://doona.daeuniverse.org/en/observe.md#connections) | Inspect live connections, their routing and traffic; close connections or open their matched rule. | [Connection actions](https://doona.daeuniverse.org/en/feature-requirements.md#req-connections) |
| [Routing log](https://doona.daeuniverse.org/en/observe.md#flows) | Inspect recorded flows and the routing map to understand previous routing decisions. | [Flow recording](https://doona.daeuniverse.org/en/feature-requirements.md#req-flows) |
| [DNS](https://doona.daeuniverse.org/en/observe.md#dns) | Query a name, inspect answers and cache entries, or read the resolution log. | [Queries](https://doona.daeuniverse.org/en/feature-requirements.md#req-dns-query), [cache](https://doona.daeuniverse.org/en/feature-requirements.md#req-dns-cache), [log](https://doona.daeuniverse.org/en/feature-requirements.md#req-dns-log) |
| [Nodes](https://doona.daeuniverse.org/en/routing.md#nodes) | Add subscriptions or node links, refresh sources and test nodes. | [Node management](https://doona.daeuniverse.org/en/feature-requirements.md#req-nodes), [subscription refresh](https://doona.daeuniverse.org/en/feature-requirements.md#req-subscription-refresh), [probes](https://doona.daeuniverse.org/en/feature-requirements.md#req-probes) |
| [Policies](https://doona.daeuniverse.org/en/routing.md#policies) | Choose a group's member or edit its selection policy and membership. | [Selection](https://doona.daeuniverse.org/en/feature-requirements.md#req-group-selection), [editing](https://doona.daeuniverse.org/en/feature-requirements.md#req-group-edit) |
| [Rules](https://doona.daeuniverse.org/en/routing.md#rules) | Apply a routing template, edit routing or DNS rules, and simulate a route. | [Rules and templates](https://doona.daeuniverse.org/en/feature-requirements.md#req-rules), [Trace](https://doona.daeuniverse.org/en/feature-requirements.md#req-routing-trace) |
| [Configuration](https://doona.daeuniverse.org/en/config-and-settings.md#config-page) | Open configuration modules, edit files or global settings, and manage backups and revisions. | [Editing](https://doona.daeuniverse.org/en/feature-requirements.md#req-config-edit), [validation](https://doona.daeuniverse.org/en/feature-requirements.md#req-validation), [revisions](https://doona.daeuniverse.org/en/feature-requirements.md#req-revisions) |
| [Events](https://doona.daeuniverse.org/en/observe.md#events) | Inspect backend events. | [Event stream](https://doona.daeuniverse.org/en/feature-requirements.md#req-events) |
| [Logs](https://doona.daeuniverse.org/en/observe.md#logs) | Read, filter, pause and export engine logs. | [Log recording](https://doona.daeuniverse.org/en/feature-requirements.md#req-logs) |
| [Settings](https://doona.daeuniverse.org/en/config-and-settings.md#settings-page) | Manage backend profiles, temporary overrides, geodata, probe preferences and appearance. | The page opens without a backend. See [runtime overrides](https://doona.daeuniverse.org/en/feature-requirements.md#req-runtime-options), [geodata](https://doona.daeuniverse.org/en/feature-requirements.md#req-geodata) and [browser settings](https://doona.daeuniverse.org/en/feature-requirements.md#req-browser-settings) for its controls. |

<a name="still-missing"></a>

## When a page or action is unavailable

Pages stay in navigation even when the backend cannot provide their data. Open **System status** to read the feature limitations, or open the help beside a disabled action. Follow the matching requirement link in the table before changing the backend.

For an editing refusal, see [read-only sources](https://doona.daeuniverse.org/en/troubleshooting.md#read-only). For sign-in errors, see [sign-in troubleshooting](https://doona.daeuniverse.org/en/troubleshooting.md#sign-in).

<a name="widgets"></a>

## Dashboard and floating panel

Activity and the floating panel share a widget gallery. Choose cards for the values you need, such as traffic, memory, node availability, DNS latency or subscription quota. See the [Activity guide](https://doona.daeuniverse.org/en/observe.md#activity) for the dashboard and the [panel guide](https://doona.daeuniverse.org/en/tour.md#panels) for arranging the floating panel.

### Read quota and memory

**Subscription quota** is not in the default layout. Add it to see expiry and an allowance meter, or usage when the backend reports no allowance.

**Memory** defaults to a chart; **Sparkline** provides a value tile. In the floating panel, medium size shows resident memory and cgroup usage against its limit; the chart starts at large size. The meter uses cgroup usage and omits a zero or missing limit. The display distinguishes an unreported limit from an unset one, and **Key-value list** identifies reported OOM kills.

### Choose a size

Dashboard widths range from one fifth to full width. Cumulative traffic and DNS and network splits stop at half width; the group switch stops at two thirds. Unsupported saved sizes use the nearest available size. Metric widgets in the panel omit a redundant large size.

At two thirds width, charts and wide metric lists show peak and average values. Wide lists with at least four rows use two columns. Node latency adds its range at half width. Large donuts enlarge the ring and narrow the legend; large panel donuts show every entry. Narrow legends retain names, values and shares. Small panel notices take a full row, and small node latency uses names and values.

Long names wrap, notices grow to fit their content, and DNS and network splits show every category. Narrow area charts omit overlapping time labels. Waiting sparklines show a baseline until a second sample arrives.

<a name="theme-gallery"></a>

## Settings stored in the browser

Compare the [palette gallery](https://doona.daeuniverse.org/screenshots/palettes.webp), then change [appearance settings](https://doona.daeuniverse.org/en/config-and-settings.md#appearance).

For language, appearance, date and time formats, startup page and probe preferences, use [Settings](https://doona.daeuniverse.org/en/config-and-settings.md#settings-page). To distinguish browser preferences from saved configuration and temporary backend changes, see [where changes are stored](https://doona.daeuniverse.org/en/what-doona-can-change.md).

This origin’s `localStorage` keeps profiles, tokens, preferences and layouts. Clearing browser data removes those saved browser values, not honk’s configuration. `sessionStorage` keeps per-tab state such as each section’s last page. Token requests use `Authorization`; doona removes a pairing token from the URL fragment on load.

Over HTTPS or on localhost, a service worker caches the application shell, fonts and icons, never API responses. The interface can then open offline, and you can install it as an app. Saved theme and language apply before the first paint. doona does not download other pages before authentication. Installing an update reuses files already available to the page.

See [SECURITY.md](https://github.com/Zakkaus/doona/blob/main/.github/SECURITY.md) to report a vulnerability.
