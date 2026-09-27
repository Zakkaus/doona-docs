import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe, expect, it} from 'vitest';
import {render} from '../site/build.mjs';
import {locales, pages, slugger} from '../site/docs.mjs';

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

// site/site.js with one code block's copy button, and the clipboard write it is given.
function copyButton(writeText) {
  const button = {
    hidden: true,
    dataset: {},
    previousElementSibling: {textContent: 'doona --help\n'},
    addEventListener(type, listener) {
      this.click = listener;
    }
  };
  const status = {dataset: {copied: 'Copied'}, textContent: ''};
  const document = {
    documentElement: {dataset: {}},
    addEventListener() {},
    querySelector: selector => (selector === '[role="status"][data-copied]' ? status : null),
    querySelectorAll: selector => (selector === '.code > .copy' ? [button] : [])
  };
  const script = readFileSync(new URL('../site/site.js', import.meta.url), 'utf8');
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

  it('leaves the button as it was when the clipboard refuses', async () => {
    const {button, status} = copyButton(() => Promise.reject(new Error('NotAllowedError')));
    await expect(button.click()).resolves.toBeUndefined();
    expect(button.dataset.copied).toBeUndefined();
    expect(status.textContent).toBe('');
  });
});

describe('icons', () => {
  it('keeps the bullets of the page-menu icon', () => {
    const page = render().get('en/index.html').text;
    const summary = /<details class="menu"[^]*?<summary>(<svg[^]*?<\/svg>)/.exec(page)[1];
    expect(summary.match(/<circle /g)).toHaveLength(3);
  });
});

// site/site.js with the page's Copy as Markdown button, the fetch that serves its Markdown, and the clipboard.
function markdownButton(clipboard) {
  const button = {
    hidden: true,
    dataset: {src: '/doona-docs/en/install.md'},
    addEventListener(type, listener) {
      this.click = listener;
    }
  };
  const status = {dataset: {copied: 'Copied'}, textContent: ''};
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
  const script = readFileSync(new URL('../site/site.js', import.meta.url), 'utf8');
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
        expect(site.has(published), `${path}: ${link}`).toBe(true);
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
