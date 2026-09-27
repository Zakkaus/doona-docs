// Remembers the language the visitor picks from a language menu, for the root and 404 pages to send them to.
// A language picked from a menu wins over the browser's languages the next time a path names none.
for (const link of document.querySelectorAll('a[hreflang]')) {
  link.addEventListener('click', () => {
    try {
      localStorage.setItem('doona-docs-locale', link.hreflang);
    } catch {
      // Blocked storage leaves the browser's languages to decide.
    }
  });
}
