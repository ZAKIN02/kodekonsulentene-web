/**
 * Tester for skannertjenesten og klienten mot den.
 *
 * To ting testes som om de var sikkerhetskritiske, fordi de er det:
 *
 * 1. SSRF-vernet. Skanneren åpner en ekte nettleser mot en adresse en fremmed
 *    har skrevet inn. Kan den lures til å laste 169.254.169.254, lekker
 *    skyhemmeligheter. Vernet er duplisert mellom src/lib/sjekk.ts og
 *    services/skanner/ssrf.mjs, og her sammenlignes de to på de samme vertene,
 *    slik at et avvik gir rød test i stedet for et hull i produksjon.
 *
 * 2. Sporergjenkjenningen. Treffer den for bredt, melder vi folk for sporing de
 *    ikke driver med. Det er en påstand om lovbrudd – den skal være riktig.
 *
 * Kjøres med `npm run test` (node --test, Node 22 type-stripping).
 */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { finnSporer, erForstepart, registrerbartDomene, SPORERE } from "../services/skanner/sporere.mjs";
import {
  erTillattVert as erTillattVertTjeneste,
  normaliserUrl as normaliserUrlTjeneste,
} from "../services/skanner/ssrf.mjs";
import { erTillattVert as erTillattVertApp } from "../src/lib/sjekk.ts";
import {
  skannCookies,
  skannUu,
  forklarFeil,
  cookieStatus,
  uuStatus,
  type CookieSkann,
  type UuSkann,
} from "../src/lib/skanner.ts";

/* ----------------------------------------------------------- sporere ---- */

describe("sporerlisten", () => {
  test("kjenner igjen de store sporerne på eksakt domene", () => {
    assert.equal(finnSporer("www.google-analytics.com")?.id, "google-analytics");
    assert.equal(finnSporer("googletagmanager.com")?.id, "google-tag-manager");
    assert.equal(finnSporer("connect.facebook.net")?.id, "meta-pixel");
    assert.equal(finnSporer("static.hotjar.com")?.id, "hotjar");
    assert.equal(finnSporer("www.clarity.ms")?.id, "microsoft-clarity");
    assert.equal(finnSporer("snap.licdn.com")?.id, "linkedin-insight");
    assert.equal(finnSporer("analytics.tiktok.com")?.id, "tiktok-pixel");
    assert.equal(finnSporer("sc-static.net")?.id, "snap-pixel");
    assert.equal(finnSporer("cdn.matomo.cloud")?.id, "matomo-sky");
    assert.equal(finnSporer("js.hs-scripts.com")?.id, "hubspot");
  });

  test("treffer på underdomener, men ikke på delstreng", () => {
    assert.ok(finnSporer("eu.clarity.ms"), "underdomene skal treffe");

    // Dette er hele poenget: en påstand om ulovlig sporing må ikke bygge på at
    // domenenavnet tilfeldigvis inneholder et sporernavn.
    assert.equal(finnSporer("notgoogle-analytics.com"), null);
    assert.equal(finnSporer("google-analytics.com.eksempel.no"), null);
    assert.equal(finnSporer("hotjar.no"), null, "annet toppdomene er ikke samme tjeneste");
    assert.equal(finnSporer("minhotjar.com"), null);
  });

  test("gir null for vanlige norske verter", () => {
    for (const v of ["dinbedrift.no", "www.nkom.no", "kodekonsulentene.no", "fiken.no"]) {
      assert.equal(finnSporer(v), null, `${v} skal ikke være en sporer`);
    }
  });

  test("tåler søppel uten å kaste", () => {
    assert.equal(finnSporer(""), null);
    assert.equal(finnSporer(undefined as unknown as string), null);
    assert.equal(finnSporer("..."), null);
  });

  test("hver oppføring har kilde og dato", () => {
    for (const s of SPORERE) {
      assert.ok(s.kilde?.startsWith("https://"), `${s.id} mangler kilde`);
      assert.match(s.sjekket, /^\d{4}-\d{2}-\d{2}$/, `${s.id} mangler gyldig dato`);
      assert.ok(s.domener.length > 0, `${s.id} mangler domener`);
    }
  });
});

