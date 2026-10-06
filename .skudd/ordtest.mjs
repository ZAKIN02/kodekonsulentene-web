import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(async () => {
  const t = [...document.querySelectorAll(".stortekst")].find((e) => e.textContent.includes("Prisene"));
  if (!t) return { feil: "fant ikke tittelen" };
  const topp = t.getBoundingClientRect().top + window.scrollY;
  const ut = [];
  for (const d of [0.05, 0.18, 0.35]) {
    window.scrollTo(0, topp - window.innerHeight * (1 - d));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    ut.push({ d, ord: [...t.querySelectorAll(".ord")].map((o) => +(+getComputedStyle(o).opacity).toFixed(2)) });
  }
  return { tekst: t.textContent.trim(), ut };
}), null, 1));
await b.close();
