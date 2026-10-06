/**
 * Opptak av VÅRE EGNE verktøy mens de kjører.
 *
 * Hvorfor dette finnes: en visuell gjennomgang fant at 19 av 21 medieelementer
 * på nettstedet viser det samme genererte objektet – en stabel aluminiumsplater.
 * Hvert bilde er godt for seg, men gjentatt 19 ganger slutter det å si noe.
 * Brandboken rangerer dessuten ekte skjermbilder over alt vi kan generere
 * («Vis, ikke påstå»), og det eneste materialet på siden som faktisk overbeviser
 * er opptaket av sjekken som kjører mot nkom.no.
 *
 * Hvorfor BILDESEKVENS og ikke Playwrights recordVideo:
 *  - klippene spoles av scroll, så brukeren stopper på enkeltrammer og leser dem
 *    som stillbilder. Da gjelder stillbildekrav, og recordVideo gir variabel
 *    bildefrekvens med ujevn tidsakse.
 *  - pekerposisjon og dragning settes PER RAMME, så opptaket blir determenistisk
 *    og kan kjøres om igjen med identisk resultat.
 *  - vi tar opp på dobbel pikseltetthet og skalerer ned, noe som gir skarpere
 *    tekst enn en direkte 1:1-innspilling.
 *
 * ÆRLIGHET: opptakene viser ekte kjøringer mot ekte adresser. Degraderer et
 * verktøy – «Skanneren er ikke satt opp ennå» – er det den teksten som skal stå.
 * Et iscenesatt resultat på en side som selger ærlighet er verre enn ingen video.
 *
 * Bruk:
 *   node scripts/opptak.mjs <id> [--base http://127.0.0.1:4493] [--behold]
 *   node scripts/opptak.mjs --liste
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAMMER_PER_SEK = 30;
const BREDDE = 1600;
const HOYDE = 900; // 16:9, så nedskalering til 1920x1080 er eksakt
const TETTHET = 2; // tar opp på 3200x1800 og skalerer ned – skarpere tekst
const UT = "public/opptak";
const TMP = ".skudd/opptak-tmp";
const TRINN = [1920, 1280, 960];

/** Jevn inn/ut, så pekeren ikke starter og stopper brått. */
const mykt = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Hvert opptak sier hva det viser, hvor det hører hjemme, og hvordan det kjøres.
 * `rammer` kalles én gang per ramme med (side, andel 0–1).
 */
/**
 * Felles opptaksløp for de to skanneverktøyene. De deler markup (UrlCheck-skjema
 * + #resultat), så de deler også opptaksløp.
 *
 * SUBJEKTVALG ER ET ÆRLIGHETSSPØRSMÅL. Slepesammenligningen på forsiden sier
 * «vi publiserer ikke navn på sider som kommer dårlig ut». nkom.no stryker på
 * uu-sjekken (3 brudd) og kan derfor ikke navngis i et opptak. digdir.no består
 * begge sjekkene – 0 brudd, 0 cookies før samtykke – så å navngi dem bryter
 * ingen regel. At det er Digitaliseringsdirektoratet, altså etaten bak selve
 * regelverket, er en bonus og ikke poenget.
 *
 * Ventetiden komprimeres: rammene tas sekvensielt, så et await inne i
 * ramme-funksjonen pauser opptaket i stedet for å fylle fila med spinner. Det
 * er ikke juks – rapporten viser selv «Skannet på X s», som er den ekte tiden.
 */
