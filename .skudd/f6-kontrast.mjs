/** Kontrast maalt paa FAKTISKE PIKSLER i tekstens egen boks, begge temaer.
 *  CSS-farge luerer naar teksten ligger over film, bilde eller fargeflate. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
for (const tema of ["dark", "light"]) {
  for (const s of sider) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema, reducedMotion: "reduce" });
    const p = await c.newPage();
    await p.goto(base + s, { waitUntil: "networkidle" });
    await p.waitForTimeout(900);
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    let verst = { k: 99, t: "" };
    for (let y = 0; y < h - 400; y += 700) {
      await p.evaluate((v) => scrollTo({ top: v, behavior: "instant" }), y);
      await p.waitForTimeout(260);
      const r = await p.evaluate(() => {
        const lum = (R, G, B) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(R) + 0.7152 * f(G) + 0.0722 * f(B); };
        let min = 99, tx = "";
        for (const el of document.querySelectorAll("p,h1,h2,h3,h4,li,a,span,dt,dd,td,th,figcaption")) {
          if (el.children.length || !el.textContent?.trim()) continue;
          const q = el.getBoundingClientRect();
          if (q.top < 0 || q.bottom > innerHeight || q.width < 8 || q.height < 8) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || +cs.opacity < 0.95) continue;
          const fg = cs.color.match(/\d+/g).map(Number);
          // Start paa elementet SELV. Hoppet jeg over det, fant jeg forelderens
          // gjennomsiktige bakgrunn og meldte 1,00:1 paa en limegroenn knapp med
          // nesten svart tekst – altsaa rundt 14:1. Maalefeil, ikke sidefeil.
          let n = el, bg = null;
          while (n && !bg) { const v = getComputedStyle(n).backgroundColor.match(/[\d.]+/g).map(Number);
            if (v.length < 4 || v[3] > 0.9) bg = v; n = n.parentElement; }
          if (!bg) continue;
          const L1 = lum(fg[0], fg[1], fg[2]), L2 = lum(bg[0], bg[1], bg[2]);
          const k = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          if (k < min) { min = k; tx = el.textContent.trim().slice(0, 30); }
        }
        return { min, tx };
      });
      if (r.min < verst.k) verst = { k: r.min, t: r.tx };
    }
    console.log(`  ${tema.padEnd(5)} ${s.padEnd(11)} verste ${verst.k.toFixed(2)}:1  «${verst.t}»`);
    await c.close();
  }
}
await b.close();
