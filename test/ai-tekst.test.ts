import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  MAKS_TEGN, MIN_TEGN, STANDARD_MODELL, SYSTEM,
  byggMelding, erBrukbart, finnIp, lagKvote, tolkSvar, validerTekst,
} from "../src/lib/ai-tekst.ts";

/**
 * Tester for AI-omskriveren på /apper-og-ai.
 *
 * Ingen av dem rører nettverket, og ingen av dem koster en krone. Det er med
 * vilje: et endepunkt som koster penger per kall skal ikke ha en testpakke som
 * må betales for å kjøre. Alt som kan testes – validering, tolking av svaret,
 * kvoten og IP-oppslaget – er rene funksjoner i src/lib/ai-tekst.ts.
 *
 * Æresregelen fra CLAUDE.md gjelder her også: funksjonen skal aldri påstå mer
 * enn den har. Derfor står det en test på at teksten IKKE kuttes stille ned, og
 * en på at kvoten faktisk stenger når taket er nådd.
 */

describe("validerTekst", () => {
  test("avviser tom og ikke-tekst", () => {
    for (const v of [undefined, null, 42, "", "   \n  "]) {
      const r = validerTekst(v);
      assert.equal(r.ok, false);
    }
  });

  test("avviser for kort tekst og sier hvor kort den er", () => {
    const r = validerTekst("Vi er et rørleggerfirma.");
    assert.equal(r.ok, false);
    assert.ok(r.ok === false && r.feil.includes(String(MIN_TEGN)));
  });

  test("godtar tekst over minimum og normaliserer linjeskift", () => {
    const r = validerTekst(`  ${"a".repeat(MIN_TEGN)}\r\nmer tekst  `);
    assert.equal(r.ok, true);
    assert.ok(r.ok && !r.tekst.includes("\r"));
    assert.ok(r.ok && !r.tekst.startsWith(" "));
  });

  test("KUTTER IKKE for lang tekst – den avvises", () => {
    // En stille avkorting ville gitt et svar om halve siden uten at noen fikk
    // vite det. Samme feilklasse som en falsk «Bestått» i nettsidesjekken.
    const r = validerTekst("b".repeat(MAKS_TEGN + 1));
    assert.equal(r.ok, false);
    assert.ok(r.ok === false && r.feil.includes(String(MAKS_TEGN)));
  });
});

describe("tolkSvar", () => {
  const helt = [
    "TITTEL: Rørlegger i Oslo som kommer når du ringer",
    "INGRESS: Vi tar små jobber samme uke. Du får pris før vi begynner.",
    "PUNKT: Akutt lekkasje: vi rykker ut",
    "PUNKT: Fast pris på bad",
    "PUNKT: Rapport etter hver jobb",
    "KNAPP: Book befaring",
    "GREP: Byttet «totalleverandør» med hva du faktisk gjør — kunden søker på jobben, ikke på ordet",
    "GREP: Flyttet responstid opp — det er grunnen folk ringer en rørlegger",
  ].join("\n");

  test("leser alle feltene", () => {
    const f = tolkSvar(helt);
    assert.equal(f.tittel, "Rørlegger i Oslo som kommer når du ringer");
    assert.ok(f.ingress.startsWith("Vi tar små jobber"));
    assert.equal(f.punkter.length, 3);
    assert.equal(f.knapp, "Book befaring");
    assert.equal(f.grep.length, 2);
    assert.equal(f.avvist, null);
    assert.equal(erBrukbart(f), true);
  });

  test("tåler et HALVT svar – det er hele grunnen til at den finnes", () => {
    // Nettleseren kaller denne på hver bit som kommer inn. Et prefiks som er
    // midt i å bli skrevet skal komme ut som den delen som finnes.
    const halvt = helt.slice(0, 48);
    const f = tolkSvar(halvt);
    assert.ok(halvt.endsWith(f.tittel), `fikk «${f.tittel}» av «${halvt}»`);
    assert.equal(f.punkter.length, 0);
  });

  test("hver eneste delstreng gir et svar uten å kaste", () => {
    for (let i = 0; i <= helt.length; i++) {
      const f = tolkSvar(helt.slice(0, i));
      assert.equal(typeof f.tittel, "string");
      assert.ok(Array.isArray(f.punkter));
    }
  });

  test("linjer uten prefiks legges på forrige felt i stedet for å forsvinne", () => {
    const f = tolkSvar("INGRESS: Første setning.\nandre halvdel av samme avsnitt");
    assert.equal(f.ingress, "Første setning. andre halvdel av samme avsnitt");
  });

  test("AVVIST kommer ut som avvisning, ikke som et tomt forslag", () => {
    const f = tolkSvar("AVVIST: Dette ser ut som en meny, ikke tekst som skal selge noe.");
    assert.ok(f.avvist?.startsWith("Dette ser ut"));
    assert.equal(f.tittel, "");
    assert.equal(erBrukbart(f), true);
  });

  test("tomt svar er ikke brukbart", () => {
    assert.equal(erBrukbart(tolkSvar("")), false);
    assert.equal(erBrukbart(tolkSvar("Her er forslaget ditt:")), false);
  });
});

