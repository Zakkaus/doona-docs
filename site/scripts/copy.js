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
