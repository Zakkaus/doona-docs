// The link checks tools/check-docs.mjs runs on each Markdown file: every relative link and image names a file this
// repository holds, or a screenshot in doona's docs/screenshots, and every link to a file in doona's repository on
// GitHub names a file in doona's checkout (DOONA_DIR); an #anchor on either names an <a name> or a heading slug there.
// A relative path into doona's source is reported, since it works on the site but is broken on GitHub.
import {existsSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {awaitsScreenshots, docs, doona, locate, repository, root, slugger} from '../site/docs.mjs';

// The lines of a Markdown text, with fenced code blocks and their fences blanked.
function unfenced(text) {
  let fenced = false;
  return text.split('\n').map(line => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return '';
    }
    return fenced ? '' : line;
  });
}

// A Markdown file's link lines, <a name> anchors, heading levels and ids. raw replaces the file's text, for tests.
const pages = new Map();
export function page(file, raw) {
  if (!pages.has(file) || raw !== undefined) {
    raw ??= readFileSync(file, 'utf8');
    const outside = unfenced(raw);
    // Headings keep their inline code, which counts toward the slug. Prose drops it, so a literal `[x](y)` is not read
    // as a link.
    const headingLines = outside.filter(line => /^#{1,6}\s/.test(line));
    const lines = outside.map(line => line.replace(/`[^`]*`/g, ''));
    const names = [...raw.matchAll(/<a name="([^"]+)"><\/a>/g)].map(match => match[1]);
    pages.set(file, {
      lines,
      names,
      levels: headingLines.map(line => /^#+/.exec(line)[0].length),
      ids: new Set([...names, ...headingLines.map(line => /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line)[1]).map(slugger())])
    });
  }
  return pages.get(file);
}

function targets(line) {
  const found = [];
  for (const match of line.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) found.push(match[1]);
  for (const match of line.matchAll(/<(?:img|source|a)\b[^>]*?\s(?:src|srcset|href)="([^"]+)"/g)) found.push(match[1]);
  return found;
}

// doona's files on GitHub, as ${repository}/blob/main/<path> or /tree/main/<path> for a directory.
const doonaFile = new RegExp(`^${repository.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(blob|tree)/main/([^#?]+)`);

// The problems with the links in file, each as `line N: target ...`. raw replaces the file's text, for tests.
export function linkFailures(file, raw) {
  const failures = [];
  page(file, raw).lines.forEach((line, index) => {
    for (const target of targets(line)) {
      const where = `line ${index + 1}: ${target}`;
      const [path, anchor] = target.split('#');
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
        const match = doonaFile.exec(target);
        if (!match) continue;
        const [, kind, inDoona] = match;
        const found = join(doona, decodeURIComponent(inDoona));
        let problem;
        if (!existsSync(found)) problem = `names no file in doona's checkout`;
        else if (statSync(found).isDirectory() !== (kind === 'tree')) problem = kind === 'tree' ? 'names a file: use /blob/' : 'names a directory: use /tree/';
        else problem = targetProblem(found, anchor);
        if (problem) failures.push(`${where} ${problem}`);
        continue;
      }
      const resolved = path ? resolve(dirname(file), decodeURIComponent(path)) : file;
      const problem = relativeProblem(resolved, anchor);
      if (problem) failures.push(`${where} ${problem}`);
    }
  });
  return failures;
}

// A relative link to resolved, a path in this repository or a screenshot in doona's checkout.
function relativeProblem(resolved, anchor) {
  const inRepo = relative(root, resolved);
  if (inRepo.startsWith('..')) return 'does not resolve';
  const found = locate(resolved);
  if (existsSync(found)) return targetProblem(found, anchor);
  if (awaitsScreenshots(relative(docs, resolved))) return;
  if (existsSync(join(doona, inRepo))) return `is doona's file, which GitHub cannot resolve from here: link ${repository}/blob/main/${inRepo}`;
  return 'does not resolve';
}

// The #anchor on an existing file, if any.
function targetProblem(found, anchor) {
  if (anchor === undefined) return;
  if (!found.endsWith('.md') || statSync(found).isDirectory()) return 'has an anchor on a file that is not Markdown';
  if (!page(found).ids.has(decodeURIComponent(anchor))) return `names no anchor or heading on ${relative(doona, found).startsWith('..') ? relative(root, found) : `doona ${relative(doona, found)}`}`;
}
