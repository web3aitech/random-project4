import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const list = await page.evaluate(()=>{ const secs=[...document.querySelectorAll('main section')]; return secs.map(s=>{const cs=getComputedStyle(s); const ch=s.getAttribute('data-motion-chapter')||s.className.split(' ')[0]; return {ch, img: cs.backgroundImage.slice(0,42), color: cs.backgroundColor}; }); });
list.forEach(c=>console.log(c.ch.padEnd(12), "img:", c.img.padEnd(44), "color:", c.color));
await page.close();
