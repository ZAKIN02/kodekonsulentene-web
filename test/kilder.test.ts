/**
 * VAKTEN PÅ KILDENE.
 *
 * Hele posisjoneringen er «vi måler, vi påstår ikke, og du kan etterprøve oss».
 * Den tåler ikke én død kildelenke. 7. oktober 2026 hadde `markedspriser.ts` to
 * feil av nøyaktig den typen vi selger oss på å ikke gjøre:
 *
 *   - `klarosites.no` sto som kilde for det laveste abonnementstallet. Domenet
 *     eksisterer ikke – NXDOMAIN, ingen navnetjener. Tallet 499 kr/mnd kunne
 *     ikke etterprøves av noen, og det sto likevel i en kalkulator vi ber
 *     bedriftseiere stole på. Det sto der i to dager med `sistSjekket`-dato.
 *   - HjemmesideHelten sto med «35 000 median / 42 800 snitt, 50 prosjekter i
 *     2025». Ingen av de tre tallene fantes på siden det var sitert fra.
 *
 * Begge ville blitt funnet av testene under. Den første av nettverksdelen, den
 * andre bare av et menneske som åpner lenken – derfor krever strukturdelen at
 * URL-en peker på noe mer spesifikt enn en forside der det er mulig.
 *
 * DELT I TRE, MED VILJE:
 *
 *   1. STRUKTUR. Kjører alltid, uten nett. Feiler hvis et tall mangler kilde
 *      eller dato, hvis datoen ikke er en gyldig fortidig ISO-dato, eller hvis
 *      et markedstall er eldre enn et år. Dette er den delen som må holde i CI.
 *   2. NAVNEOPPSLAG. Feiler hvis et kildedomene ikke finnes. Det er den billige
 *      kontrollen som ville tatt klarosites.no, og den krever bare DNS.
 *   3. SVAR. Feiler hvis en kilde-URL svarer 404, 410 eller en ekte serverfeil.
 *
 * Del 2 og 3 hopper over seg selv når maskinen ikke har nett, slik at `npm test`
 * virker på fly og i en lukket byggkontekst. De hopper ALDRI over på grunn av
 * at en enkelt kilde feiler – da skal de være røde. Sett `KILDESJEKK=av` for å
 * slå dem av med vilje, for eksempel i en rask lokal runde.
 *
 * OM ROBOTSPERRER. Lovdata, Forbrukertilsynet og flere offentlige nettsteder
 * svarer 403, 406, 429 eller 503 på automatiske oppslag uten at dokumentet er
 * borte. En test som dømmer dem døde ville tvunget oss til å fjerne riktige
 * lovhenvisninger, og det er en verre feil enn den den fanger. Oppføringer som
 * er merket `robotsperre: true` i kilder.ts får derfor passere på de kodene –
 * men bare på dem, og bare når noen har kontrollert lenken i en ekte nettleser
 * og skrevet datoen i `hentet`.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { resolve as dnsResolve } from "node:dns/promises";

import { kilder } from "../src/data/kilder.ts";
import { markedspriser, markedTimepris } from "../src/data/markedspriser.ts";

/* ------------------------------------------------------------- hjelpere ---- */

const IDAG = new Date();
const DAG = 86_400_000;

