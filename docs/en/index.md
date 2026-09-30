English / [简体中文](../zh-CN/index.md) / [繁體中文](../zh-TW/index.md)

# doona documentation

doona is a static web UI for the native API that the daeuniverse engines share: honk today, dae once it implements the same contract. honk is a Rust transparent-proxy engine for Linux gateways; it serves doona itself at `/ui/`, or any web server can. doona shows what the engine is doing and manages nodes, groups, routing rules and configuration files.

[Try the demo with sample data](https://demo.daeuniverse.org/).

![The activity page](../screenshots/en/activity-light.webp)

## Native API status

doona needs honk's native API, which exists only in builds from the `feat/native-api` branch of Glassyiris/honk and its rolling `debug` release. On that branch, `native-api` is opt-in; release and `debug` builds, including those attached to doona 0.1.0-beta.12, include it. Builds of daeuniverse/honk `main` reject every `native_api` setting as `unknown experimental setting`; `/api` and `/ui/` answer 404. A build from `feat/native-api` without the feature stops with `native-api feature is required` when `native_api` is enabled. These pages were checked against `debug.2026.9.30.native-api.5` (commit `25377686`). Keys and defaults may change before upstream honk releases the API.

## Pages

For a new gateway, read Requirements and the install page for your system, then the First run pages in order: Minimal configuration, Service management and First sign-in. After the first sign-in, continue with the Interface tour in Guides.

1. [Requirements](requirements.md): the kernel, the honk build, browsers and build tools.
2. Install doona and honk-core on [Debian or Ubuntu](install-debian.md), [Fedora or RHEL](install-fedora.md), [Arch Linux](install-arch.md), [Gentoo](install-gentoo.md), [OpenWrt](install-openwrt.md) or [another system](install-manual.md).
3. [Installation details](install.md): the manual installation in one page, doona on another origin, distribution packages and updates.
4. [Minimal configuration](minimal-configuration.md): the smallest configuration that serves doona, and how to check it.
5. [Service management](service-management.md): run honk as a systemd or procd service; start, stop, reload and read the log.
6. [First sign-in](first-sign-in.md): create the administrator and check the overview.
7. [Interface tour](tour.md): pages, the top bar, panels and how changes are held, applied or saved.
8. [Watching traffic](observe.md): Activity, System status, Connections, Routing log, DNS, Logs and Events.
9. [Routing, nodes and rules](routing.md): policy groups, nodes and subscriptions, rules and Trace.
10. [Config and settings](config-and-settings.md): the Configuration and Settings pages.
11. [Common tasks](common-tasks.md): step-by-step procedures for frequent changes.
12. [Configuration](configuration.md): an example honk configuration with the native API, and what each `native_api` field enables.
13. [Features](features.md): check each doona feature against the settings it needs, the resources each page reads, and the settings doona keeps in the browser.
14. [Troubleshooting](troubleshooting.md): startup errors, the state database, a missing native API, sign-in and read-only sources.
15. [Development](development.md): build and test doona, the source layout and the API contract.

## Links

- [doona releases](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` release](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk quick start](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues); report engine problems to [honk](https://github.com/daeuniverse/honk) or [dae](https://github.com/daeuniverse/dae)
