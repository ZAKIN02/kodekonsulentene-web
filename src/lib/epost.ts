/**
 * Transaksjons-e-post via Resend. E-postversjonen av rapporten bruker samme
 * rekkefølge og ordlyd som siden – det er regelen i docs/sidemonstre.md.
 */
import type { Rapport } from "./sjekk";

export interface EpostNokler { apiKey: string; fra: string; kopi?: string }

export async function sendRapport(til: string, rapport: Rapport, n: EpostNokler): Promise<boolean> {
  const rader = rapport.rader
    .map((r) => {
      const ord = { ok: "Bestått", warn: "Bør fikses", fail: "Brudd", neutral: "Ikke sjekket" }[r.status];
      return `${r.name}\n  ${ord} · ${r.value}\n  ${r.note}`;
    })
    .join("\n\n");

  const tekst = [
    `Nettsidesjekk for ${rapport.url}`,
    `Kjørt ${rapport.dato}. Samlet: ${rapport.totalt} av 100.`,
    "",
    rader,
    "",
    "Forbehold",
    ...rapport.forbehold.map((f) => `- ${f}`),
    "",
    "Vil du at vi skal fikse det som står her, tar det vanligvis to til fire timer.",
    "Lovsjekk-pakken er 7 900 kr eks. mva og dekker alt sammen til fast pris.",
    "",
    "KodeKonsulentene",
    "https://kodekonsulentene.no",
  ].join("\n");

  return send(
    { til, emne: `Nettsidesjekk: ${rapport.url} – ${rapport.totalt}/100`, tekst, svarTil: undefined },
    n,
  );
}

export async function sendHenvendelse(
  felt: { navn: string; epost: string; nettside?: string; melding: string },
  n: EpostNokler,
): Promise<boolean> {
  const tekst = [
    `Navn: ${felt.navn}`,
    `E-post: ${felt.epost}`,
    `Nettside i dag: ${felt.nettside || "—"}`,
    "",
    felt.melding,
  ].join("\n");

  return send(
    { til: n.kopi ?? n.fra, emne: `Henvendelse fra ${felt.navn}`, tekst, svarTil: felt.epost },
    n,
  );
}

async function send(
  m: { til: string; emne: string; tekst: string; svarTil?: string },
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
        ...(m.svarTil ? { reply_to: m.svarTil } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return svar.ok;
  } catch {
    return false;
  }
}
