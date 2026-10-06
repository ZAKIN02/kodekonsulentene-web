/**
 * HTML-maler for transaksjons-e-post.
 *
 * HTML-e-post er ikke HTML. Reglene som styrer alt her:
 *
 *  - Tabellayout og inline stiler. Gmail stripper <head> helt, så alt som må
 *    virke skal stå på elementet. <style>-blokken under er bare progressiv
 *    forbedring (mobil og lenkefarge), aldri noe innholdet er avhengig av.
 *  - Ingen nettfonter. Schibsted Grotesk og JetBrains Mono finnes ikke i
 *    e-post. Systemstabler under; monospace er viktig fordi tallene i
 *    rapporten skal flukte loddrett.
 *  - Ingen SVG. Logoen er PNG i 2x, med bakgrunnen bakt inn så gjennomsiktighet
 *    ikke kan slå feil i en klient som inverterer.
 *  - Lys mal, ikke mørk. Se docs/epost.md for målingen bak det valget.
 *  - Alt har en ren tekstvariant. Resend tar `text` ved siden av `html`, og en
 *    e-post uten tekstdel havner oftere i søppelpost.
 */
import type { Rapport, Status } from "./sjekk";
// Eksplisitt .ts: Node 22 sin type-stripping krever endelsen, og Vite godtar
// den. Da kan malen bygges og ses på med bare node, uten å starte Astro.
import { firma } from "../data/firma.ts";

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

/* Lyst tema fra tokens.css. Statusfargene her er de LYSE variantene, som er
   laget for å lese 4,5:1 mot lys grunn. Å bruke de mørke temafargene på en lys
   flate er nøyaktig feilen som lå på vår egen forside: terminalflaten er mørk i
   begge temaer, men statusfargene byttet med temaet, så lyst tema malte mørk
   tekst på mørk flate ned i 2,96:1. */
const F = {
  grunn: "#f5f6f7",
  flate: "#ffffff",
  morkFlate: "#0b0d10",
  linje: "#dde1e6",
  blekk: "#14171b",
  dempet: "#4f5861",
  svak: "#5f6871",
  aksentTekst: "#3d6600",
  ok: "#0b7a6b",
  warn: "#8a5b00",
  fail: "#b42318",
  okMyk: "#d6f5ee",
  warnMyk: "#fdf0d2",
  failMyk: "#fde3e1",
  noytralMyk: "#e9ecef",
  lime: "#c8f24a",
} as const;

const ORD: Record<Status, string> = {
  ok: "Bestått",
  warn: "Bør fikses",
  fail: "Brudd",
  neutral: "Ikke sjekket",
};

const TEKSTFARGE: Record<Status, string> = {
  ok: F.ok, warn: F.warn, fail: F.fail, neutral: F.dempet,
};

const MERKEFLATE: Record<Status, string> = {
  ok: F.okMyk, warn: F.warnMyk, fail: F.failMyk, neutral: F.noytralMyk,
};

/**
 * Alt brukerinnhold må gjennom denne.
 *
 * Verdiene kommer fra et åpent skjema og fra nettadresser vi ikke eier. Uten
 * escaping kan en melding med < bryte markupen, og en e-postklient som kjører
 * noe av HTML-en er en reell angrepsflate.
 */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Skjult linje som mange klienter viser ved siden av emnet i innboksen. */
function forhandsvisning(tekst: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${F.flate};opacity:0">${esc(tekst)}</div>`;
}

