// Checks docs/ as GitHub renders it: every relative link and image resolves, every #anchor names an <a name> or a
// generated heading slug on its target page, docs/anchors.json matches the pages, and the locales have the same pages,
// anchors and heading levels. The README files are checked for links too, every anchor the app passes to docsHref
// is in docs/anchors.json, and every GitHub link the app makes into this repository resolves. Then it renders the
// site (site/build.mjs) for both base paths and checks that every internal link, image and #id in the HTML resolves.
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {anchors, docs, locales, pages as pageOrder, root, slugger} from '../site/docs.mjs';
import {render} from '../site/build.mjs';

const failures = [];
const fail = (file, message) => failures.push(`${relative(root, file)}: ${message}`);

// Prose lines outside fenced code blocks, with inline code removed so a literal `[x](y)` is not read as a link.
function proseLines(text) {
  let fenced = false;
  return text.split('\n').map(line => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return '';
    }
    return fenced ? '' : line.replace(/`[^`]*`/g, '');
  });
}

const pages = new Map();
function page(file) {
  if (!pages.has(file)) {
    const raw = readFileSync(file, 'utf8');
    // Headings are read from the raw text: inline code in a heading still counts toward its slug.
    let fenced = false;
    const headingLines = raw.split('\n').filter(line => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      return !fenced && /^#{1,6}\s/.test(line);
    });
    const lines = proseLines(raw);
    const names = [...raw.matchAll(/<a name="([^"]+)"><\/a>/g)].map(match => match[1]);
    pages.set(file, {
      lines,
      names,
      levels: headingLines.map(line => /^#+/.exec(line)[0].length),
      ids: new Set([...names, ...headingLines.map(line => /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line)[1]).map(slugger())])
    });
  }
  return pages.get(file);
}

function targets(line) {
  const found = [];
  for (const match of line.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) found.push(match[1]);
  for (const match of line.matchAll(/<(?:img|source|a)\b[^>]*?\s(?:src|srcset|href)="([^"]+)"/g)) found.push(match[1]);
  return found;
}

function checkLinks(file) {
  const {lines} = page(file);
  lines.forEach((line, index) => {
    for (const target of targets(line)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      const [path, anchor] = target.split('#');
      const where = `line ${index + 1}: ${target}`;
      checkTarget(file, where, path ? resolve(dirname(file), decodeURIComponent(path)) : file, anchor);
    }
  });
}

// A link from file to resolved, a path in the repository, and the #anchor on it if any.
function checkTarget(file, where, resolved, anchor) {
  if (!resolved.startsWith(root) || !existsSync(resolved)) return fail(file, `${where} does not resolve`);
  if (anchor === undefined) return;
  if (!resolved.endsWith('.md') || statSync(resolved).isDirectory()) return fail(file, `${where} has an anchor on a file that is not Markdown`);
  if (!page(resolved).ids.has(decodeURIComponent(anchor))) fail(file, `${where} names no anchor or heading on ${relative(root, resolved)}`);
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

// Every anchor the app links with docsHref(lang, 'anchor') is in docs/anchors.json, and every link the app makes to a
// file in this repository on GitHub, such as README.md#install, names a file and heading that still exist.
for (const file of readdirSync(join(root, 'src'), {recursive: true}).filter(name => /\.tsx?$/.test(name))) {
  const path = join(root, 'src', file);
  const text = readFileSync(path, 'utf8');
  for (const match of text.matchAll(/docsHref\([^,()]+,\s*'([^']+)'/g)) {
    if (!(match[1] in anchors)) fail(path, `docsHref anchor ${match[1]} is not in docs/anchors.json`);
  }
  for (const match of text.matchAll(/github\.com\/Zakkaus\/doona\/(?:blob|tree)\/main\/([^\s'"`#?)]+)(?:#([^\s'"`)]+))?/g)) {
    checkTarget(path, match[0], resolve(root, decodeURIComponent(match[1])), match[2]);
  }
}

// The generated site, for github.io and for a domain of its own: every internal href and src names a file the build
// writes, every #fragment an id on that page, and no page repeats an id.
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
        file = decodeURI(target.slice(base.length));
        if (file === '' || file.endsWith('/')) file += 'index.html';
      }
      if (!site.has(file)) failures.push(`${where} names no file the build writes`);
      else if (fragment !== undefined && !html.get(file)?.ids.has(decodeURIComponent(fragment))) failures.push(`${where} names no id on ${file}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`docs: ${locales.length} locales, ${reference.length} pages each, ${Object.keys(anchors).length} anchors`);
