/**
 * Feiljakt, andre runde – det forrige runde ikke kunne måle.
 *
 * Runde 1 (.skudd/feiljakt.mjs) gikk gjennom 32 ruter i Chromium og fant at
 * produksjon var nesten ren. Den sa selv fra om to blindsoner: den målte ikke
 * Firefox, og den målte ikke degradering. Begge er nettopp der denne sidens
 * verste feil har bodd.
 *
 * Hvorfor det er viktig her: siden er bygget på `animation-timeline`, som FIREFOX
 * IKKE HAR. Alt som toner inn ved scroll – Avslor, ScrollHistorie, Mega – er helt
 * avhengig av at fraværet av den egenskapen gir «synlig», ikke «borte». Det er
 * forskjellen mellom en side som mangler en effekt og en side uten innhold.
 *
 * De tre modusene er ikke variasjoner av samme test. De stiller tre ulike spørsmål:
 *   js      – virker det?
 *   utenjs  – står innholdet der uansett?
 *   redusert – forsvinner noe når noen ber om mindre bevegelse?
 *
 *   node .skudd/feiljakt2.mjs http://127.0.0.1:4443 lokal
 *   node .skudd/feiljakt2.mjs https://kodekonsulentene.no prod
 */
import { chromium, firefox, webkit } from "@playwright/test";
import { writeFileSync } from "node:fs";

const BASE = (process.argv[2] ?? "http://127.0.0.1:4443").replace(/\/$/, "");
const MERKE = process.argv[3] ?? "lokal";
const BARE = process.argv[4]; // valgfritt: kjør én nettleser

const SIDER = [
  "/", "/404", "/apper-og-ai", "/bransjer/handverkere", "/bransjer/klinikker",
  "/caser", "/handbok", "/historie", "/kontakt", "/nettsider", "/om",
  "/personvern", "/priser", "/sikkerhet", "/sjekk", "/status", "/systemer",
  "/terminal", "/verktoy", "/verktoy/cookie-sjekk", "/verktoy/dmarc",
  "/verktoy/priskalkulator", "/verktoy/uu-sjekk", "/vilkar",
];

/** Sidene der degradering faktisk står på spill. Full matrise i tre nettlesere
 *  og tre modi er 24 x 3 x 3 = 216 kjøringer; disse bærer mekanikken. */
const KJERNE = ["/", "/historie", "/sikkerhet", "/kontakt", "/systemer", "/status", "/sjekk"];

const funn = [];
const kontroller = []; // hver kontroll som FAKTISK kjørte, med tall bak
const legg = (nettleser, modus, side, type, alvor, hva, maalt) =>
  funn.push({ nettleser, modus, side, type, alvor, hva, maalt });
const tell = (navn, verdi, detalj) => kontroller.push({ navn, verdi, detalj });

const NETTLESERE = [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]
  .filter(([n]) => !BARE || n === BARE);

/* ──────────────────────────────────────────────────────────────────────────
 * Kjernen: er noe USYNLIG som burde vært lest?
 *
 * Dette er hele poenget med runden. Et element som har opacity 0 og aldri får
 * mer, er innhold besøkeren ikke får. Målt på det MALTE resultatet, ikke på
 * CSS-regler, fordi det er det brukeren ser.
 * ────────────────────────────────────────────────────────────────────────── */
/**
 * Finner tekst som ALDRI blir synlig, og bare det.
 *
 * AVGJØRENDE METODEVALG: et element må vurderes mens det er I SYN.
 * `animation-timeline: view()` setter opacity 0 når elementet er utenfor
 * synsranden – det ER mekanikken. Måler man etter å ha scrollet til toppen,
 * rapporteres hvert element under skjermkanten som «usynlig», og det er måleren
 * som tar feil, ikke siden. Første utkast gjorde nettopp det og meldte 106
 * falske funn; målt etterpå viste de samme elementene opacity 1 i syn.
 *
 * Framgangsmåte: ett gjennomløp nedover siden. Ved hvert steg noteres BESTE
 * synlighet for hvert element som står godt innenfor synsranden. Et element
 * felles bare hvis det var i syn og likevel aldri ble synlig.
 */
