/**
 * Sikkerhetsheaderne og temaskriptet – ett sted, delt av fire.
 *
 * Filen ligger på rota og er ren JavaScript med vilje: den importeres både av
 * src/middleware.ts (gjennom Astro/Vite), av server.mjs (rå Node, uten byggesteg),
 * av src/layouts/Base.astro og av testene. Lå den i src/, måtte server.mjs hatt sin
 * egen kopi, og da ville de to drevet fra hverandre første gang noen endret én av dem.
 *
 * Dette er ikke pynt: siden selger nettsidesjekken, og sjekken teller nøyaktig de seks
 * headerne under. Består ikke kodekonsulentene.no sin egen sjekk med 6/6, er produktet usant.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

/**
 * Temavalget må settes før første maling, ellers blinker siden hvitt.
 * Base.astro skriver denne teksten inn i <head>, og CSP-en under inneholder SHA-256 av
 * nøyaktig den samme strengen. Endrer du skriptet, følger hashen med av seg selv.
 */
export const TEMA_SCRIPT = `try {
  var v = localStorage.getItem("kk-tema");
  if (v === "light" || v === "dark") document.documentElement.dataset.theme = v;
  else if (window.matchMedia("(prefers-color-scheme: light)").matches)
    document.documentElement.dataset.theme = "light";
} catch (e) {}`;

const temaHash = `'sha256-${createHash("sha256").update(TEMA_SCRIPT, "utf8").digest("base64")}'`;

/**
 * Merk om style-src: siden bygges med `inlineStylesheets: "always"`, så CSS-en ligger i
 * <style>-blokker i HTML-en. Det krever 'unsafe-inline' for stiler. Script-src er til
 * gjengjeld streng – ingen 'unsafe-inline', bare 'self' og én hash for temaskriptet.
 * Bytteforholdet er bevisst: CSS-injeksjon er en mindre risiko enn skriptinjeksjon, og
 * alternativet er en blokkerende CSS-forespørsel i hver eneste sidelasting.
 */
const CSP_BASIS = (skriptKilder) => [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  // Scroll-historien spiller video fra eget domene. default-src dekker det, men
  // eksplisitt media-src gjør det tydelig for den som leser headeren i en revisjon.
  "media-src 'self'",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' ${skriptKilder.join(" ")}`,
  "connect-src 'self'",
  // Cal.com-innbyggingen på /kontakt. Står her og ingen andre steder.
  "frame-src https://cal.com https://app.cal.com",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const PERMISSIONS = [
  "accelerometer=()", "autoplay=()", "camera=()", "display-capture=()",
  "encrypted-media=()", "fullscreen=(self)", "geolocation=()", "gyroscope=()",
  "magnetometer=()", "microphone=()", "midi=()", "payment=()", "usb=()",
  "xr-spatial-tracking=()", "browsing-topics=()",
].join(", ");

/**
 * Hasher for inline-skript.
 *
 * Astro legger små `<script type="module">` rett i HTML-en i stedet for å lage en
 * fil av dem. CSP-en vår har ingen 'unsafe-inline', så uten hash blir de BLOKKERT –
 * og det skjedde: scroll-historien og temabryteren kjørte aldri i produksjon, mens
 * alle tester var grønne. Ingenting feiler synlig når et skript stoppes av CSP.
 *
 * Derfor leses hashene ut av det ferdige bygget ved oppstart. Legger noen til et
 * nytt inline-skript, følger hashen med av seg selv ved neste deploy.
 */
export function inlineSkriptHasher(rot) {
  const hasher = new Set();
  const gaa = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) gaa(full);
      else if (e.name.endsWith(".html")) {
        const html = readFileSync(full, "utf8");
        // type="application/ld+json" er DATA, ikke kjoerbar kode, og trenger ingen hash.
      // Da strukturerte data ble lagt inn doblet CSP-headeren seg paa hvert eneste svar:
      // 1591 -> 2887 byte, 23 -> 47 hasher. Verifisert at utelating er trygt – en server
      // med CSP uten dem ga 0 brudd, og inline-skriptene kjoerte fortsatt.
      for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
          if (m[1].trim()) hasher.add(`'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
        }
      }
    }
  };
  try {
    gaa(rot);
  } catch {
    // Finnes ikke bygget, faller vi tilbake på temaskriptet alene.
  }
  return [...hasher];
}

/** Settes på hvert eneste svar – statisk fil, API-rute og 404. */
export function lagSikkerhetsheadere(skriptHasher = []) {
  const kilder = [...new Set([temaHash, ...skriptHasher])];
  return { ...SIKKERHETSHEADERE, "content-security-policy": CSP_BASIS(kilder) };
}

export const SIKKERHETSHEADERE = {
  "content-security-policy": CSP_BASIS([temaHash]),
  // To år, med underdomener. Vår egen sjekk krever minst seks måneder.
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": PERMISSIONS,
  "x-frame-options": "DENY",
  "cross-origin-opener-policy": "same-origin",
  "x-dns-prefetch-control": "off",
};
