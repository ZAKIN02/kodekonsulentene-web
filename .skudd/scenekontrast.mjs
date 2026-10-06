import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const lum=(r,g,b)=>{const f=(c)=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};
const br = await chromium.launch();
for (const [merke, w, h] of [["desktop",1440,900],["mobil",390,844]]) {
  console.log("--", merke);
  const p = await br.newPage({ viewport: { width: w, height: h }, colorScheme: "dark" });
  await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const n = await p.locator(".scene").count();
  for (let i = 0; i < n; i++) {
    const s = p.locator(".scene").nth(i);
    const har = await s.locator(".scene__ingress, .stortekst").count();
    if (!har) continue;
    const t = s.locator(".scene__ingress, .stortekst").first();
    await t.scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    const navn = (await s.locator(".kk-eyebrow").first().textContent().catch(() => null))?.trim() ?? `scene ${i}`;
    const farge = await t.evaluate((e) => getComputedStyle(e).color);
    const rel = await t.evaluate((e) => {
      const sc = e.closest(".scene"), a = sc.getBoundingClientRect(), c = e.getBoundingClientRect();
      e.style.visibility = "hidden";
      return { x: c.x - a.x, y: c.y - a.y, w: c.width, h: c.height };
    });
    await p.waitForTimeout(150);
    const png = PNG.sync.read(await s.screenshot());
    await t.evaluate((e) => { e.style.visibility = ""; });
    let maks = -1;
    for (let y = Math.max(0, Math.round(rel.y)); y < Math.min(png.height, Math.round(rel.y + rel.h)); y++)
      for (let x = Math.max(0, Math.round(rel.x)); x < Math.min(png.width, Math.round(rel.x + rel.w)); x++) {
        const o = (png.width * y + x) << 2;
        maks = Math.max(maks, lum(png.data[o], png.data[o+1], png.data[o+2]));
      }
    const [r,g,b] = farge.match(/\d+/g).map(Number);
    const Lt = lum(r,g,b);
    const k = (Math.max(Lt,maks)+0.05)/(Math.min(Lt,maks)+0.05);
    console.log("   %s %s:1 %s", navn.padEnd(22), k.toFixed(2), k>=4.5?"OK":"STRYKER");
  }
  await p.close();
}
await br.close();
