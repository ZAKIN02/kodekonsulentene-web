/**
 * Tester for analysemotoren bak «Sjekk nettsiden din».
 *
 * Kjøres med `npm run test` (node --test, med Node 22 sin innebygde type-stripping,
 * derfor eksplisitt .ts-endelse i importen).
 *
 * Disse testene er ikke pynt. Verktøyet er sidens viktigste salgsargument, og en
 * falsk «Bestått» er verre enn ingen sjekk i det hele tatt.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  erGyldigOrgnr,
  normaliserUrl,
  erTillattVert,
  analyserHeadere,
  analyserCookies,
  analyserUu,
  analyserLovpaalagt,
  analyserYtelseLokalt,
  byggRapport,
  fjernKommentarer,
} from "../src/lib/sjekk.ts";

const h = (o: Record<string, string>) => new Headers(o);

/* ------------------------------------------------------------- orgnr ---- */
describe("erGyldigOrgnr", () => {
  test("godtar ekte organisasjonsnumre", () => {
    // Mod 11 med vektene 3,2,7,6,5,4,3,2. Verifisert for hånd.
    assert.equal(erGyldigOrgnr("923609016"), true); // Equinor ASA
    assert.equal(erGyldigOrgnr("974760673"), true); // Statistisk sentralbyrå
    assert.equal(erGyldigOrgnr("974 760 673"), true, "mellomrom skal tolereres");

    // Regresjon: bare nuller består mod 11-regnestykket, men er ikke et tildelt
    // nummer. Verktøyet meldte vår egen plassholder som gyldig org.nr. i produksjon.
    assert.equal(erGyldigOrgnr("000000000"), false, "bare nuller er ikke et org.nr.");
    assert.equal(erGyldigOrgnr("000 000 000"), false);
    assert.equal(erGyldigOrgnr("974.760.673"), true, "punktum skal tolereres");
  });

  test("avviser feil kontrollsiffer", () => {
    assert.equal(erGyldigOrgnr("923609017"), false);
    assert.equal(erGyldigOrgnr("974760674"), false);
  });

  test("avviser feil lengde", () => {
    assert.equal(erGyldigOrgnr("12345678"), false);
    assert.equal(erGyldigOrgnr("1234567890"), false);
    assert.equal(erGyldigOrgnr(""), false);
  });

  test("avviser numre der kontrollsifferet blir 10", () => {
    // 111111111: sum = 3+2+7+6+5+4+3+2 = 32, 32 % 11 = 10, kontroll = 1 … gyldig.
    // Vi leter etter et nummer der 11 - (sum % 11) === 10, altså sum % 11 === 1.
    // 100000000: sum = 3, rest 3 → kontroll 8, ikke 10.
    // 400000000: sum = 12, rest 1 → kontroll 10 → skal avvises uansett siste siffer.
    for (let siste = 0; siste <= 9; siste++) {
      assert.equal(
        erGyldigOrgnr(`40000000${siste}`),
        false,
        `40000000${siste} har kontrollsiffer 10 og finnes ikke`,
      );
    }
  });

  test("avviser bokstaver og søppel", () => {
    assert.equal(erGyldigOrgnr("abcdefghi"), false);
    assert.equal(erGyldigOrgnr("97476067x"), false);
  });
});

/* --------------------------------------------------------------- url ---- */
describe("normaliserUrl", () => {
  test("legger på https når protokollen mangler", () => {
    assert.equal(normaliserUrl("dinbedrift.no").href, "https://dinbedrift.no/");
    assert.equal(normaliserUrl("  dinbedrift.no  ").href, "https://dinbedrift.no/");
  });

  test("beholder protokollen som er oppgitt", () => {
    assert.equal(normaliserUrl("http://dinbedrift.no").protocol, "http:");
    assert.equal(normaliserUrl("https://dinbedrift.no").protocol, "https:");
  });

  test("beholder sti, men fjerner anker", () => {
    const u = normaliserUrl("dinbedrift.no/om#ansatte");
    assert.equal(u.pathname, "/om");
    assert.equal(u.hash, "");
  });

  test("avviser tom inndata", () => {
    assert.throws(() => normaliserUrl(""), /Skriv inn en nettadresse/);
    assert.throws(() => normaliserUrl("   "), /Skriv inn en nettadresse/);
  });

  test("avviser adresse uten toppdomene", () => {
    assert.throws(() => normaliserUrl("dinbedrift"), /toppdomene/);
    assert.throws(() => normaliserUrl("localhost"), /toppdomene/);
  });

  test("avviser andre protokoller enn http og https", () => {
    assert.throws(() => normaliserUrl("ftp://dinbedrift.no"), /http og https/);
    assert.throws(() => normaliserUrl("javascript:alert(1)"), /.+/);
  });
});