async function usynligInnhold(p, modus) {
  return p.evaluate(async (modus) => {
    const VELGER =
      "[data-avslor], .avslor, .hist__kort, .mega, .scene p, .scene h1, .scene h2, " +
      ".nokkeltall__verdi, .nokkeltall__merke, .kk-price-navn, .card p, .card h3";
    const kandidater = [...document.querySelectorAll(VELGER)].filter((el) => {
      if (!(el.textContent || "").trim()) return false;
      // Med vilje skjult for syn, men lest av skjermleser – helt i orden.
      return !el.closest(".visually-hidden,.sr-only,[hidden],[aria-hidden='true']");
    });

    const beste = new Map(); // el → { opacity, iSyn, ... }
    const maal = () => {
      const vh = window.innerHeight;
      for (const el of kandidater) {
        const r = el.getBoundingClientRect();
        // «Godt innenfor»: minst 40 % av elementet, eller hele det, inne i ruta.
        const synligHoyde = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        const iSyn = r.height > 0 && synligHoyde >= Math.min(r.height * 0.4, vh * 0.3);
        if (!iSyn) continue;
        const s = getComputedStyle(el);
        const o = Number(s.opacity);
        const f = beste.get(el);
        if (!f || o > f.opacity) {
          beste.set(el, {
            opacity: o,
            visibility: s.visibility,
            display: s.display,
            animationName: s.animationName,
            animationTimeline: s.animationTimeline,
            bredde: Math.round(r.width),
            hoyde: Math.round(r.height),
          });
        }
      }
    };

    const h = document.documentElement.scrollHeight;
    const steg = Math.max(250, window.innerHeight * 0.45);
    for (let y = 0; y <= h; y += steg) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (modus !== "utenjs") await new Promise((r) => setTimeout(r, 70));
      maal();
    }
    // Én runde til på vei opp: noen effekter utløses bare én vei.
    for (let y = h; y >= 0; y -= steg * 2) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      maal();
    }

    const skjult = [];
    for (const [el, b] of beste) {
      const usynlig =
        b.opacity < 0.05 || b.visibility === "hidden" || b.display === "none" ||
        (b.bredde === 0 && b.hoyde === 0);
      if (usynlig) {
        skjult.push({
          tekst: (el.textContent || "").trim().slice(0, 60).replace(/\s+/g, " "),
          opacity: String(b.opacity),
          visibility: b.visibility,
          display: b.display,
          animationName: b.animationName,
          animationTimeline: b.animationTimeline,
          hoyde: b.hoyde,
        });
      }
    }
    // Antall vurderte er bevis for at kontrollen hadde noe å se på.
    return { skjult, vurdert: beste.size, kandidater: kandidater.length };
  }, modus);
}

/** Teller elementer med reell scroll-tidslinje – bevis for at kontrollen så noe. */
async function tidslinjer(p) {
  return p.evaluate(() => {
    let n = 0, navn = 0;
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      const t = s.animationTimeline;
      if (t && t !== "auto" && t !== "none") n++;
      if (s.animationName && s.animationName !== "none") navn++;
    }
    return { tidslinje: n, animasjon: navn };
  });
}

