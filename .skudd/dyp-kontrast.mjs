/** Kontrast på de NYE elementene, mot faktisk malt bakgrunn bak hvert av dem. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  await p.evaluate(async () => { const H = document.body.scrollHeight;
    for (let y = 0; y < H; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
  const r = await p.evaluate(() => {
    const lum = (c) => { const [r,g,b] = c.match(/\d+/g).map(Number).map(v => { v/=255;
      return v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055) ** 2.4; });
      return 0.2126*r + 0.7152*g + 0.0722*b; };
    const bak = (e) => { let n = e; while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; n = n.parentElement; }
      return "rgb(255,255,255)"; };
    const ut = [];
    for (const sel of [".horisont__kort p", ".horisont__kort h3", ".pekerkort p", ".stabel__detalj", ".scene__ingress"]) {
      for (const e of [...document.querySelectorAll(sel)].slice(0, 2)) {
        if (!e.textContent.trim()) continue;
        const f = lum(getComputedStyle(e).color), g = lum(bak(e));
        ut.push({ sel, k: +(((Math.max(f,g)+0.05)/(Math.min(f,g)+0.05))).toFixed(2) });
      }
    }
    return ut;
  });
  const verst = r.length ? Math.min(...r.map(x => x.k)) : null;
  console.log(`  ${s.padEnd(10)} ${r.map(x => x.sel.replace(/[.#]/g,"")+" "+x.k).join(" · ") || "ingen nye elementer"}${verst !== null ? `  → verst ${verst}` : ""}`);
}
await b.close();
