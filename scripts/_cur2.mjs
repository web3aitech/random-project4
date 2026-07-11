import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
async function probe(x,y){ await page.mouse.move(x,y); await page.waitForTimeout(250); return await page.evaluate(()=>{const r=document.querySelector(".demo2-cursor").getBoundingClientRect(); return Math.round(r.left+r.width/2);}); }
const z = await page.evaluate(() => getComputedStyle(document.documentElement).zoom);
const a = await probe(100,50);
const b = await probe(1400,50);
const c = await probe(720,450);
console.log("zoom:", z);
console.log("pointer 100,50  -> cursor x:", a, "(want 100)");
console.log("pointer 1400,50 -> cursor x:", b, "(want 1400)");
console.log("pointer 720,450 -> cursor x:", c, "(want 720)");
const ok = a===100 && b===1400 && c===720;
console.log(`[${ok?"PASS":"FAIL"}] cursor aligns to pointer across full width`);
