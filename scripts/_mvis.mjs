import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const pbTop = await page.evaluate(()=>document.querySelector('[data-pipe-build-stage]').getBoundingClientRect().top + window.scrollY);
await page.evaluate((t)=>window.scrollTo(0, t+50), pbTop); await page.waitForTimeout(1000);
const pb = await page.evaluate(()=>{ const s=document.querySelector('.pipe-build'); const ui=document.querySelector('.pipe-build__ui'); const title=document.querySelector('.pipe-build__title'); const cs=s?getComputedStyle(s):null; const uics=ui?getComputedStyle(ui):null; return { secBg: cs?.background?.slice(0,40), secH: cs?.height, uiDisplay: uics?.display, titleColor: title?getComputedStyle(title).color:null, titleOpacity: title?parseFloat(getComputedStyle(title).opacity):null, webgl: window.__demo2?.webgl, webglGate: window.__demo2?.webglGate, noWebglClass: document.documentElement.classList.contains('demo2-no-webgl') }; });
console.log("pipe-build at top:", JSON.stringify(pb, null, 2));
await page.close();
