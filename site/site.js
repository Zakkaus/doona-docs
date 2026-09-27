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

// A .tabs box holds adjacent code blocks, each under its label, such as the sudo and root forms of one command. Here the
// labels become tabs with the arrow keys, Home and End of the WAI-ARIA tabs pattern. Picking a label picks it in every
// box on the page that has it, and the choice is kept for later pages.
const boxes = [...document.querySelectorAll('.tabs')].map((box, boxIndex) => {
  const panels = [...box.children].filter(child => child.classList.contains('tab-panel'));
  const list = document.createElement('div');
  list.className = 'tablist';
  list.setAttribute('role', 'tablist');
  const tabs = panels.map((panel, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = `tab-${boxIndex}-${index}`;
    tab.textContent = panel.dataset.tab;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', (panel.id = `tabpanel-${boxIndex}-${index}`));
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    panel.querySelector('.tab-label').hidden = true;
    tab.addEventListener('click', () => pickTab(panel.dataset.tab));
    tab.addEventListener('keydown', event => {
      const last = tabs.length - 1;
      const next = {ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last}[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const target = next > last ? 0 : next < 0 ? last : next;
      pickTab(panels[target].dataset.tab);
      tabs[target].focus();
    });
    list.append(tab);
    return tab;
  });
  box.prepend(list);
  return {panels, tabs};
});

function showTab({panels, tabs}, label) {
  const selected = panels.findIndex(panel => panel.dataset.tab === label);
  if (selected < 0) return false;
  panels.forEach((panel, index) => {
    panel.hidden = index !== selected;
    tabs[index].setAttribute('aria-selected', String(index === selected));
    tabs[index].tabIndex = index === selected ? 0 : -1;
  });
  return true;
}

function pickTab(label) {
  for (const box of boxes) showTab(box, label);
  try {
    localStorage.setItem('doona-docs-tab', label);
  } catch {
    // Blocked storage keeps the choice for this page only.
  }
}

let storedTab = null;
try {
  storedTab = localStorage.getItem('doona-docs-tab');
} catch {
  // Blocked storage starts every box on its first tab.
}
for (const box of boxes) if (!showTab(box, storedTab)) showTab(box, box.panels[0].dataset.tab);