/* ------------------------------------------------------------- ssrf ---- */
describe("erTillattVert", () => {
  const nekt = (u: string) =>
    assert.equal(erTillattVert(new URL(u)), false, `${u} skulle vært blokkert`);
  const tillat = (u: string) =>
    assert.equal(erTillattVert(new URL(u)), true, `${u} skulle vært tillatt`);

  test("blokkerer loopback", () => {
    nekt("http://localhost/");
    nekt("http://127.0.0.1/");
    nekt("http://127.1.2.3/");
    nekt("http://0.0.0.0/");
    nekt("http://app.localhost/");
  });

  test("blokkerer private nett", () => {
    nekt("http://10.0.0.1/");
    nekt("http://10.255.255.255/");
    nekt("http://192.168.1.1/");
    nekt("http://172.16.0.1/");
    nekt("http://172.31.255.255/");
    nekt("http://100.64.0.1/"); // CGNAT
  });

  test("slipper gjennom 172.15 og 172.32, som ikke er private", () => {
    tillat("http://172.15.0.1/");
    tillat("http://172.32.0.1/");
  });

  test("blokkerer skyens metadatatjeneste", () => {
    nekt("http://169.254.169.254/latest/meta-data/");
    nekt("http://metadata.google.internal/");
  });

  test("blokkerer interne toppdomener", () => {
    nekt("http://database.internal/");
    nekt("http://skriver.local/");
    nekt("http://noe.onion/");
  });

  test("slipper gjennom vanlige domener", () => {
    tillat("https://dinbedrift.no/");
    tillat("https://www.nkom.no/");
    tillat("https://xn--brnnysund-02ad.no/");
    tillat("https://1.1.1.1/");
  });
});

/* ---------------------------------------------------------- headere ---- */
describe("analyserHeadere", () => {
  test("naken side gir 0 av 6 og status fail", () => {
    const r = analyserHeadere(h({}));
    assert.equal(r.tilstede.length, 0);
    assert.equal(r.status, "fail");
    assert.equal(r.mangler.length, 6);
  });

  test("alle seks til stede gir status ok", () => {
    const r = analyserHeadere(
      h({
        "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
        "strict-transport-security": "max-age=63072000; includeSubDomains",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin",
        "permissions-policy": "camera=()",
        "x-frame-options": "DENY",
      }),
    );
    assert.equal(r.tilstede.length, 6);
    assert.equal(r.status, "ok");
    assert.deepEqual(r.mangler, []);
  });

  test("CSP med frame-ancestors teller som rammevern uten X-Frame-Options", () => {
    const r = analyserHeadere(h({ "content-security-policy": "frame-ancestors 'none'" }));
    assert.ok(r.tilstede.includes("Rammevern"));
    assert.ok(!r.mangler.includes("X-Frame-Options"));
  });

  test("delvis oppsett gir status warn", () => {
    const r = analyserHeadere(
      h({
        "x-content-type-options": "nosniff",
        "referrer-policy": "no-referrer",
        "x-frame-options": "SAMEORIGIN",
      }),
    );
    assert.equal(r.status, "warn");
  });

  test("HSTS under seks måneder gir egen merknad", () => {
    const r = analyserHeadere(h({ "strict-transport-security": "max-age=3600" }));
    assert.ok(
      r.detaljer.some((d) => /kortere max-age/.test(d)),
      "skal si fra om for kort max-age",
    );
  });

  test("X-Content-Type-Options uten nosniff gir merknad", () => {
    const r = allMedNosniff("noe-annet");
    assert.ok(r.detaljer.some((d) => /nosniff/.test(d)));
  });

  function allMedNosniff(verdi: string) {
    return analyserHeadere(h({ "x-content-type-options": verdi }));
  }
});

