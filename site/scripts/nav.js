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
