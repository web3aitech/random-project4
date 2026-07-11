import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

const ar = '\u0627\u0644\u0639\u0631\u0628\u064A\u0629'; // العربية
// Match bare Arabic text (not already wrapped) and wrap it
// match Arabic text whether already followed by </button> or </li> etc
const old = 'AR - ' + ar;
const fixed = 'AR - <span lang="ar">' + ar + '</span>';

function fix(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { fix(full); continue; }
    if (!entry.endsWith('.html')) continue;
    const t = readFileSync(full, 'utf8');
    if (!t.includes(old)) continue;
    writeFileSync(full, t.replaceAll(old, fixed), 'utf8');
    console.log('fixed:', full.replace(PUBLIC, ''));
  }
}

fix(PUBLIC);
console.log('Done.');
