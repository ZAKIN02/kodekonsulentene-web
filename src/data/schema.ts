/**
 * Strukturerte data, ett sted.
 *
 * Alt her er bygget av `firma.ts`, `priser.ts` og `tjenester.ts` – de samme
 * tallene som står på siden. Ingenting skrives inn for hånd, så markup og
 * brødtekst kan ikke komme ut av synk.
 *
 * REGELEN SOM GJELDER HELE FILA: vi merker opp bare det vi kan dokumentere.
 * `aggregateRating` og `review` finnes ikke her, fordi vi ikke har kundeomtaler.
 * Google behandler oppdiktede vurderinger som spam, og /caser sier det samme om
 * oss selv: «Et anslag presentert som en måling er en løgn med desimaler.»
 */
import { firma, erUferdig } from "./firma";
import { pakker, loepende } from "./priser";
import type { Sporsmaal } from "./faq";
import type { Artikkel } from "./artikler";

type Node = Record<string, unknown>;

const KONTEKST = "https://schema.org";

/** Absolutt URL. Schema.org vil ha hele adressen, ikke en relativ sti. */
export const abs = (sti: string): string => new URL(sti, firma.url).href;

/**
 * Skrivemåtene folk faktisk bruker om oss. Samme liste på `ProfessionalService`
 * og på `WebSite`, fordi Google leser dem til to ULIKE formål:
 *
 *  - på foretaket for å kjenne igjen virksomheten (entitetsoppslag)
 *  - på nettstedet for «nettstedsnavnet» i resultatlisten, som Google henter
 *    fra `WebSite.name` med `alternateName` som reserve
 *    (developers.google.com/search/docs/appearance/site-names)
 *
 * Ingen oppdiktede former: dette er navnet med og uten stor K, det registrerte
 * foretaksnavnet og domenet.
 */
export const NAVNEFORMER = [
  "Kodekonsulentene",
  "KodeKonsulentene Elkassmi",
  "kodekonsulentene.no",
];

/**
 * Datoen foretaket ble registrert i Enhetsregisteret.
 *
 * Hentet fra data.brreg.no/enhetsregisteret/api/enheter/936374336, feltet
 * `registreringsdatoEnhetsregisteret`. Kontrollert 7. oktober 2026. Ikke en
 * markedsføringsdato – det er den datoen staten har.
 */
const REGISTRERT = "2025-10-14";

/**
 * ISO 6523-koden for norske organisasjonsnummer.
 *
 * Google lister `iso6523Code` blant identifikatorene som brukes «behind the
 * scenes to disambiguate your organization», og det er nettopp problemet vårt:
 * «kodekonsulent» er også en stilling i norsk helsevesen. Formatet er
 * «ICD:identifikator». ICD 0192 er registrert som Norwegian Organization Number
 * med Registerenheten i Brønnøysund som utsteder.
 */
const ICD_NORSK_ORGNR = "0192";

/**
 * Foretaket. Ligger på hver side via Base.astro.
 *
 * `@id` er fast og peker på forsiden med fragmentet `#foretak`. Det lar alle de
 * andre nodene vise HIT i stedet for å gjenta hele foretaket – uten den får
 * Google ett løsrevet foretak per side og vet ikke at det er samme virksomhet.
 *
 * MERK OM ADRESSE: `streetAddress` står med vilje tomt. firma.ts har bare
 * «Oslo», og ehandelsloven § 8 sin gateadresse er en kjent, åpen mangel – vi
 * publiserer ikke hjemmeadressen. En oppdiktet gateadresse i markup ville vært
 * både løgn og et brudd på Googles retningslinjer. Markupen er gyldig uten, men
 * foretaket kan ikke kvalifisere til alle lokale søkeresultater før adressen
 * finnes. Se docs/seo-teknisk.md.
 */
export const FORETAK_ID = abs("/") + "#foretak";

