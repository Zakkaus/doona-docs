English / [简体中文](../zh-CN/observe.md) / [繁體中文](../zh-TW/observe.md)

<a name="observe"></a>

# Watching traffic

This page covers the Activity hub (Activity and System status) and the Monitor hub (Connections, Routing log, DNS, Logs and Events). For each page it lists what the page shows, what you can do there and where its links lead.

<a name="activity"></a>

## Activity

Activity is the page doona opens by default; change Open at startup in [Appearance](config-and-settings.md#settings-page) to choose another page. Some cards link to their details; Outbound mode and Global outbound hold controls instead.

### Getting started

When setup is incomplete and the backend provides the required data, Getting started shows three steps:

1. Add a subscription or nodes. Add subscription opens the dialog on [Nodes](routing.md#nodes); adding a subscription or a proxy node completes this step.
2. Choose routing rules. Choose rules opens Rules. An applied template or custom routing completes this step.
3. Check the connection. Check connection opens [Policies](routing.md#policies). Measure the selected node; a successful latency result for a node selected by a group completes this step.

The steps update automatically. The card hides when all three are complete or you press the close icon. doona remembers this in the browser.

### Outbound mode

1. In the Outbound mode card, select Rule, Direct or Global.
2. For Global, choose an outbound in the Global outbound card. Until one is chosen, Apply stays disabled and the card shows Global mode needs an outbound. Choosing an outbound also selects Global.
3. Select Apply beside the changed mode or outbound. doona writes the change into the main configuration and reloads it, and a toast confirms the new mode. Selecting a mode without Apply changes nothing.

If the card shows Read-only, doona cannot write the main configuration. Select Read-only to see the reason, then see [read-only sources](troubleshooting.md#read-only). If it shows Not provided by this backend, the backend does not offer a configuration this card can edit.

### Cards

1. The status card shows the engine state. When some features are off, select the feature count (for example, 2 features are off) to open Features that are off on System status. View details opens System status.
2. Select the Download or Upload tile to open the Traffic tab of Connections. Select Active connections to open the connection list.
3. The Latency card follows a policy group’s selected node. Open the node-name menu to choose Automatic, which follows the group with the most active connections, or a specific group. doona remembers the choice in this browser; it changes only the card. The info button explains the choice. Select the latency value to open that node on [Nodes](routing.md#nodes).
4. Select the CPU usage value to open System status.
5. In the Traffic card, choose Live, 10 min, 1 h, 6 h, 24 h or 7 d.
6. In Outbound downloads, select an outbound to open Connections filtered to it. The chart counts downloads since the time shown beside its title; it does not show current rates.
7. In Top traffic, switch between Devices and Domains. Select a device to open Connections filtered to that device, or a domain to open Connections searched for it. The ranking covers visible connections only; Truncated means the connection list was cut short.
8. The Memory card charts process memory over time. Its View details also opens System status.
9. Notifications lists recent notices and setup notices for missing node sources or routing rules. Their actions open Nodes or Rules. Consecutive identical notices fold into one row with a count. View all opens Events.

CPU usage and Latency also draw sparklines once two samples are available. Latency leaves failed probes as gaps and starts over when its group changes. Settings > Appearance controls metric-tile sparklines. Edit dashboard changes the cards and their displays; an empty outbound chart keeps its labels without an empty tooltip target.

If a runtime read fails, the last figures are muted until a read succeeds.

<a name="overview"></a>

## System status

Open System status from the navigation, or from View details or the CPU usage value on Activity. The header shows the engine state, Config version, Uptime, CPU usage and Last reload. Config version identifies the configuration revision in effect; it is not the `generation` number.

1. Engine shows the engine version, API, Build, Instance, Started and Configuration activated. A badge shows the backend's profile: Base or Full observability.
2. Traffic counters shows TCP connections, UDP connections, Total connections, Upload, Download and Rate interval. The line below gives the counter start time and whether the counters cover all traffic or visible traffic.
3. Memory shows Resident memory, the cgroup figures and OOM events, where the backend reports them. A cgroup usage bar appears when a cgroup limit is known.
4. Datapath shows the checks of the eBPF programs, hooks and maps in the kernel, and an Attachments table. Datapath errors and runtime degradations appear as warnings under the card.
5. Backend features lists the features the backend provides. Select one to open the page that uses it.
6. Features that are off appears only when some features are off. Each row names the cause and the affected features. How to turn on shows the settings to add; Possible causes explains why; other rows link to Temporary runtime overrides or Geodata in Settings, or to this guide.
7. Select Export state JSON to download the reported state. Reload, Suspend and Resume appear only when the backend allows them; a toast reports each result.

<a name="connections"></a>

## Connections

Connections opens on the Traffic tab. A link that filters the list or selects a connection opens the Connections tab instead.

### Traffic tab

1. Traffic per connection plots each connection: horizontal is upload, vertical is download. Select a point to open that connection in the Connections tab.
2. Node latency places nodes at their latest reported latency and separates nodes In use from nodes Not in use. This is not limited to TCP probes.

### Connections tab

1. The default columns are Target, Device, Node, Rule, State, Download, Download rate and Started. Use Columns to show or hide columns. Select a sortable heading to sort.
2. Type a domain, IP, device or process in Filter. The text also matches the outbound, chain and rule. Use Network protocol, Outbound or Select (a device or a rule) to narrow the list. On narrow screens these filters sit under Filters.
3. Use Group by to group By device, by Outbound or None. Expand all and Collapse all fold every group. Clear filters removes all filters.
4. A notice appears when the list is truncated. Partial connection visibility or No connection visibility means an empty list does not prove the device has no connections.
5. Select Export CSV to download the filtered list.
6. Select a row to open its detail panel: state, target, device, process, observation source, Outbound, Chain and Rule.
7. Use a row's add-rule icon to open the [rule dialog](routing.md#add-rule). A disabled icon shows the tooltip This connection has no domain or IP address to match. The detail panel also offers Add rule when available. The toolbar has no add-rule button.
8. More actions offers, when available:
   - Show matched rule: opens the rule on the [Rules](routing.md#rules) page.
   - Edit matched rule's outbound settings: opens Edit rule on the Rules page, where the conditions and target can be changed.
   - View flow: opens the flow record in Routing log.
   - Trace this connection: opens the Trace tab on the Rules page with this connection's input; see [Trace](routing.md#trace).
   - Only this device: filters the list to the connection's device.
   - Close connection: closes the connection. It is disabled for connections observed only by eBPF, because the kernel forwards them and the backend has no userspace transfer to interrupt.
9. Select Close all and confirm. With only a device and network filter, doona closes every matching connection, including ones opened after the dialog. Any other filter, or a truncated list, closes the listed connections one by one. Kernel-direct connections are skipped, and a toast reports how many were closed and skipped.

The device and rule menus list all choices and offer search when there are more than 12. Outbound also supports search.

<a name="flows"></a>

## Routing log

Routing log shows how honk routed recorded flows. It has two tabs: Map and Records.

### Map

1. The Connection topology card draws the paths from rules or devices to outbounds and nodes, with the number of flows kept. Switch between By rule and By device.
2. Select an item in the map to pin its path.
3. Select Show the N flows on this path to open Records filtered to that path. Clear path filter removes the pin.

### Records

1. Filter by Network protocol (All, TCP or UDP) and by State. A path or connection filter appears as a chip (Path: … or Connection: …); select the chip to remove it. Observation coverage appears when part of the traffic was not fully observed.
2. The columns are Target, Node, Rule, Protocol, State and Started.
3. Select a flow to open its detail panel. It shows whether the trace is Complete or Partial, the configuration revision, State, Outbound, Node, Rule and, for a partial trace, Why incomplete. The ordered trace steps follow.
4. In the detail panel, select View connection to open the live connection, if it still exists.
5. Use a record's add-rule icon to open the [rule dialog](routing.md#add-rule). A disabled icon shows the tooltip This flow has no domain or IP address to match. The toolbar and detail panel have no add-rule action.
6. Recording settings opens Temporary runtime overrides in Settings, where flow recording is configured; see [runtime overrides](config-and-settings.md#runtime-options).

<a name="dns"></a>

## DNS

DNS has up to four tabs, in this order: Statistics, Resolution log, Cache and Query. Only the tabs the backend supports appear.

1. Statistics summarises the latest page of the resolution log: Median, P95, Cache hit rate and Failure rate, then upstream latency, Outcomes, Cache and Top queries.
   - Open DNS configuration opens the configuration's `dns` section on the [Configuration](config-and-settings.md#config-page) page.
   - View cache opens the Cache tab.
   - In Top queries, switch between Devices and Domains. Select an entry to open Resolution log filtered to it.
2. Resolution log lists recent resolutions with Time, Domain, Type, Device, Result, Upstream and Elapsed.
   - Filter by Domain, Type or Device.
   - Select a row to see its answers, cache status and route. Use the row's add-rule icon to open a DNS request rule under Rules > DNS rules > Request rules. When DNS rules are unavailable, it opens a routing rule. The initial condition matches the exact domain. Choose Domain suffix to include subdomains.
   - Refresh loads the newest records. When newer records are waiting, a note says so; Refresh replaces the loaded records.
   - Load older records extends the list. Export CSV covers only the loaded records.
3. Cache lists entries with Domain, Type, State, Expires and Stale until.
   - Cache is kept in memory only and cleared on restart.
   - Use an entry's add-rule icon to open the same rule dialog as in Resolution log.
   - When the backend supports deletion, use an entry's delete icon to remove it immediately.
   - For bulk deletion, choose Match by (Full domain, Domain suffix, Domain keyword or Domain regex), enter Pattern and optionally select Type. Delete matching shows the matching count before confirmation. Available matches depend on backend deletion support; exact-name deletion also works when cache listing is unavailable.
   - Clear all cache removes every entry after a confirmation, when the backend supports it. This cannot be undone.
4. Query sends a DNS query through honk's DNS routing.
   - Enter a domain, choose a Type, then select Query. Turn on Bypass cache to query without using a cached answer. It is off by default.
   - When readable configuration defines `dns.upstream`, Upstream offers Automatic, which follows `dns.routing`, or one of those named upstreams.
   - The result shows Cache hit or Cache miss, State, Upstream, Route source, Route rule, Elapsed and the answers.
   - These queries are diagnostic: they do not appear in Resolution log.
   - Add rule opens a DNS request rule for the name, or a routing rule for an answer address. View cache opens the matching cache entries.

<a name="logs"></a>

## Logs

Logs shows the engine's live log stream.

1. Set Level to the minimum severity to show. Beside it, Engine records: … and above shows the level the engine records; levels below it are marked as needing a lower log level in Settings.
2. Type a module prefix in Module to filter by module.
3. Log activity over time charts the received records by level. Select a level in the chart to make it the minimum.
4. Turn on Pause to hold the list. The status shows how many new records have arrived; they appear when you turn Pause off. Only the newest records are kept while paused.
5. Clear removes the displayed records from this page. Export downloads the received records as a text file.
6. Recording settings opens [Temporary runtime overrides](config-and-settings.md#runtime-options) in Settings, where log recording and the log level are set.
7. Select a row to read the whole message. The status shows Streaming, Reconnecting or Disconnected. On reconnection, retained records are replayed; if replay is no longer possible, the list marks the gap.

If the list shows Log recording is disabled in the configuration, change the honk configuration; see [configuration](configuration.md#config). If it shows Turn on log recording in Settings first, turn it on under Recording settings.

<a name="events"></a>

## Events

Events shows the backend's event stream, newest first.

1. Kind starts at Exclude runtime updates. Choose All kinds, or one kind the backend advertises.
2. The list shows Time, Kind and Summary. The toolbar shows the connection state, the number of events kept and, when available, Resumes from the last position.
3. Select an event to read its full summary. A Configuration activated event links to View configuration. A Flow records lost event links to View flow record and Recording settings.
4. Select Export JSON to download the events currently shown.

After a disconnection, retained events are replayed. If the replay cursor has expired, a row in the list marks the lost events.
