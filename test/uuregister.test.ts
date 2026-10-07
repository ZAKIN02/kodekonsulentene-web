/**
 * Tester for aggregeringen av Uu-tilsynets åpne datasett.
 *
 * HVORFOR DISSE TESTENE ER STRENGE. Tallene fra denne filen havner i brødtekst
 * på en salgsside, med kilde og dato ved siden av. Æresregelen i CLAUDE.md gjelder
 * her på samme måte som i nettsidesjekken: et tall vi publiserer skal være et tall
 * vi har regnet riktig ut. De fire tingene som faktisk kan gå galt:
 *
 *   1. NEVNEREN. «Ikke relevant» er ikke en vurdering. Hadde den ligget i
 *      nevneren, ville 1.2.5 – som 5 094 av 9 549 erklæringer sier ikke gjelder
 *      dem – framstått som et lite problem i stedet for det største.
 *   2. SORTERINGEN av kravnummer. 1.4.10 er større enn 1.4.5, ikke mindre.
 *      Tekstsortering ville satt 1.4.10 rett etter 1.4.1.
 *   3. INTEGRITETSKONTROLLEN. Den skal faktisk fange et avvik, ellers er den
 *      pynt – og en integritetskontroll som alltid sier «stemmer» er verre enn
 *      ingen, fordi den brukes som argument.
 *   4. KOBLINGEN TIL SKANNEREN. Påstanden i artikkelen er at vår egen skanner
 *      bare dekker en del av toppen. Det tallet skal utledes av regellista, ikke
 *      skrives inn, slik at det ikke kan bli usant uten at en test blir rød.
 *
 * Testene bruker håndskrevne fixtures, ikke datasettet. En test som må laste ned
 * 250 MB er ikke en test.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import {
  aggreger,
  dekningIToppen,
  kravNokkel,
  maskinsjekkbareKrav,
  KRAVNAVN,
  type Erklaering,
} from "../src/lib/uuregister.ts";
import { WCAG_NAVN } from "../src/data/wcag.ts";
import registeret from "../src/data/uu-register.json" with { type: "json" };

/** Kortform for en erklæring med akkurat de radene testen handler om. */
function erkl(
  id: string,
  orgnr: string,
  rader: Array<[string, "yes" | "no" | "not_relevant"]>,
  over: Partial<Erklaering> = {},
): Erklaering {
  const brot = rader.filter(([, v]) => v === "no").length;
  const samsvar = rader.filter(([, v]) => v === "yes").length;
  return {
    erklaeringId: id,
    organisasjonsnummer: orgnr,
    iktLoeysingType: "nettstad",
    samsvarsstatus: brot > 0 ? "Delvis i samsvar" : "I samsvar",
    talSamsvar: samsvar,
    talBrot: brot,
    talIkkjeRelevant: rader.length - brot - samsvar,
    sisteOppdatering: "2026-01-01",
    resultat: rader.map(([krav, oppfyllerAltInnhaldKravet]) => ({
      krav,
      oppfyllerAltInnhaldKravet,
    })),
    ...over,
  };
}

