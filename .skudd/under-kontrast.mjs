/**
 * Måler kontrasten mellom tekst og den LYSESTE bakgrunnspikselen bak den,
 * inne i en scenefilm-ramme. .skudd/herokontrast.mjs er låst til forsidens
 * .hero og port 4777, så den kan ikke brukes her.
 *
 *   node underkontrast.mjs <url>
 *
 * Metoden: skjul teksten, fotografer rammen, finn den lyseste piksel i
 * tekstens rektangel, og regn WCAG-kontrast mot tekstfargen slik den faktisk
 * er beregnet (ikke antatt).
 */
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";

const url = process.argv[2];
if (!url) { console.error("Bruk: node underkontrast.mjs <url>"); process.exit(1); }

const lum = (r, g, b) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);

const b = await chromium.launch();
let verst = { k: Infinity };

for (const [merke, w, h] of [["desktop", 1440, 900], ["bred", 1680, 1000], ["mobil", 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: "dark" });
  await p.goto(url, { waitUntil: "networkidle" });
  // Scenefilmen lastes først når rammen nærmer seg skjermen.
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1200);

  const rammer = await p.locator(".scenefilm-ramme").count();
  if (!rammer) { console.log(`${merke}: ingen scenefilm-ramme`); await p.close(); continue; }

  for (let i = 0; i < rammer; i++) {
    const ramme = p.locator(".scenefilm-ramme").nth(i);
    await ramme.scrollIntoViewIfNeeded();
    await p.waitForTimeout(900);

    // Alle tekstbærende elementer inne i rammen.
    const maal = await ramme.locator("h2, h3, p, dt, dd, li").all();
    for (const el of maal) {
      if (!(await el.isVisible())) continue;
      const info = await el.evaluate((n, _) => {
        const r = n.getBoundingClientRect();
        if (r.width < 40 || r.height < 8) return null;
        return { x: r.x, y: r.y, w: r.width, h: r.height, farge: getComputedStyle(n).color, tekst: (n.textContent || "").trim().slice(0, 28) };
      });
      if (!info) continue;

      const rr = await ramme.evaluate((n) => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y }; });
      // Gjør BARE glyffene usynlige, og la alle bakgrunner stå.
      //
      // Første versjon satte visibility:hidden på hele <section>. Da forsvant
      // også kortflatene (.card har background: var(--bg-raised)), og målingen
      // leste filmen BAK kortet i stedet for flaten teksten faktisk ligger på.
      // Den feilen ga 1,03:1 på /systemer, en side som er målt til 15,58:1 og
      // er fullt lesbar. Et falskt AA-brudd er like ødeleggende som et ekte,
      // fordi det sender en til å «rette» noe som ikke er galt.
      await el.evaluate((n) => {
        n.dataset.maalt = "1";
        const st = document.createElement("style");
        st.id = "maalestil";
        st.textContent = '[data-maalt="1"], [data-maalt="1"] * { color: transparent !important; text-shadow: none !important; -webkit-text-fill-color: transparent !important; }';
        document.head.appendChild(st);
      });
      await p.waitForTimeout(120);
      let png;
      try { png = await ramme.screenshot({ timeout: 8000 }); }
      catch { png = null; }
      await el.evaluate((n) => {
        delete n.dataset.maalt;
        document.getElementById("maalestil")?.remove();
      });
      if (!png) continue;

      const im = PNG.sync.read(png);
      const sx = Math.max(0, Math.round(info.x - rr.x)), sy = Math.max(0, Math.round(info.y - rr.y));
      const ex = Math.min(im.width, Math.round(info.x - rr.x + info.w)), ey = Math.min(im.height, Math.round(info.y - rr.y + info.h));
      let maks = -1;
      for (let y = sy; y < ey; y++) for (let x = sx; x < ex; x++) {
        const k = (im.width * y + x) << 2;
        maks = Math.max(maks, lum(im.data[k], im.data[k + 1], im.data[k + 2]));
      }
      if (maks < 0) continue;
      const [tr, tg, tb] = parse(info.farge);
      const Lt = lum(tr, tg, tb);
      const k = (Math.max(Lt, maks) + 0.05) / (Math.min(Lt, maks) + 0.05);
      if (k < verst.k) verst = { k, merke, tekst: info.tekst, farge: info.farge };
    }
  }
  await p.close();
}
await b.close();
if (verst.k === Infinity) console.log("fant ingen tekst å måle");
else console.log(`verste: %s:1 (%s, «%s», %s) -> %s`, verst.k.toFixed(2), verst.merke, verst.tekst, verst.farge, verst.k >= 4.5 ? "BESTÅTT" : "STRYKER");
