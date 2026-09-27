// Colours the docs' code blocks at build time. dae goes through the app's own tokenizer, so a block reads as it does in
// doona; shell and ini get small tokenizers of their own. Every language uses the app's token names, which the
// stylesheet colours as the app does.
import {tokenizeDae} from '../src/ui/code/daeTokens.ts';

const reserved = /^(if|then|else|elif|fi|for|while|until|do|done|case|esac|in|function)$/;

// One command per line unless the line ends in a backslash. A command's first word is coloured as a dae function
// name, and so is the word after sudo; shell keywords as keywords; operators, redirections and $( ) as operators.
function tokenizeShell(text) {
  const tokens = [];
  let command = true;
  for (const [index, line] of text.split('\n').entries()) {
    if (index) tokens.push({text: '\n', type: null});
    let rest = line;
    const take = (length, type) => {
      tokens.push({text: rest.slice(0, length), type});
      rest = rest.slice(length);
    };
    while (rest) {
      const start = rest === line || /\s$/.test(line.slice(0, line.length - rest.length));
      let match;
      if ((match = /^\s+/.exec(rest))) take(match[0].length, null);
      else if (start && rest.startsWith('#')) take(rest.length, 'comment');
      else if ((match = /^'[^']*'|^"(?:[^"\\]|\\.)*"/.exec(rest))) {
        take(match[0].length, 'string');
        command = false;
      } else if (rest === '\\') take(1, 'operator');
      else if ((match = /^(?:\|\||&&|;;|[|;&]|\$\()/.exec(rest))) {
        take(match[0].length, 'operator');
        command = true;
      } else if ((match = /^(?:\d*(?:>>|>|<)(?:&\d+)?|&>>?|\))/.exec(rest))) take(match[0].length, 'operator');
      else if ((match = /^\$(?:\{[^}]*\}|\w+)/.exec(rest))) {
        take(match[0].length, 'variableName');
        command = false;
      } else if (command && (match = /^[A-Za-z_]\w*(?==)/.exec(rest))) {
        take(match[0].length, 'variableName');
        take(1, 'operator');
        command = false;
      } else if (!(match = /^(?:[^\s|&;<>()'"$\\]|\\.)+/.exec(rest))) take(1, null);
      else {
        const word = match[0];
        const type = !command || word.startsWith('-') ? null : reserved.test(word) ? 'keyword' : 'propertyName';
        take(word.length, type);
        if (type === 'propertyName') command = word === 'sudo';
      }
    }
    if (!line.endsWith('\\')) command = true;
  }
  return tokens;
}

// systemd units and other ini files: [Section] as a keyword, a key as a dae function name, # and ; comments.
function tokenizeIni(text) {
  return text.split('\n').flatMap((line, index) => {
    const tokens = index ? [{text: '\n', type: null}] : [];
    const section = /^(\s*)(\[[^\]]*\])(.*)$/.exec(line);
    const entry = /^(\s*)([^=\s#;][^=]*?)(\s*=)(.*)$/.exec(line);
    if (/^\s*[#;]/.test(line)) tokens.push({text: line, type: 'comment'});
    else if (section) tokens.push({text: section[1], type: null}, {text: section[2], type: 'keyword'}, {text: section[3], type: null});
    else if (entry)
      tokens.push({text: entry[1], type: null}, {text: entry[2], type: 'propertyName'}, {text: entry[3], type: 'operator'}, {text: entry[4], type: null});
    else tokens.push({text: line, type: null});
    return tokens;
  });
}

const tokenizers = {dae: tokenizeDae, sh: tokenizeShell, bash: tokenizeShell, shell: tokenizeShell, ini: tokenizeIni, text: null};
export const languages = Object.keys(tokenizers);

const escape = text => text.replace(/[&<>]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'})[char]);

// The block's HTML; `language` must be one of `languages`.
export function highlight(code, language) {
  const tokenize = tokenizers[language];
  if (!tokenize) return escape(code);
  return tokenize(code)
    .filter(token => token.text)
    .map(token => (token.type ? `<span class="t-${token.type}">${escape(token.text)}</span>` : escape(token.text)))
    .join('');
}
