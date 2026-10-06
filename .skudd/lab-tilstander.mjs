import { chromium } from "@playwright/test";
const b = await chromium.launch();

// 1) Redusert bevegelse: skal bli vertikal liste, ingen festing
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/lab/typo", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  const d = await p.evaluate(() => {
    const h = document.querySelector("[data-horisont]");
    const s = document.querySelector("[data-horisont-spor]");
    const cs = getComputedStyle(s);
    return {
      fest: h.hasAttribute("data-fest"),
      hoyde: h.offsetHeight,
      retning: cs.flexDirection,
      overflowX: cs.overflowX,
      kort: s.children.length,
      tallSynlige: [...document.querySelectorAll("[data-nokkeltall-tell]")].map(e => e.textContent),
    };
  });
  console.log("REDUSERT:", JSON.stringify(d));
  await p.evaluate(() => document.querySelector("[data-horisont]").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(500);
  await p.screenshot({ path: ".skudd/lab-redusert.png" });
  await ctx.close();
}

// 2) Uten JavaScript
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/lab/typo", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(600);
  const d = await p.evaluate ? null : null;
  const megaTekst = await p.locator(".mega").first().innerText();
  const kort = await p.locator(".horisont__kort").count();
  const tall = await p.locator("[data-nokkeltall-tell]").allInnerTexts();
  const festet = await p.locator("[data-horisont][data-fest]").count();
  console.log("UTEN JS:", JSON.stringify({ megaTekst: megaTekst.replace(/\s+/g," "), kort, tall, festet }));
  await ctx.close();
}

// 3) Tastatur: sporet skal kunne fokuseres og pile seg
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/lab/typo", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector("[data-horisont-spor]").focus());
  const foer = await p.evaluate(() => document.querySelector("[data-horisont-spor]").scrollLeft);
  for (let i = 0; i < 12; i++) await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(500);
  const etter = await p.evaluate(() => document.querySelector("[data-horisont-spor]").scrollLeft);
  const fokusert = await p.evaluate(() => document.activeElement?.getAttribute("data-horisont-spor") !== null);
  console.log("TASTATUR:", JSON.stringify({ foer: Math.round(foer), etter: Math.round(etter), flyttet: etter > foer, beholderFokus: fokusert }));
  await ctx.close();
}
await b.close();
