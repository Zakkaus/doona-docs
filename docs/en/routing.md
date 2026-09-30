English / [简体中文](../zh-CN/routing.md) / [繁體中文](../zh-TW/routing.md)

<a name="routing"></a>

# Routing, nodes and rules

This page covers the Routing hub: the Policies, Nodes and Rules pages. It explains how to choose group members, manage subscriptions, read and change rules, hold rules for a later apply, and simulate a route with Trace.

<a name="policies"></a>

## Policy groups

Open the Routing hub, then Policies. The Groups tab shows one card per group.

### Read a group card

1. The card header shows the group name, its policy, and the number of available, unavailable and untested members.
2. Expand Configuration to see the group's settings, such as Check URL, Check interval and Tolerance.
3. The member grid below shows each member with its state or latency. A group with more than 12 members adds Filter nodes, Region, Sort (By latency or By name) and Available only above the grid.

### Choose a member

1. In a group with the Manual policy, choose a member in the grid. The group switches to it at once.
2. In an automatic group whose backend allows overrides, choosing a member pins it. The state changes from Automatic to Pinned, and the toast says the automatic policy is paused.
3. To end the pin, open More actions on the card and choose Back to automatic. This item appears only while the group is pinned. The toast names the member the policy now selects.
4. When the selector labelled Both, TCP and UDP is shown, choose the network first. With Both, a selection, a pin or Back to automatic applies to TCP and UDP; with TCP or UDP, it applies to that network only.
5. When the card shows Interrupt existing connections on switch, that switch sets whether a member switch closes existing connections. Changing it writes the group's configuration and reloads. After you choose a member in a Manual group, the toast says whether existing connections were kept or interrupted.

### Test, edit and check settings

All three commands are in the card's More actions.

1. Choose Test all to probe every member. A toast reports the available, unavailable and unknown counts and whether the selection changed. The item is disabled when the backend cannot probe the group.
2. Choose Edit group to change the Selection policy and the filters (Filter 1, Filter 2, Add filter). Choose Apply. doona rewrites the policy and filters in the group section of the file that defines the group, keeps its other fields, then writes and reloads after validation passes. The item is disabled when the group is defined more than once, when its file is read-only, or when no loaded file defines it.
3. Choose Check settings to change Check URL, Check interval, Tolerance and Idle timeout. Only the fields the backend lists as writable appear. Leave a field empty to use the global value or the default, then choose Apply. If the backend changed a value after the dialog opened, the field says so; applying again replaces it.

### Arrange group membership

1. Open the Group membership tab. Groups are on the left; nodes and subscriptions are on the right.
2. Drag a node or subscription onto a group. Or select rows and choose Add to group below the list.
3. To remove a member that was added by name or as a whole subscription, choose its remove button. Nodes that a group selects by rule cannot be removed here; change them in the configuration source.
4. To create a group, choose New group, enter a Group name, choose a Selection policy and choose Create. Add at least one node or subscription; a group without members holds every node, so it cannot be applied.
5. Changes are staged, and the count of changes not applied is shown. Choose Discard all to drop them, or Review and apply to open Review changes.
6. Review changes lists each staged change with an undo button. Expand Show the configuration text to be written to see the group text. Choose Apply: doona validates the whole configuration, then writes and reloads. Nothing is written if validation fails.
7. Leaving the page with staged changes asks you to confirm discarding them.

<a name="nodes"></a>

## Nodes and subscriptions

Open the Routing hub, then Nodes. The Nodes tab lists node sources: subscriptions, files and the nodes in the configuration. The Latency tab appears when the backend lists nodes.

### Sources and nodes

1. The Sources table shows each source's Kind, Nodes, Usage, Updated, Auto-refresh, Expires and State.
2. Select a source row. The node table below shows that source's nodes. Search nodes covers every source; Group and Protocol filter the table.
3. Each node row shows its Protocol, Latency and Groups. Choose the test button on a row to measure that node; a toast reports the latency or the failure.
4. Choose Add to group on a node row, then a group. doona adds the node name to that group in the main configuration and reloads. Choose New group… to create a group that includes the node by a name filter; enter a Name, choose a Selection policy and choose Add.

