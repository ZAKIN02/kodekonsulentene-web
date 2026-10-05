/**
 * POST /api/kontakt – skjemaet i ContactBlock.
 *
 * Tar imot både vanlig skjema-innsending (uten JavaScript) og fetch med JSON.
 * Uten RESEND_API_KEY logges henvendelsen og brukeren får beskjed om å sende
 * e-post i stedet – aldri en falsk «takk, vi har mottatt».
 */
import type { APIRoute } from "astro";
import { hentEnv } from "../../lib/env";
import { sendHenvendelse } from "../../lib/epost";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const type = request.headers.get("content-type") ?? "";
  const vilJson = /application\/json/i.test(request.headers.get("accept") ?? "");

  let felt: Record<string, string> = {};
  if (/application\/json/i.test(type)) {
    felt = (await request.json().catch(() => ({}))) as Record<string, string>;
  } else {
    const data = await request.formData();
    for (const [k, v] of data.entries()) if (typeof v === "string") felt[k] = v;
  }

  const navn = (felt.navn ?? "").trim();
  const epost = (felt.epost ?? "").trim();
  const melding = (felt.melding ?? "").trim();
  const nettside = (felt.nettside ?? "").trim();

  if (!navn || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(epost) || melding.length < 5) {
    const feil = "Fyll ut navn, en gyldig e-postadresse og hva du trenger hjelp til.";
    return vilJson
      ? new Response(JSON.stringify({ feil }), { status: 400, headers: { "content-type": "application/json" } })
      : redirect("/kontakt?feil=1", 303);
  }

  const nokkel = hentEnv("RESEND_API_KEY");
  const sendt = nokkel
    ? await sendHenvendelse(
        { navn, epost, nettside, melding },
        {
          apiKey: nokkel,
          fra: hentEnv("RAPPORT_FRA") ?? "rapport@kodekonsulentene.no",
          kopi: hentEnv("RAPPORT_KOPI"),
        },
      )
    : false;

  if (vilJson) {
    return new Response(JSON.stringify({ sendt }), {
      status: sendt ? 200 : 502,
      headers: { "content-type": "application/json" },
    });
  }
  return redirect(sendt ? "/kontakt?sendt=1" : "/kontakt?feil=2", 303);
};
