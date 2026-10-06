import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(600);
console.log("CSS view() støttet:", await p.evaluate(() => CSS.supports("animation-timeline: view()")));
const r = await p.evaluate(async () => {
  const kort = [...document.querySelectorAll(".kk-price")].map((e) => e.closest(".avslor")).filter(Boolean);
  if (!kort.length) return { feil: "fant ingen .avslor rundt prisekort" };
  const mål = kort[0];
  const topp = mål.getBoundingClientRect().top + window.scrollY;
  const prov = [];
  // Scroll slik at elementet så vidt kommer inn nederst, og så gradvis opp.
  for (const d of [0, 0.15, 0.3, 0.5, 0.8]) {
    window.scrollTo(0, topp - window.innerHeight * (1 - d));
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    const s = getComputedStyle(mål);
    prov.push({ d, opacity: +s.opacity, transform: s.transform });
  }
  return { prov };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
