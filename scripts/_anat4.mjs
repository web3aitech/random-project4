import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const r = await page.evaluate(() => {
  const anat = document.querySelector('[data-motion-chapter="anatomy"]');
  const sts = (window.ScrollTrigger.getAll()||[]).filter(s => s.trigger === anat);
  const info = sts.map(s => ({ pin: !!s.pin, scrub: s.vars.scrub, start: s.start, end: s.end, progress: s.progress, direction: s.direction }));
  // force refresh and re-check
  window.ScrollTrigger.refresh();
  return { scrollY: window.scrollY, anatomyTop: anat.getBoundingClientRect().top + window.scrollY, sts: info };
});
console.log(JSON.stringify(r, null, 2));