describe("aggreger", () => {
  test("teller erklæringer, virksomheter og løsningstyper hver for seg", () => {
    const t = aggreger([
      erkl("a", "111", [["1.1.1", "no"]]),
      erkl("b", "111", [["1.1.1", "yes"]]),
      erkl("c", "222", [["1.1.1", "yes"]], { iktLoeysingType: "app" }),
    ]);
    assert.equal(t.erklaeringer, 3);
    // To erklæringer fra samme orgnr er én virksomhet. Uten dette ville
    // «virksomheter» vært en duplikattelling av løsninger.
    assert.equal(t.virksomheter, 2);
    assert.equal(t.nettsteder, 2);
    assert.equal(t.apper, 1);
  });

  test("«ikke relevant» holdes utenfor nevneren", () => {
    const t = aggreger([
      erkl("a", "1", [["1.2.5", "no"]]),
      erkl("b", "2", [["1.2.5", "yes"]]),
      erkl("c", "3", [["1.2.5", "not_relevant"]]),
      erkl("d", "4", [["1.2.5", "not_relevant"]]),
    ]);
    const rad = t.kravRader.find((r) => r.krav === "1.2.5")!;
    assert.equal(rad.brot, 1);
    assert.equal(rad.samsvar, 1);
    assert.equal(rad.ikkjeRelevant, 2);
    // 1 av 2 vurderte, ikke 1 av 4. Dette er testen som holder tallet sant.
    assert.equal(rad.vurdert, 2);
    assert.equal(rad.andel, 50);
  });

  test("ukjent verdi i oppfyllerAltInnhaldKravet telles som uvurdert, ikke som brudd", () => {
    // Legger kilden til en verdi vi ikke kjenner, skal den IKKE bli et brudd.
    // Å gjette «brudd» på noe vi ikke forstår er den falske «Ikke bestått».
    const t = aggreger([
      { ...erkl("a", "1", []), resultat: [{ krav: "1.1.1", oppfyllerAltInnhaldKravet: "vet_ikke" }] },
    ]);
    const rad = t.kravRader.find((r) => r.krav === "1.1.1")!;
    assert.equal(rad.brot, 0);
    assert.equal(rad.vurdert, 0);
    assert.equal(rad.andel, 0);
  });

  test("snitt, median og maks regnes på alle erklæringer, også de uten brudd", () => {
    const t = aggreger([
      erkl("a", "1", []),
      erkl("b", "2", [["1.1.1", "no"]]),
      erkl("c", "3", [["1.1.1", "no"], ["1.3.1", "no"], ["1.4.3", "no"]]),
    ]);
    assert.equal(t.brudd.sum, 4);
    assert.equal(t.brudd.median, 1);
    assert.equal(t.brudd.maks, 3);
    assert.equal(t.medMinstEttBrudd, 2);
    assert.equal(t.utenBrudd, 1);
    // En erklæring uten brudd som faller ut av nevneren ville løftet andelen fra
    // 66,7 til 100 – altså gjort hele poenget usant i vår favør.
    assert.equal(t.andelMedBrudd, 66.7);
  });

  test("median på et jevnt antall er gjennomsnittet av de to midterste", () => {
    const t = aggreger([
      erkl("a", "1", []),
      erkl("b", "2", [["1.1.1", "no"]]),
      erkl("c", "3", [["1.1.1", "no"], ["1.3.1", "no"]]),
      erkl("d", "4", [["1.1.1", "no"], ["1.3.1", "no"], ["1.4.3", "no"]]),
    ]);
    assert.equal(t.brudd.median, 1.5);
  });

  test("integritetskontrollen fanger at kildens egen sum ikke stemmer med radene", () => {
    const god = erkl("god", "1", [["1.1.1", "no"]]);
    const daarlig = { ...erkl("vond", "2", [["1.1.1", "no"]]), talBrot: 9 };
    const t = aggreger([god, daarlig]);
    assert.equal(t.integritet.kontrollert, 2);
    assert.equal(t.integritet.stemmer, 1);
    assert.equal(t.integritet.avvik.length, 1);
    assert.match(t.integritet.avvik[0], /vond: talBrot=9, rader=1/);
  });

  test("avvikslista har tak, så en ødelagt henting ikke skriver megabyte inn i git", () => {
    const mange = Array.from({ length: 40 }, (_, i) => ({
      ...erkl(`x${i}`, String(i), [["1.1.1", "no"]]),
      talBrot: 7,
    }));
    const t = aggreger(mange);
    assert.equal(t.integritet.stemmer, 0);
    assert.equal(t.integritet.avvik.length, 20);
  });

  test("tomt sett gir nuller, ikke NaN", () => {
    const t = aggreger([]);
    assert.equal(t.erklaeringer, 0);
    assert.equal(t.andelMedBrudd, 0);
    assert.equal(t.brudd.snitt, 0);
    assert.equal(t.brudd.median, 0);
    assert.equal(t.periode.foerste, "");
  });

  test("krav med samme andel sorteres på kravnummer, så rekkefølgen er stabil", () => {
    // Uten sekundærnøkkelen bytter to like rader plass mellom hver henting, og
    // diffen i src/data/uu-register.json blir støy i stedet for innhold.
    const t = aggreger([
      erkl("a", "1", [["1.4.10", "no"], ["1.4.5", "no"]]),
      erkl("b", "2", [["1.4.10", "yes"], ["1.4.5", "yes"]]),
    ]);
    assert.deepEqual(
      t.kravRader.map((r) => r.krav),
      ["1.4.5", "1.4.10"],
    );
  });
});

