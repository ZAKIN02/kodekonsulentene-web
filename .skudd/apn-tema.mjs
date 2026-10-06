import { chromium } from "playwright";
const b = await chromium.launch();
for (const cs of ["dark", "light"]) {
  const c = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: cs });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4861/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    tema: document.documentElement.dataset.theme || "(usatt = mørk)",
    bg: getComputedStyle(document.body).backgroundColor,
    flate: getComputedStyle(document.querySelector("[data-apning-flate]")).backgroundColor,
  }));
  console.log(`  prefers:${cs.padEnd(5)} tema:${r.tema.padEnd(16)} side-bg:${r.bg.padEnd(20)} apning-bg:${r.flate}`);
  await c.close();
}
await b.close();