function skannOpptak({ url, domene, tekst, plass }) {
  return {
    url,
    // 6 s, ikke 10. Rapporten fra en side som BESTÅR er kort, så rulletrekket blir
    // nesten null og de siste sekundene står stille. Første forsøk brukte 10 s og
    // brukte 65 % av fila på et bilde som ikke endret seg – samme feil som
    // verktoy-klippet, der all endring skjer mellom 15 % og 45 %.
    sek: 6,
    tekst,
    plass,
    async klar(p) {
      await p.locator("[data-urlcheck]").scrollIntoViewIfNeeded();
      await p.waitForTimeout(600);
    },
    async ramme(p, a, st) {
      const felt = p.locator("[data-urlcheck] input[name='url']").first();

      if (a < 0.30) {
        const n = Math.min(domene.length, Math.ceil((a / 0.29) * domene.length));
        st.skrevet ??= 0;
        if (st.skrevet === 0) await felt.click({ timeout: 3000 }).catch(() => {});
        while (st.skrevet < n) {
          await felt.press(domene[st.skrevet], { timeout: 3000 }).catch(() => {});
          st.skrevet++;
        }
        return;
      }

      if (!st.sendt) {
        st.sendt = true;
        // Hele strengen MÅ stå før Enter. Et tidligere opptak slo opp «nkom.n»
        // fordi tidsaksen aldri rakk siste tegn, og rapporten viste «SPF: BRUDD»
        // under en bildetekst som påsto et ekte oppslag mot nkom.no.
        if ((await felt.inputValue().catch(() => "")) !== domene) await felt.fill(domene);
        const na = await felt.inputValue();
        if (na !== domene) throw new Error(`Feltet inneholder «${na}», ikke «${domene}». Opptaket avbrytes.`);
        await felt.press("Enter");
        return;
      }

      // La den ekte lastetilstanden stå noen rammer før svaret hentes.
      if (a < 0.42) return;

      if (!st.ventet) {
        st.ventet = true;
        const rapport = p.locator("#resultat .kk-report").first();
        await rapport.waitFor({ state: "visible", timeout: 90000 });
        st.boks = await p.evaluate(() => {
          const el = document.querySelector("#resultat");
          const r = el.getBoundingClientRect();
          return { topp: r.top + scrollY, hoyde: r.height, vh: innerHeight };
        });
      }

      // Rull sakte gjennom rapporten, så funnene faktisk er lesbare.
      const f = mykt(Math.min(1, (a - 0.42) / 0.58));
      const { topp, hoyde, vh } = st.boks;
      const reise = Math.max(0, hoyde - (vh - 220));
      await p.evaluate((y) => scrollTo(0, y), Math.round(topp - 120 + reise * f));
    },
  };
}

