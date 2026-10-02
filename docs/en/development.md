English / [简体中文](../zh-CN/development.md) / [繁體中文](../zh-TW/development.md)

# Development

Read [CONTRIBUTING.md](https://github.com/Zakkaus/doona/blob/main/CONTRIBUTING.md) before opening a pull request. Its [Translations](https://github.com/Zakkaus/doona/blob/main/CONTRIBUTING.md#translations) section covers correcting a translation and proposing a language.

This documentation and the site built from it are in [Zakkaus/doona-docs](https://github.com/Zakkaus/doona-docs).

## Commands

Run these from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build                       # writes dist/
pnpm check                       # types, lint, translations, formatting, unit tests, generated API types
pnpm check:size                  # gzip budgets for the dist/ build
pnpm e2e:install --with-deps     # once, for the browser tests
pnpm e2e                         # rebuild, then test against the mock at the root and under /ui/
pnpm package                     # release/doona-<version>.tar.gz, doona-fonts-<version>.tar.gz, SHA256SUMS
```

`pnpm dev` serves the mock on Vite's dev server. `pnpm package` uses the version in `package.json`; `pnpm package --git-version` uses `git describe --tags --always` without its leading `v`. Timestamps use `SOURCE_DATE_EPOCH` or the HEAD commit time.

## Test against a live backend

For a read-only pass against a live backend, run `DOONA_API=http://router:9527 DOONA_TOKEN=… pnpm e2e:live` from the repository root. `DOONA_API` is required; omit `DOONA_TOKEN` when authentication is not required. The command runs accessibility, mobile-navigation and keyboard specs, rejects backend overrides in fixture storage, and aborts control requests, including DNS queries. Ordinary `pnpm e2e` runs reject `DOONA_API` unless `DOONA_LIVE_OBSERVE=1` is explicitly set.

## Screenshots

`node tools/screenshots.mjs <url> docs/screenshots` captures mock-backed pages in each language, the palette sheet, the English theme gallery, phone strips, page-tour stills and the routing animation as WebP. It requires `cwebp`, `img2webp` and Playwright's Chromium.

## Source layout

| Path            | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| `src/features/` | Pages, their hooks and messages, one folder each           |
| `src/shell/`    | Application shell, navigation and search                   |
| `src/ui/`       | Shared components, theme and icons                         |
| `src/api/`      | Client, backend profiles, engine adapters and generated types |
| `mock/`         | Mock backend for the demo, previews and tests               |
| `src/store/`    | Resource watching, cached reads and action hooks           |
| `src/i18n/`     | Translations and locale helpers                            |
| `contract/`     | The vendored OpenAPI contract and its pin                  |
| `public/`       | Static icons, manifest and service worker                   |
| `e2e/`          | Browser tests                                              |
| `tools/`        | Build, packaging, conformance and screenshot tools         |
| `install/`      | nfpm configs, OpenWrt, Alpine, Gentoo and Nix recipes      |
| `docs/`         | Country-flag and font documentation                         |
| `node_modules/@fontsource-variable/` | Noto Sans TC/SC font sources bundled by Vite |

The screenshot tool creates `docs/screenshots/` when run; screenshots are not part of the source tree.

## Contract

[SOURCE.md](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/SOURCE.md) records the pin of [openapi.yaml](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/openapi.yaml). After moving the pin, run `pnpm gen:api` to regenerate [src/api/types.ts](https://github.com/Zakkaus/doona/blob/main/src/api/types.ts). `node tools/conformance.mjs http://router:9527 --token …` checks a live backend's discovery, capabilities and read-only responses against the contract without sending a mutation.

See [CHANGELOG.md](https://github.com/Zakkaus/doona/blob/main/CHANGELOG.md) for release notes.
