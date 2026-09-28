// What the docs build and the docs checker share: the locales, the page order and GitHub's heading ids.
import {existsSync, readFileSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';

export const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
export const docs = join(root, 'docs');

// A checkout of Zakkaus/doona: the site takes its palette, sizes, icons, logo, dae colouring and notices from the app,
// and the pages link its screenshots and source files. DOONA_DIR names it, relative to this repository; the default is
// a checkout next to this one.
export const doona = resolve(root, process.env.DOONA_DIR || '../doona');
if (!existsSync(join(doona, 'src/ui/styles/palettes/rose-pine.css')))
  throw new Error(`${doona} is not a doona checkout: clone Zakkaus/doona there or point DOONA_DIR at one`);

const repositoryOf = dir => JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).repository.url.replace(/\.git$/, '');
// doona's repository on GitHub, which the top bar links, and this one's.
export const repository = repositoryOf(doona);
export const ownRepository = repositoryOf(root);

// doona keeps no screenshots in git: CI renders them into its docs/screenshots before the build, which publishes all
// of them under screenshots/ (.github/workflows/docs.yml). Without that directory, a link into screenshots/, a path
// relative to docs/, is left for the deploy to fill and the checks skip it.
export const screenshots = join(doona, 'docs/screenshots');

// A path a page links, on disk. A link into ../screenshots/ names doona's docs/screenshots; every other relative link
// names a file in this repository, since a relative path into doona's source would be broken on GitHub. The pages link
// doona's files by their GitHub URL instead (tools/links.mjs).
export function locate(absolute) {
  const inScreenshots = relative(join(docs, 'screenshots'), absolute);
  return inScreenshots.startsWith('..') || isAbsolute(inScreenshots) ? absolute : join(screenshots, inScreenshots);
}
export const awaitsScreenshots = path => !existsSync(screenshots) && path.split(sep).join('/').startsWith('screenshots/');

// In the order of the language line at the top of every page.
export const locales = ['en', 'zh-CN', 'zh-TW'];

// Navigation order, in the sections the sidebar shows under the headings in site/strings.mjs; docs/<locale>/ holds
// exactly these pages.
export const groups = {
  start: ['index', 'requirements'],
  install: ['install-debian', 'install-fedora', 'install-arch', 'install-gentoo', 'install-openwrt', 'install-manual', 'install'],
  firstRun: ['minimal-configuration', 'service-management', 'first-sign-in'],
  guides: ['configuration', 'features', 'troubleshooting'],
  contributing: ['development']
};
export const pages = Object.values(groups).flat();

// Anchor -> page (file name without .md). doona's docsHref links through a copy of the entries it uses, which
// tools/check-docs.mjs holds to this map.
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
