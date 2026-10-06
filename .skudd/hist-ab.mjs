import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/historie", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
const d1 = await p.evaluate(() => {
  const t = document.querySelector(".hist__kort .body-lg");
  t.scrollIntoView({ block: "center" });
  const k = t.closest(".hist__kort");
  const cs = getComputedStyle(k);
  return { bg: cs.backgroundColor, op: cs.opacity, rect: k.getBoundingClientRect().toJSON(), scrollY: window.scrollY };
});
await p.waitForTimeout(500);
await p.screenshot({ path: ".skudd/ab-med-tekst.png" });
const d2 = await p.evaluate(() => {
  for (const e of document.querySelectorAll(".hist h1,.hist h2,.hist h3,.hist p,.hist a,.hist span,.hist li,.hist strong,.hist small"))
    e.style.visibility = "hidden";
  const k = document.querySelector(".hist__kort");
  const cs = getComputedStyle(k);
  return { bg: cs.backgroundColor, op: cs.opacity, rect: k.getBoundingClientRect().toJSON(), scrollY: window.scrollY };
});
await p.waitForTimeout(500);
await p.screenshot({ path: ".skudd/ab-uten-tekst.png" });
console.log("MED  tekst:", JSON.stringify(d1));
console.log("UTEN tekst:", JSON.stringify(d2));
await b.close();
