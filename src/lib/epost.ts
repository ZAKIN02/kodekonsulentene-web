/**
 * Transaksjons-e-post via Resend. E-postversjonen av rapporten bruker samme
 * rekkefølge og ordlyd som siden – det er regelen i docs/sidemonstre.md.
 *
 * Malene ligger i epostmal.ts. Hver sending har BÅDE html og text: en e-post
 * uten tekstdel havner oftere i søppelpost, og tekstdelen er dessuten det
 * eneste som er garantert lesbart i alle klienter.
 */
import type { Rapport } from "./sjekk";
import {
  rapportHtml, rapportTekst,
  henvendelseHtml, henvendelseTekst,
  type Henvendelse,
} from "./epostmal";

export interface EpostNokler { apiKey: string; fra: string; kopi?: string }

export async function sendRapport(til: string, rapport: Rapport, n: EpostNokler): Promise<boolean> {
  return send(
    {
      til,
      emne: `Nettsidesjekk: ${rapport.url} – ${rapport.totalt}/100`,
      tekst: rapportTekst(rapport),
      html: rapportHtml(rapport),
    },
    n,
  );
}

export async function sendHenvendelse(felt: Henvendelse, n: EpostNokler): Promise<boolean> {
  return send(
    {
      til: n.kopi ?? n.fra,
      emne: `Henvendelse fra ${felt.navn}`,
      tekst: henvendelseTekst(felt),
      html: henvendelseHtml(felt),
      svarTil: felt.epost,
    },
    n,
  );
}

async function send(
  m: { til: string; emne: string; tekst: string; html?: string; svarTil?: string },
  n: EpostNokler,
): Promise<boolean> {
  try {
    const svar = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${n.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: `KodeKonsulentene <${n.fra}>`,
        to: [m.til],
        subject: m.emne,
        text: m.tekst,
        ...(m.html ? { html: m.html } : {}),
        ...(m.svarTil ? { reply_to: m.svarTil } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return svar.ok;
  } catch {
    return false;
  }
}
