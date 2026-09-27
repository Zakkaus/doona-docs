// The docs site's one script: the theme button and the copy buttons on code blocks. The page head has already applied a
// stored theme as data-theme; without one the page follows the system.
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

const status = document.querySelector('[role="status"][data-copied]');
if (navigator.clipboard && status) {
  for (const button of document.querySelectorAll('.code > .copy')) {
    let timer;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.previousElementSibling.textContent.replace(/\n$/, ''));
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
}
