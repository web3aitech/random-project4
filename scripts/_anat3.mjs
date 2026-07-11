import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const top = await page.evaluate(() => document.querySelector('[data-motion-chapter="anatomy"]').getBoundingClientRect().top + window.scrollY);
async function at(off){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [top,off]); await page.waitForTimeout(900); return await page.evaluate(()=>{ const c=document.querySelectorAll('.pipe-diagram circle'); const anat=document.querySelector('[data-motion-chapter="anatomy"]'); const st=(window.ScrollTrigger.getAll()||[]).find(s=>s.trigger===anat && s.pin); return { pinST: st?{progress:st.progress, start:st.start, end:st.end, pin:!!st.pin}:null, outer:+getComputedStyle(c[0]).opacity, struct:+getComputedStyle(c[1]).opacity, inner:+getComputedStyle(c[2]).opacity, bore:+getComputedStyle(c[3]).opacity }; }); }
console.log("-20 (before):", JSON.stringify(await at(-20)));
console.log("20 (start):  ", JSON.stringify(await at(20)));
console.log("400:         ", JSON.stringify(await at(400)));
console.log("900:         ", JSON.stringify(await at(900)));
console.log("1400 (end):  ", JSON.stringify(await at(1400)));
