// The press depth of the buttons, which motion.css tilts while they are pressed.
// The depth is the larger of the height and a third of the width, as in pressScale of @react-spectrum/s2, and the
// control's layout box does not change.
for (const button of document.querySelectorAll('.md-copy, .md-more, .copy, .theme, .demo, .github, .nav-trigger, .search-close')) {
  const measure = () => button.style.setProperty('--docs-press-depth', `${Math.max(button.offsetWidth / 3, button.offsetHeight)}px`);
  button.addEventListener('pointerdown', measure);
  button.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') measure();
  });
}
