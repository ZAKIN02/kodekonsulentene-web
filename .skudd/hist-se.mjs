import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/historie", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
const info = await p.evaluate(() => {
  const c = document.querySelector(".hist"), t = document.querySelector(".hist__kort .body-lg");
  t.scrollIntoView({ block: "center" });
  const kort = t.closest(".hist__kort");
  const cs = getComputedStyle(kort);
  const ut = {
    aktiv: document.querySelector("[data-story]")?.hasAttribute("data-aktiv"),
    kortBg: cs.backgroundColor, kortOpacity: cs.opacity,
    kortRect: kort.getBoundingClientRect().toJSON(),
    tekstRect: t.getBoundingClientRect().toJSON(),
  };
  kort.style.outline = "3px solid magenta";
  for (const e of c.querySelectorAll("h1,h2,h3,h4,p,a,span,li,button,label,strong,em,small")) e.style.visibility = "hidden";
  return ut;
});
console.log(JSON.stringify(info, null, 1));
await p.waitForTimeout(400);
await p.locator(".hist").screenshot({ path: ".skudd/hist-se.png" });
await b.close();
