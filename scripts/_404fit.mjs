import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/grp-pipes-benefits/", { waitUntil: "load" });
await page.waitForTimeout(1500);
const r = await page.evaluate(()=>({
  vh: window.innerHeight,
  docHeight: document.documentElement.scrollHeight,
  scrollable: document.documentElement.scrollHeight > window.innerHeight + 2,
  btnRect: (()=>{ const b=document.querySelector('.nf__back').getBoundingClientRect(); return {top: Math.round(b.top), bottom: Math.round(b.bottom), inView: b.bottom <= window.innerHeight && b.top >= 0 }; })(),
  numRect: (()=>{ const n=document.querySelector('.nf__num').getBoundingClientRect(); return {top: Math.round(n.top), bottom: Math.round(n.bottom), inView: n.bottom <= window.innerHeight && n.top >= 0 }; })(),
  gridCols: getComputedStyle(document.querySelector('.nf')).gridTemplateColumns
}));
console.log(JSON.stringify(r, null, 2));
await page.close();