/* ---------------------------------------------------------- cookies ---- */
describe("analyserCookies", () => {
  test("ren side uten cookies og sporere gir ok", () => {
    const r = analyserCookies(h({}), "<html><body><p>Hei</p></body></html>");
    assert.equal(r.status, "ok");
    assert.equal(r.egne, 0);
    assert.deepEqual(r.sporere, []);
  });

  test("Google Analytics i HTML gir fail", () => {
    const html = `<html><head><script src="https://www.googletagmanager.com/gtag/js?id=G-X"></script></head></html>`;
    const r = analyserCookies(h({}), html);
    assert.equal(r.status, "fail");
    assert.ok(r.sporere.includes("Google Tag Manager") || r.sporere.includes("Google Analytics"));
    assert.ok(r.detaljer.some((d) => /uten at samtykke/.test(d)));
  });

  test("Meta Pixel og Hotjar kjennes igjen", () => {
    const html = `<script src="https://connect.facebook.net/en_US/fbevents.js"></script>
                  <script src="https://static.hotjar.com/c/hotjar-1.js"></script>`;
    const r = analyserCookies(h({}), html);
    assert.ok(r.sporere.includes("Meta Pixel"));
    assert.ok(r.sporere.includes("Hotjar"));
    assert.equal(r.status, "fail");
  });

  test("egen cookie uten sporere gir warn, ikke fail", () => {
    const r = analyserCookies(h({ "set-cookie": "PHPSESSID=abc; Path=/" }), "<html></html>");
    assert.equal(r.status, "warn");
    assert.equal(r.egne, 1);
  });

  test("sporer i en HTML-kommentar teller ikke", () => {
    const html = `<!-- <script src="https://www.google-analytics.com/analytics.js"></script> -->`;
    const r = analyserCookies(h({}), html);
    assert.equal(r.status, "ok", "kommentert bort kode kjører ikke og skal ikke telles");
  });
});

/* --------------------------------------------------------------- uu ---- */
describe("analyserUu", () => {
  const ren = `<!doctype html><html lang="nb"><head><title>Tittel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body><h1>Overskrift</h1><img src="a.png" alt="Noe"><a href="/x">Lenke</a>
    <label for="e">E-post</label><input id="e" type="email"></body></html>`;

  test("ren side gir null feil", () => {
    const r = analyserUu(ren);
    assert.equal(r.feil, 0, `fant uventede feil: ${r.detaljer.join(" | ")}`);
    assert.equal(r.status, "ok");
  });

  test("manglende lang oppdages", () => {
    const r = analyserUu(ren.replace('<html lang="nb">', "<html>"));
    assert.ok(r.detaljer.some((d) => /3\.1\.1/.test(d)));
  });

  test("bilde uten alt oppdages", () => {
    const r = analyserUu(ren.replace('<img src="a.png" alt="Noe">', '<img src="a.png">'));
    assert.ok(r.detaljer.some((d) => /1\.1\.1/.test(d)));
  });

  test("flere h1 oppdages", () => {
    const r = analyserUu(ren.replace("<h1>Overskrift</h1>", "<h1>En</h1><h1>To</h1>"));
    assert.ok(r.detaljer.some((d) => /2 hovedoverskrifter/.test(d)));
  });

  test("manglende h1 oppdages", () => {
    const r = analyserUu(ren.replace("<h1>Overskrift</h1>", ""));
    assert.ok(r.detaljer.some((d) => /ingen hovedoverskrift/.test(d)));
  });

  test("user-scalable=no oppdages", () => {
    const r = analyserUu(
      ren.replace("width=device-width, initial-scale=1", "width=device-width, user-scalable=no"),
    );
    assert.ok(r.detaljer.some((d) => /1\.4\.4/.test(d)));
  });

  test("skjemafelt uten ledetekst oppdages", () => {
    const r = analyserUu(ren.replace('<label for="e">E-post</label>', ""));
    assert.ok(r.detaljer.some((d) => /3\.3\.2/.test(d)));
  });

  test("aria-label teller som ledetekst", () => {
    const html = ren.replace('<label for="e">E-post</label>', "").replace('<input id="e" type="email">', '<input id="e" type="email" aria-label="E-post">');
    const r = analyserUu(html);
    assert.ok(!r.detaljer.some((d) => /3\.3\.2/.test(d)));
  });

  test("mange feil gir status fail", () => {
    const r = analyserUu("<html><body><img src=a.png><img src=b.png><a href=/></a></body></html>");
    assert.equal(r.status, "fail");
  });
});

