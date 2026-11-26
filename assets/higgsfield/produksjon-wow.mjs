#!/usr/bin/env node
/**
 * Produksjonsskript for Higgsfield (del 9 i redesign-brief). Enkelt og uten magi:
 * én generering per kall, estimat før, nedlasting og logg etter.
 *
 *   node scripts/produksjon.mjs bilde <ut> --prompt stilkort.txt,bilde-A.txt [--ref fil] [--aspect 16:9] [--res 2k]
 *   node scripts/produksjon.mjs video <ut> --nivaa std|pro|4k --start fil --slutt fil --prompt klipp-A.txt [--duration 6] [--cfg 0.5]
 *   node scripts/produksjon.mjs sum                   # summen av estimatene i loggen
 *   add --kun-estimat for å bare hente prisanslag.
 *
 * <ut> er en sti uten endelse (f.eks. assets/higgsfield/bilder/A-1). Endelsen settes etter
 * filtypen som kommer tilbake. Promptfiler løses mot assets/higgsfield/prompter/.
 *
 * Nøkkelen leses fra ~/.config/kodekonsulentene/higgsfield.env og skrives aldri ut.
 * Saldo kan ikke leses via API. Loggen fører derfor estimatet (est=) fra POST /estimate.
 * Rammen (--ramme, standard 100) sjekkes mot summen av est= i loggen før hver generering.
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { basename, extname, dirname, resolve } from "node:path";

const LOGG = "assets/higgsfield/logg.md";
const PROMPTER = "assets/higgsfield/prompter";
const API = "https://api.higgsfield.ai";

const MODELLER = {
  bilde: { ny: "alibaba/qwen-image-3/text-to-image", rediger: "alibaba/qwen-image-3/edit" },
  // Alternative bildemodeller (--modell grok|ideogram). Samme endepunkt for ny og redigering.
  grok: "xai/grok-imagine-image-2.0",
  ideogram: "ideogram/v4.0",
  video: {
    std: "kling-video/v3.0/std/image-to-video",
    pro: "kling-video/v3.0/pro/image-to-video",
    "4k": "kling-video/v3.0/4k/image-to-video",
  },
};

// --- argumenter ---------------------------------------------------------------
const [kommando, ut, ...rest] = process.argv.slice(2);
const flagg = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith("--")) continue;
  const navn = rest[i].slice(2);
  const neste = rest[i + 1];
  if (neste === undefined || neste.startsWith("--")) flagg[navn] = true;
  else { flagg[navn] = neste; i++; }
}

// --- nøkkel -------------------------------------------------------------------
function lesNokkel() {
  const fil = `${homedir()}/.config/kodekonsulentene/higgsfield.env`;
  const env = {};
  for (const linje of readFileSync(fil, "utf8").split("\n")) {
    const m = linje.match(/^\s*(?:export\s+)?([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  const id = env.HIGGSFIELD_API_KEY, hemmelig = env.HIGGSFIELD_API_SECRET;
  if (!id || !hemmelig) throw new Error("Mangler HIGGSFIELD_API_KEY/HIGGSFIELD_API_SECRET i nøkkelfila");
  return [id, hemmelig];
}

// --- logg ---------------------------------------------------------------------
function logg(linje) {
  mkdirSync(dirname(LOGG), { recursive: true });
  if (!existsSync(LOGG)) {
    writeFileSync(LOGG, "# Higgsfield-logg\n\nEn linje før hver generering og en etter. `est=` er prisanslag fra POST /estimate (kreditter); negative est= er refusjon ved feil. Saldo kan ikke leses via API; eier leser den i console.higgsfield.ai.\n\n");
  }
  appendFileSync(LOGG, linje + "\n");
}
function sumEst() {
  if (!existsSync(LOGG)) return 0;
  let s = 0;
  for (const m of readFileSync(LOGG, "utf8").matchAll(/\best=(-?[0-9.]+)/g)) s += Number(m[1]);
  return s;
}
const tid = () => new Date().toISOString().replace("T", " ").slice(0, 19) + "Z";

// --- hjelpere -----------------------------------------------------------------
const promptTekst = (liste) =>
  liste.split(",").map((f) => readFileSync(f.includes("/") ? f : `${PROMPTER}/${f}`, "utf8").trim()).join("\n\n");

const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function lastOpp([id, hemmelig], fil) {
  if (/^https?:/.test(fil)) return fil;
  const type = mime[extname(fil).toLowerCase()] ?? "image/png";
  const r = await fetch(`${API}/files/generate-upload-url`, {
    method: "POST",
    headers: { Authorization: `Key ${id}:${hemmelig}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content_type: type }),
  });
  if (!r.ok) throw new Error(`opplastingslenke feilet: ${r.status}`);
  const { upload_url, public_url, upload_headers } = await r.json();
  const put = await fetch(upload_url, { method: "PUT", headers: upload_headers ?? { "Content-Type": type }, body: readFileSync(fil) });
  if (!put.ok) throw new Error(`opplasting feilet: ${put.status}`);
  return public_url;
}

async function estimer([id, hemmelig], slug, input) {
  const r = await fetch(`${API}/estimate/${slug}`, {
    method: "POST",
    headers: { Authorization: `Key ${id}:${hemmelig}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const tekst = await r.text();
  if (!r.ok) throw new Error(`estimat feilet (${r.status}): ${tekst.slice(0, 200)}`);
  const j = JSON.parse(tekst);
  const kr = j.credits ?? j.estimated_credits ?? j.cost?.credits ?? j.total_credits;
  if (kr === undefined && j.pricing_description && input.duration) return Math.round(0.896 * input.duration * 1000) / 1000; // antatt pro-pris fra tidligere logg (5.376/6 s)
  if (kr === undefined) throw new Error(`ukjent estimatformat: ${tekst.slice(0, 300)}`);
  return Number(kr);
}

function last(url, fil) {
  mkdirSync(dirname(fil), { recursive: true });
  execFileSync("curl", ["-sS", "-L", "--fail", "--max-time", "600", "-o", fil, url]);
}
function mal(fil) {
  return execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", fil]).toString().trim();
}

// --- hovedløp -----------------------------------------------------------------
if (kommando === "sum") { console.log(sumEst().toFixed(3)); process.exit(0); }
if (!["bilde", "video"].includes(kommando) || !ut) {
  console.error("Bruk: produksjon.mjs bilde|video <ut> ... (se toppen av fila) eller: sum");
  process.exit(1);
}

const nokkel = lesNokkel();
config({ credentials: nokkel.join(":"), maxPollTime: 30 * 60 * 1000, pollInterval: 5000 });
const ramme = Number(flagg.ramme ?? 100);

let slug, input, beskrivelse;
if (kommando === "bilde") {
  if (!flagg.prompt) throw new Error("--prompt mangler");
  const prompt = promptTekst(flagg.prompt), aspect_ratio = flagg.aspect ?? "16:9", resolution = flagg.res ?? "2k";
  if (resolution === "1k") throw new Error("1k er ikke tillatt");
  const refs = flagg.ref ? await Promise.all(String(flagg.ref).split(",").map((f) => lastOpp(nokkel, f))) : [];
  const ref = refs[0] ?? null;
  if (flagg.modell === "grok") {
    slug = MODELLER.grok;
    input = { prompt, aspect_ratio, resolution, quality: "medium" };
    if (refs.length) input.image_urls = refs;
  } else if (flagg.modell === "ideogram") {
    slug = MODELLER.ideogram; // ingen resolution-felt; oppløsningen måles etterpå
    input = { prompt, aspect_ratio, rendering_speed: "QUALITY" };
    if (ref) { input.image_url = ref; input.image_weight = Number(flagg.vekt ?? 80); }
  } else {
    input = { prompt, aspect_ratio, resolution };
    if (ref) { slug = MODELLER.bilde.rediger; input.image_urls = [ref]; }
    else slug = MODELLER.bilde.ny;
  }
  beskrivelse = `${slug} ${aspect_ratio} ${input.resolution ?? "-"} ref=${flagg.ref ?? "-"}`;
} else {
  slug = MODELLER.video[flagg.nivaa ?? "pro"];
  if (!slug) throw new Error("--nivaa må være std, pro eller 4k");
  if (!flagg.start || !flagg.prompt) throw new Error("--start, --slutt og --prompt kreves");
  input = {
    prompt: promptTekst(flagg.prompt),
    image_url: await lastOpp(nokkel, flagg.start),
    ...(flagg.slutt ? { last_image_url: await lastOpp(nokkel, flagg.slutt) } : {}),
    duration: Number(flagg.duration ?? 6),
    sound: "off",
  };
  if (flagg.cfg) input.cfg_scale = Number(flagg.cfg);
  beskrivelse = `${slug} ${input.duration}s cfg=${flagg.cfg ?? "std"} start=${flagg.start} slutt=${flagg.slutt}`;
}

const est = await estimer(nokkel, slug, input);
const for_ = sumEst();
console.log(`estimat ${est} kr, sum i loggen ${for_.toFixed(3)} av ramme ${ramme}`);
if (flagg["kun-estimat"]) process.exit(0);
if (for_ + est > ramme) {
  console.error(`STOPP: ${for_.toFixed(3)} + ${est} overstiger rammen ${ramme}`);
  process.exit(2);
}

const promptfil = String(flagg.prompt);
logg(`- ${tid()} START ${ut} | ${beskrivelse} | promptfil=${promptfil} | est=${est} | sum før=${for_.toFixed(3)} | merknad: ${flagg.merknad ?? "-"}`);
let r;
try {
  r = await higgsfield.subscribe(slug, { input, withPolling: true });
} catch (e) {
  logg(`- ${tid()} FEIL ${ut} | ${String(e.message ?? e).slice(0, 200)} | est=-${est} (antatt refundert; kontroller i konsollen)`);
  throw e;
}
if (r.status !== "completed") {
  logg(`- ${tid()} IKKE FULLFØRT ${ut} | status=${r.status} ${r.error ?? ""} | est=-${est} (failed/nsfw refunderes)`);
  process.exit(3);
}
const url = kommando === "bilde" ? r.images?.[0]?.url : r.video?.url;
if (!url) { logg(`- ${tid()} TOMT SVAR ${ut} | est=0 (kontroller i konsollen)`); process.exit(3); }
const ende = extname(new URL(url).pathname) || (kommando === "bilde" ? ".png" : ".mp4");
const fil = `${ut}${ende}`;
last(url, fil);
const m = mal(fil);
logg(`  - resultat: ${fil} | ${m} | sum etter=${sumEst().toFixed(3)}`);
console.log(`${fil} ${m}`);
