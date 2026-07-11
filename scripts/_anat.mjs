import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message));
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const top = await page.evaluate(() => { const s=document.querySelector('[data-motion-chapter="anatomy"]'); return s.getBoundingClientRect().top + window.scrollY; });
async function at(off){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [top,off]); await page.waitForTimeout(900); return await page.evaluate(()=>{ const c=document.querySelectorAll('.pipe-diagram circle'); const li=document.querySelectorAll('.d2-anatomy-list li'); return { outer: parseFloat(getComputedStyle(c[0]).opacity), struct: parseFloat(getComputedStyle(c[1]).opacity), inner: parseFloat(getComputedStyle(c[2]).opacity), bore: parseFloat(getComputedStyle(c[3]).opacity), li3: parseFloat(getComputedStyle(li[2]).opacity), li2: parseFloat(getComputedStyle(li[1]).opacity), li1: parseFloat(getComputedStyle(li[0]).opacity) }; }); }
console.log("pin start (outer only):", JSON.stringify(await at(20)));
console.log("mid (structural):      ", JSON.stringify(await at(500)));
console.log("late (inner+bore):     ", JSON.stringify(await at(1100)));
console.log("errors:", errs.length);
