import { chromium } from "@playwright/test";
const b = await chromium.launch();

// Redusert bevegelse
{
  const c = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "dark", reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4455/lab/svg", { waitUntil: "networkidle" });
  await p.evaluate(() => window.scrollTo(0, 100));
  await p.waitForTimeout(300);
  const d = await p.evaluate(() => [...document.querySelectorAll(".flyt__strek, .flyt__ring")]
    .map(e => getComputedStyle(e).strokeDashoffset));
  console.log("redusert bevegelse – alle tegnet:", d.every(v => v === "0px"), `(${[...new Set(d)].join(",")})`);
  await c.close();
}
// Uten JavaScript
{
  const c = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "dark", javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4455/lab/svg", { waitUntil: "domcontentloaded" });
  const n = await p.locator(".flyt__tekst li").count();
  const svg = await p.locator(".flyt__svg path").count();
  console.log("uten JS – listepunkter:", n, "| svg-baner:", svg);
  await c.close();
}
// Mobil: SVG skjules, listen bærer
{
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4455/lab/svg", { waitUntil: "networkidle" });
  const synlig = await p.locator(".flyt__svg").isVisible();
  const n = await p.locator(".flyt__tekst li").count();
  const bredde = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log("mobil – svg synlig:", synlig, "| listepunkter:", n, "| sidebredde:", bredde, "(ingen vannrett overflyt:", bredde <= 390, ")");
  await c.close();
}
await b.close();
