/**
 * Kravler hver URL i sitemap som Googlebot og rapporterer det som faktisk
 * avgjoer indeksering: status, robots-meta, X-Robots-Tag, kanonisk URL, lang,
 * og om hovedinnholdet finnes i raa HTML (uten JavaScript).
 */
import { readFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const urler = readFileSync(process.argv[2], "utf8").trim().split("\n").filter(Boolean);
const funn = [];

for (const u of urler) {
  let r;
  try {
    r = await fetch(u, { headers: { "user-agent": UA }, redirect: "manual" });
  } catch (e) {
    funn.push([u, `FEIL ${e.message}`]);
    continue;
  }
  const xrobots = r.headers.get("x-robots-tag") || "";
  const ct = r.headers.get("content-type") || "";
  if (r.status !== 200) {
    funn.push([u, `HTTP ${r.status} -> ${r.headers.get("location") || ""}`]);
    continue;
  }
  const html = await r.text();
  const robots = /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)/i.exec(html)?.[1] || "";
  const kanon = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)/i.exec(html)?.[1] || "";
  const lang = /<html[^>]+lang=["']([^"']+)/i.exec(html)?.[1] || "";
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  // Tekstinnhold uten script/style, altsaa det en kravler uten JS ser.
  const tekst = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const p = [];
  if (/noindex/i.test(robots)) p.push(`META NOINDEX (${robots})`);
  if (/noindex/i.test(xrobots)) p.push(`X-ROBOTS NOINDEX (${xrobots})`);
  if (!ct.includes("text/html")) p.push(`content-type ${ct}`);
  if (!lang) p.push("mangler lang");
  else if (!lang.startsWith("nb") && !lang.startsWith("no")) p.push(`lang=${lang}`);
  if (!kanon) p.push("ingen canonical");
  else if (kanon.replace(/\/$/, "") !== u.replace(/\/$/, "")) p.push(`canonical -> ${kanon}`);
  if (h1 !== 1) p.push(`${h1} h1`);
  if (tekst.length < 600) p.push(`bare ${tekst.length} tegn tekst uten JS`);
  if (p.length) funn.push([u, p.join(" · ")]);
}

for (const [u, m] of funn) console.log(`  ${u.replace("https://kodekonsulentene.no", "") || "/"}\n      ${m}`);
console.log(funn.length ? `\n  ${funn.length} av ${urler.length} URL-er med funn` : `\n  alle ${urler.length} URL-er er rene`);