export function foretak(): Node {
  return {
    "@context": KONTEKST,
    "@type": "ProfessionalService",
    "@id": FORETAK_ID,
    name: firma.navn,
    legalName: firma.foretaksnavn,
    /**
     * Navnet kolliderer med et etablert yrkesbegrep: «kodekonsulent» er en
     * stilling i norsk helsevesen (medisinsk koding), og søk på ordet treffer
     * sykehusstillinger. Derfor må vi si utvetydig hvem VI er. `alternateName`
     * dekker skrivemåtene folk faktisk bruker.
     */
    alternateName: NAVNEFORMER,
    /**
     * Bare profiler vi FAKTISK har, og som navngir foretaket. Begge er verifisert
     * med HTTP 200 og inneholder navnet. En `sameAs` mot en LinkedIn-side vi ikke
     * har ville vært løgn – og Google oppdager det.
     *
     * Enhetsregisteret er det sterkeste signalet: et statlig register som knytter
     * navnet til org.nr. 936374336.
     */
    sameAs: [
      "https://virksomhet.brreg.no/nb/oppslag/enheter/936374336",
      "https://github.com/ZAKIN02/kodekonsulentene-web",
    ],
    description: firma.posisjonering,
    slogan: firma.tagline,
    url: firma.url,
    email: firma.epost,
    ...(firma.telefon ? { telephone: firma.telefon } : {}),
    /**
     * Registreringsdatoen i Enhetsregisteret, ikke en «grunnlagt»-dato vi har
     * funnet på. Den gjør foretaket lettere å skille fra likelydende navn, og
     * den er etterprøvbar mot registeret.
     */
    foundingDate: REGISTRERT,
    /**
     * Ett kontaktpunkt, og bare det vi faktisk svarer på. Ingen telefon her før
     * `firma.telefon` har et nummer – et kontaktpunkt uten kanal er ingen hjelp.
     */
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: firma.epost,
      ...(firma.telefon ? { telephone: firma.telefon } : {}),
      availableLanguage: ["nb-NO", "en"],
      areaServed: "NO",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: firma.adresse,
      addressRegion: "Oslo",
      addressCountry: "NO",
    },
    areaServed: { "@type": "City", name: "Oslo", "@id": "https://www.wikidata.org/wiki/Q585" },
    priceRange: "14 900–60 000 NOK",
    currenciesAccepted: "NOK",
    knowsLanguage: ["nb-NO", "en"],
    logo: abs("/logo/icon-512.png"),
    image: abs("/og/forside.png"),
    // Enkeltpersonforetak har ingen ansatte utover innehaveren. Vi oppgir det
    // fordi det er en reell del av posisjoneringen: du snakker med den som koder.
    numberOfEmployees: { "@type": "QuantitativeValue", value: 1 },
    ...(erUferdig
      ? {}
      : {
          taxID: firma.orgnr,
          // Eksplisitt navngitt ordning. `taxID` alene sier ikke hvilket register
          // nummeret hoerer til; dette knytter det til Enhetsregisteret.
          identifier: {
            "@type": "PropertyValue",
            propertyID: "Organisasjonsnummer",
            value: firma.orgnr,
          },
          // Samme nummer, men i det maskinlesbare formatet Google oppgir at den
          // bruker til aa skille foretak med likelydende navn fra hverandre.
          iso6523Code: `${ICD_NORSK_ORGNR}:${firma.orgnr}`,
          ...(firma.mva ? { vatID: `NO${firma.orgnr}MVA` } : {}),
        }),
  };
}

/**
 * Nettstedet selv.
 *
 * Dette er noden Google henter «nettstedsnavnet» fra – navnet som står over
 * tittelen i resultatlisten i stedet for den rå URL-en. Google dokumenterer at
 * den leser `WebSite.name` og bruker `alternateName` som reserve, og at markupen
 * må ligge på FORSIDEN (domenets rot). Den ligger på hver side her, som er
 * tillatt – kopiene på undersidene ignoreres – men det er forsiden som gjelder.
 *
 * `alternateName` sto ikke her før. Den sto bare på foretaket, og det er en annen
 * node med et annet formål: nettstedsnavnet leses ikke fra `ProfessionalService`.
 *
 * Her er det én ting som IKKE står: `SearchAction`. Den forteller Google at
 * nettstedet har et søkefelt som tar en fritekst-spørring. Vi har ingen
 * nettstedssøk – /sjekk analyserer en ANNEN nettside og er ikke et søk i vårt
 * innhold. Å merke den opp som søk ville fått Google til å sende brukere til en
 * side som ikke svarer på det de spurte om.
 */
