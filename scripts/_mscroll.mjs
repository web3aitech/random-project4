import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const init = await page.evaluate(()=>({
  bodyOverflow: getComputedStyle(document.body).overflow,
  htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
  scrollH: document.documentElement.scrollHeight,
  lenis: !!window.__demo2?.lenisInstance,
  pipeBuild: window.__demo2?.pipeBuild,
  specs: window.__demo2?.specsReel
}));
console.log("init:", JSON.stringify(init, null, 2));
// programmatic scroll to pipe-build
await page.evaluate(()=>window.scrollTo(0, 900));
await page.waitForTimeout(1200);
const pb = await page.evaluate(()=>window.__demo2?.pipeBuild);
console.log("at pipe-build (scroll 900):", JSON.stringify(pb));
// scroll to specs
await page.evaluate(()=>{ const s=document.querySelector('[data-specs-stage]'); window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY + 400); });
await page.waitForTimeout(1200);
const sp = await page.evaluate(()=>({specs: window.__demo2?.specsReel, scrollY: window.scrollY}));
console.log("at specs:", JSON.stringify(sp));
await page.close();
