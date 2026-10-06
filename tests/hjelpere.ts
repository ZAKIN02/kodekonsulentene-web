import type { Page, Locator } from "@playwright/test";
import { PNG } from "pngjs";

/* ------------------------------------------------------------- feillytting ---- */

export interface Lytter {
  feil: string[];
  cspBrudd: string[];
}

/**
 * Fanger alt nettleseren klager på. CSP-brudd skilles ut fordi de er den stilleste
 * feilklassen vi har: skriptet kjører aldri, ingenting kaster, siden ser ferdig ut.
 */
export function lyttEtterFeil(page: Page): Lytter {
  const l: Lytter = { feil: [], cspBrudd: [] };
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/content security policy/i.test(t)) l.cspBrudd.push(t);
    else l.feil.push(t);
  });
  page.on("pageerror", (e) => l.feil.push(`pageerror: ${e.message}`));
  return l;
}

/* ----------------------------------------------------------------- kontrast ---- */

const kanal = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export const luminans = (r: number, g: number, b: number) =>
  0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);

export const kontrast = (a: number, b: number) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Plukker ut rgb fra en computed color-streng, f.eks. "rgb(154, 164, 174)". */
export function parseRgb(s: string): [number, number, number] {
  const m = s.match(/-?\d+(\.\d+)?/g);
  if (!m || m.length < 3) return [255, 255, 255];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

export interface KontrastFunn {
  kontrast: number;
  tekstFarge: string;
  verstRgb: [number, number, number];
  punkt: { x: number; y: number };
}

/**
 * Måler faktisk malt bakgrunn bak et tekstelement.
 *
 * To fallgruver dette unngår, begge påført oss selv:
 *  1. `boundingBox()` er viewport-relativ mens `page.screenshot({clip})` bruker
 *     sidekoordinater. Blandes de, klippes feil område ut og målingen gir samme
 *     svar uansett hva CSS-en sier. Derfor elementskudd av beholderen.
 *  2. Et slør med `position: static` havner UNDER et bilde som har opacity < 1,
 *     fordi opacity lager et nytt malelag. Sløret så riktig ut i DOM-en og malte
 *     ingenting. Bare piksler avslører det.
 */
export async function maalKontrast(
  page: Page,
  beholder: string,
  tekst: string,
): Promise<KontrastFunn | null> {
  const b: Locator = page.locator(beholder).first();
  const t: Locator = page.locator(tekst).first();
  if ((await b.count()) === 0 || (await t.count()) === 0) return null;
  if (!(await t.isVisible())) return null;

  // Rull målet midt i bildet først. Seksjoner med sticky medie er flere tusen
  // piksler høye, og et elementskudd av dem rendrer det sticky laget på feil
  // sted. Derfor måles alt i viewport-rommet: `page.screenshot()` uten fullPage
  // og `boundingBox()` bruker samme koordinatsystem.
  await t.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const farge = await t.evaluate((el) => getComputedStyle(el as HTMLElement).color);
  const boks = await t.boundingBox();
  if (!boks || boks.width < 2 || boks.height < 2) return null;

  // Ligger teksten på en UGJENNOMSIKTIG flate, er kontrasten gitt av den fargen,
  // og pikselmåling er både unødvendig og upålitelig: for å fotografere bakgrunnen
  // må teksten skjules, og da kan flaten den står på forsvinne med den.
  // Pikselmåling trengs bare når hele kjeden opp til beholderen er gjennomsiktig,
  // altså når teksten faktisk ligger rett på video eller bilde.
  const opakBak = await t.evaluate((el) => {
    let n: HTMLElement | null = el as HTMLElement;
    while (n && n !== document.body) {
      const bg = getComputedStyle(n).backgroundColor;
      const m = bg.match(/-?\d*\.?\d+/g);
      if (m && (m.length < 4 || Number(m[3]) >= 0.99) && !/rgba?\(0, 0, 0, 0\)/.test(bg)) return bg;
      n = n.parentElement;
    }
    return null;
  });
  if (opakBak) {
    const [br, bgG, bb] = parseRgb(opakBak);
    const [tr2, tg2, tb2] = parseRgb(farge);
    return {
      kontrast: kontrast(luminans(tr2, tg2, tb2), luminans(br, bgG, bb)),
      tekstFarge: farge,
      verstRgb: [br, bgG, bb],
      punkt: { x: Math.round(boks.x), y: Math.round(boks.y) },
    };
  }

  // All tekst i beholderen skjules, ikke bare målelementet: på mobil stables
  // elementene, og målboksen overlappet nabotekst. Da måler man tekst mot tekst
  // og får 1,00:1. Media og slør står igjen, så det vi fotograferer er nøyaktig
  // det som males bak teksten.
  await page.evaluate(
    (beholder) => {
      const bEl = document.querySelector(beholder);
      if (!bEl) return;
      const TEKST = "h1,h2,h3,h4,h5,h6,p,a,span,li,button,label,strong,em,small,figcaption,time,code";
      for (const el of bEl.querySelectorAll<HTMLElement>(TEKST)) {
        el.dataset.qaSkjult = "1";
        el.style.visibility = "hidden";
      }
    },
    beholder,
  );
  await page.waitForTimeout(200);

  const png = await page.screenshot();

  await page.evaluate(() => {
    for (const el of document.querySelectorAll<HTMLElement>("[data-qa-skjult]")) {
      el.style.visibility = "";
      delete el.dataset.qaSkjult;
    }
  });

  const im = PNG.sync.read(png);
  const [tr, tg, tb] = parseRgb(farge);
  const lTekst = luminans(tr, tg, tb);

  // Skjermbildet er i ENHETSPIKSLER, boundingBox er i CSS-piksler. På Pixel 7 er
  // forholdet 2,625, så uten denne skaleringen indekserte vi et 1082 px bredt
  // bilde med koordinater fra et 412 px bredt rutenett – og målte et helt annet
  // sted på siden. Derfor feilet bare mobil, aldri desktop der forholdet er 1.
  const dpr = im.width / (await page.evaluate(() => window.innerWidth));
  const x0 = Math.max(0, Math.round(boks.x * dpr));
  const y0 = Math.max(0, Math.round(boks.y * dpr));
  const x1 = Math.min(im.width, Math.round((boks.x + boks.width) * dpr));
  const y1 = Math.min(im.height, Math.round((boks.y + boks.height) * dpr));
  if (x1 <= x0 || y1 <= y0) return null;

  let verstK = Infinity;
  let verstRgb: [number, number, number] = [0, 0, 0];
  let punkt = { x: x0, y: y0 };
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (im.width * y + x) << 2;
      const k = kontrast(lTekst, luminans(im.data[i], im.data[i + 1], im.data[i + 2]));
      if (k < verstK) {
        verstK = k;
        verstRgb = [im.data[i], im.data[i + 1], im.data[i + 2]];
        punkt = { x, y };
      }
    }
  }
  return { kontrast: verstK, tekstFarge: farge, verstRgb, punkt };
}

/* -------------------------------------------------------------------- video ---- */

export interface VideoTilstand {
  src: string;
  readyState: number;
  duration: number;
  seekbarTil: number;
  currentTime: number;
}

export async function videoTilstander(page: Page): Promise<VideoTilstand[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll("video")].map((v) => ({
      src: v.currentSrc || v.querySelector("source")?.getAttribute("src") || "",
      readyState: v.readyState,
      duration: Number.isFinite(v.duration) ? v.duration : 0,
      seekbarTil: v.seekable.length ? v.seekable.end(v.seekable.length - 1) : 0,
      currentTime: v.currentTime,
    })),
  );
}

/** Scroller sakte gjennom hele siden så alle lazy-ressurser rekker å starte. */
export async function scrollGjennom(page: Page, steg = 12): Promise<void> {
  const hoyde = await page.evaluate(() => document.documentElement.scrollHeight);
  const vindu = await page.evaluate(() => window.innerHeight);
  for (let i = 0; i <= steg; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), ((hoyde - vindu) * i) / steg);
    await page.waitForTimeout(220);
  }
}