async function kjorSide(nettleserNavn, nettleser, sti, modus) {
  const url = BASE + sti;
  const ktx = await nettleser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    javaScriptEnabled: modus !== "utenjs",
    reducedMotion: modus === "redusert" ? "reduce" : "no-preference",
  });
  const p = await ktx.newPage();

  if (modus !== "utenjs") {
    await p.addInitScript(() => {
      window.__csp = [];
      document.addEventListener("securitypolicyviolation", (e) => {
        window.__csp.push({
          direktiv: e.violatedDirective,
          kilde: (e.sourceFile || "inline") + ":" + (e.lineNumber ?? 0),
          blokkert: String(e.blockedURI || "").slice(0, 80),
        });
      });
    });
  }

  const konsoll = [];
  const doede = [];
  p.on("console", (m) => {
    if (m.type() === "error") konsoll.push(m.text().slice(0, 200));
  });
  p.on("requestfailed", (r) =>
    doede.push({ url: r.url().slice(0, 120), grunn: r.failure()?.errorText ?? "ukjent" }));
  p.on("response", (r) => {
    if (r.status() >= 400) doede.push({ url: r.url().slice(0, 120), grunn: "HTTP " + r.status() });
  });

  let svar;
  try {
    svar = await p.goto(url, { waitUntil: "load", timeout: 45000 });
  } catch (e) {
    legg(nettleserNavn, modus, sti, "navigering", 1, "Siden lastet ikke",
      String(e.message).slice(0, 110));
    await ktx.close();
    return;
  }
  if (svar && svar.status() !== 200)
    legg(nettleserNavn, modus, sti, "status", 1, `Svarte ${svar.status()}, forventet 200`, "navigering");

  await p.waitForTimeout(900);

  // Scroll gjennom hele siden: scroll-drevne animasjoner utløses ikke uten det,
  // og et element som aldri toner inn avslører seg bare etter at man har vært der.
  if (modus !== "utenjs") {
    await p.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += Math.max(300, window.innerHeight * 0.6)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 200));
    });
    await p.waitForTimeout(400);
  }

  // --- CSP ---
  if (modus !== "utenjs") {
    const csp = await p.evaluate(() => window.__csp ?? []);
    for (const v of csp)
      legg(nettleserNavn, modus, sti, "csp", 1, `Blokkert av CSP: ${v.direktiv}`,
        `${v.kilde} → ${v.blokkert}`);
  }

  for (const k of konsoll)
    legg(nettleserNavn, modus, sti, "konsoll", 1, "Konsollfeil", k);
  for (const d of doede)
    legg(nettleserNavn, modus, sti, "forespørsel", 1, "Lastet ikke: " + d.grunn, d.url);

  // --- Usynlig innhold: rundens hovedspørsmål ---
  const syn = await usynligInnhold(p, modus);
  for (const s of syn.skjult)
    legg(nettleserNavn, modus, sti, "usynlig", 1,
      "Tekst blir aldri synlig, heller ikke når den står i synsranden",
      `«${s.tekst}» beste opacity ${s.opacity}, visibility ${s.visibility}, ` +
      `animation ${s.animationName}, timeline ${s.animationTimeline}, h ${s.hoyde}px`);
  tell(`tekstelementer vurdert i syn (${nettleserNavn}/${modus})`, syn.vurdert, sti);

  // --- Innhold i det hele tatt ---
  const innhold = await p.evaluate(() => {
    const h1 = document.querySelectorAll("h1").length;
    const tekst = (document.body.innerText || "").trim();
    return { h1, ord: tekst.split(/\s+/).filter(Boolean).length, tegn: tekst.length };
  });
  if (innhold.ord < 40)
    legg(nettleserNavn, modus, sti, "innhold", 1,
      "Siden har nesten ingen lesbar tekst", `${innhold.ord} ord`);
  if (innhold.h1 !== 1)
    legg(nettleserNavn, modus, sti, "innhold", 2,
      `${innhold.h1} h1 på siden, forventet nøyaktig 1`, `h1 = ${innhold.h1}`);

  // --- Video: kan den spoles? ---
  if (modus === "js") {
    const video = await p.evaluate(async () => {
      const ut = [];
      for (const v of document.querySelectorAll("video")) {
        // Tving lasting: preload="none" + IntersectionObserver betyr at src
        // kanskje aldri ble satt. Uten dette måler vi ingenting.
        if (!v.currentSrc && !v.src) {
          const s = v.querySelector("source");
          const kand = s?.getAttribute("data-bred") || s?.getAttribute("data-smal") ||
                       s?.getAttribute("src");
          if (kand) { v.src = kand; v.load(); }
        }
        if (v.readyState === 0) {
          await Promise.race([
            new Promise((r) => v.addEventListener("loadedmetadata", r, { once: true })),
            new Promise((r) => setTimeout(r, 4000)),
          ]);
        }
        ut.push({
          src: (v.currentSrc || v.src || "(ingen kilde satt)").split("/").pop(),
          readyState: v.readyState,
          seekbar: v.seekable.length ? Number(v.seekable.end(0).toFixed(2)) : 0,
          varighet: Number.isFinite(v.duration) ? Number(v.duration.toFixed(2)) : 0,
          plakat: v.poster ? v.poster.split("/").pop() : "",
        });
      }
      return ut;
    });
    for (const v of video) {
      if (v.src === "(ingen kilde satt)") continue;
      if (v.readyState === 0)
        legg(nettleserNavn, modus, sti, "video", 1, "Video lastet ingen metadata",
          `${v.src}, readyState 0`);
      else if (v.seekbar === 0)
        legg(nettleserNavn, modus, sti, "video", 1,
          "Video kan ikke spoles – Range mangler for denne fila",
          `${v.src}, seekable.end(0) = 0`);
      else
        tell(`video spolbar (${nettleserNavn})`, 1, `${sti} ${v.src}: seekable ${v.seekbar}s`);
      if (!v.plakat)
        legg(nettleserNavn, modus, sti, "video", 3, "Video uten plakat", v.src);
    }
  }

  // --- Tidslinjer, som bevis for at kontrollen hadde noe å se på ---
  if (modus === "js") {
    const t = await tidslinjer(p);
    tell(`scroll-tidslinjer (${nettleserNavn})`, t.tidslinje, `${sti}`);
  }

  // --- /kontakt uten JS: kvitteringen MÅ rendres av serveren ---
  if (sti === "/kontakt" && modus === "utenjs") {
    const k = await ktx.newPage();
    await k.goto(BASE + "/kontakt?sendt=1", { waitUntil: "load" });
    const txt = await k.evaluate(() => document.body.innerText);
    if (!/Takk\s*[–-]\s*meldingen kom fram/i.test(txt))
      legg(nettleserNavn, modus, "/kontakt?sendt=1", "utenjs", 1,
        "Kvitteringen rendres ikke uten JavaScript",
        txt.slice(0, 120).replace(/\s+/g, " "));
    else
      tell(`kvittering uten JS (${nettleserNavn})`, 1, "«Takk – meldingen kom fram» funnet");
    await k.close();
  }

  // --- Nøkkeltall uten JS: sluttverdiene skal stå i HTML ---
  if (modus === "utenjs") {
    const tall = await p.evaluate(() =>
      [...document.querySelectorAll(".nokkeltall__verdi")].map((e) => (e.textContent || "").trim()));
    if (tall.length) {
      const tomme = tall.filter((t) => !t || t === "0" && tall.length > 1 && tall.every((x) => x === "0"));
      if (tomme.length === tall.length)
        legg(nettleserNavn, modus, sti, "utenjs", 1,
          "Nøkkeltallene er tomme uten JavaScript", JSON.stringify(tall));
      else tell(`nøkkeltall uten JS (${nettleserNavn})`, tall.length, `${sti}: ${tall.join(" · ")}`);
    }
    // FAQ: innholdet skal være i DOM, selv om det er lukket.
    const faq = await p.evaluate(() =>
      [...document.querySelectorAll("details")].map((d) => ({
        apen: d.open,
        innhold: (d.textContent || "").trim().length,
      })));
    for (const f of faq)
      if (f.innhold < 20)
        legg(nettleserNavn, modus, sti, "utenjs", 2, "FAQ-element uten innhold i DOM",
          `${f.innhold} tegn`);
    if (faq.length) tell(`FAQ i DOM uten JS (${nettleserNavn})`, faq.length, sti);
  }

  await ktx.close();
}

