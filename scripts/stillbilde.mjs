#!/usr/bin/env node
/**
 * Bygger et stillbilde fra ende til annen: redigering ut fra basisbildet,
 * nedskalering til flere bredder, AVIF med WebP-reserve, og en lisensrad.
 *
 *   npm run bilde -- nart          # bygg bildet «nart»
 *   npm run bilde -- --liste
 *   npm run bilde -- nart --behold  # behold mellomfilene i .skudd/
 *
 * Søsteren til scripts/scene.mjs, og med vilje bygget likt: bildene redigeres ut
 * fra SAMME basisbilde som videoscenene, slik at film og stillbilder hører til
 * ett og samme objekt. Et løsrevet AI-bilde ville sett ut som lagerfoto; dette
 * er den samme stabelen stokket om, der arrangementet bærer sidens innhold.
 *
 * Dimensjonene skrives til src/data/bilder.json ETTER at filene er laget, målt
 * med sharp. Komponenten leser derfra, så width/height aldri kan drifte fra
 * virkeligheten – det var nettopp en håndskrevet dimensjon på logoen som ga
 * CLS 0,145 i produksjon og brøt vårt eget ytelsesløfte.
 *
 * SDK-en (@higgsfield/client, MIT) er en UTVIKLINGSAVHENGIGHET og kjører bare
 * her på maskinen, aldri i nettleseren.
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const NOKKEL = process.env.HF_CREDENTIALS
  ?? (process.env.HIGGSFIELD_API_KEY && process.env.HIGGSFIELD_API_SECRET
      ? `${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}`
      : null);

const DEF = JSON.parse(readFileSync("assets/prompter/bilder.json", "utf8"));
const STIL = readFileSync("assets/prompter/stilkort.txt", "utf8").trim();
const args = process.argv.slice(2);

if (args.includes("--liste") || args.length === 0) {
  console.log("Bilder:");
  for (const b of DEF.bilder) console.log(`  ${b.id.padEnd(8)} → ${b.side.padEnd(8)} public/bilder/${b.id}-*.avif`);
  console.log("\nBruk: npm run bilde -- <id> [--behold]");
  process.exit(0);
}

const id = args[0];
const bilde = DEF.bilder.find((b) => b.id === id);
if (!bilde) { console.error(`Fant ingen bilde «${id}». Kjør med --liste.`); process.exit(1); }

if (!NOKKEL) {
  console.error(`Mangler nøkkel. Sett HF_CREDENTIALS="<id>:<secret>", eller
HIGGSFIELD_API_KEY og HIGGSFIELD_API_SECRET.
Nøkkelen lages på https://console.higgsfield.ai og skal aldri committes.`);
  process.exit(1);
}
config({ credentials: NOKKEL });

const CDN = "https://d3u0tzju9qaucj.cloudfront.net/cc1083fc-6d60-417e-b73b-c64ca48db4c7";
const basisUrl = `${CDN}/${DEF.basis}.png`;
const tmp = ".skudd/bilde-tmp";
mkdirSync(tmp, { recursive: true });

// Bredder vi leverer. 1600 dekker en full seksjonsbredde på stor skjerm;
// 800 er nok på mobil med devicePixelRatio 2.
const BREDDER = [2400, 1600, 1200, 800];

const sh = (cmd, a) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "inherit"] });
const kB = (f) => (statSync(f).size / 1024).toFixed(0);

async function rediger() {
  process.stdout.write(`  redigerer … `);
  const r = await higgsfield.subscribe("alibaba/qwen-image-3/edit", {
    input: {
      prompt: `${STIL}\n\nEdit the supplied image. ${DEF._bevar} ${bilde.endring}`,
      image_urls: [basisUrl],
      aspect_ratio: bilde.forhold ?? "16:9",
      // 2k, ikke standardverdien 1k. 1k gir 1280x720, og et bilde som skal fylle
      // en seksjon på stor skjerm blir synlig mykt i kantene på den bredden.
      resolution: "2k",
      negative_prompt: DEF._negativt,
    },
    withPolling: true,
  });
  if (r.status !== "completed") throw new Error(`redigering feilet: ${r.error ?? r.status}`);
  const url = r.images?.[0]?.url;
  if (!url) throw new Error(`fikk ingen bilde-URL tilbake: ${JSON.stringify(r).slice(0, 300)}`);
  console.log("ok");
  return url;
}

console.log(`Bygger bildet «${id}» for ${bilde.side}`);
const url = await rediger();
const raa = join(tmp, `${id}-raa.png`);
sh("curl", ["-sS", "--max-time", "300", "-o", raa, url]);

/**
 * Qwen legger av og til et svakt lilla stikk på metallet. Brandboken forbyr
 * lilla og blå «AI-farger» uttrykkelig, og stikket er for svakt til at øyet
 * fanger det pålitelig – derfor måles det. Over terskelen trekkes blåkanalen
 * ned til nivået med grønn, som er definisjonen på nøytralt grått her.
 */
