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
