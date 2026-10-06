import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const URL = "http://127.0.0.1:4399/lab/interaksjon";
const b = await chromium.launch();

/* ---- uten JavaScript ---- */
const u = await b.newContext({ viewport: { width: 1440, height: 950 }, colorScheme: "dark", javaScriptEnabled: false });
const pu = await u.newPage();
await pu.goto(URL, { waitUntil: "domcontentloaded" });
const utenJs = await pu.evaluate(() => ({
  stabelLag: document.querySelectorAll("[data-stabel] .stabel__plate").length,
  stabelNavn: [...document.querySelectorAll("[data-stabel] .stabel__navn")].map((e) => e.textContent.trim()),
  kontrollSkjult: getComputedStyle(document.querySelector("[data-stabel] .stabel__kontroll")).display,
  slepPaneler: document.querySelectorAll("[data-slep] .slep__panel").length,
  slepVerdier: [...document.querySelectorAll("[data-slep] .slep__verdi")].map((e) => e.textContent.trim()),
  kort: document.querySelectorAll("[data-pekerkort]").length,
}));
await pu.screenshot({ path: ".skudd/k1-uten-js.png", fullPage: false });
await u.close();

/* ---- redusert bevegelse ---- */
const r = await b.newContext({ viewport: { width: 1440, height: 950 }, colorScheme: "dark", reducedMotion: "reduce" });
const pr = await r.newPage();
await pr.goto(URL, { waitUntil: "networkidle" });
await pr.waitForTimeout(500);
await pr.locator("[data-stabel] .spak").first().focus();
for (let i = 0; i < 20; i++) await pr.keyboard.press("ArrowRight");
const rm = await pr.evaluate(() => {
  const rot = document.querySelector("[data-stabel]");
  const kort = document.querySelector("[data-pekerkort]");
  return {
    aEtterTastatur: getComputedStyle(rot).getPropertyValue("--a").trim(),
    plateTransition: getComputedStyle(rot.querySelector(".stabel__plate")).transitionDuration,
    kortTransform: getComputedStyle(kort).transform,
  };
});
await pr.screenshot({ path: ".skudd/k2-redusert.png" });
await r.close();

/* ---- fokus synlig ---- */
const f = await b.newContext({ viewport: { width: 1440, height: 950 }, colorScheme: "dark" });
const pf = await f.newPage();
await pf.goto(URL, { waitUntil: "networkidle" });
await pf.waitForTimeout(400);
await pf.locator("[data-stabel] .spak").first().focus();
const spakBoks = await pf.locator("[data-stabel] .spak").first().boundingBox();
await pf.screenshot({ path: ".skudd/k3-fokus.png", clip: { x: spakBoks.x - 12, y: spakBoks.y - 12, width: spakBoks.width + 24, height: spakBoks.height + 24 } });
const fokusRing = await pf.evaluate(() => {
  const e = document.querySelector("[data-stabel] .spak");
  e.focus();
  const cs = getComputedStyle(e);
  return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle };
});

/* ---- kontrast: etiketter i stabelen mot det som faktisk males ---- */
await pf.evaluate(() => document.querySelector("[data-stabel]").style.setProperty("--a", "1"));
await pf.waitForTimeout(400);
const kon = await pf.evaluate(() => {
  const t = document.querySelector("[data-stabel] .stabel__navn");
  t.scrollIntoView({ block: "center" });
  return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const rr = t.getBoundingClientRect();
    const farge = getComputedStyle(t).color;
    // Gjør teksten gjennomsiktig i stedet for å skjule den: skjuling fjerner
    // også flaten den står på, og da måler man feil bakgrunn.
    for (const e of document.querySelectorAll("[data-stabel] .stabel__navn,[data-stabel] .stabel__detalj,[data-stabel] .stabel__nr"))
      e.style.color = "transparent";
    res({ farge, x: rr.x, y: rr.y, w: rr.width, h: rr.height, dpr: window.devicePixelRatio });
  })));
});
await pf.waitForTimeout(300);
const png = PNG.sync.read(await pf.screenshot());
const k = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (r2, g, b2) => 0.2126 * k(r2) + 0.7152 * k(g) + 0.0722 * k(b2);
const m = kon.farge.match(/\d+/g).map(Number);
const lt = L(m[0], m[1], m[2]);
let verst = Infinity, rgb = null;
const d = kon.dpr;
for (let y = Math.round(kon.y * d); y < Math.round((kon.y + kon.h) * d); y++)
  for (let x = Math.round(kon.x * d); x < Math.round((kon.x + kon.w) * d); x++) {
    const i = (png.width * y + x) << 2;
    const lb = L(png.data[i], png.data[i + 1], png.data[i + 2]);
    const c = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
    if (c < verst) { verst = c; rgb = [png.data[i], png.data[i + 1], png.data[i + 2]]; }
  }
await f.close();
await b.close();

console.log(JSON.stringify({ utenJs, redusertBevegelse: rm, fokusRing, kontrast: { verdi: +verst.toFixed(2), bakgrunn: rgb, dpr: d } }, null, 1));
