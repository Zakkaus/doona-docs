// The theme button. The page head has already applied a stored theme as data-theme; without one the page follows
// the system.
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

// Remembers the language the visitor picks from a language menu, for the root and 404 pages to send them to.
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

// The collapsible sections of the page list in the sidebar and the phone menu.
// The navigation sections start open; the ones the visitor closes stay closed on later pages, in the sidebar and the
// phone menu alike, except the section holding the current page, which always opens so its link stays in view.
const sections = [...document.querySelectorAll('.nav-group[data-group]')];
if (sections.length) {
  let closed = [];
  try {
    const stored = JSON.parse(localStorage.getItem('doona-docs-nav-closed') ?? '[]');
    if (Array.isArray(stored)) closed = stored;
  } catch {
    // Blocked or unreadable storage leaves every section open.
  }
  for (const section of sections) {
    if (closed.includes(section.dataset.group) && !section.querySelector('[aria-current="page"]')) section.open = false;
    section.addEventListener('toggle', () => {
      const {group} = section.dataset;
      for (const other of sections) if (other.dataset.group === group) other.open = section.open;
      closed = closed.filter(name => name !== group);
      if (!section.open) closed.push(group);
      try {
        localStorage.setItem('doona-docs-nav-closed', JSON.stringify(closed));
      } catch {
        // The choice then lasts for this page only.
      }
    });
  }
}

