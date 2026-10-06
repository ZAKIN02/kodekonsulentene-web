/** Ingenting skal bli staaende usynlig: uten JS, med redusert bevegelse, og i
 *  Firefox der animation-timeline mangler. Degradering skal gaa mot SYNLIG. */
import { chromium, firefox } from "playwright";
const [base, side] = process.argv.slice(2);
const tell = async (ctx, navn) => {
  const p = await ctx.newPage();
  await p.goto(base + side, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    let usynlig = 0, totalt = 0, tekst = 0;
    for (const el of document.querySelectorAll(".avslor, .mega, .scene__ingress, .kk-urlcheck, .kk-urlcheck-hint")) {
      totalt++;
      const c = getComputedStyle(el);
      if (+c.opacity < 0.05 || c.visibility === "hidden" || c.display === "none") usynlig++;
    }
    for (const el of document.querySelectorAll("h1, .scene__ingress, .kk-urlcheck-hint"))
      if ((el.textContent || "").trim()) tekst++;
    const v = document.querySelector("[data-scenefilm] video");
    return { usynlig, totalt, tekst, videoSrc: v?.currentSrc ? "lastet" : "ikke lastet" };
  });
  console.log(`  ${navn.padEnd(26)} usynlige ${r.usynlig}/${r.totalt}  tekstelementer ${r.tekst}  video ${r.videoSrc}`);
  await p.close();
};
const ch = await chromium.launch();
await tell(await ch.newContext({ viewport: { width: 1512, height: 900 } }), "chromium normalt");
await tell(await ch.newContext({ viewport: { width: 1512, height: 900 }, reducedMotion: "reduce" }), "redusert bevegelse");
await tell(await ch.newContext({ viewport: { width: 1512, height: 900 }, javaScriptEnabled: false }), "uten JavaScript");
await ch.close();
try {
  const ff = await firefox.launch();
  await tell(await ff.newContext({ viewport: { width: 1512, height: 900 } }), "firefox");
  await ff.close();
} catch { console.log("  firefox                    ikke installert, hoppet over"); }
