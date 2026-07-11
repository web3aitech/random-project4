import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const top = await page.evaluate(() => document.querySelector('[data-motion-chapter="anatomy"]').getBoundingClientRect().top + window.scrollY);
async function at(off){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [top,off]); await page.waitForTimeout(900); return await page.evaluate(()=>{ const c=document.querySelectorAll('.pipe-diagram circle'); const li=document.querySelectorAll('.d2-anatomy-list li'); const anat=document.querySelector('[data-motion-chapter="anatomy"]'); const st=(window.ScrollTrigger.getAll()||[]).find(s=>s.trigger===anat && s.pin); const op=el=>parseFloat(getComputedStyle(el).opacity).toFixed(2); return { prog: st?Math.round(st.progress*100)/100:null, outer:op(c[0]), struct:op(c[1]), inner:op(c[2]), bore:op(c[3]), li1:op(li[0]), li2:op(li[1]), li3:op(li[2]) }; }); }
console.log("before:", JSON.stringify(await at(-100)));
console.log("start: ", JSON.stringify(await at(20)));
console.log("1/4:   ", JSON.stringify(await at(360)));
console.log("1/2:   ", JSON.stringify(await at(720)));
console.log("3/4:   ", JSON.stringify(await at(1080)));
console.log("end:   ", JSON.stringify(await at(1440)));
