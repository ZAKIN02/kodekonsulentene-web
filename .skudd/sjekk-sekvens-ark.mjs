/**
 * Tar ekte rammer gjennom SjekkSekvens og limer dem til et kontaktark.
 *
 * HVORFOR IKKE BARE VENTE OG SKYTE. Rammer tatt med setTimeout blir aldri de
 * samme to ganger, og en ramme som treffer midt mellom to akter sier ingenting.
 * Her pauses hver animasjon i panelet og `currentTime` settes til et presist
 * tidspunkt, slik at rammene er reproduserbare. Bevegelsen MÅLES separat, i
 * sjekk-sekvens-bevegelse.mjs, der klokka får gå av seg selv.
 *
 * MÅLEFELLER UNNGÅTT:
 *  - Ingen fullPage. fullPage fotograferer scroll-drevne elementer på opasitet 0.
 *  - Ingen boundingBox() + screenshot({clip}). De er ulike koordinatrom.
 *    Her brukes element.screenshot(), som eier begge selv.
 *
 * Bruk: node .skudd/sjekk-sekvens-ark.mjs [url] [tema]
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

const url = process.argv[2] ?? "http://127.0.0.1:4411/sjekk";
const tema = process.argv[3] ?? "dark";

/** Tidspunktene som skiller aktene. Millisekunder fra sekvensstart. */
const RAMMER = [
  [0, "00-foer"],
  [900, "01-skriver"],
  [2200, "02-skrevet"],
  [2450, "03-trykk"],
  [3300, "04-skann-start"],
  [4300, "05-funn-2"],
  [5100, "06-funn-3"],
  [5900, "07-funn-4"],
  [6800, "08-funn-5"],
  [7950, "09-dom-1"],
  [8700, "10-dom-4"],
  [9600, "11-tallet"],
  [10200, "12-skala"],
  [11000, "13-slutt"],
];

const ut = `.skudd/sjs-${tema}`;
rmSync(ut, { recursive: true, force: true });
mkdirSync(ut, { recursive: true });

const b = await chromium.launch();
const side = await b.newPage({
  viewport: { width: 1440, height: 900 },
  colorScheme: tema === "light" ? "light" : "dark",
  deviceScaleFactor: 1,
});
await side.goto(url, { waitUntil: "networkidle", timeout: 60000 });
if (tema === "light") await side.evaluate(() => (document.documentElement.dataset.theme = "light"));
await side.waitForTimeout(600);

const panel = side.locator("[data-sjekk-sekvens] [data-kjor]");
await panel.waitFor({ state: "visible" });

// Hvor i vinduet står panelet ved innlasting? Det avgjør om noen ser bevegelsen
// uten å scrolle i det hele tatt.
const plass = await panel.evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { topp: Math.round(r.top), bunn: Math.round(r.bottom), hoyde: Math.round(r.height), vindu: innerHeight };
});
console.log(
  `  panelet ved innlasting: topp ${plass.topp}px, bunn ${plass.bunn}px, høyde ${plass.hoyde}px, vindu ${plass.vindu}px`,
);
console.log(
  `  synlig uten scroll: ${plass.topp < plass.vindu ? `JA, ${Math.min(plass.bunn, plass.vindu) - Math.max(plass.topp, 0)}px av panelet` : "NEI"}`,
);

const antall = await panel.evaluate((el) => {
  const mine = el.getAnimations({ subtree: true });
  for (const a of mine) a.pause();
  return mine.length;
});
console.log(`  ${antall} animasjoner i panelet`);

const filer = [];
for (const [t, navn] of RAMMER) {
  await panel.evaluate((el, ms) => {
    for (const a of el.getAnimations({ subtree: true })) {
      a.pause();
      a.currentTime = ms;
    }
  }, t);
  await side.waitForTimeout(80);
  const f = `${ut}/${navn}.png`;
  await panel.screenshot({ path: f });
  filer.push(f);
}

// Hele vinduet ved t = 0 og t = 13,5 s, så vi ser sekvensen i sidens sammenheng
// og ikke bare utsnittet av seg selv.
for (const [t, navn] of [
  [600, "vindu-start"],
  [11000, "vindu-slutt"],
]) {
  await panel.evaluate((el, ms) => {
    for (const a of el.getAnimations({ subtree: true })) {
      a.pause();
      a.currentTime = ms;
    }
  }, t);
  await side.waitForTimeout(80);
  await side.screenshot({ path: `${ut}/${navn}.png` });
}

await b.close();

// Kontaktark: fire i bredden, med filnavnet brent inn så en ramme kan plasseres
// i tiden når man ser på arket.
execFileSync("ffmpeg", [
  "-v", "error", "-y",
  "-pattern_type", "glob", "-i", `${ut}/[0-9]*.png`,
  "-vf", "scale=520:-1,drawtext=text='%{n}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7,tile=4x4:margin=6:padding=6",
  `.skudd/ark-sjs-${tema}.png`,
]);
console.log(`  ark: .skudd/ark-sjs-${tema}.png`);
console.log(`  rammer: ${filer.length} i ${ut}/`);
