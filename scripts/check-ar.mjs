import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

function check(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { check(full); continue; }
    if (!entry.endsWith('.html')) continue;
    const t = readFileSync(full, 'utf8');
    const i = t.indexOf('data-code="AR"');
    if (i === -1) continue;
    console.log(full.replace(PUBLIC, ''), JSON.stringify(t.slice(i, i + 120)));
  }
}
check(PUBLIC);
