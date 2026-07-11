import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message));
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const before = await page.evaluate(()=>({ scrollY: window.scrollY, lenis: !!window.__demo2?.lenisInstance, webgl: window.__demo2?.webgl, fluid: window.__demo2?.fluidBg, cores: navigator.hardwareConcurrency, bgFallback: (()=>{const b=document.querySelector('.demo2-bg-fallback');return b?getComputedStyle(b).backgroundColor:null;})() }));
await page.mouse.move(195, 600); await page.mouse.down();
for (let y=600; y>=150; y-=30) { await page.mouse.move(195, y); }
await page.mouse.up(); await page.waitForTimeout(1500);
const after = await page.evaluate(()=>({ scrollY: window.scrollY }));
console.log("before:", JSON.stringify(before));
console.log("after swipe:", JSON.stringify(after));
console.log("scroll moved?", after.scrollY > before.scrollY + 50);
console.log("errors:", errs.length, errs.slice(0,4).join(" | "));
await page.close();
