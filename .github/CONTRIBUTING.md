# Contributing to doona docs

The pages are Markdown in `docs/<locale>/`, one set each in English (`en`), Simplified Chinese (`zh-CN`) and Traditional Chinese (`zh-TW`). The site code in `site/` turns them into the site. Most changes touch only the pages; the rest of this guide covers the site code for when a page needs something new.

## Set up

Clone doona next to this repository, since the build reads doona's palette, icons, logo and screenshots from a checkout. `DOONA_DIR` names another location. Use Node `^22.18.0 || ^24.0.0 || >=26.0.0` and pnpm 11.

```sh
git clone https://github.com/Zakkaus/doona ../doona
pnpm install --frozen-lockfile
DOONA_DIR=../doona pnpm docs:build   # writes the site to dist-docs/
```

To preview the site, serve `dist-docs/` with any static server, built with `DOCS_BASE=/` so the paths start at the root:

```sh
DOCS_BASE=/ DOONA_DIR=../doona pnpm docs:build
python3 -m http.server 4197 --bind 127.0.0.1 -d dist-docs
```

## Edit a page

Edit `docs/<locale>/<name>.md` and make the same change in the other two locales. A page follows these rules, which the build enforces:

- The first paragraph is the language line, which links the page in the other two locales in the order `en`, `zh-CN`, `zh-TW`. The site replaces it with its language menu.
- A page may open with front matter holding one line, `keywords: word, word`, before the language line. Search ranks a keyword match below the title and the section headings and above the text.
- The page has exactly one `#` heading, its title. The paragraph right under it introduces the page, and its first sentence is the page's description in search and in `llms.txt`.
- Every fenced code block names its language: `dae`, `sh`, `bash`, `shell`, `ini` or `text`. Two or more adjacent blocks with `tab="label"` after the language, such as `sh tab="sudo"` and `sh tab="root"`, become one box with tabs.
- A quote that starts with `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` becomes a callout, as on GitHub.
- A stable anchor is `<a name="anchor"></a>`, alone in a paragraph right before a heading. It gives the heading the same id in every locale, and doona's in-app links use it. `docs/anchors.json` lists each one.

Link other pages by their relative path, such as `install.md#install`. A link to `../screenshots/` keeps the path it has in doona, and the build publishes doona's screenshots. Link doona's other files by their GitHub URL, `https://github.com/Zakkaus/doona/blob/main/<path>` (`/tree/main/` for a directory): a relative path such as `../../src/` would be broken on GitHub, so `pnpm docs:check` rejects it.

## Add a page

1. Create `docs/en/<name>.md`, `docs/zh-CN/<name>.md` and `docs/zh-TW/<name>.md`, with the same file name, headings at the same levels, and the same anchors.
2. Add `<name>` to its section in `groups` in `site/docs.mjs`. The order there is the order of the navigation. A new section also needs its label under `groups` for every locale in `site/strings.mjs`.
3. Add each new anchor to `docs/anchors.json`, mapped to `<name>`. An anchor lives on one page only.
4. Run the checks below.

## Where the site code lives

`site/build.mjs` runs the build. It renders every page in every locale, then adds the exports and the assets. `tools/check-docs.mjs` and the tests call its `render()`.

| Module                     | What it does                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `site/docs.mjs`            | The locales, the navigation in `groups`, the anchors, the doona checkout, and GitHub's heading ids  |
| `site/strings.mjs`         | The site's own text, such as menu labels, in every locale                                           |
| `site/highlight.mjs`       | Syntax colours for code blocks, with doona's own tokenizer for dae                                  |
| `site/build/markdown.mjs`  | Parses and checks a page, renders its tables, callouts, code blocks and tabs, and rewrites links    |
| `site/build/templates.mjs` | The HTML of a page: head, top bar, outline and page actions; the root and 404 pages                 |
| `site/build/nav.mjs`       | The page list in the sidebar and the search dialog, which is also the phone navigation              |
| `site/build/exports.mjs`   | Each page's Markdown, the search index of each locale, and `llms.txt`                               |
| `site/build/assets.mjs`    | Joins the stylesheet and script, versions them by content hash, and copies fonts, logo and licences |
| `site/build/icons.mjs`     | The icons, read from doona's components, and the logo                                               |
| `site/build/common.mjs`    | HTML escaping and the URL of a page and of its Markdown                                             |
| `site/styles/*.css`        | The stylesheet, one file per component or layer, joined into `site.css`                             |
| `site/scripts/*.js`        | The browser script, one file per feature, joined into `site.js`                                     |
| `tools/check-docs.mjs`     | `pnpm docs:check`: links, anchors and locale parity in `docs/` and in the built site                |
| `tools/links.mjs`          | The link and anchor checks `docs:check` runs on each Markdown file                                  |
| `tools/site.test.mjs`      | `pnpm test`: the browser script, the heading ids, and the rendered pages                            |

