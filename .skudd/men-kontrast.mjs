/** MEN-KONTRAST: måler på EKTE MALTE PIKSLER, ikke på getComputedStyle.
 *
 *  Grunnen er en felle vi har gått i før: en gjennomsiktig bakgrunn leses som
 *  `rgba(0,0,0,0)` og regnes som SVART, og da rapporteres falske brudd på tekst
 *  som i virkeligheten står på en lys flate. Her tas et skjermbilde og fargene
 *  leses ut av bildet, slik en bruker ser dem.
 *
 *  Måler to ting:
 *    – målestreken i Nokkeltall og linjene i `spor` mot flaten rundt (grafikk,
 *      WCAG 1.4.11 krever 3:1)
 *    – teksten i `rekke`-leddene mot flaten (WCAG 1.4.3 krever 4,5:1)
 *
 *  Begge temaer. Bruk: node .skudd/men-kontrast.mjs <base>
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";

const base = process.argv[2] || "http://localhost:4877";
const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const kon = (a, b) => { const [h, l] = a > b ? [a, b] : [b, a]; return (h + 0.05) / (l + 0.05); };

const MAAL = [
  ["/", ".nokkeltall__post:nth-child(2) .nokkeltall__spor", "målestrek, nøytral", 3],
  ["/", ".nokkeltall__post--aksent .nokkeltall__spor", "målestrek, aksent", 3],
  ["/", ".nokkeltall__post:nth-child(2) .nokkeltall__merke", "nøkkeltall-etikett (tekst)", 4.5],
  ["/lab/mening", ".avslor--spor::after", "spor, punktet", 3],
  ["/lab/mening", ".avslor--spor::before", "spor, veien", 3],
  ["/lab/mening", ".ledd", "rekke-ledd (tekst)", 4.5],
];

const b = await chromium.launch();
for (const tema of ["dark", "light"]) {
  console.log(`\n  tema=${tema === "dark" ? "mørkt (standard)" : "lyst"}`);
  const p = await b.newPage({ viewport: { width: 1280, height: 1100 }, colorScheme: tema });
  for (const [sti, sel, merke, krav] of MAAL) {
    await p.goto(base + sti, { waitUntil: "load", timeout: 60000 });
    // Vent til ALL bevegelse er over: en måling midt i en inntoning gir en
    // blandingsfarge, og det var nettopp det som dro Lighthouse fra 100 til 97.
    await p.waitForTimeout(3000);
    const rent = sel.replace(/::(before|after)$/, "");
    const pseudo = sel.endsWith("::after") ? "::after" : sel.endsWith("::before") ? "::before" : null;
    const g = await p.evaluate(({ rent, pseudo }) => {
      const el = document.querySelector(rent);
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      if (!pseudo) return { x: r.x, y: r.y, w: r.width, h: r.height };
      const c = getComputedStyle(el, pseudo);
      // Pseudoelementene her er absolutt plassert inne i elementet.
      const dx = parseFloat(c.insetInlineStart) || 0, dy = parseFloat(c.insetBlockStart) || 0;
      const w = parseFloat(c.inlineSize) || parseFloat(c.width) || 1;
      const h = parseFloat(c.blockSize) || parseFloat(c.height) || 20;
      return { x: r.x + dx, y: r.y + dy, w, h };
    }, { rent, pseudo });
    if (!g) { console.log(`    ${merke.padEnd(28)} fantes ikke`); continue; }
    await p.waitForTimeout(400);
    const g2 = await p.evaluate((rent) => {
      const r = document.querySelector(rent).getBoundingClientRect();
      return { y: r.y };
    }, rent);
    const dy = g2.y - g.y;
    // Ta et utsnitt som omslutter målet MED litt flate rundt, så bakgrunnen er med.
    const pad = 14;
    const klipp = { x: Math.max(0, Math.round(g.x - pad)), y: Math.max(0, Math.round(g.y + dy - pad)),
                    width: Math.round(g.w + pad * 2), height: Math.round(g.h + pad * 2) };
    const erTekst = krav >= 4.5;
    const png = PNG.sync.read(await p.screenshot({ clip: klipp }));
    // Flaten = den hyppigste fargen. Målet = den fargen som ligger lengst fra den
    // i luminans, men vi hopper over den ytterste prosenten for å unngå kantutjevning.
    const tell = new Map();
    const lumer = [];
    for (let i = 0; i < png.data.length; i += 4) {
      const k = `${png.data[i]},${png.data[i+1]},${png.data[i+2]}`;
      tell.set(k, (tell.get(k) || 0) + 1);
      lumer.push(lum(png.data[i], png.data[i+1], png.data[i+2]));
    }
    const flateK = [...tell.entries()].sort((a, c) => c[1] - a[1])[0][0].split(",").map(Number);
    const flateL = lum(...flateK);
    let maalL;
    if (erTekst) {
      /* TEKST MÅLES MED FARGEN FRA getComputedStyle, IKKE FRA BILDET.
         Glyffer dekker noen få prosent av utsnittet, og kantutjevningen gjør at
         både 1- og 99-persentilen havner nær flaten: en tidlig versjon av denne
         fila rapporterte 1,28:1 på tekst som faktisk måler over 15:1. Fellen med
         computed style gjelder BAKGRUNNEN – `rgba(0,0,0,0)` lest som svart – og
         den siden hentes fortsatt fra de malte pikslene. */
      const c = (await p.evaluate((s) => getComputedStyle(document.querySelector(s)).color, rent))
        .match(/[\d.]+/g).map(Number);
      maalL = lum(c[0], c[1], c[2]);
    } else {
      lumer.sort((a, c) => a - c);
      const p1 = lumer[Math.floor(lumer.length * 0.01)], p99 = lumer[Math.floor(lumer.length * 0.99)];
      maalL = Math.abs(p1 - flateL) > Math.abs(p99 - flateL) ? p1 : p99;
    }
    const k = kon(flateL, maalL);
    console.log(`    ${merke.padEnd(28)} ${k.toFixed(2)}:1   krav ${krav}:1   ${k >= krav ? "OK" : "← UNDER"}  (flate rgb ${flateK.join(",")})`);
  }
  await p.close();
}
await b.close();
