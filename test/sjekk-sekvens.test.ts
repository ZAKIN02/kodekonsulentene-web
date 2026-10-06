/**
 * Sekvensen på /sjekk er den eneste animasjonen på nettstedet som VISER TALL.
 * Derfor er den også det eneste stedet et oppdiktet tall kunne gjemt seg i en
 * animasjon, der ingen leser koden og ingen test ser etter.
 *
 * Disse testene gjør tre ting:
 *  1. Krever at hvert tall i sekvensen finnes i src/data/maalinger.json.
 *  2. Kjører den EKTE analysemotoren på de samme tallene og krever at den gir
 *     nøyaktig de statusene sekvensen viser. Statusene er altså ikke valgt for
 *     dramaturgien – de er motorens svar.
 *  3. Krever at summen i sekvensen er lik `typisk.sumAv100`, som er målt
 *     uavhengig av sekvensen. Endrer noen én status for å gjøre bildet verre
 *     eller penere, sprekker den likheten.
 *
 * Og én regel til, som er bindende i prosjektet: adressen i akt 1 skal aldri
 * kunne bli navnet på en ekte side som kommer dårlig ut.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DOMENE, ORD, HEADERE, byggSekvens, headerStatus, cookieStatus, uuStatus,
  type Maalinger,
} from "../src/data/sjekk-sekvens.ts";
import { analyserHeadere, analyserCookies, analyserUu, analyserLovpaalagt } from "../src/lib/sjekk.ts";

const maalinger = JSON.parse(readFileSync("src/data/maalinger.json", "utf8")) as Maalinger;
const s = byggSekvens(maalinger);
const { typisk } = maalinger;

describe("sekvensen viser bare målte tall", () => {
  test("summen er lik den uavhengig målte medianen", () => {
    assert.equal(
      s.totalt,
      typisk.sumAv100,
      `Sekvensen regner seg til ${s.totalt} av 100, mens masseskanningen målte ` +
        `${typisk.sumAv100}. Enten er en status endret for hånd, eller så er ` +
        `målingen ny og radene ikke oppdatert. Begge deler må rettes, ikke skjules.`,
    );
  });

  test("hvert tall i dommen står i maalinger.json", () => {
    const kilder = [
      String(typisk.ttfbMs), String(typisk.headereAv6), String(typisk.cookiesForSamtykke),
      String(typisk.uuFeil), "6", "100",
    ];
    for (const rad of s.dom) {
      for (const tall of rad.verdi.match(/\d+/g) ?? []) {
        assert.ok(
          kilder.includes(tall),
          `Raden «${rad.navn}» viser tallet ${tall}, som ikke finnes i maalinger.json. ` +
            `Et tall skrevet inn for hånd i en animasjon er like mye oppdiktet som ett i brødtekst.`,
        );
      }
    }
  });

  test("vår egen score og utvalgsstørrelsen er hentet, ikke skrevet", () => {
    assert.equal(s.egenSum, maalinger.oss.sumAv100);
    assert.equal(s.antallSider, maalinger.utvalg.svarte);
    assert.equal(s.maaltDato, maalinger.maalt);
  });
});

describe("statusene er motorens, ikke våre", () => {
  test("sikkerhetsheadere: motoren gir samme status og samme verdi", () => {
    // Medianen har 1 av 6 satt. HVILKEN som er satt er ikke målt, så her brukes
    // en vilkårlig av de seks – det eneste som sjekkes er at ANTALLET gir samme
    // status i motoren som i sekvensen.
    const h = analyserHeadere(new Headers({ "x-content-type-options": "nosniff" }));
    assert.equal(h.tilstede.length, typisk.headereAv6);
    assert.equal(h.status, headerStatus(typisk.headereAv6));
    const rad = s.dom.find((r) => r.navn === "Sikkerhetsheadere")!;
    assert.equal(rad.status, h.status);
    assert.equal(rad.verdi, `${h.tilstede.length}/6`);
  });

  test("cookies: én egen cookie og ingen sporer gir «bør fikses»", () => {
    const h = new Headers();
    h.append("set-cookie", "PHPSESSID=abc; Path=/");
    const c = analyserCookies(h, "<html><body>hei</body></html>");
    assert.equal(c.egne + c.sporere.length, typisk.cookiesForSamtykke);
    assert.equal(c.status, cookieStatus(typisk.cookiesForSamtykke));
    assert.equal(s.dom.find((r) => r.navn === "Cookies før samtykke")!.status, c.status);
  });

  test("universell utforming: én maskinelt testbar feil gir «bør fikses»", () => {
    // Nøyaktig én feil: html mangler lang. Alt annet er på plass.
    const u = analyserUu(
      `<html><head><title>T</title></head><body><h1>H</h1><p>tekst</p></body></html>`,
    );
    assert.equal(u.feil, typisk.uuFeil);
    assert.equal(u.status, uuStatus(typisk.uuFeil));
    assert.equal(s.dom.find((r) => r.navn === "Universell utforming")!.status, u.status);
  });

  test("lovpålagt: uten org.nr. er det brudd, ikke «bør fikses»", () => {
    const l = analyserLovpaalagt("<html><body><p>Ingen tall her</p></body></html>");
    assert.equal(l.orgnr, null);
    assert.equal(l.status, "fail");
    assert.equal(s.dom.find((r) => r.navn === "Lovpålagt informasjon")!.status, "fail");
  });

  test("ytelse uten Lighthouse-score er «Ikke sjekket», aldri «Bestått»", () => {
    const rad = s.dom.find((r) => r.navn === "Ytelse")!;
    assert.equal(rad.status, "neutral");
    assert.equal(ORD[rad.status], "Ikke sjekket");
  });
});

describe("feltnavn og hjemler er ekte", () => {
  test("alle seks headernavnene står i analysemotoren", () => {
    const kode = readFileSync("src/lib/sjekk.ts", "utf8");
    for (const h of HEADERE) {
      assert.ok(kode.includes(`"${h}"`), `${h} telles ikke av src/lib/sjekk.ts`);
    }
  });

  test("lovhjemlene er de motoren selv bruker", () => {
    const kode = readFileSync("src/lib/sjekk.ts", "utf8");
    for (const l of s.logg) {
      if (!l.hjemmel) continue;
      assert.ok(
        kode.includes(l.hjemmel),
        `«${l.hjemmel}» står i sekvensen, men ikke i src/lib/sjekk.ts. ` +
          `En lovhjemmel skal aldri gjettes.`,
      );
    }
  });

  test("radnavnene er ordrett de byggRapport setter", () => {
    const kode = readFileSync("src/lib/sjekk.ts", "utf8");
    for (const rad of s.dom) {
      assert.ok(kode.includes(`name: "${rad.navn}"`), `byggRapport har ingen rad som heter «${rad.navn}»`);
    }
  });

  test("statusordene er de samme som rapporten på siden bruker", () => {
    const side = readFileSync("src/pages/sjekk.astro", "utf8");
    for (const [status, ord] of Object.entries(ORD)) {
      assert.ok(
        new RegExp(`${status}:\\s*"${ord}"`).test(side),
        `Sekvensen kaller «${status}» for «${ord}», rapporten under den gjør ikke det.`,
      );
    }
  });
});

describe("adressen i akt 1 navngir ingen", () => {
  /**
   * Bindende regel: aldri navnet på en ekte kundes eller konkurrents side i noe
   * som viser brudd. Plassholderen er den samme som analysemotoren selv foreslår
   * i feilmeldingene sine, så det er ett sted å endre den.
   */
  test("domenet er plassholderen motoren selv foreslår", () => {
    assert.equal(DOMENE, "dinbedrift.no");
    assert.ok(readFileSync("src/lib/sjekk.ts", "utf8").includes(DOMENE));
  });

  test("sekvensen nevner ikke vårt eget domene som den skannede siden", () => {
    // Vår egen side står i sekvensen som sammenligning (90 av 100), men det er
    // ikke den som skannes. Blandes de to, påstår figuren at vi fikk 30.
    const komponent = readFileSync("src/components/SjekkSekvens.astro", "utf8");
    const iMarkup = komponent.slice(komponent.indexOf("---", 3));
    assert.ok(!/kodekonsulentene\.no/.test(iMarkup), "vårt eget domene står i sekvensens markup");
  });
});
