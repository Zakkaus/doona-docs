// Keyboard use of the page actions menu, which opens the page's Markdown or an assistant.
// The action menu has one keyboard entry; arrows move between its links.
const actionMenu = document.querySelector('.md-menu');
if (actionMenu) {
  const trigger = actionMenu.querySelector('summary');
  const items = [...actionMenu.querySelectorAll('[role="menuitem"]')];
  for (const item of items) item.tabIndex = -1;
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
