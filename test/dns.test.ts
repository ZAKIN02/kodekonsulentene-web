/**
 * Tester for e-postsjekken (SPF, DKIM, DMARC).
 *
 * Parserne testes mot ekte poster, skrevet av som de står i DNS. Nettverksdelen
 * testes ikke her – den har ingen logikk utover å hente og falle tilbake.
 *
 * Det viktigste en test kan verne om her: at «DMARC finnes» ikke forveksles med
 * «DMARC virker». p=none er den vanligste feilen, og den ser ut som en bestått
 * sjekk hvis man bare ser etter om posten er der.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  parseSpf,
  parseDmarc,
  vurderSpf,
  vurderDmarc,
  vurderDkim,
  byggEpostRapport,
  normaliserDomene,
} from "../src/lib/dns.ts";

/* --------------------------------------------------------------- SPF ---- */
describe("parseSpf", () => {
  test("finner posten blant andre TXT-poster", () => {
    const f = parseSpf([
      "google-site-verification=abc123",
      "v=spf1 include:_spf.google.com ~all",
      "MS=ms12345",
    ]);
    assert.equal(f.finnes, true);
    assert.equal(f.all, "~all");
    assert.equal(f.oppslag, 1);
    assert.deepEqual(f.feil, []);
  });

  test("melder fra når posten mangler helt", () => {
    const f = parseSpf(["google-site-verification=abc"]);
    assert.equal(f.finnes, false);
    assert.equal(vurderSpf(f).status, "fail");
  });

  test("teller bare mekanismene som koster et DNS-oppslag", () => {
    // include, a, mx, exists og redirect teller. ip4, ip6 og all gjør ikke.
    const f = parseSpf([
      "v=spf1 ip4:1.2.3.4 ip6:::1 a mx include:x.no include:y.no exists:%{i}.z.no -all",
    ]);
    assert.equal(f.oppslag, 5, "a, mx, 2 × include, exists");
  });

  test("over ti oppslag er et brudd mot grensen i RFC 7208", () => {
    const mange = Array.from({ length: 11 }, (_, i) => `include:a${i}.no`).join(" ");
    const f = parseSpf([`v=spf1 ${mange} ~all`]);
    assert.equal(f.oppslag, 11);
    assert.match(f.feil[0]!, /Grensen er 10/);
    assert.equal(vurderSpf(f).status, "warn");
  });

  test("«+all» slipper hvem som helst inn og er et brudd", () => {
    const f = parseSpf(["v=spf1 include:_spf.google.com +all"]);
    assert.equal(f.all, "+all");
    assert.equal(vurderSpf(f).status, "fail");
  });

  test("manglende all-mekanisme flagges", () => {
    const f = parseSpf(["v=spf1 include:_spf.google.com"]);
    assert.equal(f.all, null);
    assert.match(f.feil[0]!, /mangler en all-mekanisme/);
  });

  test("flere SPF-poster gjør at ingen av dem virker", () => {
    const f = parseSpf(["v=spf1 include:a.no ~all", "v=spf1 include:b.no ~all"]);
    assert.equal(f.flerePoster, true);
    assert.equal(vurderSpf(f).status, "fail");
  });

  test("«-all» omtales som strengere enn «~all»", () => {
    assert.match(vurderSpf(parseSpf(["v=spf1 -all"])).note, /strengt/);
    assert.match(vurderSpf(parseSpf(["v=spf1 ~all"])).note, /strengere/);
  });
});

/* ------------------------------------------------------------- DMARC ---- */
describe("parseDmarc", () => {
  test("leser policy, rapportadresse og pct", () => {
    const f = parseDmarc(["v=DMARC1; p=reject; sp=quarantine; pct=100; rua=mailto:d@x.no"]);
    assert.equal(f.p, "reject");
    assert.equal(f.sp, "quarantine");
    assert.equal(f.pct, 100);
    assert.equal(f.rua, "mailto:d@x.no");
    assert.deepEqual(f.feil, []);
    assert.equal(vurderDmarc(f).status, "ok");
  });

  test("manglende post er et brudd", () => {
    const f = parseDmarc([]);
    assert.equal(f.finnes, false);
    assert.equal(vurderDmarc(f).status, "fail");
    assert.match(vurderDmarc(f).note, /faktura i deres navn/);
  });

  test("p=none ser ut som en bestått sjekk, men er det ikke", () => {
    const f = parseDmarc(["v=DMARC1; p=none; rua=mailto:d@x.no"]);
    assert.equal(f.finnes, true, "posten finnes");
    const r = vurderDmarc(f);
    assert.equal(r.status, "warn", "men den gjør ingenting med falsk e-post");
    assert.match(r.note, /levert som normalt/);
  });

  test("p=none uten rapportadresse er helt uten virkning", () => {
    const r = vurderDmarc(parseDmarc(["v=DMARC1; p=none"]));
    assert.match(r.note, /ingenting i det hele tatt/);
  });

  test("p=quarantine og p=reject skilles i ordlyden", () => {
    assert.match(vurderDmarc(parseDmarc(["v=DMARC1; p=quarantine; rua=mailto:a@b.no"])).note, /søppelposten/);
    assert.match(vurderDmarc(parseDmarc(["v=DMARC1; p=reject; rua=mailto:a@b.no"])).note, /avviser/);
  });

  test("pct under 100 betyr at resten slipper gjennom", () => {
    const f = parseDmarc(["v=DMARC1; p=reject; pct=20; rua=mailto:a@b.no"]);
    assert.equal(f.pct, 20);
    assert.match(f.feil[0]!, /bare 20 %/);
    assert.equal(vurderDmarc(f).status, "warn");
  });

  test("manglende rua flagges – uten den ser ingen resultatet", () => {
    const f = parseDmarc(["v=DMARC1; p=reject"]);
    assert.match(f.feil.join(" "), /rapportadresse/);
  });

  test("tåler mellomrom og store bokstaver i taggene", () => {
    const f = parseDmarc(["v=DMARC1;  P = Reject ; rua = mailto:a@b.no "]);
    assert.equal(f.p, "reject");
  });
});

