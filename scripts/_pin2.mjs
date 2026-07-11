import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const zoom = await page.evaluate(() => getComputedStyle(document.documentElement).zoom);
const stageTop = await page.evaluate(() => document.querySelector("[data-pipe-build-stage]").getBoundingClientRect().top + window.scrollY);
await page.evaluate((t) => window.__demo2.lenisInstance.scrollTo(t + 1000, {duration:0.8}), stageTop);
await page.waitForTimeout(1200);
const r = await page.evaluate(() => {
  const s = document.querySelector(".pipe-build").getBoundingClientRect();
  const ui = document.querySelector(".pipe-build__ui").getBoundingClientRect();
  return {
    section: {left: Math.round(s.left), top: Math.round(s.top), w: Math.round(s.width), h: Math.round(s.height)},
    ui: {left: Math.round(ui.left), w: Math.round(ui.width), h: Math.round(ui.height)},
    titleColor: getComputedStyle(document.querySelector(".pipe-build__title")).color,
    vw: window.innerWidth, vh: window.innerHeight
  };
});
console.log("zoom:", zoom);
console.log(JSON.stringify(r, null, 2));
const fills = r.section.w === 1440 && r.section.h === 900 && r.ui.w === 1440 && r.ui.h === 900;
console.log(`[${fills?"PASS":"FAIL"}] pinned section + UI fill full viewport (1440x900)`);
