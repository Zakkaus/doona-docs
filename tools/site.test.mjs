import {runInNewContext} from 'node:vm';
import {describe, expect, it} from 'vitest';
import {render} from '../site/build.mjs';
import {script as siteScript} from '../site/build/assets.mjs';
import {awaitsScreenshots, groups, locales, pages, slugger} from '../site/docs.mjs';

describe('slugger', () => {
  it('numbers repeated headings as GitHub does', () => {
    const slug = slugger();
    expect(['Install', 'Install', 'Install'].map(slug)).toEqual(['install', 'install-1', 'install-2']);
  });

  it('skips a number another heading already took', () => {
    const slug = slugger();
    expect(['A', 'A-1', 'A', 'A-1'].map(slug)).toEqual(['a', 'a-1', 'a-2', 'a-1-1']);
  });
});

// The site script with one code block's copy button, and the clipboard write it is given.
function copyButton(writeText) {
  const button = {
    hidden: true,
    dataset: {},
    previousElementSibling: {textContent: 'doona --help\n'},
    addEventListener(type, listener) {
      this.click = listener;
    }
  };
  const status = {dataset: {copied: 'Copied', copyFailed: 'Unable to copy'}, textContent: ''};
  const document = {
    documentElement: {dataset: {}},
    addEventListener() {},
    querySelector: selector => (selector === '[role="status"][data-copied]' ? status : null),
    querySelectorAll: selector => (selector === '.code > .copy' ? [button] : [])
  };
  const script = siteScript();
  runInNewContext(script, {document, navigator: {clipboard: {writeText}}, setTimeout: () => 0, clearTimeout: () => {}});
  return {button, status};
}

describe('copy button', () => {
  it('shows and marks the button once the text is copied', async () => {
    const written = [];
    const {button, status} = copyButton(async text => written.push(text));
    expect(button.hidden).toBe(false);
    await button.click();
    expect(written).toEqual(['doona --help']);
    expect(button.dataset.copied).toBe('');
    expect(status.textContent).toBe('Copied');
  });

  it('writes once while a previous copy is pending', async () => {
    let finish;
    let writes = 0;
    const {button} = copyButton(() => {
      writes++;
      return new Promise(resolve => { finish = resolve; });
    });
    const first = button.click();
    const repeated = button.click();
    expect(writes).toBe(1);
    expect(button.dataset.pending).toBe('');
    finish();
    await Promise.all([first, repeated]);
    expect(button.dataset.pending).toBeUndefined();
  });

  it('announces when the clipboard refuses', async () => {
    const {button, status} = copyButton(() => Promise.reject(new Error('NotAllowedError')));
    await expect(button.click()).resolves.toBeUndefined();
    expect(button.dataset.copied).toBeUndefined();
    expect(status.textContent).toBe('Unable to copy');
  });
});

