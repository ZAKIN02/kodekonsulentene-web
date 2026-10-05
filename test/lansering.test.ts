/**
 * Tester som holder repoet ærlig.
 *
 * Disse handler ikke om kode som kan kræsje, men om påstander siden selger.
 * Den viktigste er den første: så lenge org.nr. er plassholder, skal `npm run verify`
 * være rød. Da er det umulig å deploye en side som bryter nøyaktig det lovkravet
 * nettsidesjekken rapporterer brudd på hos andre.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { firma, PLASSHOLDER_ORGNR } from "../src/data/firma.ts";
import { erGyldigOrgnr } from "../src/lib/sjekk.ts";
import { pakker, loepende } from "../src/data/priser.ts";
import { SIKKERHETSHEADERE, TEMA_SCRIPT } from "../sikkerhet.mjs";

describe("FØR LANSERING – disse skal feile til Zakaria har fylt inn ekte verdier", () => {
  test("org.nr. er ikke lenger plassholder (se docs/sjekklister/lansering.md)", () => {
    assert.notEqual(
      firma.orgnr,
      PLASSHOLDER_ORGNR,
      "src/data/firma.ts har fortsatt plassholder-org.nr. Hent det ekte fra Brønnøysundregistrene.",
    );
    assert.ok(
      erGyldigOrgnr(firma.orgnr),
      `«${firma.orgnr}» består ikke mod 11-kontrollen og kan ikke være et ekte organisasjonsnummer.`,
    );
  });

  test("telefonnummeret er ikke lenger plassholder", () => {
    assert.ok(
      !/0{3}\s?0{2}\s?0{3}/.test(firma.telefon),
      "src/data/firma.ts har fortsatt plassholder-telefonnummer.",
    );
  });
});

describe("sikkerhetsheadere", () => {
  test("alle seks headerne nettsidesjekken teller er satt", () => {
    const headere: Record<string, string> = SIKKERHETSHEADERE;
    for (const navn of [
      "content-security-policy",
      "strict-transport-security",
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy",
      "x-frame-options",
    ]) {
      assert.ok(headere[navn], `mangler ${navn} – siden ville fått under 6/6 på sin egen sjekk`);
    }
  });

  test("HSTS har minst seks måneders max-age, som vår egen sjekk krever", () => {
    const maxAge = Number(/max-age=(\d+)/.exec(SIKKERHETSHEADERE["strict-transport-security"])?.[1]);
    assert.ok(maxAge >= 15_552_000, `max-age=${maxAge} er kortere enn seks måneder`);
  });

  test("X-Content-Type-Options er nosniff", () => {
    assert.equal(SIKKERHETSHEADERE["x-content-type-options"], "nosniff");
  });

  test("CSP tillater ikke 'unsafe-inline' for skript", () => {
    const csp = SIKKERHETSHEADERE["content-security-policy"];
    const scriptSrc = /script-src ([^;]+)/.exec(csp)?.[1] ?? "";
    assert.ok(
      !scriptSrc.includes("unsafe-inline"),
      "script-src har 'unsafe-inline'. Da er CSP-en nesten verdiløs mot skriptinjeksjon.",
    );
    assert.ok(!scriptSrc.includes("unsafe-eval"), "script-src har 'unsafe-eval'.");
  });

  test("CSP inneholder en hash som matcher temaskriptet", () => {
    // Uten dette ville nettleseren blokkert temaskriptet, og siden ville blinket hvitt
    // i mørkt tema ved hver sidelasting.
    const csp = SIKKERHETSHEADERE["content-security-policy"];
    assert.match(csp, /script-src [^;]*'sha256-[A-Za-z0-9+/=]+'/);
    assert.ok(TEMA_SCRIPT.includes("kk-tema"), "temaskriptet ser ikke ut som forventet");
  });

  test("CSP låser frame-ancestors og object-src", () => {
    const csp = SIKKERHETSHEADERE["content-security-policy"];
    assert.match(csp, /frame-ancestors 'none'/);
    assert.match(csp, /object-src 'none'/);
  });

  test("fontene siden faktisk laster er tillatt i CSP", () => {
    const csp = SIKKERHETSHEADERE["content-security-policy"];
    assert.match(csp, /font-src [^;]*fonts\.gstatic\.com/);
    assert.match(csp, /style-src [^;]*fonts\.googleapis\.com/);
  });
});

describe("priser", () => {
  test("nøyaktig én pakke er merket anbefalt", () => {
    const anbefalt = pakker.filter((p) => p.anbefalt);
    assert.equal(anbefalt.length, 1, "brandboken: én pakke merket «Anbefalt», ikke flere");
  });

  test("alle priser er skrevet med mellomrom som tusenskiller og «kr»", () => {
    for (const p of pakker) {
      assert.match(p.pris, /^\d{1,3}( \d{3})* kr$/, `«${p.pris}» følger ikke prisformatet i brandboken`);
    }
  });

  test("hver pakke har en handling og minst tre punkter", () => {
    for (const p of pakker) {
      assert.ok(p.cta.length > 0, `${p.navn} mangler knappetekst`);
      assert.ok(p.inkludert.length >= 3, `${p.navn} har for få punkter`);
    }
  });

  test("løpende avtaler har både pris og en forklarende setning", () => {
    for (const r of loepende) {
      assert.ok(r.pris.includes("kr"), `${r.navn} mangler pris`);
      assert.ok(r.tekst.length > 40, `${r.navn} mangler forklaring`);
    }
  });
});
