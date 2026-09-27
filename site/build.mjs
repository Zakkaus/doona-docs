// Renders docs/<locale>/*.md into a static site: one HTML page per Markdown page with the page's Markdown beside it,
// llms.txt listing the Markdown pages, a root page that sends the browser to its language, and a 404 page.
// `node site/build.mjs` writes dist-docs/; tools/check-docs.mjs calls render() directly. DOCS_BASE is the path the site
// is served under: /doona-docs/ on github.io, / on a domain of its own. DOCS_ORIGIN, such as https://zakkaus.github.io,
// makes the Markdown pages and llms.txt link by full URL, so the links still work once the text is pasted elsewhere;
// without it they link by path. DOONA_DIR names the doona checkout the build reads the app's styles, icons and logo
// from (site/docs.mjs).
import MarkdownIt from 'markdown-it';
import {copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {docs, doona, groups, locales, locate, ownRepository, pages, repository, root, slugger} from './docs.mjs';
import {highlight, languages} from './highlight.mjs';
import strings from './strings.mjs';

const alerts = ['note', 'tip', 'important', 'warning', 'caution'];

const md = new MarkdownIt({html: true});
md.renderer.rules.table_open = (tokens, index, options, env) => `<div class="table" role="region" aria-label="${strings[env.locale].table}" tabindex="0"><table>\n`;
md.renderer.rules.table_close = () => '</table></div>\n';
md.renderer.rules.blockquote_open = (tokens, index, options, env, self) => {
  const alert = tokens[index].meta?.alert;
  const title = alert ? `${icons[alert === 'warning' || alert === 'caution' ? 'alert' : 'info']}<p class="callout-title">${strings[env.locale][alert]}</p>\n` : '';
  return self.renderToken(tokens, index, options) + title;
};
// A fence's info is its language, optionally followed by tab="label".
const fenceInfo = info => /^(\S+)(?:\s+tab="([^"]+)")?$/.exec(info.trim())?.slice(1) ?? [info.trim()];

// parse() has checked the fence's language. site.js shows the copy button where the clipboard can be written.
// Adjacent fences with a tab label, such as the sudo and root forms of one command, render as one .tabs box in which
// every block keeps its label, which is how they read without site.js; site.js turns the labels into tabs.
md.renderer.rules.fence = (tokens, index, options, env) => {
  const token = tokens[index];
  const [language, tab] = fenceInfo(token.info);
  const copy = `<button type="button" class="copy" aria-label="${strings[env.locale].copy}" hidden>${icons.copy}${icons.copied}</button>`;
  const code = `<div class="code"><pre tabindex="0"><code class="language-${language}">${highlight(token.content, language)}</code></pre>${copy}</div>\n`;
  if (!tab) return code;
  const panel = `<div class="tab-panel" data-tab="${escape(tab)}"><p class="tab-label">${escape(tab)}</p>\n${code}</div>\n`;
  return `${token.meta.first ? '<div class="tabs">\n' : ''}${panel}${token.meta.last ? '</div>\n' : ''}`;
};

