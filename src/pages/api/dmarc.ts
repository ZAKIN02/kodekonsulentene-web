/**
 * POST /api/dmarc  { domene: string, dkim?: string }
 * GET  /api/dmarc?domene=…&dkim=…     (samme svar – praktisk til curl og CLI)
 *
 * Leser SPF, DKIM og DMARC fra DNS. Sender ingen e-post og logger ingenting.
 * Svarer alltid JSON; feil kommer som { feil: "<setning til brukeren>" }.
 */
import type { APIRoute } from "astro";
import { erEgetOpphav } from "../../lib/opphav";
import { normaliserDomene, hentEpostoppsett, byggEpostRapport } from "../../lib/dns";
import { formaterDato } from "../../lib/sjekk";

export const prerender = false;

const svar = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // DNS-poster endrer seg sjelden, men en fersk sjekk skal fortsatt være fersk.
      "cache-control": status === 200 ? "public, max-age=120" : "no-store",
    },
  });

/** DKIM-selektorer er korte navn i DNS. Vi slipper bare gjennom det som kan være et. */
function rensSelektor(s: string | null | undefined): string | undefined {
  if (!s) return undefined;
  const ren = s.trim().toLowerCase();
  return /^[a-z0-9]([a-z0-9._-]{0,62}[a-z0-9])?$/.test(ren) ? ren : undefined;
}

async function kjor(raaDomene: string, dkim: string | undefined) {
  let domene: string;
  try {
    domene = normaliserDomene(raaDomene);
  } catch (e) {
    return svar({ feil: e instanceof Error ? e.message : "Ugyldig domene." }, 400);
  }

  try {
    const oppsett = await hentEpostoppsett(domene, rensSelektor(dkim));
    return svar(byggEpostRapport({ domene, dato: formaterDato(new Date()), ...oppsett }));
  } catch {
    return svar({ feil: "Klarte ikke å slå opp DNS for domenet. Prøv igjen om et øyeblikk." }, 502);
  }
}

export const POST: APIRoute = async ({ request }) => {
  // CSRF: se src/lib/opphav.ts. Astros egen kontroll kan ikke virke bak proxyen.
  if (!erEgetOpphav(request)) {
    return new Response("Forespørselen kom fra et annet nettsted.", { status: 403 });
  }

  let kropp: { domene?: unknown; dkim?: unknown } = {};
  try {
    kropp = (await request.json()) as typeof kropp;
  } catch {
    return svar({ feil: "Forventet JSON." }, 400);
  }
  if (typeof kropp.domene !== "string") return svar({ feil: "Skriv inn et domene." }, 400);
  return kjor(kropp.domene, typeof kropp.dkim === "string" ? kropp.dkim : undefined);
};

export const GET: APIRoute = async ({ url }) => {
  const d = url.searchParams.get("domene");
  if (!d) return svar({ feil: "Mangler ?domene=" }, 400);
  return kjor(d, url.searchParams.get("dkim") ?? undefined);
};
