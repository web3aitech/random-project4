import { chromium } from "playwright";
const page = await (await chromium.launch()).newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on("pageerror",e=>errs.push("pe:"+e.message)); page.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
await page.goto("http://localhost:5180/grp-pipes-benefits/", { waitUntil: "load" });
await page.waitForTimeout(2500);
const r = await page.evaluate(()=>({
  title: document.title,
  num: document.querySelector(".nf__num")?.textContent.trim(),
  backHref: document.querySelector(".nf__back")?.getAttribute("href"),
  backLabel: document.querySelector(".nf__back")?.textContent.trim(),
  pipePresent: !!document.querySelector(".nf__pipe"),
  drips: document.querySelectorAll(".nf__drip").length,
  demo2: document.documentElement.classList.contains("demo2"),
  motion: document.documentElement.classList.contains("demo2-motion"),
  fluid: window.__demo2?.fluidBg,
  lenis: window.__demo2?.lenis
}));
console.log(JSON.stringify(r, null, 2));
console.log("errors:", errs.length, errs.slice(0,5).join(" | "));
// click return button -> should navigate to home
await page.click(".nf__back");
await page.waitForTimeout(1500);
const after = await page.evaluate(()=>({ url: location.pathname, isHome: document.querySelector(".d2-hero")!==null }));
console.log("after click return:", JSON.stringify(after));
await page.close();
