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
