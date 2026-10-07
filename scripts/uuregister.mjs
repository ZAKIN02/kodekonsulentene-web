/**
 * Henter Uu-tilsynets åpne datasett og skriver et datert øyeblikksbilde til
 * `src/data/uu-register.json`.
 *
 *     node scripts/uuregister.mjs            # henter og skriver
 *     node scripts/uuregister.mjs --torr     # henter og skriver INGENTING
 *
 * KJØRES FOR HÅND, IKKE I BYGGET. Settet er ~250 MB over ti forespørsler.
 * Et bygg som må laste det ned, er et bygg som feiler den dagen tilsynet bytter
 * sertifikat eller rate-begrenser oss. Resultatet er ~9 kB JSON som sjekkes inn,
 * så siden bygger uten nett og tallet på siden er alltid det tallet vi faktisk
 * har sett. Kjør den på nytt når tallene skal oppdateres; diffen i git er da
 * selve dokumentasjonen på hva som endret seg.
 *
 * TRE KVIRKER I API-ET, alle målt 7. oktober 2026. De står her fordi de kostet
 * tid å finne og ikke er dokumentert hos kilden:
 *
 *   1. `page` er 1-indeksert i praksis. `?page=0` svarer HTTP 200 med en TOM
 *      konvolutt – `_embedded` mangler helt – selv om `page.totalPages` sier at
 *      sidene finnes. Utelater man `page`, får man side 1. Dataene ligger på
 *      1..totalPages.
 *   2. `size=1000` virker, men BARE sammen med `page >= 1`. Kombinasjonen
 *      `page=0&size=1000` ser ut som en tom respons og leses lett som at store
 *      sider ikke støttes. `docs/research-2026.md` oppgir «paginert i 955 sider
 *      på 10, men godtar size=1000»; det første er standarden, det andre krever
 *      altså page >= 1.
 *   3. `Accept: application/json` gir HTTP 406. API-et svarer
 *      `application/hal+json`. Vi sender ingen Accept-header.
 *
 * Og én ting vi IKKE bruker: `/dataset/metadata` svarer HTTP 500 med full
 * Java-stacktrace. Lisensen er derfor lest på tilsynets egen nettside i stedet,
 * og funnet er ført i `assets/LICENSES.md`.
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { aggreger, KRAVNAVN, kravNokkel } from "../src/lib/uuregister.ts";

const HER = dirname(fileURLToPath(import.meta.url));
const UT = resolve(HER, "../src/data/uu-register.json");

const KILDE = "https://data.uutilsynet.no/dataset/alle-erklaeringer";
const DOKUMENTASJON =
  "https://www.uutilsynet.no/innsikt-og-analyse/opne-data-fra-tilgjengelegheitserklaeringane/3076";
const SIDESTOERRELSE = 1000;

const torr = process.argv.includes("--torr");

/** Felter vi tar vare på. Resten kastes før aggregeringen, ellers ligger
 *  250 MB i minnet samtidig som vi teller. */
function slank(d) {
  return {
    erklaeringId: d.erklaeringId,
    organisasjonsnummer: d.organisasjonsnummer,
    iktLoeysingType: d.iktLoeysingType,
    samsvarsstatus: d.samsvarsstatus,
    talSamsvar: d.talSamsvar,
    talBrot: d.talBrot,
    talIkkjeRelevant: d.talIkkjeRelevant,
    sisteOppdatering: d.sisteOppdatering,
    resultat: (d.resultat ?? []).map((r) => ({
      krav: r.krav,
      oppfyllerAltInnhaldKravet: r.oppfyllerAltInnhaldKravet,
    })),
  };
}

async function hentSide(side) {
  const url = `${KILDE}?page=${side}&size=${SIDESTOERRELSE}`;
  const svar = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!svar.ok) throw new Error(`${url} svarte HTTP ${svar.status}`);
  const json = await svar.json();
  return {
    rader: (json._embedded?.dataElements ?? []).map(slank),
    totalt: json.page?.totalElements ?? 0,
    sider: json.page?.totalPages ?? 0,
  };
}

const alle = [];
const sett = new Set();
let lovet = 0;

