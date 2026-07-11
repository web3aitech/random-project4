/* projects-data.js - drives the case-study card grid on /projects/.
 *
 * Empty by design: the live demo shows a styled "Coming soon" placeholder so
 * no fabricated project case studies are published. Add project objects and the
 * grid renders them with no other change needed.
 *
 * CMS INTEGRATION POINT: replace this file with a fetch() from Decap CMS,
 * Sanity, or Contentful. Expected shape:
 *   [{ title, location, scope, summary, image, url }, ...]
 */
window.PROJECTS = [];
