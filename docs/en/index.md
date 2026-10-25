English / [简体中文](../zh-CN/index.md) / [繁體中文](../zh-TW/index.md)

# doona documentation

doona is a static web UI for the native API that the daeuniverse engines share: honk today, dae once it implements the same contract. honk is a Rust transparent-proxy engine for Linux gateways; it serves doona itself at `/ui/`, or any web server can. doona shows what the engine is doing and manages nodes, groups, routing rules and configuration files.

<a name="choose-edition"></a>

## Choose an edition

| Standard edition | doona lite |
| --- | --- |
| For managing configuration and observing traffic | For beginners editing configuration |
| Traffic pages, configuration forms, source editor and Trace | Nodes, subscriptions, groups, routing, DNS and global settings |
| [Install the standard edition](install.md#doona) | [Install doona lite](lite.md#lite-install) |
| [Standard demo](https://demo.daeuniverse.org/) | [lite demo](https://demo.daeuniverse.org/lite/) |

See [Standard edition and doona lite](editions.md) for features and switching.

[Try the demo with sample data](https://demo.daeuniverse.org/).

![The activity page](../screenshots/en/activity-light.webp)

## Native API status

These pages cover doona v0.1.0-beta.19. doona uses honk's native API from the honk-core builds attached to each release, built from Glassyiris/honk `feat/native-api` debug tags. `HONK-SOURCE.txt` identifies the bundled build; see [honk version](requirements.md#honk-version). Upstream daeuniverse/honk `main` does not provide this API. Keys and defaults may change before upstream honk releases it.

Installation examples use beta.19 asset names and the matching honk tag `debug.2026.10.9.native-api.2`. The assets are published on the [release page](https://github.com/Zakkaus/doona/releases/tag/v0.1.0-beta.19).

## Pages

For a new gateway, start with Requirements, install honk and an edition, then follow Minimal configuration and Service management. Continue with First sign-in for the standard edition or Connect doona lite.

1. Start: [Standard edition and doona lite](editions.md), [Requirements](requirements.md).
2. Install and first run: [Install on Debian or Ubuntu](install-debian.md), [Install on Fedora or RHEL](install-fedora.md), [Install on Arch Linux](install-arch.md), [Install on Gentoo](install-gentoo.md), [Install on OpenWrt](install-openwrt.md), [Install on other systems](install-manual.md), [Installation details](install.md), [Minimal configuration](minimal-configuration.md), [Service management](service-management.md).
3. Standard edition: [First sign-in](first-sign-in.md), [Interface tour](tour.md), [Watching traffic](observe.md), [Routing, nodes and rules](routing.md), [Config and settings](config-and-settings.md), [Common tasks](common-tasks.md), [Features](features.md).
4. doona lite: [doona lite](lite.md), [Connect doona lite](lite-connect.md), [Common tasks in doona lite](lite-tasks.md).
5. Reference: [Configuration](configuration.md), [Troubleshooting](troubleshooting.md), [Development](development.md).

## Links

- [doona releases](https://github.com/Zakkaus/doona/releases) for honk-core downloads
- [honk quick start](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues); report engine problems to [honk](https://github.com/daeuniverse/honk) or [dae](https://github.com/daeuniverse/dae)
