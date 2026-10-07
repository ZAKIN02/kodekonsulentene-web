/**
 * Tester for priskalkulatoren.
 *
 * Det som faktisk kan gå galt her er ikke matematikken, men at prisene sklir fra
 * prislisten. Derfor sjekker flere av testene mot src/data/priser.ts i stedet for
 * mot tall skrevet inn på nytt – en test som dupliserer tallet den skal verne om,
 * verner ingenting.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  tilTall,
  pakkepris,
  timepris,
  beregn,
  formaterKr,
  tillegg,
  TIMER_PER_EKSTRA_SIDE,
  TIMER_APP_FRA,
} from "../src/lib/priskalkyle.ts";
import { pakker, loepende, mvaSetning } from "../src/data/priser.ts";

const valg = (o: Partial<Parameters<typeof beregn>[0]> = {}) =>
  beregn({ sider: 1, cms: false, integrasjoner: [], app: false, ...o });

describe("tilTall", () => {
  test("plukker tallet ut av en formatert pris", () => {
    assert.equal(tilTall("14 900 kr"), 14900);
    assert.equal(tilTall("950 kr/t"), 950);
    assert.equal(tilTall("1 290–1 990 kr/mnd"), 12901990, "henter alle sifre – kalleren må gi én pris");
  });
  test("tåler hardt mellomrom", () => {
    assert.equal(tilTall("29 900 kr"), 29900);
  });
  test("gir 0 for tekst uten tall", () => {
    assert.equal(tilTall("etter avtale"), 0);
  });
});

describe("prislisten er eneste sannhet", () => {
  test("pakkeprisene leses fra src/data/priser.ts", () => {
    for (const p of pakker) {
      assert.equal(pakkepris(p.navn), tilTall(p.pris), `${p.navn} skal følge prislisten`);
    }
  });
  test("timeprisen leses fra prislisten", () => {
    const rad = loepende.find((r) => r.navn === "Timepris")!;
    assert.equal(timepris(), tilTall(rad.pris));
  });
  test("ukjent pakke kaster i stedet for å gi 0", () => {
    assert.throws(() => pakkepris("Finnes ikke"), /Fant ikke pakken/);
  });
});

describe("pakkevalg", () => {
  test("få sider uten CMS gir Start", () => {
    const e = valg({ sider: 3 });
    assert.equal(e.pakke, "Start");
    assert.equal(e.lav, pakkepris("Start"));
    assert.equal(e.hoy, pakkepris("Start"), "uten tillegg er spennet ett tall");
  });

  test("CMS løfter til Bedrift selv med én side", () => {
    assert.equal(valg({ sider: 1, cms: true }).pakke, "Bedrift");
  });

  test("flere enn tre sider løfter til Bedrift", () => {
    assert.equal(valg({ sider: 4 }).pakke, "Bedrift");
  });

  test("enhver integrasjon gjør det til System", () => {
    for (const t of tillegg) {
      assert.equal(valg({ sider: 1, integrasjoner: [t.id] }).pakke, "System", t.id);
    }
  });

  test("app gjør det til System, uansett hvor lite annet", () => {
    const e = valg({ sider: 1, app: true });
    assert.equal(e.pakke, "System");
    assert.ok(e.aapentOppe, "app gir et gulv, ikke et spenn");
  });
});

describe("grensetilfeller", () => {
  test("null eller negativt sidetall blir til én side", () => {
    assert.equal(valg({ sider: 0 }).lav, pakkepris("Start"));
    assert.equal(valg({ sider: -5 }).lav, pakkepris("Start"));
  });

  test("absurd sidetall taket på 60", () => {
    const e = valg({ sider: 10000 });
    const ekstra = 60 - 8; // Bedrift dekker 8
    assert.equal(
      e.lav,
      pakkepris("Bedrift") + ekstra * TIMER_PER_EKSTRA_SIDE.lav * timepris(),
    );
  });

  test("desimaltall rundes ned", () => {
    assert.equal(valg({ sider: 3.9 }).pakke, "Start", "3,9 sider er 3 sider");
  });

  test("sider innenfor pakken gir ingen tilleggslinje", () => {
    assert.equal(valg({ sider: 8, cms: true }).linjer.length, 1);
  });

  test("sider utover pakken gir en linje med timeanslag", () => {
    const e = valg({ sider: 10, cms: true });
    const linje = e.linjer.find((l) => l.tekst.includes("utover pakken"))!;
    assert.ok(linje, "skal ha en linje for de ekstra sidene");
    assert.deepEqual(linje.anslag, {
      timerLav: 2 * TIMER_PER_EKSTRA_SIDE.lav,
      timerHoy: 2 * TIMER_PER_EKSTRA_SIDE.hoy,
    });
  });
});

describe("alle tillegg samtidig", () => {
  const e = valg({
    sider: 20,
    cms: true,
    integrasjoner: tillegg.map((t) => t.id),
    app: true,
  });

  test("hver integrasjon får sin egen linje", () => {
    for (const t of tillegg) {
      assert.ok(e.linjer.some((l) => l.tekst === t.navn), `mangler linje for ${t.navn}`);
    }
  });

  test("summen er summen av linjene", () => {
    assert.equal(e.lav, e.linjer.reduce((s, l) => s + l.lav, 0));
    assert.equal(e.hoy, e.linjer.reduce((s, l) => s + l.hoy, 0));
  });

  test("appen ligger inne som et gulv", () => {
    const app = e.linjer.find((l) => l.tekst.startsWith("App"))!;
    assert.equal(app.lav, TIMER_APP_FRA * timepris());
    assert.equal(app.lav, app.hoy, "appen har ingen øvre grense – lav og høy er like");
  });

  test("lav er aldri større enn høy", () => {
    assert.ok(e.lav <= e.hoy);
  });
});

describe("forutsetningene vises alltid", () => {
  /**
   * TESTEN KREVDE EN STRENG SOM VAR USANN.
   *
   * Den sto som `/eks\. mva/` og låste forutsetningen «Alle beløp er eks. mva.»
   * på plass. Men `firma.mva` er `false` – verifisert mot Enhetsregisteret
   * (`registrertIMvaregisteret: false`), og et foretak utenfor
   * Merverdiavgiftsregisteret kan ikke fakturere mva. «Eks. mva» er da ikke et
   * forbehold, men et tillegg som aldri kommer: leseren ganger med 1,25 og
   * regner seg fram til en pris vi ikke har lov til å kreve inn.
   *
   * Testen er derfor endret, ikke slettet, og den er strengere enn før: den
   * krever at mva-statusen står der OG at den er den samme som `mvaSetning` i
   * src/data/priser.ts. Da kan de to ikke komme i utakt, og den dagen vi passerer
   * 50 000 kr i omsetning og setter `firma.mva = true`, følger kalkulatoren etter
   * uten at noen må huske denne strengen.
   */
  test("hvert estimat har forutsetninger, med timepris og mva-status", () => {
    const e = valg();
    assert.ok(e.forutsetninger.length >= 4);
    assert.ok(
      e.forutsetninger.includes(mvaSetning),
      "mva-statusen skal stå i forutsetningene, ordrett som mvaSetning i src/data/priser.ts",
    );
    assert.match(mvaSetning, /mva/i, "mvaSetning skal faktisk si noe om mva");
    assert.ok(e.forutsetninger.some((f) => /anslag/.test(f)), "anslagene skal merkes som anslag");
    assert.ok(
      e.forutsetninger.some((f) => f.includes(String(timepris()))),
      "timeprisen skal stå i klartekst",
    );
  });

  test("estimatet sier at det ikke er et tilbud", () => {
    assert.ok(valg().forutsetninger.some((f) => /tilbud/.test(f)));
  });

  test("hver tilleggslinje bærer sitt eget timeanslag", () => {
    const e = valg({ integrasjoner: ["vipps"] });
    const linje = e.linjer.find((l) => l.tekst.includes("Vipps"))!;
    const kilde = tillegg.find((t) => t.id === "vipps")!;
    assert.deepEqual(linje.anslag, { timerLav: kilde.timerLav, timerHoy: kilde.timerHoy });
    assert.equal(linje.lav, kilde.timerLav * timepris());
  });
});

describe("formaterKr", () => {
  test("skriver tusenskille med vanlig mellomrom", () => {
    assert.equal(formaterKr(29900), "29 900 kr");
    assert.equal(formaterKr(950), "950 kr");
  });
  test("runder av", () => {
    assert.equal(formaterKr(14900.6), "14 901 kr");
  });
  test("bruker ikke hardt mellomrom, som brekker i monospace-kolonner", () => {
    assert.ok(!formaterKr(100000).includes(" "));
  });
});
