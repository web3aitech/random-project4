// dump-text.mjs
// Read one SingleFile capture, strip all base64 data: URIs, and print the
// remaining readable HTML so a model that cannot view images can still
// extract copy + image context (alt text, surrounding headings, classes).
//
// Usage: node scripts/dump-text.mjs "<source filename>"
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'All dubaipipes.com pages');
const file = process.argv[2];
if (!file) { console.error('pass a filename'); process.exit(1); }
let html = readFileSync(join(SRC, file), 'utf8');
// collapse data: URIs to a short placeholder so the file becomes readable
html = html.replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, 'data:...');
// collapse long CSS variable blobs that survived
html = html.replace(/(--sf-img-[^:]*:\s*)data:\.\.\.(;|,)/g, '$1<IMG>$2');
console.log(html);
