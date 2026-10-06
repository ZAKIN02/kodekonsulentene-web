import { chromium } from "playwright";
const b = await chromium.launch();
for (const s of ["/om","/nettsider","/sikkerhet","/apper-og-ai","/historie"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.625, isMobile: true });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4800" + s, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const ut = [];
    for (const v of document.querySelectorAll("video")) {
      const q = v.getBoundingClientRect();
      const vert = v.closest("[data-scenefilm],[data-demo],[data-story]");
      ut.push({
        tag: vert?.dataset.scenefilm !== undefined ? "SceneFilm"
           : vert?.dataset.demo !== undefined ? "Demo"
           : vert?.dataset.story !== undefined ? "ScrollHistorie" : "?",
        toppPx: Math.round(q.top),
        underFolden: Math.round(q.top - innerHeight),
        src: (v.querySelector("source")?.getAttribute("src") || v.getAttribute("src") || "(ingen src ennaa)").slice(-28),
      });
    }
    return { vh: innerHeight, ut };
  });
  console.log(`  ${s}  (vindu ${r.vh}px, 60% = ${Math.round(r.vh*0.6)}px margin)`);
  for (const v of r.ut) console.log(`     ${v.tag.padEnd(15)} ${String(v.underFolden).padStart(6)}px under folden   src ${v.src}`);
  await ctx.close();
}
await b.close();
