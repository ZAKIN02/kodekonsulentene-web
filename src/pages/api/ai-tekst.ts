/**
 * POST /api/ai-tekst – skriver om nettsidetekst med Claude.
 *
 * Dette er den ene flaten på nettstedet der en besøkende får kjøre AI selv, uten
 * innlogging. Den er modellert etter /api/sjekk: ett endepunkt, alt på serveren,
 * ingenting lagret, og et svar som aldri påstår mer enn det har.
 *
 * TRE SVARFORMER, bestemt av hva klienten ber om:
 *
 *   1. `accept: text/event-stream`  → Server-Sent Events. Dette er normalveien.
 *      Svaret kommer tegn for tegn mens modellen skriver, og det er HELE poenget:
 *      en kunde skal se at noe faktisk arbeider, ikke se en spinner i tolv sekunder.
 *   2. `accept: application/json`   → hele svaret i én JSON. Til feilsøking.
 *   3. vanlig skjema-innsending     → en komplett HTML-side med resultatet.
 *      Dette er no-JS-varianten, og den er bindende: skjemaet i AiTekst.astro er
 *      et ekte `<form method="post">`, og virker uten en linje JavaScript.
 *
 * HEMMELIGHETEN ligger ikke i repoet. Repoet er offentlig. Nøkkelen settes med
 * `fly secrets set ANTHROPIC_API_KEY=...` og leses med `hentEnv`, akkurat som
 * RESEND_API_KEY og PAGESPEED_API_KEY. Mangler den, sier funksjonen det rett ut
 * i grensesnittet – den later aldri som den har svart.
 *
 * KALLET GÅR HERFRA, fra serveren. Nøkkelen er aldri i nærheten av nettleseren.
 */
import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import { erEgetOpphav } from "../../lib/opphav";
import { hentEnv } from "../../lib/env";
import { firma } from "../../data/firma";
import {
  MAKS_UT_TOKENS, STANDARD_MODELL, STANDARD_TAK, SYSTEM,
  byggMelding, erBrukbart, finnIp, lagKvote, tolkSvar, validerTekst,
  type Forslag, type Kvotetak,
} from "../../lib/ai-tekst";

// Tokens-filen leses inn som tekst slik at HTML-fallbacken under kan bruke de
// EKTE fargene og avstandene i stedet for en håndskrevet kopi. Brandboken
// forbyr hardkodede verdier, og et fallback-svar er ikke unntatt fra den regelen.
import tokensCss from "../../styles/tokens.css?raw";

export const prerender = false;

/** Overstyrbare tak, slik at eieren kan skru ned beløpet uten en ny deploy. */
const tall = (navn: keyof Env, standard: number) => {
  const v = hentEnv(navn);
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : standard;
};

const TAK: Kvotetak = {
  ...STANDARD_TAK,
  perIp: tall("AI_PER_IP", STANDARD_TAK.perIp),
  ipDogn: tall("AI_IP_DOGN", STANDARD_TAK.ipDogn),
  dognTak: tall("AI_DOGNTAK", STANDARD_TAK.dognTak),
};

/**
 * Kvoten lever i modulens omfang, altså så lenge prosessen lever. Se
 * `lagKvote` i src/lib/ai-tekst.ts for hva den IKKE dekker (flere maskiner).
 */
const kvote = lagKvote(TAK);

const MODELL = hentEnv("CLAUDE_MODELL") ?? STANDARD_MODELL;

const INGEN_NOKKEL =
  "AI-funksjonen er ikke skrudd på her ennå – nøkkelen til Claude mangler på serveren. " +
  `Ingenting ble sendt noe sted. Send gjerne teksten til ${firma.epost}, så kjører vi den selv.`;

/** Oversetter en feil fra API-et til én setning en bedriftseier forstår. */
function lesFeil(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
    return "Nøkkelen til AI-tjenesten ble avvist. Det er vår feil, ikke din – vi får beskjed.";
  }
  if (e instanceof Anthropic.RateLimitError) {
    return "AI-tjenesten tar imot mange forespørsler akkurat nå. Prøv igjen om et minutt.";
  }
  if (e instanceof Anthropic.APIConnectionError) {
    return "Fikk ikke kontakt med AI-tjenesten. Prøv igjen om et øyeblikk.";
  }
  if (e instanceof Anthropic.APIError) {
    return e.status && e.status >= 500
      ? "AI-tjenesten er overbelastet akkurat nå. Prøv igjen om et minutt."
      : "AI-tjenesten avviste forespørselen. Vi ser på det.";
  }
  return "Klarte ikke å skrive om teksten nå.";
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    // Svaret er unikt per innsending og skal aldri bufres av noen.
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