// Side 1 og oppover, til en side kommer tom. Grensen på 50 er en brems mot en
// endring i API-et som gjør at `next` aldri slutter å peke videre.
for (let side = 1; side <= 50; side++) {
  const { rader, totalt } = await hentSide(side);
  lovet = totalt || lovet;
  if (rader.length === 0) {
    process.stderr.write(`side ${side}: tom – stopper\n`);
    break;
  }
  let nye = 0;
  for (const r of rader) {
    if (sett.has(r.erklaeringId)) continue;
    sett.add(r.erklaeringId);
    alle.push(r);
    nye++;
  }
  process.stderr.write(`side ${side}: ${rader.length} rader, ${nye} nye (sum ${alle.length})\n`);
  if (alle.length >= lovet && lovet > 0) break;
}

if (alle.length === 0) throw new Error("Hentet null erklæringer. Skriver ingenting.");
if (lovet && alle.length !== lovet) {
  // Ikke en fatal feil – men tallet som havner på siden skal være det vi SÅ,
  // og avviket skal stå i filen, ikke bare i terminalen.
  process.stderr.write(`ADVARSEL: API-et oppgir ${lovet}, vi fikk ${alle.length}.\n`);
}

const tall = aggreger(alle);

// Kontroll: dekker navnetabellen alle kravene registeret faktisk bruker?
// En rad uten navn ville rendret som et bart nummer på en salgsside.
const utenNavn = tall.kravRader.map((r) => r.krav).filter((k) => !KRAVNAVN[k]);
const ubrukteNavn = Object.keys(KRAVNAVN).filter(
  (k) => !tall.kravRader.some((r) => r.krav === k),
);
if (utenNavn.length) process.stderr.write(`ADVARSEL: krav uten navn: ${utenNavn.join(", ")}\n`);
if (ubrukteNavn.length) process.stderr.write(`Merk: navn uten krav i settet: ${ubrukteNavn.join(", ")}\n`);

const ut = {
  _: "GENERERT av scripts/uuregister.mjs. Ikke rediger for hånd – kjør skriptet.",
  hentet: new Date().toISOString().slice(0, 10),
  kilde: KILDE,
  dokumentasjon: DOKUMENTASJON,
  ansvarlig: "Tilsynet for universell utforming av ikt",
  /** Hva API-et selv oppgir, mot hva vi faktisk fikk. */
  oppgittAvApi: lovet,
  ...tall,
  // Stabil rekkefølge på statusnøklene, ellers flytter de seg mellom hentinger
  // og diffen i git blir støy i stedet for innhold.
  status: Object.fromEntries(Object.entries(tall.status).sort((a, b) => b[1] - a[1])),
  kravRader: tall.kravRader.map((r) => ({ ...r })),
};

process.stdout.write(
  [
    `erklæringer        ${ut.erklaeringer} (API oppgir ${ut.oppgittAvApi})`,
    `virksomheter       ${ut.virksomheter}`,
    `nettsteder / apper ${ut.nettsteder} / ${ut.apper}`,
    `minst ett brudd    ${ut.medMinstEttBrudd} = ${ut.andelMedBrudd} %`,
    `brudd snitt/med/mx ${ut.brudd.snitt} / ${ut.brudd.median} / ${ut.brudd.maks}`,
    `krav i settet      ${ut.kravRader.length}`,
    `integritet         ${ut.integritet.stemmer}/${ut.integritet.kontrollert} erklæringer der talBrot = antall «no»-rader`,
    `periode            ${ut.periode.foerste} – ${ut.periode.siste}`,
    "",
    "topp 12 etter andel brudd:",
    ...ut.kravRader
      .slice(0, 12)
      .map(
        (r) =>
          `  ${r.krav.padEnd(7)}${String(r.andel).padStart(5)} %  ${r.brot}/${r.vurdert}  ${KRAVNAVN[r.krav]?.navn ?? "?"}`,
      ),
    "",
  ].join("\n"),
);

if (torr) {
  process.stderr.write("--torr: skrev ingenting.\n");
} else {
  writeFileSync(UT, JSON.stringify(ut, null, 2) + "\n", "utf8");
  process.stderr.write(`Skrev ${UT}\n`);
}

// kravNokkel importeres for at en endring i sorteringen skal gi typefeil her
// og ikke en stille omstokking i datafilen.
void kravNokkel;
