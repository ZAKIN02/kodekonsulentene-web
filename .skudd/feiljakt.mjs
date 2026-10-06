/**
 * Feiljakt – går gjennom hver side og fanger opp det som faktisk er galt for en besøkende.
 *
 * Bakgrunnen: denne siden har to ganger hatt feil som ALLE tester var blinde for.
 * Inline-skript ble blokkert av CSP i produksjon mens 153 tester var grønne, og
 * /kontakt hadde tre blokkerte skript fordi den er den eneste serverrendrede siden
 * og derfor aldri havner i dist/client der hashene høstes. Begge var usynlige for
 * statuskoder og byte-tellinger. Derfor måler denne i en ekte nettleser.
 *
 *   node .skudd/feiljakt.mjs http://127.0.0.1:4423 lokal
 *   node .skudd/feiljakt.mjs https://kodekonsulentene.no prod
 */
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const BASE = (process.argv[2] ?? "http://127.0.0.1:4423").replace(/\/$/, "");
const MERKE = process.argv[3] ?? "lokal";

const SIDER = [
  "/", "/404", "/apper-og-ai", "/bransjer/handverkere", "/bransjer/klinikker",
  "/caser", "/handbok", "/historie", "/kontakt", "/nettsider", "/om",
  "/personvern", "/priser", "/sikkerhet", "/sjekk", "/status", "/systemer",
  "/terminal", "/verktoy", "/verktoy/cookie-sjekk", "/verktoy/dmarc",
  "/verktoy/priskalkulator", "/verktoy/uu-sjekk", "/vilkar",
  "/lab/bibliotek", "/lab/ikoner", "/lab/interaksjon", "/lab/og",
  "/lab/rontgen", "/lab/svg", "/lab/teknikker", "/lab/typo",
];

const funn = [];
const legg = (side, type, alvor, hva, maalt) =>
  funn.push({ side, type, alvor, hva, maalt });

const nettleser = await chromium.launch();

