// serve.mjs - zero-dependency static dev server for the dubaipipes.com redesign.
// Serves public/ with clean-URL resolution (so /contact-us/ serves
// /contact-us/index.html), matching Vercel's cleanUrls. No build step needed
// for content changes - only re-run `npm run build` if you edit src-pages/.
//
// Usage:  npm run dev   (then open http://localhost:4000)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'public');
const PORT = process.env.PORT || 4000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let path = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');

  let filePath = join(ROOT, path);
  if (path.endsWith('/')) filePath = join(filePath, 'index.html');
  else if (!extname(filePath)) filePath = join(ROOT, path, 'index.html');
  else if (!existsSync(filePath) && existsSync(join(ROOT, path, 'index.html')))
    filePath = join(ROOT, path, 'index.html');

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    // Serve the custom 404 page (public/404.html) for any unmatched route —
    // interior pages are restricted in this demo and 404 here.
    const notFound = join(ROOT, '404.html');
    if (existsSync(notFound)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(readFileSync(notFound));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1><p>Not found.</p>');
    return;
  }
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(readFileSync(filePath));
}).listen(PORT, () => {
  console.log(`Dubai Pipes redesign - serving public/ at http://localhost:${PORT}`);
});