/** ISO-dato (YYYY-MM-DD) som faktisk finnes i kalenderen. */
function erIsoDato(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const alder = (iso: string) => Math.floor((IDAG.getTime() - new Date(`${iso}T00:00:00Z`).getTime()) / DAG);

/**
 * URL-er i src/data/ som ikke bærer en påstand, med begrunnelse per oppføring.
 *
 * De er identitetslenker og vokabular – `sameAs`, `@id`, plassholdere – ikke
 * kilder til et tall. De slipper derfor kravet om å stå i kilderegisteret, men
 * de er FORTSATT med i navneoppslaget og svarsjekken under: en død `sameAs`
 * svekker de strukturerte dataene like fullt. Lista er kort med vilje, og alt
 * som ikke står her må gjøres rede for.
 */
const UTEN_PAASTAND = new Map([
  ["https://schema.org", "vokabular-identifikator i strukturerte data, ikke en kilde vi siterer"],
  ["https://schema.org/InStock", "vokabular-identifikator i strukturerte data"],
  ["https://www.wikidata.org/wiki/Q585", "@id for Oslo i areaServed – en identifikator, ikke et tall"],
  ["https://virksomhet.brreg.no/nb/oppslag/enheter/936374336", "sameAs: samme foretak, menneskelesbart oppslag. Tallene hentes fra API-et, som står i kilder.ts"],
  ["https://github.com/ZAKIN02/kodekonsulentene-web", "sameAs: vårt eget repo"],
  ["https://dinbedrift.no", "dokumentert plassholderdomene, se sjekk-sekvens.ts"],
  ["https://kodekonsulentene.no", "vår egen side. Interne lenker dekkes av .skudd/lenker.mjs"],
]);

/** Alle filer under src/data/, uansett dybde. */
function datafiler(dir = "src/data"): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? datafiler(p) : [p];
  });
}

/**
 * Hver eksterne URL i src/data/, med filen den står i.
 *
 * Henter fra ALLE filer, ikke bare de vi husker å føre opp. Det er poenget:
 * neste gang noen limer inn en kilde i en ny datafil, blir den kontrollert uten
 * at noen må huske å melde den inn.
 */
