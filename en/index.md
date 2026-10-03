# doona documentation

doona is a static web UI for the native API that the daeuniverse engines share: honk today, dae once it implements the same contract. honk is a Rust transparent-proxy engine for Linux gateways; it serves doona itself at `/ui/`, or any web server can. doona shows what the engine is doing and manages nodes, groups, routing rules and configuration files.

[Try the demo with sample data](https://demo.daeuniverse.org/).

![The activity page](https://zakkaus.github.io/doona-docs/screenshots/en/activity-light.webp)

## Native API status

These pages describe the planned doona v0.1.0-beta.13 release. doona uses honk's native API from the honk-core builds attached to each doona release, built from Glassyiris/honk `feat/native-api` debug tags. The release build pins honk commit `464c9b3`; see [honk version](https://zakkaus.github.io/doona-docs/en/requirements.md#honk-version). Upstream daeuniverse/honk `main` does not provide this API. Keys and defaults may change before upstream honk releases it.

The source still declares beta.12, and beta.13 download assets are not yet published. The beta.13 commands on the installation pages require that release to be available.

## Pages

For a new gateway, read Requirements and the install page for your system, then the First run pages in order: Minimal configuration, Service management and First sign-in. After the first sign-in, continue with the Interface tour in Guides.

1. [Requirements](https://zakkaus.github.io/doona-docs/en/requirements.md): the kernel, the honk build, browsers and build tools.
2. Install doona and honk-core on [Debian or Ubuntu](https://zakkaus.github.io/doona-docs/en/install-debian.md), [Fedora or RHEL](https://zakkaus.github.io/doona-docs/en/install-fedora.md), [Arch Linux](https://zakkaus.github.io/doona-docs/en/install-arch.md), [Gentoo](https://zakkaus.github.io/doona-docs/en/install-gentoo.md), [OpenWrt](https://zakkaus.github.io/doona-docs/en/install-openwrt.md) or [another system](https://zakkaus.github.io/doona-docs/en/install-manual.md).
3. [Installation details](https://zakkaus.github.io/doona-docs/en/install.md): the manual installation in one page, doona on another origin, distribution packages and updates.
4. [Minimal configuration](https://zakkaus.github.io/doona-docs/en/minimal-configuration.md): the smallest configuration that serves doona, and how to check it.
5. [Service management](https://zakkaus.github.io/doona-docs/en/service-management.md): run honk as a systemd or procd service; start, stop, reload and read the log.
6. [First sign-in](https://zakkaus.github.io/doona-docs/en/first-sign-in.md): create the administrator and check System status.
7. [Interface tour](https://zakkaus.github.io/doona-docs/en/tour.md): pages, the top bar, panels and how changes are held, applied or saved.
8. [Watching traffic](https://zakkaus.github.io/doona-docs/en/observe.md): Activity, System status, Connections, Routing log, DNS, Logs and Events.
9. [Routing, nodes and rules](https://zakkaus.github.io/doona-docs/en/routing.md): policy groups, nodes and subscriptions, rules and Trace.
10. [Config and settings](https://zakkaus.github.io/doona-docs/en/config-and-settings.md): the Configuration and Settings pages.
11. [Common tasks](https://zakkaus.github.io/doona-docs/en/common-tasks.md): step-by-step procedures for frequent changes.
12. [Configuration](https://zakkaus.github.io/doona-docs/en/configuration.md): an example honk configuration with the native API, and what each `native_api` field enables.
13. [Features](https://zakkaus.github.io/doona-docs/en/features.md): check each doona feature against the settings it needs, the resources each page reads, and the settings doona keeps in the browser.
14. [Troubleshooting](https://zakkaus.github.io/doona-docs/en/troubleshooting.md): startup errors, the state database, a missing native API, sign-in and read-only sources.
15. [Development](https://zakkaus.github.io/doona-docs/en/development.md): build and test doona, the source layout and the API contract.

## Links

- [doona releases](https://github.com/Zakkaus/doona/releases) for honk-core downloads
- [honk quick start](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues); report engine problems to [honk](https://github.com/daeuniverse/honk) or [dae](https://github.com/daeuniverse/dae)
