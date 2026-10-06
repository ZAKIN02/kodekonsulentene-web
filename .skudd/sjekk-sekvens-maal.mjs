/**
 * Måler SjekkSekvens på de tre tingene som faktisk kan være feil:
 *
 *  1. BEVEGELSE I RO. Vinduet fotograferes hvert halve sekund i 12 s UTEN at
 *     noen scroller. Det var den målte forskjellen mot referansene: siden vår
 *     beveget seg bare når noen gjorde noe.
 *  2. KONTRAST PÅ FAKTISK MALTE PIKSLER, i begge temaer. Ikke computed style
 *     alene – all tekst i panelet skjules, flaten fotograferes, og hver
 *     tekstfarge måles mot den verste pikselen i sin egen boks. Tekst med
 *     gjennomsiktig farge (rgba(0,0,0,0)) hoppes over: leses den som svart, får
 *     man falske brudd. Det har skjedd her før.
 *  3. DEGRADERING. prefers-reduced-motion og uten JavaScript: er alt synlig?
 *     Et element som bare blir stående skjult feiler ikke synlig noe sted.
 *
 * Bruk: node .skudd/sjekk-sekvens-maal.mjs [url]
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://127.0.0.1:4411/sjekk";
const PANEL = "[data-sjekk-sekvens] [data-kjor], [data-sjekk-sekvens] .sjs__panel";
mkdirSync(".skudd/sjs-maal", { recursive: true });

const kanal = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
const kon = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const b = await chromium.launch();

/* ------------------------------------------------- 1. bevegelse i ro ---- */
{
  const s = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  await s.goto(url, { waitUntil: "domcontentloaded" });
  const rammer = [];
  const t0 = Date.now();
  for (let i = 0; i < 25; i++) {
    rammer.push([Date.now() - t0, await s.screenshot()]);
    await s.waitForTimeout(500 - ((Date.now() - t0) % 500));
  }
  const scrollet = await s.evaluate(() => window.scrollY);
  console.log(`\n  BEVEGELSE I RO (scrollY = ${scrollet} hele veien)`);
  let bevegde = 0;
  for (let i = 1; i < rammer.length; i++) {
    const a = PNG.sync.read(rammer[i - 1][1]);
    const c = PNG.sync.read(rammer[i][1]);
    let sum = 0;
    let n = 0;
    for (let p = 0; p < a.data.length; p += 4 * 37) {
      sum += Math.abs(a.data[p] - c.data[p]) + Math.abs(a.data[p + 1] - c.data[p + 1]) + Math.abs(a.data[p + 2] - c.data[p + 2]);
      n += 3;
    }
    const snitt = sum / n;
    if (snitt > 0.02) bevegde++;
    const merke = snitt > 0.02 ? "  ← beveger seg" : "";
    console.log(`    ${String((rammer[i][0] / 1000).toFixed(1)).padStart(5)}s  ${snitt.toFixed(4).padStart(9)}${merke}`);
  }
  console.log(`    ${bevegde} av ${rammer.length - 1} intervaller har bevegelse, uten en eneste scroll.`);
  await s.close();
}

