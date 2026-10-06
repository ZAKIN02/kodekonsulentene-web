/** MEN-DEGRADERING: de fire tilstandene, målt i stedet for antatt.
 *
 *   1. normalt            – Chromium, JS på, bevegelse tillatt
 *   2. redusert bevegelse – prefers-reduced-motion: reduce
 *   3. uten JavaScript    – javaScriptEnabled: false
 *   4. EKTE Firefox       – ikke emulert. Firefox har ikke view().
 *
 * Kravet er likt i alle fire: innholdet skal være SYNLIG. Degraderingen går mot
 * synlig, aldri mot skjult. Derfor måles effektiv opasitet (produktet av alle
 * forfedres opasitet) og ikke bare elementets egen.
 *
 * Bruk: node .skudd/men-degradering.mjs <url>
 */
import { chromium, firefox } from "playwright";

const url = process.argv[2] || "http://localhost:4877/lab/mening";

const MAAL = [
  [".avslor--straks.avslor--rekke > *", "straks+rekke, ledd"],
  [".avslor--rekke:not(.avslor--straks) > *", "rekke, ledd"],
  [".avslor--spor > *", "spor, innhold"],
  [".nokkeltall__verdi", "nøkkeltall, verdi"],
  [".nokkeltall__spor", "målestreken"],
];

const les = (sel) =>
  [...document.querySelectorAll(sel)].map((el) => {
    // Effektiv opasitet: alt som ligger over kan skjule elementet.
    let o = 1, n = el;
    while (n && n !== document.documentElement) {
      o *= Number(getComputedStyle(n).opacity);
      n = n.parentElement;
    }
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      op: +o.toFixed(3),
      b: Math.round(r.width),
      h: Math.round(r.height),
      syn: cs.visibility,
      disp: cs.display,
      tekst: (el.textContent || "").trim().slice(0, 28),
    };
  });

async function kjoer(navn, nettleser, opsjoner) {
  const b = await nettleser.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, ...opsjoner });
  await p.goto(url, { waitUntil: "load", timeout: 45000 });
  // Lenge nok til at hver tidsdrevet gest og hver reserve har rukket å kjøre.
  await p.waitForTimeout(3500);
  // Scroll gjennom hele siden, så de scroll-drevne gestene også har fått sjansen,
  // og tilbake – det er tilstanden etter at brukeren har vært innom.
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await p.evaluate((v) => scrollTo({ top: v, behavior: "instant" }), y);
    await p.waitForTimeout(90);
  }
  await p.waitForTimeout(700);

  console.log(`\n  ${navn}`);
  let verst = 1;
  for (const [sel, merke] of MAAL) {
    const rad = await p.evaluate(les, sel);
    if (!rad.length) { console.log(`    ${merke.padEnd(22)} – fantes ikke`); continue; }
    const minOp = Math.min(...rad.map((r) => r.op));
    const tomme = rad.filter((r) => r.b === 0 || r.h === 0).length;
    verst = Math.min(verst, minOp);
    const ok = minOp >= 0.99 && tomme === 0;
    console.log(
      `    ${merke.padEnd(22)} n=${String(rad.length).padStart(2)}  laveste effektive opasitet ${minOp.toFixed(3)}  ` +
      `nullstore ${tomme}  ${ok ? "SYNLIG" : "← IKKE SYNLIG"}`,
    );
  }
  console.log(`    → dårligste opasitet i hele tilstanden: ${verst.toFixed(3)}  ${verst >= 0.99 ? "OK" : "BRUDD"}`);
  await b.close();
}

await kjoer("1. normalt (Chromium)", chromium, {});
await kjoer("2. prefers-reduced-motion: reduce", chromium, { reducedMotion: "reduce" });
await kjoer("3. uten JavaScript", chromium, { javaScriptEnabled: false });
await kjoer("4. EKTE Firefox (ingen view())", firefox, {});
