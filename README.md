<div align="center">

<img src="https://raw.githubusercontent.com/Zakkaus/doona/main/public/logo.svg" width="104" alt="doona">

# doona docs

**The documentation for [doona](https://github.com/Zakkaus/doona), the web UI for the daeuniverse engines, and the site built from it.**

English · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md)

[Read the docs](https://zakkaus.github.io/doona-docs/) • [Build](#build) • [Layout](#layout)

</div>

The pages are Markdown in `docs/<locale>/`, in English, Simplified Chinese and Traditional Chinese, and read on GitHub as well as on the site. `main` is published to https://zakkaus.github.io/doona-docs/.

## Build

The build reads doona's palette, sizes, icons, logo and screenshots from a doona checkout, so the site always matches the app. `DOONA_DIR` names it; the default is `../doona`. Use Node `^22.18.0 || ^24.0.0 || >=26.0.0` and pnpm 11.

```sh
git clone https://github.com/Zakkaus/doona ../doona
pnpm install --frozen-lockfile
DOONA_DIR=../doona pnpm docs:build   # the site in dist-docs/, under DOCS_BASE (default /doona-docs/)
pnpm docs:check                      # links, anchors and ids in docs/ and in the built site
pnpm test                            # the site script and the heading ids
```

`DOCS_BASE=/ pnpm docs:build` builds for a domain of its own. CI builds against doona's `main`; the `DOONA_REF` repository variable pins a tag instead.

## Layout

| Path                | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `docs/<locale>/`    | The pages, the same set in every locale                             |
| `docs/anchors.json` | Each stable anchor and its page; doona's in-app links must match it |
| `site/`             | The site build, its stylesheet and script                           |
| `tools/`            | The docs check and the tests                                        |

A page keeps the paths it had in doona: a link to `../screenshots/` or `../../src/` names doona's file, which the site copies or links on GitHub.

## License

GPL-3.0-only, as doona. The published site also carries doona's `NOTICE` for its icons; see [NOTICE](NOTICE).
