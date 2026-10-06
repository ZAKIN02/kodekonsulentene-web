import { chromium } from "playwright";
const url = process.argv[2];
const b = await chromium.launch();
for (const [tema, bredde] of [["dark", 1440], ["light", 1440], ["dark", 390]]) {
  const p = await b.newPage({ viewport: { width: bredde, height: 900 }, colorScheme: tema });
  await p.goto(url, { waitUntil: "networkidle" });
  const f = await p.$("[data-scenefilm]");
  if (f) { await f.scrollIntoViewIfNeeded(); await p.waitForTimeout(700); }
  const r = await p.evaluate(() => ({
    drag: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    h1: document.querySelectorAll("h1").length,
    video: !!document.querySelector("[data-scenefilm] video"),
    opasitet: getComputedStyle(document.querySelector("[data-scenefilm]") ?? document.body).opacity,
  }));
  console.log(`  ${tema.padEnd(5)} ${bredde}px  sidelengs drag ${r.drag}px  h1=${r.h1}  film=${r.video}  opasitet=${r.opasitet}`);
  await p.close();
}
await b.close();
