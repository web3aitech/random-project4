import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message)); page.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
await page.goto("http://localhost:5180/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const r = await page.evaluate(()=>({
  vw: window.innerWidth, vh: window.innerHeight,
  scrollW: document.documentElement.scrollWidth,
  scrollH: document.documentElement.scrollHeight,
  hOverflow: document.documentElement.scrollWidth - window.innerWidth,
  webgl: window.__demo2?.webgl,
  fluidBg: window.__demo2?.fluidBg,
  pipeBuild: window.__demo2?.pipeBuild,
  specsReel: window.__demo2?.specsReel,
  pipeCanvas: !!document.querySelector('[data-pipe-build-canvas]'),
  specsCanvas: !!document.querySelector('[data-specs-canvas]'),
  sections: [...document.querySelectorAll('main > section')].map(s=>({c: s.className.split(' ').filter(c=>c.startsWith('d2')||c==='pipe-build'||c==='specs-reel').join('.')||s.className.slice(0,20), h: Math.round(s.getBoundingClientRect().height)})),
  heroH1: (()=>{const h=document.querySelector('.d2-hero h1');const cs=getComputedStyle(h);return {size:cs.fontSize, w:Math.round(h.getBoundingClientRect().width)};})(),
  headerNavToggle: getComputedStyle(document.querySelector('.nav-toggle')).display,
  headerPrimaryNav: getComputedStyle(document.querySelector('.primary-nav')).display
}));
console.log("HOME mobile:", JSON.stringify(r, null, 2));
console.log("errors:", errs.length, errs.slice(0,4).join(" | "));
// 404 on mobile
await page.goto("http://localhost:5180/grp-pipes-benefits/", { waitUntil: "load" });
await page.waitForTimeout(1500);
const r404 = await page.evaluate(()=>({
  scrollH: document.documentElement.scrollHeight,
  scrollable: document.documentElement.scrollHeight > window.innerHeight + 2,
  btnInView: (()=>{const b=document.querySelector('.nf__back').getBoundingClientRect(); return b.bottom <= window.innerHeight;})(),
  gridCols: getComputedStyle(document.querySelector('.nf')).gridTemplateColumns
}));
console.log("404 mobile:", JSON.stringify(r404, null, 2));
await page.close();