const OPPTAK = {
  /**
   * Lagstabelen: hva en nettside FAKTISK består av.
   *
   * Dette er det eneste materialet på nettstedet som svarer på spørsmålet en
   * kunde stiller først – «hva er det jeg kjøper?». Fire lag med navn og en
   * forklaring hver: Design (det kunden ser), Kode (det som gjør at det virker),
   * Sikkerhet (det ingen spør om før det er for sent), Integrasjoner (booking,
   * Vipps, regnskap). Ingen abstrakt render sier det; denne er bokstavelig.
   *
   * Den drives av komponentens EGEN spak – samme kontroll en tastaturbruker
   * bruker – så opptaket viser komponenten gjøre det den gjør.
   */
  lagstabel: {
    url: "/lab/interaksjon",
    sek: 6,
    // Tettere opptak: utsnittet er 926x520 CSS, som på tetthet 2 blir 1852 px –
    // under 1920 og dermed en oppskalering. 3 gir 2778 px og ekte nedskalering.
    tetthet: 3,
    // Utsnittet er regnet ut som unionen av platenes og etikettenes FAKTISKE
    // blekk gjennom hele draget (spak 0, 25, 50, 75, 100), pluss 28 px luft, og
    // deretter rettet opp til 16:9. Måles det bare i én stilling, vandrer motivet
    // ut av ramma: stabelen står 95 px høyere ved 0 enn ved 100.
    klipp: { x: 376, y: 252, width: 926, height: 520 },
    tekst: "Lagstabelen på vår egen side, dratt fra hverandre. De fire lagene er det en nettside faktisk består av – og alle fire er med i det vi leverer.",
    plass: "/om eller /nettsider – den svarer på «hva er det jeg kjøper?» før prisen nevnes",
    async klar(p) {
      await p.locator("[data-stabel]").first().scrollIntoViewIfNeeded();
      await p.waitForTimeout(800);
      // Start samlet, uansett hva som måtte ligge igjen av tilstand.
      await p.evaluate(() => {
        const s = document.querySelector("[data-stabel-spak]");
        s.value = "0";
        s.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await p.waitForTimeout(300);
    },
    /**
     * Skiller lagene med en myk utgang, ikke lineært.
     *
     * To krav står mot hverandre. Poenget må ligge rundt 50 % av tidslinjen,
     * fordi spoleformelen gjør flaten 100 % synlig ved 53 % og borte ved 100 %.
     * Samtidig må ingen kvartal stå stille – et frosset kvartal er nettopp det
     * kunden kaller statisk.
     *
     * a^0,72 løser begge: 61 % skilt ved halvveis, altså alle fire etikettene
     * oppe og lesbare, men fortsatt målbar endring i hvert eneste kvartal
     * (0,37 / 0,24 / 0,21 / 0,19). En kubisk utgang ville gitt 98 % ved 75 % og
     * et dødt siste kvartal.
     */
    async ramme(p, a) {
      const f = Math.pow(a, 0.72);
      await p.evaluate((v) => {
        const s = document.querySelector("[data-stabel-spak]");
        s.value = String(Math.round(v * 100));
        s.dispatchEvent(new Event("input", { bubbles: true }));
      }, f);
    },
  },

  /**
   * Slepesammenligningen: hva forskjellen FAKTISK er, i tall.
   *
   * Dette er det nærmeste vi kommer et før/etter. Begge kolonnene er ekte
   * målinger fra vårt eget verktøy samme dag: 50 av 100 mot 90 av 100, med
   * radene som skiller dem navngitt – sikkerhetsheadere 3/6 mot 6/6, én
   * uu-feil mot null, org.nr. mangler mot bekreftet.
   *
   * Utsnittet tar med bunnteksten med vilje. Der står vår egen regel: «Den
   * sjekkede siden er ikke navngitt – vi publiserer ikke navn på sider som
   * kommer dårlig ut.» Den hører med når vi viser fram at noen scorer 50.
   */
  sammenlign: {
    url: "/lab/interaksjon",
    sek: 6,
    // Overskrift, tabell, spak og bunntekst. Målt som flatens union over hele
    // draget pluss luft, rettet opp til 16:9. Innholdet er 3:1, så et 16:9-utsnitt
    // MÅ ta med noe over og under – da er overskrift og forbehold bedre enn marg.
    klipp: { x: 248, y: 86, width: 1104, height: 622 },
    tekst: "To ekte målinger fra vår egen sjekk, samme dag. Radene som skiller 50 fra 90 er navngitt – det er de fire tingene vi retter.",
    plass: "/sjekk eller /nettsider – den viser forskjellen i tall før prisen nevnes",
    async klar(p) {
      await p.locator("[data-slep]").first().scrollIntoViewIfNeeded();
      await p.waitForTimeout(800);
      await p.evaluate(() => {
        const s = document.querySelector("[data-slep-spak]");
        s.value = "88";
        s.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await p.waitForTimeout(300);
    },
    /**
     * Skillelinjen sveiper fra 88 % til 12 % – altså fra problemet til svaret.
     *
     * Retningen er ikke likegyldig. Første forsøk gikk motsatt vei og endte med
     * «En side vi sjekket, 50 av 100» i full bredde: klippet sluttet på problemet.
     * Nå åpner det der, og ender på kolonnen som viser hva siden faktisk får.
     *
     * Ikke helt ut i kantene: ved 0 og 100 er den ene kolonnen borte, og da er
     * det ingen sammenligning igjen. Kurven a^0,8 setter linjen på 44 % ved
     * halvveis – begge kolonner lesbare, som er poenget – og holder bevegelse i
     * hvert kvartal, så ingen del av klippet står stille.
     */
    async ramme(p, a) {
      const f = 0.88 - Math.pow(a, 0.8) * 0.76;
      await p.evaluate((v) => {
        const s = document.querySelector("[data-slep-spak]");
        s.value = String(Math.round(v * 100));
        s.dispatchEvent(new Event("input", { bubbles: true }));
      }, f);
    },
  },

  /**
   * Terminalen: siden kjører de samme sjekkene som verktøyene, mot ekte data.
   *
   * SUBJEKTET ER OSS SELV, og det er et valg. Den fulle sjekken gir digdir.no
   * 3/6 headere og 1 uu-feil – altså middels – og Slepesammenligning sier at vi
   * ikke publiserer navn på sider som kommer dårlig ut. Regelen gjelder ikke oss,
   * så vi måler oss selv med vårt eget verktøy. Resultatet er ekte, inkludert
   * forbeholdet «Ingen brudd, men 1 ikke sjekket».
   *
   * TO kommandoer, ikke én. Svaret kommer på under et sekund, så ett oppslag
   * ville latt resten av klippet stå stille – og et frosset kvartal er nettopp
   * det kunden kaller statisk.
   */
  terminal: {
    url: "/",
    sek: 8,
    tetthet: 3,
    // Modalen vokser nedover fra y=32: 138 px tom, 358 etter første svar, 490
    // etter andre. Utsnittet er fast og romslig nok til sluttilstanden – måles
    // det underveis, vandrer ramma mens innholdet vokser.
    klipp: { x: 329, y: 12, width: 942, height: 530 },
    tekst: "Terminalen på siden kjører de samme sjekkene som verktøyene. Her mot vårt eget domene, og tallene er det sjekken faktisk svarte – forbeholdet inkludert.",
    plass: "/terminal eller /sikkerhet – den viser at verktøyene er ekte, ikke skjermbilder",
    async klar(p) {
      await p.waitForTimeout(700);
      await p.keyboard.press("~");
      await p.waitForTimeout(600);
      const d = await p.locator(".kkterm").count();
      if (!d) throw new Error("Terminalen åpnet ikke. Opptaket avbrytes.");
    },
    /**
     * To kommandoer. Et await inne i ramme-funksjonen pauser opptaket mens det
     * ekte kallet går, i stedet for å fylle fila med ventetid.
     */
    async ramme(p, a, st) {
      const inn = p.locator(".kkterm input").first();
      const skriv = async (ord, til) => {
        const n = Math.min(ord.length, Math.ceil((a / til) * ord.length));
        st.n ??= 0;
        while (st.n < n) { await inn.press(ord[st.n], { timeout: 3000 }).catch(() => {}); st.n++; }
      };
      const send = async (ord) => {
        // Hele strengen MÅ stå før Enter. Et tidligere opptak slo opp «nkom.n»
        // fordi tidsaksen aldri rakk siste tegn, og rapporten viste «SPF: BRUDD»
        // under en bildetekst som påsto et ekte oppslag.
        if ((await inn.inputValue().catch(() => "")) !== ord) await inn.fill(ord);
        const na = await inn.inputValue();
        if (na !== ord) throw new Error(`Feltet inneholder «${na}», ikke «${ord}». Opptaket avbrytes.`);
        await inn.press("Enter");
      };

      const EN = "sjekk kodekonsulentene.no";
      // Den andre kommandoen er LANG med vilje. «pris» er fire tegn og kunne ikke
      // fylle midten av klippet, så mellom de to svarene sto bildet stille i halvannet
      // sekund – målt 0,001 i pikselendring. Tastingen er liten endring, men den er
      // endring, og den holder strekningen i live.
      const TO = "headere kodekonsulentene.no";

      if (a < 0.26) return skriv(EN, 0.25);
      if (!st.sendt1) {
        st.sendt1 = true;
        await send(EN);
        // Vent på det ekte svaret. Pausen havner ikke i fila.
        await p.waitForFunction(() => /Samlet:/.test(document.querySelector(".kkterm")?.textContent || ""), { timeout: 60000 }).catch(() => {});
        st.n2 = 0;
        return;
      }
      if (a < 0.72) {
        const n = Math.min(TO.length, Math.ceil(((a - 0.30) / 0.41) * TO.length));
        st.n2 ??= 0;
        while (st.n2 < n) { await inn.press(TO[st.n2], { timeout: 3000 }).catch(() => {}); st.n2++; }
        return;
      }
      if (!st.sendt2) {
        st.sendt2 = true;
        await send(TO);
        await p.waitForFunction(() => /strict-transport|x-frame|content-security|Referrer/i.test(document.querySelector(".kkterm")?.textContent || ""), { timeout: 60000 }).catch(() => {});
      }
    },
  },

  rontgen: {
    url: "/lab/rontgen",
    sek: 8,
    // Presist: headerne er ekte svar, WCAG-punktene er KRAVENE – ikke funn på
    // denne siden. Første formulering slo dem sammen og overdrev.
    tekst: "Røntgenlinsen på vår egen forside. Sikkerhetsheaderne som kommer fram er de serveren faktisk sender; WCAG-punktene er kravene siden måles mot.",
    plass: "/sikkerhet, som sidens bevis – og den er sidens signaturinteraksjon",
    // Klipp til selve flaten. Uten dette fyller linsen en firedel av bildet, og
    // resten er tom side – effekten drukner i marger.
    klipp: "[data-rontgen-flate]",
    /** Klargjør: scroll flaten til midten og vent til laget er malt. */
    async klar(p) {
      await p.locator("[data-rontgen-flate]").scrollIntoViewIfNeeded();
      await p.waitForTimeout(900);
    },
    /** Pekeren sveiper over flaten og skjærer hull i designet der den peker. */
    async ramme(p, a) {
      const b = await p.locator("[data-rontgen-flate]").boundingBox();
      if (!b) return;
      // Fram og tilbake, så klippet ender der det startet uten ping-pong i fila.
      const f = mykt(a < 0.5 ? a * 2 : (1 - a) * 2);
      await p.mouse.move(b.x + b.width * (0.12 + 0.76 * f), b.y + b.height * (0.34 + 0.3 * f));
    },
  },

  priskalkulator: {
    url: "/verktoy/priskalkulator",
    sek: 9,
    // IKKE klipp: #kalk er 1466 CSS px høyt, altså høyere enn vinduet, så et
    // klipp ga 1920x2932 – stående format i en liggende ramme, og 5,4 MB.
    // Vinduet rammer den i stedet, og 16:9 beholdes.
    // Siden sier selv «Et estimat er et spenn. Et tilbud er et tall». Første
    // bildetekst påsto det motsatte.
    tekst: "Priskalkulatoren regner mens du velger. Den gir et spenn med gulv, ikke et tilbud – postene er de samme vi bruker når vi regner.",
    plass: "/priser, over prislisten – den viser at prisen er en utregning, ikke et forhandlingsutspill",
    async klar(p) {
      // Legg summen og de første valgene i bildet samtidig – det er sammenhengen
      // mellom dem som er poenget.
      await p.locator("#kalk").scrollIntoViewIfNeeded();
      await p.evaluate(() => window.scrollBy(0, 120));
      await p.waitForTimeout(700);
    },
    /** Krysser av valgene ett og ett, så summen teller opp mellom hvert. */
    async ramme(p, a, st) {
      const bokser = await p.locator('#kalk input[type="checkbox"]').all();
      if (!bokser.length) return;
      // Fordel avkryssingene utover de første to tredelene av klippet.
      const antall = Math.min(bokser.length, Math.floor((a / 0.66) * bokser.length));
      st.gjort ??= 0;
      while (st.gjort < antall) {
        await bokser[st.gjort].check({ timeout: 4000 }).catch(() => {});
        st.gjort++;
        await p.waitForTimeout(60);
      }
    },
  },

  dmarc: {
    url: "/verktoy/dmarc",
    sek: 9,
    tekst: "DMARC-sjekken gjør ekte DNS-oppslag. Her mot nkom.no, og statusene er det DNS faktisk svarte.",
    plass: "/sikkerhet eller /verktoy/dmarc – den beviser at verktøyet gjør et reelt oppslag",
    async klar(p) {
      const felt = p.locator('input[type="text"], input[type="url"], input[type="search"]').first();
      await felt.scrollIntoViewIfNeeded();
      await p.waitForTimeout(500);
    },
    /**
     * Skriver domenet tegn for tegn, kjører, og ruller ned til svaret.
     *
     * Første versjon skrev `n = floor((a/0.45) * lengde)` og sendte ved a >= 0,45.
     * Siste tegn ble derfor ALDRI skrevet: oppslaget gikk mot «nkom.n», et domene
     * som ikke finnes, og rapporten viste «SPF: BRUDD, mangler». Bildeteksten ville
     * påstått et ekte oppslag mot nkom.no. Et iscenesatt resultat på en side som
     * selger ærlighet er verre enn ingen video – derfor skrives hele strengen
     * ferdig, og det verifiseres før Enter.
     */
    async ramme(p, a, st) {
      const felt = p.locator('input[type="text"], input[type="url"], input[type="search"]').first();
      const ord = "nkom.no";
      if (a < 0.34) {
        const n = Math.min(ord.length, Math.ceil((a / 0.33) * ord.length));
        st.skrevet ??= 0;
        while (st.skrevet < n) {
          await felt.press(ord[st.skrevet], { timeout: 3000 }).catch(() => {});
          st.skrevet++;
        }
      } else if (!st.sendt) {
        st.sendt = true;
        // Fyll resten direkte hvis tidsaksen ikke rakk alle tegn.
        const na = await felt.inputValue().catch(() => "");
        if (na !== ord) await felt.fill(ord).catch(() => {});
        await felt.press("Enter").catch(() => {});
      } else if (a > 0.5 && !st.rullet) {
        // Rapporten ligger under folden. Uten dette filmer vi tom plass.
        st.rullet = true;
        await p.locator(".kk-report, table").first().scrollIntoViewIfNeeded().catch(() => {});
      }
    },
  },

  "uu-sjekk": skannOpptak({
    url: "/verktoy/uu-sjekk",
    domene: "digdir.no",
    tekst: "Universell utforming kjørt mot digdir.no. Sjekken starter en ekte nettleser og kjører axe-core; antall brudd og regler er det axe faktisk rapporterte.",
    plass: "/verktoy/uu-sjekk – den beviser at sjekken starter en ekte nettleser",
  }),

  "cookie-sjekk": skannOpptak({
    url: "/verktoy/cookie-sjekk",
    domene: "digdir.no",
    tekst: "Cookie-sjekken laster forsiden med tom nettleserprofil og klikker ikke på noe. Alt som står i listen ble satt uten samtykke – her ingenting.",
    plass: "/verktoy/cookie-sjekk – den viser hva «før samtykke» faktisk betyr",
  }),
};

// ---- argumenter -------------------------------------------------------------
const args = process.argv.slice(2);
if (args.includes("--liste") || !args.length) {
  for (const [id, o] of Object.entries(OPPTAK)) console.log(`  ${id.padEnd(16)} ${o.url}  (${o.sek}s)`);
  process.exit(0);
}
const id = args[0];
const scene = OPPTAK[id];
if (!scene) {
  console.error(`Ukjent opptak «${id}». Kjør --liste for å se hvilke som finnes.`);
  process.exit(1);
}
const b = args.indexOf("--base");
const BASE = b > -1 ? args[b + 1] : "http://127.0.0.1:4493";
const behold = args.includes("--behold");

// ---- ta opp -----------------------------------------------------------------
const rammer = scene.sek * RAMMER_PER_SEK;
const tmp = join(TMP, id);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(UT, { recursive: true });

console.log(`Tar opp «${id}» – ${rammer} rammer à ${BREDDE * (scene.tetthet ?? TETTHET)}x${HOYDE * (scene.tetthet ?? TETTHET)}`);
const nettleser = await chromium.launch();
// Et lite utsnitt må tas opp tettere, ellers skaleres det OPP til 1920 og blir
// mykt. Lagstabelen er 926x520 CSS – på tetthet 2 blir det 1852 px bredt, altså
// under 1920. Scenen kan derfor overstyre tettheten.
const tetthet = scene.tetthet ?? TETTHET;
const ctx = await nettleser.newContext({
  viewport: { width: BREDDE, height: HOYDE },
  deviceScaleFactor: tetthet,
  colorScheme: "dark",
  // Opptaket skal vise bevegelsen i verktøyet, ikke sidens egen inntoning.
  reducedMotion: "reduce",
});
const p = await ctx.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(BASE + scene.url, { waitUntil: "networkidle", timeout: 45000 });
await scene.klar?.(p);

// Klippeflaten måles ÉN gang. Måles den per ramme, vandrer utsnittet med
// layouten og klippet rister. Partall på begge mål, ellers klager h264.
let klipp;
if (typeof scene.klipp === "object" && scene.klipp) {
  // Eksplisitt utsnitt. Brukes når motivet VANDRER gjennom klippet og en måling
  // i én stilling derfor ville bomme – lagstabelen står 95 px høyere samlet enn
  // adskilt, så et utsnitt målt ved start klipper toppen av den ved slutt.
  klipp = scene.klipp;
} else if (scene.klipp) {
  const b = await p.locator(scene.klipp).boundingBox();
  if (b) klipp = {
    x: Math.round(b.x), y: Math.round(b.y),
    width: Math.round(b.width / 2) * 2, height: Math.round(b.height / 2) * 2,
  };
}

const st = {};
for (let i = 0; i < rammer; i++) {
  await scene.ramme(p, i / (rammer - 1), st);
  await p.screenshot({ path: join(tmp, `r${String(i).padStart(4, "0")}.png`), animations: "allow", clip: klipp });
}
await ctx.close();
await nettleser.close();
if (feil.length) console.log(`  ADVARSEL – konsollfeil under opptak: ${feil.slice(0, 3).join(" | ")}`);

// ---- enkod ------------------------------------------------------------------
/**
 * CRF 19 og -g 8, som de andre scenene. Tette nøkkelbilder er det eneste som
 * gjør scroll-spoling jevn; uten dem står videoen stille mellom nøkkelbildene.
 * CRF under 19 kjøper ingenting – kilden her er allerede tapsfri PNG, men
 * lavere CRF gir bare større fil uten synlig gevinst på skjermtekst.
 */
const linjer = [];
for (const bredde of TRINN) {
  const fil = `${UT}/${id}-${bredde}.mp4`;
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y",
    "-framerate", String(RAMMER_PER_SEK),
    "-i", join(tmp, "r%04d.png"),
    "-vf", `scale=${bredde}:-2:flags=lanczos`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "19",
    "-g", "8", "-keyint_min", "8", "-sc_threshold", "0",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-an", fil,
  ]);
  const bits = JSON.parse(execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=bit_rate,duration", "-of", "json", fil,
  ]).toString()).format;
  linjer.push({
    fil,
    mb: +(statSync(fil).size / 1048576).toFixed(2),
    mbit: +(bits.bit_rate / 1e6).toFixed(2),
    sek: +(+bits.duration).toFixed(1),
  });
}

