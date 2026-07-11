import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const sTop = await page.evaluate(() => document.querySelector('[data-specs-stage]').getBoundingClientRect().top + window.scrollY);
// scroll to specs end (progress ~1), then JUMP up fast to before specs start
await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.4}), [sTop, 1700]);
await page.waitForTimeout(700);
const atEnd = await page.evaluate(()=>({ prog: window.__demo2.specsReel.progress, metric: document.querySelector('[data-specs-metric]').textContent }));
// fast scroll up past specs start (instant-ish)
await page.evaluate(([t])=>window.__demo2.lenisInstance.scrollTo(t-200,{duration:0.3}), [sTop]);
await page.waitForTimeout(800);
const afterFastUp = await page.evaluate(()=>{ const sr=window.__demo2.specsReel; const anat=document.querySelector('[data-motion-chapter="anatomy"]'); const anatTop=anat.getBoundingClientRect().top; return { specsProg: sr.progress, specsActive: sr.active, scrollY: window.scrollY, anatTopInViewport: Math.round(anatTop) }; });
console.log("at specs end:    ", JSON.stringify(atEnd));
console.log("after fast up:  ", JSON.stringify(afterFastUp));
// scroll back down into specs — should resume from correct state, not skip
await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [sTop, 200]);
await page.waitForTimeout(900);
const resumed = await page.evaluate(()=>({ prog: window.__demo2.specsReel.progress, metric: document.querySelector('[data-specs-metric]').textContent }));
console.log("resumed down:    ", JSON.stringify(resumed));
