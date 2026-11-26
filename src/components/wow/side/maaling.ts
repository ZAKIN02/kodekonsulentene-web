/**
 * Lampen og målingen i rapportspråket, som HTML-tekst (wow-undersider.md del 3).
 *
 * ÉN KILDE FOR SERVER OG NETTLESER: Maaling.astro og Lampe.astro rendrer denne teksten ved bygg,
 * og verktøyskriptene (sjekk, cookie-sjekk, uu-sjekk, dmarc) kaller de samme funksjonene i
 * nettleseren når resultatet kommer. Da kan ikke en rad fra serveren og en rad fra skriptet se
 * ulike ut. Stilen ligger globalt i wow.css («Lampe og måling»), fordi skriptene lager markupen.
 *
 * Fila har ingen avhengigheter utover delVerdi() fra historie.ts (samme deling av verdien som
 * befaringsrapporten på forsiden), og ingen DOM-kall, så den kan importeres begge steder.
 *
 * Æresregelen (CLAUDE.md): hver rad har én av statusene, og «Ikke sjekket» skal ha en setning om
 * hvorfor (`merknad`). Status står alltid også som ord, aldri bare som farge.
 *
 * Plassering: planen sier src/lib/wow-maaling.ts. Fila ligger her fordi A1 bare eier
 * src/components/wow/side/** i denne bølgen; flyttes den, endres bare importene.
 */
// Med filendelse: test/sjekk-sekvens.test.ts importerer denne fila rett i Node, som ikke gjetter «.ts».
import { delVerdi } from "../../../data/historie.ts";

export type LampeStatus = "bestatt" | "bor" | "brudd" | "ikke-sjekket" | "venter" | "hul";

/** Ordet ved lampa. De fire første er ordrett fra sjekken (sjekk.astro, StatusBadge). */
export const statusOrd: Record<LampeStatus, string> = {
  bestatt: "Bestått",
  bor: "Bør fikses",
  brudd: "Brudd",
  "ikke-sjekket": "Ikke sjekket",
  venter: "Venter",
  /** Runde wow-r7 «Lampa»: hel, tom ring. Ordet fra historie-manus.md del 5 («Din side: ikke målt»). */
  hul: "Ikke målt",
};

/** Statusene fra src/lib/sjekk.ts (`ok | warn | fail | neutral`) til lampene. */
export const fraSjekk: Record<"ok" | "warn" | "fail" | "neutral", LampeStatus> = {
  ok: "bestatt",
  warn: "bor",
  fail: "brudd",
  neutral: "ikke-sjekket",
};

export interface MaalingData {
  /** Hva som er målt: «Sikkerhetsheadere». */
  navn: string;
  /** Verdien slik målingen skriver den: «6/6», «0 feil», «Org.nr. bekreftet». Tom = bare ordet. */
  verdi?: string;
  status: LampeStatus;
  /** Forbehold som må stå ved verdien (ikke påstå mer enn det som er målt). */
  forbehold?: string;
  /** Én setning om hva det betyr for bedriften. Påkrevd i praksis ved «Ikke sjekket». */
  merknad?: string;
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * Lampa. Med `etikett` får den skjermlesertekst; uten er den pynt ved siden av et ord som sier det
 * samme, og skjules for skjermlesere.
 */
export function lampeHtml(status: LampeStatus, etikett?: string): string {
  const tekst = etikett ? `<span class="wow-usynlig">${esc(etikett)}</span>` : "";
  const skjult = etikett ? "" : ' aria-hidden="true"';
  return `<span class="wow-lampe wow-lampe--${status}"${skjult}>${tekst}</span>`;
}

/** Verdien med enheten i vanlig skrift: «0 feil» → stor «0», liten «feil». */
export function verdiHtml(verdi: string): string {
  const d = delVerdi(verdi);
  const liten = (s?: string) => (s ? `<span class="wow-maalt__enhet">${esc(s)}</span>` : "");
  return `${liten(d.for)}${esc(d.stor)}${liten(d.etter)}`;
}

/**
 * Én måling som rad. `som: "li"` (standard) står i en <ol class="wow-maalinger"> (Rapportark);
 * `som: "div"` står alene.
 */
export function maalingHtml(m: MaalingData, som: "li" | "div" = "li"): string {
  const ord = statusOrd[m.status];
  const verdi = m.verdi
    ? `<span class="wow-maaling__spor" aria-hidden="true"><span class="wow-maaling__linje"></span></span>` +
      `<span class="wow-maalt__verdi wow-maaling__verdi">${verdiHtml(m.verdi)}</span>`
    : "";
  return (
    `<${som} class="wow-maaling wow-maaling--${m.status}">` +
    lampeHtml(m.status) +
    `<span class="wow-maaling__navn">` +
    `<span class="wow-maalt__navn">${esc(m.navn)}<span class="wow-usynlig">:</span></span>` +
    `<span class="wow-maaling__status">${esc(ord)}</span>` +
    (m.forbehold ? `<span class="wow-maaling__forbehold">${esc(m.forbehold)}</span>` : "") +
    `</span>` +
    `<span class="wow-maaling__maaling">${verdi}</span>` +
    (m.merknad ? `<span class="wow-maaling__merknad">${esc(m.merknad)}</span>` : "") +
    `</${som}>`
  );
}

export interface RapportarkData {
  /** Overskriften på arket. Standard «Befaringsrapport». */
  tittel?: string;
  /** id på overskriften. Den får tabindex="-1", så skriptet kan flytte fokus dit. */
  tittelId?: string;
  /** Overskriftsnivå. Standard 2. */
  niva?: 2 | 3;
  rader: MaalingData[];
  /** Adressen som er målt, i bunnlinja. */
  adresse?: string;
  /** Datoen slik den skal stå, i bunnlinja. */
  dato?: string;
}

/**
 * Hele rapportarket som HTML-tekst: samme markup som Rapportark.astro, for verktøyskriptene som
 * fyller resultatområdet i nettleseren. Endres markupen i Rapportark.astro, endres den her.
 *
 *   boks.innerHTML = rapportarkHtml({ tittelId: "rapport-tittel", rader, adresse: r.url, dato: r.dato });
 *   document.getElementById("rapport-tittel")?.focus();
 */
export function rapportarkHtml(r: RapportarkData): string {
  const H = r.niva === 3 ? "h3" : "h2";
  const id = r.tittelId ? ` id="${esc(r.tittelId)}" tabindex="-1"` : "";
  const fot =
    r.adresse || r.dato
      ? `<div class="wow-rapportark__fot">` +
        (r.adresse
          ? `<p class="wow-befaring__adresse"><span class="wow-befaring__prikk" aria-hidden="true"></span>${esc(r.adresse)}</p>`
          : "") +
        (r.dato ? `<p class="wow-rapportark__dato">${esc(r.dato)}</p>` : "") +
        `</div>`
      : "";
  return (
    `<div class="wow-rapportark wow-rapportark--side">` +
    `<${H} class="wow-rapportark__tittel"${id}>${esc(r.tittel ?? "Befaringsrapport")}</${H}>` +
    `<ol class="wow-maalinger" role="list">${r.rader.map((m) => maalingHtml(m)).join("")}</ol>` +
    fot +
    `</div>`
  );
}
