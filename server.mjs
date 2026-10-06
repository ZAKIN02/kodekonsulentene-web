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
import { inlineSkriptHasher, lagSikkerhetsheadere } from "./sikkerhet.mjs";

const brotli = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

const ROT = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist", "client");

/**
 * CSP-en må kjenne hashen til hvert inline-skript Astro la i HTML-en. Regnes ut
 * én gang ved oppstart fra det ferdige bygget – ikke per forespørsel.
 */
const HEADERE = lagSikkerhetsheadere(inlineSkriptHasher(ROT));

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
  res.setHeader("content-type", type);
  res.setHeader(
    "cache-control",
    funn.sti.includes(`${path.sep}_astro${path.sep}`)
      ? "public, max-age=31536000, immutable"
      : ext === ".html"
        ? "public, max-age=0, must-revalidate"
        : "public, max-age=3600",
  );

  const etag = `W/"${funn.storrelse}-${funn.endret.getTime().toString(36)}"`;
  res.setHeader("etag", etag);
  if (req.headers["if-none-match"] === etag) {
    res.writeHead(304).end();
    return;
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

const server = createServer(async (req, res) => {
  settHeadere(res);

  if (req.method !== "GET" && req.method !== "HEAD") return astro(req, res, () => ikkeFunnet(res));

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

  astro(req, res, () => ikkeFunnet(res));
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
