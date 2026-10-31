<a name="lite"></a>

# doona lite

doona lite provides forms for common honk configuration tasks. It is a preview in testing; see the [edition comparison](https://doona.daeuniverse.org/en/editions.md) before choosing it for your gateway.

Use **Nodes**, **Subscriptions**, **Groups**, **Routing** and **DNS** to manage resources, and **Settings** for global settings. Begin with [Connect doona lite](https://doona.daeuniverse.org/en/lite-connect.md), then follow [Common tasks](https://doona.daeuniverse.org/en/lite-tasks.md).

![Nodes](https://doona.daeuniverse.org/images/lite-nodes-light.webp)

<a name="lite-install"></a>

## Install doona lite

honk embeds doona lite starting with v0.1.0-beta.4. Install honk as described in [Quick start](https://doona.daeuniverse.org/en/quick-start.md), then add this block to its configuration, replacing any existing `native_api` block:

```dae
experimental {
    native_api {
        enabled: true
        listen: '127.0.0.1:9527'
        password_auth: true
        config_write: true
        ui: 'embedded-lite'
    }
}
```

For a separate installation, use the lite archive in [Manual installation](https://doona.daeuniverse.org/en/install-manual.md); lite has no distribution packages.

After either choice, apply the [UI restart rule](https://doona.daeuniverse.org/en/what-doona-can-change.md#restart-native), open the address from [Quick start](https://doona.daeuniverse.org/en/quick-start.md), then [connect doona lite](https://doona.daeuniverse.org/en/lite-connect.md).

<a name="lite-switch"></a>

## Switch to the standard edition

Follow [Install and switch editions](https://doona.daeuniverse.org/en/editions.md#editions-switch) to select the standard edition's files or embedded UI.
