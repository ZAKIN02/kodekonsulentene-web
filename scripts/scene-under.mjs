#!/usr/bin/env node
/**
 * Bygger scenene til undersidene /sikkerhet, /nettsider og /priser.
 *
 *   npm run scene-under -- sikkerhet
 *   npm run scene-under -- sikkerhet --kun-bilder
 *   npm run scene-under -- --liste
 *
 * Hvorfor en egen fil og ikke scripts/scene.mjs: den filen eies av en annen
 * oppgave akkurat nå, og to agenter som skriver i samme fil gir en halvferdig
 * fil i neste commit. Oppskriften er den samme; promptene ligger i
 * assets/prompter/under.json, og lisensradene i assets/lisenser/under.md i
 * stedet for i den delte assets/LICENSES.md – av nøyaktig samme grunn.
 *
 * SDK-en (@higgsfield/client, MIT) er en UTVIKLINGSAVHENGIGHET. Den kjører bare
 * her på maskinen, aldri i nettleseren.
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const NOKKEL = process.env.HF_CREDENTIALS
  ?? (process.env.HIGGSFIELD_API_KEY && process.env.HIGGSFIELD_API_SECRET
      ? `${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}`
      : null);

const DEF = JSON.parse(readFileSync("assets/prompter/under.json", "utf8"));
const STIL = readFileSync("assets/prompter/stilkort.txt", "utf8").trim();
const args = process.argv.slice(2);

if (args.includes("--liste") || args.length === 0) {
  console.log("Scener for undersidene:");
  for (const s of DEF.scener) console.log(`  ${s.id.padEnd(12)} → public/${s.mappe}/`);
  console.log("\nBruk: npm run scene-under -- <id> [--kun-bilder]");
  process.exit(0);
}

const id = args[0];
const scene = DEF.scener.find((s) => s.id === id);
if (!scene) { console.error(`Fant ingen scene «${id}». Kjør med --liste.`); process.exit(1); }

if (!NOKKEL) {
  console.error(`Mangler nøkkel. Sett HF_CREDENTIALS="<id>:<secret>", eller
HIGGSFIELD_API_KEY og HIGGSFIELD_API_SECRET. Nøkkelen skal aldri committes.`);
  process.exit(1);
}
// maxPollTime er 5 minutter som standard i SDK-en. Kling 3.0 i 4K bruker lengre
// tid enn det, og da kastes TimeoutError MENS jobben fortsatt kjører hos
// leverandøren – man har betalt for et klipp man ikke får lastet ned.
// Målt 6. oktober 2026: «sikkerhet» kom innenfor, «nettsider» gjorde det ikke.
config({ credentials: NOKKEL, maxPollTime: 25 * 60 * 1000, pollInterval: 5000 });

const CDN = "https://d3u0tzju9qaucj.cloudfront.net/cc1083fc-6d60-417e-b73b-c64ca48db4c7";
const basisUrl = `${CDN}/${scene.basis}.png`;
const tmp = ".skudd/scene-tmp";
mkdirSync(tmp, { recursive: true });

const sh = (cmd, a) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "inherit"] });
const kB = (f) => (statSync(f).size / 1024).toFixed(0);

async function rediger(merke, endring) {
  process.stdout.write(`  ${merke} … `);
  const r = await higgsfield.subscribe("alibaba/qwen-image-3/edit", {
    input: {
      prompt: `${STIL}\n\nEdit the supplied image. ${DEF._bevar} ${endring}`,
      image_urls: [basisUrl],
      aspect_ratio: "16:9",
      negative_prompt: "text, letters, logos, watermark, people, hands, glossy plastic, neon glow, purple, blue gradient, blur",
    },
    withPolling: true,
  });
  if (r.status !== "completed") throw new Error(`${merke} feilet: ${r.error ?? r.status}`);
  console.log("ok");
  return r.images?.[0]?.url;
}

async function film(start, slutt) {
  process.stdout.write("  klipp (4K) … ");
  const r = await higgsfield.subscribe("kling-video/v3.0/4k/image-to-video", {
    input: {
      prompt: `${DEF._bevegelse}\n\n${scene.bevegelse}`,
      image_url: start,
      last_image_url: slutt,
      duration: 8,
      sound: "off",
      cfg_scale: 0.5,
    },
    withPolling: true,
  });
  if (r.status !== "completed") throw new Error(`klipp feilet: ${r.error ?? r.status}`);
  console.log("ok");
  return r.video?.url;
}

const hent = (url, fil) => { sh("curl", ["-sS", "--max-time", "600", "-o", fil, url]); return fil; };

console.log(`Bygger scenen «${id}»`);
const startUrl = await rediger("startbilde", scene.start);
const sluttUrl = await rediger("sluttbilde", scene.slutt);

if (args.includes("--kun-bilder")) {
  console.log(`\nstart: ${startUrl}\nslutt: ${sluttUrl}`);
  process.exit(0);
}

const videoUrl = await film(startUrl, sluttUrl);
// Masteren lagres UTENFOR .skudd/. Den mappen er en skrapemappe som ryddes, og
// uten masteren er eneste vei til høyere kvalitet å betale for ny generering.
// Å re-enkode en ferdig web-fil på lavere crf hjelper ikke – detaljene er alt
// kastet (målt: 1,14 -> 1,52 MB uten synlig gevinst).
mkdirSync("assets/mastere", { recursive: true });
const raa = hent(videoUrl, join("assets/mastere", `${id}-master.mp4`));
console.log(`  master: ${raa}  ${kB(raa)} kB  (ikke slett denne)`);

// Ping-pong gir en naturlig retur når brukeren scroller opp igjen.
let kilde = raa;
if (scene.pingpong) {
  kilde = join(tmp, `${id}-pp.mp4`);
  sh("ffmpeg", ["-v", "error", "-i", raa, "-filter_complex",
    "[0:v]split[f][r];[r]reverse[rv];[f][rv]concat=n=2:v=1:a=0[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-y", kilde]);
}

const ut = join("public", scene.mappe);
mkdirSync(ut, { recursive: true });
for (const bredde of scene.bredder) {
  // crf 24 (som scene.mjs bruker) er riktig for video som SPILLES AV, fordi øyet
  // ikke oppløser detalj i bevegelse. Vår video spoles av scroll: brukeren stopper
  // på enkeltrammer og ser på dem som stillbilder, og da gjelder stillbildekrav.
  // Målt på dagens filer ga crf 24 bare 1,6–3,1 Mbit/s, og med -g 8 spiser 19
  // nøkkelbilder halve datamengden – snitt 30,8 kB per stykk, omtrent JPEG 45.
  // Det er hele grunnen til at filmen ser billig ut.
  const crf = bredde >= 2560 ? "18" : "16";
  const fil = join(ut, `${id}-${bredde}.mp4`);
  // -g 8 er det som gjør klippet spolbart med scroll. Uten tette nøkkelbilder
  // hakker spolingen, og serveren må i tillegg svare på HTTP Range.
  sh("ffmpeg", ["-v", "error", "-i", kilde, "-vf", `scale=${bredde}:-2:flags=lanczos,fps=24`,
    "-c:v", "libx264", "-preset", "slow", "-crf", crf,
    "-g", "8", "-keyint_min", "8", "-sc_threshold", "0",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-y", fil]);
  console.log(`  ${fil}  ${kB(fil)} kB`);
}

const plakatPng = join(tmp, `${id}-plakat.png`);
sh("ffmpeg", ["-v", "error", "-i", join(ut, `${id}-${scene.bredder[0]}.mp4`), "-frames:v", "1", "-y", plakatPng]);
const plakat = join(ut, `${id}-poster.avif`);
try {
  sh("npx", ["--yes", "sharp-cli", "-i", plakatPng, "-o", plakat, "-f", "avif", "-q", "55", "--width", "1920"]);
} catch {
  sh("ffmpeg", ["-v", "error", "-i", plakatPng, "-vf", "scale=1920:-2",
    "-c:v", "libaom-av1", "-crf", "36", "-still-picture", "1", "-y", plakat]);
}
console.log(`  ${plakat}  ${kB(plakat)} kB`);

// Lisensloggen er beviset vårt. En fil som ikke står der, skal ikke ligge i repoet.
const dato = new Date().toISOString().slice(0, 10);
const lis = "assets/lisenser/under.md";
mkdirSync("assets/lisenser", { recursive: true });
if (!existsSync(lis)) {
  writeFileSync(lis, `# Lisenser – scener på undersidene

Raden legges til av \`scripts/scene-under.mjs\`. Slås sammen i \`assets/LICENSES.md\`.

| Fil | Opphav | Oppskrift | Rettighet | Dato | Av |
| --- | --- | --- | --- | --- | --- |
`);
}
const rad = `| \`public/${scene.mappe}/${id}-*.mp4\`, \`${id}-poster.avif\` | Higgsfield: Qwen Image 3 (redigering) → Kling 3.0 4K (bilde-til-video), betalt API | assets/prompter/under.json, scene «${id}» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | ${dato} | KodeKonsulentene |\n`;
const s = readFileSync(lis, "utf8");
if (!s.includes(`scene «${id}»`)) { writeFileSync(lis, s + rad); console.log(`  loggført i ${lis}`); }

console.log(`\nFerdig. Se på resultatet før du tror på det.`);
