// The docs site's one script: the copy buttons on code blocks.
const status = document.querySelector('[role="status"][data-copied]');
if (navigator.clipboard && status) {
  for (const button of document.querySelectorAll('.code > .copy')) {
    let timer;
    button.hidden = false;
    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(button.previousElementSibling.textContent.replace(/\n$/, ''));
      button.dataset.copied = '';
      status.textContent = status.dataset.copied;
      clearTimeout(timer);
      timer = setTimeout(() => {
        delete button.dataset.copied;
        status.textContent = '';
      }, 2000);
    });
  }
}
