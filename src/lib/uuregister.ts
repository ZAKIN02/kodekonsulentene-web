/**
 * Tilgjengelighetsregisteret: aggregering av Uu-tilsynets åpne datasett.
 *
 * HVORFOR FILEN FINNES. `docs/research-2026.md` forslag 15 peker på det eneste
 * datasettet vi har funnet som er sant, norsk, offentlig og stort nok til å bære
 * en påstand: alle ferdigstilte tilgjengelighetserklæringer, med resultat per
 * enkeltkrav. Brandboken forbyr oppdiktede tall og krever at `ProofStrip` og
 * `Nokkeltall` har sanne tall. Dette er sanne tall vi ikke har laget selv.
 *
 * REN FUNKSJON, INGEN NETTVERK – samme regel som `src/lib/sjekk.ts`. Henting
 * ligger i `scripts/uuregister.mjs`, som kjøres for hånd og skriver et datert
 * øyeblikksbilde til `src/data/uu-register.json`. Byggsteget rører aldri nettet:
 * et bygg som feiler fordi et departement bytter sertifikat, er et dårlig bygg.
 *
 * DEN VIKTIGSTE PRESISJONEN, OG DEN MÅ FØLGE TALLENE OVERALT:
 * registeret dekker OFFENTLIGE virksomheter, som har erklæringsplikt, og tallene
 * er SELVRAPPORTERTE. Kundene våre er private småbedrifter uten erklæringsplikt.
 * «Norske bedrifter» om dette tallet er den samme feilen som en falsk «Bestått».
 * Derfor heter funksjonen under `aggreger`, ikke `fasit`.
 */

/** Feltene vi bruker. Datasettet har flere; de er dokumentert hos kilden. */
export interface Erklaering {
  erklaeringId: string;
  organisasjonsnummer: string;
  iktLoeysingType: string;
  samsvarsstatus: string;
  talSamsvar: number;
  talBrot: number;
  talIkkjeRelevant: number;
  sisteOppdatering?: string;
  resultat?: Kravresultat[];
}

export interface Kravresultat {
  krav: string;
  /** "yes" | "no" | "not_relevant" i datasettet. Alt annet telles som uvurdert. */
  oppfyllerAltInnhaldKravet: string;
}

export interface Kravrad {
  /** WCAG-nummer, f.eks. "1.4.3". */
  krav: string;
  /** Erklæringer som sier at kravet er brutt. */
  brot: number;
  /** Erklæringer som sier at kravet er oppfylt. */
  samsvar: number;
  /** Erklæringer som sier at kravet ikke er relevant for løsningen. */
  ikkjeRelevant: number;
  /** brot + samsvar. Nevneren. «Ikke relevant» er ikke en vurdering. */
  vurdert: number;
  /** brot / vurdert, i prosent med én desimal. */
  andel: number;
}

export interface Registertall {
  erklaeringer: number;
  virksomheter: number;
  nettsteder: number;
  apper: number;
  /** Nøkkel er kildens egen nynorske streng, uendret. */
  status: Record<string, number>;
  medMinstEttBrudd: number;
  utenBrudd: number;
  /** Andel med minst ett selvrapportert brudd, i prosent med én desimal. */
  andelMedBrudd: number;
  brudd: { sum: number; snitt: number; median: number; maks: number };
  /** Alle krav, sortert etter andel brudd, høyest først. */
  kravRader: Kravrad[];
  /** Eldste og nyeste `sisteOppdatering` i settet. */
  periode: { foerste: string; siste: string };
  /**
   * Egenkontroll av datasettet, ikke av virksomhetene.
   * `talBrot` skal være lik antall rader med `oppfyllerAltInnhaldKravet === "no"`.
   * Avvik her betyr at kildens egne summer ikke stemmer med kildens egne rader,
   * og da skal tallet ikke publiseres uten at avviket står ved siden av.
   */
  integritet: { kontrollert: number; stemmer: number; avvik: string[] };
}

/** Avrunding til én desimal uten flyttallsstøy i utskriften. */
function en(n: number): number {
  return Math.round(n * 10) / 10;
}

function median(sortert: number[]): number {
  if (sortert.length === 0) return 0;
  const m = sortert.length / 2;
  return sortert.length % 2
    ? sortert[(sortert.length - 1) / 2]
    : (sortert[m - 1] + sortert[m]) / 2;
}

/** Sorteringsnøkkel som gjør 1.4.10 større enn 1.4.5 og ikke mindre. */
export function kravNokkel(krav: string): string {
  return krav
    .split(".")
    .map((d) => d.padStart(2, "0"))
    .join(".");
}

