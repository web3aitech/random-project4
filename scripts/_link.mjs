import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(400);
const c = await page.evaluate(() => {
  const a = document.querySelector('#enquire a:not(.btn)');
  return a ? getComputedStyle(a).color : "no link found";
});
console.log("enquire tel link color:", c);
