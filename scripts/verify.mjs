// scripts/verify.mjs — headless smoke test for the Demo 2 motion layer.
// Usage: node scripts/verify.mjs [url]
// Requires the dev server running: npm run dev  (http://localhost:5173)
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:5173";

let fail = 0;
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

// "Failed to load resource" is expected for the 404 page (the document itself
// returns 404) — don't treat it as a real error.
function isRealError(t) { return !/Failed to load resource/i.test(t); }

async function probe(path, opts = {}) {
  const page = await ctx.newPage();
  if (opts.reducedMotion) await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  const warnings = [];
  page.on("console", (m) => {
    if (m.type() === "error" && isRealError(m.text())) errors.push(m.text());
    if (m.type() === "warning") warnings.push(m.text());
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(BASE.replace(/\/$/, "") + "/" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // let deferred scripts + Lenis + WebGL lazy-load init
  const state = await page.evaluate(() => window.__demo2 || null);
  const demo2Class = await page.evaluate(() => document.documentElement.classList.contains("demo2"));
  const motionClass = await page.evaluate(() => document.documentElement.classList.contains("demo2-motion"));
  await page.close();
  const slim = state ? { lenis: state.lenis, webgl: state.webgl, reducedMotion: state.reducedMotion, scrollTriggerCount: state.scrollTriggerCount, phase: state.phase } : null;
  return { errors, warnings, state: slim, demo2Class, motionClass };
}

// Home: Lenis active, motion + webgl on, no errors.
const home = await probe("");
const homeOk = home.errors.length === 0 && home.state && home.state.lenis === true && home.demo2Class && home.motionClass;
console.log(`[${homeOk ? "PASS" : "FAIL"}] ${BASE}/  errors=${home.errors.length}  warnings=${home.warnings.length}  __demo2=${JSON.stringify(home.state)}`);
if (home.errors.length) { home.errors.slice(0, 5).forEach((e) => console.log("    ERR: " + e)); fail++; }

// 404: a deleted interior URL serves the custom 404 page (broken pipe + return button).
const p404 = await ctx.newPage();
const p404Errs = [];
p404.on("pageerror", (e) => p404Errs.push("pageerror: " + e.message));
p404.on("console", (m) => { if (m.type() === "error" && isRealError(m.text())) p404Errs.push(m.text()); });
await p404.goto(BASE.replace(/\/$/, "") + "/grp-pipes-benefits/", { waitUntil: "networkidle" });
await p404.waitForTimeout(800);
const f = await p404.evaluate(() => ({
  num: document.querySelector(".nf__num")?.textContent.trim(),
  backHref: document.querySelector(".nf__back")?.getAttribute("href"),
  motion: document.documentElement.classList.contains("demo2-motion")
}));
await p404.close();
const fOk = f.num && f.num.startsWith("404") && f.backHref === "/" && f.motion && p404Errs.length === 0;
console.log(`[${fOk ? "PASS" : "FAIL"}] 404 page  num="${f.num}"  back="${f.backHref}"  errors=${p404Errs.length}`);
if (p404Errs.length) { p404Errs.slice(0, 5).forEach((e) => console.log("    ERR: " + e)); fail++; }

// Reduced-motion: no Lenis, content visible, no WebGL.
const rm = await probe("", { reducedMotion: true });
const rmOk = rm.state && rm.state.lenis === false && rm.state.reducedMotion === true && rm.demo2Class === true && rm.motionClass === false;
console.log(`[${rmOk ? "PASS" : "FAIL"}] reduced-motion  __demo2=${JSON.stringify(rm.state)}  .demo2-motion=${rm.motionClass}`);
if (rm.errors.length) { rm.errors.slice(0, 5).forEach((e) => console.log("    ERR: " + e)); fail++; }

await browser.close();
console.log(fail === 0 ? "\nALL PASS" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
