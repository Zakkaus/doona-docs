import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe, expect, it} from 'vitest';
import {render} from '../site/build.mjs';
import {slugger} from '../site/docs.mjs';

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
