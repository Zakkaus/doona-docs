English / [简体中文](../zh-CN/editions.md) / [繁體中文](../zh-TW/editions.md)

<a name="editions"></a>

# Standard edition and doona lite

The standard edition is the existing doona interface for managing configuration and observing traffic. Choose it when you need connection details, logs, Trace or the configuration source editor.

doona lite is a smaller interface for beginners who want to edit configuration. It manages nodes, subscriptions, groups, routing rules, DNS and global settings without traffic pages.

<a name="editions-compare"></a>

## Compare features

| Feature | Standard edition | doona lite |
| --- | --- | --- |
| Traffic pages | Activity, System status, Connections, Routing log, Logs and Events | No |
| Nodes and subscriptions | Yes | Yes |
| Groups | Yes | Yes |
| Routing rules | Yes | Yes |
| DNS | Configuration and observations | Configuration |
| Global settings | Settings page | Settings dialog |
| Configuration source editor | Yes | No |
| Trace | Yes | No |
| Themes and palettes | Light/dark themes and palettes | Light, dark or system theme; no palette selector |
| Sign-in | Administrator password or token | Administrator password or token |

<a name="editions-switch"></a>

## Install and switch editions

Both editions ship in the [same release](https://github.com/Zakkaus/doona/releases). Install `doona-<version>.tar.gz` into `/usr/share/doona` for the [standard edition](install.md#doona), or `doona-lite-<version>.tar.gz` into `/usr/share/doona-lite` for [doona lite](lite.md#lite-install). Their archive names and directories do not overlap, so installing one does not overwrite the other. lite has no distribution packages yet.

honk serves one edition at `/ui/` at a time. Set `experimental` → `native_api` → `ui` to the edition’s directory, then [restart honk](service-management.md). Every `native_api` field requires a restart; a reload is insufficient. `ui: embedded` serves only the standard edition embedded in honk-core release builds. See [Minimal configuration](minimal-configuration.md).

To use both at once, let honk serve one at `/ui/` and serve the other directory with any static server. Allow the second origin as described in [Access through a hostname or another origin](install.md#other-origin).

## Browser settings

Both editions use the same honk native API and configuration. Configuration changes are shared, but each edition keeps its browser settings separately.

## Demos

Try the [standard edition demo](https://demo.daeuniverse.org/) or the [doona lite demo](https://demo.daeuniverse.org/lite/).
