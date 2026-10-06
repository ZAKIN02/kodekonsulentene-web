import { chromium } from "playwright";
const b = await chromium.launch();
for (const s of ["/bransjer/handverkere", "/bransjer/klinikker"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://127.0.0.1:4461" + s, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const m = document.querySelector(".mega");
    return {
      megaPx: Math.round(parseFloat(getComputedStyle(m).fontSize)),
      seksjoner: document.querySelectorAll("section.scene").length,
      horisont: document.querySelectorAll("[data-horisont], .horisont").length,
      pekerkort: document.querySelectorAll("[data-pekerkort], .pekerkort").length,
      film: document.querySelectorAll("video").length,
      stillbilder: document.querySelectorAll("figure.stillbilde").length,
      hoyde: document.documentElement.scrollHeight,
    };
  });
  console.log(`  ${s.padEnd(24)} mega:${r.megaPx}px  scener:${r.seksjoner}  film:${r.film}  stillbilde:${r.stillbilder}  horisont:${r.horisont}  pekerkort:${r.pekerkort}  høyde:${r.hoyde}`);
  await p.close();
}
await b.close();
