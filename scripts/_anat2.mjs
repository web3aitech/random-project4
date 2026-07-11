import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message));
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const r = await page.evaluate(() => {
  const c = document.querySelectorAll('.pipe-diagram circle');
  const anat = document.querySelector('[data-motion-chapter="anatomy"]');
  const st = (window.ScrollTrigger.getAll()||[]).find(s => s.trigger === anat);
  return {
    circleOpacityAtLoad: c.length ? parseFloat(getComputedStyle(c[0]).opacity) : null,
    circleCount: c.length,
    anatomyST: st ? {pin: !!st.pin, start: st.start, end: st.end, progress: st.progress} : "NONE",
    stCount: (window.ScrollTrigger.getAll()||[]).length
  };
});
console.log(JSON.stringify(r, null, 2));
console.log("errors:", errs.length);