describe("kvote", () => {
  const tak = { perIp: 2, ipVindu: 1000, ipDogn: 4, dognTak: 5 };

  test("slipper gjennom opp til taket per IP, og stenger så", () => {
    const k = lagKvote(tak);
    const t0 = Date.UTC(2026, 9, 7, 12, 0, 0);
    assert.equal(k.forsok("1.1.1.1", t0).ok, true);
    assert.equal(k.forsok("1.1.1.1", t0 + 10).ok, true);
    const tredje = k.forsok("1.1.1.1", t0 + 20);
    assert.equal(tredje.ok, false);
    assert.ok(tredje.ok === false && tredje.status === 429);
    assert.ok(tredje.ok === false && typeof tredje.etter === "number" && tredje.etter > 0);
  });

  test("vinduet åpner igjen når det har gått", () => {
    const k = lagKvote(tak);
    const t0 = Date.UTC(2026, 9, 7, 12, 0, 0);
    k.forsok("2.2.2.2", t0);
    k.forsok("2.2.2.2", t0 + 10);
    assert.equal(k.forsok("2.2.2.2", t0 + 1001).ok, true);
  });

  test("døgngrensen per IP holder selv om vinduet er åpent", () => {
    const k = lagKvote(tak);
    const t0 = Date.UTC(2026, 9, 7, 0, 0, 0);
    // Fire kall spredt utover døgnet – vinduet er alltid åpent, døgnet ikke.
    for (let i = 0; i < 4; i++) assert.equal(k.forsok("3.3.3.3", t0 + i * 3_600_000).ok, true);
    assert.equal(k.forsok("3.3.3.3", t0 + 5 * 3_600_000).ok, false);
  });

  test("det globale døgntaket stenger uansett hvor mange IP-er som prøver", () => {
    // Dette er beløpsgrensen. Per-IP-taket kan omgås med nye IP-adresser;
    // dette kan ikke.
    const k = lagKvote(tak);
    const t0 = Date.UTC(2026, 9, 7, 9, 0, 0);
    for (let i = 0; i < tak.dognTak; i++) {
      assert.equal(k.forsok(`10.0.0.${i}`, t0).ok, true, `kall ${i}`);
    }
    const stengt = k.forsok("10.0.0.99", t0);
    assert.equal(stengt.ok, false);
    assert.ok(stengt.ok === false && stengt.status === 503);
  });

  test("døgntelleren nullstilles ved nytt døgn", () => {
    const k = lagKvote(tak);
    const t0 = Date.UTC(2026, 9, 7, 23, 0, 0);
    for (let i = 0; i < tak.dognTak; i++) k.forsok(`11.0.0.${i}`, t0);
    assert.equal(k.forsok("11.0.0.99", t0).ok, false);
    const neste = Date.UTC(2026, 9, 8, 1, 0, 0);
    assert.equal(k.forsok("11.0.0.99", neste).ok, true);
    assert.equal(k.tilstand(neste).dognBrukt, 1);
  });
});

describe("finnIp", () => {
  test("fly-client-ip går foran alt – den kan ikke settes av klienten", () => {
    const h = new Headers({ "fly-client-ip": "9.9.9.9", "x-forwarded-for": "1.2.3.4" });
    assert.equal(finnIp(h, "127.0.0.1"), "9.9.9.9");
  });

  test("x-forwarded-for leses BAKFRA, der proxyen skriver", () => {
    // En klient som sender sin egen x-forwarded-for havner først i lista.
    // Leste vi forfra, kunne hvem som helst få en ny kvote per forespørsel.
    const h = new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" });
    assert.equal(finnIp(h), "203.0.113.9");
  });

  test("faller tilbake på socket-adressen, og til sist på «ukjent»", () => {
    assert.equal(finnIp(new Headers(), "127.0.0.1"), "127.0.0.1");
    assert.equal(finnIp(new Headers()), "ukjent");
  });
});

