/**
 * data-scroll-world – filmen som spoles av rullingen og forteller historien
 * (markup: src/components/wow/ScrollWorld.astro, historien: `film` i src/data/historie.ts).
 *
 * Tilpasset fra scroll-world/references/scrub-engine.js
 *   Copyright (c) oso95 (github.com/oso95/scroll-world), MIT-lisens.
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of this
 *   software, to deal in the Software without restriction, subject to the condition that the
 *   above copyright notice and this permission notice shall be included in all copies or
 *   substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY
 *   OF ANY KIND. (Full tekst: .claude/skills/scroll-world/LICENSE)
 *
 * Fra motoren: lasting etter nærhet, posteren under til klippet har tegnet (iOS), stillbilder ved
 * redusert bevegelse.
 *
 * Runde 7 (docs/design/rapporter/wow-r7-flyt.md): bildet kommer fra en `Kilde` i rullefilm.ts, som
 * hentes først når et klipp skal lastes. Der nettleseren har WebCodecs, dekodes ramene FØR de trengs
 * i et vindu rundt rulleposisjonen og tegnes på et lerret i samme bilde som teksten: ingen søking,
 * og baklengs koster det samme som forlengs. Ellers `<video>` og `currentTime`, én søking om gangen
 * (som før). Motoren kjenner ikke klippets lengde: antall ramer leses fra fila (spole.ts).
 *
 * Runde 4, historien C «Lampa» (docs/design/historie-manus.md del 5):
 *  - Segmenter av tre slag, hardt kutt i sømmene: klipp forover, klipp BAKLENGS (retning -1, andelen
 *    snus: p → 1 − p; prologen spoler dive-4 tilbake, og N2 trekker seg ut fra gata til pulten) og
 *    STILLBILDE som eget segment (heroen = siste ramme i dive-4, pulten), med zoom etter nøkkelpunkter
 *    (bare transform).
 *  - Én klokke. Rullingen gir t (skjermhøyder inn i filmen). tS følger t mykt i gsap.ticker, og alt
 *    tegnes fra tS: laget, klippets tid, linja på platen, gråtonen, lampa og målingene.
 *  - Fortellerlinjene står i ÉN plate, én om gangen (gammel ut 120 ms, ny inn 160 ms etter 120 ms).
 *    En «stille» linje tømmer platen mens målingene låser seg.
 *  - Lampa er frikoblet fra gråtonen. Hul ring = ikke målt. Fylt grønn med dato = målt, første gang
 *    i det den fjerde målingen låser seg på pulten. Den pulserer én gang (opasitet) ved linja som
 *    forklarer den. Telleren «N av 4» er fjernet.
 *  - Gråtonen gjelder i segmentenes `gra`-intervall: dykkene i bedriftene er grå til det grønne
 *    lyset, pulten fra stillheten til første hake. I et kutt byttes det straks, ellers toner CSS.
 *  - Lasting (revisor r4 #12): ingen klipp før første interaksjon. Til da står heroen (stillbilde).
 *  - Panelet blir rapporten (overgang.ts, hentes når filmen nærmer seg slutten).
 *
 * Runde 9 (docs/design/rapporter/wow-r9-bevegelse.md, manus v6 del 10): sømmene er datadrevet per
 * segment (som.ts). `som` 0 = hardt kutt (som før). `som` > 0 = kort krysstoning over sømmen: det nye
 * laget ligger over det gamle og tones inn, bare opasitet. `hold` = klippet står på én ramme mens
 * rullingen går videre (frysrammen i T6).
 *
 * Modus settes på seksjonen: data-sw-modus="film" | "stille".
 */
import { gsap, ScrollTrigger, html, MQ, alle, type Opprydding } from "./felles";
import { lenis } from "./lenis";
import type { Kilde } from "./rullefilm";
import { somVed, erKutt, holdKart } from "./som";

/** Samme spørring som MOBIL i ScrollWorld.astro (posterens <source media>). */
export const MOBIL_KLIPP = "(max-aspect-ratio: 4/5)";