Each file under `site/styles/` and `site/scripts/` opens with a comment that says what it owns.

## Add a component

### Style

Add the rules to the component's file in `site/styles/`. For a new component, create a file and add its name to `styleFiles` in `site/build/assets.mjs`. The build joins the files in that order, and the order is the cascade order: at equal specificity, a rule in a later file wins.

- Use the tokens in `tokens.css`: doona's palette as `--rp-*` and the site's own values as `--docs-*`. The build writes doona's colours and sizes in place of the `/* palette */` and `/* sizes */` lines, so keep those two lines.
- Put hover states in `hover.css`, inside its `(hover: hover) and (pointer: fine)` query, so a touch leaves no stuck highlight.
- Put the layout below 1024px in `phone.css`, and transitions in `motion.css`, where they run only under `prefers-reduced-motion: no-preference`.
- An element the build writes with `hidden` whose class sets a `display` needs a `.class[hidden] { display: none; }` rule, as in `base.css`. `pnpm docs:check` fails without it.

### Behaviour

Add a file to `site/scripts/` and its name to `scriptFiles` in `site/build/assets.mjs`. The build joins the files into one module, `site.js`:

- The files share one scope, so declare each top-level name in one file only. A file reads only names that earlier files declare. A repeated `const` or `let` fails `pnpm test`, which loads the joined script.
- The files have no `import` or `export`.
- Wrap every `localStorage` read and write in `try`/`catch`, as the existing files do, since a browser can block storage.
- Text the script shows comes from the page, in `data-` attributes the templates write from `site/strings.mjs`, so every locale gets it.

Add a test to `tools/site.test.mjs` for a new behaviour. The existing tests run the script in a Node `vm` against a small fake `document`.

## Run the checks

```sh
DOONA_DIR=../doona pnpm docs:build
DOONA_DIR=../doona pnpm docs:check
DOONA_DIR=../doona pnpm test
```

`pnpm docs:check` fails when:

- a relative link or image in `docs/` or a README resolves to no file in this repository, a link to doona's files on GitHub names no file in doona's checkout, or either one's `#anchor` names no anchor or heading on the target page;
- a locale lacks a page another has, or the pages differ from `groups` in `site/docs.mjs`;
- a page's anchors or heading levels differ from the English page;
- an anchor sits on more than one page, or `docs/anchors.json` does not map it to its page;
- an anchor doona's in-app links use is missing, or sits on another page;
- the built site, for `/doona-docs/` and for `/`, has a link, image or `#fragment` that resolves to nothing, repeats an id on a page, or lacks a page's Markdown, or its `NOTICE.txt` names a licence file the build does not publish;
- a link in the Markdown pages or `llms.txt` resolves to nothing;
- a class the build writes hidden sets a `display` without a `[hidden]` rule.

The checks skip links into `screenshots/` when the doona checkout has no `docs/screenshots/`. CI renders the screenshots only on a push to `main` and on a manual run.

`pnpm test` runs the copy buttons, nav collapse, tabs and Copy for LLM from the browser script. It also checks GitHub's heading ids, the icons, the Markdown pages, the root and 404 redirects, the page actions and the search index.

## Writing rules

- Keep the three locales in step. A change to one page goes into all three in the same pull request, with the same headings, anchors, code blocks and links.
- Write Chinese in a formal, written register, as product documentation reads. Avoid chat phrasing and filler.
- Write `zh-CN` in Simplified characters and `zh-TW` in Traditional characters. Never mix the two scripts in one page.
- Write English prose in plain, direct sentences, and keep commands, paths and option names exact.