describe('icons', () => {
  it('keeps the bullets of the page-menu icon', () => {
    const page = render().get('en/index.html').text;
    const summary = /<details class="menu"[^]*?<summary>(<svg[^]*?<\/svg>)/.exec(page)[1];
    expect(summary.match(/<circle /g)).toHaveLength(3);
  });

  it('draws a picture on every search card and hides it from assistive technology', () => {
    const page = render().get('en/index.html').text;
    const cards = [...page.matchAll(/<a class="search-card" href="[^"]*\/(?:([\w-]+)\.html)?"[^]*?<span class="card-art">([^]*?)<\/span><span class="card-text">/g)];
    expect(cards.map(([, name]) => name ?? 'index')).toEqual(pages);
    for (const [, name, art] of cards) {
      expect(art, name).toMatch(/^<svg class="icon[^"]*" viewBox="[^"]+" aria-hidden="true" focusable="false"><path fill="currentColor" d="[^"]+"\/>(<path[^>]+\/>)*<\/svg>$/);
    }
  });

  it('puts the play icon before the demo label', () => {
    const page = render().get('en/index.html').text;
    expect(page).toMatch(/<a class="demo" href="[^"]+" aria-label="doona demo with sample data"><svg class="icon" [^>]*aria-hidden="true"[^]*?<\/svg><span>Demo<\/span><\/a>/);
  });
});

// The site script over a sidebar and phone menu that each hold the install and guides sections, with storage holding
// `stored`, or throwing it when it is an Error.
function navSections(stored) {
  const details = ['install', 'guides', 'install', 'guides'].map(group => ({
    dataset: {group},
    open: true,
    addEventListener(type, listener) {
      this.ontoggle = listener;
    }
  }));
  const saved = [];
  const fail = () => {
    if (stored instanceof Error) throw stored;
  };
  const localStorage = {
    getItem: () => (fail(), stored),
    setItem: (key, value) => (fail(), saved.push(value))
  };
  const document = {
    documentElement: {dataset: {}},
    addEventListener() {},
    querySelector: () => null,
    querySelectorAll: selector => (selector === '.nav-group[data-group]' ? details : [])
  };
  const script = siteScript();
  runInNewContext(script, {document, localStorage, navigator: {}, setTimeout: () => 0, clearTimeout: () => {}});
  // Each section's state, after checking that the sidebar and the phone menu agree.
  const sections = () => {
    for (const [index, section] of details.slice(0, 2).entries()) expect(details[index + 2].open).toBe(section.open);
    return Object.fromEntries(details.slice(0, 2).map(section => [section.dataset.group, section.open]));
  };
  // The visitor opens or closes one section in the sidebar; the browser then fires toggle on it.
  sections.toggle = (group, open) => {
    const section = details.find(item => item.dataset.group === group);
    section.open = open;
    section.ontoggle();
  };
  return {sections, saved};
}

describe('navigation', () => {
  const site = render();
  // The sidebar's sections, in order: whether each is a plain label or collapses, and whether it starts open.
  const sections = page => {
    const nav = /<nav class="sidebar"[^>]*>([^]*?)<\/nav>/.exec(site.get(page).text)[1];
    return [...nav.matchAll(/<li class="nav-static"><span class="nav-label">|<details class="nav-group" data-group="[a-zA-Z]+"( open)?><summary/g)].map(match =>
      match[0].includes('nav-static') ? 'label' : match[1] ? 'open' : 'closed'
    );
  };

  it('shows the first section as a label and every other section open', () => {
    for (const locale of locales) for (const name of pages) expect(sections(`${locale}/${name}.html`)).toEqual(['label', 'open', 'open', 'open', 'open']);
  });

  it('keeps the pages in section order', () => {
    expect(Object.keys(groups)).toEqual(['start', 'install', 'firstRun', 'guides', 'contributing']);
    expect(groups.start).toEqual(['index', 'requirements']);
    expect(groups.install.at(-1)).toBe('install');
    expect(pages).toEqual(Object.values(groups).flat());
    const listed = [...site.get('llms.txt').text.matchAll(/\/([a-zA-Z-]+)\/([a-z-]+)\.md\)/g)];
    for (const locale of locales) expect(listed.filter(match => match[1] === locale).map(match => match[2])).toEqual(pages);
  });

  it('remembers the sections the visitor closes', () => {
    const {sections: open, saved} = navSections(JSON.stringify(['guides']));
    expect(open()).toEqual({install: true, guides: false});
    open.toggle('install', false);
    expect(open()).toEqual({install: false, guides: false});
    expect(JSON.parse(saved.at(-1))).toEqual(['guides', 'install']);
    open.toggle('guides', true);
    expect(JSON.parse(saved.at(-1))).toEqual(['install']);
  });

  it('leaves every section open when storage throws', () => {
    const {sections: open} = navSections(new Error('SecurityError'));
    expect(open()).toEqual({install: true, guides: true});
    expect(() => open.toggle('install', false)).not.toThrow();
  });

  it('gives the label no toggle and the phone menu the same sections', () => {
    const page = site.get('zh-TW/index.html').text;
    const label = /<li class="nav-static">([^]*?)<ul>/.exec(page)[1];
    expect(label).toBe('<span class="nav-label">入門</span>');
    const menu = /<details class="menu"[^]*?<nav[^>]*>([^]*?)<\/nav>/.exec(page)[1];
    const sidebar = /<nav class="sidebar"[^>]*>([^]*?)<\/nav>/.exec(page)[1];
    expect(menu).toBe(sidebar);
  });
});

