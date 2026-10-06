/** Leser maskens FAKTISKE beregnede verdi. Overstyringen på /systemer var død CSS
 *  i flere uker uten at noen merket det – 46 % og 92 % ga identisk resultat. */
import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
console.log(await p.evaluate(() => {
  const el = document.querySelector("[data-scenefilm]");
  if (!el) return "ingen scenefilm på siden";
  const s = getComputedStyle(el);
  return { variabel: s.getPropertyValue("--maske").trim(), maske: (s.maskImage || s.webkitMaskImage).slice(0, 110) };
}));
await b.close();
