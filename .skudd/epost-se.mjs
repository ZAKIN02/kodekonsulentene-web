/**
 * Ser på de bygde malene i ekte nettleser, i tre tilstander:
 *   lys           – slik vi har designet dem
 *   tvungen mørk  – slik Gmail og Outlook kan finne på å vise dem
 *   mobil         – 390 px
 *
 * Logoen peker på produksjons-URL-en, som ikke har filen før vi deployer.
 * Her byttes den til lokal fil, ellers ville vi sett på et tomt bilde og trodd
 * malen var ødelagt.
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rot = resolve(process.cwd());
const b = await chromium.launch();

const maler = [
  ["rapport", "/tmp/epost-rapport.html"],
  ["henvendelse", "/tmp/epost-henvendelse.html"],
];

const tilstander = [
  ["lys", 700, {}],
  ["mobil", 390, {}],
  // Grov etterligning av tvungen invertering: ikke identisk med Gmail, men
  // viser om malen kollapser når klienten snur lysheten.
  ["morkt", 700, { css: "html{filter:invert(1) hue-rotate(180deg);background:#000}img{filter:invert(1) hue-rotate(180deg)}" }],
];

for (const [navn, sti] of maler) {
  // Data-URI BARE her. I selve malen ville det vært feil: Gmail blokkerer
  // data-URI-er i img, så den ekte malen må peke på en https-adresse.
  const logo = readFileSync(`${rot}/public/logo/kk-lockup-dark@2x.png`).toString("base64");
  let html = readFileSync(sti, "utf8")
    .replaceAll("https://kodekonsulentene.no/logo/kk-lockup-dark@2x.png",
                `data:image/png;base64,${logo}`);
  for (const [t, bredde, o] of tilstander) {
    const ctx = await b.newContext({ viewport: { width: bredde, height: 1200 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.setContent(o.css ? html.replace("</head>", `<style>${o.css}</style></head>`) : html,
      { waitUntil: "networkidle" });
    await p.screenshot({ path: `.skudd/epost-${navn}-${t}.png`, fullPage: true });
    const bilder = await p.evaluate(() =>
      [...document.images].map((i) => ({ src: i.currentSrc.slice(-28), ok: i.naturalWidth > 0 })));
    if (t === "lys") console.log(`  ${navn}: bilder ${JSON.stringify(bilder)}`);
    await ctx.close();
  }
}
await b.close();
console.log("  skudd skrevet til .skudd/epost-*.png");
