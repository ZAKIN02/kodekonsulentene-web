/** Hele batteriet paa komponenten: tastatur, drag, trykk, sveip-avbrudd,
 *  redusert bevegelse, uten JavaScript, sidelengs drag og naabarhet. */
import { chromium } from "playwright";
const url = process.argv[2];
const b = await chromium.launch();
const ok = [], nei = [];
const si = (god, t) => (god ? ok : nei).push(t);

const lagPage = async (opt = {}) => {
  const c = await b.newContext({ deviceScaleFactor: 1, ...opt });
  const p = await c.newPage();
  p.on("pageerror", (e) => nei.push("SIDEFEIL: " + e.message.slice(0, 90)));
  await p.goto(url, { waitUntil: "networkidle" });
  return [c, p];
};
const les = (p) => p.evaluate(() => {
  const r = document.querySelector("[data-slep]");
  const f = r.querySelector("[data-slep-flate]");
  const cs = getComputedStyle(f);
  const inp = r.querySelector('input[type="range"]');
  return {
    p: +getComputedStyle(r).getPropertyValue("--p"),
    kol: cs.gridTemplateColumns, rad: cs.gridTemplateRows,
    verdi: inp.value, valuetext: inp.getAttribute("aria-valuetext"),
    rolle: inp.getAttribute("role") ?? "(implisitt slider)",
    spakSynlig: getComputedStyle(inp).display !== "none",
    spakH: Math.round(inp.getBoundingClientRect().height),
    linjeSynlig: getComputedStyle(r.querySelector(".slep__linje")).display !== "none",
    forteller: r.querySelector("[data-slep-forteller]").textContent,
    status: r.querySelector("[data-slep-status]").textContent,
    hint: [...r.querySelectorAll(".slep__hint")].filter(e => getComputedStyle(e).display !== "none").map(e => e.textContent.trim()),
    flateH: Math.round(f.getBoundingClientRect().height),
    rotH: Math.round(r.getBoundingClientRect().height),
  };
});
const ro = async (p) => { await p.waitForFunction(() => !document.querySelector("[data-slep]").hasAttribute("data-sveiper"), null, { timeout: 9000 }); await p.waitForTimeout(250); };
// Nettstedet har scroll-behavior: smooth. 300 ms etter scrollIntoViewIfNeeded
// var forsiden fortsatt i bevegelse, og boundingBox() gav en posisjon rullingen
// alt hadde forlatt – klikket landet paa .apning__rad i helten. To falske
// stryk. Vent til rullingen faktisk har stanset.
const rolig = async (p) => p.waitForFunction(() => new Promise((ok) => {
  let sist = -1, like = 0;
  const se = () => {
    if (window.scrollY === sist) { if (++like > 3) return ok(true); } else { like = 0; sist = window.scrollY; }
    requestAnimationFrame(se);
  };
  se();
}), null, { timeout: 8000 });
const inn = async (p) => { await p.locator("[data-slep-flate]").first().scrollIntoViewIfNeeded(); await rolig(p); await p.waitForTimeout(200); };