async function nøytraliser(fil) {
  const st = await sharp(fil).stats();
  const [r, g, b] = st.channels.map((c) => c.mean);
  const stikk = b - g;
  console.log(`  fargestikk B-G: ${stikk.toFixed(2)}`);
  if (stikk <= 1.5) return fil;
  const ut = fil.replace(/\.png$/, "-nøytral.png");
  await sharp(fil).linear([1, 1, g / b], [0, 0, 0]).toFile(ut);
  const e = (await sharp(ut).stats()).channels.map((c) => c.mean);
  console.log(`  nøytralisert → B-G: ${(e[2] - e[1]).toFixed(2)}`);
  return ut;
}
const kilde = await nøytraliser(raa);

const meta = await sharp(kilde).metadata();
console.log(`  mål: ${meta.width}x${meta.height}, ${kB(raa)} kB`);

const ut = "public/bilder";
mkdirSync(ut, { recursive: true });

// Målene leses av sharp ETTER skriving. Ingen håndskrevne tall noe sted.
const varianter = [];
for (const bredde of BREDDER) {
  if (bredde > meta.width) { console.log(`  hopper over ${bredde} – kilden er bare ${meta.width} px bred`); continue; }
  for (const [format, opt] of [["avif", { quality: 52, effort: 6 }], ["webp", { quality: 76 }]]) {
    const fil = join(ut, `${id}-${bredde}.${format}`);
    await sharp(kilde).resize({ width: bredde, kernel: "lanczos3" }).toFormat(format, opt).toFile(fil);
    const m = await sharp(fil).metadata();
    varianter.push({ format, bredde: m.width, hoyde: m.height, fil: `/bilder/${id}-${bredde}.${format}`, kB: Number(kB(fil)) });
    console.log(`  ${fil}  ${m.width}x${m.height}  ${kB(fil)} kB`);
  }
}

// Manifest komponenten leser. Dimensjonene her er MÅLT, ikke antatt.
const manifestSti = "src/data/bilder.json";
const manifest = existsSync(manifestSti) ? JSON.parse(readFileSync(manifestSti, "utf8")) : {};
const storst = varianter.filter((v) => v.format === "avif").sort((a, b) => b.bredde - a.bredde)[0];
manifest[id] = {
  alt: bilde.alt,
  side: bilde.side,
  bredde: storst.bredde,
  hoyde: storst.hoyde,
  avif: varianter.filter((v) => v.format === "avif").map((v) => ({ fil: v.fil, bredde: v.bredde })),
  webp: varianter.filter((v) => v.format === "webp").map((v) => ({ fil: v.fil, bredde: v.bredde })),
};
mkdirSync("src/data", { recursive: true });
writeFileSync(manifestSti, JSON.stringify(manifest, null, 2) + "\n");
console.log(`  manifest oppdatert: ${manifestSti} (${storst.bredde}x${storst.hoyde})`);

// Lisensloggen er beviset vårt. En fil som ikke står der, skal ikke ligge i repoet.
const dato = new Date().toISOString().slice(0, 10);
const lis = "assets/lisenser/bilder.md";
if (!existsSync(lis)) {
  writeFileSync(lis, `# Lisenser – stillbilder

Egen logg for stillbildene, atskilt fra assets/LICENSES.md som dekker film.

| Fil | Kilde | Prompt | Vilkår | Dato | Rettighetshaver |
|---|---|---|---|---|---|

## Merknader

Alle bildene er redigert ut fra det samme basisbildet som videoscenene, slik at
film og stillbilder hører til ett objekt.
`);
}
const rad = `| \`public/bilder/${id}-*.avif\`, \`${id}-*.webp\` | Higgsfield: Qwen Image 3 (redigering), betalt API | assets/prompter/bilder.json, bilde «${id}» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | ${dato} | KodeKonsulentene |\n`;
const s = readFileSync(lis, "utf8");
if (!s.includes(`bilde «${id}»`)) {
  writeFileSync(lis, s.replace("\n## Merknader", rad + "\n## Merknader"));
  console.log(`  loggført i ${lis}`);
}

if (!args.includes("--behold")) rmSync(raa, { force: true });
console.log(`\nFerdig. Se på det: open public/bilder/${id}-1600.avif`);