/**
 * Aggregerer hele settet. Tar imot ferdig parsede erklæringer, så den kan testes
 * mot en håndskrevet fixture på fem rader uten å laste ned 250 MB.
 */
export function aggreger(erklaeringer: Erklaering[]): Registertall {
  const status: Record<string, number> = {};
  const orgnr = new Set<string>();
  const per = new Map<string, { brot: number; samsvar: number; ikkjeRelevant: number }>();
  const avvik: string[] = [];
  let kontrollert = 0;
  let stemmer = 0;
  let nettsteder = 0;
  let apper = 0;
  const brudd: number[] = [];
  const datoer: string[] = [];

  for (const e of erklaeringer) {
    status[e.samsvarsstatus] = (status[e.samsvarsstatus] ?? 0) + 1;
    orgnr.add(e.organisasjonsnummer);
    if (e.iktLoeysingType === "nettstad") nettsteder++;
    else if (e.iktLoeysingType === "app") apper++;
    brudd.push(e.talBrot);
    if (e.sisteOppdatering) datoer.push(e.sisteOppdatering);

    if (!e.resultat) continue;
    let nei = 0;
    for (const r of e.resultat) {
      if (!per.has(r.krav)) per.set(r.krav, { brot: 0, samsvar: 0, ikkjeRelevant: 0 });
      const o = per.get(r.krav)!;
      if (r.oppfyllerAltInnhaldKravet === "no") {
        o.brot++;
        nei++;
      } else if (r.oppfyllerAltInnhaldKravet === "yes") {
        o.samsvar++;
      } else {
        o.ikkjeRelevant++;
      }
    }
    kontrollert++;
    if (nei === e.talBrot) stemmer++;
    // Taket på tjue finnes for at en ødelagt henting ikke skal skrive en
    // flere megabyte lang feilliste inn i et datasett som sjekkes inn i git.
    else if (avvik.length < 20) avvik.push(`${e.erklaeringId}: talBrot=${e.talBrot}, rader=${nei}`);
  }

  const sortertBrudd = [...brudd].sort((a, b) => a - b);
  const sum = sortertBrudd.reduce((a, b) => a + b, 0);
  const medBrudd = brudd.filter((b) => b > 0).length;

  const kravRader: Kravrad[] = [...per]
    .map(([krav, o]) => {
      const vurdert = o.brot + o.samsvar;
      return {
        krav,
        brot: o.brot,
        samsvar: o.samsvar,
        ikkjeRelevant: o.ikkjeRelevant,
        vurdert,
        andel: vurdert === 0 ? 0 : en((o.brot / vurdert) * 100),
      };
    })
    // Andel først, så kravnummer. Uten sekundærnøkkelen bytter to krav med samme
    // andel plass mellom hver henting, og diffen i git blir støy.
    .sort((a, b) => b.andel - a.andel || kravNokkel(a.krav).localeCompare(kravNokkel(b.krav)));

  const sortertDato = [...datoer].sort();

  return {
    erklaeringer: erklaeringer.length,
    virksomheter: orgnr.size,
    nettsteder,
    apper,
    status,
    medMinstEttBrudd: medBrudd,
    utenBrudd: erklaeringer.length - medBrudd,
    andelMedBrudd: erklaeringer.length === 0 ? 0 : en((medBrudd / erklaeringer.length) * 100),
    brudd: {
      sum,
      snitt: erklaeringer.length === 0 ? 0 : Math.round((sum / erklaeringer.length) * 100) / 100,
      median: median(sortertBrudd),
      maks: sortertBrudd.at(-1) ?? 0,
    },
    kravRader,
    periode: { foerste: sortertDato[0] ?? "", siste: sortertDato.at(-1) ?? "" },
    integritet: { kontrollert, stemmer, avvik },
  };
}

/**
 * Norske navn og nivå for de 48 kravene registeret dekker.
 *
 * KILDEN ER TILSYNET SELV. Hvert navn og hver URL er lest ut av Uu-tilsynets
 * egen sitemap 7. oktober 2026 (`/wcag-standarden/<nummer>-<navn>-niva[-aa]/<id>`),
 * så raden i tabellen vår kan kontrolleres mot regulatorens egen side for det
 * kravet. Slugen mangler æ, ø og å; navnene under er skrevet ut med dem.
 *
 * `niva` er A eller AA slik tilsynet selv merker siden. Registeret dekker
 * offentlig sektors 48 krav etter WCAG 2.1; private er bundet av 35 etter
 * WCAG 2.0, og de to listene er ikke de samme. Se `src/pages/artikler/`.
 */
