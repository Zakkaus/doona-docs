// The search dialog, which is also the phone navigation: its triggers and Ctrl K, the section filters, the query over
// the locale's search.json, and arrow keys over the page cards.
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
  const group = value => {
    selectedGroup = value;
    for (const button of filters.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.group === value));
    for (const card of cards.children) card.hidden = Boolean(input.value.trim() && !matching) || Boolean(value && card.dataset.group !== value) || Boolean(matching && !matching.has(card.getAttribute('href')));
    if (matching) {
      message.textContent = message.dataset.empty;
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
      group(initialGroup);
      return;
    }
    group('');
    cards.setAttribute('aria-busy', 'true');
    for (const card of cards.children) card.hidden = true;
    message.textContent = message.dataset.loading;
    message.hidden = false;
    try {
      loading ??= fetch(search.dataset.searchSrc).then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      });
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
    const matches = index.filter(entry => normalize(entry.text).includes(query));
    matching = new Set(matches.map(entry => entry.url));
    group(selectedGroup);
  });
  search.addEventListener('keydown', event => {
    const card = event.target.closest('.search-card');
    if (event.isComposing || (event.target !== input && !card)) return;
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) && !(card && ['Home', 'End'].includes(event.key))) return;
    const links = [...search.querySelectorAll('.search-card:not([hidden])')].filter(link => link.getClientRects().length);
    if (!links.length) return;
    const current = links.indexOf(document.activeElement);
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
      : event.key === 'ArrowDown' ? (current + 1) % links.length : current <= 0 ? links.length - 1 : current - 1;
    links[next].focus();
  });
}