// ---------- 1. autosveip + hviler + bare EN gang ----------
for (const [navn, vp, touch] of [["bred", { width: 1440, height: 900 }, false], ["smal", { width: 390, height: 844 }, true]]) {
  const [c, p] = await lagPage({ viewport: vp, isMobile: touch, hasTouch: touch });
  await inn(p); await ro(p);
  let a = await les(p);
  si(Math.abs(a.p - 0.42) < 0.01, `${navn}: sveip hviler paa ${a.p}`);
  si(a.spakSynlig, `${navn}: spak synlig = ${a.spakSynlig}`);
  si(a.spakH >= 24, `${navn}: spakhoyde ${a.spakH}px (WCAG 2.5.8 krever 24)`);
  si(a.linjeSynlig, `${navn}: skillelinje synlig = ${a.linjeSynlig}`);
  si(a.hint.length === 1, `${navn}: ett hint synlig -> «${a.hint.join("|")}»`);
  si(!!a.valuetext, `${navn}: aria-valuetext = «${a.valuetext}»`);
  // Kjernemaalet: komponenten maa faa plass i det som er IGJEN av
  // visningsbildet naar den faste topplinjen har tatt sitt. Foer omskrivingen
  // var den 755 px mot 678 px ledig paa 390x844 – begge panelene kunne ikke
  // vaere paa skjermen samtidig, uansett hvor man rullet.
  const ledig = await p.evaluate(() => {
    const h = document.querySelector("header.topbar");
    return window.innerHeight - (h ? Math.round(h.getBoundingClientRect().height) : 0);
  });
  si(a.rotH <= ledig, `${navn}: komponenten er ${a.rotH}px, ledig visningsbilde ${ledig}px`);
  // ruller ut og inn igjen: skal IKKE sveipe paa nytt
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  await inn(p); await p.waitForTimeout(2500);
  const b2 = await les(p);
  si(Math.abs(b2.p - a.p) < 0.001, `${navn}: ingen ny sveip ved gjensyn (${a.p} -> ${b2.p})`);

  // ---------- 2. tastatur ----------
  await p.locator("[data-slep-spak]").first().focus();
  for (let i = 0; i < 10; i++) await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(600);
  const t = await les(p);
  si(t.p > a.p + 0.05, `${navn}: piltast hoeyre ${a.p} -> ${t.p}`);
  for (let i = 0; i < 20; i++) await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(600);
  const t2 = await les(p);
  si(t2.p < t.p - 0.05, `${navn}: piltast venstre ${t.p} -> ${t2.p}`);
  si(t2.valuetext === t2.forteller, `${navn}: valuetext foelger fortelleren`);

  // ---------- 3. peker / beroering ----------
  await inn(p);
  const r = await p.locator("[data-slep-flate]").first().boundingBox();
  si(r.y > -1 && r.y + r.height < vp.height + 1, `${navn}: flaten er i visningsbildet foer pekertesten (y=${Math.round(r.y)} h=${Math.round(r.height)})`);
  const foer = (await les(p)).p;
  if (touch) {
    // Trykk paa OEVERSTE panel skal gi det plassen
    await p.touchscreen.tap(r.x + r.width / 2, r.y + 30);
    await p.waitForTimeout(700);
    const e1 = (await les(p)).p;
    si(e1 > foer + 0.1, `smal: trykk paa oeverste panel ${foer} -> ${e1}`);
    await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height - 30);
    await p.waitForTimeout(700);
    const e2 = (await les(p)).p;
    si(e2 < e1 - 0.1, `smal: trykk paa nederste panel ${e1} -> ${e2}`);
    si((await les(p)).status.length > 10, `smal: status meldt etter trykk`);
  } else {
    await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await p.mouse.down();
    await p.mouse.move(r.x + r.width * 0.25, r.y + r.height / 2, { steps: 12 });
    await p.mouse.up(); await p.waitForTimeout(400);
    const d = (await les(p)).p;
    si(Math.abs(d - 0.25) < 0.03, `bred: musedrag til 25% gav ${d}`);
  }

  // ---------- 4. sidelengs drag + naabarhet ----------
  const m = await p.evaluate((vw) => {
    const ut = { drag: document.documentElement.scrollWidth - vw, utenfor: [] };
    for (const el of document.querySelectorAll("[data-slep] *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || +cs.opacity === 0) continue;
      if (el.children.length || !el.textContent?.trim()) continue;
      const q = el.getBoundingClientRect();
      if (q.width < 1) continue;
      // Naabar? Finn en forelder som faktisk kan rulle sidelengs.
      let naabar = false;
      for (let a = el.parentElement; a; a = a.parentElement) {
        const c2 = getComputedStyle(a);
        if (/auto|scroll/.test(c2.overflowX) && a.scrollWidth > a.clientWidth + 1) { naabar = true; break; }
      }
      if (q.right > vw + 2 && !naabar) ut.utenfor.push(`${el.tagName} +${Math.round(q.right - vw)}px «${el.textContent.trim().slice(0, 20)}»`);
    }
    return ut;
  }, vp.width);
  si(m.drag <= 0, `${navn}: sidelengs drag ${m.drag}px`);
  si(!m.utenfor.length, `${navn}: ingen unaabar tekst utenfor kanten ${m.utenfor.slice(0,3).join(" | ")}`);
  await c.close();
}

