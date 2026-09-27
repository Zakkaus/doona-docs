// What the docs build and the docs checker share: the locales, the page order and GitHub's heading ids.
import {readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';

export const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
export const docs = join(root, 'docs');

// In the order of the language line at the top of every page.
export const locales = ['en', 'zh-CN', 'zh-TW'];

// Navigation order; docs/<locale>/ holds exactly these pages.
export const pages = ['index', 'requirements', 'install', 'configuration', 'features', 'troubleshooting', 'development'];

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
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };
}
