// The icons the pages draw, read from doona's own components so the two stay the same, the Spectrum icons and
// distribution logos this repository keeps in site/icons/ for what doona does not draw, and the app's logo.
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {doona} from '../docs.mjs';
import distros from '../icons/distros.mjs';
import spectrum from '../icons/spectrum.mjs';

const svg = (viewBox, shapes, className = 'icon') =>
  `<svg class="${className}" viewBox="${viewBox}" aria-hidden="true" focusable="false">${shapes.join('')}</svg>`;
const paths = list => [list].flat().map(d => `<path fill="currentColor" d="${d}"/>`);

// Only paths and circles are copied, so an icon drawn with any other element fails the build rather than losing that
// part.
const shapeAttributes = {path: ['d'], circle: ['cx', 'cy', 'r']};
function icon(name) {
  const file = `src/ui/icons/${name}.tsx`;
  const source = readFileSync(join(doona, file), 'utf8');
  const viewBox = /viewBox="([^"]+)"/.exec(source)?.[1];
  const shapes = [...source.matchAll(/<(\w+)\s([^>]*?)\/>/g)].map(([, tag, attributes]) => {
    if (!(tag in shapeAttributes)) throw new Error(`${file}: <${tag}> is not a path or circle`);
    const values = shapeAttributes[tag].map(attribute => {
      const value = new RegExp(`(?:^|\\s)${attribute}="([^"]+)"`).exec(attributes)?.[1];
      if (!value) throw new Error(`${file}: <${tag}> has no ${attribute}`);
      return ` ${attribute}="${value}"`;
    });
    return `<${tag} fill="currentColor"${values.join('')}/>`;
  });
  if (!viewBox || !shapes.length) throw new Error(`${file}: no viewBox or shape`);
  return svg(viewBox, shapes);
}
const workflow = name => svg('0 0 20 20', paths(spectrum[name]));
const distro = slug => svg('0 0 24 24', paths(distros[slug]), 'icon logo');
export const icons = {
  github: icon('GitHub'),
  language: icon('Translate'),
  chevron: icon('ChevronDown'),
  pages: icon('ListBulleted'),
  copy: icon('Copy'),
  copied: icon('Checkmark'),
  moon: icon('Contrast'),
  sun: icon('Lighten'),
  more: icon('MoreVertical'),
  search: icon('Search'),
  close: icon('Close'),
  menu: icon('TextAlignLeft'),
  info: icon('InfoCircle'),
  alert: icon('AlertTriangle'),
  demo: workflow('Play')
};

// The picture on each page's search card: what the page is about, or the logo of the distribution an install page
// covers.
export const pageIcons = {
  index: icon('Home'),
  requirements: workflow('ListMultiSelect'),
  'install-debian': distro('debian'),
  'install-fedora': distro('fedora'),
  'install-arch': distro('archlinux'),
  'install-gentoo': distro('gentoo'),
  'install-openwrt': distro('openwrt'),
  'install-manual': workflow('Prompt'),
  install: icon('Download'),
  'minimal-configuration': workflow('Properties'),
  'service-management': icon('Refresh'),
  'first-sign-in': workflow('Key'),
  configuration: workflow('Settings'),
  features: workflow('Apps'),
  troubleshooting: workflow('HelpCircle'),
  development: workflow('Code')
};

// The app's logo, the same file in both schemes.
export const logo = base => `<img src="${base}logo.svg" alt="" width="28" height="28">`;
