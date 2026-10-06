/**
 * Trenger <script type="application/ld+json"> en CSP-hash?
 *
 * CSP sin script-src gjelder skript nettleseren KJOERER. ld+json er en datablokk
 * med en type nettleseren ikke kan kjoere, saa den skal ikke sjekkes. Vi antar
 * ikke – vi serverer siden med en CSP som BEVISST utelater ld+json-hashene og
 * ser om nettleseren klager.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const html = readFileSync("dist/client/verktoy/dmarc/index.html", "utf8");

// Hash BARE kjoerbare inline-skript (ikke ld+json).
const kjorbare = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(([, attr]) => !/type\s*=\s*["']application\/ld\+json["']/.test(attr))
  .map(([, , kode]) => `'sha256-${createHash("sha256").update(kode, "utf8").digest("base64")}'`);
const ldjson = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>/g)].length;

const csp = [
  "default-src 'self'",
  `script-src 'self' ${kjorbare.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
].join("; ");

// Server ekte filer for alt annet enn HTML-en, ellers faar .js-forespoerslene
// HTML tilbake og konsollen fylles av feil som ikke har med CSP aa gjoere.
const srv = createServer((req, res) => {
  res.setHeader("content-security-policy", csp);
  if (req.url === "/") {
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.end(html);
  }
  try {
    const f = readFileSync("dist/client" + req.url.split("?")[0]);
    const t = req.url.endsWith(".js") ? "text/javascript" : req.url.endsWith(".css") ? "text/css" : "application/octet-stream";
    res.setHeader("content-type", t);
    return res.end(f);
  } catch { res.statusCode = 404; return res.end(); }
}).listen(4639);

const b = await chromium.launch();
const p = await b.newPage();
const brudd = [];
await p.addInitScript(() => {
  document.addEventListener("securitypolicyviolation", (e) =>
    (window.__brudd ||= []).push(`${e.violatedDirective} :: ${(e.sourceFile||"").slice(-30)} :: ${String(e.sample||"").slice(0,40)}`));
});
p.on("console", (m) => { if (m.type() === "error") brudd.push("konsoll: " + m.text().slice(0, 90)); });
await p.goto("http://127.0.0.1:4639/", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const fraSide = await p.evaluate(() => window.__brudd || []);

console.log(`  ld+json-blokker paa siden: ${ldjson}`);
console.log(`  hasher i CSP (bare kjoerbare): ${kjorbare.length}`);
console.log(`  CSP-brudd rapportert: ${fraSide.length + brudd.length}`);
for (const x of [...fraSide, ...brudd]) console.log("   ", x);
// Virker siden fortsatt? Temaknappen er inline-skript og MAA kjoere.
console.log("  tema-skript kjoerte:", await p.evaluate(() => !!document.documentElement.dataset.theme));
await b.close(); srv.close();
