import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const before = await page.evaluate(()=>({ scrollY: window.scrollY, lenis: !!window.__demo2?.lenisInstance, bgFallback: (()=>{const b=document.querySelector('.demo2-bg-fallback');return b?getComputedStyle(b).background.slice(0,60):null;})() }));
// simulate a touch swipe (drag up = scroll down)
await page.mouse.move(195, 600);
await page.mouse.down();
for (let y=600; y>=200; y-=40) { await page.mouse.move(195, y); }
await page.mouse.up();
await page.waitForTimeout(1500);
const after = await page.evaluate(()=>({ scrollY: window.scrollY }));
console.log("before:", JSON.stringify(before));
console.log("after swipe:", JSON.stringify(after));
console.log("scroll moved?", after.scrollY > before.scrollY + 50);
await page.close();
