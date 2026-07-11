import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
// title color check (problem 1)
const titleColor = await page.evaluate(() => getComputedStyle(document.querySelector(".pipe-build__title")).color);
// scroll into the pin
const stageTop = await page.evaluate(() => document.querySelector("[data-pipe-build-stage]").getBoundingClientRect().top + window.scrollY);
await page.evaluate((t) => window.__demo2.lenisInstance.scrollTo(t + 1000, {duration:0.8}), stageTop);
await page.waitForTimeout(1200);
// during pin: rects of section, ui, title (screen px)
const rects = await page.evaluate(() => {
  const s = document.querySelector(".pipe-build").getBoundingClientRect();
  const ui = document.querySelector(".pipe-build__ui").getBoundingClientRect();
  const t = document.querySelector(".pipe-build__title").getBoundingClientRect();
  const cs = document.querySelector(".pipe-build");
  return {
    sectionPos: getComputedStyle(cs).position,
    section: {left: Math.round(s.left), top: Math.round(s.top), w: Math.round(s.width), h: Math.round(s.height)},
    ui: {left: Math.round(ui.left), top: Math.round(ui.top), w: Math.round(ui.width), h: Math.round(ui.height)},
    title: {left: Math.round(t.left), top: Math.round(t.top), w: Math.round(t.width)},
    vw: window.innerWidth, vh: window.innerHeight
  };
});
console.log("title color:", titleColor);
console.log(JSON.stringify(rects, null, 2));
