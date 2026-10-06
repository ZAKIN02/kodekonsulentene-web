import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/lab/typo", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
await p.screenshot({ path: ".skudd/lab-mega.png" });
await p.evaluate(() => document.querySelector(".nokkeltall").scrollIntoView({ block: "center" }));
await p.waitForTimeout(900);
await p.screenshot({ path: ".skudd/lab-tall.png" });
// Midt i horisont-seksjonen
await p.evaluate(() => {
  const h = document.querySelector("[data-horisont]");
  const topp = h.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, topp + (h.offsetHeight - window.innerHeight) * 0.45);
});
await p.waitForTimeout(900);
await p.screenshot({ path: ".skudd/lab-horisont.png" });
console.log("sporets scrollLeft:", await p.evaluate(() => {
  const s = document.querySelector("[data-horisont-spor]");
  return { left: Math.round(s.scrollLeft), maks: s.scrollWidth - s.clientWidth };
}));
await b.close();