/* ------------------------------------------------- førstepart/tredjepart ---- */

describe("førstepart eller tredjepart", () => {
  test("cookie fra samme domene er førstepart", () => {
    assert.equal(erForstepart("dinbedrift.no", "dinbedrift.no"), true);
    assert.equal(erForstepart(".dinbedrift.no", "www.dinbedrift.no"), true);
    assert.equal(erForstepart("www.dinbedrift.no", "dinbedrift.no"), true);
    assert.equal(erForstepart("shop.dinbedrift.no", "www.dinbedrift.no"), true);
  });

  test("cookie fra andre domener er tredjepart", () => {
    assert.equal(erForstepart(".doubleclick.net", "dinbedrift.no"), false);
    assert.equal(erForstepart(".facebook.com", "dinbedrift.no"), false);
    assert.equal(erForstepart("dinbedrift.no.angriper.com", "dinbedrift.no"), false);
  });

  test("registrerbart domene tar de to siste leddene", () => {
    assert.equal(registrerbartDomene("www.dinbedrift.no"), "dinbedrift.no");
    assert.equal(registrerbartDomene("dinbedrift.no"), "dinbedrift.no");
    assert.equal(registrerbartDomene("a.b.c.example.com"), "example.com");
  });

  test("tåler tomme verdier", () => {
    assert.equal(erForstepart("", "dinbedrift.no"), false);
    assert.equal(erForstepart("dinbedrift.no", ""), false);
  });
});

/* -------------------------------------------------------------- SSRF ---- */

const BLOKKERTE = [
  "http://localhost/",
  "http://127.0.0.1/",
  "http://0.0.0.0/",
  "http://10.0.0.5/",
  "http://192.168.1.1/",
  "http://172.16.0.1/",
  "http://172.31.255.255/",
  "http://169.254.169.254/",
  "http://100.64.0.1/",
  "http://metadata.google.internal/",
  "http://noe.internal/",
  "http://skriver.local/",
  "http://bedrift.localhost/",
  "http://[::1]/",
  "http://[fd00::1]/",
  "http://239.255.255.250/",
];

const TILLATTE = [
  "https://dinbedrift.no/",
  "https://www.nkom.no/",
  "https://kodekonsulentene.no/",
  "https://93.184.216.34/",
  "https://[2606:2800:220:1::1]/",
];

describe("SSRF-vernet i skannertjenesten", () => {
  test("blokkerer interne og lokale adresser", () => {
    for (const u of BLOKKERTE) {
      assert.equal(erTillattVertTjeneste(new URL(u)), false, `${u} skulle vært blokkert`);
    }
  });

  test("slipper gjennom vanlige offentlige adresser", () => {
    for (const u of TILLATTE) {
      assert.equal(erTillattVertTjeneste(new URL(u)), true, `${u} skulle vært tillatt`);
    }
  });

  test("tjenesten og nettsiden er enige om hver eneste vert", () => {
    // Logikken er duplisert fordi tjenesten er en egen app. Denne testen er
    // grunnen til at dupliseringen er forsvarlig: spriker de, blir det rødt her.
    for (const u of [...BLOKKERTE, ...TILLATTE]) {
      const url = new URL(u);
      assert.equal(
        erTillattVertTjeneste(url),
        erTillattVertApp(url),
        `${u}: tjenesten og src/lib/sjekk.ts er uenige – hold dem i synk`,
      );
    }
  });

  test("normaliserUrl avviser andre protokoller enn http og https", () => {
    assert.throws(() => normaliserUrlTjeneste("ftp://dinbedrift.no"), /http og https/);
    assert.throws(() => normaliserUrlTjeneste("file:///etc/passwd"), /http og https/);
    assert.throws(() => normaliserUrlTjeneste(""), /nettadresse/);
    assert.throws(() => normaliserUrlTjeneste("uten-toppdomene"), /toppdomene/);
    assert.equal(normaliserUrlTjeneste("dinbedrift.no").href, "https://dinbedrift.no/");
  });
});