function skall(innhold: string, forhand: string): string {
  return `<!doctype html>
<html lang="nb" style="margin:0;padding:0">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Vi ber uttrykkelig om LYST. Uten dette inverterer Apple Mail og Outlook på
     egne premisser, og en mal som er testet lys kan havne i en tilstand ingen
     har sett. -->
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
  :root { color-scheme: light; supported-color-schemes: light; }
  a { color: ${F.blekk}; }
  @media (max-width:620px) {
    .kk-pad { padding-left:20px !important; padding-right:20px !important; }
    .kk-rad-navn, .kk-rad-verdi { display:block !important; width:100% !important; text-align:left !important; padding-right:0 !important; }
    .kk-rad-verdi { padding-top:4px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${F.grunn};-webkit-text-size-adjust:100%">
${forhandsvisning(forhand)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${F.grunn}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:${F.flate};border:1px solid ${F.linje};border-radius:12px;overflow:hidden">
${innhold}
</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Logoen som LEVENDE TEKST, ikke bilde.
 *
 * To målte grunner, begge viktigere enn at formene er pikselidentiske med SVG-en:
 *
 *  1. Outlook og Gmail blokkerer eksterne bilder som standard. Et bilde-only
 *     merke betyr at mange mottakere ser en ødelagt plassholder som det aller
 *     første i e-posten.
 *  2. Under tvungen invertering ble PNG-en med bakt mørk bakgrunn til en svart
 *     klistrelapp på et lyst bånd – klienten inverterte båndet, men lot bildet
 *     stå. Tekst inverteres sammen med alt annet og overlever.
 *
 * bgcolor-attributtet står ved siden av inline style fordi eldre Outlook og
 * flere mørk modus-implementasjoner respekterer attributtet når de overstyrer
 * CSS-bakgrunnen.
 */
function topp(): string {
  return `<tr><td class="kk-pad" bgcolor="${F.morkFlate}" style="background:${F.morkFlate};padding:22px 32px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${F.lime}" style="background:${F.lime};border-radius:6px;padding:5px 7px;font-family:${SANS};font-size:15px;line-height:17px;font-weight:800;color:${F.blekk};letter-spacing:-0.02em">KK</td>
<td style="padding-left:10px;font-family:${SANS};font-size:17px;line-height:22px;font-weight:700;color:#e9ecef;letter-spacing:-0.01em;white-space:nowrap">${esc(firma.navn)}</td>
</tr></table>
</td></tr>`;
}

function bunn(ekstra?: string): string {
  return `<tr><td class="kk-pad" style="padding:24px 32px;background:${F.grunn};border-top:1px solid ${F.linje}">
<p style="margin:0 0 6px;font-family:${SANS};font-size:13px;line-height:19px;color:${F.dempet}">
<a href="${firma.url}" style="color:${F.blekk};text-decoration:underline">${esc(firma.navn)}</a> · ${esc(firma.foretaksnavn)} · org.nr. ${esc(firma.orgnr)} · ${esc(firma.adresse)}
</p>
${ekstra ?? ""}
</td></tr>`;
}

function rad(r: { name: string; status: Status; value: string; note: string }): string {
  return `<tr><td style="padding:14px 0;border-bottom:1px solid ${F.linje}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="kk-rad-navn" style="font-family:${SANS};font-size:15px;line-height:22px;color:${F.blekk};font-weight:600;padding-right:12px">${esc(r.name)}</td>
<td class="kk-rad-verdi" align="right" style="white-space:nowrap">
<span style="font-family:${MONO};font-size:14px;color:${F.blekk}">${esc(r.value)}</span>
<span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:${MERKEFLATE[r.status]};font-family:${SANS};font-size:12px;line-height:18px;font-weight:600;color:${TEKSTFARGE[r.status]}">${ORD[r.status]}</span>
</td>
</tr></table>
<p style="margin:6px 0 0;font-family:${SANS};font-size:14px;line-height:21px;color:${F.dempet}">${esc(r.note)}</p>
</td></tr>`;
}

/* ------------------------------------------------------------ Rapport ---- */

export function rapportHtml(rapport: Rapport): string {
  const rader = rapport.rader.map(rad).join("");
  const forbehold = rapport.forbehold
    .map((f) => `<li style="margin:0 0 6px">${esc(f)}</li>`)
    .join("");

  return skall(
    `${topp()}
<tr><td class="kk-pad" style="padding:32px 32px 8px">
<p style="margin:0 0 8px;font-family:${MONO};font-size:12px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${F.svak}">Nettsidesjekk</p>
<h1 style="margin:0 0 4px;font-family:${SANS};font-size:26px;line-height:32px;font-weight:700;color:${F.blekk}">${esc(rapport.url)}</h1>
<p style="margin:0;font-family:${SANS};font-size:14px;line-height:21px;color:${F.dempet}">Kjørt ${esc(rapport.dato)}</p>
</td></tr>

<tr><td class="kk-pad" style="padding:16px 32px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${F.grunn};border:1px solid ${F.linje};border-radius:8px">
<tr><td style="padding:16px 20px">
<span style="font-family:${MONO};font-size:34px;line-height:38px;font-weight:700;color:${F.blekk}">${rapport.totalt}</span>
<span style="font-family:${MONO};font-size:16px;color:${F.svak}">/100</span>
<span style="display:block;margin-top:2px;font-family:${SANS};font-size:13px;line-height:19px;color:${F.dempet}">Vår egen oppsummering av de fem punktene under. Ikke en Lighthouse-score.</span>
</td></tr>
</table>
</td></tr>

<tr><td class="kk-pad" style="padding:8px 32px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rader}</table>
</td></tr>

<tr><td class="kk-pad" style="padding:20px 32px 0">
<p style="margin:0 0 8px;font-family:${SANS};font-size:15px;line-height:22px;font-weight:600;color:${F.blekk}">Hva sjekken ikke kan se</p>
<ul style="margin:0;padding-left:20px;font-family:${SANS};font-size:13px;line-height:20px;color:${F.dempet}">${forbehold}</ul>
</td></tr>

<tr><td class="kk-pad" style="padding:20px 32px 28px">
<p style="margin:0;font-family:${SANS};font-size:14px;line-height:21px;color:${F.dempet}">
Vil du ha hjelp med punktene over, svar på denne e-posten – den går rett til oss.
Prisene står åpent på <a href="${firma.url}/priser" style="color:${F.blekk};text-decoration:underline">${firma.url.replace("https://", "")}/priser</a>.
</p>
</td></tr>

${bunn(
  `<p style="margin:0;font-family:${SANS};font-size:13px;line-height:19px;color:${F.svak}">Du får denne ene e-posten fordi du ba om en sjekk på ${esc(firma.url.replace("https://", ""))}. Vi legger deg ikke til i noen liste og sender ingen oppfølging.</p>`,
)}`,
    `${rapport.totalt} av 100 for ${rapport.url}. Fem punkter, med forbehold.`,
  );
}

export function rapportTekst(rapport: Rapport): string {
  const rader = rapport.rader
    .map((r) => `${r.name}\n  ${ORD[r.status]} · ${r.value}\n  ${r.note}`)
    .join("\n\n");

  return [
    `Nettsidesjekk for ${rapport.url}`,
    `Kjørt ${rapport.dato}. Samlet: ${rapport.totalt} av 100.`,
    "Tallet er vår egen oppsummering av de fem punktene under, ikke en Lighthouse-score.",
    "",
    rader,
    "",
    "Hva sjekken ikke kan se",
    ...rapport.forbehold.map((f) => `- ${f}`),
    "",
    "Vil du ha hjelp med punktene over, svar på denne e-posten – den går rett til oss.",
    `Prisene står åpent på ${firma.url}/priser.`,
    "",
    `Du får denne ene e-posten fordi du ba om en sjekk på ${firma.url.replace("https://", "")}.`,
    "Vi legger deg ikke til i noen liste og sender ingen oppfølging.",
    "",
    `${firma.navn} · ${firma.foretaksnavn} · org.nr. ${firma.orgnr} · ${firma.adresse}`,
    firma.url,
  ].join("\n");
}

/* -------------------------------------------------------- Henvendelse ---- */

export interface Henvendelse {
  navn: string;
  epost: string;
  nettside?: string;
  melding: string;
}

/** Går til OSS, ikke til kunden. Skal være lett å skumme og lett å svare på. */
export function henvendelseHtml(f: Henvendelse): string {
  // Navnet staar allerede som overskrift. Aa gjenta det i tabellen gjoer raden
  // tregere aa skumme, og hele poenget med denne malen er at vi skal se hvem det
  // er og hva de vil paa ett blikk.
  const felt = [
    ["E-post", `<a href="mailto:${esc(f.epost)}" style="color:${F.blekk};text-decoration:underline">${esc(f.epost)}</a>`],
    ["Nettside i dag", f.nettside ? `<a href="${esc(f.nettside)}" style="color:${F.blekk};text-decoration:underline">${esc(f.nettside)}</a>` : "—"],
  ]
    .map(
      ([k, v]) => `<tr>
<td style="padding:6px 12px 6px 0;font-family:${SANS};font-size:13px;line-height:20px;color:${F.svak};white-space:nowrap;vertical-align:top">${k}</td>
<td style="padding:6px 0;font-family:${MONO};font-size:14px;line-height:20px;color:${F.blekk};word-break:break-word">${v}</td>
</tr>`,
    )
    .join("");

  return skall(
    `${topp()}
<tr><td class="kk-pad" style="padding:28px 32px 0">
<p style="margin:0 0 8px;font-family:${MONO};font-size:12px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${F.svak}">Ny henvendelse</p>
<h1 style="margin:0 0 16px;font-family:${SANS};font-size:24px;line-height:30px;font-weight:700;color:${F.blekk}">${esc(f.navn)}</h1>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${felt}</table>
</td></tr>

<tr><td class="kk-pad" style="padding:20px 32px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${F.grunn};border:1px solid ${F.linje};border-radius:8px">
<tr><td style="padding:16px 20px;font-family:${SANS};font-size:15px;line-height:23px;color:${F.blekk};white-space:pre-wrap;word-break:break-word">${esc(f.melding)}</td></tr>
</table>
</td></tr>

<tr><td class="kk-pad" style="padding:20px 32px 28px">
<p style="margin:0;font-family:${SANS};font-size:13px;line-height:20px;color:${F.dempet}">Svar direkte på denne e-posten – svaret går til ${esc(f.epost)}.</p>
</td></tr>

${bunn()}`,
    `${f.navn}: ${f.melding.slice(0, 90)}`,
  );
}

export function henvendelseTekst(f: Henvendelse): string {
  return [
    `Navn: ${f.navn}`,
    `E-post: ${f.epost}`,
    `Nettside i dag: ${f.nettside || "—"}`,
    "",
    f.melding,
    "",
    `Svar direkte på denne e-posten – svaret går til ${f.epost}.`,
  ].join("\n");
}
