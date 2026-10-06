/**
 * Negativ kontroll: beviser at de visuelle testene faktisk blir røde.
 *
 * En grønn test som ikke kan feile er verdiløs. Her startes tre bevisst ødelagte
 * servere – uten Range, med feil MIME-type, og med en CSP som blokkerer inline-
 * skript – og vi kontrollerer at nettleseren rapporterer nøyaktig det signalet
 * testene i tests/visuell.spec.ts leter etter.
 *
 * Rører ingen filer i repoet. Kjør: node .skudd/negativtest.mjs
 */
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { chromium } from "@playwright/test";

// Filnavnene endrer seg når videoene re-kodes; plukk den første mp4-en som finnes.
const MAPPE = "public/historie";
const FILNAVN = readdirSync(MAPPE).find((f) => f.endsWith(".mp4"));
if (!FILNAVN) throw new Error(`fant ingen .mp4 i ${MAPPE}`);
const MP4 = readFileSync(`${MAPPE}/${FILNAVN}`);

const SIDE = (ekstra = "") => `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<title>negativ</title>${ekstra}</head><body><h1>test</h1>
<video id="v" muted playsinline preload="auto"><source src="/film.mp4" type="video/mp4"></video>
<script>window.__kjorte = true;</script>
</body></html>`;

function start({ range, mime, csp, inlineSkript }) {
  const server = createServer((req, res) => {
    if (req.url === "/film.mp4") {
      const h = { "content-type": mime, "content-length": MP4.length };
      if (range) h["accept-ranges"] = "bytes";
      res.writeHead(200, h);
      return res.end(MP4);
    }
    const h = { "content-type": "text/html; charset=utf-8" };
    if (csp) h["content-security-policy"] = csp;
    res.writeHead(200, h);
    res.end(SIDE(inlineSkript ?? ""));
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r(server)));
}

const b = await chromium.launch();
let feilet = 0;

async function sjekk(navn, opts, forvent) {
  const server = await start(opts);
  const port = server.address().port;
  const p = await b.newPage();
  const csp = [];
  p.on("console", (m) => {
    if (m.type() === "error" && /content security policy/i.test(m.text())) csp.push(m.text());
  });
  await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);

  const v = await p.evaluate(() => {
    const el = document.querySelector("video");
    return {
      seekbarTil: el.seekable.length ? el.seekable.end(el.seekable.length - 1) : 0,
      readyState: el.readyState,
      kjorte: Boolean(window.__kjorte),
    };
  });
  const ct = (await p.request.get(`http://127.0.0.1:${port}/film.mp4`)).headers()["content-type"];
  await p.close();
  server.close();

  const faktisk = { seekbarTil: v.seekbarTil, readyState: v.readyState, contentType: ct, cspBrudd: csp.length, skriptKjorte: v.kjorte };
  const ok = forvent(faktisk);
  console.log(`${ok ? "FANGET " : "BOMMET "} ${navn}`);
  console.log(`          ${JSON.stringify(faktisk)}`);
  if (!ok) feilet++;
}

// 1. Uten Range: nettleseren melder at videoen ikke kan spoles.
await sjekk("manglende HTTP Range → seekbarTil === 0",
  { range: false, mime: "video/mp4" },
  (f) => f.seekbarTil === 0);

// 2. Med Range: samme video blir spolbar. Kontrollen på kontrollen.
await sjekk("med HTTP Range → seekbarTil > 0",
  { range: true, mime: "video/mp4" },
  (f) => f.seekbarTil > 0);

// 3. Feil MIME-type: content-type-testen slår inn.
await sjekk("feil MIME-type → ikke video/mp4",
  { range: true, mime: "application/octet-stream" },
  (f) => !String(f.contentType).includes("video/mp4"));

// 4. Streng CSP uten hash: inline-skriptet blokkeres, og konsollen sier fra.
await sjekk("CSP uten hash → inline-skript blokkert",
  { range: true, mime: "video/mp4", csp: "default-src 'self'; script-src 'self'" },
  (f) => f.cspBrudd > 0 && f.skriptKjorte === false);

await b.close();
console.log(feilet === 0 ? "\nAlle fire signalene oppfører seg som testene forutsetter." : `\n${feilet} kontroll(er) bommet.`);
process.exit(feilet === 0 ? 0 : 1);