describe("kravNokkel", () => {
  test("sorterer 1.4.10 etter 1.4.5, ikke etter 1.4.1", () => {
    const sortert = ["1.4.10", "1.4.1", "1.4.5", "1.4.2"].sort((a, b) =>
      kravNokkel(a).localeCompare(kravNokkel(b)),
    );
    assert.deepEqual(sortert, ["1.4.1", "1.4.2", "1.4.5", "1.4.10"]);
  });
});

describe("koblingen til vår egen skanner", () => {
  test("maskinsjekkbare krav utledes av regellista, ikke skrives inn", () => {
    const sett = maskinsjekkbareKrav(WCAG_NAVN);
    // Finner den ingenting, er koblingen brutt og artikkelen hevder null dekning.
    assert.ok(sett.size > 0, "fant ingen WCAG-numre i WCAG_NAVN");
    // Kontrast og alt-tekst er de to reglene skanneren garantert har.
    assert.ok(sett.has("1.4.3"));
    assert.ok(sett.has("1.1.1"));
    // Synstolking kan ikke måles av en maskin, og skal derfor aldri dukke opp her.
    assert.ok(!sett.has("1.2.5"), "skanneren kan ikke sjekke 1.2.5");
  });

  test("hvert krav skanneren oppgir finnes i registerets kravtabell", () => {
    // Oppgir skanneren et kravnummer som ikke finnes i WCAG-settet registeret
    // bruker, er ett av de to stedene feil – og da skal det oppdages her.
    for (const krav of maskinsjekkbareKrav(WCAG_NAVN)) {
      assert.ok(KRAVNAVN[krav], `skanneren oppgir ${krav}, som mangler i KRAVNAVN`);
    }
  });

  test("dekningIToppen skiller det vi kan måle fra det vi ikke kan", () => {
    const rader = aggreger([
      erkl("a", "1", [["1.2.5", "no"], ["1.1.1", "no"], ["2.4.7", "no"]]),
    ]).kravRader;
    const d = dekningIToppen(rader, new Set(["1.1.1"]), 3);
    assert.equal(d.topp.length, 3);
    assert.deepEqual(d.dekket, ["1.1.1"]);
    assert.deepEqual(d.udekket.sort(), ["1.2.5", "2.4.7"]);
  });
});