/** Leser `tekst` fra JSON, skjema eller spørrestreng – uten å bry seg om hvilken. */
async function hentFelt(request: Request): Promise<{ tekst: unknown; vilJson: boolean; vilStrom: boolean }> {
  const accept = request.headers.get("accept") ?? "";
  const vilStrom = /text\/event-stream/i.test(accept);
  const type = request.headers.get("content-type") ?? "";
  if (/application\/json/i.test(type)) {
    const kropp = (await request.json().catch(() => ({}))) as { tekst?: unknown };
    return { tekst: kropp.tekst, vilJson: true, vilStrom };
  }
  const data = await request.formData().catch(() => new FormData());
  return { tekst: data.get("tekst"), vilJson: /application\/json/i.test(accept), vilStrom };
}

/** Ett kall, uten strøm. Brukes av JSON- og HTML-svarene. */
async function kjorSamlet(klient: Anthropic, tekst: string, signal: AbortSignal) {
  const svar = await klient.messages.create(
    {
      model: MODELL,
      max_tokens: MAKS_UT_TOKENS,
      system: SYSTEM,
      messages: [{ role: "user", content: byggMelding(tekst) }],
    },
    { signal },
  );
  const raa = svar.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return { raa, forslag: tolkSvar(raa), stopp: svar.stop_reason };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // CSRF: se src/lib/opphav.ts. Astros egen checkOrigin kan ikke virke bak proxyen.
  if (!erEgetOpphav(request)) {
    return new Response("Forespørselen kom fra et annet nettsted.", { status: 403 });
  }

  const { tekst, vilJson, vilStrom } = await hentFelt(request);
  const gyldig = validerTekst(tekst);

  const svarFeil = (feil: string, status: number, etter?: number) => {
    if (vilStrom) return sseFeil(feil, etter);
    if (vilJson) return json({ feil }, status);
    return htmlSide({ feil }, status, etter);
  };

  if (!gyldig.ok) return svarFeil(gyldig.feil, 400);

  // Kvoten sjekkes FØR nøkkelen, slik at en tom konfigurasjon ikke kan brukes
  // til å kartlegge om nøkkelen finnes ved å telle responstider.
  const kvotesvar = kvote.forsok(finnIp(request.headers, clientAddress));
  if (!kvotesvar.ok) return svarFeil(kvotesvar.feil, kvotesvar.status, kvotesvar.etter);

  const nokkel = hentEnv("ANTHROPIC_API_KEY");
  if (!nokkel) return svarFeil(INGEN_NOKKEL, 503);

  const klient = new Anthropic({ apiKey: nokkel, maxRetries: 1 });

  if (vilStrom) return sseSvar(klient, gyldig.tekst, request.signal);

  try {
    const { raa, forslag } = await kjorSamlet(klient, gyldig.tekst, request.signal);
    if (vilJson) return json({ modell: MODELL, forslag, raa });
    if (!erBrukbart(forslag)) {
      return htmlSide({ feil: "Modellen svarte i et format vi ikke kjente igjen. Prøv en gang til." }, 502);
    }
    return htmlSide({ forslag });
  } catch (e) {
    const feil = lesFeil(e);
    return vilJson ? json({ feil }, 502) : htmlSide({ feil }, 502);
  }
};

// ---------------------------------------------------------------------------
// Strømmen
// ---------------------------------------------------------------------------

const SSE_HODER = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-store, no-transform",
  connection: "keep-alive",
  // Proxyer som buffrer tar livet av poenget: da kommer alt i én klump på slutten.
  // Fly-proxyen buffrer ikke, men headeren koster ingenting og dekker Nginx-aktige
  // mellomledd hvis nettstedet en dag står bak et.
  "x-accel-buffering": "no",
};

const bit = (o: unknown) => `data: ${JSON.stringify(o)}\n\n`;

/** En feil som kom før strømmen rakk å starte, levert i samme format som resten. */
function sseFeil(feil: string, etter?: number): Response {
  return new Response(bit({ t: "feil", v: feil, etter }), { status: 200, headers: SSE_HODER });
}

function sseSvar(klient: Anthropic, tekst: string, signal: AbortSignal): Response {
  const enc = new TextEncoder();

  const strom = new ReadableStream<Uint8Array>({
    async start(k) {
      let apen = true;
      const send = (o: unknown) => {
        if (!apen) return;
        try {
          k.enqueue(enc.encode(bit(o)));
        } catch {
          // Nettleseren har lagt på. Slutt å skrive, og la avbruddet under
          // stoppe modellkallet i stedet for å betale for resten av svaret.
          apen = false;
        }
      };

      const strommen = klient.messages.stream(
        {
          model: MODELL,
          max_tokens: MAKS_UT_TOKENS,
          system: SYSTEM,
          messages: [{ role: "user", content: byggMelding(tekst) }],
        },
        { signal },
      );

      try {
        send({ t: "start", modell: MODELL });
        for await (const h of strommen) {
          if (!apen) break;
          if (h.type === "content_block_delta" && h.delta.type === "text_delta") {
            send({ t: "tekst", v: h.delta.text });
          }
        }
        if (apen) {
          const ferdig = await strommen.finalMessage();
          send({
            t: "ferdig",
            stopp: ferdig.stop_reason,
            inn: ferdig.usage.input_tokens,
            ut: ferdig.usage.output_tokens,
          });
        }
      } catch (e) {
        send({ t: "feil", v: lesFeil(e) });
      } finally {
        if (!apen) strommen.abort();
        try {
          k.close();
        } catch {
          /* allerede lukket */
        }
      }
    },
    cancel() {
      // Leseren ga opp. `start` oppdager det på neste enqueue og avbryter kallet.
    },
  });

  return new Response(strom, { status: 200, headers: SSE_HODER });
}

