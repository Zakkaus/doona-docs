// Renders docs/<locale>/*.md into a static site: one HTML page per Markdown page, a root page that sends the browser to
// its language, and a 404 page. `node site/build.mjs` writes dist-docs/; tools/check-docs.mjs calls render() directly.
// DOCS_BASE is the path the site is served under: /doona-docs/ on github.io, / on a domain of its own.
import MarkdownIt from 'markdown-it';
import {copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {docs, groups, locales, pages, root, slugger} from './docs.mjs';
import {highlight, languages} from './highlight.mjs';
import strings from './strings.mjs';

const repository = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).repository.url.replace(/\.git$/, '');
const alerts = ['note', 'tip', 'important', 'warning', 'caution'];

const md = new MarkdownIt({html: true});
md.renderer.rules.table_open = () => '<div class="table"><table>\n';
md.renderer.rules.table_close = () => '</table></div>\n';
md.renderer.rules.blockquote_open = (tokens, index, options, env, self) => {
  const alert = tokens[index].meta?.alert;
  const title = alert ? `<p class="callout-title">${strings[env.locale][alert]}</p>\n` : '';
  return self.renderToken(tokens, index, options) + title;
};
// parse() has checked the fence's language. site.js shows the copy button where the clipboard can be written.
md.renderer.rules.fence = (tokens, index, options, env) => {
  const token = tokens[index];
  const language = token.info.trim();
  const copy = `<button type="button" class="copy" aria-label="${strings[env.locale].copy}" hidden>${icons.copy}${icons.copied}</button>`;
  return `<div class="code"><pre><code class="language-${language}">${highlight(token.content, language)}</code></pre>${copy}</div>\n`;
};