/* ------------------------------------------------------- 2. kontrast ---- */
for (const tema of ["dark", "light"]) {
  const s = await b.newPage({
    viewport: { width: 1440, height: 1600 },
    colorScheme: tema,
    reducedMotion: "reduce", // hviletilstanden, der alt er synlig og ingenting er midt i en innton
  });
  await s.goto(url, { waitUntil: "networkidle" });
  await s.evaluate((t) => (document.documentElement.dataset.theme = t), tema);
  await s.waitForTimeout(500);

  // Hele figuren, ikke bare panelet: figurteksten under står på sidens egen
  // flate og BYTTER med temaet. Den er den eneste delen som kan ryke i lyst tema.
  const panel = s.locator("[data-sjekk-sekvens]").first();
  await panel.scrollIntoViewIfNeeded();
  await s.waitForTimeout(400);

  const tekster = await panel.evaluate((el) => {
    /** Første ugjennomsiktige flate fra elementet og oppover, eller null. */
    const opakBak = (n) => {
      let p = n;
      while (p && p !== document.body) {
        const bg = getComputedStyle(p).backgroundColor;
        const m = bg.match(/-?\d*\.?\d+/g);
        if (m && (m.length < 4 || Number(m[3]) >= 0.99)) return bg;
        p = p.parentElement;
      }
      return null;
    };
    const ut = [];
    const gaa = (n) => {
      for (const barn of n.children) {
        const egen = [...barn.childNodes].some((k) => k.nodeType === 3 && k.textContent.trim());
        if (egen) {
          const cs = getComputedStyle(barn);
          const r = barn.getBoundingClientRect();
          // Gjennomsiktig farge er IKKE svart tekst. Leses den som svart, får man
          // falske brudd – nøyaktig fellen vi gikk i tidligere i dag.
          const alfa = cs.color.match(/-?\d*\.?\d+/g);
          const synlig = !(alfa && alfa.length === 4 && Number(alfa[3]) < 0.1);
          if (r.width > 1 && r.height > 1 && synlig) {
            ut.push({
              tekst: barn.textContent.trim().slice(0, 34),
              farge: cs.color,
              px: parseFloat(cs.fontSize),
              fet: Number(cs.fontWeight) >= 700,
              boks: { x: r.x, y: r.y, w: r.width, h: r.height },
              // Står teksten PÅ en ugjennomsiktig flate, er kontrasten gitt av den
              // fargen. Pikselmåling er da feil verktøy: for å fotografere
              // bakgrunnen må teksten skjules, og da forsvinner flaten den står
              // på med den. Det ga «Kjør sjekken» 1,04:1 – knappen ble skjult
              // sammen med teksten sin, og panelet bak ble målt i stedet.
              opak: opakBak(barn),
            });
          }
        }
        gaa(barn);
      }
    };
    gaa(el);
    return ut;
  });

  // Skjul all tekst i panelet, fotografer flaten bak.
  await panel.evaluate((el) => {
    for (const n of el.querySelectorAll("*")) {
      if ([...n.childNodes].some((k) => k.nodeType === 3 && k.textContent.trim())) {
        n.dataset.skjult = "1";
        n.style.visibility = "hidden";
      }
    }
  });
  await s.waitForTimeout(250);
  const png = PNG.sync.read(await s.screenshot());
  await panel.evaluate((el) => {
    for (const n of el.querySelectorAll("[data-skjult]")) {
      n.style.visibility = "";
      delete n.dataset.skjult;
    }
  });

  const dpr = png.width / (await s.evaluate(() => innerWidth));
  const funn = [];
  for (const t of tekster) {
    const [tr, tg, tb] = t.farge.match(/-?\d+/g).map(Number);
    const lt = lum(tr, tg, tb);
    const stor0 = t.px >= 24 || (t.px >= 18.66 && t.fet);
    if (t.opak) {
      const [br, bg2, bb] = t.opak.match(/-?\d+/g).map(Number);
      funn.push({ ...t, k: kon(lt, lum(br, bg2, bb)), krav: stor0 ? 3 : 4.5, bak: [br, bg2, bb], kilde: "flate" });
      continue;
    }
    const x0 = Math.max(0, Math.round(t.boks.x * dpr));
    const y0 = Math.max(0, Math.round(t.boks.y * dpr));
    const x1 = Math.min(png.width, Math.round((t.boks.x + t.boks.w) * dpr));
    const y1 = Math.min(png.height, Math.round((t.boks.y + t.boks.h) * dpr));
    if (x1 <= x0 || y1 <= y0) continue;
    let verst = Infinity;
    let verstRgb = [0, 0, 0];
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (png.width * y + x) << 2;
        const k = kon(lt, lum(png.data[i], png.data[i + 1], png.data[i + 2]));
        if (k < verst) { verst = k; verstRgb = [png.data[i], png.data[i + 1], png.data[i + 2]]; }
      }
    }
    // WCAG: 3:1 for stor tekst (18,66px fet eller 24px), ellers 4,5:1.
    funn.push({ ...t, k: verst, krav: stor0 ? 3 : 4.5, bak: verstRgb, kilde: "piksler" });
  }
  funn.sort((a, c) => a.k - c.k);
  const brudd = funn.filter((f) => f.k < f.krav);
  console.log(`\n  KONTRAST, tema ${tema} – ${funn.length} tekstnoder i panelet`);
  for (const f of funn.slice(0, 8)) {
    console.log(
      `    ${f.k.toFixed(2).padStart(6)}:1 (krav ${f.krav}, ${f.kilde})  ${f.px}px  ${f.farge} på rgb(${f.bak.join(",")})  «${f.tekst}»`,
    );
  }
  console.log(`    ${brudd.length} brudd.`);
  await s.close();
}

/* ---------------------------------------------------- 3. degradering ---- */
for (const [navn, opts, vent, slettKjor] of [
  // Redusert bevegelse: ingen animasjon kjører i det hele tatt.
  ["redusert-bevegelse", { reducedMotion: "reduce" }, 1500, false],
  // Uten JavaScript kjører CSS-sekvensen som normalt, så her må vi vente til den
  // er ferdig. Måler man etter 1,5 s, melder den 23 skjulte elementer – og det er
  // bare sekvensen midt i akt 1.
  ["uten-js", { javaScriptEnabled: false }, 13000, false],
  // Verste tilfelle: animasjonene blir aldri anvendt. Da skal den statiske CSS-en
  // alene vise alt. Et element som bare blir stående skjult feiler ikke synlig
  // noe sted, så dette er tilfellet som må sjekkes eksplisitt.
  ["uten-animasjon", {}, 800, true],
]) {
  const s = await b.newPage({ viewport: { width: 1440, height: 1600 }, colorScheme: "dark", ...opts });
  await s.goto(url, { waitUntil: opts.javaScriptEnabled === false ? "domcontentloaded" : "networkidle" });
  if (slettKjor) await s.evaluate(() => document.querySelectorAll("[data-kjor]").forEach((n) => n.removeAttribute("data-kjor")));
  await s.waitForTimeout(vent);
  const panel = s.locator(PANEL).first();
  await panel.scrollIntoViewIfNeeded();
  await s.waitForTimeout(300);

  const skjulte = await panel.evaluate((el) => {
    const ut = [];
    for (const n of el.querySelectorAll("*")) {
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      const harTekst = [...n.childNodes].some((k) => k.nodeType === 3 && k.textContent.trim());
      if (Number(cs.opacity) < 0.95 || cs.visibility === "hidden" || cs.display === "none" || (harTekst && r.height < 1)) {
        ut.push(`${n.className || n.tagName} opacity=${cs.opacity} vis=${cs.visibility} h=${Math.round(r.height)} «${(n.textContent || "").trim().slice(0, 24)}»`);
      }
    }
    return ut;
  });
  await panel.screenshot({ path: `.skudd/sjs-maal/${navn}.png` });
  console.log(`\n  DEGRADERING – ${navn}`);
  console.log(`    ${skjulte.length} elementer under full opasitet/synlighet:`);
  for (const r of skjulte.slice(0, 10)) console.log(`      ${r}`);
  await s.close();
}

await b.close();
