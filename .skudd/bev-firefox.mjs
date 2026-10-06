import { firefox } from "playwright";
const b = await firefox.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "load" });
await p.waitForTimeout(1800);
console.log("  støtter view():", await p.evaluate(() => CSS.supports("animation-timeline: view()")));
const h = await p.evaluate(() => document.documentElement.scrollHeight);
let verst = 1, hvor = "";
for (let i = 0; i <= 10; i++) {
  await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), Math.round((h - 900) * (i / 10)));
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    let m = 1, t = "";
    for (const el of document.querySelectorAll(".avslor, .pekerkort")) {
      const q = el.getBoundingClientRect();
      if (q.bottom < 60 || q.top > 840) continue;
      const o = +getComputedStyle(el).opacity;
      if (o < m) { m = o; t = (el.textContent || "").trim().slice(0, 24); }
    }
    return { m, t };
  });
  if (r.m < verst) { verst = r.m; hvor = r.t; }
}
console.log(`  laveste opasitet i syn: ${verst.toFixed(2)}${verst < 0.9 ? "  «" + hvor + "»" : ""}`);
await b.close();