export const KRAVNAVN: Record<string, { navn: string; niva: "A" | "AA"; sti: string }> = {
  "1.1.1": { navn: "Ikke-tekstlig innhold", niva: "A", sti: "111-ikke-tekstlig-innhold-niva/87" },
  "1.2.1": { navn: "Bare lyd og bare video (forhåndsinnspilt)", niva: "A", sti: "121-bare-lyd-og-bare-video-forhandsinnspilt-niva/88" },
  "1.2.2": { navn: "Teksting (forhåndsinnspilt)", niva: "A", sti: "122-teksting-forhandsinnspilt-niva/89" },
  "1.2.5": { navn: "Synstolking (forhåndsinnspilt)", niva: "AA", sti: "125-synstolking-forhandsinnspilt-niva-aa/842" },
  "1.3.1": { navn: "Informasjon og relasjoner", niva: "A", sti: "131-informasjon-og-relasjoner-niva/90" },
  "1.3.2": { navn: "Meningsfylt rekkefølge", niva: "A", sti: "132-meningsfylt-rekkefolge-niva/91" },
  "1.3.3": { navn: "Sensoriske egenskaper", niva: "A", sti: "133-sensoriske-egenskaper-niva/92" },
  "1.3.4": { navn: "Visningsretning", niva: "AA", sti: "134-visningsretning-niva-aa/141" },
  "1.3.5": { navn: "Identifiser formål med inndata", niva: "AA", sti: "135-identifiser-formal-med-inndata-niva-aa/142" },
  "1.4.1": { navn: "Bruk av farge", niva: "A", sti: "141-bruk-av-farge-niva/93" },
  "1.4.2": { navn: "Styring av lyd", niva: "A", sti: "142-styring-av-lyd-niva/94" },
  "1.4.3": { navn: "Kontrast (minimum)", niva: "AA", sti: "143-kontrast-minimum-niva-aa/95" },
  "1.4.4": { navn: "Endring av tekststørrelse", niva: "AA", sti: "144-endring-av-tekststorrelse-niva-aa/96" },
  "1.4.5": { navn: "Bilder av tekst", niva: "AA", sti: "145-bilder-av-tekst-niva-aa/97" },
  "1.4.10": { navn: "Dynamisk tilpasning (Reflow)", niva: "AA", sti: "1410-dynamisk-tilpasning-reflow-niva-aa/144" },
  "1.4.11": { navn: "Kontrast for ikke-tekstlig innhold", niva: "AA", sti: "1411-kontrast-ikke-tekstlig-innhold-niva-aa/145" },
  "1.4.12": { navn: "Tekstavstand", niva: "AA", sti: "1412-tekstavstand-niva-aa/146" },
  "1.4.13": { navn: "Pekerfølsomt innhold eller innhold ved tastaturfokus", niva: "AA", sti: "1413-pekerfolsomt-innhold-eller-innhold-ved-tastaturfokus-niva-aa/147" },
  "2.1.1": { navn: "Tastatur", niva: "A", sti: "211-tastatur-niva/98" },
  "2.1.2": { navn: "Ingen tastaturfelle", niva: "A", sti: "212-ingen-tastaturfelle-niva/99" },
  "2.1.4": { navn: "Hurtigtaster som består av ett tegn", niva: "A", sti: "214-hurtigtaster-som-bestar-av-ett-tegn-niva/782" },
  "2.2.1": { navn: "Justerbar hastighet", niva: "A", sti: "221-justerbar-hastighet-niva/100" },
  "2.2.2": { navn: "Pause, stopp, skjul", niva: "A", sti: "222-pause-stopp-skjul-niva/101" },
  "2.3.1": { navn: "Terskelverdi på maksimalt tre glimt", niva: "A", sti: "231-terskelverdi-pa-maksimalt-tre-glimt-niva/102" },
  "2.4.1": { navn: "Hoppe over blokker", niva: "A", sti: "241-hoppe-over-blokker-niva/103" },
  "2.4.2": { navn: "Sidetitler", niva: "A", sti: "242-sidetitler-niva/104" },
  "2.4.3": { navn: "Fokusrekkefølge", niva: "A", sti: "243-fokusrekkefolge-niva/105" },
  "2.4.4": { navn: "Formål med lenke (i kontekst)", niva: "A", sti: "244-formal-med-lenke-i-kontekst-niva/106" },
  "2.4.5": { navn: "Flere måter", niva: "AA", sti: "245-flere-mater-niva-aa/107" },
  "2.4.6": { navn: "Overskrifter og ledetekster", niva: "AA", sti: "246-overskrifter-og-ledetekster-niva-aa/108" },
  "2.4.7": { navn: "Synlig fokus", niva: "AA", sti: "247-synlig-fokus-niva-aa/109" },
  "2.5.1": { navn: "Pekerbevegelser", niva: "A", sti: "251-pekerbevegelser-niva/148" },
  "2.5.2": { navn: "Pekeravbrytelse", niva: "A", sti: "252-pekeravbrytelse-niva/149" },
  "2.5.3": { navn: "Ledetekst i navn", niva: "A", sti: "253-ledetekst-i-navn-niva/150" },
  "2.5.4": { navn: "Bevegelsesaktivering", niva: "A", sti: "254-bevegelsesaktivering-niva/151" },
  "3.1.1": { navn: "Språk på siden", niva: "A", sti: "311-sprak-pa-siden-niva/110" },
  "3.1.2": { navn: "Språk på deler av innhold", niva: "AA", sti: "312-sprak-pa-deler-av-innhold-niva-aa/111" },
  "3.2.1": { navn: "Fokus", niva: "A", sti: "321-fokus-niva/112" },
  "3.2.2": { navn: "Inndata", niva: "A", sti: "322-inndata-niva/114" },
  "3.2.3": { navn: "Konsekvent navigering", niva: "AA", sti: "323-konsekvent-navigering-niva-aa/113" },
  "3.2.4": { navn: "Konsekvent identifikasjon", niva: "AA", sti: "324-konsekvent-identifikasjon-niva-aa/115" },
  "3.3.1": { navn: "Identifikasjon av feil", niva: "A", sti: "331-identifikasjon-av-feil-niva/116" },
  "3.3.2": { navn: "Ledetekster eller instruksjoner", niva: "A", sti: "332-ledetekster-eller-instruksjoner-niva/117" },
  "3.3.3": { navn: "Forslag ved feil", niva: "AA", sti: "333-forslag-ved-feil-niva-aa/118" },
  "3.3.4": { navn: "Forhindring av feil (juridiske feil, økonomiske feil, datafeil)", niva: "AA", sti: "334-forhindring-av-feil-juridiske-feil-okonomiske-feil-datafeil-niva-aa/119" },
  "4.1.1": { navn: "Parsing (oppdeling)", niva: "A", sti: "411-parsing-oppdeling-niva/120" },
  "4.1.2": { navn: "Navn, rolle, verdi", niva: "A", sti: "412-navn-rolle-verdi-niva/121" },
  "4.1.3": { navn: "Statusbeskjeder", niva: "AA", sti: "413-statusbeskjeder-niva-aa/152" },
};

