import { readFileSync, readdirSync, statSync } from 'fs';
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

for (const file of htmlFiles(PUBLIC)) {
  const t = readFileSync(file, 'utf8');
  const rel = file.replace(PUBLIC, '');
  // Find every occurrence of literal ? followed immediately by < or whitespace+<
  let idx = 0;
  while ((idx = t.indexOf('?', idx)) !== -1) {
    const ch = t.charCodeAt(idx);
    // literal ASCII 63
    if (ch === 63) {
      const context = t.slice(Math.max(0, idx - 50), idx + 20);
      // only show if it looks like it's inside HTML (not in an attribute value that is a real question)
      if (context.includes('</') || context.includes('<a') || context.includes('btn') || context.includes('href')) {
        console.log(`${rel}:${idx}  ...${context.replace(/\n/g,' ')}...`);
      }
    }
    idx++;
  }
}
