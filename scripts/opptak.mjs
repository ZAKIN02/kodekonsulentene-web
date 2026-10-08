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
 *   node scripts/opptak.mjs <id> --mobil      smalt opptak, se MOBIL under
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

/**
 * ─── SMALT OPPTAK ─────────────────────────────────────────────────────────────
 *
 * ET OPPTAK PÅ 0,18x ER IKKE ET BEVIS, OG DET ER REGNET UT.
 *
 * Opptakene over er 1600 CSS px brede. Måler man `.demo__ramme` på en 390 px
 * telefon er den 342 px på sju av de åtte sidene og 314,6 px på /om, som er den
 * smaleste. Forholdet er altså 314,6 / 1600 = 0,197. Grensesnittekst på 16 px i
 * opptaket blir 3,1 px på skjermen, og 12 px blir 2,4. Det er ikke lite tekst –
 * det er ingen tekst. Flere hele skjermer besto av et klipp der det eneste man
 * kunne se var at det var grått og at det rørte seg.
 *
 * DET KAN IKKE RETTES MED CSS, og det er også regnet ut: for at 16 px kildetekst
 * skal nå 12 px på skjermen må klippet vises på 1600 × 12/16 = 1200 px bredde.
 * Rammen er 314,6. Ingen zoom og ingen beskjæring flytter på det – tallet er et
 * forhold mellom to bredder, og den ene er telefonen.
 *
 * REGNESTYKKET SOM STYRER ALT HER:
 *
 *     effektiv px  =  kildetekst px  ×  visningsbredde / klippets CSS-bredde
 *
 * Kravet er minst 12 effektive px på en 390 px skjerm. Den bindende
 * visningsbredden er 314,6 px (/om). Da er taket på klippet:
 *
 *     klipp ≤ kildetekst × 314,6 / 12  →  for 12 px tekst: klipp ≤ 314,6 CSS px
 *
 * Vi legger oss under det med vilje og tar opp i sidens SMALESTE oppsett: et
 * vindu på 320 px, der innholdsspalten er nøyaktig 272 px (målt på alle åtte
 * sidene: x = 24, bredde = 272). Klippet er den spalten. Da er forstørrelsen
 *
 *     314,6 / 272 = 1,157×      og 12 px kildetekst blir 13,9 effektive px
 *                               (14 px → 16,2 · 16 px → 18,5 · 32 px → 37,0)
 *
 * På de sju sidene med 342 px ramme er den 1,257× og 12 px blir 15,1.
 * ÆRLIG FORBEHOLD: på en 320 px telefon er rammen 250,2 px på /om, altså 0,92×,
 * og da faller 12 px kildetekst til 11,0. Derfor er HOVEDMOTIVET i hvert smalt
 * opptak satt til tekst på 14 px eller mer – det gir 12,9 px selv der.
 *
 * TETTHET OG TRINN. 272 CSS px på en 390 px telefon med tre ganger pikseltetthet
 * er 944 enheter. Opptaket gjøres på tetthet 4 (1088 px) og enkodes til 1088 og
 * 816. 1088 er altså en ekte NEDskalering på de tetteste skjermene, mens 816 er
 * nok på to ganger tetthet (629 enheter). Demo velger etter devicePixelRatio.
 *
 * ÉN DETALJ, IKKE HELE SKJERMEN. Et opptak som viser ett tall tydelig slår et
 * som viser alt uskarpt. Hver scene under har derfor et `mobil`-oppsett som
 * rammer ÉN ting – summen, ett funn, én rad – og en koreografi som lander der
 * og blir stående, i stedet for å reise gjennom hele grensesnittet.
 */
const MOBIL = {
  vindu: { width: 320, height: 760 },
  tetthet: 4,
  /**
   * ETT TRINN, IKKE TRE, OG DET ER ET VEKTVALG.
   *
   * 816 px er 272 × 3. Kilden er 1088 (tetthet 4), så 816 er en ekte
   * NEDskalering – samme grep som gjør teksten skarp i de brede opptakene.
   *
   * Et 1088-trinn ble målt og forkastet: 338 kB mot 264 for 816 på lagstabel,
   * altså over dagens 960-fil på 296 kB. Det ville kjøpt en skarpere film på
   * telefoner med tre ganger pikseltetthet (944 enheter mot 816, altså 1,16x
   * oppskalering i dag) – men budsjettet sier at det smale opptaket skal være
   * LETTERE enn dagens, og 1,16x på tekst som allerede er forstørret 1,16x er
   * den billigste innrømmelsen i hele kjeden. Til sammenligning er dagens
   * forhold 0,197x.
   */
  trinn: [816],
  /** Sidens innholdsspalte på 320 px. Målt, ikke antatt, på alle åtte sidene. */
  spalte: { x: 24, width: 272 },
};

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
/**
 * Et smalt klipp er ALLTID innholdsspalten og en målt høyde, og flaten holdes i
 * ro ved at scrollposisjonen settes på nytt hver ramme fra elementets EGEN
 * posisjon. Grunnen står i `skjema`-scenen: en flate som vokser mens den
 * filmes, skyver motivet ut av et fast utsnitt. Her vokser flere av dem – et
 * svar kommer, en rad legges til – så låsingen er ikke en forsiktighet, den er
 * nødvendig.
 */
const spalte = (topp, hoyde) => ({ x: MOBIL.spalte.x, y: topp, width: MOBIL.spalte.width, height: hoyde });

/**
 * Toppstripen er 78 px høy og `position: sticky`. Et klipp som starter over det
 * filmer logoen og menyknappen i stedet for verktøyet – målt, og det var det
 * første smale opptaket full av. Alt som rammes inn her starter under 78.
 */