/* ── Kjøring ── */
for (const [navn, b] of NETTLESERE) {
  const nettleser = await b.launch();
  process.stdout.write(`\n${navn.padEnd(9)} js `);
  for (const sti of SIDER) { await kjorSide(navn, nettleser, sti, "js"); process.stdout.write("."); }
  process.stdout.write(" | utenjs ");
  for (const sti of KJERNE) { await kjorSide(navn, nettleser, sti, "utenjs"); process.stdout.write("."); }
  process.stdout.write(" | redusert ");
  for (const sti of KJERNE) { await kjorSide(navn, nettleser, sti, "redusert"); process.stdout.write("."); }
  await nettleser.close();
}
console.log("");

const ut = { base: BASE, merke: MERKE, naar: new Date().toISOString(), funn, kontroller };
writeFileSync(`.skudd/feil2-${MERKE}.json`, JSON.stringify(ut, null, 1));

for (const a of [1, 2, 3]) {
  const g = funn.filter((f) => f.alvor === a);
  if (!g.length) continue;
  console.log(`\n${"=".repeat(72)}\nALVOR ${a} — ${g.length} funn`);
  // Grupper like funn, ellers drukner rapporten i gjentakelser.
  const grupper = new Map();
  for (const f of g) {
    const n = `${f.nettleser}|${f.modus}|${f.hva}`;
    if (!grupper.has(n)) grupper.set(n, []);
    grupper.get(n).push(f);
  }
  for (const [n, liste] of grupper) {
    const [nb, mo, hva] = n.split("|");
    console.log(`\n  [${nb}/${mo}] ${hva}  (${liste.length})`);
    for (const f of liste.slice(0, 6))
      console.log(`     ${f.side.padEnd(26)} ${f.maalt}`);
    if (liste.length > 6) console.log(`     … ${liste.length - 6} til`);
  }
}

console.log(`\n${"=".repeat(72)}\nKONTROLLER SOM FAKTISK KJØRTE`);
const samlet = new Map();
for (const k of kontroller) {
  if (!samlet.has(k.navn)) samlet.set(k.navn, { n: 0, sum: 0 });
  const s = samlet.get(k.navn); s.n++; s.sum += Number(k.verdi) || 0;
}
for (const [navn, s] of samlet)
  console.log(`  ${navn.padEnd(36)} ${String(s.n).padStart(4)} målinger, sum ${s.sum}`);

console.log(`\nTotalt ${funn.length} funn → .skudd/feil2-${MERKE}.json`);
