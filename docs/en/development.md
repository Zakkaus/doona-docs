English · [简体中文](../zh-CN/development.md) · [繁體中文](../zh-TW/development.md)

# Development

Read [CONTRIBUTING.md](../../CONTRIBUTING.md) before opening a pull request. Its [Translations](../../CONTRIBUTING.md#translations) section covers correcting a translation and proposing a language.

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
pnpm docs:build                  # the docs site in dist-docs/, served under DOCS_BASE (default /doona-docs/)
pnpm docs:check                  # links and anchors in docs/ and in the built site
```

`pnpm dev` serves the mock on Vite's dev server. Archive versions come from `package.json` locally and from the Git description on tags; timestamps use `SOURCE_DATE_EPOCH` or the HEAD commit time.

## Test against a live backend

For a read-only pass against a live backend, run `DOONA_API=http://router:9527 DOONA_TOKEN=… pnpm e2e:live` from the repository root. `DOONA_API` is required; omit `DOONA_TOKEN` when authentication is not required. The command runs accessibility, mobile-navigation and keyboard specs, rejects backend overrides in fixture storage, and aborts control requests, including DNS queries. Ordinary `pnpm e2e` runs reject `DOONA_API` unless `DOONA_LIVE_OBSERVE=1` is explicitly set.

## Screenshots

`node tools/screenshots.mjs <url> docs/screenshots` captures pages, the palette sheet, the phone strip and the two animations from a running build as WebP; it requires `cwebp` and `img2webp`.

## Source layout

| Path            | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| `src/features/` | Pages, their hooks and messages, one folder each           |
| `src/shell/`    | Application shell, navigation and search                   |
| `src/ui/`       | Shared components, theme and icons                         |
| `src/api/`      | Client, backend profiles, mock backend and generated types |
| `src/store/`    | Resource watching, cached reads and action hooks           |
| `src/i18n/`     | Translations and locale helpers                            |
| `contract/`     | The vendored OpenAPI contract and its pin                  |
| `public/`       | Static assets, fonts and the service worker                |
| `e2e/`          | Browser tests                                              |
| `tools/`        | Build, packaging, conformance and screenshot tools         |
| `install/`      | nfpm configs, OpenWrt, Alpine, Gentoo and Nix recipes      |
| `docs/`         | This documentation, `anchors.json` and the screenshots     |
| `site/`         | The docs site build and its stylesheet                     |

## Contract

[SOURCE.md](../../contract/api-standardize/SOURCE.md) records the pin of [openapi.yaml](../../contract/api-standardize/openapi.yaml). After moving the pin, run `pnpm gen:api` to regenerate [src/api/types.ts](../../src/api/types.ts). `node tools/conformance.mjs http://router:9527 --token …` checks a live backend's discovery, capabilities and read-only responses against the contract without sending a mutation.

See [CHANGELOG.md](../../CHANGELOG.md) for release notes.
