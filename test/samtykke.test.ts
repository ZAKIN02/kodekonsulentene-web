/**
 * Tester for samtykkedeteksjonen.
 *
 * Disse testene finnes fordi verktøyet tok feil. Fram til 7. oktober 2026 meldte
 * både `/sjekk` og cookie-sjekken brudd på ekomloven § 3-15 så snart et
 * sporingsdomene var kontaktet. De visste ikke forskjell på en side som setter
 * `_ga` på første besøk og en side som laster Google Tag Manager med
 * `analytics_storage: 'denied'` som standard og lagrer ingenting.
 *
 * Signalene i testene under er ikke oppdiktet. De er formene vi faktisk målte på
 * norske nettsteder 7. oktober 2026 – inkludert nettsteder som gjorde det riktig
 * og ville blitt anklaget. Navnene på nettstedene står ikke her; det er
 * signalformen som skal fanges, ikke hvem som hadde den.
 *
 * Det testene vokter mot er én spesifikk regresjon: at dommen kryper tilbake til
 * «fail» på et grunnlag som ikke er lagring i kommunikasjonsutstyret.
 *
 * Kjøres med `npm run test`.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  SAMTYKKELOSNINGER,
  COOKIE_KLASSER,
  SAMTYKKEKATEGORIER,
  OVRIGE_KATEGORIER,
  finnSamtykkelosninger,
  tolkConsentMode,
  klassifiserCookie,
  vurderSamtykke,
  sikkerhetFor,
  GLOBALER_SOM_LESES,
} from "../services/skanner/samtykke.mjs";
import { analyserCookies } from "../src/lib/sjekk.ts";

/* ------------------------------------------------------------- data ---- */