/* -------------------------------------------------------- lovpålagt ---- */
describe("analyserLovpaalagt", () => {
  const full = `<html><body>
    <footer><address>Storgata 1, 0155 Oslo</address>
    Statistisk sentralbyrå, org.nr. 974 760 673
    <a href="mailto:post@ssb.no">post@ssb.no</a>
    <a href="tel:+4721094200">21 09 42 00</a>
    <a href="/personvern">Personvern</a></footer></body></html>`;

  test("finner gyldig org.nr. og gir ok når alt er på plass", () => {
    const r = analyserLovpaalagt(full);
    assert.equal(r.orgnr, "974760673");
    assert.equal(r.epost, true);
    assert.equal(r.telefon, true);
    assert.equal(r.adresse, true);
    assert.equal(r.personvern, true);
    assert.equal(r.status, "ok");
  });

  test("mangler org.nr. gir fail", () => {
    const r = analyserLovpaalagt("<html><body>Ingen tall her</body></html>");
    assert.equal(r.orgnr, null);
    assert.equal(r.status, "fail");
    assert.ok(r.detaljer.some((d) => /organisasjonsnummer/.test(d)));
  });

  test("telefonnummer som ligner på org.nr. tolkes ikke som org.nr.", () => {
    // 123 456 789 har feil kontrollsiffer og er altså ikke et organisasjonsnummer.
    const r = analyserLovpaalagt("<html><body>Ring oss på 123 456 789</body></html>");
    assert.equal(r.orgnr, null, "mod 11 skal luke ut tilfeldige nisifre");
  });

  test("org.nr. uten resten gir warn, ikke ok", () => {
    const r = analyserLovpaalagt("<html><body>Org.nr. 974 760 673</body></html>");
    assert.equal(r.orgnr, "974760673");
    assert.equal(r.status, "warn");
  });
});

