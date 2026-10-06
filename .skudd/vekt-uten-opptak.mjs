/** Måler førstelast MED og UTEN opptaksfilene. Differansen er nøyaktig det en
 *  strammere rootMargin i Demo ville spart, siden video er det eneste som
 *  lastes ivrig. */
import { chromium } from "@playwright/test";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const s of sider) {
  const tall = {};
  for (const modus of ["med", "uten"]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    const p = await ctx.newPage();
    if (modus === "uten") await p.route("**/opptak/*.mp4", (r) => r.abort());
    let byte = 0;
    p.on("response", (r) => { byte += +(r.headers()["content-length"] ?? 0); });
    await p.goto(base + s, { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    tall[modus] = Math.round(byte / 1024);
    await ctx.close();
  }
  console.log(`  ${s.padEnd(28)} med ${String(tall.med).padStart(5)} kB   uten ${String(tall.uten).padStart(4)} kB   (video ${tall.med - tall.uten} kB lastes før scroll)`);
}
await b.close();