// Plakat fra en ramme midt i, der noe faktisk har skjedd – ikke første ramme.
const plakatRamme = join(tmp, `r${String(Math.floor(rammer * 0.62)).padStart(4, "0")}.png`);
const plakat = `${UT}/${id}-poster.avif`;
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", plakatRamme,
  "-vf", "scale=1280:-2:flags=lanczos", "-c:v", "libaom-av1", "-crf", "34", "-still-picture", "1", plakat]);

// Målte dimensjoner, aldri skrevet for hånd: en håndskrevet dimensjon på logoen
// ga CLS 0,145 i produksjon og brøt ytelsesløftet vi selger på.
const mal = JSON.parse(execFileSync("ffprobe", [
  "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", `${UT}/${id}-1920.mp4`,
]).toString()).streams[0];

const manifestSti = "src/data/opptak.json";
const manifest = existsSync(manifestSti) ? JSON.parse(readFileSync(manifestSti, "utf8")) : {};
manifest[id] = {
  smal: `/opptak/${id}-960.mp4`,
  bred: `/opptak/${id}-1280.mp4`,
  stor: `/opptak/${id}-1920.mp4`,
  plakat: `/opptak/${id}-poster.avif`,
  bredde: mal.width,
  hoyde: mal.height,
  tekst: scene.tekst,
  kilde: new Date().toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" }),
};
writeFileSync(manifestSti, JSON.stringify(manifest, null, 2) + "\n");

if (!behold) rmSync(tmp, { recursive: true, force: true });

console.log(`\n«${id}» ferdig – ${mal.width}x${mal.height}`);
for (const l of linjer) console.log(`  ${l.fil.padEnd(34)} ${String(l.mb).padStart(6)} MB  ${String(l.mbit).padStart(5)} Mbit/s  ${l.sek}s`);
console.log(`  ${plakat.padEnd(34)} ${(statSync(plakat).size / 1024).toFixed(1)} kB`);
console.log(`  foreslått plassering: ${scene.plass}`);