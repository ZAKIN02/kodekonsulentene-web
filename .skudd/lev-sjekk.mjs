import { chromium } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
for (const [navn, opts] of [["redusert", { reducedMotion: "reduce" }], ["uten JS", { javaScriptEnabled: false }]]) {
  for (const s of ["/om", "/caser", "/status"]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
    const p = await ctx.newPage();
    await p.goto(base + s, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const f = document.querySelector(".demo");
      if (!f) return { feil: "ingen .demo" };
      const v = f.querySelector("video");
      const cap = f.querySelector("figcaption");
      return {
        plakat: !!v?.getAttribute("poster"),
        kildeSatt: !!v?.querySelector("source")?.getAttribute("src"),
        bildetekst: (cap?.textContent || "").trim().slice(0, 28),
        synlig: getComputedStyle(f).display !== "none",
      };
    });
    console.log(`  ${navn.padEnd(9)} ${s.padEnd(8)} ${JSON.stringify(r)}`);
    await ctx.close();
  }
}
await b.close();