describe("prompt og modell", () => {
  test("systemprompten sier at det som limes inn er data, ikke instruksjoner", () => {
    // Feltet er åpent for hvem som helst. Forsvinner dette avsnittet, er
    // prompt-injeksjon det første noen prøver.
    assert.match(SYSTEM, /DATA fra en ukjent bes/);
    assert.match(SYSTEM, /ignorer det/i);
  });

  test("systemprompten forbyr oppdiktede tall – samme regel som resten av nettstedet", () => {
    assert.match(SYSTEM, /Ingen tall, priser/);
  });

  test("brukermeldingen rammer inn teksten", () => {
    const m = byggMelding("hei");
    assert.equal(m, "<tekst>\nhei\n</tekst>");
  });

  test("modell-ID-en er en av Claude-modellene vi har valgt, uten datosuffiks", () => {
    assert.match(STANDARD_MODELL, /^claude-(haiku-4-5|sonnet-5-5|opus-5-5)$/);
  });
});

describe("hemmeligheter og klientkode", () => {
  test("ingen nøkkel i repoet", () => {
    // Repoet er offentlig på GitHub. Dette er den testen som skal være rød
    // dagen noen limer en nøkkel inn for å «prøve raskt».
    for (const f of [
      "src/lib/ai-tekst.ts",
      "src/pages/api/ai-tekst.ts",
      "src/components/AiTekst.astro",
      ".env.example",
    ]) {
      const kode = readFileSync(f, "utf8");
      assert.doesNotMatch(kode, /sk-ant-[A-Za-z0-9]/, `${f} inneholder noe som ser ut som en API-nøkkel`);
    }
  });

  test("komponenten snakker bare med vårt eget endepunkt", () => {
    // En nøkkel i klientkoden er den feilen vi selger oss på å ikke gjøre.
    const kode = readFileSync("src/components/AiTekst.astro", "utf8");
    assert.doesNotMatch(kode, /api\.anthropic\.com/);
    assert.doesNotMatch(kode, /ANTHROPIC_API_KEY/);
    assert.match(kode, /fetch\("\/api\/ai-tekst"/);
  });

  test("ruta sjekker opphav, kvote og nøkkel før den kaller modellen", () => {
    const kode = readFileSync("src/pages/api/ai-tekst.ts", "utf8");
    const iOpphav = kode.indexOf("erEgetOpphav");
    const iKvote = kode.indexOf("kvote.forsok");
    const iNokkel = kode.indexOf('hentEnv("ANTHROPIC_API_KEY")');
    const iKall = kode.indexOf("new Anthropic(");
    assert.ok(iOpphav > -1 && iKvote > iOpphav, "kvoten må sjekkes etter opphavskontrollen");
    // Sonderingen er et bevisst unntak: den leser nøkkelen før kvoten, men den
    // bruker ingen kvote og kaller aldri modellen, så den kan verken tømme kvoten
    // eller brukes til å måle responstid mot et ekte kall. Den finnes fordi sidene
    // er statiske og HTML-en ellers ikke kan vite om funksjonen er skrudd på.
    //
    // Invarianten gjelder derfor den NORMALE veien: nøkkelen etter kvoten der.
    const iSondering = kode.indexOf('x-kk-sondering');
    const iNokkelNormal = kode.indexOf('hentEnv("ANTHROPIC_API_KEY")', iKvote);
    assert.ok(iNokkelNormal > iKvote, "nøkkelen hentes etter kvoten i den normale veien");
    if (iSondering > -1) {
      const sonderingsblokk = kode.slice(iSondering, iSondering + 400);
      assert.ok(!sonderingsblokk.includes("kvote.forsok"), "sonderingen må ikke bruke kvote");
      assert.ok(!sonderingsblokk.includes("new Anthropic("), "sonderingen må ikke kalle modellen");
    }
    assert.ok(iKall > iNokkel, "klienten lages først når alt annet er i orden");
  });

  test("skjemaet virker uten JavaScript", () => {
    const kode = readFileSync("src/components/AiTekst.astro", "utf8");
    assert.match(kode, /<form[^>]*method="post"[^>]*action="\/api\/ai-tekst"/);
    assert.match(kode, /<noscript>/);
  });

  test("ingen cookies settes noe sted i funksjonen", () => {
    // Null cookies er et salgsargument og en lovtolkning (ekomloven § 3-15).
    for (const f of ["src/pages/api/ai-tekst.ts", "src/components/AiTekst.astro", "src/lib/ai-tekst.ts"]) {
      assert.doesNotMatch(readFileSync(f, "utf8"), /set-cookie|document\.cookie/i, f);
    }
  });
});
