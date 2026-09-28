// Markdown to HTML: parse() reads one page of docs/, checks it, and collects its title, description and outline;
// the renderer rules here draw its tables, callouts, code blocks and tabs. rewrite() maps a link in docs/ to the URL
// the site serves, for the HTML pages and for the Markdown exports (exports.mjs).
import MarkdownIt from 'markdown-it';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {docs, locales, locate, ownRepository, root, slugger} from '../docs.mjs';
import {highlight, languages} from '../highlight.mjs';
import strings from '../strings.mjs';
import {escape, markdownUrl, pageUrl} from './common.mjs';
import {icons} from './icons.mjs';

const alerts = ['note', 'tip', 'important', 'warning', 'caution'];

export const md = new MarkdownIt({html: true});
md.renderer.rules.table_open = (tokens, index, options, env) => {
  const headers = tokens.slice(index + 1, tokens.findIndex((token, position) => position > index && token.type === 'thead_close'))
    .filter(token => token.type === 'inline').map(plain);
  const kind = headers.length === 2 && headers[0] === strings[env.locale].symptomHeader ? ' table--symptoms' : '';
  return `<div class="table${kind}" role="region" aria-label="${strings[env.locale].table}" tabindex="0"><table>\n`;
};
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
// every block keeps its label, which is how they read without site.js; site.js turns the labels into tabs and names the
// tab list with data-label.
md.renderer.rules.fence = (tokens, index, options, env) => {
  const token = tokens[index];
  const [language, tab] = fenceInfo(token.info);
  const copy = `<button type="button" class="copy" aria-label="${strings[env.locale].copy}" hidden>${icons.copy}${icons.copied}</button>`;
  const code = `<div class="code"><pre tabindex="0"><code class="language-${language}">${highlight(token.content, language)}</code></pre>${copy}</div>\n`;
  if (!tab) return code;
  const panel = `<div class="tab-panel" data-tab="${escape(tab)}"><p class="tab-label">${escape(tab)}</p>\n${code}</div>\n`;
  return `${token.meta.first ? `<div class="tabs" data-label="${strings[env.locale].codeTabs}">\n` : ''}${panel}${token.meta.last ? '</div>\n' : ''}`;
};

// Heading text without Markdown, for titles, navigation and the table of contents.
export const plain = inline =>
  inline.children.map(child => (child.type === 'text' || child.type === 'code_inline' ? child.content : child.type === 'softbreak' ? ' ' : '')).join('');

// A link as the site serves it: pages and images in docs/ under the base, other repository files on GitHub. An image it
// links is added to files, the map render() writes. With an origin, for the Markdown pages, a page link names the page's
// Markdown and every link in docs/ starts with the origin; the origin is '' when DOCS_ORIGIN is not set. A screenshot
// is doona's (locate).
export function rewrite(base, files, target, file, origin) {
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) return target;
  const [path, ...hash] = target.split('#');
  const suffix = hash.length ? `#${hash.join('#')}` : '';
  const absolute = resolve(dirname(file), decodeURIComponent(path));
  const inDocs = relative(docs, absolute);
  if (inDocs.startsWith('..') || isAbsolute(inDocs)) {
    const inRepo = relative(root, absolute);
    if (inRepo.startsWith('..') || isAbsolute(inRepo)) throw new Error(`${file}: ${target} is outside the repository`);
    const kind = existsSync(absolute) && statSync(absolute).isDirectory() ? 'tree' : 'blob';
    return `${ownRepository}/${kind}/main/${encodeURI(inRepo.split(sep).join('/'))}${suffix}`;
  }
  const parts = inDocs.split(sep);
  if (inDocs.endsWith('.md')) {
    const [locale, name] = parts;
    if (parts.length !== 2 || !locales.includes(locale)) throw new Error(`${file}: ${target} is not a docs page`);
    return (origin === undefined ? pageUrl(base, locale, name.slice(0, -3)) : origin + markdownUrl(base, locale, name.slice(0, -3))) + suffix;
  }
  // Only files that exist are published; a missing one leaves the link dangling for the checker to report.
  const found = locate(absolute);
  if (existsSync(found)) files.set(parts.join('/'), {from: found});
  return (origin ?? '') + base + encodeURI(parts.join('/')) + suffix;
}

// Optional front matter holding one line, `keywords: a, b`, which search ranks below the title and headings. GitHub
// shows it as a table above the page.
export function frontMatter(source) {
  const front = /^---\nkeywords:(.*)\n---\n+/.exec(source);
  const keywords = front ? front[1].split(',').map(keyword => keyword.trim()).filter(Boolean) : [];
  return {keywords, body: front ? source.slice(front[0].length) : source};
}

export function parse(base, files, locale, name) {
  const file = join(docs, locale, `${name}.md`);
  const {keywords, body} = frontMatter(readFileSync(file, 'utf8'));
  const tokens = md.parse(body, {});

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
  return {name, title, description, keywords, toc, tokens};
}
