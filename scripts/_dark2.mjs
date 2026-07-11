import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const r = await page.evaluate(()=>{ const secs=[...document.querySelectorAll('main > section')]; return { count: secs.length, list: secs.map(s=>({ch: s.getAttribute('data-motion-chapter')||s.className.split(' ')[0], bg: getComputedStyle(s).backgroundImage.slice(0,50)})) }; });
console.log("section count:", r.count);
r.list.forEach(c=>console.log(c.ch, "->", c.bg));
await page.close();
