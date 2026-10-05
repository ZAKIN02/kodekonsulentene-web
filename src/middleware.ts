/**
 * Sikkerhetsheadere på svar som rendres av Astro.
 *
 * I drift er det server.mjs som setter headerne på alt, inkludert de prerendrede
 * HTML-filene. Denne middlewaren finnes fordi `astro dev` ikke går gjennom server.mjs:
 * uten den ville utviklingsserveren vist en side uten headere, og da hadde feilen
 * blitt oppdaget først i produksjon. Begge leser samme liste fra sikkerhet.mjs.
 */
import { SIKKERHETSHEADERE } from "../sikkerhet.mjs";

export const onRequest = async (
  _ctx: unknown,
  next: () => Promise<Response>,
): Promise<Response> => {
  const svar = await next();
  for (const [navn, verdi] of Object.entries(SIKKERHETSHEADERE)) svar.headers.set(navn, verdi);
  return svar;
};
