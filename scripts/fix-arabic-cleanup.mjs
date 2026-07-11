import { readFileSync, writeFileSync } from 'fs';

// The broken string produced by earlier bad PowerShell escapes
const BROKEN  = 'AR - <span lang="ar">\u0639\u0631\u0628\u064A\u0629</span>0628}u{064A}u{0629}';
// The correct string
const CORRECT = 'AR - <span lang="ar">\u0627\u0644\u0639\u0631\u0628\u064A\u0629</span>';

const files = [
  'c:/Users/prajw/Documents/random-project-3/public/index.html',
  'c:/Users/prajw/Documents/random-project-3/public/contact-us/index.html',
];

for (const file of files) {
  let t = readFileSync(file, 'utf8');
  if (t.includes(BROKEN)) {
    t = t.replaceAll(BROKEN, CORRECT);
    writeFileSync(file, t, 'utf8');
    console.log('fixed:', file);
  } else {
    console.log('no match in:', file);
    // show what's actually around "AR - " for diagnosis
    const i = t.indexOf('AR - ');
    if (i !== -1) console.log('  actual:', JSON.stringify(t.slice(i, i + 80)));
  }
}
