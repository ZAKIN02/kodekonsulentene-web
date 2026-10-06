import { chromium } from "playwright";
const b = await chromium.launch();
for (const s of process.argv.slice(3)) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(process.argv[2] + s, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => ({
    drag: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    h1: document.querySelectorAll("h1").length,
    bilder: [...document.images].filter((i) => !i.complete || !i.naturalWidth).length,
  }));
  console.log(`  ${s.padEnd(26)} sidelengs:${r.drag}px  h1:${r.h1}  bilder som ikke lastet:${r.bilder}`);
  await p.close();
}
await b.close();
