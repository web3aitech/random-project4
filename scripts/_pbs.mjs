import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const pbTop = await page.evaluate(()=>document.querySelector('[data-pipe-build-stage]').getBoundingClientRect().top + window.scrollY);
async function at(o){ await page.evaluate(([t,o])=>window.scrollTo(0, t+o), [pbTop,o]); await page.waitForTimeout(900); return await page.evaluate(()=>window.__demo2?.pipeBuild); }
console.log("mid:    ", JSON.stringify(await at(900)));
console.log("end:    ", JSON.stringify(await at(2100)));
console.log("caption at end:", await page.evaluate(()=>document.querySelector('[data-pipe-build-caption]')?.textContent));
await page.close();
