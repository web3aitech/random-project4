/* products-data.js - drives the spec table on /grp-pipes-general-information/.
 * Every value below is verifiable from the source site copy (no fabricated
 * stats). Edit this one file to update the published spec range.
 *
 * CMS INTEGRATION POINT: when the client picks a CMS, replace this static
 * array with a fetch() from Decap CMS / Sanity / Contentful (or load Markdown
 * via the /admin/ panel). The render loop in script.js expects the same shape:
 *   [{ parameter: string, value: string }, ...]
 */
window.PRODUCTS = [
  { parameter: "Diameter range", value: "Up to 2400 mm" },
  {
    parameter: "Pressure ratings",
    value: "Gravity, 6, 9, 10, 12, 16, 20, 25, 32 bar",
  },
  {
    parameter: "Specific Tangential Initial Stiffness",
    value: "2500, 5000, 10000 N/m²",
  },
  { parameter: "Standard length", value: "Up to 12 m" },
  {
    parameter: "Production processes",
    value: "Continuous Filament Winding · Reciprocal Helical Winding",
  },
  {
    parameter: "Standards conformance",
    value: "AWWA C950 · BS EN 1796 / BS EN 14364 · ASTM D3262 / D3517 / D3754",
  },
  {
    parameter: "Pipe layers",
    value: "Inner liner (≤2.5 mm) · Structural layer · Outer liner",
  },
  { parameter: "Products", value: "Pipes · Fittings · Manhole Liners · Cover Slabs · Tanks" },
];
