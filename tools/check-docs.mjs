// Checks docs/ as GitHub renders it: every relative link and image resolves in this repository and every link to
// doona's files on GitHub in doona's checkout (DOONA_DIR), every #anchor names an <a name> or a generated heading slug
// on its target page (tools/links.mjs), docs/anchors.json matches the pages, and the locales have the same pages,
// anchors and heading levels. The README files are checked for links too, and every anchor doona's docsHref links is in
// docs/anchors.json on the same page. Then it renders the site (site/build.mjs) for both base paths and checks that
// every internal link, image and #id in the HTML resolves, that every page has its Markdown, and that every link in
// the Markdown pages and llms.txt resolves.
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join, relative} from 'node:path';
import {anchors, awaitsScreenshots, docs, doona, locales, pages as pageOrder, root} from '../site/docs.mjs';
import {linkFailures, page} from './links.mjs';
import {render} from '../site/build.mjs';
import {styles} from '../site/build/assets.mjs';

const failures = [];
const fail = (file, message) => failures.push(`${relative(root, file)}: ${message}`);

function checkLinks(file) {
  for (const failure of linkFailures(file)) fail(file, failure);
}

const pageSets = new Map(
  locales.map(locale => [
    locale,
    readdirSync(join(docs, locale))
      .filter(name => name.endsWith('.md'))
      .sort()
  ])
);
const reference = pageSets.get('en');
if (
  reference.join() !==
  pageOrder
    .map(name => `${name}.md`)
    .sort()
    .join()
)
  fail(join(docs, 'en'), `pages ${reference.join(', ')} differ from the navigation in site/docs.mjs: ${pageOrder.join(', ')}`);
for (const locale of locales) {
  const names = pageSets.get(locale);
  if (names.join() !== reference.join()) fail(join(docs, locale), `pages ${names.join(', ')} differ from en: ${reference.join(', ')}`);
  for (const name of names) {
    const file = join(docs, locale, name);
    checkLinks(file);
    const counterpart = join(docs, 'en', name);
    if (locale === 'en' || !existsSync(counterpart)) continue;
    const mine = page(file);
    const theirs = page(counterpart);
    if (mine.names.join() !== theirs.names.join()) fail(file, `anchors ${mine.names.join(', ')} differ from en: ${theirs.names.join(', ')}`);
    if (mine.levels.join() !== theirs.levels.join()) fail(file, `heading levels ${mine.levels.join('')} differ from en: ${theirs.levels.join('')}`);
  }
}

// Every anchor lives on exactly one page, the same page in every locale, and anchors.json lists each one.
for (const locale of locales) {
  const owners = new Map();
  for (const name of pageSets.get(locale)) {
    for (const anchor of page(join(docs, locale, name)).names) {
      const slug = name.replace(/\.md$/, '');
      if (owners.has(anchor)) fail(join(docs, locale, name), `anchor ${anchor} is also on ${owners.get(anchor)}`);
      owners.set(anchor, slug);
      if (anchors[anchor] !== slug) fail(join(docs, locale, name), `anchor ${anchor} is not mapped to ${slug} in docs/anchors.json`);
    }
  }
  for (const [anchor, slug] of Object.entries(anchors)) {
    if (owners.get(anchor) !== slug) fail(join(docs, 'anchors.json'), `${anchor} is not an <a name> on ${locale}/${slug}.md`);
  }
}

for (const name of readdirSync(root).filter(name => /^README.*\.md$/.test(name))) checkLinks(join(root, name));

// doona's docsHref links a section through its own map of the anchors it uses, each to its page. Every entry there
// must be an anchor this site keeps, on the same page, so moving or dropping one the app links fails here.
const appAnchors = 'src/features/shared/docsAnchors.json';
if (!existsSync(join(doona, appAnchors))) failures.push(`doona ${appAnchors}: missing`);
else {
  for (const [anchor, slug] of Object.entries(JSON.parse(readFileSync(join(doona, appAnchors), 'utf8')))) {
    if (anchors[anchor] !== slug) failures.push(`doona ${appAnchors}: ${anchor} is on ${anchors[anchor] ?? 'no page'} here, not ${slug}`);
  }
}

