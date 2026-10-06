import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1280, height: 800 } });
const p = await c.newPage();
await p.goto("http://127.0.0.1:4861/", { waitUntil: "domcontentloaded" });
for (const t of [400, 1600, 2500]) {
  await p.waitForTimeout(t === 400 ? 400 : t === 1600 ? 1200 : 900);
  const r = await p.evaluate(() => {
    const e = document.querySelector("[data-apning-flate]");
    const cs = getComputedStyle(e);
    const under = document.elementFromPoint(400, 400);
    return { vis: cs.visibility, op: cs.opacity, treff: under ? (under.tagName + "." + String(under.className).split(" ")[0]).slice(0, 36) : "?" };
  });
  console.log(`  ${String(t).padStart(4)} ms: visibility:${r.vis.padEnd(8)} opacity:${r.op.padEnd(6)} under pekeren: ${r.treff}`);
}
// kan man faktisk klikke en lenke etterpaa?
const klikkbar = await p.locator('a[href="/priser"]').first().isEnabled().catch(() => false);
console.log("  lenke klikkbar etterpaa:", klikkbar);
await b.close();
