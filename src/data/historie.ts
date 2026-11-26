/**
 * Historien i filmen på forsiden (ScrollWorld) og målingene den ender i. Eies av bevegelse.
 *
 * Runde 4, historien C «Lampa» (eier 19. nov. 2026, docs/design/historie-manus.md del 5 og 7,
 * docs/design/wow-brief.md «Runde 4»). Fortellerlinjene står ordrett fra manus C; tekstforfatteren
 * kan finjustere dem her, og bare her.
 * Målingene: /api/sjekk mot kodekonsulentene.no, kjørt 18. nov. 2026 (dirigenten). Samme kilde
 * brukes av befaringsrapporten (#rapport), så filmen og rapporten aldri kan si noe ulikt.
 *
 * Bruk:
 *   import { film, filmTekst } from "../data/historie";
 *   <ScrollWorld film={film} tekst={filmTekst}> <HeroTekst /> </ScrollWorld>
 * (ScrollWorld bruker `film` og `filmTekst` som standard, så <ScrollWorld> <HeroTekst /> </ScrollWorld>
 * er nok.)
 *
 * Modellen: filmen er en rekke KAPITLER (det som blir statiske blokker uten JS), og hvert kapittel er
 * en rekke SEGMENTER som spilles etter hverandre med rullingen:
 *   kilde      klippet eller stillbildet i public/media/wow/scroll-world/ (uten endelse; «-m» er 9:16)
 *   type       "klipp" (standard) eller "still" (et bilde som står, med valgfri zoom)
 *   lengde     rullelengde i skjermhøyder
 *   retning    1 (standard) eller -1: klippet spilles baklengs (dive-4 i prologen, pult-inn)
 *   gronnVed   0–1 av klippet: rammen der kameraet når det grønne lyset (bare dykkene i bedriftene).
 *              Gir klippkartet: problemet fører kameraet inn dit (problemAndel av rullingen), så står
 *              kameraet nesten stille (ro), så går det ut. Valgt fra .design/arbeid/bevegelse/r3/ark-dive-*.png.
 *   gra        når bildet er grått: [fra, til] i andel av segmentet. til kan være "gronn" (der lampa i
 *              klippet er grønn, se gronnVed) eller "hake" (første måling låser seg). Gråtonen viser hva
 *              vi bygger, ikke hva som er målt: den er uavhengig av lampa.
 *   zoom       still: [andel, skala][], lineært mellom punktene (bare transform)
 *   linjer     fortellerlinjene. ved = andel av segmentet der linja tar over platen, eller "gronn".
 *              tittel + href gir en H2 med lenke over linja. stille = platen er tom (målingene låser seg).
 *              puls = lampa pulserer én gang (opasitet) når linja kommer.
 *   maalinger  [fra, til] i andel av segmentet: de fire målingene låser seg én etter én. Lampa fylles grønn
 *              med dato i det den siste låser seg, og det er første gang i filmen den lyser.
 *   reserve    brukes i stedet for segmentet når fila mangler (N2 pult-inn før produsenten har levert).
 *   som        sømmen UT av segmentet, mot det neste (manus v6 del 2 og 10): "kutt" (standard, hardt
 *              kutt), "toning" (kort krysstoning, 0,05 skjermhøyder: det nye bildet tones inn over det
 *              gamle) eller et tall (bredden i skjermhøyder). Toning er for sømmer mellom to stille og
 *              nesten like bilder; kutt der historien har et (i døra, opp til kontoret, bildøra til porten).
 *   hold       { ved, lengde }: klippet står på rammen ved andelen `ved` (0–1 av klippet, i
 *              avspillingsretningen) mens rullingen går `lengde` skjermhøyder (frysrammen i T6).
 *              Lengden tas av segmentets `lengde`; øk den tilsvarende hvis resten ikke skal gå fortere.
 *              Et segment med hold bruker ikke klippkartet (gronnVed).
 *              Regnes i src/scripts/wow/som.ts (testet i test/som.test.ts).
 */

export interface Maaling {
  etikett: string;
  /** Verdien slik sjekken skriver den. */
  verdi: string;
  /** Alle fire er bestått i målingen 18. nov. Feltet finnes så rapporten kan vise noe annet senere. */
  status: "bestatt" | "mangler" | "ikke-sjekket";
  /** Forbehold som må stå ved verdien (æresregelen: ikke påstå mer enn det som er målt). */
  forbehold?: string;
}

