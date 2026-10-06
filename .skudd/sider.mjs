#!/usr/bin/env node
/**
 * Bygger stillbildene til /status og /handbok.
 *
 *   node .skudd/sider.mjs side-status
 *
 * Samme kjede som scripts/stillbilde.mjs – 2k-oppløsning, måling av fargestikk,
 * AVIF+WebP i flere bredder, dimensjoner målt med sharp etter skriving.
 *
 * Grunnen til at den ligger her og ikke i scripts/: stillbilde.mjs leser en
 * HARDKODET sti (assets/prompter/bilder.json) og eies av en annen agent akkurat
 * nå. Den bør få et --fil-flagg, så faller denne bort.
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const NOKKEL = process.env.HF_CREDENTIALS
  ?? (process.env.HIGGSFIELD_API_KEY && process.env.HIGGSFIELD_API_SECRET
      ? `${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}` : null);
if (!NOKKEL) { console.error("Mangler HF_CREDENTIALS."); process.exit(1); }
config({ credentials: NOKKEL });

const DEF = JSON.parse(readFileSync("assets/prompter/sider.json", "utf8"));
const STIL = readFileSync("assets/prompter/stilkort.txt", "utf8").trim();
const id = process.argv[2];
const bilde = DEF.bilder.find((b) => b.id === id);
if (!bilde) { console.error(`Ukjent id «${id}». Har: ${DEF.bilder.map(b=>b.id).join(", ")}`); process.exit(1); }

const CDN = "https://d3u0tzju9qaucj.cloudfront.net/cc1083fc-6d60-417e-b73b-c64ca48db4c7";
const tmp = ".skudd/bilde-tmp";
mkdirSync(tmp, { recursive: true });
const kB = (f) => (statSync(f).size / 1024).toFixed(0);

console.log(`Bygger «${id}» for ${bilde.side}`);
process.stdout.write("  redigerer … ");
const r = await higgsfield.subscribe("alibaba/qwen-image-3/edit", {
  input: {
    prompt: `${STIL}\n\nEdit the supplied image. ${DEF._bevar} ${bilde.endring}`,
    image_urls: [`${CDN}/${DEF.basis}.png`],
    aspect_ratio: bilde.forhold ?? "16:9",
    resolution: "2k",          // standarden er 1k = 1280x720, nøyaktig det kunden klaget på
    negative_prompt: DEF._negativt,
  },
  withPolling: true,
});
if (r.status !== "completed") { console.error(`feilet: ${r.error ?? r.status}`); process.exit(1); }
const url = r.images?.[0]?.url;
if (!url) { console.error("ingen bilde-URL i svaret"); process.exit(1); }
console.log("ok");

const raa = join(tmp, `${id}-raa.png`);
execFileSync("curl", ["-sS", "--max-time", "300", "-o", raa, url], { stdio: ["ignore","pipe","inherit"] });

// Qwen legger av og til et svakt lilla stikk på metallet. Brandboken forbyr lilla,
// og stikket er for svakt til at øyet fanger det pålitelig – derfor måles det.
const st = await sharp(raa).stats();
const [, g, b] = st.channels.map((c) => c.mean);
console.log(`  fargestikk B-G: ${(b - g).toFixed(2)}`);
let kilde = raa;
if (b - g > 1.5) {
  kilde = raa.replace(/\.png$/, "-noytral.png");
  await sharp(raa).linear([1, 1, g / b], [0, 0, 0]).toFile(kilde);
  const e = (await sharp(kilde).stats()).channels.map((c) => c.mean);
  console.log(`  nøytralisert → B-G: ${(e[2] - e[1]).toFixed(2)}`);
}

const meta = await sharp(kilde).metadata();
console.log(`  mål: ${meta.width}x${meta.height}, ${kB(raa)} kB`);
mkdirSync("public/bilder", { recursive: true });

const varianter = [];
for (const bredde of [2400, 1600, 1200, 800]) {
  if (bredde > meta.width) { console.log(`  hopper over ${bredde} – kilden er ${meta.width} px`); continue; }
  for (const [format, opt] of [["avif", { quality: 52, effort: 6 }], ["webp", { quality: 76 }]]) {
    const fil = join("public/bilder", `${id}-${bredde}.${format}`);
    await sharp(kilde).resize({ width: bredde, kernel: "lanczos3" }).toFormat(format, opt).toFile(fil);
    const m = await sharp(fil).metadata();   // målt, ikke antatt
    varianter.push({ format, bredde: m.width, hoyde: m.height, fil: `/bilder/${id}-${bredde}.${format}` });
    console.log(`  ${fil}  ${m.width}x${m.height}  ${kB(fil)} kB`);
  }
}

const sti = "src/data/bilder.json";
const manifest = existsSync(sti) ? JSON.parse(readFileSync(sti, "utf8")) : {};
const avif = varianter.filter((v) => v.format === "avif");
const storst = [...avif].sort((a, c) => c.bredde - a.bredde)[0];
manifest[id] = {
  alt: bilde.alt, side: bilde.side, bredde: storst.bredde, hoyde: storst.hoyde,
  avif: avif.map((v) => ({ fil: v.fil, bredde: v.bredde })),
  webp: varianter.filter((v) => v.format === "webp").map((v) => ({ fil: v.fil, bredde: v.bredde })),
};
writeFileSync(sti, JSON.stringify(manifest, null, 2) + "\n");
console.log(`  manifest: ${sti} (${storst.bredde}x${storst.hoyde})`);

const lis = "assets/lisenser/sider.md";
if (!existsSync(lis)) writeFileSync(lis, `# Lisenser – stillbilder til /status og /handbok

| Fil | Kilde | Prompt | Vilkår | Dato | Rettighetshaver |
|---|---|---|---|---|---|

## Merknader

Redigert ut fra samme basisbilde som videoscenene, slik at film og stillbilder
hører til ett og samme objekt.
`);
const rad = `| \`public/bilder/${id}-*.avif\`, \`${id}-*.webp\` | Higgsfield: Qwen Image 3 (redigering), betalt API | assets/prompter/sider.json, bilde «${id}» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | ${new Date().toISOString().slice(0,10)} | KodeKonsulentene |\n`;
const s = readFileSync(lis, "utf8");
if (!s.includes(`bilde «${id}»`)) { writeFileSync(lis, s.replace("\n## Merknader", rad + "\n## Merknader")); console.log(`  loggført i ${lis}`); }
console.log(`\nFerdig: open public/bilder/${id}-1600.avif`);