// ---------------------------------------------------------------------------
// HTML uten JavaScript
// ---------------------------------------------------------------------------

const esc = (s: unknown) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Hele svaret som en selvstendig HTML-side.
 *
 * Hvorfor en egen side og ikke /apper-og-ai på nytt: siden er prerendret og
 * ligger i dist/client. Skulle den tatt imot POST, måtte hele markedssiden blitt
 * serverrendret – og da faller den ut av den statiske leveringen, ut av
 * `test/bygget-html.test.ts` sin gjennomgang av bygget HTML, og inn i en
 * langsommere vei for alle som bare leser den. Prisen for det er høyere enn
 * gevinsten for de få som har JavaScript av.
 *
 * Stilen kommer fra den EKTE tokens-filen, lest inn over. Ingen farge, avstand
 * eller radius er skrevet av her.
 */
function htmlSide(
  data: { forslag?: Forslag; feil?: string },
  status = 200,
  etter?: number,
): Response {
  const f = data.forslag;
  const kropp = data.feil
    ? `<div class="kort kort--feil">
         <p class="sterk">Omskrivingen stoppet.</p>
         <p class="dempet">${esc(data.feil)}</p>
         ${etter ? `<p class="dempet mono">Prøv igjen om ${esc(etter)} sekunder.</p>` : ""}
       </div>`
    : f?.avvist
      ? `<div class="kort">
           <p class="sterk">Ikke nok å gå på.</p>
           <p class="dempet">${esc(f.avvist)}</p>
         </div>`
      : `<div class="kort">
           <p class="merke mono">Forslag</p>
           <h2>${esc(f?.tittel ?? "")}</h2>
           <p class="dempet">${esc(f?.ingress ?? "")}</p>
           <ul>${(f?.punkter ?? []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
           <p class="knapp">${esc(f?.knapp ?? "")}</p>
         </div>
         <div class="kort kort--innfelt">
           <p class="merke mono">Hva som ble endret, og hvorfor</p>
           <ul>${(f?.grep ?? []).map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
         </div>`;

  const html = `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Omskrevet tekst – ${esc(firma.navn)}</title>
<style>
${tokensCss}
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0; padding: var(--space-7) var(--space-5);
  background: var(--bg); color: var(--ink);
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 16px; line-height: 26px;
}
main { max-width: 42rem; margin: 0 auto; display: grid; gap: var(--space-5); }
h1 { font-size: 28px; line-height: 32px; margin: 0; letter-spacing: -0.02em; }
h2 { font-size: 24px; line-height: 30px; margin: 0; letter-spacing: -0.02em; }
.kort {
  background: var(--bg-raised); border: var(--hairline, 1px) solid var(--line);
  border-radius: var(--radius-md); padding: var(--space-5);
  display: grid; gap: var(--space-4);
}
.kort--innfelt { background: var(--bg-sunken); }
.kort--feil { border-color: var(--warn); }
.mono { font-family: var(--font-mono, ui-monospace, monospace); }
.merke { margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); }
.dempet { color: var(--ink-muted); margin: 0; }
.liten { font-size: 14px; line-height: 20px; color: var(--ink-faint); margin: 0; }
.sterk { font-weight: 600; margin: 0; }
ul { margin: 0; padding-left: var(--space-5); display: grid; gap: var(--space-2); color: var(--ink-muted); }
.knapp {
  margin: 0; justify-self: start; padding: var(--space-3) var(--space-5);
  background: var(--accent); color: var(--on-accent);
  border-radius: var(--radius-sm); font-weight: 600;
}
a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--line-strong); }
a:focus-visible { outline: var(--focus-width, 2px) solid var(--focus); outline-offset: 2px; }
</style>
</head>
<body>
<main>
  <h1>Teksten din, skrevet om</h1>
  <p class="dempet">
    Skrevet av Claude, kjørt på vår egen server. Teksten du limte inn er ikke lagret.
    Dette er forslag, ikke en fasit – og ingen tall eller påstander skal stå der uten at du kjenner dem igjen.
  </p>
  ${kropp}
  <p class="dempet"><a href="/apper-og-ai#ai-demo">Tilbake til Apper og AI</a> · <a href="/kontakt">Snakk med oss om det</a></p>
  <p class="liten mono">Denne siden kom uten JavaScript. Med JavaScript på skrives svaret inn mens modellen jobber.</p>
</main>
</body>
</html>`;

  const hoder: Record<string, string> = {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    // Siden er et svar på en innsending, ikke innhold vi vil indeksere.
    "x-robots-tag": "noindex",
  };
  if (etter) hoder["retry-after"] = String(etter);
  return new Response(html, { status, headers: hoder });
}
