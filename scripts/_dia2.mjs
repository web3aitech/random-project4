import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const sTop = await page.evaluate(()=>document.querySelector('[data-specs-stage]').getBoundingClientRect().top + window.scrollY);
async function at(o){ await page.evaluate(([t,o])=>window.scrollTo(0, t+o), [sTop,o]); await page.waitForTimeout(600); return await page.evaluate(()=>({ prog: window.__demo2.specsReel.progress?Math.round(window.__demo2.specsReel.progress*100)/100:null, metric: document.querySelector('[data-specs-metric]').textContent })); }
console.log("start (full):    ", JSON.stringify(await at(20)));
console.log("mid (drawing out):", JSON.stringify(await at(400)));
console.log("out (gone):      ", JSON.stringify(await at(700)));
await page.close();
