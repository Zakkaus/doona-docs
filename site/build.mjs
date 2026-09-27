// Renders docs/<locale>/*.md into a static site: one HTML page per Markdown page with the page's Markdown beside it,
// llms.txt listing the Markdown pages, a root page that sends the browser to its language, and a 404 page.
// `node site/build.mjs` writes dist-docs/; tools/check-docs.mjs calls render() directly. DOCS_BASE is the path the site
// is served under: /doona-docs/ on github.io, / on a domain of its own. DOCS_ORIGIN, such as https://zakkaus.github.io,
// makes the Markdown pages and llms.txt link by full URL, so the links still work once the text is pasted elsewhere;
// without it they link by path. DOONA_DIR names the doona checkout the build reads the app's styles, icons and logo
// from (site/docs.mjs).
//
// The build is split by job, in site/build/: markdown.mjs parses and renders a page, templates.mjs and nav.mjs draw the
// HTML around it, exports.mjs writes the Markdown, search index and llms.txt, assets.mjs the stylesheet, script and
// copied files, and icons.mjs and common.mjs hold what they share. This file runs them in order.
import {copyFileSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {locales, pages, root} from './docs.mjs';
import {addAssets} from './build/assets.mjs';
import {llmsTxt, markdown, searchIndex} from './build/exports.mjs';
import {parse} from './build/markdown.mjs';
import {notFoundPage, page, rootPage} from './build/templates.mjs';

export function render({base = '/doona-docs/', origin = ''} = {}) {
  if (!/^\/(.+\/)?$/.test(base)) throw new Error(`DOCS_BASE must start and end with a slash: ${base}`);
  if (!/^(https?:\/\/[^/]+)?$/.test(origin)) throw new Error(`DOCS_ORIGIN must be a scheme and host with no path: ${origin}`);
  // Each published path and its content: {text} to write, or {from} to copy. parse() adds the images a page links.
  const files = new Map();
  const parsedByLocale = new Map();
  for (const locale of locales) {
    const parsed = pages.map(name => parse(base, files, locale, name));
    parsedByLocale.set(locale, parsed);
    files.set(`${locale}/search.json`, {text: searchIndex(base, locale, parsed)});
    for (const current of parsed) {
      files.set(`${locale}/${current.name}.html`, {text: page(base, origin, locale, parsed, current)});
      files.set(`${locale}/${current.name}.md`, {text: markdown(base, origin, files, locale, current.name)});
    }
  }
  files.set('llms.txt', {text: llmsTxt(base, origin, parsedByLocale)});
  files.set('index.html', {text: rootPage(base)});
  files.set('404.html', {text: notFoundPage(base)});
  addAssets(files);
  return files;
}

export function write(files, out) {
  rmSync(out, {recursive: true, force: true});
  for (const [path, file] of files) {
    const target = join(out, path);
    mkdirSync(dirname(target), {recursive: true});
    if ('from' in file) copyFileSync(file.from, target);
    else writeFileSync(target, file.text);
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const base = process.env.DOCS_BASE || undefined;
  const origin = process.env.DOCS_ORIGIN || undefined;
  const out = join(root, 'dist-docs');
  const files = render({base, origin});
  write(files, out);
  console.log(`docs: ${files.size} files in ${relative(root, out)}/`);
}
