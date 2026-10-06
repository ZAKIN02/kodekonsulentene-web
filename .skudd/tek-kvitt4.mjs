import { chromium } from "@playwright/test";
const b = await chromium.launch();
const s = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await s.goto("http://127.0.0.1:4425/kontakt?sendt=1", { waitUntil: "networkidle" });
const d = await s.evaluate(() => {
  const el = document.querySelector(".kvittering");
  const c = getComputedStyle(el);
  return {
    klasser: el.className,
    foreldre: el.parentElement.className + " / " + el.parentElement.parentElement.className,
    transitionProperty: c.transitionProperty,
    transitionDuration: c.transitionDuration,
    opacity: c.opacity,
    translate: c.translate,
    contentVisibility: c.contentVisibility,
  };
});
console.log(JSON.stringify(d, null, 1));
await b.close();
