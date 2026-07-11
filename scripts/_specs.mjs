import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message));
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const top = await page.evaluate(() => document.querySelector('[data-specs-stage]').getBoundingClientRect().top + window.scrollY);
async function at(off){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [top,off]); await page.waitForTimeout(900); return await page.evaluate(()=>{ const sr=window.__demo2.specsReel||{}; const m=document.querySelector('[data-specs-metric]').textContent; const n=document.querySelector('[data-specs-num]').textContent; const p=document.querySelector('[data-specs-progress] span').textContent; return { metric:m, num:n, prog:p, active:sr.active, renderCount:sr.renderCount, progress:sr.progress?Math.round(sr.progress*100)/100:null }; }); }
console.log("stop1 (diameter):", JSON.stringify(await at(20)));
console.log("stop2 (pressure):", JSON.stringify(await at(700)));
console.log("stop3 (length): ", JSON.stringify(await at(1500)));
console.log("errors:", errs.length);
