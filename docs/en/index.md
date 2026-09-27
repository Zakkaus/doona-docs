English · [简体中文](../zh-CN/index.md) · [繁體中文](../zh-TW/index.md)

# doona documentation

doona is a static web UI for the native API that the daeuniverse engines share: honk today, dae once it implements the same contract. honk is a Rust transparent-proxy engine for Linux gateways; it serves doona itself at `/ui/`, or any web server can. doona shows what the engine is doing and manages nodes, groups, routing rules and configuration files.

[Try the demo with sample data](https://demo.daeuniverse.org/).

![The activity page](../screenshots/en/activity-light.webp)

## Native API status

doona needs honk's native API, which exists only on the `feat/native-api` branch of Glassyiris/honk and its rolling `debug` release. These pages were checked against `debug.2026.9.26.native-api.4` (commit `5d8f32c1`). Keys and defaults may change before upstream honk releases the API.

## Pages

Read the first four pages in order for a new gateway.

1. [Requirements](requirements.md): the kernel, the honk build, browsers and build tools.
2. [Install](install.md): install honk, doona and the systemd service, start honk and sign in, then keep them up to date.
3. [Configuration](configuration.md): an example honk configuration with the native API, and what each `native_api` field enables.
4. [Features](features.md): check each doona feature against the settings it needs, the resources each page reads, and the settings doona keeps in the browser.
5. [Troubleshooting](troubleshooting.md): startup errors, the state database, a missing native API, sign-in and read-only sources.
6. [Development](development.md): build and test doona, the source layout and the API contract.

## Links

- [doona releases](https://github.com/Zakkaus/doona/releases)
- [Glassyiris/honk `debug` release](https://github.com/Glassyiris/honk/releases/tag/debug)
- [honk quick start](https://github.com/Glassyiris/honk/blob/feat/native-api/doc/en/how-to-start.md)
- [doona issues](https://github.com/Zakkaus/doona/issues); report engine problems to [honk](https://github.com/daeuniverse/honk) or [dae](https://github.com/daeuniverse/dae)