// The copy buttons: one on each code block, and Copy for LLM in the page actions, which copies the page's Markdown.
// Shows a copy button where the clipboard can be written, and marks it for two seconds once write() has copied.
const status = document.querySelector('[role="status"][data-copied]');
function copyButton(button, write) {
  if (!navigator.clipboard || !status || !button) return;
  let timer;
  let pending = false;
  button.hidden = false;
  button.addEventListener('click', async () => {
    if (pending) return;
    pending = true;
    button.dataset.pending = '';
    clearTimeout(timer);
    delete button.dataset.copied;
    status.textContent = '';
    try {
      await write();
    } catch {
      status.textContent = status.dataset.copyFailed || '';
      return;
    } finally {
      pending = false;
      delete button.dataset.pending;
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

// The menus the top bar and page actions open (details named docs-menu): Escape and a press outside close them.
// Escape closes an open menu and returns focus to its button.
document.addEventListener('keydown', event => {
  const open = event.key === 'Escape' && document.querySelector('details[name="docs-menu"][open]');
  if (!open) return;
  event.preventDefault();
  open.open = false;
  open.querySelector('summary').focus();
});

// A press outside an open menu closes it.
document.addEventListener('pointerdown', event => {
  const open = document.querySelector('details[name="docs-menu"][open]');
  if (open && !open.contains(event.target)) open.open = false;
});

// Tabs over the alternative forms of one code block.
// A .tabs box holds adjacent code blocks, each under its label, such as the sudo and root forms of one command. Here the
// labels become tabs with the arrow keys, Home and End of the WAI-ARIA tabs pattern. Picking a label picks it in every
// box on the page that has it, and the choice is kept for later pages. A panel takes no tab stop of its own: its code
// block already has one.
const boxes = [...document.querySelectorAll('.tabs')].map((box, boxIndex) => {
  const panels = [...box.children].filter(child => child.classList.contains('tab-panel'));
  const list = document.createElement('div');
  list.className = 'tablist';
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', box.dataset.label);
  const tabs = panels.map((panel, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = `tab-${boxIndex}-${index}`;
    tab.textContent = panel.dataset.tab;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', (panel.id = `tabpanel-${boxIndex}-${index}`));
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
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

// Keyboard use of the page actions menu, which opens the page's Markdown or an assistant.
// The script turns the plain list into a menu with one keyboard entry; arrows move between its links.
const actionMenu = document.querySelector('.md-menu');
if (actionMenu) {
  const trigger = actionMenu.querySelector('summary');
  const items = [...actionMenu.querySelectorAll('li a')];
  trigger.setAttribute('aria-haspopup', 'menu');
  actionMenu.querySelector('ul').setAttribute('role', 'menu');
  for (const item of items) {
    item.parentElement.setAttribute('role', 'none');
    item.setAttribute('role', 'menuitem');
    item.tabIndex = -1;
  }
  trigger.setAttribute('aria-expanded', 'false');
  actionMenu.addEventListener('toggle', () => {
    trigger.setAttribute('aria-expanded', String(actionMenu.open));
    if (actionMenu.open && document.activeElement === trigger) items[0]?.focus();
  });
  actionMenu.addEventListener('keydown', event => {
    const index = items.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    if (event.key === 'ArrowUp') next = index <= 0 ? items.length - 1 : index - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      actionMenu.open = true;
      items[next]?.focus();
    }
    if (event.key === 'Tab') {
      trigger.focus();
      actionMenu.open = false;
    }
  });
  actionMenu.addEventListener('click', event => {
    if (event.target.closest('a')) {
      actionMenu.open = false;
      trigger.focus();
    }
  });
}

// The press depth of the buttons, which motion.css tilts while they are pressed.
// The depth is the larger of the height and a third of the width, as in pressScale of @react-spectrum/s2, and the
// control's layout box does not change.
for (const button of document.querySelectorAll('.md-copy, .md-more, .copy, .theme, .demo, .github, .nav-trigger, .search-close, .link-button')) {
  const measure = () => button.style.setProperty('--docs-press-depth', `${Math.max(button.offsetWidth / 3, button.offsetHeight)}px`);
  button.addEventListener('pointerdown', measure);
  button.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') measure();
  });
}

// The search dialog, which is also the phone navigation: its triggers and Ctrl K, the section filters, the query over
// the locale's search.json, and the arrow keys, Home, End and Enter over the page cards while focus stays in the field.

// Where a page ranks for a query, best first: its title starts with the query, its title holds it, a section heading,
// a keyword, then its text. The entry and the query are normalized; Infinity is no match.
function searchRank(entry, query) {
  const tier = [
    entry.title.startsWith(query),
    entry.title.includes(query),
    entry.headings.some(heading => heading.includes(query)),
    entry.keywords.some(keyword => keyword.includes(query)),
    entry.text.includes(query)
  ].indexOf(true);
  return tier < 0 ? Infinity : tier;
}

const search = document.querySelector('#docs-search');
if (search) {
  const input = search.querySelector('input');
  const cards = search.querySelector('.search-cards');
  const filters = search.querySelector('.search-filters');
  const message = search.querySelector('.search-status');
  const triggers = [...document.querySelectorAll('[aria-controls="docs-search"]')];
  let index;
  let loading;
  let opener;
  let revision = 0;
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase(document.documentElement.lang);
  const initialGroup = filters.querySelector('[aria-pressed="true"]').dataset.group;
  let selectedGroup = initialGroup;
  let matching;
  const pageOrder = [...cards.children];
  let active;
  const activate = card => {
    active?.removeAttribute('aria-selected');
    active = card;
    if (!card) return input.removeAttribute('aria-activedescendant');
    card.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', card.id);
    card.scrollIntoView({block: 'nearest'});
  };
  const group = value => {
    selectedGroup = value;
    activate();
    for (const button of filters.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.group === value));
    for (const card of cards.children) card.hidden = Boolean(input.value.trim() && !matching) || Boolean(value && card.dataset.group !== value) || Boolean(matching && !matching.has(card.getAttribute('href')));
    if (matching) {
      // A function replacement, so a query holding $& or $' is shown as typed.
      message.textContent = message.dataset.empty.replace('{query}', () => input.value.trim());
      message.hidden = [...cards.children].some(card => !card.hidden);
    }
  };
  group(initialGroup);
  const show = trigger => {
    if (search.open) return;
    opener = trigger;
    for (const menu of document.querySelectorAll('details[name="docs-menu"][open]')) menu.open = false;
    search.showModal();
    input.focus();
  };
  for (const trigger of triggers) {
    trigger.hidden = false;
    trigger.addEventListener('click', () => show(trigger));
  }
  document.documentElement.dataset.enhanced = '';
  search.querySelector('.search-close').addEventListener('click', () => search.close());
  search.addEventListener('click', event => {
    if (event.target === search) {
      const rect = search.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) search.close();
    }
  });
  search.addEventListener('close', () => opener?.focus());
  filters.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button) group(button.dataset.group);
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.isComposing) {
      event.preventDefault();
      if (search.open) search.close();
      else show(triggers.find(trigger => trigger.getClientRects().length));
    }
  });
  const shortcut = document.querySelector('.search-trigger kbd');
  if (shortcut && /Mac|iPhone|iPad/.test(navigator.platform)) shortcut.textContent = '⌘K';

  input.addEventListener('input', async () => {
    const request = ++revision;
    const query = normalize(input.value.trim());
    filters.querySelector('[data-group=""]').hidden = !query;
    matching = undefined;
    message.hidden = true;
    if (!query) {
      cards.removeAttribute('aria-busy');
      cards.append(...pageOrder);
      group(initialGroup);
      return;
    }
    group('');
    cards.setAttribute('aria-busy', 'true');
    for (const card of cards.children) card.hidden = true;
    message.textContent = message.dataset.loading;
    message.hidden = false;
    try {
      loading ??= fetch(search.dataset.searchSrc)
        .then(response => {
          if (!response.ok) throw new Error(response.statusText);
          return response.json();
        })
        .then(entries =>
          entries.map(entry => ({
            url: entry.url,
            title: normalize(entry.title),
            headings: entry.headings.map(normalize),
            keywords: entry.keywords.map(normalize),
            text: normalize(entry.text)
          }))
        );
      index ??= await loading;
    } catch {
      loading = undefined;
      if (request !== revision) return;
      cards.removeAttribute('aria-busy');
      message.textContent = message.dataset.failed;
      message.hidden = false;
      return;
    }
    if (request !== revision) return;
    cards.removeAttribute('aria-busy');
    message.hidden = true;
    // A stable sort keeps the page order within a rank.
    const ranked = index
      .map(entry => ({url: entry.url, rank: searchRank(entry, query)}))
      .filter(entry => entry.rank < Infinity)
      .sort((a, b) => a.rank - b.rank);
    matching = new Set(ranked.map(entry => entry.url));
    const cardFor = new Map(pageOrder.map(card => [card.getAttribute('href'), card]));
    cards.append(...ranked.map(entry => cardFor.get(entry.url)));
    group(selectedGroup);
  });
  input.addEventListener('keydown', event => {
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Enter') {
      if (active) {
        event.preventDefault();
        active.click();
      }
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || (event.shiftKey && ['Home', 'End'].includes(event.key))) return;
    const shown = [...cards.children].filter(card => !card.hidden);
    if (!shown.length) return;
    event.preventDefault();
    const current = shown.indexOf(active);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? shown.length - 1
      : event.key === 'ArrowDown' ? (current + 1) % shown.length : current <= 0 ? shown.length - 1 : current - 1;
    activate(shown[next]);
  });
}

