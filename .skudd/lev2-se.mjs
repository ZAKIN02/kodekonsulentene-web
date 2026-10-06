/**
 * Ser på en SceneFilm-seksjon slik den FAKTISK males, og måler to ting:
 *  1) hvor motivets blekk ligger i forhold til maskens kant
 *  2) kontrasten mellom seksjonens tekst og flaten rett bak hver bokstav
 *
 * Hvorfor måles blekk og ikke bare kontrast: masken kan gjøre motivet usynlig
 * uten at kontrasten endrer seg i det hele tatt. Da ser tallene fine ut mens
 * halve bildet er borte – som på /apper-og-ai, der stabelen lå i den maskerte
 * halvdelen og kunden bare så en kabel kuttet av bildekanten.
 */
import { chromium } from "playwright";

const [url, ut, breddeArg] = process.argv.slice(2);
const bredde = Number(breddeArg ?? 1440);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });

const film = await p.$("[data-scenefilm]");
if (!film) { console.log("ingen SceneFilm på siden"); await b.close(); process.exit(0); }
await film.scrollIntoViewIfNeeded();
// Spol til slutten av klippet, der motivet er ferdig avslørt.
await p.evaluate(() => {
  const v = document.querySelector("[data-scenefilm] video");
  if (v && v.duration) v.currentTime = v.duration * 0.92;
});
await p.waitForTimeout(1200);

const boks = await film.boundingBox();
await p.screenshot({ path: ut, clip: boks });

const maske = await p.evaluate(() =>
  parseFloat(getComputedStyle(document.querySelector("[data-scenefilm]")).getPropertyValue("--maske")) || 0);

// Kontrast: hvert tekstelement i seksjonen mot flaten rett bak bokstavene.
const kontrast = await p.evaluate(() => {
  const lum = (r, g, bl) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const bak = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const m = c.match(/[\d.]+/g);
      if (m && (m.length < 4 || +m[3] > 0.5)) return [+m[0], +m[1], +m[2]];
      n = n.parentElement;
    }
    return [11, 13, 16];
  };
  const seksjon = document.querySelector("[data-scenefilm]")?.closest("section, div")?.parentElement ?? document.body;
  let verst = { forhold: 99, tekst: "" };
  for (const el of seksjon.querySelectorAll("p, h1, h2, h3, li, a, span")) {
    const t = el.textContent?.trim();
    if (!t || el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const cs = getComputedStyle(el);
    const fg = cs.color.match(/[\d.]+/g).map(Number);
    const bg = bak(el);
    const l1 = lum(...fg.slice(0, 3)), l2 = lum(...bg);
    const forhold = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    if (forhold < verst.forhold) verst = { forhold: +forhold.toFixed(2), tekst: t.slice(0, 44) };
  }
  return verst;
});

console.log(`  maske slipper fram fra ${maske}%`);
console.log(`  svakeste tekst: ${kontrast.forhold}:1  «${kontrast.tekst}»`);
console.log(`  skjermbilde: ${ut}`);
await b.close();