/* ---------------------------------------------------------- rapport ---- */
describe("byggRapport", () => {
  const lagRapport = () =>
    byggRapport({
      url: "dinbedrift.no",
      dato: "5. okt. 2026",
      ytelse: analyserYtelseLokalt("<html><head></head></html>", 1200, 90),
      headere: analyserHeadere(new Headers()),
      cookies: analyserCookies(new Headers(), "<html></html>"),
      uu: analyserUu('<html lang="nb"><head><title>T</title></head><body><h1>H</h1></body></html>'),
      lov: analyserLovpaalagt("<html><body>Org.nr. 974 760 673</body></html>"),
    });

  test("radene kommer i den faste rekkefølgen fra sidemønstrene", () => {
    const r = lagRapport();
    assert.deepEqual(
      r.rader.map((x) => x.name),
      [
        "Ytelse",
        "Sikkerhetsheadere",
        "Cookies før samtykke",
        "Universell utforming",
        "Lovpålagt informasjon",
      ],
    );
  });

  test("hver rad har status, verdi og en setning om hva det betyr", () => {
    for (const rad of lagRapport().rader) {
      assert.ok(["ok", "warn", "fail", "neutral"].includes(rad.status), rad.name);
      assert.ok(rad.value.length > 0, `${rad.name} mangler verdi`);
      assert.ok(rad.note.length > 20, `${rad.name} mangler forklaring`);
    }
  });

  test("ytelse uten PageSpeed-nøkkel blir «Ikke sjekket», ikke «Bestått»", () => {
    const rad = lagRapport().rader[0]!;
    assert.equal(rad.status, "neutral", "verktøyet skal aldri påstå mer enn det har målt");
  });

  test("forbeholdene står alltid i rapporten", () => {
    const r = lagRapport();
    assert.ok(r.forbehold.length >= 4);
    assert.ok(r.forbehold.some((f) => /ikke juridisk rådgivning/i.test(f)));
  });

  test("totalscoren ligger mellom 0 og 100", () => {
    const r = lagRapport();
    assert.ok(r.totalt >= 0 && r.totalt <= 100, `uventet score: ${r.totalt}`);
  });

  test("en side som består alt får 100", () => {
    const perfekt = byggRapport({
      url: "kodekonsulentene.no",
      dato: "5. okt. 2026",
      ytelse: { ...analyserYtelseLokalt("<html></html>", 900, 40), score: 100, lcp: 800 },
      headere: analyserHeadere(
        new Headers({
          "content-security-policy": "default-src 'self'",
          "strict-transport-security": "max-age=63072000",
          "x-content-type-options": "nosniff",
          "referrer-policy": "strict-origin-when-cross-origin",
          "permissions-policy": "camera=()",
          "x-frame-options": "DENY",
        }),
      ),
      cookies: analyserCookies(new Headers(), "<html></html>"),
      uu: analyserUu('<html lang="nb"><head><title>T</title></head><body><h1>H</h1></body></html>'),
      lov: analyserLovpaalagt(
        '<html><body><address>Storgata 1, 0155 Oslo</address>974 760 673 <a href="mailto:a@b.no">a@b.no</a> <a href="tel:+4721094200">x</a> <a href="/personvern">p</a></body></html>',
      ),
    });
    assert.equal(perfekt.totalt, 100);
  });
});

/* --------------------------------------------------------- hjelpere ---- */
describe("fjernKommentarer", () => {
  test("fjerner HTML-kommentarer", () => {
    assert.equal(fjernKommentarer("a<!-- b -->c").includes("b"), false);
  });
  test("lar vanlig innhold stå", () => {
    assert.ok(fjernKommentarer("<p>Hei</p>").includes("Hei"));
  });
});

describe("org.nr. verifisert mot Enhetsregisteret", () => {
  const rapportMed = (lovOverstyring: Record<string, unknown>) =>
    byggRapport({
      url: "dinbedrift.no",
      dato: "6. okt. 2026",
      ytelse: analyserYtelseLokalt("<html><head></head></html>", 1200, 90),
      headere: analyserHeadere(new Headers()),
      cookies: analyserCookies(new Headers(), "<html></html>"),
      uu: analyserUu('<html lang="nb"><head><title>T</title></head><body><h1>H</h1></body></html>'),
      lov: {
        ...analyserLovpaalagt(
          '<html><body><address>Gata 1, 0150 Oslo</address> Org.nr. 974 760 673 ' +
            '<a href="mailto:p@d.no">p@d.no</a> <a href="tel:+4722000000">22 00 00 00</a> ' +
            '<a href="/personvern">Personvern</a></body></html>',
        ),
        ...lovOverstyring,
      },
    });

  const lovRad = (r: ReturnType<typeof rapportMed>) =>
    r.rader.find((x) => x.name === "Lovpålagt informasjon")!;

  test("bekreftet nummer nevner foretaksnavnet", () => {
    const rad = lovRad(rapportMed({ oppslagKjort: true, foretak: { navn: "Statistisk sentralbyrå", form: "ORGL", slettet: false } }));
    assert.equal(rad.status, "ok");
    assert.equal(rad.value, "Org.nr. bekreftet");
    assert.match(rad.note, /Statistisk sentralbyrå/);
  });

  test("nummer som består mod 11 men ikke finnes, er brudd", () => {
    const rad = lovRad(rapportMed({ oppslagKjort: true, foretak: null }));
    assert.equal(rad.status, "fail");
    assert.equal(rad.value, "Org.nr. finnes ikke");
    assert.match(rad.note, /står ikke i Enhetsregisteret/);
  });

  test("slettet foretak er brudd, selv om nummeret finnes", () => {
    const rad = lovRad(rapportMed({ oppslagKjort: true, foretak: { navn: "Nedlagt AS", form: "AS", slettet: true } }));
    assert.equal(rad.status, "fail");
    assert.equal(rad.value, "Foretaket er slettet");
  });

  test("uten oppslag faller den tilbake på «funnet», ikke «bekreftet»", () => {
    const rad = lovRad(rapportMed({ oppslagKjort: false, foretak: null }));
    assert.equal(rad.value, "Org.nr. funnet");
    assert.equal(rad.status, "ok");
  });

  test("forbeholdet sier hva oppslaget ikke beviser", () => {
    const r = rapportMed({ oppslagKjort: true, foretak: { navn: "X", form: "AS", slettet: false } });
    assert.ok(r.forbehold.some((f) => /ikke at det er riktig foretak/.test(f)));
  });
});

