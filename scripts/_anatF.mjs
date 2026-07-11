import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message));
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const aTop = await page.evaluate(() => document.querySelector('[data-motion-chapter="anatomy"]').getBoundingClientRect().top + window.scrollY);
async function at(o){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.6}), [aTop,o]); await page.waitForTimeout(1100); return await page.evaluate(()=>{ const op=el=>parseFloat(getComputedStyle(el).opacity).toFixed(2); const c=document.querySelectorAll('.pipe-diagram circle'); const anat=document.querySelector('[data-motion-chapter="anatomy"]'); const st=(window.ScrollTrigger.getAll()||[]).find(s=>s.trigger===anat&&s.pin); return { prog: st?Math.round(st.progress*100)/100:null, outer:op(c[0]), struct:op(c[1]), inner:op(c[2]), bore:op(c[3]) }; }); }
console.log("build mid (outer+struct):   ", JSON.stringify(await at(700)));
console.log("hold start ~0.8 (all 1):    ", JSON.stringify(await at(1440)));
console.log("pin end (prog 1, all 1):    ", JSON.stringify(await at(1800)));
console.log("reverse to mid:             ", JSON.stringify(await at(700)));
console.log("reverse to before (all 0):  ", JSON.stringify(await at(-200)));
console.log("errors:", errs.length);