const TOPPSTRIPE = 78;

/** Adressefeltet på DMARC-sida. Står ett sted, så begge opptakene bruker det. */
const FELT = 'input[type="text"], input[type="url"], input[type="search"]';

/**
 * Hvor høyt i vinduet skrivefeltet står mens domenet tastes.
 *
 * 150 var feil, og feilen var hvit: før oppslaget er siden kort, og et utsnitt
 * som rekker til 440 px havnet NEDENFOR dokumentet. Playwright maler ingenting
 * der, så de nederste 140 pikslene av klippet var et hvitt felt. 300 setter
 * feltet lavere i ramma, slik at utsnittet fylles av teksten OVER det – som
 * finnes – i stedet for av ingenting under.
 */
const SKRIV_TOPP = 300;

/** Som `laas`, men finner elementet på teksten sin. Rader i en rapport har
 *  ingen egen klasse, og en indeks ville knekt den dagen en rad kom til. */
const laasTekst = (p, sel, tekst, topp) =>
  p.evaluate(([s, t, y]) => {
    const el = [...document.querySelectorAll(s)].find((e) => e.textContent.trim().startsWith(t));
    if (!el) return false;
    scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY - y));
    return true;
  }, [sel, tekst, topp]);

/** Setter scrollen slik at `sel` står med toppen sin på `topp` i vinduet. */
const laas = (p, sel, topp = 40) =>
  p.evaluate(([s, t]) => {
    const el = document.querySelector(s);
    if (!el) return;
    scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY - t));
  }, [sel, topp]);

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
   * Flytdiagrammet som tegner seg selv: hva vi faktisk kobler sammen.
   *
   * Dette er det eneste opptaket der motivet BÅDE er ekte og bokstavelig. Nodene
   * heter Kunde, Booking, Vipps, Fiken og SMS – ikke abstrakte former. Brandboken
   * rangerer «diagram med ekte navn» som nivå 2 og «opptak av verktøyet i drift»
   * som nivå 1; dette er begge deler samtidig, fordi diagrammet ER en komponent
   * på siden som tegner seg mens du scroller.
   *
   * ÉN GEST: scroll. Ingen peker, ingen klikk, ingenting som konkurrerer.
   *
   * REDUSERT BEVEGELSE MÅ AV HER. Opptakskonteksten setter ellers
   * `reducedMotion: reduce` globalt – riktig for de andre scenene, der sidens
   * egen inntoning bare er støy. Men Flyt slår da av tegningen og står ferdig
   * (`animation: none !important`), så opptaket ville vist et stillbilde.
   * Her er tegningen selve motivet.
   *
   * IKKE KLIPPET, med vilje. Figuren vandrer 829 px opp gjennom visningsvinduet
   * mens den tegnes – målt: rammen står på topp 900 når første strek begynner og
   * på topp 71 når den siste er ferdig. Et fast utsnitt kan ikke romme den, og et
   * utsnitt per ramme ville ristet. Hele vinduet er dessuten det brukeren faktisk
   * ser, og overskriften over figuren hører med i historien.
   */
  flyt: {
    url: "/systemer",
    sek: 7,
    bevegelse: "no-preference",
    // Smalere vindu, fordi figuren ikke kan klippes: den er 1056 px bred uansett
    // vindu, så i 1600 fyller den 66 % av bredden og drukner i teksten rundt.
    // I 1200 fyller den 88 %. Tetthet 3 gir 3600 px og dermed ekte nedskalering.
    vindu: { width: 1200, height: 675 },
    tetthet: 3,
    tekst: "Flytdiagrammet på /systemer tegner seg selv mens du scroller. Nodene er systemene vi faktisk kobler sammen, og figuren koster null kilobyte JavaScript.",
    plass: "/nettsider eller /om – den forklarer hva «systemer som snakker sammen» betyr, uten metafor",
    async klar(p) {
      // Start like før figuren kommer inn i synsranden, så første ramme er tom
      // og tegningen begynner i bildet i stedet for å være halvveis unnagjort.
      const g = await p.evaluate(() => {
        const r = document.querySelector(".flyt__ramme").getBoundingClientRect();
        return { topp: Math.round(r.top + scrollY), vh: innerHeight };
      });
      await p.evaluate((y) => scrollTo(0, y), g.topp - g.vh + 20);
      await p.waitForTimeout(600);
    },
    /**
     * Ett jevnt scroll gjennom tegnevinduet.
     *
     * Grensene er målt, ikke gjettet: ved y=620 står alle fem boksene på
     * `stroke-dashoffset: 1` (utegnet), ved y=1460 på 0 (ferdige). Myk inn og ut,
     * så scrollen ikke starter og stopper brått – det er det som skiller en rolig
     * avdekking fra et rykk.
     */
    async ramme(p, a, st) {
      if (!st.vindu) {
        st.vindu = await p.evaluate(() => {
          const r = document.querySelector(".flyt__ramme").getBoundingClientRect();
          const topp = r.top + scrollY;
          return { fra: Math.round(topp - innerHeight + 20), til: Math.round(topp - 60) };
        });
      }
      const { fra, til } = st.vindu;
      await p.evaluate((y) => scrollTo(0, y), Math.round(fra + (til - fra) * mykt(a)));
    },

    /**
     * INTET SMALT OPPTAK, OG DET ER ET MÅLT VALG – IKKE EN GLEMSEL.
     *
     * Figuren bryter om til en loddrett liste under 640 px og er allerede
     * lesbar der: 272 × 612 på 320 px, nodenavn på 18 px og forklaringer på 13.
     * Et smalt opptak hadde altså ikke mye å rette opp.
     *
     * Forsøket ble gjort og forkastet. Tegningen drives av
     * `animation-timeline: view()`, så den eneste måten å filme den på er å
     * SCROLLE. På 1600 × 900 er området målt (y 620 til 1460), men på 320 × 760
     * er figuren 612 px høy i et 760 px vindu, og et utsnitt på 430 px rakk
     * ikke over den: fire av seks sekunder viste avsnittet og overskriften OVER
     * figuren, og først mot slutten kom nodene inn. Det som trengs er en målt
     * scrollstrekning for 320 px-oppsettet, på samme måte som den brede har.
     *
     * Til det er målt, får telefonen stillbildet og fullskjermknappen. Et
     * opptak som viser brødteksten over figuren er ikke et dårlig opptak av
     * verktøyet – det er et opptak av noe annet.
     */
  },

  /**
   * Kontaktskjemaet som sier fra før du sender: `:has()` og `:user-invalid`.
   *
   * Dette beviser en håndverkspåstand vi ellers bare kan hevde – at skjemaet
   * validerer uten en eneste linje JavaScript. Kanten slår om til rød med ✕ når
   * e-posten er ufullstendig, og til grønn med ✓ når den er hel. Ingenting av det
   * er skript; det er `:has(.control:user-invalid)` i `site.css`.
   *
   * TRE SLAG, ikke flere: navnet fylles ut, e-posten er halvferdig og blir rød,
   * e-posten fullføres og blir grønn. En peker som farer mellom felt ville vært
   * travel – derfor TAB, som dessuten er måten en tastaturbruker fyller ut et
   * skjema på.
   *
   * `:user-invalid` og ikke `:invalid` er med vilje i CSS-en, og det styrer
   * opptaket: tilstanden slår først inn når feltet forlates. Derfor må hvert slag
   * ende med et tabulatortrykk – uten det skjer ingenting synlig.
   */
  skjema: {
    url: "/kontakt",
    // 6 s, ikke 7. Med 7 landet den groenne tilstanden paa 90 % av tidslinjen og
    // de siste 0,7 sekundene stod helt stille – 3 av 27 intervaller frosset.
    // En kort hvile paa sluttilstanden er riktig, saa oeyet rekker aa lese ✓,
    // men den skal vaere kort.
    sek: 6,
    tetthet: 3,
    // Feltene er 462x494 og står på y=150 uansett vindusbredde – målt på tre.
    // Et 16:9-utsnitt rundt dem blir 906x510, og det får bare plass i 1600.
    // Utsnittet er fast: ingenting scroller i denne scenen, så flaten vandrer ikke.
    klipp: { x: 618, y: 130, width: 906, height: 510 },
    tekst: "Kontaktskjemaet sier fra før du sender. Den røde kanten og ✕ kommer fra CSS alene – :has() og :user-invalid – uten en linje JavaScript.",
    plass: "/kontakt, over skjemaet – eller /nettsider, som bevis på at vi bygger skjemaer som virker uten skript",
    async klar(p) {
      // Løft skjemaet opp i bildet. Måles utsnittet der det ligger ved innlasting,
      // havner nederste felt utenfor visningsvinduet.
      await p.evaluate(() => {
        const f = document.querySelector("form .field");
        const y = f.getBoundingClientRect().top + scrollY - 150;
        scrollTo(0, y);
        window.__laas = y; // samme posisjon hver ramme, se under
      });
      await p.waitForTimeout(700);
    },
    /**
     * Tre slag: navnet fylles ut, e-posten er ugyldig og blir rød, e-posten
     * rettes og blir grønn.
     *
     * BLUR, IKKE TAB. Første forsøk tabbet mellom feltene, og nettleseren rullet
     * da neste felt inn i synsranden – skjemaet vandret ut av det faste utsnittet,
     * og de tre siste sekundene viste bunnteksten. `blur()` utløser
     * `:user-invalid` like godt uten å flytte siden. Scrollposisjonen låses i
     * tillegg hver ramme, så ingenting kan skyve flaten.
     *
     * «kari» og ikke «kari@eksempel» som ugyldig verdi. Første forsøk brukte det
     * siste, og feltet ble GRØNT: `input[type=email]` godtar `bruker@vert` uten
     * toppdomene, så strengen var gyldig. Rødtilstanden – halve poenget – dukket
     * aldri opp. Uten krøllalfa er den utvetydig ugyldig.
     */
    async ramme(p, a, st) {
      const navn = p.locator('input[name="navn"]');
      const epost = p.locator('input[name="epost"]');
      await p.evaluate(() => scrollTo(0, window.__laas));

      // 1. Navnet, tegn for tegn, og ut av feltet så ✓ kommer fram.
      if (a < 0.24) {
        const ord = "Kari Nordmann";
        const n = Math.min(ord.length, Math.ceil((a / 0.22) * ord.length));
        st.n ??= 0;
        if (st.n === 0) await navn.click({ timeout: 3000 }).catch(() => {});
        while (st.n < n) { await navn.press(ord[st.n], { timeout: 3000 }).catch(() => {}); st.n++; }
        return;
      }

      // 2. Ugyldig e-post, og ut av feltet – da slår :user-invalid inn.
      if (a < 0.46) {
        if (!st.ut1) {
          st.ut1 = true;
          await p.evaluate(() => document.activeElement?.blur());
          await epost.click({ timeout: 3000 }).catch(() => {});
        }
        const ord = "kari";
        const n = Math.min(ord.length, Math.ceil(((a - 0.24) / 0.18) * ord.length));
        st.m ??= 0;
        while (st.m < n) { await epost.press(ord[st.m], { timeout: 3000 }).catch(() => {}); st.m++; }
        return;
      }
      if (!st.rod) {
        st.rod = true;
        await p.evaluate(() => document.activeElement?.blur());
        return;
      }

      // La den røde tilstanden stå. Den er halve poenget, og et øye trenger tid.
      if (a < 0.62) return;

      // 3. Rett e-posten og gå ut igjen: ✕ blir ✓.
      if (!st.fikset) {
        st.fikset = true;
        await epost.click({ timeout: 3000 }).catch(() => {});
        await epost.press("End").catch(() => {});
      }
      const rest = "@eksempel.no";
      const n = Math.min(rest.length, Math.ceil(((a - 0.62) / 0.26) * rest.length));
      st.r ??= 0;
      while (st.r < n) { await epost.press(rest[st.r], { timeout: 3000 }).catch(() => {}); st.r++; }
      if (st.r >= rest.length && !st.gronn) {
        st.gronn = true;
        await p.evaluate(() => document.activeElement?.blur());
      }
    },
  },

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

    /**
     * SMALT: hele scenen ER detaljen, og det er den eneste scenen her som kan
     * si det.
     *
     * På 320 px er `.stabel__scene` 272 × 204 – nøyaktig innholdsspalten. Det
     * brede opptaket må klippe 926 × 520 ut av et 1600 px vindu; her er det
     * ingenting å klippe bort. Etikettene står på 15 px, som med 1,157× blir
     * 17,4 effektive px.
     *
     * At de i det hele tatt er lesbare her er nytt: `.stabel__merke` var
     * 116 px bred med 151 px innhold, og «04 Integrasjoner» lå 35 px utenfor
     * sin egen boks. Det er rettet i Lagstabel.astro i samme omgang, og dette
     * opptaket er grunnen til at feilen ikke kunne bli stående: et smalt opptak
     * av en ødelagt smal flate ville vært et bevis på feilen.
     */
    mobil: {
      // 5 s og ikke 6: på 6 landet fila på 304 kB, altså 3 kB OVER dagens
      // 960-fil på 296. Draget er ett jevnt sveip og taper ingenting på et
      // sekund mindre – og budsjettet er ikke til forhandling.
      sek: 5,
      tekst: "Lagstabelen dratt fra hverandre på telefon. De fire lagene er det en nettside faktisk består av, og alle fire er med i det vi leverer.",
      async klar(p) {
        await laas(p, ".stabel__scene", 150);
        await p.waitForTimeout(700);
        await p.evaluate(() => {
          const s = document.querySelector("[data-stabel-spak]");
          s.value = "0";
          s.dispatchEvent(new Event("input", { bubbles: true }));
        });
        await p.waitForTimeout(300);
      },
      /**
       * Utsnittet er unionen av blekket gjennom HELE draget, ikke scenens boks.
       * Scenen er 272 × 204, men etikettene og platene vandrer ut av den mens
       * lagene skilles. Målt med scenens topp på 150, i fem stillinger
       * (spak 0 / 25 / 50 / 75 / 100):
       *
       *     blekkets topp   172 → 149 → 126 → 101 →  75     (45 px OVER scenen)
       *     blekkets bunn   300 → 307 → 337 → 366 → 396     (72 px UNDER)
       *
       * Et utsnitt på scenens egne 204 px kuttet «04 Integrasjoner» i to – det
       * sto i det første opptaket.
       *
       * Men hele unionen – 100 til 432 – var heller ikke riktig: de 50 pikslene
       * over scenen er BRØDTEKSTEN på siden, og den kom med i ramma som en
       * halv setning («video. Kontrollene under figuren sier hvordan du tar i
       * dem.»). Et opptak skal vise verktøyet, ikke avsnittet over det.
       *
       * Derfor måles ETIKETTENE for seg, og det er de som er motivet:
       *
       * Scenen er 272 × 272 på 320 px (se kvadratregelen i Lagstabel.astro).
       * Med scenens topp låst på 150 står etikettene slik, i fem stillinger:
       *
       *     etikettenes topp   223 → 221 → 197 → 173 → 149   (relativt scenen)
       *     etikettenes bunn   290 → 317 → 345 → 373 → 401
       *
       * altså fra 179 til 431 i vinduet. 170 til 442 rommer alle fem med ni px
       * luft i hver ende. Platene stikker lenger og blir beskåret – det er
       * riktig: dette er et nærbilde av en stabel, ikke et portrett av den.
       * 170 er under toppstripens 78.
       */
      klipp: () => spalte(170, 272),
      async ramme(p, a) {
        await laas(p, ".stabel__scene", 150);
        const f = Math.pow(a, 0.72);
        await p.evaluate((v) => {
          const s = document.querySelector("[data-stabel-spak]");
          s.value = String(Math.round(v * 100));
          s.dispatchEvent(new Event("input", { bubbles: true }));
        }, f);
      },
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

    /**
     * SMALT: samme sveip, men ramma slutter ved radene – og det er forskjellen.
     *
     * Det brede opptaket tar med overskriften over og forbeholdet under, fordi
     * et 16:9-utsnitt rundt et 3:1-innhold MÅ ta med noe. Her er ramma
     * stående, så den kan legges nøyaktig rundt det som bærer argumentet:
     * tallet «50/100» på 32 px, og de fire radene som skiller det fra 90.
     *
     * Målt på 320 px med kortet låst på 110: tallet står på 127 og er 42 px
     * høyt, radene begynner på 181 og er 45 px hver, kortet slutter på 397.
     * 108 til 400 rommer alt fire radene og tallet.
     *
     * FORBEHOLDET ER IKKE MISTET, det er flyttet: bildeteksten under opptaket
     * sier at den sjekkede siden ikke er navngitt. Den regelen kan ikke falle
     * ut av ramma uten å falle ut av teksten også.
     */
    mobil: {
      sek: 6,
      tekst: "To ekte målinger fra vår egen sjekk, samme dag. Den sjekkede siden er ikke navngitt – vi publiserer ikke navn på sider som kommer dårlig ut.",
      async klar(p) {
        await laas(p, "[data-slep]", 110);
        await p.waitForTimeout(700);
        await p.evaluate(() => {
          const s = document.querySelector("[data-slep-spak]");
          s.value = "88";
          s.dispatchEvent(new Event("input", { bubbles: true }));
        });
        await p.waitForTimeout(300);
      },
      klipp: () => spalte(108, 292),
      async ramme(p, a) {
        await laas(p, "[data-slep]", 110);
        const f = 0.88 - Math.pow(a, 0.8) * 0.76;
        await p.evaluate((v) => {
          const s = document.querySelector("[data-slep-spak]");
          s.value = String(Math.round(v * 100));
          s.dispatchEvent(new Event("input", { bubbles: true }));
        }, f);
      },
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

    /**
     * SMALT: ÉN kommando, ikke to.
     *
     * Det brede opptaket kjører to fordi svaret kommer på under et sekund, og
     * ett oppslag ville latt resten av klippet stå stille. Her er regnestykket
     * et annet: modalen er 288 px bred på 320 px skjerm og vokser fra 182 til
     * 434 px når svaret kommer – målt. Et svar nummer to ville dyttet det
     * første ut av ramma, og da hadde vi filmet en rulling i stedet for et
     * resultat.
     *
     * Tastingen fyller derfor 55 % av tidslinjen og svaret står de siste 45 %.
     * ÆRLIG: de 2,2 sekundene er et stillbilde. Det er riktig her – svaret er
     * seks linjer med tall som skal LESES, og 2,2 sekunder er knapt nok. Det
     * brede opptaket har et annet problem og derfor et annet svar.
     *
     * Subjektet er oss selv, av samme grunn som i det brede: regelen om å ikke
     * navngi sider som kommer dårlig ut gjelder ikke oss.
     */
    mobil: {
      sek: 5,
      tekst: "Terminalen på siden, kjørt mot vårt eget domene fra en telefon. Tallene er det sjekken faktisk svarte, forbeholdet inkludert.",
      async klar(p) {
        await p.waitForTimeout(700);
        await p.keyboard.press("~");
        await p.waitForTimeout(600);
        if (!(await p.locator(".kkterm").count())) throw new Error("Terminalen åpnet ikke. Opptaket avbrytes.");
      },
      // Modalen er fast plassert i vinduet og ruller ikke, så utsnittet er
      // målt én gang på sluttilstanden: x 16, y 32, 288 x 434.
      klipp: () => ({ x: 16, y: 32, width: 288, height: 434 }),
      async ramme(p, a, st) {
        const inn = p.locator(".kkterm input").first();
        const ORD = "sjekk kodekonsulentene.no";
        if (a < 0.55) {
          const n = Math.min(ORD.length, Math.ceil((a / 0.52) * ORD.length));
          st.n ??= 0;
          while (st.n < n) { await inn.press(ORD[st.n], { timeout: 3000 }).catch(() => {}); st.n++; }
          return;
        }
        if (st.sendt) return;
        st.sendt = true;
        // Hele strengen MÅ stå før Enter, og det verifiseres. Et tidligere
        // opptak slo opp «nkom.n» og viste et resultat for et domene som ikke
        // finnes, under en bildetekst som påsto et ekte oppslag.
        if ((await inn.inputValue().catch(() => "")) !== ORD) await inn.fill(ORD);
        const na = await inn.inputValue();
        if (na !== ORD) throw new Error(`Feltet inneholder «${na}», ikke «${ORD}». Opptaket avbrytes.`);
        await inn.press("Enter");
        await p.waitForFunction(() => /Samlet:/.test(document.querySelector(".kkterm")?.textContent || ""), { timeout: 60000 }).catch(() => {});
      },
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

    /**
     * SMALT: bare summen, og bare tre valg.
     *
     * Det brede opptaket krysser av alle boksene og filmer hele kalkulatoren.
     * På en telefon er det ingenting – 1466 px grensesnitt i en 314 px ramme.
     * Her er motivet ETT tall: `.mono-stat` på 32 px, som med 1,157× blir 37
     * effektive px. Det er det største tallet på noen av disse flatene, og det
     * er med vilje: er det ett opptak der telefonbrukeren skal kunne lese tallet
     * uten å zoome, er det prisen.
     *
     * Linjen under summen er med i ramma og gjør jobben bildeteksten ellers
     * måtte gjort: den NAVNGIR valget som endret tallet («Du vil endre
     * innholdet selv, og da trenger du et CMS»). Uten den ville et tall som
     * skifter av seg selv vært en påstand.
     *
     * TRE VALG, IKKE ÅTTE. Åtte avkryssinger på seks sekunder er 0,75 s per
     * tall – under lesetiden for et firesifret beløp. Tre gir halvannet sekund
     * på hvert, og da rekker øyet å se at det ER et nytt tall.
     */
    mobil: {
      sek: 7,
      tekst: "Priskalkulatoren regner mens du velger, tatt opp i telefonformat. Tallet er summen verktøyet faktisk kom til – et spenn med gulv, ikke et tilbud.",
      async klar(p) {
        // Gjør ett valg FØR opptaket, så ramma rundt svaret er den endelige.
        // Svarkortet vokser med én linje første gang det får et valg, og den
        // veksten skal ikke skje inne i et fast utsnitt.
        const bokser = await p.locator('#kalk input[type="checkbox"]').all();
        await bokser[0]?.check({ timeout: 4000 }).catch(() => {});
        await p.waitForTimeout(400);
        await laas(p, "#svar", 110);
        await p.waitForTimeout(400);
      },
      /**
       * Kortet begynner på 110 – under toppstripens 78. Høyden er målt på
       * SLUTTILSTANDEN, ikke på starten, fordi kortet vokser mens det filmes:
       *
       *     ett valg    sum «29 900 kr»           én linje,  begrunnelsen slutter 307
       *     fire valg   sum «126 500 kr–193 000»  to linjer, begrunnelsen slutter 369
       *
       * 236 px var målt på starten og kuttet begrunnelsen midt i en setning da
       * beløpet ble et spenn. 270 rommer sluttilstanden. De første rammene har
       * litt tom kortflate nederst, og det er riktig vei å ta feil: en ramme som
       * fylles er bedre enn en som renner over.
       */
      klipp: () => spalte(110, 270),
      async ramme(p, a, st) {
        await laas(p, "#svar", 110);
        const bokser = await p.locator('#kalk input[type="checkbox"]').all();
        if (!bokser.length) return;
        // Tre avkryssinger, jevnt fordelt over de første tre fjerdedelene.
        const mal = [0.18, 0.42, 0.66];
        st.gjort ??= 1; // den første er gjort i klar()
        for (let i = 0; i < mal.length; i++) {
          if (a >= mal[i] && st.gjort === i + 1 && bokser[st.gjort]) {
            await bokser[st.gjort].check({ timeout: 4000 }).catch(() => {});
            st.gjort++;
            await p.waitForTimeout(80);
          }
        }
      },
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

    /**
     * SMALT: ÉN rad, og raden er om OSS.
     *
     * SUBJEKTET ER BYTTET, OG DET ER ET ÆRLIGHETSVALG. Det brede opptaket slår
     * opp nkom.no. Regelen på forsiden sier at vi ikke publiserer navn på sider
     * som kommer dårlig ut, og en DMARC-rad er en dom: «BØR FIKSES» med
     * begrunnelse. Et bredt opptak kan gjemme den dommen i en tabell man knapt
     * leser; et smalt opptak forstørrer nettopp den ene raden til 1,16x og gjør
     * den til hele bildet. Da kan subjektet ikke være noen andre enn oss.
     *
     * Og svaret om oss selv er ikke pent, og det skal det ikke være:
     * Brønnøysund-domenet vårt svarer SPF BESTÅTT, DKIM IKKE SJEKKET,
     * DMARC BØR FIKSES med `p=none`. Det er DMARC-raden som rammes inn. En side
     * som selger ærlighet kan vise fram et verktøy som finner noe hos den som
     * laget det – det er sterkere enn et grønt hak.
     *
     * KOREOGRAFI: domenet skrives i feltet (så leseren ser HVA som slås opp),
     * Enter, det ekte oppslaget går – ventetiden havner ikke i fila fordi
     * rammene tas sekvensielt – og så låses DMARC-raden i vinduet og blir
     * stående. Raden finnes på teksten sin, ikke på en indeks: en rad til i
     * rapporten skal ikke kunne gjøre opptaket til en løgn i stillhet.
     */
    mobil: {
      sek: 7,
      tekst: "DMARC-sjekken gjør et ekte DNS-oppslag, her mot vårt eget domene. «Bør fikses» er det oppslaget faktisk svarte – vi står med p=none selv.",
      async klar(p) {
        await laas(p, FELT, SKRIV_TOPP);
        await p.waitForTimeout(600);
      },
      klipp: () => spalte(110, 330),
      async ramme(p, a, st) {
        const felt = p.locator(FELT).first();
        const ORD = "kodekonsulentene.no";

        if (a < 0.30) {
          await laas(p, FELT, SKRIV_TOPP);
          const n = Math.min(ORD.length, Math.ceil((a / 0.28) * ORD.length));
          st.skrevet ??= 0;
          if (st.skrevet === 0) await felt.click({ timeout: 3000 }).catch(() => {});
          while (st.skrevet < n) { await felt.press(ORD[st.skrevet], { timeout: 3000 }).catch(() => {}); st.skrevet++; }
          return;
        }

        if (!st.sendt) {
          st.sendt = true;
          await laas(p, FELT, SKRIV_TOPP);
          // Hele strengen MÅ stå før Enter, og det verifiseres. Et tidligere
          // opptak slo opp «nkom.n» og viste «SPF: BRUDD» for et domene som
          // ikke finnes, under en bildetekst som påsto et ekte oppslag.
          if ((await felt.inputValue().catch(() => "")) !== ORD) await felt.fill(ORD);
          const na = await felt.inputValue();
          if (na !== ORD) throw new Error(`Feltet inneholder «${na}», ikke «${ORD}». Opptaket avbrytes.`);
          await felt.press("Enter");
          return;
        }

        // La den ekte lastetilstanden stå noen rammer.
        if (a < 0.40) { await laas(p, FELT, SKRIV_TOPP); return; }

        if (!st.ventet) {
          st.ventet = true;
          await p.locator("#resultat .kk-report").first().waitFor({ state: "visible", timeout: 90000 });
        }
        // DMARC-raden, og bare den, resten av klippet.
        const traff = await laasTekst(p, "#resultat table tr", "DMARC", 120);
        if (!traff && !st.klaget) {
          st.klaget = true;
          throw new Error("Fant ingen DMARC-rad i rapporten. Opptaket avbrytes heller enn å filme feil rad.");
        }
      },
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
  for (const [id, o] of Object.entries(OPPTAK))
    console.log(`  ${id.padEnd(16)} ${o.url.padEnd(26)} ${o.sek}s${o.mobil ? `   --mobil ${o.mobil.sek}s` : "   (intet smalt opptak)"}`);
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
/**
 * `--mobil` kjører scenens smale oppsett i stedet for det brede. Alt annet er
 * likt: samme side, samme verktøy, samme ekte kall. Det er bare ramma og
 * koreografien som er en annen, og begge er regnet ut i MOBIL over.
 */
const mobil = args.includes("--mobil");
const m = scene.mobil;
if (mobil && !m) {
  console.error(`«${id}» har ikke noe smalt oppsett. Scenene med \`mobil\` i OPPTAK er de som har det.`);
  process.exit(1);
}
const merke = mobil ? "-mobil" : "";

// ---- ta opp -----------------------------------------------------------------
const rammer = (mobil ? m.sek : scene.sek) * RAMMER_PER_SEK;
const tmp = join(TMP, id + merke);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(UT, { recursive: true });

console.log(`Tar opp «${id}» – ${rammer} rammer`);
const nettleser = await chromium.launch();
// Et lite utsnitt må tas opp tettere, ellers skaleres det OPP til 1920 og blir
// mykt. Lagstabelen er 926x520 CSS – på tetthet 2 blir det 1852 px bredt, altså
// under 1920. Scenen kan derfor overstyre tettheten.
const tetthet = mobil ? MOBIL.tetthet : (scene.tetthet ?? TETTHET);
/**
 * Visningsvinduet kan overstyres per scene.
 *
 * Et motiv som ikke kan klippes – fordi det VANDRER gjennom bildet mens det
 * animeres – må i stedet rammes av et smalere vindu. Flytdiagrammet er 1056 px
 * bredt uansett vindu, så i 1600 fyller det 66 % av bredden og drukner i
 * omkringliggende tekst; i 1200 fyller det 88 %. Målt på fem bredder.
 */
const vindu = mobil ? (m.vindu ?? MOBIL.vindu) : (scene.vindu ?? { width: BREDDE, height: HOYDE });
const ctx = await nettleser.newContext({
  viewport: vindu,
  deviceScaleFactor: tetthet,
  colorScheme: "dark",
  /**
   * Opptaket skal vise bevegelsen i VERKTØYET, ikke sidens egen inntoning – derfor
   * dempes sidebevegelse som standard.
   *
   * Én scene må overstyre det. Flytdiagrammet tegner seg med
   * `animation-timeline: view()`, og under redusert bevegelse står det ferdig
   * (`animation: none !important`). Da ville opptaket vist et stillbilde av den
   * eneste figuren vi har der tegningen SELV er motivet.
   */
  reducedMotion: (mobil ? m.bevegelse : undefined) ?? scene.bevegelse ?? "reduce",
  // Ekte berøringskontekst på det smale opptaket. En telefon får `hover: none`
  // og `pointer: coarse`, og flere flater her har egne regler bak dem –
  // tas opptaket i en pekerkontekst filmer vi et oppsett ingen telefon ser.
  ...(mobil ? { isMobile: true, hasTouch: true, deviceScaleFactor: tetthet } : {}),
});
const p = await ctx.newPage();
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto(BASE + (m?.url ?? scene.url), { waitUntil: "networkidle", timeout: 45000 });
await (mobil ? m.klar ?? scene.klar : scene.klar)?.(p);

// Klippeflaten måles ÉN gang. Måles den per ramme, vandrer utsnittet med
// layouten og klippet rister. Partall på begge mål, ellers klager h264.
let klipp;
const klippKilde = mobil ? m.klipp : scene.klipp;
if (typeof klippKilde === "function") {
  // Et smalt klipp settes ofte av en MÅLING på siden – «spalten, fra toppen av
  // kortet, 368 px ned» – i stedet for av et tall skrevet for hånd. Målingen
  // gjøres ÉN gang, etter `klar`, av samme grunn som over: måles den per ramme,
  // vandrer utsnittet med layouten og klippet rister.
  klipp = await klippKilde(p);
} else if (typeof klippKilde === "object" && klippKilde) {
  // Eksplisitt utsnitt. Brukes når motivet VANDRER gjennom klippet og en måling
  // i én stilling derfor ville bomme – lagstabelen står 95 px høyere samlet enn
  // adskilt, så et utsnitt målt ved start klipper toppen av den ved slutt.
  klipp = klippKilde;
} else if (klippKilde) {
  const b = await p.locator(klippKilde).boundingBox();
  if (b) klipp = {
    x: Math.round(b.x), y: Math.round(b.y),
    width: Math.round(b.width / 2) * 2, height: Math.round(b.height / 2) * 2,
  };
}

const st = {};
const ramme = mobil ? m.ramme : scene.ramme;
for (let i = 0; i < rammer; i++) {
  await ramme(p, i / (rammer - 1), st);
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
 *
 * SMALT OPPTAK ENKODES ANNERLEDES, OG DET ER MÅLT.
 *
 * `-g 8` tvinger et nøkkelbilde hvert åttende bilde. Det er riktig for et klipp
 * som SPOLES av scrollhjulet – uten tette nøkkelbilder står bildet stille
 * mellom dem. Men et smalt opptak spoles ikke: det går i løkke. Da er de tette
 * nøkkelbildene ren vekt uten en eneste leser som får noe igjen for dem.
 *
 * Målt på lagstabel, 180 rammer, 816 px bredde:
 *
 *     CRF 19, -g 8             870 kB      ← 2,9 ganger dagens 960-fil
 *     CRF 19, standard GOP     408 kB
 *     CRF 21, -g 8             708 kB
 *     CRF 21, standard GOP     264 kB      ← 11 % LETTERE enn dagens 296 kB
 *
 * Altså: nøkkelbildene kostet 444 kB, CRF-trinnet 144. Standard GOP er derfor
 * ikke en kvalitetsinnrømmelse, det er å slutte å betale for noe vi ikke bruker.
 * CRF 21 og ikke 19 fordi det smale klippet FORSTØRRES 1,16x på skjermen, og da
 * forstørres artefaktene også – men 21 er fortsatt visuelt tapsfritt på
 * skjermtekst, og forskjellen til 19 er 144 kB på hver eneste telefon.
 */
const linjer = [];
for (const bredde of (mobil ? MOBIL.trinn : TRINN)) {
  const fil = `${UT}/${id}${merke}-${bredde}.mp4`;
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y",
    "-framerate", String(RAMMER_PER_SEK),
    "-i", join(tmp, "r%04d.png"),
    "-vf", `scale=${bredde}:-2:flags=lanczos`,
    "-c:v", "libx264", "-preset", "slow", "-crf", mobil ? "21" : "19",
    ...(mobil ? [] : ["-g", "8", "-keyint_min", "8", "-sc_threshold", "0"]),
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
const plakat = `${UT}/${id}${merke}-poster.avif`;
/**
 * DEN SMALE PLAKATEN ER MINDRE OG HARDERE KOMPRIMERT, OG DET ER MÅLT.
 *
 * Telefonen laster BEGGE plakatene: den brede står i markupen (riktig for en
 * skrivebordsleser uten JavaScript), og skriptet bytter til den smale. Det er
 * en kjent kostnad, og den skal være liten. Målt førstelast på 390 px med
 * 816 px plakat og CRF 34: /sikkerhet lå på 337 kB, der 40,2 av dem var den
 * smale plakaten alene – 10 % av et budsjett på 400 kB, for et bilde som vises
 * i under ett sekund før klippet tar over.
 *
 * 544 px er 272 × 2, altså full dekning på en telefon med to ganger
 * pikseltetthet, og CRF 38 er mer enn nok på et stillbilde ingen stopper opp
 * ved. Den brede plakaten står urørt på 1280 og CRF 34: den er det eneste en
 * skrivebordsleser uten JavaScript får se, og den skal være skarp.
 */
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", plakatRamme,
  "-vf", `scale=${mobil ? 544 : 1280}:-2:flags=lanczos`,
  "-c:v", "libaom-av1", "-crf", mobil ? "38" : "34", "-still-picture", "1", plakat]);

// Målte dimensjoner, aldri skrevet for hånd: en håndskrevet dimensjon på logoen
// ga CLS 0,145 i produksjon og brøt ytelsesløftet vi selger på.
const mal = JSON.parse(execFileSync("ffprobe", [
  "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json",
  `${UT}/${id}${merke}-${mobil ? MOBIL.trinn[0] : 1920}.mp4`,
]).toString()).streams[0];

const manifestSti = "src/data/opptak.json";
const manifest = existsSync(manifestSti) ? JSON.parse(readFileSync(manifestSti, "utf8")) : {};
const idag = new Date().toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" });
if (mobil) {
  // Det smale opptaket legger seg UNDER det brede, ikke ved siden av. Da kan
  // Demo slå det opp på samme nøkkel, og et bredt opptak som kjøres på nytt
  // river ikke med seg det smale.
  if (!manifest[id]) throw new Error(`«${id}» finnes ikke i manifestet ennå. Ta opp det brede først.`);
  manifest[id].mobil = {
    film: `/opptak/${id}-mobil-${MOBIL.trinn[0]}.mp4`,
    plakat: `/opptak/${id}-mobil-poster.avif`,
    bredde: mal.width,
    hoyde: mal.height,
    tekst: m.tekst ?? scene.tekst,
    kilde: idag,
  };
} else {
  const forrige = manifest[id]?.mobil;
  manifest[id] = {
    smal: `/opptak/${id}-960.mp4`,
    bred: `/opptak/${id}-1280.mp4`,
    stor: `/opptak/${id}-1920.mp4`,
    plakat: `/opptak/${id}-poster.avif`,
    bredde: mal.width,
    hoyde: mal.height,
    tekst: scene.tekst,
    kilde: idag,
  };
  if (forrige) manifest[id].mobil = forrige;
}
writeFileSync(manifestSti, JSON.stringify(manifest, null, 2) + "\n");

if (!behold) rmSync(tmp, { recursive: true, force: true });

console.log(`\n«${id}${merke}» ferdig – ${mal.width}x${mal.height}`);
if (mobil) {
  const L = klipp?.width ?? MOBIL.spalte.width;
  const vis = [["342 px ramme (sju sider)", 342], ["314,6 px ramme (/om)", 314.6], ["250,2 px ramme (/om paa 320 px)", 250.2]];
  console.log(`  klippets CSS-bredde: ${L} px`);
  for (const [navn, V] of vis) {
    const f = V / L;
    console.log(`  ${navn.padEnd(32)} ${f.toFixed(3)}x  →  12px blir ${(12 * f).toFixed(1)}  ·  14px blir ${(14 * f).toFixed(1)}  ·  32px blir ${(32 * f).toFixed(1)}`);
  }
}
for (const l of linjer) console.log(`  ${l.fil.padEnd(34)} ${String(l.mb).padStart(6)} MB  ${String(l.mbit).padStart(5)} Mbit/s  ${l.sek}s`);
console.log(`  ${plakat.padEnd(34)} ${(statSync(plakat).size / 1024).toFixed(1)} kB`);
console.log(`  foreslått plassering: ${scene.plass}`);