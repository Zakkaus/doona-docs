// The page catalogue: the section list in the sidebar and phone menu, and the search dialog, which is also the phone
// navigation. Both list the pages in the order and sections of docs.mjs.
import {groups} from '../docs.mjs';
import strings from '../strings.mjs';
import {escape, pageUrl} from './common.mjs';
import {icons, logo, pageIcons} from './icons.mjs';

// Spectrum Chevron UI icon (Apache-2.0), as the reference docs draw it beside a collapsible section.
const sectionChevron = '<svg class="icon" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7.965 5.178C7.978 5.118 8 5.061 8 5s-.021-.118-.034-.178c-.01-.05-.01-.102-.03-.15-.023-.058-.068-.107-.104-.16-.03-.042-.047-.09-.084-.127l-.004-.003-.003-.004L3.615.303a.875.875 0 1 0-1.23 1.244L5.88 5 2.385 8.453a.875.875 0 1 0 1.23 1.244L7.74 5.622l.003-.004.004-.003c.037-.038.055-.085.084-.127.036-.053.08-.102.104-.16.02-.048.02-.1.03-.15"/></svg>';

// The pages under their section headings. As in the reference docs, the first section is a plain label with its pages
// always shown; the others collapse and start open, and site.js closes the ones the visitor closed before.
export function navList(base, locale, parsed, current) {
  const titles = new Map(parsed.map(page => [page.name, page.title]));
  const sections = Object.entries(groups).map(([group, names], index) => {
    const items = names.map(name => {
      const here = name === current ? ' aria-current="page"' : '';
      return `<li><a href="${pageUrl(base, locale, name)}"${here}>${escape(titles.get(name))}</a></li>`;
    });
    const label = strings[locale].groups[group];
    if (index === 0) return `<li class="nav-static"><span class="nav-label">${label}</span><ul>${items.join('')}</ul></li>`;
    return `<li><details class="nav-group" data-group="${group}" open><summary class="group"><span>${label}</span>${sectionChevron}</summary><ul>${items.join('')}</ul></details></li>`;
  });
  return `<ul class="pages">${sections.join('')}</ul>`;
}

export function searchDialog(base, locale, parsed, current, languages) {
  const text = strings[locale];
  const groupFor = name => Object.keys(groups).find(group => groups[group].includes(name));
  const selected = groupFor(current.name);
  const all = `<button type="button" data-group="" aria-pressed="false" hidden>${text.all}</button>`;
  const filters = Object.keys(groups).map(group => `<button type="button" data-group="${group}" aria-pressed="${group === selected}">${text.groups[group]}</button>`);
  const cards = parsed.map(entry => `<a class="search-card" href="${pageUrl(base, locale, entry.name)}" data-group="${groupFor(entry.name)}"${entry.name === current.name ? ' aria-current="page"' : ''}>
<span class="card-art">${pageIcons[entry.name]}</span><span class="card-text"><strong>${escape(entry.title)}</strong><span>${escape(entry.description)}</span></span></a>`);
  return `<dialog id="docs-search" aria-label="${text.search}" data-search-src="${base}${locale}/search.json">
<div class="search-layout">
<div class="search-brand"><a class="brand" href="${pageUrl(base, locale, 'index')}">${logo(base)}<span>doona</span></a><p>${escape(parsed[0].title)}</p>
<details class="language" name="docs-menu"><summary aria-label="${text.languageMenu}">${icons.language}<span>${text.language}</span>${icons.chevron}</summary><ul>${languages.join('')}</ul></details></div>
<div class="search-content">
<div class="search-field">${icons.search}<input type="search" aria-label="${text.search}" placeholder="${text.search}" autocomplete="off" aria-controls="search-results"></div>
<div class="search-filters" aria-label="${text.pages}">${all}${filters.join('')}</div>
<nav class="search-cards" id="search-results" aria-label="${text.pages}">${cards.join('')}</nav>
<p class="search-status" role="status" data-loading="${text.searchLoading}" data-empty="${text.noResults}" data-failed="${text.searchFailed}" hidden></p>
</div>
<button class="search-close" type="button" aria-label="${text.close}">${icons.close}</button>
</div>
</dialog>`;
}
