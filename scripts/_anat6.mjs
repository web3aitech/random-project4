import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const r = await page.evaluate(() => {
  const anat = document.querySelector('[data-motion-chapter="anatomy"]');
  const sts = (window.ScrollTrigger.getAll()||[]).filter(s => s.trigger === anat);
  const pin = sts.find(s => s.pin);
  return {
    webgl: window.__demo2.webgl,
    pipeBuild: window.__demo2.pipeBuild,
    anatomyTop: anat.getBoundingClientRect().top + window.scrollY,
    pinST: pin ? {start: pin.start, end: pin.end, progress: pin.progress} : null,
    manualRefresh: null
  };
});
console.log("before refresh:", JSON.stringify(r, null, 2));
// manual refresh + recheck
const r2 = await page.evaluate(() => {
  window.ScrollTrigger.refresh();
  const anat = document.querySelector('[data-motion-chapter="anatomy"]');
  const pin = (window.ScrollTrigger.getAll()||[]).find(s => s.trigger === anat && s.pin);
  return { anatomyTop: anat.getBoundingClientRect().top + window.scrollY, pinST: pin ? {start: pin.start, end: pin.end, progress: pin.progress} : null };
});
console.log("after manual refresh:", JSON.stringify(r2, null, 2));
