/**
 * Maaler hva et nettsted FAKTISK gjoer visuelt, i den gjengitte DOM-en.
 *
 * Forskjell fra .skudd/les-referanse.mjs: denne SCROLLER gjennom hele siden foerst,
 * saa lat-lastet innhold telles med. Den foerste maalingen saa bare foerste skjerm,
 * og underdrev derfor nettsteder som laster mens du scroller.
 *
 * Forskjell fra .skudd/maal-rytme.mjs (docs/dramaturgi.md): den talte deklarasjoner i
 * STILARKET. Den teller regler som kanskje aldri brukes, og alle brekkpunkter. Denne
 * teller det som faktisk males paa skjermen.
 */
import { chromium } from "playwright";

const url = process.argv[2];
const navn = process.argv[3] ?? url;

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();

try {
  await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await p.waitForTimeout(2000);

  // Scroll gjennom hele siden saa lat-lastet innhold kommer med.
  await p.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(1500);

  const m = await p.evaluate(() => {
    const hex = (s) => {
      const n = s.match(/\d+(\.\d+)?/g);
      return n && n.length >= 3 ? [+n[0], +n[1], +n[2], n[3] !== undefined ? +n[3] : 1] : null;
    };
    // Metning og lyshet i HSL, fra 0-255 RGB.
    const hsl = ([r, g, bb]) => {
      r /= 255; g /= 255; bb /= 255;
      const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb), l = (mx + mn) / 2;
      if (mx === mn) return { s: 0, l };
      const d = mx - mn;
      return { s: l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn), l };
    };

    const skrift = new Set(), animer = new Set();
    const bakgrunn = new Map();          // farge -> samlet areal
    let video = 0, storeBilder = 0, bildeAreal = 0, transform = 0;
    let fargetAreal = 0, noytraltAreal = 0, storsteFlate = 0;
    const sideAreal = document.documentElement.scrollWidth * document.documentElement.scrollHeight;

    for (const el of document.querySelectorAll("*")) {
      const c = getComputedStyle(el);
      if (c.display === "none" || c.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      const areal = r.width * r.height;

      skrift.add(c.fontSize);
      if (c.animationName && c.animationName !== "none") animer.add(c.animationName);
      if (c.transform && c.transform !== "none") transform++;
      if (el.tagName === "VIDEO") video++;
      if (el.tagName === "IMG" || el.tagName === "PICTURE") {
        if (r.width > 150) storeBilder++;
        bildeAreal += areal;
      }

      // Store flater: hva slags farge daekker siden?
      if (areal > 20000) {
        const bg = hex(c.backgroundColor);
        if (bg && bg[3] > 0.5) {
          const { s, l } = hsl(bg);
          const noekkel = c.backgroundColor;
          bakgrunn.set(noekkel, (bakgrunn.get(noekkel) ?? 0) + areal);
          if (s > 0.25 && l > 0.08 && l < 0.92) fargetAreal += areal;
          else noytraltAreal += areal;
          if (areal > storsteFlate) storsteFlate = areal;
        }
        // Bildebakgrunner teller som farget flate - det er ofte der metningen ligger.
        if (c.backgroundImage && c.backgroundImage !== "none" && !/^url\(["']?data:image\/svg/.test(c.backgroundImage)) {
          fargetAreal += areal * 0.5;
        }
      }
    }

    // Distinkte seksjonsbakgrunner: farger som daekker en betydelig flate.
    const terskel = 1440 * 300;
    const seksjonsfarger = [...bakgrunn.entries()]
      .filter(([, a]) => a > terskel)
      .sort((a, b2) => b2[1] - a[1]);

    // Metning paa den dominerende flaten.
    const dom = seksjonsfarger[0];
    const domHsl = dom ? hsl(hex(dom[0])) : { s: 0, l: 0 };

    return {
      unikeSkriftstorrelser: skrift.size,
      animasjoner: animer.size,
      transformerte: transform,
      video,
      storeBilder,
      bildeandel: +(bildeAreal / sideAreal * 100).toFixed(1),
      distinkteSeksjonsfarger: seksjonsfarger.length,
      seksjonsfarger: seksjonsfarger.slice(0, 5).map(([f, a]) => `${f} (${Math.round(a / 1e6)}M px2)`),
      dominerendeMetning: +(domHsl.s * 100).toFixed(0),
      dominerendeLyshet: +(domHsl.l * 100).toFixed(0),
      fargetFlateandel: +(fargetAreal / (fargetAreal + noytraltAreal || 1) * 100).toFixed(1),
      storsteFlateSkjermer: +(storsteFlate / (1440 * 900)).toFixed(1),
      hoydeSkjermer: +(document.documentElement.scrollHeight / 900).toFixed(1),
      domNoder: document.querySelectorAll("*").length,
    };
  });

  console.log(JSON.stringify({ navn, ...m }));
} catch (e) {
  console.log(JSON.stringify({ navn, feil: String(e).slice(0, 120) }));
}
await b.close();