describe("øyeblikksbildet som ligger i repoet", () => {
  test("er hentet, datert og fra den kilden vi oppgir", () => {
    assert.match(registeret.hentet, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(registeret.kilde, "https://data.uutilsynet.no/dataset/alle-erklaeringer");
    assert.ok(registeret.erklaeringer > 1000);
  });

  test("antallet vi fikk er antallet API-et oppgir", () => {
    // Står det ulike tall her, har vi mistet sider i pagineringen – og da er
    // andelen vi publiserer regnet på et annet sett enn det vi sier.
    assert.equal(registeret.erklaeringer, registeret.oppgittAvApi);
  });

  test("kildens egne summer stemmer med kildens egne rader, for hver erklæring", () => {
    assert.equal(registeret.integritet.stemmer, registeret.integritet.kontrollert);
    assert.deepEqual(registeret.integritet.avvik, []);
  });

  test("hver rad i kravtabellen har et norsk navn og en sti til kilden", () => {
    for (const r of registeret.kravRader) {
      const n = KRAVNAVN[r.krav];
      assert.ok(n, `kravet ${r.krav} mangler navn i KRAVNAVN`);
      assert.ok(n.navn.length > 2);
      // Stien er lest ut av tilsynets sitemap og kan ikke konstrueres av
      // kravnummeret. Mangler den, peker lenken i tabellen på en 404 hos
      // regulatoren – på en rad som finnes nettopp for å kunne kontrolleres.
      assert.match(n.sti, /^\d+-[a-z0-9-]+-niva(-aa)?\/\d+$/, `rar sti på ${r.krav}`);
      // Sifrene i stien skal være kravnummeret uten punktum. Blir en sti limt
      // inn på feil rad, sender tabellen leseren til et annet krav enn den sier.
      assert.equal(n.sti.split("-")[0], r.krav.replace(/\./g, ""));
    }
  });

  test("ingen to krav deler sti", () => {
    const stier = Object.values(KRAVNAVN).map((n) => n.sti);
    assert.equal(new Set(stier).size, stier.length);
  });

  test("andelen er regnet på vurderte krav, ikke på alle erklæringer", () => {
    for (const r of registeret.kravRader) {
      assert.equal(r.vurdert, r.brot + r.samsvar);
      assert.ok(r.vurdert + r.ikkjeRelevant <= registeret.erklaeringer);
      const forventet = Math.round((r.brot / r.vurdert) * 1000) / 10;
      assert.equal(r.andel, forventet, `feil andel på ${r.krav}`);
    }
  });

  test("summen av brudd per erklæring stemmer med summen i kravtabellen", () => {
    // To uavhengige veier til samme tall: `talBrot` lagt sammen, mot alle
    // «no»-radene lagt sammen. Spriker de, er aggregeringen gal.
    const fraTabell = registeret.kravRader.reduce((s, r) => s + r.brot, 0);
    assert.equal(fraTabell, registeret.brudd.sum);
  });

  test("statusfordelingen summerer til antall erklæringer", () => {
    const sum = Object.values(registeret.status).reduce((a, b) => a + b, 0);
    assert.equal(sum, registeret.erklaeringer);
  });

  test("nettsteder og apper summerer til antall erklæringer", () => {
    assert.equal(registeret.nettsteder + registeret.apper, registeret.erklaeringer);
  });

  test("med og uten brudd summerer til antall erklæringer", () => {
    assert.equal(
      registeret.medMinstEttBrudd + registeret.utenBrudd,
      registeret.erklaeringer,
    );
  });
});

/**
 * Bygget HTML. Disse testene ligger her og ikke i `test/bygget-html.test.ts`
 * fordi de gjelder tre nye komponenter og én ny side, og fordi den delte filen
 * skal kunne endres av andre uten å kollidere med dette.
 *
 * Hopper over når dist/ mangler, som den delte filen gjør.
 */
const DIST_SIDE = "dist/client/artikler/wcag-i-registeret/index.html";
const harBygg = existsSync(DIST_SIDE);

describe("artikkelen i bygget HTML", { skip: harBygg ? false : "dist/ mangler – kjør npm run build" }, () => {
  const html = harBygg ? readFileSync(DIST_SIDE, "utf8") : "";

  test("tallene i brødteksten er de samme som i datafilen", () => {
    // Hele poenget med at ingen tall er skrevet inn i .astro-filen. Driver de
    // fra hverandre, er det her det skal oppdages – ikke av en leser.
    const andel = registeret.andelMedBrudd
      .toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    assert.ok(html.includes(`${andel} prosent rapporterer minst ett brudd`), "andelen mangler");
    assert.ok(
      html.includes(registeret.erklaeringer.toLocaleString("nb-NO")),
      "antall erklæringer mangler",
    );
    assert.ok(
      html.includes(registeret.virksomheter.toLocaleString("nb-NO")),
      "antall virksomheter mangler",
    );
  });

  test("tabellen er en ekte tabell, ikke et diagram", () => {
    // Kravet fra docs/research-2026.md forslag 15: tallene skal være lesbare med
    // CSS av. Da må de ligge i tabellsemantikk og som tekst, ikke i en bredde.
    assert.match(html, /<table[^>]*class="[^"]*regstolper__tabell/);
    assert.match(html, /<caption/);
    assert.match(html, /<th[^>]+scope="row"/);
    assert.match(html, /<th[^>]+scope="col"/);
  });

  test("hver prosent står som tekst i tabellen, ikke bare som stolpebredde", () => {
    for (const r of registeret.kravRader.slice(0, 12)) {
      const p = r.andel.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      assert.ok(html.includes(`${p} %`), `fant ikke «${p} %» som tekst for ${r.krav}`);
    }
  });

  test("hver kravrad lenker til tilsynets egen side for kravet", () => {
    for (const r of registeret.kravRader.slice(0, 12)) {
      const sti = KRAVNAVN[r.krav].sti;
      assert.ok(
        html.includes(`https://www.uutilsynet.no/wcag-standarden/${sti}`),
        `rad ${r.krav} mangler lenke til kilden`,
      );
    }
  });

  test("stolpen er merket aria-hidden, så skjermlesere ikke leser tallet to ganger", () => {
    assert.match(html, /class="regstolper__stolpe"[^>]*aria-hidden="true"/);
  });

  test("tusjstreken over folden står ferdig og animeres ikke", () => {
    // Uten `staar` sto den på 23,7 % bredde ved innlasting på et 700 px vindu.
    assert.match(html, /class="[^"]*tusj--staar/);
  });

  test("tusjstreken beholder <strong>, så semantikken er uendret", () => {
    const treff = html.match(/<strong[^>]*class="[^"]*\btusj\b/g) ?? [];
    assert.ok(treff.length >= 3, `fant ${treff.length} tusjstreker, ventet minst 3`);
  });

  test("ikke mer enn én tusjstrek per avsnitt", () => {
    // Den redaksjonelle regelen fra forslag 17: markerer man flere steder i samme
    // avsnitt, er det en understreking og ikke et punkt.
    for (const p of html.match(/<p\b[^>]*>[\s\S]*?<\/p>/g) ?? []) {
      const n = (p.match(/class="[^"]*\btusj\b/g) ?? []).length;
      assert.ok(n <= 1, `et avsnitt har ${n} tusjstreker`);
    }
  });
});

