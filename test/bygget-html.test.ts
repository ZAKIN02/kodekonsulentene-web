import { execSync } from "node:child_process";
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
    // Listen leses ut av serveren, ikke hardkodet her. En hardkodet kopi kommer
    // uunngåelig ut av synk – den gjorde det da manifest.webmanifest ble lagt til.
    const kode = readFileSync("server.mjs", "utf8");
    const kjente = new Set([...kode.matchAll(/"(\.[a-z0-9]+)"\s*:/g)].map((m) => m[1]));
    const gaa = (d: string): string[] =>
      readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? gaa(join(d, e.name)) : [join(d, e.name)],
      );
    // .md i public/ er dokumentasjon som ligger ved siden av ressursene
    // (public/logo/README.md forklarer logosettet). Den serveres aldri.
    for (const f of gaa("public").filter((f) => !f.endsWith(".md"))) {
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

describe("tomme lenker kan ikke snike seg inn igjen", () => {
  /**
   * firma.telefon er tomt til vi har et ekte nummer, og to steder manglet vakten.
   * Resultatet var <a href="tel:"></a> – en lenke uten mål og uten tekst, som lå
   * live. Bryter WCAG 2.4.4 (lenkens formål) og 4.1.2 (navn, rolle, verdi).
   */
  test("ingen tomme tel:- eller mailto:-lenker i bygget", () => {
    for (const f of filer) {
      const html = readFileSync(f, "utf8");
      for (const skjema of ["tel:", "mailto:"]) {
        assert.ok(
          !html.includes(`href="${skjema}"`),
          `${f} har <a href="${skjema}"> uten verdi. Feltet er tomt – da skal lenken ikke rendres.`,
        );
      }
    }
  });
});

describe("typekontrollen er grønn", () => {
  /**
   * `npx astro check | tail -3` viser «0 warnings / 0 hints» også når det er feil –
   * antallet står på linjen over. Jeg rapporterte «0 typefeil» på et bygg med to,
   * to ganger. Testen leser tallet i stedet for å stole på et øyekast.
   */
  test("astro check melder null feil", () => {
    const ut = execSync("npx astro check 2>&1 || true", { encoding: "utf8" });
    const m = ut.match(/- (\d+) errors?/);
    assert.ok(m, `Fant ikke feiltellingen i utdata fra astro check:\n${ut.slice(-400)}`);
    assert.equal(m![1], "0", `astro check melder ${m![1]} feil:\n${ut.slice(-900)}`);
  });
});

describe("plassholdere kommer aldri ut til kunder", () => {
  /**
   * To lå live: /om viste en grå boks med «TODO: bilde fra arbeidet», og /status
   * sa «TODO: koble denne siden mot ekte oppetidsovervåkning … før den brukes som
   * salgsargument» – et internt notat som kundetekst.
   *
   * synligeCaser filtrerte caser med TODO, men ingenting fanget TODO skrevet rett
   * inn i en side.
   */
  test("ingen TODO, FIXME eller plassholdertekst i bygget HTML", () => {
    for (const f of filer) {
      const html = readFileSync(f, "utf8");
      for (const ord of ["TODO", "FIXME", "Lorem ipsum", "placeholder-tekst"]) {
        assert.ok(
          !html.includes(ord),
          `${f} inneholder «${ord}». Interne notater skal ikke rendres som kundetekst.`,
        );
      }
    }
  });
});

describe("terminalen har fast mørk flate i begge temaer", () => {
  /**
   * .kk-term har --terminal: #060708 i BEGGE temaer, men --ok, --warn og --fail
   * byttet med temaet. I lyst tema ble derfor mørk tekst malt på mørk flate:
   * warn 3,31:1, fail 2,96:1, ok 3,85:1 mot WCAG-kravet på 4,5.
   *
   * Vår EGEN uu-sjekk fant dette på vår EGEN forside – på siden som selger
   * universell utforming.
   */
  test("terminalfargene er faste, ikke temavariabler", () => {
    const css = readFileSync("src/styles/components.css", "utf8");
    for (const klasse of ["kk-ok", "kk-warn", "kk-fail"]) {
      const regel = css.match(new RegExp(`\\\\.kk-term \\\\.${klasse}\\\\s*\\\\{[^}]*\\\\}`));
      assert.ok(regel, `Fant ingen regel for .kk-term .${klasse}`);
      assert.ok(
        !regel![0].includes("var(--"),
        `.kk-term .${klasse} bruker en temavariabel. Terminalflaten er mørk i begge ` +
          `temaer, så fargen må være fast – ellers males mørk tekst på mørk flate i lyst tema.`,
      );
    }
  });
});