function urlerIData(): Map<string, string[]> {
  const funn = new Map<string, string[]>();
  for (const f of datafiler()) {
    const tekst = readFileSync(f, "utf8");
    for (const m of tekst.matchAll(/https?:\/\/[^\s"'`)<>,]+/g)) {
      const u = m[0].replace(/[.,;:]+$/, "");
      // Malstrenger (`https://cal.com/${firma.cal}`) er ikke en adresse.
      if (u.includes("${")) continue;
      if (!funn.has(u)) funn.set(u, []);
      const liste = funn.get(u)!;
      if (!liste.includes(f)) liste.push(f);
    }
  }
  return funn;
}

const DATA_URLER = urlerIData();
const REGISTRERTE = new Set(kilder.map((k) => k.url));
const ROBOTSPERRE = new Set(kilder.filter((k) => k.robotsperre).map((k) => k.url));

/* =============================================== 1. STRUKTUR, uten nett ==== */

describe("markedspriser: ingen tall uten kilde og dato", () => {
  test("det finnes markedstall å kontrollere i det hele tatt", () => {
    assert.ok(markedspriser.length > 0, "markedspriser er tom – da viser kalkulatoren ingen sammenheng");
  });

  for (const m of markedspriser) {
    const navn = `${m.leverandor} – ${m.gjelder}`;

    test(`${navn}: har minst én kilde-URL`, () => {
      assert.ok(Array.isArray(m.kilde) && m.kilde.length > 0, `${navn} står uten kilde. Et markedstall uten kilde skal ut av fila, ikke stå med forbehold.`);
      for (const u of m.kilde) {
        assert.doesNotThrow(() => new URL(u), `${navn}: «${u}» er ikke en gyldig URL`);
        assert.match(u, /^https:\/\//, `${navn}: kilden må være https, ikke «${u}»`);
      }
    });

    test(`${navn}: har et tall, og tallet er et beløp`, () => {
      assert.ok(typeof m.lav === "number" && m.lav > 0, `${navn} mangler nedre beløp`);
      if (m.hoy !== null) {
        assert.ok(typeof m.hoy === "number" && m.hoy >= (m.lav ?? 0), `${navn}: øvre beløp er lavere enn nedre`);
      }
    });

    test(`${navn}: sistSjekket er en fortidig ISO-dato, ikke eldre enn et år`, () => {
      assert.ok(erIsoDato(m.sistSjekket), `${navn}: «${m.sistSjekket}» er ikke en gyldig ISO-dato`);
      const d = alder(m.sistSjekket);
      assert.ok(d >= 0, `${navn}: sistSjekket ligger i framtiden. En dato vi ikke har vært i er ikke en kontroll.`);
      assert.ok(
        d <= 365,
        `${navn}: sist sjekket for ${d} dager siden. Åpne hver kilde, bekreft tallet og sett ny dato – ` +
          `et markedstall uten fersk dato er verdiløst i en kalkulator.`,
      );
    });

    test(`${navn}: når kilden er en forside, står forbeholdet i merknaden`, () => {
      // En forside endrer seg uten varsel. Står tallet bare der, skal leseren få
      // vite hva det gjaldt – ellers ser et riktig tall galt ut ved neste
      // redesign. Innovena-raden sto med forsiden som kilde, og der fins ingen pris.
      const barePaaForsiden = m.kilde.every((u) => new URL(u).pathname === "/");
      if (!barePaaForsiden) return;
      assert.ok(
        m.merknad && m.merknad.length > 20,
        `${navn}: kilden peker bare på en forside. Da skal merknaden si hvilke pakker og beløp tallet er satt sammen av.`,
      );
    });
  }

  test("markedTimepris har kilde og fersk dato", () => {
    assert.ok(markedTimepris.kilde.length > 0, "markedTimepris står uten kilde");
    assert.ok(erIsoDato(markedTimepris.sistSjekket), "markedTimepris.sistSjekket er ikke en ISO-dato");
    assert.ok(alder(markedTimepris.sistSjekket) <= 365, "markedTimepris er eldre enn et år");
    assert.ok(markedTimepris.byraaLav < markedTimepris.byraaHoy, "byråspennet er snudd");
    assert.ok(markedTimepris.frilansLav < markedTimepris.frilansHoy, "frilansspennet er snudd");
  });
});

describe("kilderegisteret: hver oppføring kan etterprøves", () => {
  test("id-ene er unike", () => {
    const ider = kilder.map((k) => k.id);
    assert.equal(new Set(ider).size, ider.length, `dublett-id i kilder.ts: ${ider.join(", ")}`);
  });

  for (const k of kilder) {
    test(`${k.id}: henvisning, URL og hentet-dato er på plass`, () => {
      assert.ok(k.henvisning.length > 10, `${k.id}: henvisningen er for kort til å kunne etterprøves`);
      assert.doesNotThrow(() => new URL(k.url), `${k.id}: «${k.url}» er ikke en gyldig URL`);
      assert.match(k.url, /^https:\/\//, `${k.id}: kilden må være https`);
      assert.ok(erIsoDato(k.hentet), `${k.id}: «${k.hentet}» er ikke en gyldig ISO-dato`);
      assert.ok(alder(k.hentet) >= 0, `${k.id}: hentet-datoen ligger i framtiden`);
      if (k.kildeOppdatert !== undefined) {
        assert.ok(erIsoDato(k.kildeOppdatert), `${k.id}: kildeOppdatert er ikke en ISO-dato`);
      }
    });
  }

  /**
   * DEN SPESIFIKKE LÆREPENGEN. SSB flyttet 2026-tallene fra tabell 10975
   * (SN2007) til tabell 14933 (SN2025), og de to tabellene gir ULIKE tall for
   * samme næring. En researcher som etterprøvde oss mot den gamle tabellen
   * konkluderte med at 72 % ikke fantes. Tallet var riktig; henvisningen var
   * for upresis. «SSB» uten tabellnummer er derfor ikke en kilde.
   */
  test("en statistikkilde siteres med tabellnummer, ikke bare med registernavn", () => {
    for (const k of kilder) {
      if (!/\bSSB\b|statistikkbank|statbank/i.test(k.henvisning)) continue;
      assert.match(
        k.henvisning,
        /tabell\s*\d{4,5}/i,
        `${k.id}: «${k.henvisning}» navngir SSB uten tabellnummer. To tabeller dekker samme tema med ulike tall, ` +
          `og den som kontrollerer oss mot feil tabell tror vi lyver.`,
      );
    }
  });

  test("SSB-tabellen vi faktisk bruker har både tabellnummer, næringsstandard og lesedato", () => {
    const ssb = kilder.find((k) => k.id === "ssb-14933");
    assert.ok(ssb, "kilden ssb-14933 er borte. Tallene 72 % og 86 % på /bransjer/handverkere henger på den.");
    assert.match(ssb.henvisning, /14933/, "henvisningen må inneholde tabellnummeret");
    assert.match(ssb.henvisning, /SN2025/, "henvisningen må si hvilken næringsstandard tallene følger");
    assert.ok(
      ssb.forbehold?.some((f) => /10975/.test(f)),
      "forbeholdet må peke på den gamle tabellen 10975, ellers gjentar neste kontrollør samme feil",
    );
    assert.ok(
      ssb.lest?.some((l) => /\b72\b/.test(l)) && ssb.lest?.some((l) => /\b86\b/.test(l)),
      "de to tallene vi publiserer skal stå i `lest`, slik at ingen må lete dem opp på nytt",
    );
  });

  /**
   * Et tall fra en kilde er verdiløst hvis ingen har skrevet ned hva som faktisk
   * sto der. Da er neste runde «jeg tror det sto 72» – og det er sånn oppdiktede
   * tall oppstår, uten at noen har løyet.
   */
  test("hver kilde som bærer et tall eller en ordlyd har skrevet ned hva som sto der", () => {
    const uten = kilder.filter((k) => !k.lest?.length && !k.forbehold?.length);
    assert.deepEqual(
      uten.map((k) => k.id),
      [],
      "disse kildene står uten `lest` og uten `forbehold`. Skriv ned hva du leste, ellers er oppføringen bare en lenke.",
    );
  });
});

describe("alle eksterne URL-er i src/data/ er gjort rede for", () => {
  test("det finnes URL-er å kontrollere", () => {
    assert.ok(DATA_URLER.size > 5, `fant bare ${DATA_URLER.size} URL-er i src/data/ – uttrekket er sannsynligvis ødelagt`);
  });

  /**
   * Et domene som bare står ett sted i en datafil er det ingen som ser på igjen.
   * Vi krever ikke at alt er i kilderegisteret – priskalkulatorens leverandører
   * hører hjemme i markedspriser.ts – men vi krever at hver URL er ETT av to:
   * en registrert kilde, eller en markedspris med dato.
   */
  test("hver URL er enten en registrert kilde eller en markedsprisrad", () => {
    const fraMarked = new Set<string>([...markedspriser.flatMap((m) => m.kilde), ...markedTimepris.kilde]);
    const ukjente: string[] = [];
    for (const [u, filer] of DATA_URLER) {
      if (REGISTRERTE.has(u) || fraMarked.has(u) || UTEN_PAASTAND.has(u)) continue;
      ukjente.push(`${u}  (i ${filer.join(", ")})`);
    }
    assert.deepEqual(
      ukjente,
      [],
      "disse URL-ene står i src/data/ uten å være ført opp som kilde med dato. Legg dem i src/data/kilder.ts, " +
        "eller ta dem ut. Et udokumentert domene i datalaget er neste klarosites.no.",
    );
  });
});

/* ============================== 2 og 3. NETTVERK, hopper over uten nett ==== */

const avslaatt = process.env.KILDESJEKK === "av";
let harNett = false;
if (!avslaatt) {
  try {
    await dnsResolve("ssb.no");
    harNett = true;
  } catch {
    harNett = false;
  }
}
const hoppAarsak = avslaatt
  ? "KILDESJEKK=av"
  : harNett
    ? false
    : "ingen nettforbindelse – kildelenkene er ikke kontrollert i denne runden";

/** Alt vi vil kontrollere: registeret, markedsprisene og resten av datalaget. */
const AA_SJEKKE = [...new Set([...DATA_URLER.keys(), ...REGISTRERTE])].sort();

describe("kildedomenene finnes", { skip: hoppAarsak }, () => {
  test("ingen kilde peker på et domene som ikke er registrert (NXDOMAIN)", async () => {
    const borte: string[] = [];
    for (const u of AA_SJEKKE) {
      const vert = new URL(u).hostname;
      try {
        await dnsResolve(vert);
      } catch (e) {
        const kode = (e as { code?: string }).code;
        // ENOTFOUND/NXDOMAIN = domenet finnes ikke. Alt annet (timeout,
        // SERVFAIL) kan være vår egen linje, og skal ikke dømme kilden død.
        if (kode === "ENOTFOUND" || kode === "NXDOMAIN") {
          borte.push(`${vert}  (${u}) i ${DATA_URLER.get(u)?.join(", ") ?? "src/data/kilder.ts"}`);
        }
      }
    }
    assert.deepEqual(
      borte,
      [],
      "disse kildedomenene finnes ikke. Et tall med et dødt domene som kilde kan ikke etterprøves, " +
        "og skal fjernes – ikke omskrives.",
    );
  });
});

describe("kildelenkene svarer", { skip: hoppAarsak }, () => {
  test(
    "ingen kilde svarer 404, 410 eller en ekte serverfeil",
    { timeout: 180_000 },
    async () => {
      /** HEAD først; noen tjenere avviser den, og da gjentas forsøket med GET. */
      async function status(u: string): Promise<number | string> {
        for (const metode of ["HEAD", "GET"] as const) {
          try {
            const r = await fetch(u, {
              method: metode,
              redirect: "follow",
              headers: { "user-agent": "KodeKonsulentene-kildesjekk" },
              signal: AbortSignal.timeout(20_000),
            });
            if ((r.status === 405 || r.status === 501) && metode === "HEAD") continue;
            return r.status;
          } catch (e) {
            if (metode === "GET") return `feil: ${String((e as Error).message).slice(0, 60)}`;
          }
        }
        return "feil: ukjent";
      }

      // Robotsperre-koder. Dokumentet er der; verten vil bare ikke snakke med
      // en maskin. Tolereres KUN for URL-er merket robotsperre i kilder.ts.
      const SPERRE = new Set([401, 403, 406, 429, 503]);

      const doede: string[] = [];
      const uventetSperret: string[] = [];
      // Fire om gangen – vi skal ikke hamre på andres tjenere, og i hvert fall
      // ikke på Lovdata og SSB, som vi er avhengige av å kunne sitere.
      for (let i = 0; i < AA_SJEKKE.length; i += 4) {
        const bolk = AA_SJEKKE.slice(i, i + 4);
        const svar = await Promise.all(bolk.map(status));
        bolk.forEach((u, j) => {
          const s = svar[j];
          const hvor = DATA_URLER.get(u)?.join(", ") ?? "src/data/kilder.ts";
          if (typeof s === "number" && s < 400) return;
          if (typeof s === "number" && SPERRE.has(s)) {
            if (ROBOTSPERRE.has(u)) return; // kjent og kontrollert i nettleser
            uventetSperret.push(`${s}  ${u}  (${hvor})`);
            return;
          }
          // Nettverksfeil kan være vår egen linje. Bare HTTP-koder dømmer.
          if (typeof s !== "number") return;
          doede.push(`${s}  ${u}  (${hvor})`);
        });
      }

      assert.deepEqual(
        doede,
        [],
        "disse kildelenkene er døde. Finn tallet på nytt eller fjern påstanden – ikke flytt URL-en til noe " +
          "som ser riktig ut.",
      );
      assert.deepEqual(
        uventetSperret,
        [],
        "disse kildene svarte med en robotsperre uten å være merket `robotsperre: true` i src/data/kilder.ts. " +
          "Åpne lenken i en ekte nettleser FØR du gjør noe: Lovdata gir falske 503. Virker den, sett merket " +
          "og oppdater `hentet`. Virker den ikke, fjern påstanden.",
      );
    },
  );
});