/** Tjenestekapitlene i filmen. Hode.astro og lab-sidene leser navn, lenke og løsning herfra. */
export interface Kapittel {
  sted: string;
  problem: string;
  /** Kort navn (menyen). */
  tittel?: string;
  losning?: string;
  href?: string;
}

export type Fortsett = number | "gronn";

export interface Linje {
  tekst: string;
  ved: Fortsett;
  /** H2 over linja (søkeordet). */
  tittel?: string;
  href?: string;
  /** Platen er tom mens denne «linja» står (målingene låser seg). */
  stille?: boolean;
  /** Lampa pulserer én gang når linja kommer. */
  puls?: boolean;
}

export interface Segment {
  kilde: string;
  type?: "klipp" | "still";
  lengde: number;
  retning?: 1 | -1;
  gronnVed?: number;
  problemAndel?: number;
  ro?: number;
  gra?: [number, number | "gronn" | "hake"];
  zoom?: [number, number][];
  /** Bildet som står til klippet har tegnet: klippets første bilde i avspillingsretningen.
   *  Forover dive-N: poster-N (standard). Baklengs må det oppgis. */
  poster?: string;
  linjer?: Linje[];
  maalinger?: [number, number];
  /** Sømmen ut av segmentet: "kutt" (standard), "toning" (0,05 skjermhøyder) eller bredden i skjermhøyder. */
  som?: "kutt" | "toning" | number;
  /** Klippet står på rammen ved `ved` (0–1 av klippet) mens rullingen går `lengde` skjermhøyder. */
  hold?: { ved: number; lengde: number };
  reserve?: Omit<Segment, "reserve">;
}

export interface FilmKapittel {
  /** id i siden: sw-<id>. Bakeriet er "kapittel-1" så Hode sin «Tjenester»-lenke treffer. */
  id: string;
  sted: string;
  /** Stillbildet i den statiske blokken (uten JS og ved redusert bevegelse), uten endelse. */
  bilde: string;
  /** Reservebilde hvis `bilde` mangler. */
  bildeReserve?: string;
  segmenter: Segment[];
}

/** Dato for målingen, slik den står under målingene. */
export const maltDato = "Målt 18. nov. 2026";
export const maltDatoIso = "2026-11-18";
export const maltAdresse = "kodekonsulentene.no";

/** Ekte verdier fra /api/sjekk mot kodekonsulentene.no 18. nov. 2026. Ikke rund av, ikke legg til. */
export const malinger: Maaling[] = [
  { etikett: "Cookies før samtykke", verdi: "0", status: "bestatt" },
  { etikett: "Sikkerhetsheadere", verdi: "6/6", status: "bestatt" },
  {
    etikett: "Universell utforming",
    verdi: "0 feil",
    status: "bestatt",
    forbehold: "Maskinelt testbare feil. Kontrast og tastatur testes manuelt.",
  },
  { etikett: "Lovpålagt informasjon", verdi: "Org.nr. bekreftet", status: "bestatt" },
];

/**
 * Deler en verdi i en stor del og en liten (enheten), ordrett samme tekst. Samme regel som
 * rapporten (Befaring.astro): «0 feil» → stor «0», liten «feil»; «Org.nr. bekreftet» →
 * liten «Org.nr.», stor «bekreftet»; «6/6» og «0» står hele.
 */
export function delVerdi(verdi: string): { for?: string; stor: string; etter?: string } {
  const ord = verdi.trim().split(/\s+/);
  if (ord.length < 2) return { stor: verdi };
  if (/^\d/.test(ord[0])) return { stor: ord[0], etter: ` ${ord.slice(1).join(" ")}` };
  return { for: `${ord.slice(0, -1).join(" ")} `, stor: ord[ord.length - 1] };
}

/**
 * Tjenestene slik filmen viser dem. Hode.astro (menyen) og lab-sidene bruker `historie`, som er laget
 * av denne lista: kort navn i menyen, løsningslinja under.
 */
