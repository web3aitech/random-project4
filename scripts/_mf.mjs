import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const pbTop = await page.evaluate(()=>document.querySelector('[data-pipe-build-stage]').getBoundingClientRect().top + window.scrollY);
await page.evaluate((t)=>window.scrollTo(0, t+50), pbTop); await page.waitForTimeout(800);
const r = await page.evaluate(()=>({
  pbFallback: getComputedStyle(document.querySelector('.pipe-build__fallback')).display,
  pbCanvas: getComputedStyle(document.querySelector('.pipe-build__canvas')).display,
  pbUi: getComputedStyle(document.querySelector('.pipe-build__ui')).display,
  pbFil: !!document.querySelector('.pb-fil'),
  webglGate: window.__demo2?.webglGate,
  specsFallback: getComputedStyle(document.querySelector('.specs-reel__fallback')).display,
  specsRows: document.querySelectorAll('.specs-reel__fallback .sf-row').length
}));
console.log("mobile:", JSON.stringify(r, null, 2));
await page.close();
