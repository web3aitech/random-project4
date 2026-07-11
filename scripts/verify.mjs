// scripts/verify.mjs — headless smoke test for the Demo 2 motion layer.
// Usage: node scripts/verify.mjs [url]
// Requires the dev server running: npm run dev  (http://localhost:5173)
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:5173";
const PAGES = ["", "grp-pipes-benefits/", "contact-us/"];

let fail = 0;
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  // emulate a capable desktop (matches the WebGL gate)
  deviceScaleFactor: 1,
});

async function probe(path, opts = {}) {
  const page = await ctx.newPage();
  if (opts.reducedMotion) {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }
  const errors = [];
  const warnings = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
    if (m.type() === "warning") warnings.push(m.text());
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(BASE.replace(/\/$/, "") + "/" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(600); // let deferred scripts + Lenis init
  const state = await page.evaluate(() => window.__demo2 || null);
  const demo2Class = await page.evaluate(() => document.documentElement.classList.contains("demo2"));
  const motionClass = await page.evaluate(() => document.documentElement.classList.contains("demo2-motion"));
  await page.close();
  const slim = state ? { lenis: state.lenis, webgl: state.webgl, reducedMotion: state.reducedMotion, scrollTriggerCount: state.scrollTriggerCount, phase: state.phase } : null;
  return { errors, warnings, state: slim, demo2Class, motionClass };
}

for (const p of PAGES) {
  const r = await probe(p);
  const ok = r.errors.length === 0 && r.state && r.state.lenis === true && r.demo2Class && r.motionClass;
  console.log(`[${ok ? "PASS" : "FAIL"}] ${BASE.replace(/\/$/, "") + "/" + p}  errors=${r.errors.length}  warnings=${r.warnings.length}  __demo2=${JSON.stringify(r.state)}  .demo2=${r.demo2Class}  .demo2-motion=${r.motionClass}`);
  if (r.errors.length) { r.errors.slice(0, 5).forEach((e) => console.log("    ERR: " + e)); fail++; }
  if (r.warnings.length) r.warnings.slice(0, 3).forEach((w) => console.log("    warn: " + w));
}

// Reduced-motion path: no Lenis, content visible, no canvas injected.
const rm = await probe("", { reducedMotion: true });
const rmOk = rm.state && rm.state.lenis === false && rm.state.reducedMotion === true && rm.demo2Class === true && rm.motionClass === false;
console.log(`[${rmOk ? "PASS" : "FAIL"}] reduced-motion  __demo2=${JSON.stringify(rm.state)}  .demo2-motion=${rm.motionClass}`);
if (rm.errors.length) { rm.errors.slice(0, 5).forEach((e) => console.log("    ERR: " + e)); fail++; }

await browser.close();
console.log(fail === 0 ? "\nALL PASS" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