export const tjenester = {
  nettsider: {
    navn: "Nettsider",
    h2: "Nettsider som laster på mobilen",
    href: "/nettsider",
    problem: "Bakeriet. Kunden står utenfor med mobilen, og siden laster ikke.",
    losning: "Vi bygger siden lett, så den åpner raskt på mobilen.",
  },
  systemer: {
    navn: "Systemer og integrasjoner",
    h2: "Integrasjoner for booking, betaling og regnskap",
    href: "/systemer",
    problem: "Kontoret. Booking, betaling og regnskap ligger i hvert sitt program.",
    losning: "Vi kobler dem sammen, så hvert tall føres én gang.",
  },
  apper: {
    navn: "Apper og AI",
    h2: "Apper for håndverkere",
    href: "/apper-og-ai",
    problem: "Rørleggeren. Dagens jobber står på lapper i bilen, og én av dem er borte.",
    losning: "Dagens jobber i en app på telefonen. Ingen lapper.",
  },
} as const;

/** Bakoverkompatibel visning (Hode.astro, lab/wow-side): indeks 1–3 er bedriftene. */
export const historie: Kapittel[] = [
  { sted: "Gata", problem: "En gate i Oslo. Tre bedrifter, tre nettsider. Alle vinduene lyser." },
  ...[tjenester.nettsider, tjenester.systemer, tjenester.apper].map((t, i) => ({
    sted: ["Bakeriet", "Kontoret", "Rørleggeren"][i],
    problem: t.problem,
    tittel: t.navn,
    losning: t.losning,
    href: t.href,
  })),
  { sted: "Pulten", problem: "Tegninger kan ikke måles. Så vi målte det eneste her som finnes:" },
];

/**
 * Filmen, beat for beat (manus C del 5, «Beat-ark»). Rullelengden er summen av `lengde`: 9,0
 * skjermhøyder. Linjene er ordrett fra manus C del 7.
 */
