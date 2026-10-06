/**
 * Redaksjonell måling: hvor mye medievekt går til materiale som forklarer noe,
 * og hvor mye går til dekorasjon?
 *
 * Skillet er ikke smak. Et EKTE opptak viser produktet i drift og kan ikke
 * kopieres av noen som ikke har bygget det. Et generert motiv av abstrakt
 * materiale påstår ingenting om hva kunden får – det pynter. Begge koster
 * båndbredde; bare det ene gjør en jobb.
 *
 *   node .skudd/redaksjon.mjs            # alle sider
 *   node .skudd/redaksjon.mjs /priser    # én side
 *
 * Leser bygget HTML, ikke kilden, fordi det er filene som faktisk refereres som
 * koster noe. Krever at `npm run build` er kjørt.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROT = "dist/client";

/** Hvilken mappe en fil ligger i avgjør hva den er. */
const KATEGORI = {
  opptak: "ekte",     // skjermopptak av våre egne verktøy i drift
  scener: "generert", // Higgsfield-klipp av abstrakt materiale
  bilder: "generert", // Higgsfield-stillbilder av abstrakt materiale
  historie: "generert",
};

function* sider(dir = ROT) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* sider(p);
    else if (e.name === "index.html") yield p;
  }
}

const valgt = process.argv[2];
const rader = [];

for (const fil of sider()) {
  const rute = fil.slice(ROT.length, -"/index.html".length) || "/";
  if (rute.startsWith("/lab")) continue;           // laben er ikke kundeflate
  if (valgt && rute !== valgt) continue;

  const html = readFileSync(fil, "utf8");
  const treff = new Set(
    [...html.matchAll(/\/(opptak|scener|bilder|historie)\/([A-Za-z0-9_.-]+\.(?:mp4|avif|webp))/g)]
      .map((m) => `${m[1]}/${m[2]}`),
  );

  let ekte = 0, generert = 0;
  const filer = [];
  for (const rel of treff) {
    const p = join("public", rel);
    if (!existsSync(p)) continue;
    const b = statSync(p).size;
    const k = KATEGORI[rel.split("/")[0]] ?? "generert";
    if (k === "ekte") ekte += b; else generert += b;
    filer.push({ rel, b, k });
  }
  if (ekte || generert) rader.push({ rute, ekte, generert, filer });
}

const mb = (b) => (b / 1048576).toFixed(2).padStart(6);
rader.sort((a, b) => b.generert - a.generert);

console.log("  side                        generert     ekte   andel generert");
for (const r of rader) {
  const sum = r.ekte + r.generert;
  const pst = sum ? Math.round((r.generert / sum) * 100) : 0;
  console.log(`  ${r.rute.padEnd(26)} ${mb(r.generert)} MB ${mb(r.ekte)} MB   ${String(pst).padStart(3)} %`);
}

const tg = rader.reduce((s, r) => s + r.generert, 0);
const te = rader.reduce((s, r) => s + r.ekte, 0);
console.log(`\n  SUM${" ".repeat(24)} ${mb(tg)} MB ${mb(te)} MB   ${Math.round((tg / (tg + te)) * 100)} %`);
// `te || 1` ga 9 198 867x da ett utvalg ikke hadde opptak i det hele tatt – et tall
// som ser ut som en måling, men bare er divisjon på én byte.
console.log(
  `\n  ${rader.length} ${rader.length === 1 ? "side" : "sider"} med medier. ` +
    (te === 0
      ? "Ingen ekte opptak i utvalget."
      : `Generert materiale er ${(tg / te).toFixed(1)}x så tungt som ekte opptak.`),
);
