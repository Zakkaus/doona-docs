// The text the site publishes beside its HTML: each page's Markdown, the search index of each locale, and llms.txt,
// which lists the Markdown pages in the format of llmstxt.org.
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {docs} from '../docs.mjs';
import strings from '../strings.mjs';
import {markdownUrl, pageUrl} from './common.mjs';
import {plain, rewrite} from './markdown.mjs';

// The page's Markdown as docs/ holds it, less the language line that parse() has checked, with each link rewritten as
// the site serves it, by full URL when there is an origin. Code spans and fenced blocks are left as they are.
export function markdown(base, origin, files, locale, name) {
  const file = join(docs, locale, `${name}.md`);
  const source = readFileSync(file, 'utf8');
  // A link to a heading on this page names the page too, so it still leads there from a chat.
  const link = target => (target.startsWith('#') ? origin + markdownUrl(base, locale, name) + target : rewrite(base, files, target, file, origin));
  let fenced = false;
  return source
    .slice(source.indexOf('\n\n') + 2)
    .split('\n')
    .map(line => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (fenced) return line;
      return line
        .split(/(`+[^`]*`+)/)
        .map((part, index) => (index % 2 ? part : part.replace(/(\]\(\s*<?)([^)\s>]+)/g, (match, open, target) => open + link(target))))
        .join('');
    })
    .join('\n');
}

// The search index of one locale: each page's title, description, URL and plain text, which site.js fetches on the
// first query.
export function searchIndex(base, locale, parsed) {
  return JSON.stringify(parsed.map(entry => ({
    title: entry.title,
    description: entry.description,
    url: pageUrl(base, locale, entry.name),
    text: entry.tokens.filter(token => token.type === 'inline').map(plain).join(' ')
  })));
}

// llms.txt: the site's name and summary from the first locale's home page, then each locale's Markdown pages under the
// locale's name. parsedByLocale maps each locale, in order, to its parsed pages.
export function llmsTxt(base, origin, parsedByLocale) {
  const llms = [];
  for (const [locale, parsed] of parsedByLocale) {
    if (!llms.length) llms.push(`# ${parsed[0].title}\n\n> ${parsed[0].description}\n`);
    const entries = parsed.map(
      ({name, title, description}) => `- [${title}](${origin}${markdownUrl(base, locale, name)})${description ? `: ${description}` : ''}`
    );
    llms.push(`## ${strings[locale].language}\n\n${entries.join('\n')}\n`);
  }
  return llms.join('\n');
}