export const film: FilmKapittel[] = [
  {
    id: "kapittel-0",
    sted: "Prologen: pulten",
    bilde: "hero",
    segmenter: [
      {
        // Heroen og prologen: siste ramme i dive-4, langsom innzoom. Heroteksten er slotten i ScrollWorld.
        kilde: "hero",
        type: "still",
        lengde: 0.9,
        zoom: [
          [0, 1],
          [1, 1.04],
        ],
        linjer: [
          { ved: 0.42, tekst: "Vi begynner på slutten. To grønne haker på en skjerm." },
          { ved: 0.72, tekst: "Haker er lette å tegne. Hvem som helst kan gjøre det." },
        ],
      },
      {
        // dive-4 baklengs i høy fart: kameraet rygger ut av vinduet. Starter på samme bilde som heroen.
        kilde: "dive-4",
        lengde: 0.35,
        retning: -1,
        poster: "hero",
        linjer: [{ ved: 0, tekst: "Så vi spoler tilbake til der det begynte." }],
      },
    ],
  },
  {
    id: "kapittel-gata",
    sted: "Gata",
    bilde: "poster-0",
    segmenter: [
      {
        kilde: "dive-0",
        lengde: 0.55,
        linjer: [{ ved: 0, tekst: "En gate i Oslo. Tre bedrifter, tre nettsider. Alle vinduene lyser." }],
      },
      {
        kilde: "conn-0",
        lengde: 0.4,
        linjer: [
          { ved: 0, tekst: "Lys i et vindu sier ingenting om siden. Derfor har vi en lampe.", puls: true },
          { ved: 0.55, tekst: "Den tennes bare for det som er målt. Ikke for det som ser bra ut." },
        ],
      },
    ],
  },
  {
    id: "kapittel-1",
    sted: "Bakeriet",
    bilde: "poster-1",
    segmenter: [
      {
        kilde: "dive-1",
        lengde: 1.0,
        // Ramme 77 av 105: kameraet er inne, og den grønne skjermen bak disken er skarp.
        gronnVed: 0.72,
        problemAndel: 0.4,
        ro: 0.42,
        gra: [0, "gronn"],
        linjer: [
          { ved: 0, tekst: tjenester.nettsider.problem },
          { ved: "gronn", tittel: tjenester.nettsider.h2, href: tjenester.nettsider.href, tekst: tjenester.nettsider.losning },
          { ved: 0.84, tekst: "Skjermen bak disken lyser grønt. Lampa gjør ikke det. Ingen har målt bakeriet." },
        ],
      },
      { kilde: "conn-1", lengde: 0.3 },
    ],
  },
  {
    id: "kapittel-2",
    sted: "Kontoret",
    bilde: "poster-2",
    segmenter: [
      {
        kilde: "dive-2",
        lengde: 1.0,
        // Ramme ca. 91 av 121: kalenderen på skjermen fyller bildet.
        gronnVed: 0.75,
        problemAndel: 0.4,
        ro: 0.42,
        gra: [0, "gronn"],
        linjer: [
          { ved: 0, tekst: tjenester.systemer.problem },
          { ved: "gronn", tittel: tjenester.systemer.h2, href: tjenester.systemer.href, tekst: tjenester.systemer.losning },
          { ved: 0.84, tekst: "Kalenderen fylles opp. Fint å se på. Fortsatt ikke målt." },
        ],
      },
      { kilde: "conn-2", lengde: 0.3 },
    ],
  },
  {
    id: "kapittel-3",
    sted: "Rørleggeren",
    bilde: "poster-3",
    segmenter: [
      {
        kilde: "dive-3",
        lengde: 1.0,
        // Ramme ca. 82 av 121: telefonen lyser grønt i hånda hans, nærbilde.
        gronnVed: 0.68,
        problemAndel: 0.4,
        ro: 0.42,
        gra: [0, "gronn"],
        linjer: [
          { ved: 0, tekst: tjenester.apper.problem },
          { ved: "gronn", tittel: tjenester.apper.h2, href: tjenester.apper.href, tekst: tjenester.apper.losning },
          { ved: 0.84, tekst: "Telefonen lyser grønt. Du vet hva vi skal si." },
        ],
      },
    ],
  },
  {
    id: "kapittel-innrommelse",
    sted: "Innrømmelsen",
    bilde: "pult",
    bildeReserve: "byen",
    segmenter: [
      {
        // N2 baklengs: starter på samme bilde som dive-0 ramme 0 og trekker seg ut til pulten.
        kilde: "pult-inn",
        lengde: 0.9,
        retning: -1,
        // Baklengs starter klippet på dive-0 ramme 0, som er poster-0.
        poster: "poster-0",
        linjer: [
          { ved: 0, tekst: "Her må vi innrømme noe." },
          { ved: 0.35, tekst: "Gata står på pulten vår. Vi laget den med KI. Bakeriet finnes ikke." },
        ],
        // Manus C, «Reserve uten N1/N2»: byen i conn-3 holdes, twisten står i teksten.
        reserve: {
          kilde: "byen",
          type: "still",
          lengde: 0.9,
          zoom: [
            [0, 1],
            [1, 1.03],
          ],
          linjer: [
            {
              ved: 0,
              tekst: "Her må vi innrømme noe. Bakeriet, kontoret og rørleggeren er laget med KI.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "kapittel-4",
    sted: "Pulten",
    bilde: "pult",
    bildeReserve: "hero",
    segmenter: [
      {
        // N1: pulten med modellene. Mangler fila, står siste ramme i dive-4 (heroen) i stedet.
        kilde: "pult",
        type: "still",
        lengde: 2.3,
        zoom: [
          [0, 1],
          [0.1, 1],
          [0.2, 1.08],
          [0.66, 1.08],
          [0.8, 1],
          [1, 1],
        ],
        gra: [0.22, "hake"],
        maalinger: [0.24, 0.52],
        linjer: [
          { ved: 0, tekst: "Tegninger kan ikke måles. Så vi målte det eneste her som finnes:" },
          { ved: 0.1, tekst: "siden du leser nå." },
          { ved: 0.22, tekst: "", stille: true },
          { ved: 0.54, tekst: "Den første lampa i filmen som lyser. Den har dato." },
          { ved: 0.7, tekst: "Samme to haker som i starten. Nå betyr de noe." },
          { ved: 0.86, tekst: "Din side ser sikkert fin ut. Det er ikke det samme som at den virker." },
        ],
      },
    ],
  },
];

/**
 * Tekstene rundt filmen. `dinSideStatus` står ved feltet i rapporten med den hule lampa (Befaring,
 * UrlFelt). `overgang` er H2 i rapporten (manus C: «Sjekk nettsiden din»).
 */
export const filmTekst = {
  etikett: "Film: en gate med tre bedrifter, og pulten der vi måler",
  /** Lampa når ingenting er målt (skjermlesertekst). */
  ikkeMalt: "Ikke målt",
  dinSide: "Din side",
  dinSideStatus: "Din side: ikke målt",
  kolofon: "Illustrasjon laget med KI",
  hopp: "Hopp til rapporten",
  hoppTil: "#rapport",
  /** Overskriften der filmen glir over i rapporten. Settes av byggeren i Befaring. */
  overgang: "Sjekk nettsiden din",
} as const;

export type FilmTekst = { [K in keyof typeof filmTekst]: string };