### Latency

1. Open the Latency tab. The summary shows the lowest and highest latency and the number of unavailable nodes.
2. The chart shows each node's Latest latency. When the backend reports them, it also shows Moving average and Average of the last 10.
3. Use Group by to group the chart by Group or Protocol. Each group names its nodes that are unavailable or not measured.
4. Choose a node in the chart to open it on the Nodes tab.

### Add a subscription or a node

Adding or removing subscriptions and file sources requires the backend to allow source management; adding or removing individual nodes requires it to allow node management. Both need a writable main configuration; see [read-only sources](troubleshooting.md#read-only).

1. Choose Add subscription. Enter a Name and a Subscription URL (HTTP or HTTPS). Depending on the backend, the dialog also offers Auto-refresh, User-Agent and Cache the subscription.
2. Choose Add. The backend writes the subscription into the subscription section of the main configuration. The URL is stored and never shown again.
3. A new subscription has no nodes until it is fetched. When the backend can refresh subscriptions, doona refreshes it at once, and the toast reports the node count. If that refresh fails, the toast offers Retry.
4. To add a single node, choose Paste node link above the node table. Enter a Name and a Node link such as `vless://…`, then choose Add. The node goes into the node section of the main configuration.

### Refresh a subscription

1. Choose the refresh button on a subscription row to fetch that subscription now. Choose Refresh all subscriptions (N), or Refresh subscription (1) when there is only one, to fetch every subscription in one batch; Settings offers the same command under [backend actions](config-and-settings.md#backend-actions).
2. A refresh fetches the subscription through its download route and applies the new nodes. It does not change the subscription's configured source.
3. On success, the toast reports the node count. On failure, the last nodes that loaded successfully stay in place.
4. If the download route has no usable node yet, for example because the rules send the subscription through a group of the nodes it has not delivered, the refresh fails instead of falling back to direct.
5. To change how often a subscription refreshes, choose a value in its Auto-refresh column. doona writes the interval to the main configuration and reloads.

### Remove a source or a node

1. To remove a subscription or a file source, open More actions on its row and choose the remove item. Confirm in the dialog. doona deletes the source and its nodes from the main configuration and reloads.
2. Nodes written in the configuration have a remove button on their row. Removing one deletes it from the node section of the main configuration and reloads.

<a name="rules"></a>

## Routing rules

Open the Routing hub, then Rules. The tabs are Routing rules, DNS rules and Trace simulation; each tab appears only when the backend offers it.

### Rule templates

When the backend provides rules and configuration text, Routing rules offers a Simple / Advanced switch. Without an explicit view in the link, Simple opens, including for custom rules. Unless the link explicitly selects a view, links that select or edit a rule, prefill a new rule, or review held rules open Advanced.

Simple selects the detected template name when one file's top-level `routing` matches a template. Otherwise, the rules are custom: no template is selected, and a notice says the current rules match no mode. Routing spread over several files is also custom.

1. Under Routing mode, choose Bypass mainland China, GFW list only or Global proxy. More templates offers ACL4SSR Mini, ACL4SSR Online and ACL4SSR Full.
2. Choose a different template, then Apply to review the confirmation dialog. It names the target file: the file containing top-level `routing`, or the main file if none exists.
3. Review Groups to create and Existing groups used. Existing groups, including those declared in other loaded files, keep their settings; missing groups are added to the target file. A warning marks reused groups that select one exact node name or use a `fixed` policy. A new group whose name matches a node gets a warning: rules using that name will reach the group instead of the node.
4. Rule files no longer included lists `include` paths inside the routing being replaced. Applying drops those statements, so their rules no longer apply through those includes; the files stay on disk. Expand Changes to {file} to review the diff.
5. If no loaded file has a `dns` block, Also add DNS routing appears and is checked by default. It adds a `dns` block to the target file: `geosite:cn` queries use `alidns` at `223.5.5.5`; other queries use `cloudflare` at `1.1.1.1` over DNS over TLS. Clear the checkbox to omit the new `dns` block.
6. Confirm with Apply. Only the target file's top-level `routing` is replaced (or added if absent), along with the missing groups and optional DNS block. Existing DNS routing, other content and other files stay unchanged. The write reloads the configuration.

Templates cannot be applied when the backend reports an engine name other than `honk`, configuration writes are disabled, no target file is available, or top-level routing is spread over several files. doona also refuses target files that contain `native_api` or `clash_api` settings or are read-only. Unavailable text, a SHA-256 mismatch or a backend permission refusal also prevents applying a template. The page shows the reason; a routing `include` statement alone does not prevent applying a template.

### Read the rule list

Choose Advanced if the Simple / Advanced switch is shown.

1. Read the list from top to bottom. The first rule that matches decides the outbound; the last row, numbered —, is the fallback.
2. Each row shows the rule number, Expression, Outbound, Where and Hits. A `must` badge marks a locked outbound.
3. Where shows the file and line that holds the rule. Hits counts the flow records retained in the current snapshot, not a running total.
4. The caption shows the rule count and the `generation` of the rule list.
5. When the backend offers flow records but no rule list, the tab shows the flows of the current snapshot grouped by rule, with Hits and Share, instead.

### Open the source of a rule

1. Choose Open config source on a row. The Configuration page opens that file at the rule's line; see [edit a source](config-and-settings.md#edit-source).
2. A rule from an include file outside a routing section cannot be changed in the list. Edit it in the file through Open config source.

### Edit or remove a rule

1. Choose Edit outbound settings on a row. The dialog shows the rule's expression. Choose another Outbound and, if needed, turn on Lock this outbound. Choose Edit outbound settings to confirm. Only the outbound changes; the condition stays as written.
2. Choose Remove rule on a row. The dialog names the file and line it deletes. Confirm with Remove rule.
3. Both commands write and reload after validation passes. The toast says the change is in effect; existing connections keep their current route until they reconnect.
4. Both buttons are disabled, with the reason on hover, when the rule's file is read-only or incomplete, when doona cannot locate the rule's line, or when the rule is in an include file outside a routing section.
5. In a connection's More actions, Edit matched rule's outbound settings opens this dialog for the rule that connection matched.

<a name="dns-rules"></a>

## DNS rules

1. Open the DNS rules tab. It holds two lists, each checked in order: Request rules decide how each query is handled, and Response rules accept an answer, reject it, or query again through another upstream.
2. Each row shows the rule's expression, its Action and Where. Resolution log and Open DNS configuration link to the DNS page and to the dns section of the configuration.
3. Choose Add rule in either list to add a rule. The dialog works as in [add a rule from a rule list](#add-rule), with Action in place of Outbound and without Lock this outbound. The rule goes into the dns routing section of the source file.
4. Choose Remove rule on a row to delete it. DNS rules have no edit button; change a rule in the file through Open config source.

<a name="add-rule"></a>

## Add a rule

There are two dialogs. The dialog on a rule list writes the rule at once. The dialog opened from observed traffic can also hold the rule.

### From a rule list

1. On Routing rules, choose Advanced if the view switch is shown, then Add rule above the list.
2. In Condition form, choose Select to pick a Match by kind (such as Domain suffix, geosite category or Destination IP) and enter the Values, separated by commas. Or choose Expression and type the Condition, such as `domain(geosite:netflix)`.
3. Choose the Outbound. It starts at the first group, or `direct` when there is no group. Turn on Lock this outbound to add `must`.
4. In Insert, choose Last, before the fallback, or Before rule N. The dialog starts at the first offered position.
5. Choose Add rule. doona adds the rule to the routing section of the source file, then writes and reloads after validation passes.

### From observed traffic

The Add rule button also appears on these pages:

- Connections: the toolbar, after you select a row, and a connection's detail panel. See [Connections](observe.md#connections).
- Routing log: Add a rule for this target in a record's details. See [Routing log](observe.md#flows).
- DNS: the Query result and each answered address, a Resolution log record, and a Cache entry. See [DNS](observe.md#dns).
- Trace simulation: an evaluation card that offers it. See [Trace](#trace).

In the dialog:

1. When the traffic fits more than one list, choose the Rule list: Routing rules, DNS request rules or DNS response rules.
2. When the traffic offers more than one condition, choose Match by. A DNS rule can also be limited to the query's record type.
3. Choose the Outbound, or the Action for a DNS rule. No outbound is preset. The line under the choices shows the current one, and the dialog warns when your choice does not change where the traffic goes.
4. Check Insert. When the rule the traffic matched is in a writable file, the default is Before the matched rule. The other choices are Last, before the fallback, and First.
5. The preview at the bottom shows the rule line. A note appears when an earlier rule may still match the traffic first, or when the same rule is already listed or held.
6. Choose Hold or Apply:
   - Hold keeps the rule in the held list and writes nothing. The toast offers Review held rules.
   - Apply writes this rule and reloads at once. The toast says the rule is in effect. For a routing rule it offers View rule; for a DNS rule added from a DNS query it offers Query again.
7. When the configuration cannot be written, the dialog offers Copy rule instead.

<a name="held-rules"></a>

## Held rules

1. Held rules stay only for the current browser session. Reloading the page drops them, so the browser asks before you leave while rules are held.
2. The Rules page shows a Pending: N card above each list that holds rules. Each row shows the rule line and its position.
3. Choose Discard held rule on a row to drop it.
4. Choose Apply held rules on the card, or Apply (N) in the top bar, to write every held rule of every list. The card notes rules held in other lists, and the number of files when there is more than one.
5. Rules are written one file at a time, and each file is validated and reloaded. Written rules leave the held list. If a file fails, the rules not yet written stay held, and the failure with its lines appears on the card.
6. Reload honk in the top bar reloads the configuration already written; it does not write held rules. See [the top bar](tour.md#top-bar).

<a name="trace"></a>

## Trace

Trace simulates rule evaluation against the current configuration. It does not open a connection to the destination.

### Run a trace

1. Open Rules, then Trace simulation.
2. Choose the Network protocol (TCP or UDP). Enter a Domain, a Destination IP, or both, and a Destination port.
3. Choose the Resolution mode: No resolution (none), Live resolution (live), or Resolve, then simulate (query). Live and query resolve the domain first, so they need a domain and an empty Destination IP. Only the modes the backend offers can be used.
4. Expand Advanced to add a Source IP, Source port or Process name.
5. Choose Run trace.

With only a destination IP, the simulation evaluates the IP and port. If `dial_mode` uses a domain-family mode, the engine reads the domain from real TLS or HTTP traffic and evaluates the rules again; include the domain to simulate that.

### Read the result

1. The status line shows the observation time and the `generation` the trace ran against.
2. With query resolution, a DNS query card shows the lookup. Query DNS and View cache open the DNS page for that name.
3. Each Rule evaluation card shows the Decision (Determined or Indeterminate) and the Outbound. When earlier rules lacked inputs, it shows Likely outbound and Missing inputs; provide those inputs and run the trace again.
4. When the outbound is a group, the card shows the Node chain and its Reachability. The test button measures that node; the View group and View node links open them.
5. The table lists each rule with its Result (Matched, Not matched, Skipped or Indeterminate) and the inputs it was missing.

### Add a rule from the result

Choose Add rule on an evaluation card. The dialog from [observed traffic](#add-rule) opens with conditions taken from the traced input. Choose Hold or Apply.