// The site script over two .tabs boxes as site/build/markdown.mjs renders them, with storage holding `stored`.
function tabBoxes(labels, stored) {
  const element = (tag, props = {}) => ({
    tag,
    children: [],
    dataset: {},
    attributes: {},
    listeners: {},
    hidden: false,
    classList: {contains: name => (props.className ?? '').split(' ').includes(name)},
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    append(child) {
      this.children.push(child);
    },
    prepend(child) {
      this.children.unshift(child);
    },
    focus() {
      focused = this;
    },
    ...props
  });
  let focused;
  const saved = [];
  const boxes = labels.map(set => {
    const box = element('div', {className: 'tabs'});
    for (const label of set) {
      const caption = element('p', {className: 'tab-label'});
      const panel = element('div', {className: 'tab-panel', querySelector: () => caption});
      panel.dataset.tab = label;
      box.append(panel);
    }
    return box;
  });
  const document = {
    documentElement: {dataset: {}},
    addEventListener() {},
    createElement: tag => element(tag),
    querySelector: () => null,
    querySelectorAll: selector => (selector === '.tabs' ? boxes : [])
  };
  const localStorage = {getItem: () => stored, setItem: (key, value) => saved.push([key, value])};
  const script = siteScript();
  runInNewContext(script, {document, localStorage, navigator: {}, setTimeout: () => 0, clearTimeout: () => {}});
  const view = box => {
    const [list, ...panels] = box.children;
    return {
      list,
      tabs: list.children,
      panels,
      get shown() {
        return panels.filter(panel => !panel.hidden).map(panel => panel.dataset.tab);
      }
    };
  };
  return {boxes: boxes.map(view), saved, focused: () => focused};
}

describe('code tabs', () => {
  it('renders adjacent labelled fences as one box, each block under its label', () => {
    const page = render().get('en/install-debian.html').text;
    const box = /<div class="tabs">\n([^]*?)<\/div>\n<\/div>\n(?!<div class="tab-panel")/.exec(page)[1];
    expect([...box.matchAll(/<div class="tab-panel" data-tab="([^"]+)"><p class="tab-label">([^<]+)<\/p>/g)].map(match => [match[1], match[2]])).toEqual([
      ['sudo', 'sudo'],
      ['root', 'root']
    ]);
    expect(box).toContain('<code class="language-sh">');
  });

  it('turns each labelled block into a tab and shows the first', () => {
    const {boxes} = tabBoxes([['sudo', 'root']], null);
    const [{list, tabs, panels, shown}] = boxes;
    expect(list.attributes.role).toBe('tablist');
    expect(tabs.map(tab => tab.textContent)).toEqual(['sudo', 'root']);
    expect(shown).toEqual(['sudo']);
    expect(tabs.map(tab => [tab.attributes['aria-selected'], tab.tabIndex])).toEqual([['true', 0], ['false', -1]]);
    expect(tabs[1].attributes['aria-controls']).toBe(panels[1].id);
    expect(panels[1].attributes['aria-labelledby']).toBe(tabs[1].id);
    expect(panels.every(panel => panel.children.length === 0 && panel.querySelector().hidden)).toBe(true);
  });

  it('picks a label in every box that has it and stores it', () => {
    const {boxes, saved} = tabBoxes([['sudo', 'root'], ['sudo', 'root'], ['systemd', 'OpenWrt']], null);
    boxes[0].tabs[1].listeners.click();
    expect(boxes.map(box => box.shown)).toEqual([['root'], ['root'], ['systemd']]);
    expect(saved).toEqual([['doona-docs-tab', 'root']]);
  });

  it('moves with the arrow keys, Home and End, wrapping at the ends', () => {
    const {boxes, focused} = tabBoxes([['a', 'b', 'c']], null);
    const {tabs} = boxes[0];
    const press = (index, key) => tabs[index].listeners.keydown({key, preventDefault() {}});
    press(0, 'ArrowLeft');
    expect(boxes[0].shown).toEqual(['c']);
    expect(focused()).toBe(tabs[2]);
    press(2, 'ArrowRight');
    expect(boxes[0].shown).toEqual(['a']);
    press(0, 'End');
    expect(boxes[0].shown).toEqual(['c']);
    press(2, 'Home');
    expect(boxes[0].shown).toEqual(['a']);
    expect(focused()).toBe(tabs[0]);
  });

  it('opens on the stored label where a box has it', () => {
    const {boxes} = tabBoxes([['sudo', 'root'], ['systemd', 'OpenWrt']], 'root');
    expect(boxes.map(box => box.shown)).toEqual([['root'], ['systemd']]);
  });
});

// The site script with the page's Copy as Markdown button, the fetch that serves its Markdown, and the clipboard.
function markdownButton(clipboard) {
  const button = {
    hidden: true,
    dataset: {src: '/doona-docs/en/install.md'},
    addEventListener(type, listener) {
      this.click = listener;
    }
  };
  const status = {dataset: {copied: 'Copied', copyFailed: 'Unable to copy'}, textContent: ''};
  const document = {
    documentElement: {dataset: {}},
    addEventListener() {},
    querySelector: selector => ({'[role="status"][data-copied]': status, '.md-copy': button})[selector] ?? null,
    querySelectorAll: () => []
  };
  const fetched = [];
  const fetch = async url => {
    fetched.push(url);
    return {ok: true, text: async () => '# Install\n'};
  };
  const script = siteScript();
  runInNewContext(script, {document, navigator: {clipboard}, fetch, setTimeout: () => 0, clearTimeout: () => {}});
  return {button, status, fetched};
}

