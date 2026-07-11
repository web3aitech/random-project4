import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const aTop = await page.evaluate(() => document.querySelector('[data-motion-chapter="anatomy"]').getBoundingClientRect().top + window.scrollY);
// scroll to anatomy pin start (top top)
await page.evaluate((t)=>window.__demo2.lenisInstance.scrollTo(t,{duration:0.6}), aTop);
await page.waitForTimeout(1000);
const r = await page.evaluate(()=>{ const anat=document.querySelector('[data-motion-chapter="anatomy"]'); const grid=document.querySelector('.d2-anatomy-grid'); const ar=anat.getBoundingClientRect(); const gr=grid.getBoundingClientRect(); const cs=getComputedStyle(anat); return { sectionTop: Math.round(ar.top), sectionH: Math.round(ar.height), gridBottom: Math.round(gr.bottom), gridBottomInView: gr.bottom <= window.innerHeight, bg: cs.backgroundColor, bgImage: cs.backgroundImage.slice(0,40) }; });
console.log(JSON.stringify(r, null, 2));