/* -------------------------------------------------------------- DKIM ---- */
describe("vurderDkim", () => {
  test("uten selektor er ingenting slått opp, og det sies rett ut", () => {
    const r = vurderDkim({ selektor: null, finnes: false, post: null });
    assert.equal(r.status, "neutral");
    assert.match(r.note, /Oppgi selektoren/);
  });

  test("oppgitt selektor som ikke finnes er et brudd", () => {
    const r = vurderDkim({ selektor: "google", finnes: false, post: null });
    assert.equal(r.status, "fail");
    assert.match(r.value, /google/);
  });

  test("funnet nøkkel er bestått", () => {
    const r = vurderDkim({ selektor: "google", finnes: true, post: "v=DKIM1; k=rsa; p=MIGf..." });
    assert.equal(r.status, "ok");
  });
});

/* ---------------------------------------------------------- rapporten ---- */
describe("byggEpostRapport", () => {
  const lag = (spfTxt: string[], dmarcTxt: string[], dkimSelektor: string | null = null) =>
    byggEpostRapport({
      domene: "dinbedrift.no",
      dato: "6. okt. 2026",
      spf: parseSpf(spfTxt),
      dmarc: parseDmarc(dmarcTxt),
      dkim: { selektor: dkimSelektor, finnes: false, post: null },
    });

  test("radene kommer i rekkefølgen SPF, DKIM, DMARC", () => {
    assert.deepEqual(lag([], []).rader.map((r) => r.name), ["SPF", "DKIM", "DMARC"]);
  });

  test("alt mangler gir lav score, men ikke null – DKIM er bare ikke sjekket", () => {
    const r = lag([], []);
    assert.equal(r.totalt, 17, "0 + 0,5 + 0 av 3");
  });

  test("alt på plass gir full score", () => {
    const r = byggEpostRapport({
      domene: "x.no",
      dato: "6. okt. 2026",
      spf: parseSpf(["v=spf1 include:_spf.google.com -all"]),
      dmarc: parseDmarc(["v=DMARC1; p=reject; rua=mailto:a@b.no"]),
      dkim: { selektor: "google", finnes: true, post: "v=DKIM1; p=x" },
    });
    assert.equal(r.totalt, 100);
  });

  test("forbeholdet sier at vi ikke sender e-post", () => {
    assert.ok(lag([], []).forbehold.some((f) => /sender ingen e-post/.test(f)));
  });
});

/* ---------------------------------------------------------- domene ---- */
describe("normaliserDomene", () => {
  test("tar domenet ut av en URL", () => {
    assert.equal(normaliserDomene("https://www.dinbedrift.no/kontakt?a=1"), "www.dinbedrift.no");
  });
  test("tar domenet ut av en e-postadresse", () => {
    assert.equal(normaliserDomene("Ola@DinBedrift.no"), "dinbedrift.no");
  });
  test("tåler bart domene, portnummer og avsluttende punktum", () => {
    assert.equal(normaliserDomene("dinbedrift.no:443"), "dinbedrift.no");
    assert.equal(normaliserDomene("dinbedrift.no."), "dinbedrift.no");
  });
  test("avviser tomt og det som ikke er et domene", () => {
    assert.throws(() => normaliserDomene(""), /Skriv inn et domene/);
    assert.throws(() => normaliserDomene("ikke et domene"), /ser ikke ut som et domene/);
    assert.throws(() => normaliserDomene("localhost"), /ser ikke ut som et domene/);
  });
});