/** Heroteksten er borte etter så mange skjermhøyder (12vh). */
const HERO_UT = 0.12;
/** Så langt glir heroteksten opp mens den går ut (vh). */
const HERO_LOFT = 6;
/** Mobil: bildet står så langt oppe (svh) i heroen, så motivet står over H1 (kritiker r4 #15).
 *  Samme verdi som i wow-bevegelse.css; glir ned på plass mens heroteksten går ut. */
const HERO_BILDE = 15;
/** Klipp lastes når de er så mange skjermhøyder unna. */
const NAER = 1.6;
/** Hvor fort tS følger rullingen, per ramme ved 60 bilder/s. */
const FOLG = 0.22;
/** Så langt går klippet videre mens kameraet «står stille» (andel av klippet, høyst). */
const RO_KLIPP = 0.05;
/** Sluttsløret: bunnen av filmen tones mot bakgrunnen de siste skjermhøydene. */
const SLUTT = 0.35;
/** overgang.ts hentes når filmen er så mange skjermhøyder fra slutten. */
const OVERGANG_NAER = 2.5;
/** Antall målinger på pulten (samme som radene i rapporten). */
const MAALINGER = 4;

interface Kart {
  g: number;
  p: number;
  r: number;
}

interface SegData {
  type: "klipp" | "still";
  klipp: string | null;
  klippM: string | null;
  vekt: number;
  retning: 1 | -1;
  kart: Kart | null;
  zoom: [number, number][] | null;
  gra: [number, number] | null;
  maal: [number, number] | null;
  poster: boolean;
  /** Bredden på sømmen ut av segmentet i skjermhøyder (0 eller mangler = hardt kutt). */
  som?: number;
  /** [ved, andel]: klippet står på rammen ved `ved` mens rullingen går `andel` av segmentet. */
  hold?: [number, number] | null;
}

interface LinjeData {
  s: number;
  ved: number;
  stille: boolean;
  puls: boolean;
}

interface Seg extends SegData {
  lag: HTMLElement;
  kilde: Kilde | null;
  /** Teller opp for hver lasting og slipp, så et sent svar fra en gammel lasting forkastes. */
  runde: number;
  laster: boolean;
  tegnet: boolean;
  start: number;
  slutt: number;
  vist: boolean;
  naer: boolean;
  zoomNa: string;
  /** Opasiteten laget har nå ("" = ikke satt av skriptet). */
  opNa: string;
}

const klem = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const myk = (x: number) => {
  x = klem(x);
  return x * x * (3 - 2 * x);
};
/** Kubisk Hermite på [0, 1] fra 0 til 1 med stigning a i start og b i slutt (normert). */
const hermite = (t: number, a: number, b: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return a * (t3 - 2 * t2 + t) + (3 * t2 - 2 * t3) + b * (t3 - t2);
};
/**
 * Klippkartet (kritiker r4 #3). u er andelen av rullingen i dykket, svaret andelen av klippet.
 *   [0, p]      kameraet går inn og bremser mot det grønne lyset (g), som nås nøyaktig ved p
 *   [p, p + r]  kameraet står nesten stille: klippet går bare d videre
 *   [p + r, 1]  kameraet går raskt ut mot sømmen
 * Monoton og kontinuerlig med samme stigning i skjøtene, så kameraet aldri rykker.
 */
export function kartKlipp(u: number, { g, p, r }: Kart): number {
  u = klem(u);
  const r2 = Math.min(r, 0.95 - p);
  const d = Math.min(RO_KLIPP, (1 - g) / 3);
  const ro = r2 > 0 ? d / r2 : 0;
  if (u <= p) {
    const sek = g / p;
    return g * hermite(u / p, 1.5, ro / sek);
  }
  if (u <= p + r2) return g + (u - p) * ro;
  const sek = (1 - g - d) / (1 - p - r2);
  return g + d + (1 - g - d) * hermite((u - p - r2) / (1 - p - r2), ro / sek, 1.5);
}

