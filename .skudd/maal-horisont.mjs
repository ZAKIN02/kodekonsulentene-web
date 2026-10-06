/**
 * Måler hva Horisont-seksjonen faktisk gjør med flaten den tar.
 *
 * Felle som har tatt to agenter: et fullPage-skjermbilde av en KLEBRIG seksjon
 * syr sammen flere kopier av sporet og ser ødelagt ut selv når alt virker.
 * Derfor scroller denne gjennom i ekte steg og måler i visningsvinduet.
 */
import { chromium } from "playwright";

/**
 * `node .skudd/maal-horisont.mjs <base> <side> --kontroll` kjører de harde
 * kravene: uten JavaScript, med redusert bevegelse, piltaster, og at vannrett
 * scroll aldri lager sidelengs drag på siden.
 */
if (process.argv.includes("--kontroll")) {
  const base = process.argv[2], side = process.argv[3];
  const b = await chromium.launch();
  const ut = {};

  const c1 = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const p1 = await c1.newPage();
  await p1.goto(base + side, { waitUntil: "load" });
  ut.utenJS = await p1.evaluate(() => {
    const s = document.querySelector("[data-horisont]"), sp = s.querySelector("[data-horisont-spor]");
    return { fest: s.hasAttribute("data-fest"), hoyde: Math.round(s.getBoundingClientRect().height),
             kort: sp.children.length, kanDras: sp.scrollWidth > sp.clientWidth,
             alleTitlerSynlige: [...sp.querySelectorAll(".horisont__tittel")].every((e) => e.getBoundingClientRect().height > 0) };
  });
  await c1.close();

  const c2 = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const p2 = await c2.newPage();
  await p2.goto(base + side, { waitUntil: "networkidle" });
  await p2.waitForTimeout(300);
  ut.redusert = await p2.evaluate(() => {
    const s = document.querySelector("[data-horisont]"), sp = s.querySelector("[data-horisont-spor]");
    return { fest: s.hasAttribute("data-fest"),
             festPosisjon: getComputedStyle(s.querySelector(".horisont__fest")).position,
             retning: getComputedStyle(sp).flexDirection,
             kortHoyde: Math.round(sp.children[0].getBoundingClientRect().height),
             alleSynlige: [...sp.children].every((e) => +getComputedStyle(e).opacity > 0.9) };
  });
  await c2.close();

  for (const [navn, vp] of [["skrivebord", { width: 1440, height: 900 }], ["mobil", { width: 390, height: 844 }]]) {
    const c = await b.newContext({ viewport: vp });
    const p = await c.newPage();
    await p.goto(base + side, { waitUntil: "networkidle" });
    await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelector("[data-horisont-spor]").focus());
    const f = await p.evaluate(() => document.querySelector("[data-horisont-spor]").scrollLeft);
    for (let i = 0; i < 6; i++) await p.keyboard.press("ArrowRight");
    await p.waitForTimeout(300);
    const e = await p.evaluate(() => document.querySelector("[data-horisont-spor]").scrollLeft);
    ut[navn] = {
      pilFlyttet: e - f,
      sidelengsDrag: await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    };
    await c.close();
  }
  console.log(JSON.stringify(ut, null, 1));
  await b.close();
  process.exit(0);
}

const [base, side, breddeArg] = process.argv.slice(2);
const bredde = Number(breddeArg || 1440);
const hoyde = bredde < 700 ? 844 : 900;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: bredde, height: hoyde } });
await p.goto(base + side, { waitUntil: "networkidle" });
await p.waitForTimeout(400);

