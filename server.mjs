/**
 * HTTP-serveren som kjører i containeren på Fly.io.
 *
 * Hvorfor en egen server i stedet for `@astrojs/node` i standalone-modus:
 * standalone serverer de prerendrede HTML-filene rett fra disk, utenom src/middleware.ts.
 * Forsiden hadde da kommet ut uten sikkerhetsheadere, og siden selger nettopp den sjekken.
 * Her settes headerne på hvert eneste svar – statisk fil, API-rute og 404 – før noe annet skjer.
 *
 * Den gjør tre ting, i rekkefølge:
 *   1. setter sikkerhetsheadere
 *   2. prøver å finne en statisk fil i dist/client (med brotli/gzip)
 *   3. sender resten videre til Astro, som håndterer /api/* og rendrer 404
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import zlib from "node:zlib";
import { promisify } from "node:util";

import { handler as astro } from "./dist/server/entry.mjs";
import { createHash } from "node:crypto";
import { inlineSkriptHasher, lagSikkerhetsheadere } from "./sikkerhet.mjs";

const brotli = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

const ROT = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist", "client");

/**
 * CSP-en må kjenne hashen til hvert inline-skript Astro la i HTML-en. Regnes ut
 * én gang ved oppstart fra det ferdige bygget – ikke per forespørsel.
 */
const SKRIPTHASHER = inlineSkriptHasher(ROT);
const HEADERE = lagSikkerhetsheadere(SKRIPTHASHER);

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? "0.0.0.0";

const TYPER = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  // Scroll-historien spiller MP4. Uten riktig MIME-type sender vi
  // application/octet-stream, og nettleseren nekter å spille av videoen.
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

/** Typer det lønner seg å komprimere. Bilder og fonter er allerede komprimert. */
const KOMPRIMERBAR = /^(text\/|application\/(json|xml|manifest))|image\/svg/;

/** Små filer: komprimert utgave holdes i minnet. Hele siden er noen hundre kilobyte. */
const hurtigbuffer = new Map();
const MAKS_BUFFER = 512 * 1024;

function settHeadere(res) {
  for (const [navn, verdi] of Object.entries(HEADERE)) res.setHeader(navn, verdi);
}