/** Lineært mellom nøkkelpunktene [andel, skala]. */
export function zoomVed(u: number, punkter: [number, number][]): number {
  if (!punkter.length) return 1;
  if (u <= punkter[0][0]) return punkter[0][1];
  for (let i = 1; i < punkter.length; i++) {
    const [a, za] = punkter[i - 1];
    const [b, zb] = punkter[i];
    if (u <= b) return za + (zb - za) * (b > a ? (u - a) / (b - a) : 1);
  }
  return punkter[punkter.length - 1][1];
}

/** Save-Data, satt av Intro.astro / FilmKlar.astro før første maling (html.wow-spar). */
export const sparData = () =>
  html.classList.contains("wow-spar") ||
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

function lesData(rot: HTMLElement): { segmenter: SegData[]; linjer: LinjeData[]; kapitler: number[] } {
  try {
    const d = JSON.parse(rot.dataset.scrollWorld || "{}");
    return { segmenter: d.segmenter ?? [], linjer: d.linjer ?? [], kapitler: d.kapitler ?? [] };
  } catch {
    return { segmenter: [], linjer: [], kapitler: [] };
  }
}

/** Skriver bare når verdien er ny (tegn() kjører hver ramme mens filmen beveger seg). */
const sett = (el: Element | null | undefined, attr: string, pa: boolean) => {
  if (el && el.hasAttribute(attr) !== pa) el.toggleAttribute(attr, pa);
};