/* ------------------------------------------------------------ klient ---- */

/**
 * Klienten testes mot en ekte liten HTTP-tjener i stedet for et stubbet fetch.
 * Da er det den virkelige kodebanen som testes, inkludert JSON-parsing og
 * statuskoder.
 */
let tjener: Server;
let base: string;

/**
 * Klienten bygger stien selv (`new URL("/cookie", base)`), så en sti i basen
 * blir forkastet. Scenariet styres derfor av denne variabelen, ikke av URL-en.
 */
let modus: "500" | "503" | "soppel" | "ok" = "ok";
let sisteNokkel: string | undefined;

before(async () => {
  tjener = createServer((forespørsel, svar) => {
    sisteNokkel = forespørsel.headers["x-skanner-nokkel"] as string | undefined;
    const json = (status: number, kropp: string) => {
      svar.writeHead(status, { "content-type": "application/json" });
      svar.end(kropp);
    };
    if (modus === "500") return json(500, JSON.stringify({ feil: "Noe gikk galt." }));
    if (modus === "503") return json(503, JSON.stringify({ feil: "Skanneren er opptatt." }));
    if (modus === "soppel") return json(200, "dette er ikke json");
    return json(200, JSON.stringify({ url: "https://dinbedrift.no/", cookies: [], millisekunder: 10 }));
  });
  tjener.listen(0, "127.0.0.1");
  await once(tjener, "listening");
  base = `http://127.0.0.1:${(tjener.address() as AddressInfo).port}`;
});

after(() => {
  tjener.close();
});

describe("klienten mot skanneren", () => {
  test("sier «ikke konfigurert» når adresse eller nøkkel mangler", async () => {
    const forrige = { ...process.env };
    delete process.env.SKANNER_URL;
    delete process.env.SKANNER_NOKKEL;
    try {
      const svar = await skannCookies("https://dinbedrift.no");
      assert.equal(svar.resultat, null);
      assert.equal(svar.feil, "ikke-konfigurert");
    } finally {
      Object.assign(process.env, forrige);
    }
  });

  test("returnerer null i stedet for å kaste når tjenesten svarer 500", async () => {
    process.env.SKANNER_URL = base;
    process.env.SKANNER_NOKKEL = "test";
    modus = "500";
    const svar = await skannCookies("https://dinbedrift.no");
    assert.equal(svar.resultat, null);
    assert.equal(svar.feil, "utilgjengelig");
  });

  test("503 fra tjenesten blir «opptatt», ikke en generell feil", async () => {
    process.env.SKANNER_URL = base;
    process.env.SKANNER_NOKKEL = "test";
    modus = "503";
    const svar = await skannUu("https://dinbedrift.no");
    assert.equal(svar.resultat, null);
    assert.equal(svar.feil, "opptatt");
    assert.equal(svar.melding, "Skanneren er opptatt.");
  });

  test("ugyldig JSON velter ikke klienten", async () => {
    process.env.SKANNER_URL = base;
    process.env.SKANNER_NOKKEL = "test";
    modus = "soppel";
    const svar = await skannUu("https://dinbedrift.no");
    assert.equal(svar.resultat, null);
    assert.equal(svar.feil, "utilgjengelig");
  });

  test("sender den delte hemmeligheten som header", async () => {
    process.env.SKANNER_URL = base;
    process.env.SKANNER_NOKKEL = "hemmelig-123";
    modus = "ok";
    await skannCookies("https://dinbedrift.no");
    assert.equal(sisteNokkel, "hemmelig-123");
  });

  test("en tjeneste som ikke svarer gir «utilgjengelig», ikke et kast", async () => {
    // Lukket port: fetch avviser, og klienten skal ta det i catch-grenen.
    process.env.SKANNER_URL = "http://127.0.0.1:1";
    process.env.SKANNER_NOKKEL = "test";
    const svar = await skannCookies("https://dinbedrift.no");
    assert.equal(svar.resultat, null);
    assert.equal(svar.feil, "utilgjengelig");
  });

  test("forklarFeil gir en norsk setning for hver feilkode", () => {
    for (const f of ["ikke-konfigurert", "utilgjengelig", "tidsavbrudd", "opptatt", "avvist"] as const) {
      const t = forklarFeil(f, null);
      assert.ok(t.length > 10, `${f} mangler forklaring`);
      assert.doesNotMatch(t, /undefined|null/);
    }
  });

  test("forklarFeil foretrekker tjenestens egen melding", () => {
    assert.equal(forklarFeil("opptatt", "Prøv igjen om litt."), "Prøv igjen om litt.");
  });
});

