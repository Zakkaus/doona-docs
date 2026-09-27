// The press depth of the buttons, which motion.css tilts while they are pressed.
// Match the reference's press depth without changing the control's layout box.
for (const button of document.querySelectorAll('.md-copy, .md-more, .copy, .theme, .demo, .github, .nav-trigger, .search-close')) {
  const measure = () => button.style.setProperty('--docs-press-depth', `${Math.max(button.offsetWidth / 3, button.offsetHeight)}px`);
  button.addEventListener('pointerdown', measure);
  button.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') measure();
  });
}