// ---------- 5. sveipen avbrytes av brukeren ----------
{
  const [c, p] = await lagPage({ viewport: { width: 1440, height: 900 } });
  await p.locator("[data-slep-flate]").first().scrollIntoViewIfNeeded();
  await rolig(p);
  await p.waitForTimeout(500);              // midt i sveipen
  const under = await p.evaluate(() => document.querySelector("[data-slep]").hasAttribute("data-sveiper"));
  // rolig() kan gi seg foer en myk rulling i det hele tatt har startet, og da
  // peker boundingBox() et helt annet sted enn der flaten havner. Spoer
  // nettleseren selv hva som ligger paa punktet, og vent til svaret stemmer.
  const sikte = await p.waitForFunction(() => {
    const f = document.querySelector("[data-slep-flate]");
    const q = f.getBoundingClientRect();
    const x = q.x + q.width * 0.3, y = q.y + q.height / 2;
    if (y < 0 || y > innerHeight) return null;
    return document.querySelector("[data-slep]").contains(document.elementFromPoint(x, y)) ? { x, y } : null;
  }, null, { timeout: 8000 }).then((h) => h.jsonValue());
  si(true, `klikkpunktet ligger i komponenten (${Math.round(sikte.x)}, ${Math.round(sikte.y)})`);
  await p.mouse.click(sikte.x, sikte.y);
  await p.waitForTimeout(80);
  const etter = await p.evaluate(() => document.querySelector("[data-slep]").hasAttribute("data-sveiper"));
  const pv = (await les(p)).p;
  si(under, "sveipen var i gang 500 ms inn");
  si(!etter, "sveipen stoppet da brukeren klikket");
  await p.waitForTimeout(1600);
  si(Math.abs((await les(p)).p - pv) < 0.02, `sveipen tok ikke over igjen (${pv} -> ${(await les(p)).p})`);
  await c.close();
}

// ---------- 6. prefers-reduced-motion ----------
for (const [navn, vp] of [["bred", { width: 1440, height: 900 }], ["smal", { width: 390, height: 844 }]]) {
  const [c, p] = await lagPage({ viewport: vp, reducedMotion: "reduce" });
  await inn(p); await p.waitForTimeout(3200);
  const a = await les(p);
  si(Math.abs(a.p - 0.5) < 0.001, `${navn} + redusert bevegelse: ingen sveip, staar paa ${a.p}`);
  si(a.spakSynlig, `${navn} + redusert bevegelse: spaken virker fortsatt (synlig)`);
  await p.locator("[data-slep-spak]").first().focus();
  for (let i = 0; i < 10; i++) await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(300);
  si((await les(p)).p > 0.55, `${navn} + redusert bevegelse: piltast virker`);
  await c.close();
}

// ---------- 7. uten JavaScript ----------
for (const [navn, vp] of [["bred", { width: 1440, height: 900 }], ["smal", { width: 390, height: 844 }]]) {
  const c = await b.newContext({ viewport: vp, javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto(url, { waitUntil: "domcontentloaded" });
  const a = await p.evaluate(() => {
    const r = document.querySelector("[data-slep]");
    const f = r.querySelector("[data-slep-flate]");
    const synlig = (e) => { const q = e.getBoundingClientRect(); const cs = getComputedStyle(e); return cs.display !== "none" && q.width > 1 && q.height > 1; };
    const paneler = [...r.querySelectorAll("[data-slep-panel]")].map((el) => {
      const q = el.getBoundingClientRect();
      const i = el.querySelector(".slep__innhold").getBoundingClientRect();
      return { n: el.dataset.slepPanel, b: Math.round(q.width), h: Math.round(q.height),
               klippet: i.width > q.width + 1 || i.height > q.height + 1,
               tekst: el.innerText.replace(/\s+/g, " ").trim() };
    });
    return { klar: r.dataset.klar, paneler,
             kontroll: synlig(r.querySelector(".slep__kontroll")),
             linje: synlig(r.querySelector(".slep__linje")),
             figH: Math.round(r.getBoundingClientRect().height),
             flateH: Math.round(f.getBoundingClientRect().height) };
  });
  si(!a.klar, `uten JS ${navn}: data-klar ikke satt`);
  si(!a.kontroll, `uten JS ${navn}: ingen kontroll som ikke gjoer noe`);
  si(!a.linje, `uten JS ${navn}: ingen skillelinje`);
  si(a.paneler.every((x) => !x.klippet), `uten JS ${navn}: ingen av panelene er klippet`);
  si(a.paneler.every((x) => /50|90/.test(x.tekst)), `uten JS ${navn}: begge summene lesbare`);
  si(a.paneler.every((x) => x.tekst.includes("Org.nr.")), `uten JS ${navn}: begge tilstandene komplette`);
  await c.close();
}

console.log("\n  BESTAATT");
for (const t of ok) console.log("   + " + t);
if (nei.length) { console.log("\n  STRYKER"); for (const t of nei) console.log("   - " + t); }
console.log(`\n  ${ok.length} bestaatt, ${nei.length} stryker`);
await b.close();
process.exit(nei.length ? 1 : 0);
