#!/usr/bin/env node
/** Scroll-world 2a: video via Higgsfield-API. Kjøres fra repo-rot:
 *  node assets/higgsfield/scroll-world/video-sw.mjs <ut.mp4> --slug S --start fil --slutt fil --prompt fil --slutt-felt end_image_url|last_image_url --extra '{"duration":6}' --ramme N [--kun-estimat] [--merknad ".."]
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { execFileSync } from "node:child_process";
import { readFileSync, appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname } from "node:path";
const LOGG = "assets/higgsfield/logg.md", API = "https://api.higgsfield.ai";
const [ut, ...rest] = process.argv.slice(2); const f = {};
for (let i = 0; i < rest.length; i++) { if (!rest[i].startsWith("--")) continue; const n = rest[i].slice(2), nx = rest[i+1]; if (nx === undefined || nx.startsWith("--")) f[n] = true; else { f[n] = nx; i++; } }
const env = {}; for (const l of readFileSync(`${homedir()}/.config/kodekonsulentene/higgsfield.env`, "utf8").split("\n")) { const m = l.match(/^\s*(?:export\s+)?([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, ""); }
const nokkel = [env.HIGGSFIELD_API_KEY, env.HIGGSFIELD_API_SECRET];
const tid = () => new Date().toISOString().replace("T", " ").slice(0, 19) + "Z";
const sumEst = () => { let s = 0; for (const m of readFileSync(LOGG, "utf8").matchAll(/\best=(-?[0-9.]+)/g)) s += Number(m[1]); return s; };
const logg = (l) => appendFileSync(LOGG, l + "\n");
async function lastOpp(fil) {
  const r = await fetch(`${API}/files/generate-upload-url`, { method: "POST", headers: { Authorization: `Key ${nokkel.join(":")}`, "Content-Type": "application/json" }, body: JSON.stringify({ content_type: "image/png" }) });
  if (!r.ok) throw new Error(`opplastingslenke ${r.status}`);
  const { upload_url, public_url, upload_headers } = await r.json();
  const p = await fetch(upload_url, { method: "PUT", headers: upload_headers ?? { "Content-Type": "image/png" }, body: readFileSync(fil) });
  if (!p.ok) throw new Error(`opplasting ${p.status}`); return public_url;
}
config({ credentials: nokkel.join(":"), maxPollTime: 30 * 60 * 1000, pollInterval: 5000 });
const input = { prompt: readFileSync(f.prompt, "utf8").trim(), image_url: await lastOpp(f.start), [f["slutt-felt"]]: await lastOpp(f.slutt), ...JSON.parse(f.extra ?? "{}") };
const er = await fetch(`${API}/estimate/${f.slug}`, { method: "POST", headers: { Authorization: `Key ${nokkel.join(":")}`, "Content-Type": "application/json" }, body: JSON.stringify(input) });
const et = await er.text(); console.log("estimat-svar:", er.status, et.slice(0, 400));
if (!er.ok) process.exit(4);
const j = JSON.parse(et); const rate = Number((j.pricing_description.match(/1080p: \$([0-9]+\.[0-9]+)/) ?? [])[1]); const est = j.credits !== undefined ? Number(j.credits) : Math.round(rate * input.duration * 16 * 1000) / 1000; /* 16 kreditter per USD, jf. f0-produsent-saldo */ const for_ = sumEst();
console.log(`${ut}: est ${est}, sum ${for_.toFixed(3)} av ramme ${f.ramme}`);
if (f["kun-estimat"]) process.exit(0);
if (for_ + est > Number(f.ramme)) { console.error("STOPP: rammen overskrides"); process.exit(2); }
logg(`- ${tid()} START ${ut} | ${f.slug} extra=${f.extra} start=${f.start} slutt=${f.slutt} | promptfil=${f.prompt} | est=${est} | sum før=${for_.toFixed(3)} | merknad: ${f.merknad ?? "-"}`);
let r; try { r = await higgsfield.subscribe(f.slug, { input, withPolling: true }); } catch (e) { logg(`- ${tid()} FEIL ${ut} | ${String(e.message ?? e).slice(0, 300)} | est=-${est} (antatt refundert)`); throw e; }
writeFileSync(ut + ".json", JSON.stringify({ ...r, request: undefined }, null, 1));
if (r.status !== "completed") { logg(`- ${tid()} IKKE FULLFØRT ${ut} | status=${r.status} ${r.error ?? ""} | est=-${est} (refunderes)`); process.exit(3); }
const url = r.video?.url; if (!url) { logg(`- ${tid()} TOMT SVAR ${ut} | est=0`); process.exit(3); }
mkdirSync(dirname(ut), { recursive: true });
execFileSync("curl", ["-sS", "-L", "--fail", "--max-time", "600", "-o", ut, url]);
const m = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,duration", "-of", "csv=p=0:s=x", ut]).toString().trim();
logg(`  - resultat: ${ut} | ${m} | sum etter=${sumEst().toFixed(3)}`);
console.log(ut, m);
