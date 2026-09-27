// Checks docs/ as GitHub renders it: every relative link and image resolves, every #anchor names an <a name> or a
// generated heading slug on its target page, docs/anchors.json matches the pages, and the locales have the same pages,
// anchors and heading levels. The README files are checked for links too.
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const docs = join(root, 'docs');
const locales = ['en', 'zh-CN', 'zh-TW'];
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

// GitHub's heading ids (github-slugger): lower case, drop punctuation and symbols, spaces to hyphens, repeats numbered.
function slugs(lines) {
  const seen = new Map();
  const out = [];
  for (const line of lines) {
    const match = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2]
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_~]/g, '');
    const base = text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
      .replace(/ /g, '-');
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    out.push(count ? `${base}-${count}` : base);
  }
  return out;
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
      ids: new Set([...names, ...slugs(headingLines)])
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
      const resolved = path ? resolve(dirname(file), decodeURIComponent(path)) : file;
      if (!resolved.startsWith(root) || !existsSync(resolved)) {
        fail(file, `${where} does not resolve`);
        continue;
      }
      if (anchor === undefined) continue;
      if (!resolved.endsWith('.md') || statSync(resolved).isDirectory()) {
        fail(file, `${where} has an anchor on a file that is not Markdown`);
        continue;
      }
      if (!page(resolved).ids.has(decodeURIComponent(anchor))) fail(file, `${where} names no anchor or heading on ${relative(root, resolved)}`);
    }
  });
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
const anchors = JSON.parse(readFileSync(join(docs, 'anchors.json'), 'utf8'));
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

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`docs: ${locales.length} locales, ${reference.length} pages each, ${Object.keys(anchors).length} anchors`);