const grunn = await p.evaluate(() => {
  const s = document.querySelector("[data-horisont]");
  if (!s) return null;
  const fest = s.querySelector(".horisont__fest");
  const spor = s.querySelector("[data-horisont-spor]");
  const kort = spor?.querySelector(".horisont__kort");
  return {
    seksjon: Math.round(s.getBoundingClientRect().height),
    fest: Math.round(fest.getBoundingClientRect().height),
    kort: Math.round(kort?.getBoundingClientRect().height ?? 0),
    antallKort: spor?.children.length ?? 0,
    sporBredde: Math.round(spor?.scrollWidth ?? 0),
    sporSynlig: Math.round(spor?.clientWidth ?? 0),
    vannrettVei: Math.round((spor?.scrollWidth ?? 0) - (spor?.clientWidth ?? 0)),
  };
});
if (!grunn) { // Ekte visningsbilder gjennom et gjennomløp. Et fullPage-skudd av en klebrig
// seksjon syr sammen flere kopier av sporet og ser ødelagt ut selv når alt virker.
if (process.env.SKUDD) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    await p.evaluate(({ topp, a }) => {
      const s = document.querySelector("[data-horisont]");
      const strekk = s.getBoundingClientRect().height - innerHeight;
      window.scrollTo(0, topp + strekk * a);
    }, { topp, a: i / (n - 1) });
    await p.waitForTimeout(260);
    await p.screenshot({ path: `${process.env.SKUDD}-${bredde}-${i}.png` });
  }
}

console.log(JSON.stringify({ side, feil: "ingen horisont" })); await b.close(); process.exit(0); }

// Scroll til midten av den klebrige strekningen, der seksjonen eier skjermen.
const topp = await p.evaluate(() => {
  const s = document.querySelector("[data-horisont]");
  return s.getBoundingClientRect().top + window.scrollY;
});
await p.evaluate((y) => window.scrollTo(0, y + 10), topp);
await p.waitForTimeout(300);

/**
 * Største sammenhengende vannrette bånd uten innhold, innenfor den festede
 * flaten. Måles med elementFromPoint langs midtaksen – et punkt som svarer
 * selve beholderen er tomrom.
 */
const dodtFelt = await p.evaluate(() => {
  const fest = document.querySelector(".horisont__fest");
  const r = fest.getBoundingClientRect();
  const x = Math.round(r.left + r.width / 2);
  const tomme = [];
  for (let y = Math.max(1, Math.ceil(r.top)); y < Math.min(innerHeight - 1, r.bottom); y += 4) {
    const el = document.elementFromPoint(x, y);
    const tom = !el || el.classList.contains("horisont__fest") ||
                el.classList.contains("horisont") || el.tagName === "SECTION" ||
                el.tagName === "BODY" || el.tagName === "HTML";
    tomme.push(tom);
  }
  let best = 0, n = 0;
  for (const t of tomme) { n = t ? n + 1 : 0; if (n > best) best = n; }
  return { dodtPx: best * 4, festHoyde: Math.round(r.height) };
});

// Hvor mye vannrett bevegelse får man igjen per skjermhøyde man scroller?
const serie = [];
for (const andel of [0, 0.25, 0.5, 0.75, 1]) {
  await p.evaluate(({ topp, andel }) => {
    const s = document.querySelector("[data-horisont]");
    const strekk = s.getBoundingClientRect().height - innerHeight;
    window.scrollTo(0, topp + strekk * andel);
  }, { topp, andel });
  await p.waitForTimeout(220);
  serie.push(await p.evaluate(() => Math.round(document.querySelector("[data-horisont-spor]").scrollLeft)));
}

// Ekte visningsbilder gjennom et gjennomløp. Et fullPage-skudd av en klebrig
// seksjon syr sammen flere kopier av sporet og ser ødelagt ut selv når alt virker.
if (process.env.SKUDD) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    await p.evaluate(({ topp, a }) => {
      const s = document.querySelector("[data-horisont]");
      const strekk = s.getBoundingClientRect().height - innerHeight;
      window.scrollTo(0, topp + strekk * a);
    }, { topp, a: i / (n - 1) });
    await p.waitForTimeout(260);
    await p.screenshot({ path: `${process.env.SKUDD}-${bredde}-${i}.png` });
  }
}

console.log(JSON.stringify({
  side, bredde,
  ...grunn,
  ...dodtFelt,
  dodtAndel: +(dodtFelt.dodtPx / dodtFelt.festHoyde * 100).toFixed(1),
  skjermerScroll: +((grunn.seksjon - hoyde) / hoyde).toFixed(2),
  sporPosisjoner: serie,
}, null, 0));
await b.close();
