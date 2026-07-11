import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const r = await page.evaluate(()=>({
  pbFallback: getComputedStyle(document.querySelector('.pipe-build__fallback')).display,
  pbCanvas: getComputedStyle(document.querySelector('.pipe-build__canvas')).display,
  specsFallback: getComputedStyle(document.querySelector('.specs-reel__fallback')).display,
  webgl: window.__demo2?.webgl
}));
console.log("desktop:", JSON.stringify(r));
await page.close();
