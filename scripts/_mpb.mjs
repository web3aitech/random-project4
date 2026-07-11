import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3500);
const pbTop = await page.evaluate(()=>document.querySelector('[data-pipe-build-stage]').getBoundingClientRect().top + window.scrollY);
async function at(o){ await page.evaluate(([t,o])=>window.scrollTo(0, t+o), [pbTop,o]); await page.waitForTimeout(1100); return await page.evaluate(()=>window.__demo2?.pipeBuild); }
console.log("pb pin start:", JSON.stringify(await at(10)));
console.log("pb 1/4:      ", JSON.stringify(await at(400)));
console.log("pb mid:      ", JSON.stringify(await at(900)));
console.log("pb end:      ", JSON.stringify(await at(1800)));
await page.close();