describe("delte lister holder seg i synk over byggekontekstene", () => {
  /**
   * Skanneren bygges i en EGEN Docker-kontekst uten src/, og hovedappens kontekst
   * utelater services/ (se .dockerignore). WCAG-listen finnes derfor to steder.
   *
   * Rontgen.astro importerte først rett over den grensen. Det bygde fint lokalt og
   * feilet i Docker med «Could not resolve» – deployen var rød to ganger før
   * årsaken var klar, fordi feilen bare oppstår i byggekonteksten.
   */
  test("WCAG_NAVN er identisk i src/data og i skanneren", async () => {
    const fra = (await import("../src/data/wcag.ts")).WCAG_NAVN;
    const skanner = (await import("../services/skanner/wcag-navn.mjs")).WCAG_NAVN;
    assert.deepEqual(
      fra,
      skanner,
      "Listene er ute av synk. Begge må oppdateres – de kan ikke importere hverandre.",
    );
  });
});

describe("opphavskontrollen som erstatter Astros", () => {
  /**
   * Astros checkOrigin sammenligner Origin mot forespørselens EGEN URL. Bak Fly
   * snakker Node over http internt, så den regnet origin som http:// mens
   * nettleseren sendte https:// – og HVER eneste skjemainnsending ble 403
   * «Cross-site POST form submissions are forbidden». Kontaktskjemaet var dødt
   * i produksjon, og ingen test fanget det fordi kontrollen ligger i rammeverket.
   */
  const be = (h: Record<string, string>) => new Request("https://x/api/kontakt", { method: "POST", headers: h });

  test("vårt eget domene slipper gjennom", async () => {
    const { erEgetOpphav } = await import("../src/lib/opphav.ts");
    assert.equal(erEgetOpphav(be({ origin: "https://kodekonsulentene.no" })), true);
    assert.equal(erEgetOpphav(be({ origin: "https://www.kodekonsulentene.no" })), true);
  });

  test("et fremmed nettsted blokkeres", async () => {
    const { erEgetOpphav } = await import("../src/lib/opphav.ts");
    assert.equal(erEgetOpphav(be({ origin: "https://ondsinnet.example" })), false);
    assert.equal(erEgetOpphav(be({ referer: "https://ondsinnet.example/angrep" })), false);
  });

  test("uten Origin slipper gjennom, ellers stenger vi ute folk uten JavaScript", async () => {
    const { erEgetOpphav } = await import("../src/lib/opphav.ts");
    assert.equal(erEgetOpphav(be({})), true);
  });

  test("lokal utvikling slipper gjennom", async () => {
    const { erEgetOpphav } = await import("../src/lib/opphav.ts");
    assert.equal(erEgetOpphav(be({ origin: "http://localhost:4321" })), true);
    assert.equal(erEgetOpphav(be({ origin: "http://127.0.0.1:4321" })), true);
  });
});
