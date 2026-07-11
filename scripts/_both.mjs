import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message));
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
async function scrubSel(sel, offs){ const top = await page.evaluate((s)=>document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel); const out=[]; for (const o of offs){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [top,o]); await page.waitForTimeout(800); out.push(await page.evaluate(()=>{})); } return top; }
// specs
const sTop = await page.evaluate(() => document.querySelector('[data-specs-stage]').getBoundingClientRect().top + window.scrollY);
async function specsAt(o){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [sTop,o]); await page.waitForTimeout(800); return await page.evaluate(()=>({ metric: document.querySelector('[data-specs-metric]').textContent, prog: document.querySelector('[data-specs-progress] span').textContent, progress: window.__demo2.specsReel.progress?Math.round(window.__demo2.specsReel.progress*100)/100:null, active: window.__demo2.specsReel.active })); }
console.log("specs start (want ~0/diameter):", JSON.stringify(await specsAt(20)));
console.log("specs mid   (want pressure):    ", JSON.stringify(await specsAt(700)));
console.log("specs end   (want length):      ", JSON.stringify(await specsAt(1500)));
// anatomy
const aTop = await page.evaluate(() => document.querySelector('[data-motion-chapter="anatomy"]').getBoundingClientRect().top + window.scrollY);
async function anatAt(o){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [aTop,o]); await page.waitForTimeout(800); return await page.evaluate(()=>{ const c=document.querySelectorAll('.pipe-diagram circle'); const op=el=>parseFloat(getComputedStyle(el).opacity).toFixed(2); const anat=document.querySelector('[data-motion-chapter="anatomy"]'); const st=(window.ScrollTrigger.getAll()||[]).find(s=>s.trigger===anat&&s.pin); return { prog: st?Math.round(st.progress*100)/100:null, outer:op(c[0]), inner:op(c[2]), bore:op(c[3]) }; }); }
console.log("anatomy start (want prog~0, outer~0):", JSON.stringify(await anatAt(20)));
console.log("anatomy mid   (want prog~0.5):        ", JSON.stringify(await anatAt(720)));
console.log("anatomy end   (want prog~1, all 1):   ", JSON.stringify(await anatAt(1440)));
console.log("errors:", errs.length);