// The outline: marks the section being read in "On this page" and in the phone top bar's section menu, which it
// closes once a link in it is followed.
const panel = document.querySelector('.panel');
const sectionMenu = document.querySelector('.mobile-sections');
if (panel && sectionMenu) {
  const headings = [...panel.querySelectorAll('main h2[id], main h3[id]')];
  const links = [...document.querySelectorAll('.toc-sections a, .mobile-sections a')];
  const title = panel.querySelector('h1');
  const label = sectionMenu.querySelector('summary span');
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const mobile = matchMedia('(max-width: 1023px)').matches;
    const edge = mobile ? 80 : panel.getBoundingClientRect().top + 40;
    // Short sections at the end never reach the edge. Once the page is scrolled to the bottom, the last heading in view
    // is the one being read.
    const scroller = mobile ? document.scrollingElement : panel;
    const bottom = scroller.scrollTop > 0 && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 1;
    const limit = bottom ? (mobile ? innerHeight : panel.getBoundingClientRect().bottom) : edge;
    const current = headings.filter(heading => heading.getBoundingClientRect().top <= limit).at(-1);
    for (const link of links) {
      if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    label.textContent = current?.textContent ?? title.textContent;
    document.documentElement.toggleAttribute('data-scrolled', mobile && title.getBoundingClientRect().bottom < 56);
    if (!mobile) sectionMenu.open = false;
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  panel.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  sectionMenu.addEventListener('click', event => {
    if (event.target.closest('a')) sectionMenu.open = false;
  });
  update();
}
