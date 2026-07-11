import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message));
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const top = await page.evaluate(() => document.querySelector("[data-pipe-build-stage]").getBoundingClientRect().top + window.scrollY);
async function at(offset){ await page.evaluate(([t,o])=>window.__demo2.lenisInstance.scrollTo(t+o,{duration:0.5}), [top,offset]); await page.waitForTimeout(900); return await page.evaluate(()=>({cap: document.querySelector("[data-pipe-build-caption]").textContent, saw: window.__demo2.pipeBuild})); }
console.log("0.05:", JSON.stringify(await at(50)));
console.log("0.55:", JSON.stringify(await at(1100)));
console.log("0.80:", JSON.stringify(await at(1700)));
console.log("errors:", errs.length);
