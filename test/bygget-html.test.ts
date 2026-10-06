import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Sjekker det ferdig bygde HTML-et for de samme feilene /api/sjekk ser etter hos
 * andre. Siden selger den sjekken, så den skal bestå den selv.
 *
 * Bakgrunn: da telefonfeltet ble tømt, rendret kontaktblokken fortsatt raden og
 * ga <a href="tel:"></a> – en lenke uten tekst (WCAG 2.4.4). Verktøyet fant den
 * i produksjon. Denne testen fanger den før deploy.
 *
 * Hopper over når dist/ ikke finnes, slik at `npm test` virker uten bygg.
 */
const DIST = "dist/client";

function htmlFiler(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? htmlFiler(join(dir, d.name)) : d.name.endsWith(".html") ? [join(dir, d.name)] : [],
  );
}

const filer = htmlFiler(DIST);

describe("bygget HTML består vår egen sjekk", { skip: filer.length === 0 ? "dist/ mangler – kjør npm run build" : false }, () => {
  test("ingen lenker uten tekst (WCAG 2.4.4)", () => {
    for (const f of filer) {
      const tomme = readFileSync(f, "utf8").match(/<a\b[^>]*>\s*<\/a>/g) ?? [];
      assert.equal(tomme.length, 0, `${f}: ${tomme.join(", ")}`);
    }
  });

  test("ingen bilder uten alt-tekst (WCAG 1.1.1)", () => {
    for (const f of filer) {
      const utenAlt = (readFileSync(f, "utf8").match(/<img\b[^>]*>/g) ?? []).filter((t) => !/\balt\s*=/.test(t));
      assert.equal(utenAlt.length, 0, `${f}: ${utenAlt.join(", ")}`);
    }
  });

  test("ingen tomme href-er", () => {
    for (const f of filer) {
      const tomme = readFileSync(f, "utf8").match(/href="(tel:|mailto:|)"/g) ?? [];
      assert.equal(tomme.length, 0, `${f}: ${tomme.join(", ")}`);
    }
  });

  test("nøyaktig én h1 per side", () => {
    for (const f of filer) {
      const n = (readFileSync(f, "utf8").match(/<h1\b/g) ?? []).length;
      assert.equal(n, 1, `${f} har ${n} h1-elementer`);
    }
  });
});

describe("statiske filer har riktig MIME-type", () => {
  // Feil MIME-type på video gir «application/octet-stream», og da spiller
  // nettleseren ingenting. Fanget først i produksjon på /historie.
  test("server.mjs kjenner typene for filene vi faktisk leverer", async () => {
    const kode = readFileSync("server.mjs", "utf8");
    for (const ext of [".mp4", ".avif", ".svg", ".css", ".js", ".woff2", ".xml", ".txt"]) {
      assert.match(kode, new RegExp(`"\\${ext}"\\s*:`), `server.mjs mangler MIME-type for ${ext}`);
    }
  });

  test("hver mediefil i public/ har en kjent filtype", () => {
    if (!existsSync("public")) return;
    const kjente = new Set([".mp4", ".webm", ".avif", ".png", ".jpg", ".svg", ".webp", ".ico", ".woff2", ".txt", ".json", ".xml", ".js", ".md"]);
    const gaa = (d: string): string[] =>
      readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? gaa(join(d, e.name)) : [join(d, e.name)],
      );
    for (const f of gaa("public")) {
      const ext = f.slice(f.lastIndexOf("."));
      assert.ok(kjente.has(ext), `${f} har en filtype serveren ikke kjenner: ${ext}`);
    }
  });
});

describe("CSP blokkerer ikke vår egen JavaScript", () => {
  /**
   * Dette hullet kostet oss scroll-historien og temabryteren i produksjon, uten at
   * en eneste test ble rød. Astro legger små moduler inline i HTML-en, CSP-en vår
   * har ingen 'unsafe-inline', og et skript som stoppes av CSP feiler helt stille:
   * siden laster, alt ser riktig ut, ingenting virker.
   */
  test("hvert inline-skript i bygget har hashen sin i script-src", async () => {
    if (filer.length === 0) return;
    const { inlineSkriptHasher, lagSikkerhetsheadere } = await import("../sikkerhet.mjs");
    const { createHash } = await import("node:crypto");

    const csp = lagSikkerhetsheadere(inlineSkriptHasher(DIST))["content-security-policy"] as string;
    const skriptSrc = /script-src ([^;]*)/.exec(csp)?.[1] ?? "";
    assert.doesNotMatch(skriptSrc, /'unsafe-inline'/, "script-src skal ikke slakkes til unsafe-inline");

    for (const f of filer) {
      const html = readFileSync(f, "utf8");
      for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
        if (!m[1].trim()) continue;
        const hash = `'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`;
        assert.ok(
          skriptSrc.includes(hash),
          `${f}: et inline-skript mangler hash i CSP og blir blokkert i nettleseren.\n  ${m[1].trim().slice(0, 90)}…`,
        );
      }
    }
  });
});

describe("CSS-stenografi ødelegger ikke scroll-tidslinjer", () => {
  /**
   * lightningcss slår `animation` og `animation-timeline` sammen til
   * `animation: linear both navn view()`. Den formen er ugyldig – animation-timeline
   * er ikke del av stenografien – og BÅDE Chromium og Firefox forkaster hele
   * erklæringen uten en lyd. Avdekkingen på /historie kjørte ikke for en eneste
   * besøkende, mens CSS.supports fortsatt meldte at view() var støttet.
   *
   * Mønsteret kan bare oppstå ved minifisering og er aldri riktig.
   */
  test("ingen animation-stenografi inneholder view() eller scroll()", () => {
    // /lab/bibliotek inneholder mønsteret MED VILJE: den er en levende
    // reproduksjon som viser hva minifieren gjør. Den er ikke en kundeside.
    for (const f of filer.filter((f) => !f.includes("lab/bibliotek"))) {
      const treff = readFileSync(f, "utf8").match(/animation:[^;}]*\b(?:view|scroll)\(/g) ?? [];
      assert.equal(
        treff.length,
        0,
        `${f}: ${treff.join(", ")}\n  Bruk langformene animation-name/-duration/-timing-function/-fill-mode\n  sammen med animation-timeline, ellers slår minifieren dem sammen til ugyldig CSS.`,
      );
    }
  });
});