function trygg(urlSti) {
  // Normaliserer bort «..» slik at ingen kan be om filer utenfor dist/client.
  const rent = path.normalize(decodeURIComponent(urlSti.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(ROT, rent);
  return full.startsWith(ROT) ? full : null;
}

async function finnFil(sti) {
  for (const kandidat of [sti, path.join(sti, "index.html"), `${sti}.html`]) {
    try {
      const s = await stat(kandidat);
      if (s.isFile()) return { sti: kandidat, storrelse: s.size, endret: s.mtime };
    } catch {
      /* neste kandidat */
    }
  }
  return null;
}

function kodinger(req) {
  const a = String(req.headers["accept-encoding"] ?? "");
  if (/\bbr\b/.test(a)) return "br";
  if (/\bgzip\b/.test(a)) return "gzip";
  return null;
}

async function serverFil(req, res, funn) {
  const ext = path.extname(funn.sti).toLowerCase();
  const type = TYPER[ext] ?? "application/octet-stream";

  // Filer under /_astro/ har innholdshash i navnet og kan bufres for alltid.
  // Alt annet revalideres, slik at en ny tekst er ute med én gang.
  //
  // Fontene er det ene unntaket uten innholdshash som likevel tåler evig buffer:
  // filnavnet koder familie, vektintervall og subsett, så en endring av selve
  // filinnholdet ville betydd en ny skrift – og da bytter navnet uansett.
  // Lighthouse målte 39 kB + 27 kB «wasted» på forsiden med én times buffer;
  // det er to ekstra rundturer på hvert gjenbesøk, for filer som aldri endres.
  //
  // Video og bilder står med vilje på én time. De regenereres, og en lang
  // buffer ville låst gamle klipp hos dem som har vært innom. Riktig løsning
  // der er innholdshash i filnavnet – ikke en lengre buffer på et navn som
  // kan peke på nytt innhold i morgen.
  const evig = funn.sti.includes(`${path.sep}_astro${path.sep}`)
    || funn.sti.includes(`${path.sep}fonts${path.sep}`);
  res.setHeader("content-type", type);
  res.setHeader(
    "cache-control",
    evig
      ? "public, max-age=31536000, immutable"
      : ext === ".html"
        ? "public, max-age=0, must-revalidate"
        // Medier ligger paa UHASHEDE filnavn: hist2-steg-1920.mp4 beholder navnet
        // sitt naar klippet regenereres, og det skjedde flere ganger i dag. Derfor
        // kan de ikke vaere immutable – da ville et rettet klipp ligge gammelt i et
        // aar hos alle som hadde sett det. En time var paa den andre siden satt mens
        // materialet var under arbeid, og tvinger en revalidering i timen.
        //
        // Ett doegn, pluss en uke der nettleseren viser den bufrede fila med en gang
        // og henter ny i bakgrunnen. ETag fanger endringen, saa et rettet klipp slaar
        // gjennom ved neste besoek i stedet for ved neste time eller neste aar.
        // Den egentlige loesningen er innholds-hashede filnavn; da kan de bli
        // immutable. Det ligger i rorledningen, ikke her.
        : "public, max-age=86400, stale-while-revalidate=604800",
  );

  const etag = `W/"${funn.storrelse}-${funn.endret.getTime().toString(36)}"`;
  res.setHeader("etag", etag);
  if (req.headers["if-none-match"] === etag) {
    res.writeHead(304).end();
    return;
  }

  // Range-forespørsler. Uten dette melder nettleseren at videoen ikke kan spoles
  // (seekable.end(0) === 0), og scroll-styrt video står bom stille på første ramme.
  // Det var nettopp det som skjedde: /historie lastet videoen, men kunne ikke hoppe i den.
  // Media komprimeres ikke uansett – mp4 er allerede komprimert – så Range og
  // innholdskoding kommer aldri i konflikt.
  const kanRange = !KOMPRIMERBAR.test(type);
  if (kanRange) res.setHeader("accept-ranges", "bytes");

  const rangeHode = kanRange ? req.headers.range : undefined;
  if (rangeHode) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(String(rangeHode).trim());
    if (m) {
      const siste = funn.storrelse - 1;
      let start = m[1] === "" ? NaN : Number(m[1]);
      let slutt = m[2] === "" ? NaN : Number(m[2]);
      if (Number.isNaN(start)) {
        // «bytes=-500» betyr de siste 500 bytene.
        const halen = Number.isNaN(slutt) ? 0 : slutt;
        start = Math.max(0, funn.storrelse - halen);
        slutt = siste;
      } else if (Number.isNaN(slutt)) {
        slutt = siste;
      }
      slutt = Math.min(slutt, siste);

      if (start > siste || start > slutt) {
        res.setHeader("content-range", `bytes */${funn.storrelse}`);
        return void res.writeHead(416).end();
      }

      res.setHeader("content-range", `bytes ${start}-${slutt}/${funn.storrelse}`);
      res.setHeader("content-length", slutt - start + 1);
      res.writeHead(206);
      if (req.method === "HEAD") return void res.end();
      return void createReadStream(funn.sti, { start, end: slutt }).pipe(res);
    }
  }

  const kod = KOMPRIMERBAR.test(type) && funn.storrelse > 512 ? kodinger(req) : null;
  if (!kod) {
    res.setHeader("content-length", funn.storrelse);
    res.writeHead(200);
    if (req.method === "HEAD") return void res.end();
    return void createReadStream(funn.sti).pipe(res);
  }

  const nokkel = `${kod}:${funn.sti}:${etag}`;
  let kropp = hurtigbuffer.get(nokkel);
  if (!kropp) {
    const rå = await readFile(funn.sti);
    kropp = kod === "br" ? await brotli(rå) : await gzip(rå);
    if (kropp.length <= MAKS_BUFFER) hurtigbuffer.set(nokkel, kropp);
  }
  res.setHeader("content-encoding", kod);
  res.setHeader("vary", "accept-encoding");
  res.setHeader("content-length", kropp.length);
  res.writeHead(200);
  res.end(req.method === "HEAD" ? undefined : kropp);
}


/**
 * CSP for serverrendrede sider.
 *
 * Hashene for inline-skript leses ut av det ferdige bygget ved oppstart, men
 * sider med `prerender = false` havner aldri i dist/client – HTML-en finnes først
 * når forespørselen kommer. /kontakt er en slik side, og den hadde tre blokkerte
 * skript: terminalen skrev seg ikke inn og temabryteren virket ikke, uten at noe
 * feilet synlig.
 *
 * Løsningen er å beregne CSP per svar for disse sidene: vi fanger HTML-en på vei
 * ut, hasher skriptene den faktisk inneholder, og legger dem til. Bufringen gjelder
 * bare HTML fra Astro – statiske filer og API-svar går uberørt forbi.
 */
function medSsrCsp(res) {
  const skrivHode = res.writeHead.bind(res);
  const skriv = res.write.bind(res);
  const slutt = res.end.bind(res);

  let biter = null;      // samler HTML-en
  let hodeArgs = null;   // utsatt writeHead

  res.writeHead = (...a) => {
    // Content-type kan ligge i headerobjektet Astro sender med, ikke bare i
    // setHeader. Begge må sjekkes, ellers går HTML-svar rett forbi bufringen.
    const fraHode = a.find((x) => x && typeof x === "object");
    const type = String(fraHode?.["content-type"] ?? fraHode?.["Content-Type"] ?? res.getHeader("content-type") ?? "");
    if (!/text\/html/i.test(type)) return skrivHode(...a);
    // Utsettes: vi kjenner ikke hashene før hele HTML-en er skrevet, og
    // headerne kan ikke endres etter at writeHead har sendt dem.
    hodeArgs = a;
    biter = [];
    return res;
  };

  res.write = (chunk, ...a) => {
    if (biter && chunk) { biter.push(Buffer.from(chunk)); return true; }
    return skriv(chunk, ...a);
  };

  res.end = (chunk, ...a) => {
    if (!biter) return slutt(chunk, ...a);
    if (chunk && typeof chunk !== "function") biter.push(Buffer.from(chunk));
    const html = Buffer.concat(biter).toString("utf8");

    const ekstra = new Set();
    for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
      if (m[1].trim()) ekstra.add(`'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
    }
    const csp = ekstra.size
      ? lagSikkerhetsheadere([...SKRIPTHASHER, ...ekstra])["content-security-policy"]
      : null;

    biter = null;
    if (hodeArgs) {
      // Astro sender sine egne headere som andre argument til writeHead, og det
      // ERSTATTER alt vi har satt med setHeader. Derfor må CSP-en flettes inn i
      // nettopp det objektet – ikke settes ved siden av. Uten dette fikk /kontakt
      // bare temaskriptets hash, og tre skript ble blokkert.
      const [status, ...rest] = hodeArgs;
      const hodeObj = rest.find((x) => x && typeof x === "object") ?? {};
      if (csp) hodeObj["content-security-policy"] = csp;
      hodeObj["content-length"] = Buffer.byteLength(html);
      skrivHode(status, hodeObj);
    } else {
      if (csp) res.setHeader("content-security-policy", csp);
      res.setHeader("content-length", Buffer.byteLength(html));
    }
    return slutt(html);
  };

  return res;
}

/**
 * Varige 301-er for sider vi har fjernet.
 *
 * `/historie` ble slettet 7. oktober 2026: siden var en KI-generert film av
 * lagstabelen, og lagstabelen står ekte og interaktiv på forsiden og /om.
 * Brandbokens rangordning setter generert materiale utenfor listen, og CLAUDE.md
 * forbyr både KI-genererte bilder og scroll-jacking – siden var begge deler.
 * Den lå i sitemap med prioritet 0,6, så den kan være indeksert og lenket utenfra.
 * 301 i stedet for 404: lenkeverdien hører hjemme på /nettsider, som svarer på
 * nøyaktig det /historie lovte («Fire krav vi setter selv», «Hva det er bygget av»).
 *
 * Nøklene står UTEN etterfølgende skråstrek; oppslaget normaliserer bort både den
 * og spørrestrengen, slik at /historie, /historie/ og /historie?x=1 treffer likt.
 */
const FLYTTET = {
  "/historie": "/nettsider",
};

const server = createServer(async (req, res) => {
  settHeadere(res);

  if (req.method !== "GET" && req.method !== "HEAD") return astro(req, res, () => ikkeFunnet(res));

  const baneUtenSpoersmaal = (req.url ?? "/").split("?")[0];
  const nyBane = FLYTTET[baneUtenSpoersmaal.replace(/\/+$/, "") || "/"];
  if (nyBane) {
    res.writeHead(301, { location: nyBane, "content-type": "text/plain; charset=utf-8" });
    return void res.end(`301 ${nyBane}`);
  }

  const sti = trygg(req.url ?? "/");
  if (sti) {
    const funn = await finnFil(sti);
    if (funn) {
      try {
        return await serverFil(req, res, funn);
      } catch {
        /* faller gjennom til Astro */
      }
    }
  }

  // Serverrendret HTML får CSP beregnet av sitt eget innhold.
  const svar = medSsrCsp(res);
  astro(req, svar, () => ikkeFunnet(svar));
});

async function ikkeFunnet(res) {
  try {
    const html = await readFile(path.join(ROT, "404.html"));
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.writeHead(404);
    res.end(html);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
  }
}

server.listen(PORT, HOST, () => {
  console.log(`kodekonsulentene lytter på http://${HOST}:${PORT}`);
});

// Fly stopper maskiner med SIGTERM. Lukk pent, ellers kuttes svar midt i.
for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, () => {
    console.log(`${sig} – stopper`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10_000).unref();
  });
}
