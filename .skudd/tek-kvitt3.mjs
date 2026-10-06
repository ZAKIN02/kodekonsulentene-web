/** Treg overgang (5 s) gjør at den umulig kan rekke å bli ferdig før vi måler. */
import { chromium } from "@playwright/test";
const b = await chromium.launch();
const s = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await s.addInitScript(() => {
  const st = document.createElement("style");
  st.textContent = ".kvittering{transition-duration:5s !important}";
  const sett = () => (document.head || document.documentElement).append(st);
  if (document.head) sett(); else new MutationObserver((_, o) => { if (document.head) { sett(); o.disconnect(); } }).observe(document.documentElement, { childList: true, subtree: true });
});
await s.goto("http://127.0.0.1:4425/kontakt?sendt=1", { waitUntil: "commit" });
const spor = await s.evaluate(async () => {
  const ut = [];
  let el = null, n = 0;
  while (n++ < 60) {
    el ??= document.querySelector(".kvittering");
    if (el) ut.push(+(+getComputedStyle(el).opacity).toFixed(3));
    await new Promise(requestAnimationFrame);
  }
  return ut;
});
console.log("opasitet med 5 s overgang:", spor.slice(0, 12).join(" "));
console.log("antall prøver:", spor.length, " min:", Math.min(...spor));
await b.close();