/* ------------------------------------------------------- oppsummering ---- */

const tomCookieSkann: CookieSkann = {
  url: "https://dinbedrift.no/",
  status: 200,
  cookies: [],
  lagring: { local: [], session: [] },
  sporere: [],
  ukjenteTredjeparter: [],
  blokkertAvVern: [],
  millisekunder: 1200,
};

describe("statusen rapporten setter", () => {
  test("ingenting satt gir bestått", () => {
    assert.equal(cookieStatus(tomCookieSkann), "ok");
  });

  test("en kjent sporer gir brudd", () => {
    assert.equal(
      cookieStatus({
        ...tomCookieSkann,
        sporere: [
          {
            id: "google-analytics",
            navn: "Google Analytics",
            kategori: "analyse",
            vert: "www.google-analytics.com",
            antallKall: 2,
            typiskeCookies: ["_ga"],
            kilde: "https://example.com",
          },
        ],
      }),
      "fail",
    );
  });

  test("tredjeparts-cookie gir brudd selv uten kjent sporer", () => {
    assert.equal(
      cookieStatus({
        ...tomCookieSkann,
        cookies: [
          { navn: "x", domene: ".ukjent.com", forstepart: false, levetidDager: 30, sikker: true, httpOnly: false, sporer: null },
        ],
      }),
      "fail",
    );
  });

  test("bare egne cookies gir «bør fikses», ikke brudd", () => {
    // Strengt nødvendige cookies er lov. Verktøyet kan ikke avgjøre hvilke som
    // er det, så det skal ikke rope «brudd» på en førsteparts øktcookie.
    assert.equal(
      cookieStatus({
        ...tomCookieSkann,
        cookies: [
          { navn: "okt", domene: "dinbedrift.no", forstepart: true, levetidDager: null, sikker: true, httpOnly: true, sporer: null },
        ],
      }),
      "warn",
    );
  });

  test("alvorlige WCAG-brudd gir brudd, mindre gir «bør fikses»", () => {
    const basis: UuSkann = {
      url: "https://dinbedrift.no/",
      status: 200,
      brudd: [],
      antallBrudd: 0,
      antallRegler: 0,
      bestått: 40,
      måSjekkesManuelt: [],
      millisekunder: 900,
    };
    assert.equal(uuStatus(basis), "ok");

    const mindre = {
      ...basis,
      antallBrudd: 2,
      antallRegler: 1,
      brudd: [{ regel: "region", alvorlighet: "moderate", forklaring: "x", krav: null, oversatt: true, antall: 2, eksempler: [], hjelpeLenke: "" }],
    };
    assert.equal(uuStatus(mindre), "warn");

    const alvorlig = {
      ...basis,
      antallBrudd: 1,
      antallRegler: 1,
      brudd: [{ regel: "image-alt", alvorlighet: "critical", forklaring: "x", krav: "WCAG 1.1.1", oversatt: true, antall: 1, eksempler: [], hjelpeLenke: "" }],
    };
    assert.equal(uuStatus(alvorlig), "fail");
  });
});
