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
