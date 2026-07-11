import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

function htmlFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (e.endsWith('.html')) out.push(full);
  }
  return out;
}

const REPLACEMENTS = [
  // arrow spans with literal ?
  [`btn__arrow">?</span>`,  `btn__arrow">&rarr;</span>`],
  [`btn__arrow">?</button>`, `btn__arrow">&rarr;</button>`],
  // to-top button
  [`to-top" aria-label="Back to top">?`, `to-top" aria-label="Back to top">&uarr;`],
  // inline link arrows: "(PDF) ?" or "text ?" at end of link
  [` ?</a>`, ` &rarr;</a>`],
  [` ?</span>`, ` &rarr;</span>`],
  // mobile nav close
  [`aria-label="Close menu">?`, `aria-label="Close menu">&times;`],
  // nav request-a-quote arrow in header
  [`Request a Quote ?`, `Request a Quote &rarr;`],
  [`Request a Quote ?`, `Request a Quote &rarr;`],
];

let total = 0;
for (const file of htmlFiles(PUBLIC)) {
  let t = readFileSync(file, 'utf8');
  const before = t;
  for (const [from, to] of REPLACEMENTS) {
    while (t.includes(from)) t = t.replaceAll(from, to);
  }
  if (t !== before) {
    writeFileSync(file, t, 'utf8');
    const rel = file.replace(PUBLIC, '');
    console.log('fixed:', rel);
    total++;
  }
}
console.log(`Done. ${total} file(s) updated.`);
