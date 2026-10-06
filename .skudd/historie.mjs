import { chromium } from "@playwright/test";
const ut = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const p = await ctx.newPage();
await p.goto("https://kodekonsulentene.no/historie", { waitUntil: "networkidle", timeout: 45000 });
await p.waitForFunction(() => document.querySelector("[data-story]")?.dataset.klar === "true", { timeout: 20000 });
const bilder = [];
for (const a of [0.1, 0.35, 0.6, 0.85]) {
  await p.evaluate(async (andel) => {
    const el = document.querySelector("[data-story]");
    const topp = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, topp + (el.offsetHeight - window.innerHeight) * andel);
    const v = el.querySelector("video");
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (v && v.seeking) await new Promise((r) => v.addEventListener("seeked", r, { once: true }));
  }, a);
  await p.waitForTimeout(700);
  const f = `${ut}/hist-${Math.round(a*100)}.png`;
  await p.screenshot({ path: f });
  bilder.push(f);
}
await b.close();
console.log(bilder.join("\n"));