const escape = text => text.replace(/[&<>"]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[char]);

// The icons doona draws, read from its own components so the two stay the same. Only paths and circles are copied, so
// an icon drawn with any other element fails the build rather than losing that part.
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
const icons = {
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
  document: icon('FileText'),
  info: icon('InfoCircle'),
  alert: icon('AlertTriangle')
};

// site/site.css with Rosé Pine Dawn and Moon, doona's default palette, written in as light-dark() pairs from the app's
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
  const css = readFileSync(join(root, 'site/site.css'), 'utf8');
  const marker = '  /* palette */\n';
  if (!css.includes(marker)) throw new Error('site/site.css: no /* palette */ line');
  const sizesMarker = '  /* sizes */\n';
  if (!css.includes(sizesMarker)) throw new Error('site/site.css: no /* sizes */ line');
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

// Heading text without Markdown, for titles, navigation and the table of contents.
const plain = inline =>
  inline.children.map(child => (child.type === 'text' || child.type === 'code_inline' ? child.content : child.type === 'softbreak' ? ' ' : '')).join('');

const pageUrl = (base, locale, name) => `${base}${locale}/${name === 'index' ? '' : `${name}.html`}`;
const markdownUrl = (base, locale, name) => `${base}${locale}/${name}.md`;

// A link as the site serves it: pages and images in docs/ under the base, other repository files on GitHub. An image it
// links is added to files, the map render() writes. With an origin, for the Markdown pages, a page link names the page's
// Markdown and every link in docs/ starts with the origin; the origin is '' when DOCS_ORIGIN is not set. A path this
// repository does not hold is doona's (locate).
function rewrite(base, files, target, file, origin) {
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) return target;
  const [path, ...hash] = target.split('#');
  const suffix = hash.length ? `#${hash.join('#')}` : '';
  const absolute = resolve(dirname(file), decodeURIComponent(path));
  const inDocs = relative(docs, absolute);
  const found = locate(absolute);
  if (inDocs.startsWith('..') || isAbsolute(inDocs)) {
    const inRepo = relative(root, absolute);
    if (inRepo.startsWith('..') || isAbsolute(inRepo)) throw new Error(`${file}: ${target} is outside the repository`);
    const kind = existsSync(found) && statSync(found).isDirectory() ? 'tree' : 'blob';
    return `${found === absolute ? ownRepository : repository}/${kind}/main/${encodeURI(inRepo.split(sep).join('/'))}${suffix}`;
  }
  const parts = inDocs.split(sep);
  if (inDocs.endsWith('.md')) {
    const [locale, name] = parts;
    if (parts.length !== 2 || !locales.includes(locale)) throw new Error(`${file}: ${target} is not a docs page`);
    return (origin === undefined ? pageUrl(base, locale, name.slice(0, -3)) : origin + markdownUrl(base, locale, name.slice(0, -3))) + suffix;
  }
  // Only files that exist are published; a missing one leaves the link dangling for the checker to report.
  if (existsSync(found)) files.set(parts.join('/'), {from: found});
  return (origin ?? '') + base + encodeURI(parts.join('/')) + suffix;
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
    if (token.type === 'fence') {
      const [language, tab] = fenceInfo(token.info);
      if (!languages.includes(language))
        throw new Error(`${file}: a code block needs one of ${languages.join(', ')} after its fence, not "${token.info.trim()}"`);
      if (tab) {
        const previous = tokens[index - 1];
        const next = tokens[index + 1];
        const joined = token => token?.type === 'fence' && Boolean(fenceInfo(token.info)[1]);
        token.meta = {first: !joined(previous), last: !joined(next)};
        if (token.meta.first && token.meta.last) throw new Error(`${file}: the code block tab="${tab}" has no other tab next to it`);
      }
    }
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
  // A paragraph right under the h1 introduces the page; its first sentence describes the page in llms.txt.
  const h1 = tokens.findIndex(token => token.tag === 'h1');
  const lead = tokens[h1 + 3]?.type === 'paragraph_open' ? plain(tokens[h1 + 4]) : '';
  const description = /^[^]*?(?:[.!?](?=\s|$)|[。！？])/u.exec(lead)?.[0] ?? lead;
  return {name, title, description, toc, tokens};
}

// The page's Markdown as docs/ holds it, less the language line that parse() has checked, with each link rewritten as
// the site serves it, by full URL when there is an origin. Code spans and fenced blocks are left as they are.
function markdown(base, origin, files, locale, name) {
  const file = join(docs, locale, `${name}.md`);
  const source = readFileSync(file, 'utf8');
  // A link to a heading on this page names the page too, so it still leads there from a chat.
  const link = target => (target.startsWith('#') ? origin + markdownUrl(base, locale, name) + target : rewrite(base, files, target, file, origin));
  let fenced = false;
  return source
    .slice(source.indexOf('\n\n') + 2)
    .split('\n')
    .map(line => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (fenced) return line;
      return line
        .split(/(`+[^`]*`+)/)
        .map((part, index) => (index % 2 ? part : part.replace(/(\]\(\s*<?)([^)\s>]+)/g, (match, open, target) => open + link(target))))
        .join('');
    })
    .join('\n');
}

function head(base, lang, title, alternate) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escape(title)}</title>
${alternate ? `<link rel="alternate" type="text/markdown" href="${alternate}">\n` : ''}<link rel="icon" href="${base}logo.svg" type="image/svg+xml">
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
    return `<li><details class="nav-group" open><summary class="group"><span>${strings[locale].groups[group]}</span>${icons.chevron}</summary><ul>${items.join('')}</ul></details></li>`;
  });
  return `<ul class="pages">${sections.join('')}</ul>`;
}

// The page actions sit below the section links; the Markdown fetch remains relative to the served page.
function pageActions(base, origin, locale, name) {
  const text = strings[locale];
  const source = origin + markdownUrl(base, locale, name);
  const prompt = text.markdownPrompt.replace('{page}', origin + pageUrl(base, locale, name)).replace('{markdown}', source);
  // Spectrum ArrowUpRight UI icon (Apache-2.0), as used by the reference docs.
  const external = '<svg class="icon external" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10.089 1h-5.51a.911.911 0 0 0 0 1.822h3.31L1.355 9.355a.91.91 0 1 0 1.29 1.29L9.178 4.11v3.31a.911.911 0 0 0 1.822 0v-5.51A.91.91 0 0 0 10.089 1"/></svg>';
  const link = (url, label, type = '') => `<li role="none"><a role="menuitem" href="${url}"${type} target="_blank" rel="noopener noreferrer"><span>${label}</span>${external}</a></li>`;
  const assistants = origin
    ? [
        ['ChatGPT', 'https://chatgpt.com/?q='],
        ['Claude', 'https://claude.ai/new?q=']
      ].map(([app, url]) => link(url + encodeURIComponent(prompt), text.openIn.replace('{app}', app)))
    : [];
  return `<div class="page-actions">
<button type="button" class="md-copy" data-src="${markdownUrl(base, locale, name)}" hidden>${icons.copy}${icons.copied}<span>${text.copyMarkdown}</span></button>
<details class="md-menu" name="docs-menu">
<summary class="md-more" aria-label="${text.markdownMenu}" aria-haspopup="menu" aria-controls="page-action-menu">${icons.more}</summary>
<ul id="page-action-menu" role="menu" aria-label="${text.markdownMenu}">${link(source, text.viewMarkdown, ' type="text/markdown"')}${assistants.join('')}</ul>
</details>
</div>`;
}

function searchDialog(base, locale, parsed, current, languages) {
  const text = strings[locale];
  const groupFor = name => Object.keys(groups).find(group => groups[group].includes(name));
  const selected = groupFor(current.name);
  const all = `<button type="button" data-group="" aria-pressed="false" hidden>${text.all}</button>`;
  const filters = Object.keys(groups).map(group => `<button type="button" data-group="${group}" aria-pressed="${group === selected}">${text.groups[group]}</button>`);
  const cards = parsed.map(entry => `<a class="search-card" href="${pageUrl(base, locale, entry.name)}" data-group="${groupFor(entry.name)}"${entry.name === current.name ? ' aria-current="page"' : ''}>
<span class="card-art">${icons.document}</span><span class="card-text"><strong>${escape(entry.title)}</strong><span>${escape(entry.description)}</span></span></a>`);
  return `<dialog id="docs-search" aria-label="${text.search}" data-search-src="${base}${locale}/search.json">
<div class="search-layout">
<div class="search-brand"><a class="brand" href="${pageUrl(base, locale, 'index')}">${logo(base)}<span>doona</span></a><p>${escape(parsed[0].title)}</p>
<details class="language" name="docs-menu"><summary aria-label="${text.languageMenu}">${icons.language}<span>${text.language}</span>${icons.chevron}</summary><ul>${languages.join('')}</ul></details></div>
<div class="search-content">
<div class="search-field">${icons.search}<input type="search" aria-label="${text.search}" placeholder="${text.search}" autocomplete="off" aria-controls="search-results"></div>
<div class="search-filters" aria-label="${text.pages}">${all}${filters.join('')}</div>
<nav class="search-cards" id="search-results" aria-label="${text.pages}">${cards.join('')}</nav>
<p class="search-status" role="status" data-loading="${text.searchLoading}" data-empty="${text.noResults}" data-failed="${text.searchFailed}" hidden></p>
</div>
<button class="search-close" type="button" aria-label="${text.close}">${icons.close}</button>
</div>
</dialog>`;
}

// The language, page and Markdown menus share a details name, so opening one closes the others.
function page(base, origin, locale, parsed, current) {
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
  return `${head(base, locale, title, origin + markdownUrl(base, locale, current.name))}
</head>
<body>
<a class="skip" href="#content">${text.skip}</a>
<header class="top">
<a class="brand" href="${pageUrl(base, locale, 'index')}">${logo(base)}<span>doona</span></a>
<button class="search-trigger" type="button" aria-haspopup="dialog" aria-controls="docs-search" hidden>${icons.search}<span>${text.search}</span><kbd>Ctrl K</kbd></button>
<details class="mobile-sections" name="docs-menu">
<summary aria-label="${text.onThisPage}"><span>${escape(current.title)}</span>${icons.chevron}</summary>
<ul><li><a href="#content">${escape(current.title)}</a></li>${toc.join('')}</ul>
</details>
<div class="actions">
<details class="language" name="docs-menu">
<summary aria-label="${text.languageMenu}">${icons.language}<span>${text.language}</span>${icons.chevron}</summary>
<ul>${languages.join('')}</ul>
</details>
<button type="button" class="theme" aria-label="${themeLabels.system}" ${themeData}><span class="scheme">${icons.moon}${icons.sun}</span></button>
<a class="github" href="${repository}" aria-label="${text.github}">${icons.github}</a>
</div>
<button class="nav-trigger" type="button" aria-label="${text.navigation}" aria-haspopup="dialog" aria-controls="docs-search" hidden>${icons.menu}</button>
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
<footer class="foot"><a href="${base}LICENSES/CC-BY-4.0.txt">${text.license}</a><a href="${base}NOTICE.txt">${text.notice}</a><a href="${base}LICENSES/LicenseRef-GitHub-Logos.txt">${text.githubLogos}</a></footer>
<aside class="toc" aria-labelledby="toc-title">
<div class="toc-sections"><h2 id="toc-title">${text.onThisPage}</h2>
<ul>${toc.join('')}</ul></div>
${pageActions(base, origin, locale, current.name)}
</aside>
</div>
</div>
${searchDialog(base, locale, parsed, current, languages)}
<p class="visually-hidden" role="status" data-copied="${text.copied}" data-copy-failed="${text.copyFailed}"></p>
</body>
</html>
`;
}

// Where a visitor whose path names no language belongs: the language last chosen from a language menu, which site.js
// stores, else the first of the browser's languages the docs have. Traditional Chinese for Taiwan, Hong Kong, Macau and
// the Hant script, Simplified for other Chinese, else English.
const chooseLocale = `function () {
  try {
    var chosen = localStorage.getItem('doona-docs-locale');
    if (${JSON.stringify(locales)}.indexOf(chosen) >= 0) return chosen;
  } catch (e) {}
  var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  for (var i = 0; i < tags.length; i++) {
    var tag = String(tags[i]).toLowerCase();
    if (/^zh(-|$)/.test(tag)) return /^zh-(hant|tw|hk|mo)(-|$)/.test(tag) ? 'zh-TW' : 'zh-CN';
    if (/^en(-|$)/.test(tag)) break;
  }
  return 'en';
}`;

export function render({base = '/doona-docs/', origin = ''} = {}) {
  if (!/^\/(.+\/)?$/.test(base)) throw new Error(`DOCS_BASE must start and end with a slash: ${base}`);
  if (!/^(https?:\/\/[^/]+)?$/.test(origin)) throw new Error(`DOCS_ORIGIN must be a scheme and host with no path: ${origin}`);
  const files = new Map();

  // llms.txt, in the format of llmstxt.org: the site's name and summary, then each locale's Markdown pages.
  const llms = [];
  for (const locale of locales) {
    const parsed = pages.map(name => parse(base, files, locale, name));
    files.set(`${locale}/search.json`, {text: JSON.stringify(parsed.map(entry => ({
      title: entry.title,
      description: entry.description,
      url: pageUrl(base, locale, entry.name),
      text: entry.tokens.filter(token => token.type === 'inline').map(plain).join(' ')
    })))});
    for (const current of parsed) {
      files.set(`${locale}/${current.name}.html`, {text: page(base, origin, locale, parsed, current)});
      files.set(`${locale}/${current.name}.md`, {text: markdown(base, origin, files, locale, current.name)});
    }
    if (!llms.length) llms.push(`# ${parsed[0].title}\n\n> ${parsed[0].description}\n`);
    const entries = parsed.map(
      ({name, title, description}) => `- [${title}](${origin}${markdownUrl(base, locale, name)})${description ? `: ${description}` : ''}`
    );
    llms.push(`## ${strings[locale].language}\n\n${entries.join('\n')}\n`);
  }
  files.set('llms.txt', {text: llms.join('\n')});

  const home = locales.map(
    locale => `<li><a href="${pageUrl(base, locale, 'index')}" lang="${locale}" hreflang="${locale}">${strings[locale].language}</a></li>`
  );
  // Without script the root lists the languages.
  files.set('index.html', {
    text: `${head(base, 'en', 'doona')}
<script>
location.replace(${JSON.stringify(base)} + (${chooseLocale})() + '/');
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
  // A page path with no language, such as features.html, goes to that page in the visitor's language; any other path,
  // a page in a language included, is not found.
  files.set('404.html', {
    text: `${head(base, 'en', strings.en.notFound)}
<script>
(function () {
  var base = ${JSON.stringify(base)};
  var path = location.pathname;
  var page = path.indexOf(base) === 0 && /^([a-z-]+)(\\.html|\\.md)?$/.exec(path.slice(base.length));
  if (!page || ${JSON.stringify(pages)}.indexOf(page[1]) < 0) return;
  var locale = (${chooseLocale})();
  var file = page[2] === '.md' ? page[1] + '.md' : page[1] === 'index' ? '' : page[1] + '.html';
  location.replace(base + locale + '/' + file + location.hash);
})();
</script>
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
  for (const name of ['source-sans-3.woff2', 'source-code-pro.woff2', 'LICENSE-SourceSans3.txt', 'LICENSE-SourceCodePro.txt']) {
    files.set(`fonts/${name}`, {from: join(root, 'site/fonts', name)});
  }
  files.set('logo.svg', {from: join(doona, 'public/logo.svg')});
  // The icons above are Adobe Spectrum artwork and the GitHub mark: their notice and terms travel with them, as in the
  // release archives. This repository's NOTICE follows doona's and covers the pages and the fonts.
  files.set('NOTICE.txt', {text: readFileSync(join(doona, 'NOTICE'), 'utf8') + '\n' + readFileSync(join(root, 'NOTICE'), 'utf8')});
  files.set('LICENSES/CC-BY-4.0.txt', {from: join(root, 'LICENSES/CC-BY-4.0.txt')});
  files.set('LICENSES/Apache-2.0.txt', {from: join(doona, 'LICENSES/Apache-2.0.txt')});
  files.set('LICENSES/LicenseRef-GitHub-Logos.txt', {from: join(doona, 'LICENSES/LicenseRef-GitHub-Logos.txt')});
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
  const origin = process.env.DOCS_ORIGIN || undefined;
  const out = join(root, 'dist-docs');
  const files = render({base, origin});
  write(files, out);
  console.log(`docs: ${files.size} files in ${relative(root, out)}/`);
}
