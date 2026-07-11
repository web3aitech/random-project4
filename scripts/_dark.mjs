import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const cols = await page.evaluate(()=>[...document.querySelectorAll('main > section')].map(s=>{const cs=getComputedStyle(s).backgroundColor; const ch=s.getAttribute('data-motion-chapter')||s.className.split(' ')[0]; return {ch, bg: cs};}));
cols.forEach(c=>console.log(c.ch, "->", c.bg));
await page.close();