/**
 * Hvilke WCAG-krav vår egen skanner kan uttale seg om.
 *
 * UTLEDET, IKKE SKREVET. Settet kommer fra `WCAG_NAVN` i `src/data/wcag.ts`, som
 * er den kanoniske lista over regler skanneren faktisk har. Legger noen til en
 * regel der, flytter tallet i artikkelen seg av seg selv – og motsatt: ingen kan
 * påstå i brødtekst at vi dekker et krav vi ikke har en regel for.
 */
export function maskinsjekkbareKrav(
  navn: Record<string, { krav: string }>,
): Set<string> {
  const ut = new Set<string>();
  for (const v of Object.values(navn)) {
    const m = v.krav.match(/(\d+\.\d+\.\d+)/);
    if (m) ut.add(m[1]);
  }
  return ut;
}

/**
 * Hvor mange av de N øverste kravene i registeret vår egen skanner kan finne.
 * Dette er hele poenget i artikkelen: lista over hva en maskin finner og lista
 * over hva mennesker rapporterer når de tester for hånd, er ikke den samme.
 */
export function dekningIToppen(
  rader: Kravrad[],
  maskinsjekkbare: Set<string>,
  n: number,
): { topp: Kravrad[]; dekket: string[]; udekket: string[] } {
  const topp = rader.slice(0, n);
  return {
    topp,
    dekket: topp.filter((r) => maskinsjekkbare.has(r.krav)).map((r) => r.krav),
    udekket: topp.filter((r) => !maskinsjekkbare.has(r.krav)).map((r) => r.krav),
  };
}
