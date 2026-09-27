English · [简体中文](../zh-CN/index.md) · [繁體中文](../zh-TW/index.md)

# doona documentation

doona is a static web UI for the native API that the daeuniverse engines share: honk today, dae once it implements the same contract. honk is a Rust transparent-proxy engine for Linux gateways; it serves doona itself at `/ui/`, or any web server can. doona shows what the engine is doing and manages nodes, groups, routing rules and configuration files.

[Try the demo with sample data](https://demo.daeuniverse.org/).

![The activity page](../screenshots/en/activity-light.webp)

## Native API status

doona needs honk's native API, which exists only on the `feat/native-api` branch of Glassyiris/honk and its rolling `debug` release. These pages were checked against `debug.2026.9.28.native-api.2` (commit `7449f4e2`). Keys and defaults may change before upstream honk releases the API.

## Pages

For a new gateway, read Requirements and the install page for your system, then the First run pages in order: Minimal configuration, Service management and First sign-in.

1. [Requirements](requirements.md): the kernel, the honk build, browsers and build tools.
2. Install doona and honk-core on [Debian or Ubuntu](install-debian.md), [Fedora or RHEL](install-fedora.md), [Arch Linux](install-arch.md), [Gentoo](install-gentoo.md), [OpenWrt](install-openwrt.md) or [another system](install-manual.md).
3. [Installation details](install.md): the manual installation in one page, doona on another origin, distribution packages and updates.
4. [Minimal configuration](minimal-configuration.md): the smallest configuration that serves doona, and how to check it.
5. [Service management](service-management.md): run honk as a systemd or procd service; start, stop, reload and read the log.
6. [First sign-in](first-sign-in.md): create the administrator and check the overview.
7. [Configuration](configuration.md): an example honk configuration with the native API, and what each `native_api` field enables.
8. [Features](features.md): check each doona feature against the settings it needs, the resources each page reads, and the settings doona keeps in the browser.
9. [Troubleshooting](troubleshooting.md): startup errors, the state database, a missing native API, sign-in and read-only sources.
10. [Development](development.md): build and test doona, the source layout and the API contract.

## Links

- [doona releases](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` release](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk quick start](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues); report engine problems to [honk](https://github.com/daeuniverse/honk) or [dae](https://github.com/daeuniverse/dae)