export function nettsted(): Node {
  return {
    "@context": KONTEKST,
    "@type": "WebSite",
    "@id": abs("/") + "#nettsted",
    url: firma.url,
    name: firma.navn,
    alternateName: NAVNEFORMER,
    description: firma.posisjonering,
    inLanguage: "nb-NO",
    publisher: { "@id": FORETAK_ID },
  };
}

/**
 * Seksjonssider som faktisk finnes, med navnet de skal ha i brødsmulene.
 *
 * Bare ekte sider står her. `/bransjer` er IKKE en side – den finnes bare som
 * mappe – så en brødsmule dit ville pekt på 404. Mellomledd som ikke svarer,
 * hoppes over.
 */
const SEKSJON: Record<string, string> = {
  "/artikler": "Artikler",
  "/nettsider": "Nettsider",
  "/systemer": "Systemer",
  "/apper-og-ai": "Apper og AI",
  "/sikkerhet": "Sikkerhet",
  "/verktoy": "Verktøy",
  "/priser": "Priser",
  "/om": "Om",
  "/caser": "Caser",
  "/handbok": "Håndbok",
  "/sjekk": "Sjekk nettsiden din",
  "/historie": "Historie",
  "/status": "Driftsstatus",
  "/kontakt": "Kontakt",
};

/**
 * Brødsmuler utledet av stien.
 *
 * Google viser dem i resultatlisten i stedet for den rå URL-en, og de hjelper
 * særlig undersider som /verktoy/dmarc, der stien forteller hvor man er.
 * Returnerer null på forsiden – en brødsmulesti med bare «Hjem» er støy.
 */
export function brodsmuler(sti: string, tittel: string): Node | null {
  const rent = sti.replace(/\/+$/, "") || "/";
  if (rent === "/") return null;

  const ledd: { navn: string; url: string | null }[] = [{ navn: "Hjem", url: abs("/") }];
  const deler = rent.split("/").filter(Boolean);

  for (let i = 0; i < deler.length - 1; i++) {
    const delsti = "/" + deler.slice(0, i + 1).join("/");
    // Hopp over mellomledd som ikke er en ekte side (f.eks. /bransjer).
    if (SEKSJON[delsti]) ledd.push({ navn: SEKSJON[delsti], url: abs(delsti) });
  }
  // Siste ledd er siden du står på. Den får ingen `item`: Google forventer at
  // den siste brødsmulen ikke lenker til seg selv.
  ledd.push({ navn: tittel, url: null });

  return {
    "@context": KONTEKST,
    "@type": "BreadcrumbList",
    itemListElement: ledd.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: l.navn,
      ...(l.url ? { item: l.url } : {}),
    })),
  };
}

/** Pakkene som tilbud. Prisene kommer fra priser.ts, aldri skrevet inn her. */
function tilbud(navn: string[]): Node[] {
  return pakker
    .filter((p) => navn.includes(p.navn))
    .map((p) => ({
      "@type": "Offer",
      name: p.navn,
      description: p.beskrivelse,
      price: p.pris.replace(/\D/g, ""),
      priceCurrency: "NOK",
      // Alle priser på siden er eks. mva. Sier vi det ikke, antar Google inkl.
      // `prefiks: "fra"` betyr at prisen er et gulv, ikke et fast tall – da
      // oppgis den som minPrice, ellers som price.
      priceSpecification: {
        "@type": "PriceSpecification",
        ...(p.prefiks === "fra"
          ? { minPrice: p.pris.replace(/\D/g, "") }
          : { price: p.pris.replace(/\D/g, "") }),
        priceCurrency: "NOK",
        valueAddedTaxIncluded: false,
      },
      availability: "https://schema.org/InStock",
      url: abs(p.href),
      seller: { "@id": FORETAK_ID },
    }));
}

