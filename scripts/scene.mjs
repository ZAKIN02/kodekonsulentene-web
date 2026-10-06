#!/usr/bin/env node
/**
 * Bygger en scene fra ende til annen: to låste bilder, ett klipp mellom dem,
 * nedkoding til web, plakat, og oppføring i lisensloggen.
 *
 *   npm run scene -- lag          # bygg scenen «lag»
 *   npm run scene -- lag --kun-bilder
 *   npm run scene -- --liste
 *
 * Hvorfor dette finnes: scenene ble først laget med løse curl-kall, og da er de
 * ikke reproduserbare. Promptene ligger nå i assets/prompter/scener.json, så en
 * scene kan bygges på nytt med samme oppskrift når motivet skal justeres.
 *
 * SDK-en (@higgsfield/client, MIT) er en UTVIKLINGSAVHENGIGHET. Den kjører bare
 * her på maskinen, aldri i nettleseren – den blokkerer selv bruk i nettleser for
 * å hindre at nøkler lekker.
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const NOKKEL = process.env.HF_CREDENTIALS
  ?? (process.env.HIGGSFIELD_API_KEY && process.env.HIGGSFIELD_API_SECRET
      ? `${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}`
      : null);

// --fil velger promptsett, som i stillbilde.mjs. Uten flagget måtte to agenter
// kopiere hele skriptet for å bruke egne filmprompter.
const filFlagg = process.argv.indexOf("--fil");
const PROMPTFIL = filFlagg > -1 ? process.argv[filFlagg + 1] : "assets/prompter/scener.json";
const OMRADE = PROMPTFIL.replace(/.*\//, "").replace(/\.json$/, "");
const DEF = JSON.parse(readFileSync(PROMPTFIL, "utf8"));
const STIL = readFileSync("assets/prompter/stilkort.txt", "utf8").trim();
const args = process.argv.slice(2);

if (args.includes("--liste") || args.length === 0) {
  console.log("Scener:");
  for (const s of DEF.scener) console.log(`  ${s.id.padEnd(12)} → public/${s.mappe}/`);
  console.log("\nBruk: npm run scene -- <id> [--kun-bilder]");
  process.exit(0);
}

const id = args[0];
const scene = DEF.scener.find((s) => s.id === id);
if (!scene) { console.error(`Fant ingen scene «${id}». Kjør med --liste.`); process.exit(1); }

if (!NOKKEL) {
  console.error(`Mangler nøkkel. Sett HF_CREDENTIALS="<id>:<secret>", eller
HIGGSFIELD_API_KEY og HIGGSFIELD_API_SECRET.
Nøkkelen lages på https://console.higgsfield.ai og skal aldri committes.`);
  process.exit(1);
}
const NEGATIV = "text, letters, numbers, logos, watermark, people, hands, faces, glossy plastic, neon glow, purple, blue gradient, blur, bokeh, lens flare, sparkles, hologram, floating screens";

// maxPollTime er 300 000 ms (5 min) som standard i SDK-en, og Kling 3.0 i 4K bruker
// lengre tid enn det. Klienten kastet TimeoutError mens jobben fullførte hos
// leverandøren – vi betalte for klipp vi aldri fikk, og to agenter konkluderte med at
// «renderingen feilet» når den i virkeligheten var ferdig. 30 minutter med 5 sekunders
// mellomrom er romslig nok for 4K uten å henge i det uendelige.
config({
  credentials: NOKKEL,
  maxPollTime: 30 * 60 * 1000,
  pollInterval: 5000,
});

/**
 * Basisbildet er ankeret: begge redigeringene gjøres ut fra DET, slik at kamera,
 * lys og materialer holder seg like mellom start og slutt. En scene oppgir enten
 * `basis` (en ferdig opplastet fil) eller `basisPrompt` (vi lager den her).
 *
 * Et nytt motiv kan ikke gjenbruke et gammelt basisbilde – `_bevar` beskriver
 * objektet som skal stå stille, og det objektet må finnes i bildet.
 */
async function lagBasis(prompt) {
  const hurtig = `.skudd/scene-tmp/${id}-basis.url`;
  if (existsSync(hurtig)) {
    const url = readFileSync(hurtig, "utf8").trim();
    console.log("  basisbilde … gjenbrukt");
    return url;
  }
  process.stdout.write("  basisbilde … ");
  const r = await higgsfield.subscribe("alibaba/qwen-image-3/text-to-image", {
    input: {
      prompt: `${STIL}\n\n${prompt}`,
      aspect_ratio: "16:9",
      // Uten denne leverer Qwen 1280x720 – leverandørens standard, og nøyaktig
      // oppløsningen kunden har klaget på. Hele filmkjeden arver basisbildet, så
      // en manglende linje her senket ALLE scener uansett hva de ble enkodet i.
      // stillbilde.mjs har satt den hele tiden; scene.mjs hadde den aldri.
      resolution: "2k",
      negative_prompt: NEGATIV,
    },
    withPolling: true,
  });
  if (r.status !== "completed") throw new Error(`basisbilde feilet: ${r.error ?? r.status}`);
  const url = r.images?.[0]?.url;
  if (!url) throw new Error("basisbilde: tomt svar");
  mkdirSync(".skudd/scene-tmp", { recursive: true });
  writeFileSync(hurtig, url);
  console.log("ok");
  return url;
}

