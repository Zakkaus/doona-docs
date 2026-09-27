// The files the site publishes besides its pages: the stylesheet joined from site/styles/, the script, the content
// hashes the pages version them by, and the fonts, logo, licences and screenshots copied as they are.
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join, relative, sep} from 'node:path';
import {doona, root, screenshots} from '../docs.mjs';

// The published site.css is the files in site/styles/ joined in this order, which is the cascade order: a later file
// wins over an earlier one at equal specificity. A new file goes in the list next to the component it styles.
const styleFiles = [
  'fonts',
  'tokens',
  'base',
  'topbar',
  'layout',
  'nav',
  'panel',
  'outline',
  'hover',
  'page-actions',
  'content',
  'code',
  'tabs',
  'tables',
  'callouts',
  'chooser',
  'phone',
  'search',
  'motion',
  'section-menu'
];
export const styles = () => styleFiles.map(name => readFileSync(join(root, `site/styles/${name}.css`), 'utf8')).join('\n');

// The stylesheet with Rosé Pine Dawn and Moon, doona's default palette, written in as light-dark() pairs from the app's
// own src/ui/styles/palettes.css in place of the /* palette */ line, and the radii, type sizes, duration and easing the
// sheet uses written in from src/ui/styles/motion.css, in that file's order, in place of the /* sizes */ line.
function stylesheet() {
  const palettes = readFileSync(join(doona, 'src/ui/styles/palettes.css'), 'utf8');
  const colours = selector => {
    const start = palettes.indexOf(`${selector} {`);
    if (start < 0) throw new Error(`src/ui/styles/palettes.css: no ${selector} block`);
    return new Map([...palettes.slice(start, palettes.indexOf('}', start)).matchAll(/(--rp-[\w-]+):\s*(#[0-9a-f]+);/g)].map(match => [match[1], match[2]]));
  };
  const light = colours(":root[data-family='rose-pine']");
  const dark = colours(":root[data-flavour='moon'][data-scheme='dark']");
  const unpaired = [...light.keys()].filter(name => !dark.has(name));
  if (!light.size || unpaired.length) throw new Error(`src/ui/styles/palettes.css: Moon does not set ${unpaired.join(', ') || 'any colour'}`);
  const css = styles();
  const marker = '  /* palette */\n';
  if (!css.includes(marker)) throw new Error('site/styles/tokens.css: no /* palette */ line');
  const sizesMarker = '  /* sizes */\n';
  if (!css.includes(sizesMarker)) throw new Error('site/styles/tokens.css: no /* sizes */ line');
  const motion = readFileSync(join(doona, 'src/ui/styles/motion.css'), 'utf8');
  const scaleName = '--rp-(?:(?:r|text)-[\\w-]+|duration|ease)';
  const scale = new Map([...motion.matchAll(new RegExp(`(${scaleName}):\\s*(\\d+px|\\d+ms|cubic-bezier\\([\\d., ]+\\));`, 'g'))].map(match => [match[1], match[2]]));
  const used = new Set([...css.matchAll(new RegExp(`var\\((${scaleName})\\)`, 'g'))].map(match => match[1]));
  const missing = [...used].filter(name => !scale.has(name));
  if (missing.length) throw new Error(`src/ui/styles/motion.css: no ${missing.join(', ')}`);
  const sizes = [...scale].filter(([name]) => used.has(name));
  return css
    .replace(marker, [...light].map(([name, value]) => `  ${name}: light-dark(${value}, ${dark.get(name)});\n`).join(''))
    .replace(sizesMarker, sizes.map(([name, value]) => `  ${name}: ${value};\n`).join(''));
}

// The published site.js is the files in site/scripts/ joined in this order, one feature each. They run as one module,
// so they share one scope: a top-level name is declared in one file only, and a file uses only the names of files
// before it. Joining them keeps one request and one ?v= hash; served as separate modules, every import would need a
// hash of its own.
const scriptFiles = ['theme', 'language', 'nav', 'copy', 'menus', 'tabs', 'page-actions', 'press', 'search', 'outline'];
export const script = () => scriptFiles.map(name => readFileSync(join(root, `site/scripts/${name}.js`), 'utf8')).join('\n');

// Pages link the stylesheet and script with a hash of their content, so a browser holding the previous ones in its
// cache (GitHub Pages sends max-age=600) fetches the new ones with the new pages instead of mixing the two.
let versions;
export function assetVersions() {
  const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 10);
  versions ??= {css: hash(stylesheet()), js: hash(script())};
  return versions;
}

// Adds the files copied as they are, and the stylesheet and script, to files.
export function addAssets(files) {
  // The README links the screenshots here, including those no page shows.
  if (existsSync(screenshots)) {
    for (const entry of readdirSync(screenshots, {recursive: true, withFileTypes: true})) {
      if (!entry.isFile()) continue;
      const from = join(entry.parentPath, entry.name);
      files.set(`screenshots/${relative(screenshots, from).split(sep).join('/')}`, {from});
    }
  }
  files.set('site.css', {text: stylesheet()});
  files.set('site.js', {text: script()});
  for (const name of ['source-sans-3.woff2', 'source-code-pro.woff2', 'LICENSE-SourceSans3.txt', 'LICENSE-SourceCodePro.txt']) {
    files.set(`fonts/${name}`, {from: join(root, 'site/fonts', name)});
  }
  files.set('logo.svg', {from: join(doona, 'public/logo.svg')});
  // The icons the pages draw are Adobe Spectrum artwork and the GitHub mark: their notice and terms travel with them, as
  // in the release archives. This repository's NOTICE follows doona's and covers the pages, the fonts and the icons and
  // logos in site/icons/.
  files.set('NOTICE.txt', {text: readFileSync(join(doona, 'NOTICE'), 'utf8') + '\n' + readFileSync(join(root, 'NOTICE'), 'utf8')});
  files.set('LICENSES/CC-BY-4.0.txt', {from: join(root, 'LICENSES/CC-BY-4.0.txt')});
  // The distribution logos on the search cards (site/icons/distros.mjs).
  for (const licence of ['CC0-1.0', 'CC-BY-SA-3.0', 'CC-BY-SA-2.5'])
    files.set(`LICENSES/${licence}.txt`, {from: join(root, `LICENSES/${licence}.txt`)});
  files.set('LICENSES/Apache-2.0.txt', {from: join(doona, 'LICENSES/Apache-2.0.txt')});
  files.set('LICENSES/LicenseRef-GitHub-Logos.txt', {from: join(doona, 'LICENSES/LicenseRef-GitHub-Logos.txt')});
  // GitHub Pages would otherwise run Jekyll over the files.
  files.set('.nojekyll', {text: ''});
}
