// The HTML around the rendered Markdown: the head every page shares, a docs page with its top bar, navigation, outline
// and page actions, the root page that sends a visitor to their language, and the 404 page.
import {locales, pages, repository} from '../docs.mjs';
import strings from '../strings.mjs';
import {assetVersions} from './assets.mjs';
import {escape, markdownUrl, pageUrl} from './common.mjs';
import {icons, logo} from './icons.mjs';
import {md} from './markdown.mjs';
import {navList, searchDialog} from './nav.mjs';

// The public demo: doona on its in-browser mock backend.
const demo = 'https://demo.daeuniverse.org/';

function head(base, lang, title, alternate) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escape(title)}</title>
${alternate ? `<link rel="alternate" type="text/markdown" href="${alternate}">\n` : ''}<link rel="icon" href="${base}logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="${base}site.css?v=${assetVersions().css}">
<script>
try {
  const theme = localStorage.getItem('doona-docs-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {}
</script>
<script type="module" src="${base}site.js?v=${assetVersions().js}"></script>`;
}

// The page actions sit below the section links; the Markdown fetch remains relative to the served page. The links are a
// plain list until site.js gives them the menu roles and the arrow keys those roles promise.
function pageActions(base, origin, locale, name) {
  const text = strings[locale];
  const source = origin + markdownUrl(base, locale, name);
  const prompt = text.markdownPrompt.replace('{page}', origin + pageUrl(base, locale, name)).replace('{markdown}', source);
  // The Spectrum LinkOut UI icon (S2_LinkOutSize200 in @react-spectrum/s2 1.7.1), as the React Spectrum docs draw it.
  // Copyright 2024 Adobe, Apache License 2.0 (LICENSES/Apache-2.0.txt); see NOTICE.
  const external = '<svg class="icon external" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10.089 1h-5.51a.911.911 0 0 0 0 1.822h3.31L1.355 9.355a.91.91 0 1 0 1.29 1.29L9.178 4.11v3.31a.911.911 0 0 0 1.822 0v-5.51A.91.91 0 0 0 10.089 1"/></svg>';
  const link = (url, label, type = '') => `<li><a href="${url}"${type} target="_blank" rel="noopener noreferrer"><span>${label}</span>${external}</a></li>`;
  const assistants = origin
    ? [
        ['ChatGPT', 'https://chatgpt.com/?q='],
        ['Claude', 'https://claude.ai/new?q=']
      ].map(([app, url]) => link(url + encodeURIComponent(prompt), text.openIn.replace('{app}', app)))
    : [];
  return `<div class="page-actions">
<button type="button" class="md-copy" data-src="${markdownUrl(base, locale, name)}" hidden>${icons.copy}${icons.copied}<span>${text.copyMarkdown}</span></button>
<details class="md-menu" name="docs-menu">
<summary class="md-more" aria-label="${text.markdownMenu}" aria-controls="page-action-menu">${icons.more}</summary>
<ul id="page-action-menu" aria-label="${text.markdownMenu}">${link(source, text.viewMarkdown, ' type="text/markdown"')}${assistants.join('')}</ul>
</details>
</div>`;
}

// The language, page and Markdown menus share a details name, so opening one closes the others.
export function page(base, origin, locale, parsed, current) {
  const text = strings[locale];
  const home = parsed[0];
  const title = current.name === 'index' ? home.title : `${current.title} | ${home.title}`;
  const languages = locales.map(other => {
    const here = other === locale ? ' aria-current="true"' : '';
    return `<li><a href="${pageUrl(base, other, current.name)}" lang="${other}" hreflang="${other}"${here}>${strings[other].language}</a></li>`;
  });
  const toc = current.toc.map(entry => `<li class="${entry.level}"><a href="#${entry.id}">${escape(entry.text)}</a></li>`);
  const body = md.renderer.render(current.tokens, md.options, {locale});
  // The theme button toggles as the app's does: a system scheme to its opposite, an override back to the system.
  const themeLabels = Object.fromEntries(['system', 'light', 'dark'].map(scheme => [scheme, text.theme.replace('{theme}', text[scheme])]));
  const themeData = Object.entries(themeLabels)
    .map(([scheme, label]) => `data-${scheme}="${label}"`)
    .join(' ');
  return `${head(base, locale, title, origin + markdownUrl(base, locale, current.name))}
</head>
<body>
<a class="skip" href="#content">${text.skip}</a>
<header class="top">
<a class="brand" href="${pageUrl(base, locale, 'index')}">${logo(base)}<span>doona</span></a>
<button class="search-trigger" type="button" aria-haspopup="dialog" aria-controls="docs-search" hidden>${icons.search}<span>${text.search}</span><kbd>Ctrl K</kbd></button>
<details class="mobile-sections" name="docs-menu">
<summary aria-label="${text.onThisPage}"><span>${escape(current.title)}</span>${icons.chevron}</summary>
<ul><li><a href="#content">${escape(current.title)}</a></li>${toc.join('')}</ul>
</details>
<div class="actions">
<a class="demo" href="${demo}" aria-label="${text.demo}">${icons.demo}<span>${text.demoLabel}</span></a>
<details class="language" name="docs-menu">
<summary aria-label="${text.languageMenu}">${icons.language}<span>${text.language}</span>${icons.chevron}</summary>
<ul>${languages.join('')}</ul>
</details>
<button type="button" class="theme" aria-label="${themeLabels.system}" ${themeData}><span class="scheme">${icons.moon}${icons.sun}</span></button>
<a class="github" href="${repository}" aria-label="${text.github}">${icons.github}</a>
</div>
<button class="nav-trigger" type="button" aria-label="${text.navigation}" aria-haspopup="dialog" aria-controls="docs-search" hidden>${icons.menu}</button>
</header>
<div class="layout">
<nav class="sidebar" aria-label="${text.pages}">${navList(base, locale, parsed, current.name)}</nav>
<div class="panel">
<details class="menu" name="docs-menu">
<summary>${icons.pages}<span>${escape(current.title)}</span>${icons.chevron}</summary>
<nav aria-label="${text.pages}">${navList(base, locale, parsed, current.name)}</nav>
</details>
<main id="content">
${body}</main>
<aside class="toc" aria-labelledby="toc-title">
<div class="toc-sections"><h2 id="toc-title">${text.onThisPage}</h2>
<ul>${toc.join('')}</ul></div>
${pageActions(base, origin, locale, current.name)}
</aside>
<footer class="foot"><a href="${base}LICENSES/CC-BY-4.0.txt">${text.license}</a><a href="${base}NOTICE.txt">${text.notice}</a><a href="${base}LICENSES/LicenseRef-GitHub-Logos.txt">${text.githubLogos}</a></footer>
</div>
</div>
${searchDialog(base, locale, parsed, current, languages)}
<p class="visually-hidden" role="status" data-copied="${text.copied}" data-copy-failed="${text.copyFailed}"></p>
</body>
</html>
`;
}

// Where a visitor whose path names no language belongs: the language last chosen from a language menu, which site.js
// stores, else the first of the browser's languages the docs have. Traditional Chinese for Taiwan, Hong Kong, Macau and
// the Hant script, Simplified for other Chinese, else English.
const chooseLocale = `function () {
  try {
    var chosen = localStorage.getItem('doona-docs-locale');
    if (${JSON.stringify(locales)}.indexOf(chosen) >= 0) return chosen;
  } catch (e) {}
  var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  for (var i = 0; i < tags.length; i++) {
    var tag = String(tags[i]).toLowerCase();
    if (/^zh(-|$)/.test(tag)) return /^zh-(hant|tw|hk|mo)(-|$)/.test(tag) ? 'zh-TW' : 'zh-CN';
    if (/^en(-|$)/.test(tag)) break;
  }
  return 'en';
}`;

// The root page. Without script it lists the languages.
export function rootPage(base) {
  const home = locales.map(
    locale => `<li><a href="${pageUrl(base, locale, 'index')}" lang="${locale}" hreflang="${locale}">${strings[locale].language}</a></li>`
  );
  return `${head(base, 'en', 'doona')}
<script>
location.replace(${JSON.stringify(base)} + (${chooseLocale})() + '/');
</script>
</head>
<body>
<main id="content" class="choose">
<a class="brand" href="${base}">${logo(base)}<span>doona</span></a>
<ul>${home.join('')}</ul>
</main>
</body>
</html>
`;
}

// The 404 page. A page path with no language, such as features.html, goes to that page in the visitor's language; any
// other path, a page in a language included, is not found. The page shows one language's message, chosen as the root
// page chooses; without script it shows the first language's, with links home in the others.
export function notFoundPage(base) {
  const missing = locales.map(
    (locale, index) =>
      `<section lang="${locale}"${index ? ' hidden' : ''}>\n<h1>${strings[locale].notFound}</h1>\n<p>${strings[locale].notFoundText}</p>\n<p><a href="${pageUrl(base, locale, 'index')}">${strings[locale].home}</a></p>\n</section>`
  );
  const others = locales
    .slice(1)
    .map(locale => `<li><a href="${pageUrl(base, locale, 'index')}" lang="${locale}" hreflang="${locale}">${strings[locale].language}</a></li>`);
  return `${head(base, 'en', strings.en.notFound)}
<script>
(function () {
  var base = ${JSON.stringify(base)};
  var path = location.pathname;
  var page = path.indexOf(base) === 0 && /^([a-z-]+)(\\.html|\\.md)?$/.exec(path.slice(base.length));
  if (!page || ${JSON.stringify(pages)}.indexOf(page[1]) < 0) return;
  var locale = (${chooseLocale})();
  var file = page[2] === '.md' ? page[1] + '.md' : page[1] === 'index' ? '' : page[1] + '.html';
  location.replace(base + locale + '/' + file + location.hash);
})();
</script>
</head>
<body>
<main id="content" class="choose">
<a class="brand" href="${base}">${logo(base)}<span>doona</span></a>
${missing.join('\n')}
<noscript><ul>${others.join('')}</ul></noscript>
</main>
<script>
(function () {
  var locale = (${chooseLocale})();
  var sections = document.querySelectorAll('main section[lang]');
  for (var i = 0; i < sections.length; i++) {
    sections[i].hidden = sections[i].lang !== locale;
    if (!sections[i].hidden) document.title = sections[i].querySelector('h1').textContent;
  }
  document.documentElement.lang = locale;
})();
</script>
</body>
</html>
`;
}
