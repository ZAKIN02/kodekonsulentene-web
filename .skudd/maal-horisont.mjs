/**
 * Måler hva Horisont-seksjonen faktisk gjør med flaten den tar.
 *
 * Felle som har tatt to agenter: et fullPage-skjermbilde av en KLEBRIG seksjon
 * syr sammen flere kopier av sporet og ser ødelagt ut selv når alt virker.
 * Derfor scroller denne gjennom i ekte steg og måler i visningsvinduet.
 */
import { chromium } from "playwright";

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
