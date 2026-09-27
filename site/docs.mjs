// What the docs build and the docs checker share: the locales, the page order and GitHub's heading ids.
import {readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';

export const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
export const docs = join(root, 'docs');

// In the order of the language line at the top of every page.
export const locales = ['en', 'zh-CN', 'zh-TW'];

// Navigation order, in the sections the sidebar shows under the headings in site/strings.mjs; docs/<locale>/ holds
// exactly these pages.
export const groups = {
  start: ['index', 'requirements', 'install'],
  guides: ['configuration', 'features', 'troubleshooting'],
  contributing: ['development']
};
export const pages = Object.values(groups).flat();

// Anchor -> page (file name without .md). The app's docsHref and the checker read the same file.
export const anchors = JSON.parse(readFileSync(join(docs, 'anchors.json'), 'utf8'));

// GitHub's heading ids (github-slugger): lower case, drop punctuation and symbols, spaces to hyphens, repeats numbered.
// Returns a function that takes each heading's Markdown source in page order.
export function slugger() {
  const seen = new Map();
  return source => {
    const text = source
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_~]/g, '');
    const base = text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
      .replace(/ /g, '-');
    // A numbered id can be taken by a heading whose own text ends in that number, so count on until one is free.
    let id = base;
    while (seen.has(id)) {
      const count = seen.get(base) + 1;
      seen.set(base, count);
      id = `${base}-${count}`;
    }
    seen.set(id, 0);
    return id;
  };
}
