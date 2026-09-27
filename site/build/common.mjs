// Helpers the other build modules share: HTML escaping and the URLs of a page and of its Markdown.
export const escape = text => text.replace(/[&<>"]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[char]);

export const pageUrl = (base, locale, name) => `${base}${locale}/${name === 'index' ? '' : `${name}.html`}`;
export const markdownUrl = (base, locale, name) => `${base}${locale}/${name}.md`;
