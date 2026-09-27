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
    const current = headings.filter(heading => heading.getBoundingClientRect().top <= edge).at(-1);
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
