import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(400);
const r = await page.evaluate(() => ({
  headerBrandSrc: document.querySelector("header .brand__logo")?.getAttribute("src"),
  headerBrandSize: (() => { const l=document.querySelector("header .brand__logo"); const cs=getComputedStyle(l); return {w:cs.width,h:cs.height}; })(),
  heroLogoPresent: !!document.querySelector(".d2-hero__logo"),
  heroLogoSrc: document.querySelector(".d2-hero__logo")?.getAttribute("src"),
  heroLogoH: getComputedStyle(document.querySelector(".d2-hero__logo")).height
}));
console.log(JSON.stringify(r, null, 2));
