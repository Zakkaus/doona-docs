<a name="common-tasks"></a>

# Common tasks

Change routing, manage subscriptions, and diagnose traffic in the standard edition. For a first configuration, follow [Route your first connection](https://doona.daeuniverse.org/en/tutorial.md); for the smaller edition, see [doona lite](https://doona.daeuniverse.org/en/lite.md).

Before changing a rule, check [rule editing requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-rules). For when a saved change takes effect, see [configuration writes](https://doona.daeuniverse.org/en/what-doona-can-change.md#change-sources).

<a name="one-site"></a>

## Send one site's traffic through a proxy

1. Open **Connections** → **List** and find a connection to the site.
2. Select its add-rule icon.
3. Set **Match by** to **Full domain** and **Outbound** to your proxy group.
4. Check the preview and **Insert**. Place the new rule before any rule that would match the same traffic first.
5. Select **Apply** and check the success notice. To collect changes before applying them, use **Hold** and follow [held rules](https://doona.daeuniverse.org/en/routing.md#held-rules).

To include subdomains or keep this route in Global and Direct modes, use [the domain rule procedure](https://doona.daeuniverse.org/en/common-tasks.md#domain-family).

<a name="domain-family"></a>

## Route a domain and its subdomains through a group

1. Open **Rules** → **Routing rules**. Select **Advanced** if the view switch appears, then **Add rule**.
2. Set **Match by** to **Domain suffix** and enter the domain in **Values**.
3. Set **Outbound** to the group.
4. Turn on **Lock this outbound** if this rule must also apply in Global or Direct mode.
5. Set **Insert** before any earlier rule that would match the same traffic.
6. Select **Add rule** in the dialog. Check the success notice and the new rule in the list.

For other conditions and rule ordering, see [the rule editor](https://doona.daeuniverse.org/en/routing.md#add-rule).

<a name="device-bypass"></a>

## Make a device bypass the proxy

Use a fixed IP address for the device so the rule continues to match it.

1. Open **Rules** → **Routing rules**. Select **Advanced** if shown, then **Add rule**.
2. Set **Match by** to **Source IP** and enter the device's IP address in **Values**.
3. Set **Outbound** to `direct` and enable **Lock this outbound**.
4. Set **Insert** before any rule that would match this device first.
5. Select **Add rule**. Check that the new rule contains the intended source address and outbound.

Use [Trace simulation](https://doona.daeuniverse.org/en/routing.md#trace) with that source address to check which rule wins.

<a name="group-node"></a>

## Choose a group's node and return to automatic selection

Check [selection and pinning requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-group-selection).

1. Open **Policies** and expand the group's card.
2. Select a node in its node grid.
3. Read the notice to confirm the selection and whether the automatic policy has paused.
4. To clear a manual pin, open the card's **More actions** menu and select **Back to automatic**. Check the member reported by the resulting notice.

For group policies, see [policy groups](https://doona.daeuniverse.org/en/routing.md#policies).

<a name="subscription"></a>

## Add or refresh a subscription

Check [subscription creation requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-nodes) and the separate [refresh requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-subscription-refresh).

1. Open **Nodes** and select **Add subscription**.
2. Enter **Name** and **Subscription URL**, then select **Add**.
3. Select the new subscription card and check its nodes. If the backend supports refresh, doona requests it after adding the subscription. The notice reports the result.
4. To refresh later, use the update button on that card. If doona saved the declaration but the refresh failed, resolve the reported error and use that button again.

Continue with [creating a group](https://doona.daeuniverse.org/en/tutorial.md) when the subscription has nodes.

<a name="global-mode"></a>

## Switch to Global mode

Check [outbound-mode requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-config-edit).

1. Open **Activity**.
2. Select **Global** on **Outbound mode**, then choose a target on **Global outbound**.
3. Select **Apply** and read the confirmation dialog.
4. Select **Apply** in the dialog. Check the notice and the displayed mode.

To return to rule-based routing, choose **Rule** and select **Apply**.

Choosing a global outbound also selects Global mode. In Global mode, choose a target to enable **Apply**. Changing the selection alone does not apply it. Select **Read-only** to inspect a write restriction; **Not provided by this backend** means the backend offers no configuration this control can edit.

<a name="why-outbound"></a>

## Find why a connection used an outbound

1. Open **Connections** → **List** and select the connection.
2. Read **Outbound**, **Chain** and **Rule** in its details.
3. In **More actions**, choose **Show matched rule** when available to open the matching rule.
4. To test the current configuration, choose **Trace this connection** and then **Run trace**.

A trace evaluates routing; it does not replay the connection. For availability and interpretation, see [trace requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-routing-trace) and [connection details](https://doona.daeuniverse.org/en/observe.md#connections).

<a name="dns-resolution"></a>

## Check how a domain resolves

Check [DNS query requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-dns-query).

1. Open **DNS** → **Query**.
2. Enter **Domain** and choose **Type**.
3. If **Upstream** appears, leave **Automatic** to follow the configured DNS routing, or select a named upstream.
4. **Bypass cache** is off by default. Enable it when the diagnostic lookup must bypass cached answers.
5. Select **Query**. Read the answers, status, upstream and routing information in the result.

To inspect recorded traffic instead, open **Resolution log**. See [DNS data and its limits](https://doona.daeuniverse.org/en/observe.md#dns).

<a name="update-geodata"></a>

## Update geodata

Check [manual update requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-geodata-update) before starting.

1. Open **Settings** and find **Geodata**.
2. Select **Update now**.
3. Wait for the operation to finish, then check its notice and the asset details.
4. If it fails, use the reported stage in [geodata update failures](https://doona.daeuniverse.org/en/troubleshooting.md#geodata-update).

Changing sources or the schedule is a separate task: see [geodata settings](https://doona.daeuniverse.org/en/config-and-settings.md#geodata) and [where those changes are stored](https://doona.daeuniverse.org/en/what-doona-can-change.md#change-geodata).

<a name="reload-honk"></a>

## Reload after editing files outside doona

First check whether the setting needs a [reload or a restart](https://doona.daeuniverse.org/en/what-doona-can-change.md). The reload action also has [backend requirements](https://doona.daeuniverse.org/en/feature-requirements.md#req-reload-suspend).

1. Select **Reload honk** in the top bar. On a narrow screen, find it under **More options**.
2. Select **Reload honk** in the confirmation dialog.
3. Check the result notice before making another change.

Reload does not apply the [held rules](https://doona.daeuniverse.org/en/routing.md#held-rules). Use their apply action separately.

<a name="changed-on-disk"></a>

## Resolve a file changed by another editor

1. Open **Configuration** → **Config files** and choose the file in **Config file**.
2. If the page reports a disk change, compare your draft with the current file before deciding what to keep.
3. To discard your draft, select **Cancel**. The editor returns to the current source.
4. To replace the current source with your draft, select **Keep changes**, then **Apply**. Check the result and read the file back.

**Keep changes** does not merge the two versions. For a refused write, see [read-only files and write errors](https://doona.daeuniverse.org/en/troubleshooting.md#read-only).