for (const sti of SIDER) {
  const url = BASE + sti;
  const ktx = await nettleser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  });
  const p = await ktx.newPage();

  // CSP-brudd må fanges i siden selv. Playwright rapporterer dem ikke som
  // konsollfeil på en måte som skiller dem fra annet støy.
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

  const konsoll = [];
  const doede = [];
  p.on("console", (m) => {
    const t = m.type();
    if (t === "error" || t === "warning") konsoll.push({ t, tekst: m.text().slice(0, 200) });
  });
  p.on("requestfailed", (r) =>
    doede.push({ url: r.url().slice(0, 120), grunn: r.failure()?.errorText ?? "ukjent" }));
  p.on("response", (r) => {
    if (r.status() >= 400) doede.push({ url: r.url().slice(0, 120), grunn: "HTTP " + r.status() });
  });

  let svar;
  try {
    svar = await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch (e) {
    legg(sti, "navigering", 1, "Siden lastet ikke i det hele tatt", String(e.message).slice(0, 120));
    await ktx.close();
    continue;
  }

  // /404 servert på sin EGEN sti skal svare 200 – det er en vanlig side. Om en
  // ikke-eksisterende URL svarer 404 sjekkes separat nederst.
  if (svar && svar.status() !== 200)
    legg(sti, "status", 1, `Svarte ${svar.status()}, forventet 200`, "navigering");

  await p.waitForTimeout(1500);

  // --- 2. CSP ---
  const csp = await p.evaluate(() => window.__csp ?? []);
  for (const v of csp)
    legg(sti, "csp", 1, `Blokkert av CSP: ${v.direktiv}`, `${v.kilde} → ${v.blokkert}`);

  // --- 1. Konsoll ---
  for (const k of konsoll)
    legg(sti, "konsoll", k.t === "error" ? 1 : 3, `Konsoll ${k.t}`, k.tekst);

  // --- 3. Døde forespørsler ---
  for (const d of doede)
    legg(sti, "forespørsel", 1, "Lastet ikke: " + d.grunn, d.url);

  // --- 4. Video: kan den spoles? ---
  const video = await p.evaluate(async () => {
    const ut = [];
    for (const v of document.querySelectorAll("video")) {
      // Vent litt på metadata før vi dømmer.
      if (v.readyState === 0) await new Promise((r) => setTimeout(r, 1200));
      ut.push({
        src: (v.currentSrc || v.src || "(ingen)").split("/").pop(),
        readyState: v.readyState,
        seekbar: v.seekable.length ? v.seekable.end(0) : 0,
        varighet: Number.isFinite(v.duration) ? v.duration : 0,
        plakat: v.poster ? v.poster.split("/").pop() : "",
        bredde: v.videoWidth,
      });
    }
    return ut;
  });
  for (const v of video) {
    if (v.readyState === 0)
      legg(sti, "video", 1, "Video lastet ingen metadata", `${v.src}, readyState 0`);
    else if (v.seekbar === 0)
      legg(sti, "video", 1, "Video kan ikke spoles – serveren mangler Range for denne fila",
        `${v.src}, seekable.end(0) = 0`);
    if (!v.plakat)
      legg(sti, "video", 3, "Video uten plakat – svart flate til første ramme lastes", v.src);
  }

  // --- 7. Bilder uten dimensjoner, og bilder som ikke lastet ---
  const bilder = await p.evaluate(() =>
    [...document.querySelectorAll("img")].map((i) => ({
      src: (i.currentSrc || i.src || "(ingen)").split("/").pop(),
      harW: i.hasAttribute("width"), harH: i.hasAttribute("height"),
      attrW: Number(i.getAttribute("width")) || 0,
      attrH: Number(i.getAttribute("height")) || 0,
      maltW: Math.round(i.getBoundingClientRect().width),
      maltH: Math.round(i.getBoundingClientRect().height),
      cssBredde: getComputedStyle(i).width,
      skalert: /%|vw|calc/.test(i.style.width || "") ||
               getComputedStyle(i).maxWidth !== "none",
      naturlig: i.naturalWidth,
      alt: i.hasAttribute("alt"),
      lat: i.loading,
    })));
  for (const b of bilder) {
    if (b.naturlig === 0)
      legg(sti, "bilde", 1, "Bilde lastet ikke", b.src);
    if (!b.harW || !b.harH)
      legg(sti, "bilde", 2, "Bilde uten width/height – gir layoutskift", b.src);
    // CLS kommer av feil SIDEFORHOLD, ikke feil bredde. Et bilde med
    // width:100% og height:auto skal ha attributter i naturlig størrelse –
    // de reserverer plassen riktig. Feilen som ga oss CLS 0,145 var logoen:
    // attributt 220 mot malt 169,9 på et bilde CSS ikke skalerte.
    if (b.harW && b.harH && b.attrW > 0 && b.attrH > 0 && b.maltW > 0 && b.maltH > 0) {
      const oppgitt = b.attrW / b.attrH, malt = b.maltW / b.maltH;
      if (Math.abs(oppgitt - malt) / malt > 0.05)
        legg(sti, "bilde", 2, "Sideforholdet i attributtene stemmer ikke med det malte – gir layoutskift",
          `${b.src}: oppgitt ${b.attrW}x${b.attrH} (${oppgitt.toFixed(2)}), malt ${b.maltW}x${b.maltH} (${malt.toFixed(2)})`);
    }
    if (!b.alt)
      legg(sti, "bilde", 2, "Bilde uten alt-attributt", b.src);
  }

  // --- 6. Animasjoner ---
  const anim = await p.evaluate(() => {
    const ut = { stenografi: [], ingen: [], tidslinje: 0 };
    for (const ark of document.styleSheets) {
      let regler;
      try { regler = ark.cssRules; } catch { continue; }
      for (const r of regler ?? []) {
        const t = r.cssText ?? "";
        // Minifieren slår animation + animation-timeline sammen til ugyldig
        // stenografi som BÅDE Chromium og Firefox forkaster stille.
        if (/animation:\s*[^;]*\b(view|scroll)\(/.test(t)) ut.stenografi.push(t.slice(0, 120));
      }
    }
    for (const el of document.querySelectorAll("[class]")) {
      const s = getComputedStyle(el);
      if (s.animationTimeline && s.animationTimeline !== "auto" && s.animationTimeline !== "none")
        ut.tidslinje++;
      if (s.animationName !== "none") ut.ingen.push(s.animationName);
    }
    return ut;
  });
  for (const s of anim.stenografi)
    legg(sti, "animasjon", 1, "Ugyldig animasjons-stenografi – forkastes stille av nettleseren", s);

  // --- 5. Lenker ---
  const lenker = await p.evaluate(() =>
    [...document.querySelectorAll("a")].map((a) => ({
      href: a.getAttribute("href"),
      tekst: (a.textContent || "").trim().slice(0, 40),
      harInnhold: !!(a.textContent || "").trim() || !!a.querySelector("img,svg"),
    })));
  for (const l of lenker) {
    if (l.href === null || l.href === "" )
      legg(sti, "lenke", 2, "Lenke uten href", l.tekst || "(tom tekst)");
    else if (/^(tel:|mailto:)\s*$/.test(l.href))
      legg(sti, "lenke", 1, "Lenke til tomt kontaktpunkt", l.href);
    if (!l.harInnhold)
      legg(sti, "lenke", 1, "Lenke uten tilgjengelig navn", l.href ?? "(ingen href)");
  }

  await ktx.close();
  process.stdout.write(".");
}

// Svarer en ikke-eksisterende URL faktisk 404? Et nettsted som svarer 200 på alt
// får hele sitt innhold indeksert som duplikater.
{
  const k = await nettleser.newContext();
  const p = await k.newPage();
  const r = await p.goto(BASE + "/finnes-ikke-" + Date.now(), { waitUntil: "domcontentloaded" }).catch(() => null);
  if (!r) legg("(ukjent sti)", "status", 1, "Ukjent URL svarte ikke i det hele tatt", "navigering feilet");
  else if (r.status() !== 404)
    legg("(ukjent sti)", "status", 1, `Ukjent URL svarte ${r.status()}, ikke 404`, "navigering");
  await k.close();
}

await nettleser.close();
console.log("");

// Interne lenker sjekkes én gang, samlet.
const alle = new Set();
for (const sti of SIDER) alle.add(sti);
const ut = { base: BASE, merke: MERKE, naar: new Date().toISOString(), funn };
writeFileSync(`.skudd/feil-${MERKE}.json`, JSON.stringify(ut, null, 1));

const etter = [1, 2, 3];
for (const a of etter) {
  const g = funn.filter((f) => f.alvor === a);
  if (!g.length) continue;
  console.log(`\n${"=".repeat(60)}\nALVOR ${a} — ${g.length} funn`);
  for (const f of g) console.log(`  ${f.side.padEnd(26)} ${f.hva}\n${" ".repeat(29)}${f.maalt}`);
}
console.log(`\nTotalt ${funn.length} funn på ${SIDER.length} sider → .skudd/feil-${MERKE}.json`);