// The generated site, for github.io and for a domain of its own: every internal href and src names a file the build
// writes, every #fragment an id on that page, and no page repeats an id.
const hiddenClasses = new Set();
for (const base of ['/doona-docs/', '/']) {
  let site;
  try {
    site = render({base});
  } catch (error) {
    failures.push(`site (${base}): ${error.message}`);
    continue;
  }
  const html = new Map();
  for (const [path, file] of site) {
    if (!path.endsWith('.html')) continue;
    const text = file.text;
    const ids = [...text.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    for (const id of new Set(ids.filter((id, index) => ids.indexOf(id) !== index))) failures.push(`site (${base}) ${path}: id ${id} repeats`);
    if (!/^<!doctype html>\n<html lang="[^"]+">/.test(text) || !/<title>[^<]+<\/title>/.test(text)) failures.push(`site (${base}) ${path}: no lang or title`);
    html.set(path, {text, ids: new Set(ids)});
    for (const match of text.matchAll(/<[a-z]+\s[^>]*\bclass="([^"]+)"[^>]*\shidden[\s>]/g)) for (const name of match[1].split(' ')) hiddenClasses.add(name);
  }
  for (const [path, {text}] of html) {
    const urls = [...text.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)].map(match => match[1]);
    for (const url of urls) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(url)) continue;
      const where = `site (${base}) ${path}: ${url}`;
      const [target, fragment] = url.split('#');
      let file = path;
      if (target) {
        if (!target.startsWith(base)) {
          failures.push(`${where} is not under the base path`);
          continue;
        }
        // A query only versions the file (site/build/assets.mjs), so it names the same file.
        file = decodeURI(target.slice(base.length).split('?')[0]);
        if (file === '' || file.endsWith('/')) file += 'index.html';
      }
      if (!site.has(file) && !awaitsScreenshots(file)) failures.push(`${where} names no file the build writes`);
      else if (fragment !== undefined && !html.get(file)?.ids.has(decodeURIComponent(fragment))) failures.push(`${where} names no id on ${file}`);
    }
  }
  // The Markdown pages and llms.txt link by path here, as DOCS_ORIGIN is not set; a #fragment on a Markdown page names
  // an id on its HTML page.
  for (const path of html.keys()) {
    if (locales.includes(path.split('/')[0]) && !site.has(path.replace(/\.html$/, '.md'))) failures.push(`site (${base}) ${path}: no Markdown beside it`);
  }
  for (const [path, file] of site) {
    if (!path.endsWith('.md') && path !== 'llms.txt') continue;
    for (const [, url] of file.text.matchAll(/\]\(\s*<?([^)\s>]+)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(url)) continue;
      const where = `site (${base}) ${path}: ${url}`;
      const [target, fragment] = url.split('#');
      if (!target.startsWith(base)) {
        failures.push(`${where} is not a path under the base`);
        continue;
      }
      const linked = decodeURI(target.slice(base.length));
      const page = linked.replace(/\.md$/, '.html');
      if (!site.has(linked) && !awaitsScreenshots(linked)) failures.push(`${where} names no file the build writes`);
      else if (fragment !== undefined && !html.get(page)?.ids.has(decodeURIComponent(fragment))) failures.push(`${where} names no id on ${page}`);
    }
  }
}

// An element the build writes hidden stays hidden until site.js shows it. A display the stylesheet gives its class
// outranks the browser's own [hidden] rule, so the stylesheet has to hide it again.
const css = styles().replace(/\/\*[\s\S]*?\*\//g, '');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match => ({selectors: match[1].split(',').map(selector => selector.trim()), body: match[2]}));
for (const name of hiddenClasses) {
  const shown = rules.some(rule => rule.selectors.some(selector => selector.endsWith(`.${name}`)) && /(^|;)\s*display:\s*(?!none)/.test(rule.body));
  const hidden = rules.some(rule => rule.selectors.includes(`.${name}[hidden]`) && /(^|;)\s*display:\s*none/.test(rule.body));
  if (shown && !hidden) failures.push(`site/styles: .${name} sets a display, so .${name}[hidden] needs display: none`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`docs: ${locales.length} locales, ${reference.length} pages each, ${Object.keys(anchors).length} anchors`);