const escape = text => text.replace(/[&<>"]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[char]);

// The icons doona draws, read from its own components so the two stay the same. Only paths and circles are copied, so
// an icon drawn with any other element fails the build rather than losing that part.
const shapeAttributes = {path: ['d'], circle: ['cx', 'cy', 'r']};
function icon(name) {
  const file = `src/ui/icons/${name}.tsx`;
  const source = readFileSync(join(root, file), 'utf8');
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
const icons = {
  github: icon('GitHub'),
  language: icon('Translate'),
  chevron: icon('ChevronDown'),
  pages: icon('ListBulleted'),
  copy: icon('Copy'),
  copied: icon('Checkmark'),
  moon: icon('Contrast'),
  sun: icon('Lighten')
};

// site/site.css with Rosé Pine Dawn and Moon, doona's default palette, written in as light-dark() pairs from the app's
// own src/ui/styles/palettes.css in place of the /* palette */ line, and the radii and type sizes the sheet uses written
// in from src/ui/styles/motion.css, in that file's order, in place of the /* sizes */ line.
function stylesheet() {
  const palettes = readFileSync(join(root, 'src/ui/styles/palettes.css'), 'utf8');
  const colours = selector => {
    const start = palettes.indexOf(`${selector} {`);
    if (start < 0) throw new Error(`src/ui/styles/palettes.css: no ${selector} block`);
    return new Map([...palettes.slice(start, palettes.indexOf('}', start)).matchAll(/(--rp-[\w-]+):\s*(#[0-9a-f]+);/g)].map(match => [match[1], match[2]]));
  };
  const light = colours(":root[data-family='rose-pine']");
  const dark = colours(":root[data-flavour='moon'][data-scheme='dark']");
  const unpaired = [...light.keys()].filter(name => !dark.has(name));
  if (!light.size || unpaired.length) throw new Error(`src/ui/styles/palettes.css: Moon does not set ${unpaired.join(', ') || 'any colour'}`);
  const css = readFileSync(join(root, 'site/site.css'), 'utf8');
  const marker = '  /* palette */\n';
  if (!css.includes(marker)) throw new Error('site/site.css: no /* palette */ line');
  const sizesMarker = '  /* sizes */\n';
  if (!css.includes(sizesMarker)) throw new Error('site/site.css: no /* sizes */ line');
  const motion = readFileSync(join(root, 'src/ui/styles/motion.css'), 'utf8');
  const scale = new Map([...motion.matchAll(/(--rp-(?:r|text)-[\w-]+):\s*(\d+px);/g)].map(match => [match[1], match[2]]));
  const used = new Set([...css.matchAll(/var\((--rp-(?:r|text)-[\w-]+)\)/g)].map(match => match[1]));
  const missing = [...used].filter(name => !scale.has(name));
  if (missing.length) throw new Error(`src/ui/styles/motion.css: no ${missing.join(', ')}`);
  const sizes = [...scale].filter(([name]) => used.has(name));
  return css
    .replace(marker, [...light].map(([name, value]) => `  ${name}: light-dark(${value}, ${dark.get(name)});\n`).join(''))
    .replace(sizesMarker, sizes.map(([name, value]) => `  ${name}: ${value};\n`).join(''));
}

// Heading text without Markdown, for titles, navigation and the table of contents.
const plain = inline =>
  inline.children.map(child => (child.type === 'text' || child.type === 'code_inline' ? child.content : child.type === 'softbreak' ? ' ' : '')).join('');

const pageUrl = (base, locale, name) => `${base}${locale}/${name === 'index' ? '' : `${name}.html`}`;

// A link as the site serves it: pages and images in docs/ under the base, other repository files on GitHub. An image it
// links is added to files, the map render() writes.
function rewrite(base, files, target, file) {
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) return target;
  const [path, ...hash] = target.split('#');
  const suffix = hash.length ? `#${hash.join('#')}` : '';
  const absolute = resolve(dirname(file), decodeURIComponent(path));
  const inDocs = relative(docs, absolute);
  if (inDocs.startsWith('..') || isAbsolute(inDocs)) {
    const inRepo = relative(root, absolute);
    if (inRepo.startsWith('..') || isAbsolute(inRepo)) throw new Error(`${file}: ${target} is outside the repository`);
    const kind = existsSync(absolute) && statSync(absolute).isDirectory() ? 'tree' : 'blob';
    return `${repository}/${kind}/main/${encodeURI(inRepo.split(sep).join('/'))}${suffix}`;
  }
  const parts = inDocs.split(sep);
  if (inDocs.endsWith('.md')) {
    const [locale, name] = parts;
    if (parts.length !== 2 || !locales.includes(locale)) throw new Error(`${file}: ${target} is not a docs page`);
    return pageUrl(base, locale, name.slice(0, -3)) + suffix;
  }
  // Only files that exist are published; a missing one leaves the link dangling for the checker to report.
  if (existsSync(absolute)) files.set(parts.join('/'), {from: absolute});
  return base + encodeURI(parts.join('/')) + suffix;
}

function parse(base, files, locale, name) {
  const file = join(docs, locale, `${name}.md`);
  const tokens = md.parse(readFileSync(file, 'utf8'), {});

  // The first paragraph links the page in the other languages for readers on GitHub; the top bar does that here.
  const others = locales.filter(other => other !== locale).map(other => `../${other}/${name}.md`);
  const first = tokens[1]?.children?.filter(child => child.type === 'link_open').map(child => child.attrGet('href'));
  if (tokens[0]?.type !== 'paragraph_open' || first?.join() !== others.join())
    throw new Error(`${file}: the page must open with the language line linking ${others.join(', ')}`);
  tokens.splice(0, 3);

  const slug = slugger();
  const toc = [];
  let title;
  let anchor;
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    // <a name="x"></a> alone in a paragraph gives the next heading its id, the same in every language.
    const name = token.type === 'inline' && /^<a name="([^"]+)"><\/a>$/.exec(token.content.trim())?.[1];
    if (name) {
      if (tokens[index + 2]?.type !== 'heading_open') throw new Error(`${file}: <a name="${name}"> is not right before a heading`);
      anchor = name;
      tokens.splice(index - 1, 3);
      index -= 2;
      continue;
    }
    if (token.type === 'fence' && !languages.includes(token.info.trim()))
      throw new Error(`${file}: a code block needs one of ${languages.join(', ')} after its fence, not "${token.info.trim()}"`);
    if (token.type === 'heading_open') {
      const inline = tokens[index + 1];
      // Every heading counts toward GitHub's numbering of repeated slugs, the h1 included. The h1 keeps only an
      // anchor placed before it: its slug is often the same word as an anchor further down.
      const generated = slug(inline.content);
      const id = anchor ?? (token.tag === 'h1' ? undefined : generated);
      anchor = undefined;
      if (id) token.attrSet('id', id);
      const text = plain(inline);
      if (token.tag === 'h1') {
        if (title) throw new Error(`${file}: more than one h1`);
        title = text;
      } else if (token.tag === 'h2' || token.tag === 'h3') {
        toc.push({id, text, level: token.tag});
      }
    }
    if (token.type === 'inline') {
      for (const child of token.children) {
        if (child.type === 'link_open') child.attrSet('href', rewrite(base, files, child.attrGet('href'), file));
        if (child.type === 'image') {
          child.attrSet('src', rewrite(base, files, child.attrGet('src'), file));
          child.attrSet('loading', 'lazy');
        }
      }
    }
    // GitHub's alert syntax, `> [!NOTE]` on the quote's first line, becomes a titled callout.
    if (token.type === 'blockquote_open') {
      const inline = tokens[index + 2];
      const marker = inline?.type === 'inline' && /^\[!(\w+)\]\s*/.exec(inline.content);
      const alert = marker && marker[1].toLowerCase();
      token.attrSet('class', `callout${alert ? ` ${alert}` : ''}`);
      if (marker) {
        if (!alerts.includes(alert)) throw new Error(`${file}: unknown alert [!${marker[1]}]`);
        token.meta = {alert};
        const [text, next] = inline.children;
        text.content = text.content.slice(marker[0].length);
        if (!text.content) inline.children.splice(0, next?.type === 'softbreak' ? 2 : 1);
      }
    }
  }
  if (!title) throw new Error(`${file}: no h1`);
  return {name, title, toc, tokens};
}

function head(base, lang, title) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escape(title)}</title>
<link rel="icon" href="${base}logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="${base}site.css">
<script>
try {
  const theme = localStorage.getItem('doona-docs-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {}
</script>
<script type="module" src="${base}site.js"></script>`;
}

// The app's logo, the same file in both schemes.
const logo = base => `<img src="${base}logo.svg" alt="" width="28" height="28">`;

// The pages under their section headings.
function navList(base, locale, parsed, current) {
  const titles = new Map(parsed.map(page => [page.name, page.title]));
  const sections = Object.entries(groups).map(([group, names]) => {
    const items = names.map(name => {
      const here = name === current ? ' aria-current="page"' : '';
      return `<li><a href="${pageUrl(base, locale, name)}"${here}>${escape(titles.get(name))}</a></li>`;
    });
    return `<li><span class="group">${strings[locale].groups[group]}</span><ul>${items.join('')}</ul></li>`;
  });
  return `<ul class="pages">${sections.join('')}</ul>`;
}

// The language and page menus share a details name, so opening one closes the other.
function page(base, locale, parsed, current) {
  const text = strings[locale];
  const home = parsed[0];
  const title = current.name === 'index' ? home.title : `${current.title} | ${home.title}`;
  const languages = locales.map(other => {
    const here = other === locale ? ' aria-current="true"' : '';
    return `<li><a href="${pageUrl(base, other, current.name)}" lang="${other}" hreflang="${other}"${here}>${strings[other].language}</a></li>`;
  });
  const toc = current.toc.map(entry => `<li class="${entry.level}"><a href="#${entry.id}">${escape(entry.text)}</a></li>`);
  const body = md.renderer.render(current.tokens, md.options, {locale});
  // The theme button toggles as the app's does: a system scheme to its opposite, an override back to the system.
  const themeLabels = Object.fromEntries(['system', 'light', 'dark'].map(scheme => [scheme, text.theme.replace('{theme}', text[scheme])]));
  const themeData = Object.entries(themeLabels)
    .map(([scheme, label]) => `data-${scheme}="${label}"`)
    .join(' ');
  return `${head(base, locale, title)}
</head>
<body>
<a class="skip" href="#content">${text.skip}</a>
<header class="top">
<a class="brand" href="${pageUrl(base, locale, 'index')}">${logo(base)}<span>doona</span></a>
<div class="actions">
<details class="language" name="docs-menu">
<summary aria-label="${text.languageMenu}">${icons.language}<span>${text.language}</span>${icons.chevron}</summary>
<ul>${languages.join('')}</ul>
</details>
<button type="button" class="theme" aria-label="${themeLabels.system}" ${themeData}><span class="scheme">${icons.moon}${icons.sun}</span></button>
<a class="github" href="${repository}" aria-label="${text.github}">${icons.github}</a>
</div>
</header>
<div class="layout">
<nav class="sidebar" aria-label="${text.pages}">${navList(base, locale, parsed, current.name)}</nav>
<div class="panel">
<details class="menu" name="docs-menu">
<summary>${icons.pages}<span>${escape(current.title)}</span>${icons.chevron}</summary>
<nav aria-label="${text.pages}">${navList(base, locale, parsed, current.name)}</nav>
</details>
<main id="content">
${body}</main>
<footer class="foot"><a href="${base}NOTICE.txt">${text.notice}</a><a href="${base}LICENSES/LicenseRef-GitHub-Logos.txt">${text.githubLogos}</a></footer>
${toc.length ? `<aside class="toc" aria-labelledby="toc-title">\n<h2 id="toc-title">${text.onThisPage}</h2>\n<ul>${toc.join('')}</ul>\n</aside>` : ''}
</div>
</div>
<p class="visually-hidden" role="status" data-copied="${text.copied}"></p>
</body>
</html>
`;
}

export function render({base = '/doona-docs/'} = {}) {
  if (!/^\/(.+\/)?$/.test(base)) throw new Error(`DOCS_BASE must start and end with a slash: ${base}`);
  const files = new Map();

  for (const locale of locales) {
    const parsed = pages.map(name => parse(base, files, locale, name));
    for (const current of parsed) files.set(`${locale}/${current.name}.html`, {text: page(base, locale, parsed, current)});
  }

  const home = locales.map(
    locale => `<li><a href="${pageUrl(base, locale, 'index')}" lang="${locale}" hreflang="${locale}">${strings[locale].language}</a></li>`
  );
  // Traditional Chinese for Taiwan, Hong Kong, Macau and the Hant script, Simplified for other Chinese, else English.
  files.set('index.html', {
    text: `${head(base, 'en', 'doona')}
<script>
(function () {
  var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  var locale = 'en';
  for (var i = 0; i < tags.length; i++) {
    var tag = String(tags[i]).toLowerCase();
    if (/^zh(-|$)/.test(tag)) {
      locale = /^zh-(hant|tw|hk|mo)(-|$)/.test(tag) ? 'zh-TW' : 'zh-CN';
      break;
    }
    if (/^en(-|$)/.test(tag)) break;
  }
  location.replace(${JSON.stringify(base)} + locale + '/');
})();
</script>
</head>
<body>
<main id="content" class="choose">
<a class="brand" href="${base}">${logo(base)}<span>doona</span></a>
<ul>${home.join('')}</ul>
</main>
</body>
</html>
`
  });

  const missing = locales.map(
    locale =>
      `<section lang="${locale}">\n<h1>${strings[locale].notFound}</h1>\n<p>${strings[locale].notFoundText}</p>\n<p><a href="${pageUrl(base, locale, 'index')}">${strings[locale].home}</a></p>\n</section>`
  );
  files.set('404.html', {
    text: `${head(base, 'en', strings.en.notFound)}
</head>
<body>
<main id="content" class="choose">
<a class="brand" href="${base}">${logo(base)}<span>doona</span></a>
${missing.join('\n')}
</main>
</body>
</html>
`
  });

  files.set('site.css', {text: stylesheet()});
  files.set('site.js', {from: join(root, 'site/site.js')});
  files.set('logo.svg', {from: join(root, 'public/logo.svg')});
  // The icons above are Adobe Spectrum artwork and the GitHub mark: their notice and terms travel with them, as in the
  // release archives.
  files.set('NOTICE.txt', {from: join(root, 'NOTICE')});
  files.set('LICENSES/Apache-2.0.txt', {from: join(root, 'LICENSES/Apache-2.0.txt')});
  files.set('LICENSES/LicenseRef-GitHub-Logos.txt', {from: join(root, 'LICENSES/LicenseRef-GitHub-Logos.txt')});
  // GitHub Pages would otherwise run Jekyll over the files.
  files.set('.nojekyll', {text: ''});
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
  const out = join(root, 'dist-docs');
  const files = render({base});
  write(files, out);
  console.log(`docs: ${files.size} files in ${relative(root, out)}/`);
}
