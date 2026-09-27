// The docs site's one script: the theme button, the copy buttons on code blocks and the page's Copy as Markdown, the
// language the visitor picks, and Escape on the menus. The page head has already applied a stored theme as data-theme;
// without one the page follows the system.
const root = document.documentElement;
const theme = document.querySelector('.theme');
if (theme) {
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const label = () => theme.setAttribute('aria-label', theme.dataset[root.dataset.theme ?? 'system']);
  label();
  theme.addEventListener('click', () => {
    const next = root.dataset.theme ? undefined : dark.matches ? 'light' : 'dark';
    if (next) root.dataset.theme = next;
    else delete root.dataset.theme;
    try {
      if (next) localStorage.setItem('doona-docs-theme', next);
      else localStorage.removeItem('doona-docs-theme');
    } catch {
      // Storage can be blocked; the choice then lasts for this page only.
    }
    label();
  });
}

// A language picked from a menu wins over the browser's languages the next time a path names none.
for (const link of document.querySelectorAll('a[hreflang]')) {
  link.addEventListener('click', () => {
    try {
      localStorage.setItem('doona-docs-locale', link.hreflang);
    } catch {
      // Blocked storage leaves the browser's languages to decide.
    }
  });
}

// Shows a copy button where the clipboard can be written, and marks it for two seconds once write() has copied.
const status = document.querySelector('[role="status"][data-copied]');
function copyButton(button, write) {
  if (!navigator.clipboard || !status || !button) return;
  let timer;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await write();
    } catch {
      // The browser can refuse the write, as when clipboard permission is denied; the button then stays as it was.
      return;
    }
    button.dataset.copied = '';
    status.textContent = status.dataset.copied;
    clearTimeout(timer);
    timer = setTimeout(() => {
      delete button.dataset.copied;
      status.textContent = '';
    }, 2000);
  });
}

for (const button of document.querySelectorAll('.code > .copy')) {
  copyButton(button, () => navigator.clipboard.writeText(button.previousElementSibling.textContent.replace(/\n$/, '')));
}

// The Markdown is fetched on the click. Safari lets a write that waits on a fetch through only as a ClipboardItem
// holding the pending text, so that form is used where the browser has it.
const markdown = document.querySelector('.md-copy');
copyButton(markdown, () => {
  const text = fetch(markdown.dataset.src).then(response => (response.ok ? response.text() : Promise.reject(new Error(response.statusText))));
  if (typeof ClipboardItem === 'undefined') return text.then(value => navigator.clipboard.writeText(value));
  const blob = text.then(value => new Blob([value], {type: 'text/plain'}));
  return navigator.clipboard.write([new ClipboardItem({'text/plain': blob})]);
});

// Escape closes an open menu and returns focus to its button.
document.addEventListener('keydown', event => {
  const open = event.key === 'Escape' && document.querySelector('details[name="docs-menu"][open]');
  if (!open) return;
  open.open = false;
  open.querySelector('summary').focus();
});
