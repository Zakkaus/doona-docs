<a name="common-tasks"></a>

# Common tasks

This page collects short procedures for frequent changes to routing, traffic inspection and honk maintenance. Each procedure states the result to expect and links to the section that describes the page in detail.

<a name="one-site"></a>

## Send one site through a proxy from a live connection

1. Open Monitor > Connections and select the Connections tab.
2. Find a connection to the site in the list.
3. Use that row's add-rule icon to open the Add rule dialog.
4. Set Match by to Full domain.
5. Set Outbound to the proxy group. The dialog shows the connection's current outbound and the rule preview.
6. Check Insert. If the dialog says earlier rules may still match this traffic first, choose an earlier position.
7. Select Apply to write the rule and reload now, or Hold to write it later with the counted apply button in the top bar.

After Apply, a notice says the new rule is in effect. In Rule mode, new connections that match use the new outbound unless an earlier rule matches them first; existing connections keep their route until they reconnect. The dialog has no Lock this outbound switch, so Global and Direct mode still override this rule; to keep the route in those modes, add the rule under Routing > Rules with Lock this outbound turned on. See [the held list](https://zakkaus.github.io/doona-docs/en/routing.md#held-rules) and [the Add rule dialog](https://zakkaus.github.io/doona-docs/en/routing.md#add-rule).

<a name="domain-family"></a>

## Send a domain and its subdomains through a group

1. Open Routing > Rules and select the Routing rules tab. Choose Advanced if the view switch is shown.
2. Select Add rule. The Add rule dialog opens with Condition form set to Select.
3. Set Match by to Domain suffix and enter the domain in Values. Separate several domains with commas.
4. Set Outbound to the group.
5. Turn on Lock this outbound if the rule must also apply in Global or Direct mode.
6. Set Insert to a position before any rule that would match the same traffic first.
7. Select Add rule in the dialog.

doona writes the rule to its source file and reloads. A notice says the new rule is in effect; existing connections keep their route until they reconnect. See [Routing, nodes and rules](https://zakkaus.github.io/doona-docs/en/routing.md#add-rule).

<a name="device-bypass"></a>

## Make a device bypass the proxy

The rule matches the device's source IP address, so the device needs a fixed address.

1. On Routing > Rules, open Routing rules. If the view switch appears, change to Advanced.
2. Select Add rule above the list.
3. Set Match by to Source IP and enter the device's IP address in Values.
4. Set Outbound to direct.
5. Turn on Lock this outbound so that Global mode does not override the rule.
6. Set Insert to a position before any rule that would match this address first.
7. Submit the device rule with Add rule in the dialog.

After the write, new connections from that address go direct; existing connections keep their route until they reconnect. See [the rule dialog](https://zakkaus.github.io/doona-docs/en/routing.md#add-rule).

<a name="group-node"></a>

## Pick a group's node and return to automatic selection

1. Open Routing > Policies.
2. Find the group's card.
3. Select a node in the card's node grid. A notice confirms the selection. If the node is pinned, the notice says the automatic policy is paused; otherwise it says whether existing connections were kept or interrupted.
4. If the notice says the node is pinned and the automatic policy is paused, open the card's More actions menu and select Back to automatic to resume it.

After Back to automatic, a notice names the member the group now uses; see [policy groups](https://zakkaus.github.io/doona-docs/en/routing.md#policies).

<a name="subscription"></a>

## Add and refresh a subscription

1. Open Routing > Nodes.
2. Select Add subscription above the Node sources table. A dialog opens.
3. Enter Name and Subscription URL, then select Add.
4. To update later, select the update button in the subscription's row of the Node sources table.

After Add, doona selects the new row. If the backend can refresh subscriptions, doona refreshes it at once and the notice gives the node count or the failure. See [sources and nodes](https://zakkaus.github.io/doona-docs/en/routing.md#nodes).

<a name="global-mode"></a>

## Switch to global mode and choose an outbound

1. Open Activity.
2. On the Outbound mode card, select Global.
3. On the Global outbound card, choose an outbound.
4. Select Apply on the Outbound mode card.

doona writes the mode and outbound to the main configuration and reloads. A notice confirms the mode. See [Watching traffic](https://zakkaus.github.io/doona-docs/en/observe.md#activity).

<a name="why-outbound"></a>

## Find out why a connection took an outbound

1. Open Monitor > Connections, select the Connections tab and select the connection.
2. Read Outbound, Chain and Rule in the detail panel.
3. To open the matched rule, open More actions in the detail panel and select Show matched rule. Routing > Rules opens with the rule selected.
4. To test the route, open More actions and select Trace this connection. Trace simulation opens with the connection's details filled in.
5. Select Run trace.

The trace simulates routing with the current configuration; it does not replay the connection. See [Watching traffic](https://zakkaus.github.io/doona-docs/en/observe.md#connections) and [Routing, nodes and rules](https://zakkaus.github.io/doona-docs/en/routing.md#trace).

<a name="dns-resolution"></a>

## Check how a domain resolves

1. Open Monitor > DNS and select the Query tab.
2. Enter the domain in Domain and choose a Type. When Upstream is available, keep Automatic to follow `dns.routing`, or choose an upstream from `dns.upstream`. Select Query.
3. Read the result card: the cache status, State, Upstream, Route source, Route rule, Elapsed and the answers.
4. To see earlier resolutions, select the Resolution log tab and select a row for its details.

The [DNS guide](https://zakkaus.github.io/doona-docs/en/observe.md#dns) describes the result fields and log controls.

<a name="update-geodata"></a>

## Update geodata

1. Open Settings > Settings.
2. In the Geodata card, select Update now next to Status when available. The card also lists the geodata files.

The update downloads the files and verifies them when checksum verification is enabled. Changed files replace the existing ones and the configuration reloads; identical files are not rewritten. An entirely unchanged update succeeds without activation or reload. A notice reports the result. Reset to defaults asks for confirmation, then removes geodata overrides and values taken from the configuration file so the built-in sources and defaults apply again. See [Config and settings](https://zakkaus.github.io/doona-docs/en/config-and-settings.md#geodata) and [Troubleshooting](https://zakkaus.github.io/doona-docs/en/troubleshooting.md#geodata-update).

<a name="reload-honk"></a>

## Reload honk after editing files outside doona

1. In the top bar, select Reload honk. On a narrow screen, open More options and select Reload honk.
2. In the Reload honk? dialog, select Reload honk.

honk reads its configuration files again and reloads. Held rules are not written. A setting that needs a restart does not take effect until honk restarts; see [Configuration](https://zakkaus.github.io/doona-docs/en/configuration.md#config). The top bar is described in the [Interface tour](https://zakkaus.github.io/doona-docs/en/tour.md#top-bar).

<a name="changed-on-disk"></a>

## Resolve a file that changed on disk while you edited it

1. Open Settings > Configuration and select the Config files tab.
2. Choose the file in Config file. If the file changed on disk after you started editing, an alert says so and Apply is disabled.
3. To keep the change on disk, select Cancel. Your draft is discarded and the editor shows the file as it is now.
4. To replace the change on disk with your draft, select Keep changes, then select Apply.

Keep changes does not merge the two versions; Apply writes your draft over the file. See [Config and settings](https://zakkaus.github.io/doona-docs/en/config-and-settings.md#edit-source).