describe("datalistene holder sin egen standard", () => {
  test("hver samtykkeløsning har kilde og dato", () => {
    for (const l of SAMTYKKELOSNINGER) {
      assert.ok(l.id && l.navn, "id og navn mangler");
      assert.match(l.sjekket, /^\d{4}-\d{2}-\d{2}$/, `${l.id} mangler ISO-dato`);
      assert.ok(l.kilde && l.kilde.length > 10, `${l.id} mangler kilde`);
      assert.ok(
        l.domener.length + l.globaler.length + l.cookies.length > 0,
        `${l.id} har ingen signaler å kjenne igjen på`,
      );
    }
  });

  test("hver cookieklasse har kilde, dato og et ankret mønster", () => {
    for (const k of COOKIE_KLASSER) {
      assert.match(k.sjekket, /^\d{4}-\d{2}-\d{2}$/, `${k.id} mangler ISO-dato`);
      assert.ok(k.kilde && k.kilde.length > 10, `${k.id} mangler kilde`);
      assert.ok(k.hva && k.hva.length > 15, `${k.id} mangler forklaring til brukeren`);
      assert.ok(
        k.monster.source.startsWith("^") && k.monster.source.endsWith("$"),
        `${k.id}: mønsteret må være ankret, ellers treffer det for bredt`,
      );
      assert.ok(
        ["teknisk", "samtykkelager", "krever-samtykke"].includes(k.klasse),
        `${k.id} har ukjent klasse ${k.klasse}`,
      );
    }
  });

  test("ingen id går igjen to steder", () => {
    const l = SAMTYKKELOSNINGER.map((x) => x.id);
    assert.equal(new Set(l).size, l.length, "duplikat i SAMTYKKELOSNINGER");
    const k = COOKIE_KLASSER.map((x) => x.id);
    assert.equal(new Set(k).size, k.length, "duplikat i COOKIE_KLASSER");
  });

  test("de fire dømmende kategoriene og de tre øvrige overlapper ikke", () => {
    // Blandes de, kan et helt vanlig oppsett med functionality_storage på
    // «granted» bli nedgradert for noe som ikke er sporing.
    for (const k of SAMTYKKEKATEGORIER) {
      assert.ok(!OVRIGE_KATEGORIER.includes(k), `${k} står i begge lister`);
    }
    assert.deepEqual(SAMTYKKEKATEGORIER, ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"]);
  });

  test("globalene som leses dekker alle løsningenes egne navn", () => {
    // Legger noen til en løsning uten å oppdatere innsamlingen, blir halve
    // endringen usynlig i produksjon. Denne testen gjør den rød i stedet.
    for (const l of SAMTYKKELOSNINGER) {
      for (const g of l.globaler) {
        assert.ok(GLOBALER_SOM_LESES.includes(g), `window.${g} (${l.id}) leses ikke av skanneren`);
      }
    }
  });
});

/* ------------------------------------------- gjenkjenning av løsninger ---- */

describe("finnSamtykkelosninger", () => {
  test("kjenner igjen en løsning på window-globalen", () => {
    const f = finnSamtykkelosninger({ globaler: ["Cookiebot", "gtag"] });
    assert.deepEqual(f.map((x) => x.id), ["cookiebot"]);
    assert.ok(f[0]!.bevis.includes("window.Cookiebot"));
  });

  test("kjenner igjen en løsning på skriptverten", () => {
    const f = finnSamtykkelosninger({ verter: ["policy.app.cookieinformation.com", "www.example.no"] });
    assert.deepEqual(f.map((x) => x.id), ["cookie-information"]);
  });

  test("treffer på ekte underdomene, ikke på delstreng", () => {
    assert.equal(finnSamtykkelosninger({ verter: ["cdn.cookiebot.com"] }).length, 1);
    assert.equal(
      finnSamtykkelosninger({ verter: ["cookiebot.com.svindel.no"] }).length,
      0,
      "å navngi en leverandør som ikke er der er like galt som en feil dom",
    );
    assert.equal(finnSamtykkelosninger({ verter: ["ikke-cookiebot.com"] }).length, 0);
  });

  test("CookieConsent alene navngir ingen leverandør", () => {
    // Cookiebot, Cookie Information og vanilla-cookieconsent bruker alle samme
    // globale navn. Vi så selv et nettsted med window.CookieConsent bli meldt som
    // «Cookiebot» i et tidlig utkast. Feil navn på leverandøren er ikke bedre
    // enn ingen navn.
    const f = finnSamtykkelosninger({ globaler: ["CookieConsent"] });
    assert.equal(f.length, 1);
    assert.equal(f[0]!.id, "ukjent-losning");
    assert.match(f[0]!.navn, /ikke identifisert/i);
  });

  test("CookieConsent sammen med Cookiebot-verten navngir Cookiebot", () => {
    const f = finnSamtykkelosninger({
      globaler: ["CookieConsent", "Cookiebot"],
      verter: ["consent.cookiebot.com"],
    });
    assert.deepEqual(f.map((x) => x.id), ["cookiebot"]);
    assert.equal(f.some((x) => x.id === "ukjent-losning"), false);
  });

  test("euconsent-v2 navngir ingen leverandør", () => {
    // Navnet tilhører TCF-rammeverket, ikke en enkelt CMP.
    assert.deepEqual(finnSamtykkelosninger({ cookienavn: ["euconsent-v2"] }), []);
  });

  test("ingen signaler gir ingen treff", () => {
    assert.deepEqual(finnSamtykkelosninger({}), []);
    assert.deepEqual(finnSamtykkelosninger({ html: "<p>Vi bruker cookies og ber om samtykke.</p>" }), []);
  });
});

/* --------------------------------------------------- Consent Mode ---- */

describe("tolkConsentMode", () => {
  test("alle fire kategorier «denied» gir standardNektet true", () => {
    // Formen er avlest fra window.google_tag_data.ics på norske nettsteder.
    const c = tolkConsentMode({
      ics: {
        usedDefault: true,
        entries: {
          ad_storage: { default: false },
          analytics_storage: { default: false },
          ad_user_data: { default: false },
          ad_personalization: { default: false },
          security_storage: { default: true },
        },
      },
    });
    assert.equal(c.tilstede, true);
    assert.equal(c.standardSatt, true);
    assert.equal(c.standardNektet, true);
    assert.deepEqual(c.tillattSomKreverSamtykke, []);
    assert.deepEqual(c.tillattOvrige, ["security_storage"]);
  });

  test("analytics_storage «granted» gir standardNektet false", () => {
    const c = tolkConsentMode({
      ics: {
        usedDefault: true,
        entries: { ad_storage: { default: false }, analytics_storage: { default: true } },
      },
    });
    assert.equal(c.standardNektet, false);
    assert.deepEqual(c.tillattSomKreverSamtykke, ["analytics_storage"]);
  });

  test("functionality_storage «granted» senker ikke dommen", () => {
    // Dette oppsettet er helt vanlig og er ikke sporing. Tok vi det med, ville
    // et korrekt Consent Mode-oppsett blitt nedgradert.
    const c = tolkConsentMode({
      ics: {
        usedDefault: true,
        entries: {
          ad_storage: { default: false },
          analytics_storage: { default: false },
          ad_user_data: { default: false },
          ad_personalization: { default: false },
          functionality_storage: { default: true },
          personalization_storage: { default: true },
        },
      },
    });
    assert.equal(c.standardNektet, true);
    assert.deepEqual(c.tillattOvrige, ["functionality_storage", "personalization_storage"]);
  });

  test("tomme entries og usedDefault false gir «vet ikke», ikke «denied»", () => {
    // Fire av nettstedene vi målte hadde nøyaktig denne formen: Consent
    // Mode-skallet var lastet, men ingen standardverdi satt. Å lese det som
    // «denied» ville vært å dele ut en grønn hake på ingenting.
    const c = tolkConsentMode({
      ics: { usedDefault: false, entries: { ad_storage: {}, analytics_storage: {} } },
    });
    assert.equal(c.tilstede, true);
    assert.equal(c.standardSatt, false);
    assert.equal(c.standardNektet, null);
  });

  test("ingen ics og ingen tekst gir ingenting", () => {
    const c = tolkConsentMode({});
    assert.equal(c.tilstede, false);
    assert.equal(c.standardNektet, null);
  });

  test("dataLayer-kallet leses når ics mangler", () => {
    const c = tolkConsentMode({
      consentKall: [
        JSON.stringify(["consent", "default", {
          ad_storage: "denied", analytics_storage: "denied",
          ad_user_data: "denied", ad_personalization: "denied", security_storage: "granted",
        }]),
      ],
    });
    assert.equal(c.standardSatt, true);
    assert.equal(c.standardNektet, true);
  });
});

/* --------------------------------------------------- klassifisering ---- */

describe("klassifiserCookie", () => {
  test("kjente sporingscookies klassifiseres som sporing", () => {
    for (const navn of ["_ga", "_ga_ABC123", "_gid", "_gcl_au", "_fbp", "_clck", "_hjSession_123", "__hstc", "_uetsid"]) {
      assert.equal(klassifiserCookie(navn).klasse, "krever-samtykke", navn);
    }
  });

  test("tekniske cookies klassifiseres som tekniske", () => {
    for (const navn of ["PHPSESSID", "JSESSIONID", "ASP.NET_SessionId", "__cf_bm", "cf_clearance", "ARRAffinity", "AWSALB", "XSRF-TOKEN", "woocommerce_cart_hash", "_GRECAPTCHA"]) {
      assert.equal(klassifiserCookie(navn).klasse, "teknisk", navn);
    }
  });

  test("samtykkeløsningens egen cookie er ikke et brudd", () => {
    // Den finnes bare fordi siden spør om samtykke. Å telle den som brudd er
    // selvmotsigende.
    for (const navn of ["CookieConsent", "OptanonConsent", "cookieyes-consent", "cc_cookie", "cmplz_consent_status"]) {
      assert.equal(klassifiserCookie(navn).klasse, "samtykkelager", navn);
    }
  });

  test("mønstrene er ankret, så de ikke treffer for bredt", () => {
    // Dette er den farligste feilklassen i hele filen: treffer mønsteret for
    // bredt, melder vi noen for sporing de ikke driver med.
    for (const navn of ["_gan", "min__ga", "_ga_", "x_fbp", "PHPSESSIDX", "notARRAffinity", "_clcks"]) {
      assert.equal(klassifiserCookie(navn).klasse, "ukjent", `${navn} skal ikke treffe noe mønster`);
    }
  });

  test("ukjent er et gyldig svar", () => {
    const u = klassifiserCookie("kk-apning");
    assert.equal(u.klasse, "ukjent");
    assert.equal(u.id, null);
    assert.equal(u.sikkerhet, null);
  });

  test("tom inndata kaster ikke", () => {
    for (const x of ["", "   ", null, undefined, 42]) {
      // @ts-expect-error – med vilje: skanneren får navnene fra en fremmed side.
      assert.equal(klassifiserCookie(x).klasse, "ukjent");
    }
  });

  test("sikkerheten følger kilden, og bare en URL gir «dokumentert»", () => {
    assert.equal(sikkerhetFor("https://business.safety.google/adscookies/"), "dokumentert");
    assert.equal(sikkerhetFor("Egen måling 2026-10-07."), "antatt");
    assert.equal(sikkerhetFor(undefined), "antatt");
    for (const k of COOKIE_KLASSER) {
      assert.equal(sikkerhetFor(k.kilde), /^https?:\/\//.test(k.kilde) ? "dokumentert" : "antatt", k.id);
    }
  });

  test("minst én sporingsklasse er leverandørdokumentert", () => {
    // Uten dette er porten inn til «fail» stengt for godt, og da er graderingen
    // bare to grader med et nytt navn.
    const dokumentert = COOKIE_KLASSER.filter(
      (k) => k.klasse === "krever-samtykke" && sikkerhetFor(k.kilde) === "dokumentert",
    );
    assert.ok(dokumentert.length >= 5, `bare ${dokumentert.length} dokumenterte sporingsklasser`);
  });
});

/* ---------------------------------------------------------- dommen ---- */

describe("vurderSamtykke", () => {
  const tomt = { cookienavn: [], lagringsnokler: [], sporereLastet: [], samtykkelosninger: [] };

  test("ingenting satt og ingen sporing gir ok", () => {
    const d = vurderSamtykke(tomt);
    assert.equal(d.dom, "ok");
    assert.ok(d.uavklart.length > 0, "forbeholdene skal stå selv når alt er rent");
  });

  test("DEN VIKTIGSTE: GTM lastet, Consent Mode «denied», null cookies gir ok", () => {
    // Dette er oppsettet den gamle logikken dømte som lovbrudd. Formen er målt
    // på flere norske nettsteder 7. oktober 2026, og minst ett av dem gjør
    // nøyaktig dette riktig.
    const d = vurderSamtykke({
      ...tomt,
      sporereLastet: ["Google Tag Manager"],
      consentMode: tolkConsentMode({
        ics: {
          usedDefault: true,
          entries: {
            ad_storage: { default: false }, analytics_storage: { default: false },
            ad_user_data: { default: false }, ad_personalization: { default: false },
          },
        },
      }),
    });
    assert.equal(d.dom, "ok");
    assert.ok(!/bryter/i.test(d.oppsummering));
  });

  test("dokumentert sporingscookie uten samtykkeløsning gir fail", () => {
    const d = vurderSamtykke({ ...tomt, cookienavn: ["_ga", "_gid"] });
    assert.equal(d.dom, "fail");
    assert.deepEqual(d.cookies.kreverSamtykke, ["_ga", "_gid"]);
    // Bare _ga er leverandoerdokumentert. _gid var det en gang, men Google
    // fjernet Universal Analytics-dokumentasjonen 1. juli 2024, og da falt
    // sikkerheten til «antatt». Én dokumentert cookie er nok til dom.
    assert.deepEqual(d.cookies.dokumentertSporing, ["_ga"]);
    // Selv her sier vi ikke at noe bryter loven. Vi sier hva vi målte.
    assert.ok(!/bryter|ulovlig/i.test(d.oppsummering), d.oppsummering);
  });

  test("bare antatt sporing uten samtykkeløsning gir warn, ikke fail", () => {
    // `nmstat` og `ai_user` er klassifisert på navnet alene, uten at
    // leverandøren selv beskriver formålet. Det er for tynt til en dom.
    const d = vurderSamtykke({ ...tomt, cookienavn: ["nmstat"] });
    assert.equal(d.dom, "warn");
    assert.ok(d.uavklart.some((u) => /vår egen lesning av navnet/i.test(u)), d.uavklart.join(" | "));
  });

  test("sporingscookie TROSS samtykkeløsning gir warn, ikke fail", () => {
    // Målt på norske nettsteder: en CMP er på plass, men analysecookies settes
    // likevel før svar. Det er et ekte funn – men hvem som slipper dem gjennom
    // kan ikke maskinen avgjøre, så det blir «et menneske må se på det».
    const d = vurderSamtykke({
      ...tomt,
      cookienavn: ["_ga", "OptanonConsent"],
      samtykkelosninger: [{ id: "onetrust", navn: "OneTrust", bevis: ["window.OneTrust"] }],
      consentMode: tolkConsentMode({
        ics: { usedDefault: true, entries: { ad_storage: { default: false }, analytics_storage: { default: true } } },
      }),
    });
    assert.equal(d.dom, "warn");
    assert.deepEqual(d.cookies.samtykkelager, ["OptanonConsent"]);
    assert.match(d.oppsummering, /OneTrust/);
  });

  test("Consent Mode med analytics «granted» gir warn selv uten cookies", () => {
    const d = vurderSamtykke({
      ...tomt,
      sporereLastet: ["Google Analytics"],
      consentMode: tolkConsentMode({
        ics: { usedDefault: true, entries: { ad_storage: { default: false }, analytics_storage: { default: true } } },
      }),
    });
    assert.equal(d.dom, "warn");
    assert.match(d.oppsummering, /granted/);
  });

  test("sporing lastet, ingen samtykkespor, ingenting lagret gir «vet ikke»", () => {
    const d = vurderSamtykke({ ...tomt, sporereLastet: ["Meta Pixel"] });
    assert.equal(d.dom, "neutral", "verken bevis for brudd eller bevis for orden");
    assert.match(d.oppsummering, /kan vi ikke avgjøre maskinelt/i);
  });

  test("TCF-grensesnitt alene teller som samtykkespor", () => {
    const d = vurderSamtykke({ ...tomt, sporereLastet: ["Google Ads"], tcf: true });
    assert.equal(d.dom, "ok");
  });

  test("bare tekniske cookies gir warn med navn, aldri brudd", () => {
    const d = vurderSamtykke({ ...tomt, cookienavn: ["PHPSESSID", "__cf_bm"] });
    assert.equal(d.dom, "warn");
    assert.deepEqual(d.cookies.tekniske, ["PHPSESSID", "__cf_bm"]);
    assert.match(d.oppsummering, /unntaket i § 3-15 er laget for/);
  });

  test("ukjente cookies gir warn og sier at de er ukjente", () => {
    const d = vurderSamtykke({ ...tomt, cookienavn: ["noe_rart"] });
    assert.equal(d.dom, "warn");
    assert.deepEqual(d.cookies.ukjente, ["noe_rart"]);
  });

  test("uten JavaScript står forbeholdet om det i rapporten", () => {
    const d = vurderSamtykke({ ...tomt, kjortJavaScript: false });
    assert.ok(d.uavklart.some((u) => /JavaScript er ikke kjørt/i.test(u)));
  });

  test("forbeholdet om juridisk vurdering står alltid", () => {
    for (const funn of [
      tomt,
      { ...tomt, cookienavn: ["_ga"] },
      { ...tomt, sporereLastet: ["Hotjar"] },
      { ...tomt, cookienavn: ["PHPSESSID"] },
    ]) {
      const d = vurderSamtykke(funn);
      assert.ok(
        d.uavklart.some((u) => /strengt nødvendig.*juridisk vurdering/is.test(u)),
        `mangler i ${d.dom}`,
      );
    }
  });

  test("ingen dom påstår lovbrudd, uansett inndata", () => {
    // Regresjonsvakten. Teksten «Det bryter ekomloven § 3-15» sto i rapporten
    // fram til 7. oktober 2026 og skal aldri komme tilbake.
    const tilfeller = [
      tomt,
      { ...tomt, cookienavn: ["_ga", "_fbp", "_clck", "IDE"] },
      { ...tomt, cookienavn: ["_ga"], sporereLastet: ["Google Analytics", "Meta Pixel"] },
      { ...tomt, sporereLastet: ["Google Tag Manager"] },
      { ...tomt, cookienavn: ["nmstat"] },
      { ...tomt, cookienavn: ["PHPSESSID"], lagringsnokler: ["_hjSession_1"] },
    ];
    for (const funn of tilfeller) {
      const d = vurderSamtykke(funn);
      for (const linje of [d.oppsummering, ...d.grunnlag, ...d.uavklart]) {
        assert.ok(!/\bbryter\b|\bulovlig\b|\blovbrudd\b/i.test(linje), `påstand om lovbrudd: ${linje}`);
      }
    }
  });

  test("fail krever lagring, aldri bare et lastet skript", () => {
    // Hele poenget med fiksen, som én invariant: uten en dokumentert
    // sporingscookie i lagringen finnes det ingen vei til «fail».
    const utenLagring = [
      { ...tomt, sporereLastet: ["Google Analytics", "Google Ads", "Meta Pixel", "Hotjar"] },
      { ...tomt, sporereLastet: ["Google Analytics"], cookienavn: ["PHPSESSID", "__cf_bm", "CookieConsent"] },
      { ...tomt, sporereLastet: ["Google Analytics"], lagringsnokler: ["noe", "annet"] },
    ];
    for (const funn of utenLagring) {
      assert.notEqual(vurderSamtykke(funn).dom, "fail", JSON.stringify(funn));
    }
  });

  test("lagringsnøkler klassifiseres som cookies", () => {
    const d = vurderSamtykke({ ...tomt, lagringsnokler: ["_hjSession_123"] });
    assert.deepEqual(d.cookies.kreverSamtykke, ["_hjSession_123"]);
    assert.equal(d.dom, "fail", "localStorage er også lagring i kommunikasjonsutstyret");
  });
});

/* ------------------------------------- de to implementasjonene i synk ---- */

describe("HTML-veien og nettleserveien spriker ikke", () => {
  /**
   * `src/lib/sjekk.ts` har en forkortet kopi av listene, fordi Astro-appen ikke
   * kan importere fra `services/` – mappa står i `.dockerignore`, og skanneren
   * er en egen Fly-app med egen byggekontekst. Samme situasjon som `ssrf.mjs`.
   *
   * Her kjøres begge mot de samme navnene, slik at et avvik gir rød test i
   * stedet for to verktøy som sier forskjellige ting om samme side.
   */
  test("samtykkevertene i HTML-veien finnes også i skannerens liste", () => {
    const skannerDomener = new Set(SAMTYKKELOSNINGER.flatMap((l) => l.domener));
    // Verter HTML-veien kjenner igjen, lest ut ved å gi den markup med verten i.
    const kandidater = [
      "cookieinformation.com", "cookiebot.com", "cookielaw.org", "onetrust.com",
      "cookieyes.com", "usercentrics.eu", "kiprotect.com", "iubenda.com", "termly.io",
      "sp-prod.net", "privacy-mgmt.com", "cookiefirst.com", "cookiehub.net",
      "osano.com", "didomi.io", "axept.io", "cookie-script.com",
      "consentmanager.net", "tarteaucitron.io", "cookiepro.com", "monsido-consent.com",
    ];
    for (const vert of kandidater) {
      const r = analyserCookies(new Headers(), `<script src="https://${vert}/x.js"></script><script src="https://www.googletagmanager.com/gtag/js"></script>`);
      assert.equal(r.samtykkelosninger.length, 1, `HTML-veien kjenner ikke ${vert}`);
      assert.ok(skannerDomener.has(vert), `${vert} mangler i SAMTYKKELOSNINGER i skanneren`);
    }
  });

  test("de to veiene er enige om hva som er teknisk og hva som er sporing", () => {
    const tabell: Array<[string, "teknisk" | "krever-samtykke"]> = [
      ["PHPSESSID", "teknisk"],
      ["JSESSIONID", "teknisk"],
      ["ASP.NET_SessionId", "teknisk"],
      ["__cf_bm", "teknisk"],
      ["ARRAffinity", "teknisk"],
      ["AWSALB", "teknisk"],
      ["XSRF-TOKEN", "teknisk"],
      ["_GRECAPTCHA", "teknisk"],
      ["woocommerce_cart_hash", "teknisk"],
      ["EPiStateMarker", "teknisk"],
    ];
    for (const [navn, forventet] of tabell) {
      assert.equal(klassifiserCookie(navn).klasse, forventet, `skanneren: ${navn}`);
      const r = analyserCookies(new Headers({ "set-cookie": `${navn}=1; Path=/` }), "<html></html>");
      if (forventet === "teknisk") {
        assert.deepEqual(r.tekniske, [navn], `HTML-veien: ${navn} skulle vært teknisk`);
      }
    }
  });

  test("HTML-veien kan aldri gi fail", () => {
    // Målt 7. oktober 2026: av 38 norske nettsteder sendte 15 minst én
    // Set-Cookie på første svar, og INGEN av dem sendte en cookie vi kan
    // dokumentere som sporing. Alt var lastbalansering, økt eller et
    // førstepartsnavn vi ikke kjente igjen. HTML-veien har derfor aldri
    // grunnlaget for en dom, og skal ikke kunne bygge opp et.
    const tilfeller: Array<[Record<string, string>, string]> = [
      [{}, "<html></html>"],
      [{ "set-cookie": "_ga=GA1.1.1; Path=/" }, `<script src="https://www.googletagmanager.com/gtag/js"></script>`],
      [{ "set-cookie": "_fbp=fb.1.1; Path=/" }, `<script src="https://connect.facebook.net/en_US/fbevents.js"></script>`],
      [{ "set-cookie": "PHPSESSID=x; Path=/" }, `<script src="https://static.hotjar.com/c/hotjar-1.js"></script>`],
    ];
    for (const [headere, html] of tilfeller) {
      const r = analyserCookies(new Headers(headere), html);
      assert.notEqual(r.status, "fail", html.slice(0, 60));
    }
  });
});
