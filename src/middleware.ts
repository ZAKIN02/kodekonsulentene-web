/**
 * Sikkerhetsheadere på svar som rendres av Astro.
 *
 * I drift er det server.mjs som setter headerne på alt, inkludert de prerendrede
 * HTML-filene. Denne middlewaren finnes fordi `astro dev` ikke går gjennom server.mjs:
 * uten den ville utviklingsserveren vist en side uten headere, og da hadde feilen
 * blitt oppdaget først i produksjon. Begge leser samme liste fra sikkerhet.mjs.
 */
import { SIKKERHETSHEADERE } from "../sikkerhet.mjs";

// CSP settes IKKE her. Hashene for inline-skript kjennes først når HTML-en er
// ferdig, og det vet bare serveren. Satte middlewaren den også, vant den – med
// bare temaskriptets hash – og tre skript ble blokkert på /kontakt, den eneste
// serverrendrede siden. Serveren eier CSP; middlewaren eier resten.
const { "content-security-policy": _csp, ...UTEN_CSP } = SIKKERHETSHEADERE;

export const onRequest = async (
  _ctx: unknown,
  next: () => Promise<Response>,
): Promise<Response> => {
  const svar = await next();
  for (const [navn, verdi] of Object.entries(UTEN_CSP)) svar.headers.set(navn, verdi);
  return svar;
};