function film(rot: HTMLElement): Opprydding {
  const { segmenter: data, linjer: linjeData } = lesData(rot);
  const lag = alle("[data-sw-lag]", rot);
  const heroTekst = rot.querySelector<HTMLElement>('[data-sw-kapittel="0"] [data-sw-tekst]');
  const slorHero = rot.querySelector<HTMLElement>("[data-sw-slor-hero]");
  const kolofonHero = rot.querySelector<HTMLElement>("[data-sw-kolofon-hero]");
  const plate = rot.querySelector<HTMLElement>("[data-sw-plate]");
  const lampe = rot.querySelector<HTMLElement>("[data-sw-lampe]");
  const linjeEl = alle("[data-sw-linje]", rot);
  const maalPanel = rot.querySelector<HTMLElement>("[data-sw-maalinger]");
  const maalRader = alle("[data-sw-maaling]", rot);
  const maalLinjer = maalRader.map((r) => r.querySelector<HTMLElement>("[data-sw-linje-maal]"));
  const maalHode = rot.querySelector<HTMLElement>("[data-sw-maal-hode]");
  const ramme = rot.querySelector<HTMLElement>(".sw__ramme");
  const lerret = rot.querySelector<HTMLElement>("[data-sw-lerret]");
  const gra = alle(".sw__gra", rot);
  const slutt = rot.querySelector<HTMLElement>("[data-sw-slutt]");
  const mobilMQ = matchMedia(MOBIL_KLIPP);
  const mobil = () => mobilMQ.matches;
  rot.dataset.swModus = "film";

  let off = 0;
  const seg: Seg[] = data.map((d, i) => {
    const s: Seg = {
      ...d,
      lag: lag[i],
      kilde: null,
      runde: 0,
      laster: false,
      tegnet: false,
      start: off,
      slutt: off + d.vekt,
      vist: i === 0,
      naer: false,
      zoomNa: "",
      opNa: "",
    };
    off += d.vekt;
    return s;
  });
  const W = off;
  // Sømmene: der segment i slutter, og bredden på krysstoningen etter det (0 = hardt kutt).
  const somSlutt = seg.map((s) => s.slutt);
  const somBredde = seg.map((s) => s.som ?? 0);
  // Dagens film har bare harde kutt: da søkes det ikke etter sømmer i det hele tatt.
  const harToning = somBredde.some((b) => b > 0);

  // Tidene i rulletid (skjermhøyder).
  const linjeTid = linjeData.map((l) => seg[l.s].start + seg[l.s].vekt * l.ved);
  const graTid = seg.filter((s) => s.gra).map((s) => [s.start + s.vekt * s.gra![0], s.start + s.vekt * s.gra![1]] as const);
  const maalS = seg.find((s) => s.maal);
  // Rad j fylles fra laas[j] til laas[j + 1]; lampa er målt fra laas[MAALINGER].
  const laas: number[] = [];
  if (maalS?.maal) {
    const [fra, til] = maalS.maal;
    for (let j = 0; j <= MAALINGER; j++) laas.push(maalS.start + maalS.vekt * (fra + ((til - fra) * j) / MAALINGER));
  }
  const maltFra = laas.length ? laas[MAALINGER] : Infinity;
  rot.dataset.swTider = JSON.stringify({ W, linjer: linjeTid, gra: graTid, laas, malt: Number.isFinite(maltFra) ? maltFra : null });

  let t = 0;
  let tS = 0;
  let lasting = false;
  let brukerKlar = false;
  let dod = false;
  const forrige = {
    hero: "",
    linje: -2,
    plate: false,
    gra: false,
    malt: false,
    maal: [] as string[],
    maalSynlig: false,
    slutt: "",
    hode: "",
  };

  // ── Klipp ────────────────────────────────────────────────────────────
  /** Andelen av klippet et segment står på, i avspillingsretningen. */
  const andel = (s: Seg, u: number) => {
    const a = s.hold ? holdKart(u, s.hold[0], s.hold[1]) : s.kart ? kartKlipp(u, s.kart) : klem(u);
    return s.retning === -1 ? 1 - a : a;
  };
  const maal = (s: Seg) => andel(s, (tS - s.start) / s.vekt);

  /** rullefilm.ts hentes først når et klipp skal lastes (etter første interaksjon). */
  let motor: Promise<typeof import("./rullefilm")> | null = null;

  function lastKlipp(s: Seg) {
    if (s.type !== "klipp" || s.laster || s.kilde) return;
    const url = mobil() ? s.klippM : s.klipp;
    if (!url) return;
    const runde = ++s.runde;
    s.laster = true;
    motor ??= import("./rullefilm");
    motor
      .then((m) => {
        if (dod || runde !== s.runde) return;
        s.laster = false;
        const lag = () =>
          m.lagKilde(url, s.lag, {
            mobil: mobil(),
            // Posteren skjules først når klippet har tegnet et bilde (iOS blinker svart ellers).
            forsteBilde() {
              if (dod || runde !== s.runde) return;
              s.tegnet = true;
              s.lag.setAttribute("data-har-klipp", "");
              tegn(true);
            },
            // WebCodecs ga opp (ustøttet fil, dekoderfeil, ingen Range): bytt til <video> for dette klippet.
            feil() {
              if (dod || runde !== s.runde) return;
              s.kilde?.slipp();
              s.tegnet = false;
              s.lag.removeAttribute("data-har-klipp");
              s.kilde = lag();
              if (brukerKlar) s.kilde.prim();
              tikkPa(true);
            },
          });
        s.kilde = lag();
        if (brukerKlar) s.kilde.prim();
        tikkPa(true);
      })
      .catch(() => {
        if (runde === s.runde) s.laster = false;
        motor = null;
      });
  }

  function slippKlipp(s: Seg) {
    s.runde++;
    s.laster = false;
    s.kilde?.slipp();
    s.kilde = null;
    s.tegnet = false;
    s.lag.removeAttribute("data-har-klipp");
  }

  function lastNaere() {
    if (!lasting) return;
    for (const s of seg) if (t > s.start - NAER && t < s.slutt + NAER) lastKlipp(s);
  }

  const slaaPaLasting = () => {
    if (lasting) return;
    lasting = true;
    lastNaere();
    tegn();
  };
  const forsteBeroring = () => {
    slaaPaLasting();
    if (brukerKlar) return;
    brukerKlar = true;
    // iOS: et dempet klipp må ha spilt én gang etter en berøring før det tegner spolte bilder (reserven).
    seg.forEach((s) => s.kilde?.prim());
  };
  const valg = { once: true, passive: true } as const;
  addEventListener("pointerdown", forsteBeroring, valg);
  addEventListener("touchstart", forsteBeroring, valg);
  addEventListener("wheel", slaaPaLasting, valg);
  addEventListener("keydown", slaaPaLasting, { once: true });

  // ── Platen: klippes til linja som vises, lampa står ved første linje ──
  function malPlate() {
    const l = linjeEl[forrige.linje];
    if (!plate || !l) return;
    const pr = plate.getBoundingClientRect();
    const lr = l.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(plate).paddingTop) || 0;
    plate.style.setProperty("--sw-klipp", `${Math.max(0, Math.round(lr.top - pr.top - pad))}px`);
    if (!lampe) return;
    const forste = (l.firstElementChild as HTMLElement | null) ?? l;
    const lh = parseFloat(getComputedStyle(forste).lineHeight) || forste.getBoundingClientRect().height;
    const rute = lampe.parentElement!.getBoundingClientRect();
    const y = lr.top - rute.top + (lh - lampe.offsetHeight) / 2;
    lampe.style.setProperty("--sw-lampe-y", `${Math.round(y)}px`);
  }
  const plateRO = plate ? new ResizeObserver(() => malPlate()) : null;
  if (plate) plateRO!.observe(plate);

  // ── Tegning, alt fra tS ──────────────────────────────────────────────
  let aktivLag = 0;
  function tegn(tving = false) {
    // Laget tS står i.
    let a = seg.length - 1;
    for (let i = 0; i < seg.length; i++) {
      if (tS < seg[i].slutt) {
        a = i;
        break;
      }
    }
    // Hardt kutt bare der sømmen er et kutt (eller vi hoppet over flere segmenter).
    const kutt = a !== aktivLag && (!harToning || erKutt(a, aktivLag, somBredde));
    aktivLag = a;
    // Krysstoning: i en søm med bredde står begge lagene, det nye (i + 1) over det gamle med
    // opasiteten p. Har det nye ikke noe å vise ennå (klipp uten tegnet bilde og uten poster),
    // er det ingen toning: da gjelder regelen under (forrige lag står til klippet har tegnet).
    let som = harToning ? somVed(tS, somSlutt, somBredde) : null;
    if (som) {
      const ny = seg[som.i + 1];
      if (ny.type === "klipp" && !ny.tegnet && !ny.poster) som = null;
    }
    // Lag innen NAER skjermhøyder slås på (display), så stillbildet hentes før det vises. Før første
    // interaksjon bare laget som vises: stillbildene til nabolagene skal ikke konkurrere med heroens
    // bilde (LCP) om linja ved første visning (revisor r7 P1-2).
    for (let i = 0; i < seg.length; i++) {
      const s = seg[i];
      if (!s.naer && (lasting || i === a) && tS > s.start - NAER && tS < s.slutt + NAER) {
        s.naer = true;
        s.lag.setAttribute("data-sw-naer", "");
      }
    }
    // Et klipp uten poster som ikke har tegnet ennå: forrige lag står under (det slutter på samme bilde).
    const under = seg[a].type === "klipp" && !seg[a].tegnet && !seg[a].poster ? a - 1 : -1;
    seg.forEach((s, i) => {
      const iSom = som !== null && (i === som.i || i === som.i + 1);
      const vis = i === a || i === under || iSom;
      if (vis !== s.vist || tving) {
        s.vist = vis;
        s.lag.style.visibility = vis ? "visible" : "hidden";
      }
      const op = !vis ? "0" : som !== null && i === som.i + 1 ? som.p.toFixed(3) : "1";
      if (op !== s.opNa || tving) s.lag.style.opacity = s.opNa = op;
      if (!vis) return;
      const u = klem((tS - s.start) / s.vekt);
      // Stillbilder: zoom etter nøkkelpunktene. Klipp uten tegnet bilde: posteren skyves sakte innover.
      const z = s.type === "still" ? zoomVed(u, s.zoom ?? []) : s.tegnet ? 1 : 1 + u * 0.08 * (s.retning === -1 ? 0 : 1);
      const zt = z.toFixed(4);
      if (zt !== s.zoomNa) s.lag.style.setProperty("--sw-zoom", (s.zoomNa = zt));
    });

    // Heroteksten glir opp og ut og er borte etter 12vh (kritiker r4 #9).
    const ut = myk(tS / HERO_UT);
    const heroOp = (1 - ut).toFixed(3);
    const heroNokkel = ut >= 1 ? "ute" : heroOp;
    if (heroNokkel !== forrige.hero) {
      forrige.hero = heroNokkel;
      if (heroTekst) {
        // Ingen visibility: lenker og feltet i heroen må kunne få fokus, så fokus kan rulle tilbake.
        heroTekst.style.opacity = ut >= 1 ? "0" : "";
        heroTekst.style.clipPath = ut > 0 ? `inset(-2rem 0 ${(ut * 100).toFixed(1)}% 0)` : "";
        heroTekst.style.transform = ut > 0 ? `translate3d(0, ${(-ut * HERO_LOFT).toFixed(2)}vh, 0)` : "";
        heroTekst.style.pointerEvents = ut < 0.5 ? "" : "none";
      }
      if (slorHero) slorHero.style.opacity = heroOp;
      if (kolofonHero) kolofonHero.style.opacity = heroOp;
      if (lerret && mobil()) lerret.style.transform = `translate3d(0, ${(-(1 - ut) * HERO_BILDE).toFixed(2)}svh, 0)`;
    }

    // Linja: den siste som har tatt over. Før den første, og i en «stille» linje, er platen tom.
    let li = -1;
    for (let j = 0; j < linjeTid.length; j++) if (tS >= linjeTid[j]) li = j;
    let endret = tving;
    if (li !== forrige.linje) {
      const fra = forrige.linje;
      forrige.linje = li;
      linjeEl.forEach((el, j) => {
        sett(el, "data-sw-aktiv", j === li);
        el.style.pointerEvents = j === li ? "" : "none";
      });
      // Lampa pulserer én gang ved linja som forklarer den (bare forover).
      if (li >= 0 && li > fra && linjeData[li].puls && lampe) {
        lampe.removeAttribute("data-puls");
        void lampe.offsetWidth;
        lampe.setAttribute("data-puls", "");
      }
      endret = true;
    }
    const plateVis = li >= 0 && !linjeData[li].stille && tS >= HERO_UT * 0.98;
    if (plateVis !== forrige.plate) {
      forrige.plate = plateVis;
      sett(plate, "data-synlig", plateVis);
    }

    // Gråtonen: uavhengig av lampa. I et kutt byttes det straks, ellers toner CSS.
    const graNa = graTid.some(([a0, b0]) => tS >= a0 && tS < b0);
    if (graNa !== forrige.gra || (kutt && graNa)) {
      if (kutt) {
        gra.forEach((el) => el.setAttribute("data-straks", ""));
        requestAnimationFrame(() => requestAnimationFrame(() => gra.forEach((el) => el.removeAttribute("data-straks"))));
      }
      forrige.gra = graNa;
      gra.forEach((el) => sett(el, "data-aktiv", graNa));
    }

    // Lampa: målt fra den fjerde haken. Begge veier.
    const malt = tS >= maltFra;
    if (malt !== forrige.malt) {
      forrige.malt = malt;
      sett(plate, "data-malt", malt);
      endret = true;
    }
    if (endret) malPlate();

    // Målingene på pulten: panelet kommer når den første linja begynner, linjen fylles med rullingen,
    // og raden låses når linjen er full. Panelet blir stående til filmen slipper (overgang.ts).
    if (laas.length) {
      const maalSynlig = tS >= laas[0] - 0.04;
      if (maalSynlig !== forrige.maalSynlig) {
        forrige.maalSynlig = maalSynlig;
        sett(maalPanel, "data-synlig", maalSynlig);
      }
      const hodeOp = (1 - myk((tS - (W - SLUTT)) / SLUTT)).toFixed(3);
      if (maalHode && hodeOp !== forrige.hode) maalHode.style.opacity = forrige.hode = hodeOp;
      maalRader.forEach((rad, j) => {
        const p = klem((tS - laas[j]) / (laas[j + 1] - laas[j]));
        const f = p.toFixed(3);
        if (f === forrige.maal[j]) return;
        forrige.maal[j] = f;
        const linje = maalLinjer[j];
        if (linje) linje.style.transform = `scaleX(${f})`;
        const last = f === "1.000";
        sett(rad, "data-last", last);
        sett(rad, "data-maaler", !last && f !== "0.000");
      });
    }

    if (tS > W - OVERGANG_NAER) lastOvergang();
    const sluttOp = myk((tS - (W - SLUTT)) / SLUTT).toFixed(3);
    if (slutt && sluttOp !== forrige.slutt) slutt.style.opacity = forrige.slutt = sluttOp;
  }

  // ── Takten ───────────────────────────────────────────────────────────
  let aktivSeksjon = true;
  function tikk() {
    const d = t - tS;
    if (d !== 0) {
      // Samme regel som `glatt` i spole.ts (testet der). Står her, så spole.ts ikke må lastes ved første visning.
      const f = 1 - Math.pow(1 - FOLG, gsap.ticker.deltaRatio(60));
      tS = Math.abs(d) < 0.0008 ? t : tS + d * f;
      tegn();
    }
    let ro = tS === t;
    for (let i = 0; i < seg.length; i++) {
      const s = seg[i];
      if (!s.kilde) continue;
      // Bare det aktive klippet og naboene holder dekoder og bilder; resten hviler.
      if (Math.abs(i - aktivLag) > 1) {
        s.kilde.hvil();
        continue;
      }
      if (!s.kilde.sett(klem(maal(s)), i === aktivLag)) ro = false;
    }
    if (!aktivSeksjon && ro) tikkPa(false);
  }

  let tikker = false;
  function tikkPa(pa: boolean) {
    if (pa === tikker) return;
    tikker = pa;
    if (pa) gsap.ticker.add(tikk);
    else gsap.ticker.remove(tikk);
  }

  const st = ScrollTrigger.create({
    trigger: rot,
    start: "top top",
    end: "bottom bottom",
    onUpdate(self) {
      t = self.progress * W;
      if (t > 0) slaaPaLasting();
      lastNaere();
      tikkPa(true);
    },
    onRefresh(self) {
      t = self.progress * W;
      tikkPa(true);
    },
    onToggle(self) {
      aktivSeksjon = self.isActive;
      if (aktivSeksjon) tikkPa(true);
    },
  });
  t = tS = st.progress * W;
  // Siden åpnet nede i filmen (gjenopprettet rulleposisjon): da er vi alt forbi heroen.
  if (t > 0) lasting = true;
  aktivSeksjon = st.isActive || st.progress === 0;
  tikkPa(true);

  // Tastatur: fokus i en linje som ikke vises (lenken i en H2), ruller dit linja står. Fokus i
  // heroen mens den er tont ut, ruller til toppen.
  const rullTil = (tid: number) => {
    const y = st.start + (klem(tid, 0, W) / W) * (st.end - st.start);
    const l = lenis();
    if (l) l.scrollTo(y, { immediate: true, force: true });
    else scrollTo(0, y);
    t = tS = klem(tid, 0, W);
    tegn();
  };
  const fokus = (e: FocusEvent) => {
    const mal = e.target as Element;
    const l = mal.closest<HTMLElement>("[data-sw-linje]");
    if (l) {
      const j = Number(l.dataset.swLinje);
      if (forrige.linje !== j) rullTil(linjeTid[j] + 0.02);
      return;
    }
    if (mal.closest('[data-sw-kapittel="0"] [data-sw-tekst]') && tS > HERO_UT * 0.1) rullTil(0);
  };
  rot.addEventListener("focusin", fokus);

  const byttRetning = () => {
    forrige.hero = "";
    if (lerret && !mobil()) lerret.style.transform = "";
    seg.forEach(slippKlipp);
    lastNaere();
    tegn(true);
  };
  mobilMQ.addEventListener("change", byttRetning);

  // ── Panelet blir rapporten (overgang.ts, hentes når filmen nærmer seg slutten) ──
  let rydOvergangFn: Opprydding | void;
  let lasterOvergang = false;
  function lastOvergang() {
    if (lasterOvergang || !maalPanel || !ramme || !document.querySelector("[data-sw-rapport]")) return;
    lasterOvergang = true;
    void import("./overgang").then((m) => {
      if (dod) return;
      rydOvergangFn = m.startOvergang(maalPanel, ramme, () => st.end);
    });
  }

  tegn(true);

  return () => {
    dod = true;
    plateRO?.disconnect();
    plate?.style.removeProperty("--sw-klipp");
    st.kill();
    tikkPa(false);
    mobilMQ.removeEventListener("change", byttRetning);
    rot.removeEventListener("focusin", fokus);
    removeEventListener("pointerdown", forsteBeroring);
    removeEventListener("touchstart", forsteBeroring);
    removeEventListener("wheel", slaaPaLasting);
    removeEventListener("keydown", slaaPaLasting);
    seg.forEach((s) => {
      slippKlipp(s);
      s.lag.style.removeProperty("opacity");
      s.lag.style.removeProperty("visibility");
      s.lag.style.removeProperty("--sw-zoom");
      s.lag.removeAttribute("data-sw-naer");
    });
    if (heroTekst) heroTekst.style.opacity = heroTekst.style.pointerEvents = heroTekst.style.transform = heroTekst.style.clipPath = "";
    gra.forEach((el) => {
      el.removeAttribute("data-aktiv");
      el.removeAttribute("data-straks");
    });
    if (slutt) slutt.style.opacity = "";
    if (lerret) lerret.style.transform = "";
    if (maalHode) maalHode.style.opacity = "";
    rydOvergangFn?.();
    delete rot.dataset.swTider;
    if (slorHero) slorHero.style.opacity = "";
    if (kolofonHero) kolofonHero.style.opacity = "";
    linjeEl.forEach((el) => {
      el.removeAttribute("data-sw-aktiv");
      el.style.pointerEvents = "";
    });
    lampe?.removeAttribute("data-puls");
    maalRader.forEach((r, j) => {
      r.removeAttribute("data-last");
      r.removeAttribute("data-maaler");
      const l = maalLinjer[j];
      if (l) l.style.transform = "";
    });
    [plate, maalPanel].forEach((el) => {
      el?.removeAttribute("data-synlig");
      el?.removeAttribute("data-malt");
    });
    delete rot.dataset.swModus;
  };
}

/** Stillbilder: ingen video, ingen skript-styrt tilstand (redusert bevegelse og Save-Data). */
function stille(rot: HTMLElement): Opprydding {
  rot.dataset.swModus = "stille";
  return () => {
    delete rot.dataset.swModus;
  };
}

/**
 * @param full true når brukeren ikke har bedt om redusert bevegelse. Film bare hvis i tillegg
 *             Save-Data er av og CSS-en har startet i filmoppsettet (html.wow-js).
 */
export function startScrollWorld(full: boolean): Opprydding | void {
  const rotter = alle("[data-scroll-world]");
  if (!rotter.length) return;
  const filmen = full && !sparData() && html.classList.contains("wow-js") && matchMedia(MQ.full).matches;
  const rydd = rotter.map((r) => (filmen ? film(r) : stille(r)));
  return () => rydd.forEach((f) => f());
}
