English / [简体中文](../zh-CN/lite-tasks.md) / [繁體中文](../zh-TW/lite-tasks.md)

<a name="lite-tasks"></a>

# Common tasks in doona lite

Use doona lite to import resources and edit honk configuration. [Connect first](lite-connect.md). Editing requires all of the following:

- honk permits configuration writes.
- honk supports tracking operations and full configuration validation.
- The main configuration is writable, and honk returns its complete content with a matching content hash.

You can practice with **Try the demo**, where changes reset on reload.

<a name="lite-task-import"></a>

## Import nodes from share links

1. Open **Nodes** and select **Add node**.
2. In the **Paste links** tab, paste one link per line into **Share links**. Links are recognized automatically.
3. Check the recognized protocols and addresses, and correct any invalid lines.
4. Select **Add N nodes** for multiple nodes, or **Add** for one node. This writes and applies the nodes directly; they appear in the list.

Share-link import also requires honk to support syntax validation.

<a name="lite-task-subscription"></a>

## Add a subscription

1. Open **Subscriptions** and select **Add subscription**.
2. Enter **Subscription link**. You may fill in **Name (optional)** or leave it empty to use the suggested name.
3. Select **Save**. The subscription appears as a draft row; honk has not saved it yet.
4. Select **Review and apply**, check the changes, then select **Apply**.
5. Wait for the success notification: “Configuration saved and applied.” The subscription is now applied.

Editing and deleting subscriptions use the same draft and review flow. An existing subscription cannot be renamed here.

<a name="lite-task-group"></a>

## Create a group and choose members

1. Open **Groups** and select **Create group**.
2. Enter **Name**, choose **Policy** (for example **Manual choice**), then select **Create**.
3. In **Edit group**, find a node under **Available nodes and subscriptions** and use its **Add** button. The node appears under **In this group**.
4. Select **Review and apply**, review the group and its members, then select **Apply**.

<a name="lite-task-rule"></a>

## Add a routing rule

1. Open **Routing** and select **Add rule**.
2. For a domain rule, keep **Domain and subdomains**, enter `example.com` in **Values**, and press Enter.
3. Choose a group under **Goes to** and choose **Position**. Select **Add**.
4. Select **Review and apply**, check the rule, then select **Apply**.

The **Rebuild rules from a template** dialog can replace the routing rules in the draft. Review its replacement list before saving; it does not merely append a rule.

<a name="lite-task-dns"></a>

## Change DNS upstreams

1. Open **DNS** and select **Add DNS server**.
2. Keep **Custom** under **Provider**. Enter a unique **Name** and **Server address**, for example `tls://1.1.1.1:853`, then select **Add**.
3. Open that server’s **Actions** menu and select **Set as default** to use it for other domains.
4. Select **Review and apply**, check the server and rule changes, then select **Apply**.

<a name="lite-task-setting"></a>

## Change a global setting

1. Open **Settings** and choose **Sniffing**.
2. Set **Sniffing timeout** to `200` and its **Duration unit** to `ms`.
3. Select **Review and apply**, review the change, then select **Apply**.

Settings that require a restart appear as read-only values with a **Copy** button for the setting line. Follow the dialog’s instructions to edit the file’s `global` section on the honk host and restart honk; copying the restart command does not run it.

<a name="lite-task-share"></a>

## Share a node as a link or QR code

1. Open **Nodes** and find a manually added node.
2. Open its **Actions** menu and select **Share** to open the link and QR code.
3. Select **Copy link**, or scan the QR code. If copying is unavailable, select and copy the displayed link.

Subscription nodes do not expose share links. A link that is too long may have no QR code; copy the link instead. Share links contain connection credentials.
