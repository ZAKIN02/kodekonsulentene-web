#!/usr/bin/env node
/**
 * Scroll-world, fase 1: stillbilder via Higgsfield-API (ikke CLI-en). Kjøres fra repo-rot:
 *   node assets/higgsfield/scroll-world/produksjon-sw.mjs <ut-uten-endelse> --modell grok|qwen|recraft|ideogram|soul
 *        --prompt fil1,fil2 [--ref fil,fil] [--aspect 16:9] [--ramme 179.8] [--merknad "..."] [--kun-estimat]
 * Nøkkel fra ~/.config/kodekonsulentene/higgsfield.env (skrives aldri ut). Logger til assets/higgsfield/logg.md.
 * Rammen er i summen av est= i loggen (se `node scripts/produksjon.mjs sum`).
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { extname, dirname } from "node:path";

const LOGG = "assets/higgsfield/logg.md";
const API = "https://api.higgsfield.ai";
const SLUG = {
  grok: "xai/grok-imagine-image-2.0",
  qwen: "alibaba/qwen-image-3/text-to-image",
  qwenRed: "alibaba/qwen-image-3/edit",
  recraft: "recraft/v4.1/pro/text-to-image",
  ideogram: "ideogram/v4.0",
  soul: "higgsfield-ai/soul/v2/standard",
};

const [ut, ...rest] = process.argv.slice(2);
const flagg = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith("--")) continue;
  const n = rest[i].slice(2), nx = rest[i + 1];
  if (nx === undefined || nx.startsWith("--")) flagg[n] = true; else { flagg[n] = nx; i++; }
}
const env = {};
for (const l of readFileSync(`${homedir()}/.config/kodekonsulentene/higgsfield.env`, "utf8").split("\n")) {
  const m = l.match(/^\s*(?:export\s+)?([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
const nokkel = [env.HIGGSFIELD_API_KEY, env.HIGGSFIELD_API_SECRET];
const tid = () => new Date().toISOString().replace("T", " ").slice(0, 19) + "Z";
const sumEst = () => { let s = 0; for (const m of readFileSync(LOGG, "utf8").matchAll(/\best=(-?[0-9.]+)/g)) s += Number(m[1]); return s; };
const logg = (l) => appendFileSync(LOGG, l + "\n");
const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function lastOpp(fil) {
  const type = mime[extname(fil).toLowerCase()] ?? "image/png";
  const r = await fetch(`${API}/files/generate-upload-url`, { method: "POST", headers: { Authorization: `Key ${nokkel.join(":")}`, "Content-Type": "application/json" }, body: JSON.stringify({ content_type: type }) });
  if (!r.ok) throw new Error(`opplastingslenke ${r.status}`);
  const { upload_url, public_url, upload_headers } = await r.json();
  const put = await fetch(upload_url, { method: "PUT", headers: upload_headers ?? { "Content-Type": type }, body: readFileSync(fil) });
  if (!put.ok) throw new Error(`opplasting ${put.status}`);
  return public_url;
}
async function estimer(slug, input) {
  const r = await fetch(`${API}/estimate/${slug}`, { method: "POST", headers: { Authorization: `Key ${nokkel.join(":")}`, "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const t = await r.text(); if (!r.ok) throw new Error(`estimat ${r.status}: ${t.slice(0, 200)}`);
  const j = JSON.parse(t); if (j.credits === undefined) throw new Error(`ukjent estimat: ${t.slice(0, 200)}`); return Number(j.credits);
}

config({ credentials: nokkel.join(":"), maxPollTime: 30 * 60 * 1000, pollInterval: 5000 });
const ramme = Number(flagg.ramme ?? 179.8);
const modell = flagg.modell ?? "grok";
const prompt = String(flagg.prompt).split(",").map((f) => readFileSync(f, "utf8").trim()).join("\n\n");
const aspect_ratio = flagg.aspect ?? "16:9";
const refs = flagg.ref ? await Promise.all(String(flagg.ref).split(",").map(lastOpp)) : [];

let slug, input;
if (modell === "grok") { slug = SLUG.grok; input = { prompt, aspect_ratio, resolution: "2k", quality: "medium" }; if (refs.length) input.image_urls = refs; }
else if (modell === "qwen") { slug = refs.length ? SLUG.qwenRed : SLUG.qwen; input = { prompt, aspect_ratio, resolution: "2k" }; if (refs.length) input.image_urls = refs; }
else if (modell === "recraft") { slug = SLUG.recraft; input = { prompt, aspect_ratio, resolution: "2k" }; }
else if (modell === "ideogram") { slug = SLUG.ideogram; input = { prompt, aspect_ratio, rendering_speed: "QUALITY" }; if (refs[0]) { input.image_url = refs[0]; input.image_weight = Number(flagg.vekt ?? 80); } }
else if (modell === "soul") { slug = SLUG.soul; input = { prompt, aspect_ratio, resolution: "1080p" }; }
else throw new Error("ukjent modell");

const est = await estimer(slug, input);
const for_ = sumEst();
console.log(`${ut}: estimat ${est}, sum ${for_.toFixed(3)} av ramme ${ramme}`);
if (flagg["kun-estimat"]) process.exit(0);
if (for_ + est > ramme) { console.error(`STOPP: rammen ${ramme} overskrides`); process.exit(2); }
logg(`- ${tid()} START ${ut} | ${slug} ${aspect_ratio} ${input.resolution ?? "-"} ref=${flagg.ref ?? "-"} | promptfil=${flagg.prompt} | est=${est} | sum før=${for_.toFixed(3)} | merknad: ${flagg.merknad ?? "-"}`);
let r;
try { r = await higgsfield.subscribe(slug, { input, withPolling: true }); }
catch (e) { logg(`- ${tid()} FEIL ${ut} | ${String(e.message ?? e).slice(0, 200)} | est=-${est} (antatt refundert)`); throw e; }
if (r.status !== "completed") { logg(`- ${tid()} IKKE FULLFØRT ${ut} | status=${r.status} ${r.error ?? ""} | est=-${est} (failed/nsfw refunderes)`); process.exit(3); }
const url = r.images?.[0]?.url;
if (!url) { logg(`- ${tid()} TOMT SVAR ${ut} | est=0`); process.exit(3); }
const fil = `${ut}${extname(new URL(url).pathname) || ".png"}`;
mkdirSync(dirname(fil), { recursive: true });
execFileSync("curl", ["-sS", "-L", "--fail", "--max-time", "600", "-o", fil, url]);
const m = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", fil]).toString().trim();
logg(`  - resultat: ${fil} | ${m} | sum etter=${sumEst().toFixed(3)}`);
console.log(`${fil} ${m}`);
