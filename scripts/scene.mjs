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

const DEF = JSON.parse(readFileSync("assets/prompter/scener.json", "utf8"));
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
config({ credentials: NOKKEL });

const CDN = "https://d3u0tzju9qaucj.cloudfront.net/cc1083fc-6d60-417e-b73b-c64ca48db4c7";
const basisUrl = `${CDN}/${scene.basis}.png`;
const tmp = ".skudd/scene-tmp";
mkdirSync(tmp, { recursive: true });

const sh = (cmd, a) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "inherit"] });

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
  const url = r.images?.[0]?.url;
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
const startUrl = await rediger("startbilde", scene.start);
const sluttUrl = await rediger("sluttbilde", scene.slutt);

if (args.includes("--kun-bilder")) {
  console.log(`\nstart: ${startUrl}\nslutt: ${sluttUrl}`);
  process.exit(0);
}

const videoUrl = await film(startUrl, sluttUrl);
const raa = hent(videoUrl, join(tmp, `${id}-4k.mp4`));

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
  const crf = bredde >= 1920 ? "24" : "25";
  const fil = join(ut, `${id}-${bredde}.mp4`);
  // -g 8 er det som gjør klippet spolbart med scroll. Uten tette keyframes
  // hakker spolingen, og serveren må i tillegg støtte HTTP Range.
  sh("ffmpeg", ["-v", "error", "-i", kilde, "-vf", `scale=${bredde}:-2:flags=lanczos,fps=24`,
    "-c:v", "libx264", "-preset", "slow", "-crf", crf,
    "-g", "8", "-keyint_min", "8", "-sc_threshold", "0",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-y", fil]);
  console.log(`  ${fil}  ${(execFileSync("stat", ["-f%z", fil]).toString().trim() / 1024).toFixed(0)} kB`);
}

const plakatPng = join(tmp, `${id}-plakat.png`);
sh("ffmpeg", ["-v", "error", "-i", join(ut, `${id}-${scene.bredder[0]}.mp4`), "-frames:v", "1", "-y", plakatPng]);
const plakat = join(ut, `${id}-poster.avif`);
try {
  sh("npx", ["--yes", "sharp-cli", "-i", plakatPng, "-o", plakat, "-f", "avif", "-q", "55", "--width", String(scene.bredder[0])]);
} catch {
  sh("ffmpeg", ["-v", "error", "-i", plakatPng, "-vf", `scale=${scene.bredder[0]}:-2`,
    "-c:v", "libaom-av1", "-crf", "36", "-still-picture", "1", "-y", plakat]);
}
console.log(`  ${plakat}`);

// Lisensloggen er beviset vårt. En fil som ikke står der, skal ikke ligge i repoet.
const dato = new Date().toISOString().slice(0, 10);
const rad = `| \`public/${scene.mappe}/${id}-*.mp4\`, \`${id}-poster.avif\` | Higgsfield: Qwen Image 3 (redigering) → Kling 3.0 4K (bilde-til-video), betalt API | assets/prompter/scener.json, scene «${id}» | Generert av oss, kommersiell bruk tillatt etter leverandørens vilkår pkt. 4.4 | ${dato} | KodeKonsulentene |\n`;
const lis = "assets/LICENSES.md";
if (existsSync(lis)) {
  const s = readFileSync(lis, "utf8");
  if (!s.includes(`scene «${id}»`)) {
    writeFileSync(lis, s.replace("\n## Merknader", rad + "\n## Merknader"));
    console.log(`  loggført i ${lis}`);
  }
}
console.log(`\nFerdig. Husk å se på resultatet: npm run se -- http://127.0.0.1:4399/ <velger> .skudd/${id}.png 6`);
