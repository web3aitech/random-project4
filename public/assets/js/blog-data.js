/* blog-data.js - drives the card grid on /blog/.
 *
 * Empty by design: the live demo shows a styled "Coming soon" placeholder so
 * no fabricated posts are published. Drop post objects into this array and the
 * grid renders them with no other change needed.
 *
 * CMS INTEGRATION POINT: replace this file with a fetch() from Decap CMS
 * (recommended), Sanity, or Contentful. Expected shape:
 *   [{ title, date, category, excerpt, image, url }, ...]
 * With Decap CMS, posts live as Markdown in /content/blog/ and the /admin/
 * panel writes them; a tiny build step (or client-side markdown renderer) turns
 * them into this array. Vercel rebuilds on save.
 */
window.BLOG_POSTS = [];
