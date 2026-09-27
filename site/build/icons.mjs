// The icons the pages draw, read from doona's own components so the two stay the same, and the app's logo.
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {doona} from '../docs.mjs';

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
  return `<svg class="icon" viewBox="${viewBox}" aria-hidden="true" focusable="false">${shapes.join('')}</svg>`;
}
export const icons = {
  github: icon('GitHub'),
  demo: icon('Visibility'),
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
  document: icon('FileText'),
  info: icon('InfoCircle'),
  alert: icon('AlertTriangle')
};

// The app's logo, the same file in both schemes.
export const logo = base => `<img src="${base}logo.svg" alt="" width="28" height="28">`;
