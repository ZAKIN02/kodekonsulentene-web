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
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  // Scroll-historien spiller video fra eget domene. default-src dekker det, men
  // eksplisitt media-src gjør det tydelig for den som leser headeren i en revisjon.
  "media-src 'self'",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `script-src 'self' ${temaHash}`,
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

/** Settes på hvert eneste svar – statisk fil, API-rute og 404. */
export const SIKKERHETSHEADERE = {
  "content-security-policy": CSP,
  // To år, med underdomener. Vår egen sjekk krever minst seks måneder.
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": PERMISSIONS,
  "x-frame-options": "DENY",
  "cross-origin-opener-policy": "same-origin",
  "x-dns-prefetch-control": "off",
};