describe('copy as Markdown', () => {
  it('copies the page Markdown and marks the button', async () => {
    const written = [];
    const {button, status, fetched} = markdownButton({writeText: async text => written.push(text)});
    expect(button.hidden).toBe(false);
    await button.click();
    expect(fetched).toEqual(['/doona-docs/en/install.md']);
    expect(written).toEqual(['# Install\n']);
    expect(button.dataset.copied).toBe('');
    expect(status.textContent).toBe('Copied');
  });

  it('stays hidden where the clipboard cannot be written', () => {
    expect(markdownButton(undefined).button.hidden).toBe(true);
  });
});

// Every href in a Markdown page: the target of each [text](target).
const markdownLinks = text => [...text.matchAll(/\]\(\s*<?([^)\s>]+)/g)].map(match => match[1]);

describe('Markdown pages', () => {
  const origin = 'https://docs.example';
  const base = '/doona-docs/';
  const site = render({base, origin});
  const ids = path => new Set([...site.get(path).text.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));

  it('publishes each page as Markdown beside its HTML', () => {
    for (const locale of locales) {
      for (const name of pages) {
        expect(site.has(`${locale}/${name}.html`)).toBe(true);
        const text = site.get(`${locale}/${name}.md`)?.text;
        expect(text, `${locale}/${name}.md`).toMatch(/^(<a name="[^"]+"><\/a>\n\n)*# /);
      }
    }
  });

  it('links the Markdown from the page head', () => {
    for (const locale of locales) {
      for (const name of pages) {
        const html = site.get(`${locale}/${name}.html`).text;
        const head = html.slice(0, html.indexOf('</head>'));
        expect(head).toContain(`<link rel="alternate" type="text/markdown" href="${origin}${base}${locale}/${name}.md">`);
      }
    }
  });

  it('rewrites every link in the Markdown to a page, file or anchor the site has', () => {
    for (const [path, file] of site) {
      if (!path.endsWith('.md')) continue;
      for (const link of markdownLinks(file.text)) {
        if (!link.startsWith(origin)) {
          expect(link, `${path}: ${link}`).toMatch(/^https:\/\//);
          continue;
        }
        const [target, fragment] = link.slice(origin.length).split('#');
        expect(target.startsWith(base), `${path}: ${link}`).toBe(true);
        const published = decodeURI(target.slice(base.length));
        expect(site.has(published) || awaitsScreenshots(published), `${path}: ${link}`).toBe(true);
        if (fragment !== undefined) expect(ids(published.replace(/\.md$/, '.html')).has(fragment), `${path}: ${link}`).toBe(true);
      }
    }
  });

  it('lists every page of every locale in llms.txt', () => {
    const llms = site.get('llms.txt').text;
    expect(llms).toMatch(/^# .+\n\n> .+\n/);
    const listed = [...llms.matchAll(/^- \[[^\]]+\]\(([^)]+)\)/gm)].map(match => match[1]);
    expect(listed).toEqual(locales.flatMap(locale => pages.map(name => `${origin}${base}${locale}/${name}.md`)));
  });
});

// Where the inline script of the root or 404 page sends a visitor, given a stored language and the browser's languages.
function redirect(stored, languages, page = 'index.html', pathname = '/doona-docs/', hash = '') {
  const scripts = [
    ...render()
      .get(page)
      .text.matchAll(/<script>\n([^]*?)<\/script>/g)
  ].map(match => match[1]);
  const script = scripts.find(text => text.includes('location.replace'));
  let target;
  const localStorage = {getItem: key => (key === 'doona-docs-locale' ? stored : null)};
  runInNewContext(script, {localStorage, navigator: {languages}, location: {pathname, hash, replace: url => (target = url)}});
  return target;
}
const rootLocale = (stored, languages) => redirect(stored, languages);

describe('root page', () => {
  it('follows the browser language', () => {
    expect(rootLocale(null, ['zh-HK', 'en'])).toBe('/doona-docs/zh-TW/');
    expect(rootLocale(null, ['zh-Hans-SG'])).toBe('/doona-docs/zh-CN/');
    expect(rootLocale(null, ['fr-FR'])).toBe('/doona-docs/en/');
  });

  it('prefers the language chosen from the menu', () => {
    expect(rootLocale('zh-CN', ['en-US'])).toBe('/doona-docs/zh-CN/');
    expect(rootLocale('xx', ['en-US'])).toBe('/doona-docs/en/');
  });
});

describe('404 page', () => {
  it('sends a page path without a language to that page in the visitor language', () => {
    expect(redirect(null, ['zh-TW'], '404.html', '/doona-docs/troubleshooting.html', '#no-native-api')).toBe(
      '/doona-docs/zh-TW/troubleshooting.html#no-native-api'
    );
    expect(redirect('zh-CN', ['en'], '404.html', '/doona-docs/features.md')).toBe('/doona-docs/zh-CN/features.md');
    expect(redirect(null, ['en'], '404.html', '/doona-docs/index')).toBe('/doona-docs/en/');
  });

  it('leaves a missing page in a language as not found', () => {
    expect(redirect(null, ['en'], '404.html', '/doona-docs/zh-TW/missing.html')).toBeUndefined();
    expect(redirect(null, ['en'], '404.html', '/doona-docs/missing.html')).toBeUndefined();
  });
});

// Page actions belong to the section column, independently of the page heading.
describe('page actions', () => {
  const site = render({base: '/', origin: 'https://docs.example'});
  const labels = {en: 'Copy for LLM', 'zh-CN': '复制供 LLM 使用', 'zh-TW': '複製供 LLM 使用'};
  for (const locale of locales) {
    it(`renders the section-column actions in ${locale}`, () => {
      const html = site.get(`${locale}/configuration.html`).text;
      const main = /<main id="content">([^]*?)<\/main>/.exec(html)[1];
      expect(main).not.toContain('page-actions');
      const aside = /<aside class="toc"[^]*?<\/aside>/.exec(html)[0];
      expect(aside.indexOf('page-actions')).toBeGreaterThan(aside.indexOf('</ul>'));
      expect(aside).toContain(`<span>${labels[locale]}</span>`);
      expect(aside).toContain('class="md-more"');
      expect(aside).toContain('aria-haspopup="menu"');
      const menu = /<ul id="page-action-menu"[^]*?<\/ul>/.exec(aside)[0];
      const links = [...menu.matchAll(/<a ([^]*?)<\/a>/g)].map(match => match[1]);
      expect(links).toHaveLength(3);
      expect(links[0]).toContain('https://docs.example/' + locale + '/configuration.md');
      expect(links[1]).toContain('https://chatgpt.com/');
      expect(links[2]).toContain('https://claude.ai/');
      for (const link of links) {
        expect(link).toContain('target="_blank"');
        expect(link).toContain('rel="noopener noreferrer"');
        expect(link).toContain('class="icon external"');
      }
      expect(aside).toContain(`data-src="/${locale}/configuration.md"`);
      // Narrow screens hide the outline column but keep the actions, which then follow the article in source order.
      expect(html.indexOf('<aside class="toc"')).toBeLessThan(html.indexOf('<footer class="foot">'));
    });
  }

  it('writes the press timing from the app motion tokens', () => {
    const css = site.get('site.css').text;
    expect(css).toMatch(/--rp-duration: \d+ms;/);
    expect(css).toMatch(/--rp-ease: cubic-bezier\(/);
    expect(css).not.toContain('/* sizes */');
  });
});

describe('documentation search', () => {
  const site = render({base: '/docs/'});
  it('publishes a separate search index for each locale', () => {
    for (const locale of locales) {
      const index = JSON.parse(site.get(`${locale}/search.json`).text);
      expect(index.map(entry => entry.title)).toHaveLength(pages.length);
      for (const entry of index) {
        expect(entry.url).toMatch(new RegExp(`^/docs/${locale}/`));
        expect(site.has(entry.url.slice('/docs/'.length).replace(/\/$/, '/index.html'))).toBe(true);
        expect(entry.text).not.toMatch(/<script|<svg|<a /);
        expect(entry.text.length).toBeGreaterThan(entry.title.length);
      }
    }
  });
  it('renders one localized modal shared by search and phone navigation', () => {
    for (const locale of locales) {
      const html = site.get(`${locale}/index.html`).text;
      expect(html.match(/<dialog /g)).toHaveLength(1);
      expect(html).toContain(`data-search-src="/docs/${locale}/search.json"`);
      expect(html).toContain('id="docs-search"');
      expect(html).toContain('aria-controls="docs-search"');
      expect(html).toContain('type="search"');
      expect(html).toContain('class="search-trigger"');
      expect(html).toContain('class="nav-trigger"');
    }
  });
});