const CDN = "https://d3u0tzju9qaucj.cloudfront.net/cc1083fc-6d60-417e-b73b-c64ca48db4c7";
const tmp = ".skudd/scene-tmp";
mkdirSync(tmp, { recursive: true });

const sh = (cmd, a) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "inherit"] });

/** Settes før redigeringene kjører. Begge leser den samme. */
let basisUrl = null;

async function rediger(merke, endring, kildeUrl = basisUrl) {
  // Mellomlagres slik at en ny kjøring for å justere enkoding ikke koster en
  // ny bildegenerering. Slett .skudd/scene-tmp/ for å tvinge nye bilder.
  const hurtig = `.skudd/scene-tmp/${id}-${merke}.url`;
  if (existsSync(hurtig)) {
    console.log(`  ${merke} … gjenbrukt`);
    return readFileSync(hurtig, "utf8").trim();
  }
  process.stdout.write(`  ${merke} … `);
  const r = await higgsfield.subscribe("alibaba/qwen-image-3/edit", {
    input: {
      prompt: `${STIL}\n\nEdit the supplied image. ${scene.bevar ?? DEF._bevar} ${endring}`,
      image_urls: [kildeUrl],
      // Også her: uten 2k faller redigeringen tilbake til 1280x720, selv om
      // kildebildet er større.
      resolution: "2k",
      aspect_ratio: "16:9",
      negative_prompt: NEGATIV,
    },
    withPolling: true,
  });
  if (r.status !== "completed") throw new Error(`${merke} feilet: ${r.error ?? r.status}`);
  const url = r.images?.[0]?.url;
  if (!url) throw new Error(`${merke}: tomt svar`);
  writeFileSync(hurtig, url);
  console.log("ok");
  return url;
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

const hent = (url, fil) => { sh("curl", ["-sS", "--max-time", "300", "-o", fil, url]); return fil; };

console.log(`Bygger scenen «${id}»`);
basisUrl = scene.basis ? `${CDN}/${scene.basis}.png` : await lagBasis(scene.basisPrompt);
const startUrl = await rediger("startbilde", scene.start);
/**
 * Sluttbildet redigeres fra STARTBILDET, ikke fra basisbildet.
 *
 * Redigeres begge rammer uavhengig ut fra basis, arver de ikke hverandres
 * arrangement. Scenen «systemer» ga da et startbilde med rundt 40 tynne plater og
 * et sluttbilde med rundt 8 tykke, i tillegg til ulik kameravinkel. Klippet mellom
 * to slike rammer er en morf der objektet forvandler seg til noe annet - nettopp
 * det som far AI-video til a se billig ut.
 *
 * Kjeden gjor at sluttbildet arver platetall, tykkelse og kamera fra startbildet,
 * og at `_bevar` bare trenger a holde pa det som allerede er der.
 */
const sluttUrl = await rediger("sluttbilde", scene.slutt, startUrl);

if (args.includes("--kun-bilder")) {
  console.log(`\nstart: ${startUrl}\nslutt: ${sluttUrl}`);
  process.exit(0);
}

// Finnes masteren fra før, brukes den. Enkoding kan da justeres så mange ganger
// som nødvendig uten å betale for en ny generering. `--ny-film` tvinger ny.
const mastermappe = "assets/mastere";
const master = join(mastermappe, `${id}-master.mp4`);
let raa;
if (existsSync(master) && !args.includes("--ny-film")) {
  console.log("  klipp (4K) … gjenbrukt master");
  raa = master;
} else {
  const videoUrl = await film(startUrl, sluttUrl);
  raa = hent(videoUrl, join(tmp, `${id}-4k.mp4`));
}

// Masteren MÅ overleve. Rørledningen lå i .skudd/scene-tmp/, som ryddes bort, og
// da er eneste vei tilbake å betale Higgsfield på nytt. Et forsøk på å re-enkode
// systemer-1920 fra web-fila ga 1,14 → 1,52 MB uten at det ble skarpere: detaljene
// var allerede kastet. Re-enkoding kan ikke gjenskape det kilden ikke har.
mkdirSync(mastermappe, { recursive: true });
if (raa !== master) sh("cp", [raa, master]);

// Ping-pong gir en naturlig retur når brukeren scroller opp igjen.
let kilde = raa;
if (scene.pingpong) {
  kilde = join(tmp, `${id}-pp.mp4`);
  sh("ffmpeg", ["-v", "error", "-i", raa, "-filter_complex",
    "[0:v]split[f][r];[r]reverse[rv];[f][rv]concat=n=2:v=1:a=0[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-y", kilde]);
}

/**
 * Filnavnet foelger `utnavn` naar det er satt, ellers scene-id.
 *
 * Scenen «lag» leverer til historie-*.mp4 fordi ScrollHistorie.astro refererer
 * de navnene. Uten dette maatte filene kopieres for haand etter hver kjoering,
 * og da er scenen ikke lenger reproduserbar med én kommando.
 */
const utnavn = scene.utnavn ?? id;
const ut = join("public", scene.mappe);
mkdirSync(ut, { recursive: true });

/**
 * CRF for SPOLT video, ikke avspilt video.
 *
 * -crf 24 er et fornuftig valg når klippet spilles av: øyet oppløser ikke detalj
 * i bevegelse. Vår video er scroll-styrt – brukeren stopper på enkeltrammer og
 * ser på dem som stillbilder. Da gjelder stillbildekrav.
 *
 * -g 8 forsterker det. Tette nøkkelbilder er nødvendige for jevn spoling, men de
 * er dyre: på den gamle hero-en spiste 19 nøkkelbilder halvparten av alle dataene,
 * snitt 30,8 kB hver. Et 1920×1080-bilde på 30,8 kB tilsvarer omtrent JPEG
 * kvalitet 45. Det er grunnen til at filmen så billig ut – ikke oppløsningen.
 *
 * Tette nøkkelbilder er ikke forhandlingsbart, så regningen må tas i CRF.
 */
const CRF = { 2560: "20", 1920: "19", 1280: "19" };
const maalt = [];
for (const bredde of scene.bredder) {
  const crf = scene.crf?.[bredde] ?? CRF[bredde] ?? "17";
  const fil = join(ut, `${utnavn}-${bredde}.mp4`);
  sh("ffmpeg", ["-v", "error", "-i", kilde, "-vf", `scale=${bredde}:-2:flags=lanczos,fps=24`,
    "-c:v", "libx264", "-preset", "slow", "-crf", crf,
    "-g", "8", "-keyint_min", "8", "-sc_threshold", "0",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-y", fil]);
  const bytes = Number(execFileSync("stat", ["-f%z", fil]).toString().trim());
  const sek = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1", fil]).toString().trim());
  const mbit = (bytes * 8) / sek / 1e6;
  maalt.push({ bredde, crf, kB: Math.round(bytes / 1024), mbit: mbit.toFixed(2) });
  console.log(`  ${fil}  ${(bytes / 1024).toFixed(0)} kB  ${mbit.toFixed(2)} Mbit/s  (crf ${crf})`);
}
console.log(`  master: ${master}  ${(execFileSync("stat", ["-f%z", master]).toString().trim() / 1024 / 1024).toFixed(1)} MB`);

const plakatPng = join(tmp, `${id}-plakat.png`);
sh("ffmpeg", ["-v", "error", "-i", join(ut, `${id}-${scene.bredder[0]}.mp4`), "-frames:v", "1", "-y", plakatPng]);
const plakat = join(ut, `${utnavn}-poster.avif`);
try {
  sh("npx", ["--yes", "sharp-cli", "-i", plakatPng, "-o", plakat, "-f", "avif", "-q", "55", "resize", String(scene.bredder[0])]);
} catch {
  sh("ffmpeg", ["-v", "error", "-i", plakatPng, "-vf", `scale=${scene.bredder[0]}:-2`,
    "-c:v", "libaom-av1", "-crf", "36", "-still-picture", "1", "-y", plakat]);
}
console.log(`  ${plakat}`);

// Lisensloggen er beviset vårt. En fil som ikke står der, skal ikke ligge i repoet.
const dato = new Date().toISOString().slice(0, 10);
const rad = `| \`public/${scene.mappe}/${utnavn}-*.mp4\`, \`${utnavn}-poster.avif\` | Higgsfield: Qwen Image 3 (redigering) → Kling 3.0 4K (bilde-til-video), betalt API | assets/prompter/scener.json, scene «${id}» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | ${dato} | KodeKonsulentene |\n`;
// Én fil per scene i stedet for én delt logg: flere scener kan bygges samtidig
// uten at to prosesser skriver over hverandre i assets/LICENSES.md.
const lis = join("assets/lisenser", `${id}.md`);
mkdirSync("assets/lisenser", { recursive: true });
writeFileSync(lis, `| Fil | Kilde | Oppskrift | Rettigheter | Dato | Av |\n|---|---|---|---|---|---|\n${rad}`);
console.log(`  loggført i ${lis}`);
console.log(`\nFerdig. Husk å se på resultatet: npm run se -- http://127.0.0.1:4399/ <velger> .skudd/${id}.png 6`);
