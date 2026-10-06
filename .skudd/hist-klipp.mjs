import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/historie", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
const rel = await p.evaluate(() => {
  const t = document.querySelector(".hist__kort .body-lg");
  t.scrollIntoView({ block: "center" });
  return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const r = t.getBoundingClientRect();
    const kort = t.closest(".hist__kort");
    const kr = kort.getBoundingClientRect();
    for (const e of document.querySelectorAll(".hist h1,.hist h2,.hist h3,.hist p,.hist a,.hist span,.hist li,.hist strong,.hist small"))
      e.style.visibility = "hidden";
    res({ tekst: [r.x, r.y, r.width, r.height], kort: [kr.x, kr.y, kr.width, kr.height],
          kortBg: getComputedStyle(kort).backgroundColor });
  })));
});
console.log(JSON.stringify(rel));
await p.waitForTimeout(300);
await p.screenshot({ path: ".skudd/hist-viewport.png" });
await p.screenshot({ path: ".skudd/hist-omraade.png",
  clip: { x: rel.tekst[0]-30, y: rel.tekst[1]-30, width: rel.tekst[2]+60, height: rel.tekst[3]+60 } });
await b.close();