describe("degraderingen uten JavaScript er stilsatt, ikke bare håpet på", { skip: harBygg ? false : "dist/ mangler" }, () => {
  test("begge setningene ligger i DOM-en på /om", () => {
    const html = readFileSync("dist/client/om/index.html", "utf8");
    assert.match(html, /class="utenskript__med"/);
    assert.match(html, /class="utenskript__uten"/);
    // Innholdet skal faktisk være der, ikke bare beholderen.
    assert.ok(html.includes("Dra i stabelen"));
    assert.ok(html.includes("Uten JavaScript står lagene fra hverandre"));
  });

  test("CSS-en bytter på scripting, i begge retninger", () => {
    const html = readFileSync("dist/client/om/index.html", "utf8");
    // Begge spørringene må finnes. Bare `scripting: none` ville latt
    // no-JS-setningen stå synlig for alle; bare `enabled` ville latt den vanlige
    // setningen stå synlig uten JavaScript.
    assert.match(html, /@media\s*\(\s*scripting\s*:\s*none\s*\)/);
    assert.match(html, /@media\s*\(\s*scripting\s*:\s*enabled\s*\)/);
  });
});

describe("stolpene kan ikke bli stående halvvokste", { skip: harBygg ? false : "dist/ mangler" }, () => {
  test("rulleboksen og avslåingen av animasjonen står i samme mediaspørring", () => {
    // DEN MÅLTE FEILEN: `overflow-x: auto` gjør elementet til en rullebeholder i
    // begge akser, og `animation-timeline: view()` måler mot nærmeste rullende
    // forelder. Stolpene lå da i en boks som aldri ruller loddrett, og de fire
    // nederste ble stående på 0,18–0,64 for alltid – degradering mot SKJULT.
    // Skiller noen disse to igjen, kommer feilen tilbake stille.
    const kilde = readFileSync("src/components/Registerstolper.astro", "utf8");
    const blokk = kilde.match(/@media \(max-width: 52rem\) \{[\s\S]*?\n  \}/);
    assert.ok(blokk, "fant ikke mediaspørringen som slår på rulling");
    assert.match(blokk[0], /overflow-x:\s*auto/);
    assert.match(blokk[0], /animation:\s*none/);
    assert.match(blokk[0], /transform:\s*scaleX\(1\)/);
  });

  test("standardtilstanden utenfor @supports er full bredde", () => {
    // Alt som krymper en stolpe skal ligge inne i @supports. Gjør det ikke det,
    // står stolpene på null i Firefox til scroll-drevne animasjoner lander der.
    const kilde = readFileSync("src/components/Registerstolper.astro", "utf8");
    const foerSupports = kilde.slice(0, kilde.indexOf("@supports"));
    assert.ok(
      !/\.regstolper__stolpe\s*\{[^}]*transform:\s*scaleX\(0\)/.test(foerSupports),
      "stolpen starter på scaleX(0) utenfor @supports",
    );
  });
});
