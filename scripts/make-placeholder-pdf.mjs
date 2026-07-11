// make-placeholder-pdf.mjs
// Generate a minimal, valid one-page PDF used as a stand-in for documents
// that were not embedded in the SingleFile captures (the official catalog PDF
// and the location-map PDF). The real files should be dropped in to replace
// these; they exist only so download links are live instead of 404.
//
// Usage: node scripts/make-placeholder-pdf.mjs "<out path>" "<headline>" "<line2>"
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [, , out, headline, line2] = process.argv;
if (!out || !headline) { console.error('usage: make-placeholder-pdf.mjs <out> <headline> <line2>'); process.exit(1); }

// Escape parens/backslashes for PDF string literals.
const esc = (s) => s.replace(/\\|\(|\)/g, '\\$&');
const content = `BT /F1 20 Tf 72 760 Td (${esc(headline)}) Tj ET\nBT /F1 11 Tf 72 728 Td (${esc(line2 || '')}) Tj ET\nBT /F1 9 Tf 72 700 Td (Placeholder document generated for the dubaipipes.com redesign demo.) Tj ET\nBT /F1 9 Tf 72 686 Td (Replace this file with the official asset before going live.) Tj ET\n`;

const objects = [];
objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
objects[3] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`;
objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
objects[5] = `<< /Length ${content.length} >>\nstream\n${content}endstream`;

let pdf = '%PDF-1.4\n';
const offsets = [];
for (let i = 1; i < objects.length; i++) {
  offsets[i] = Buffer.byteLength(pdf, 'utf8');
  pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
}
const xrefStart = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
for (let i = 1; i < objects.length; i++) {
  pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
}
pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pdf, 'latin1');
console.log('wrote', out, `(${Buffer.byteLength(pdf)} bytes)`);