/** En tjenesteside: hva vi gjør, for hvem, til hvilken pris. */
export function tjeneste(o: {
  type: string;
  navn: string;
  beskrivelse: string;
  sti: string;
  pakker?: string[];
}): Node {
  return {
    "@context": KONTEKST,
    "@type": "Service",
    "@id": abs(o.sti) + "#tjeneste",
    serviceType: o.type,
    name: o.navn,
    description: o.beskrivelse,
    provider: { "@id": FORETAK_ID },
    areaServed: { "@type": "City", name: "Oslo" },
    url: abs(o.sti),
    ...(o.pakker?.length
      ? {
          offers: tilbud(o.pakker),
        }
      : {}),
  };
}

/**
 * Verktøyene. `WebApplication` og ikke `SoftwareApplication`, fordi de kjører i
 * nettleseren og ikke installeres.
 *
 * `price: "0"` er sant: alle fem er gratis og krever ingen innlogging. Det er
 * også grunnen til at de er våre beste inngangsporter fra søk.
 */
export function verktoy(o: { navn: string; beskrivelse: string; sti: string }): Node {
  return {
    "@context": KONTEKST,
    "@type": "WebApplication",
    "@id": abs(o.sti) + "#verktoy",
    name: o.navn,
    description: o.beskrivelse,
    url: abs(o.sti),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Alle med nettleser",
    browserRequirements: "Krever JavaScript for resultat uten omlasting; virker også uten.",
    inLanguage: "nb-NO",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "NOK" },
    provider: { "@id": FORETAK_ID },
  };
}

/** FAQ. Tar spørsmålene fra faq.ts, så markup og side alltid er like. */
export function faqSide(sporsmaal: Sporsmaal[]): Node {
  return {
    "@context": KONTEKST,
    "@type": "FAQPage",
    mainEntity: sporsmaal.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * En artikkel.
 *
 * Datoene kommer fra `artikler.ts` og er de samme som står i brødteksten på
 * siden: `publisert` er publiseringsdatoen, `oppdatert` er datoen innholdet sist
 * ble kontrollert mot kilden. Ingen av dem settes til «i dag» for å se fersk ut –
 * en dateModified som flytter seg uten at innholdet er rørt, er en løgn Google
 * uansett kan sammenligne med sin egen forrige kravling.
 *
 * `author` og `publisher` peker på foretaket, ikke på en person. Siden snakker i
 * vi-form og navngir ingen; et oppdiktet forfatternavn hadde vært verre enn
 * ingen.
 */
export function artikkel(a: Artikkel): Node {
  const url = abs(`/artikler/${a.slug}`);
  return {
    "@context": KONTEKST,
    "@type": "Article",
    "@id": url + "#artikkel",
    headline: a.tittel,
    description: a.beskrivelse,
    abstract: a.loefte,
    datePublished: a.publisert,
    dateModified: a.oppdatert,
    inLanguage: "nb-NO",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@id": FORETAK_ID },
    publisher: { "@id": FORETAK_ID },
    isPartOf: { "@id": abs("/") + "#nettsted" },
  };
}

/**
 * Artikkeloversikten. En `CollectionPage` med `hasPart`, så Google ser at de tre
 * artiklene hører sammen og hvor inngangen til dem er.
 */
export function artikkelOversikt(liste: Artikkel[]): Node {
  return {
    "@context": KONTEKST,
    "@type": "CollectionPage",
    "@id": abs("/artikler") + "#oversikt",
    name: "Artikler",
    url: abs("/artikler"),
    inLanguage: "nb-NO",
    isPartOf: { "@id": abs("/") + "#nettsted" },
    publisher: { "@id": FORETAK_ID },
    hasPart: liste.map((a) => ({
      "@type": "Article",
      "@id": abs(`/artikler/${a.slug}`) + "#artikkel",
      headline: a.tittel,
      url: abs(`/artikler/${a.slug}`),
      datePublished: a.publisert,
      dateModified: a.oppdatert,
    })),
  };
}

/** De løpende avtalene, til /priser. */
export function loependeTilbud(): Node[] {
  return loepende.map((r) => ({
    "@type": "Offer",
    name: r.navn,
    description: r.tekst,
    priceCurrency: "NOK",
    availability: "https://schema.org/InStock",
    seller: { "@id": FORETAK_ID },
  }));
}
