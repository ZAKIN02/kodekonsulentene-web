/**
 * data-kapittel – kapittelklippet som toppbilde på undersidene (markup: src/components/wow/Kapittel.astro,
 * plan: docs/design/wow-undersider.md del 2.3, kontrakt: docs/design/bevegelse.md «Kapittel»).
 *
 * Hentes dynamisk av index.ts bare når siden har [data-kapittel]. Bruker ikke GSAP. Rullingen
 * leses fra vinduet (Lenis ruller vinduet, så det samme gjelder med og uten myk rulling); bare
 * hoppet tilbake ved fokus går gjennom Lenis når den kjører. lenis.ts ligger allerede i
 * filmbunten, så importen her henter ingenting nytt.
 *
 * Kapittelet snakker med markupen bare gjennom data-attributtene:
 *   data-kapittel="1–4"           seksjonen
 *   data-kapittel-modus           "skrubb" | "still"
 *   data-kapittel-gronn           0–1: hvor i klippet lampa blir grønn (gronnVed regnet om til utdraget)
 *   data-kapittel-rull            rullelengden i skjermhøyder (CSS-en leser --kap-rull)
 *   data-kapittel-klipp(-mobil)   klippene (bare skrubb)
 *   data-kapittel-film            satt av inline-skriptet før første maling: filmoppsettet gjelder
 *   data-kapittel-klar            satt her: skriptet eier tilstanden
 *   data-kapittel-fase            "problem" | "losning", satt her (startverdi i markupen)
 * og på barna: data-kapittel-tekst, -flate, -plate, -slor-hero, -gra. Flaten får data-har-klipp når
 * klippet har tegnet sitt første bilde, og data-vis-gronn når lampa er grønn før det.
 *
 * Én klokke, som ScrollWorld: rullingen gir p (0–1 av kapittelets rulling), pS følger p mykt, og
 * alt tegnes fra pS. Lampa skifter derfor i samme ramme som klippet viser det grønne lyset, begge
 * veier. Klippkartet: problemet (0 → PROBLEM av rullingen) fører kameraet inn til det grønne
 * lyset og bremser; resten (55 %) er løsningen, der klippet bare går sakte videre til slutt.
 *
 * Lasting (revisor r4 #12): ingen klipp før første interaksjon (rulling, hjul, berøring, tast,
 * trykk; ikke pekerbevegelse), og bare når seksjonen er nær. Klippet hentes som Blob, så det alltid
 * kan spoles. Startbildet står til klippet har tegnet.
 *
 * Bare opacity, transform og clip-path endres. Ingen layout leses utenfor requestAnimationFrame,
 * bortsett fra én gang ved oppstart.
 */

import { lenis } from "./lenis";

export type Opprydding = () => void;

const MOBIL = "(max-aspect-ratio: 4/5)";
const REDUSERT = "(prefers-reduced-motion: reduce)";
/** Heroteksten er borte etter så stor del av rullingen. Platen kommer etter. */
const HERO_UT = 0.12;
/** Så langt glir heroteksten opp mens den går ut (vh). */
const HERO_LOFT = 6;
/** Andelen av rullingen før lampa blir grønn. Resten er løsningen (kritiker r4 #3: ≥ 55 %). */
export const PROBLEM = { skrubb: 0.45, still: 0.3 } as const;
/** Hvor fort pS følger rullingen, per ramme ved 60 bilder/s. Samme som ScrollWorld. */
const FOLG = 0.22;
/** Klippet hentes når seksjonen er så mange skjermhøyder unna. */
const NAER = 1.5;

const klem = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const myk = (x: number) => {
  x = klem(x);
  return x * x * (3 - 2 * x);
};
/** Kubisk Hermite på [0, 1] fra 0 til 1 med normert stigning a i start og b i slutt. */
const hermite = (t: number, a: number, b: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return a * (t3 - 2 * t2 + t) + (3 * t2 - 2 * t3) + b * (t3 - t2);
};

/**
 * Klippkartet. u = andel av kapittelets rulling, svaret = andel av klippet.
 *   [0, P]  kameraet går inn og bremser mot det grønne lyset (g), som nås nøyaktig ved P
 *   [P, 1]  kameraet går sakte og jevnt videre til slutten av utdraget
 * Monoton, og samme stigning i skjøten, så kameraet aldri rykker.
 */
export function kartKapittel(u: number, g: number, P: number = PROBLEM.skrubb): number {
  u = klem(u);
  const sakte = (1 - g) / (1 - P);
  if (u <= P) return g * hermite(u / P, 1.25, klem(sakte / (g / P), 0, 3));
  return g + sakte * (u - P);
}

const sparData = () =>
  document.documentElement.classList.contains("wow-spar") ||
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

const sett = (el: Element | null, attr: string, pa: boolean) => {
  if (el && el.hasAttribute(attr) !== pa) el.toggleAttribute(attr, pa);
};

/** Stillbilde: vanlig høyde, det grønne bildet i farge, platen som liste. */
function stille(rot: HTMLElement): Opprydding {
  rot.removeAttribute("data-kapittel-film");
  rot.setAttribute("data-kapittel-klar", "");
  return () => rot.removeAttribute("data-kapittel-klar");
}

function film(rot: HTMLElement): Opprydding {
  const modus = rot.dataset.kapittelModus === "still" ? "still" : "skrubb";
  const P = PROBLEM[modus];
  const g = klem(Number(rot.dataset.kapittelGronn) || 0.8, 0.02, 0.98);
  const tekst = rot.querySelector<HTMLElement>("[data-kapittel-tekst]");
  const slorHero = rot.querySelector<HTMLElement>("[data-kapittel-slor-hero]");
  const plate = rot.querySelector<HTMLElement>("[data-kapittel-plate]");
  const flate = rot.querySelector<HTMLElement>("[data-kapittel-flate]");
  const mobilMQ = matchMedia(MOBIL);
  rot.setAttribute("data-kapittel-klar", "");

  let p = 0;
  let pS = 0;
  let dod = false;
  let video: HTMLVideoElement | null = null;
  let blobUrl: string | null = null;
  let laster: AbortController | null = null;
  let klar = false;
  let tegnet = false;
  let lasting = false;
  let primet = false;
  const forrige = { hero: "", plate: false, gronn: false, visGronn: false };

  /** Rulling i kapittelet. Leses bare i rAF (og én gang ved oppstart). */
  function les() {
    const r = rot.getBoundingClientRect();
    const lengde = Math.max(1, r.height - innerHeight);
    p = klem(-r.top / lengde);
    return r;
  }

  // ── Klippet ─────────────────────────────────────────────────────────
  function lastKlipp() {
    if (modus !== "skrubb" || !lasting || laster || video || dod) return;
    const url = mobilMQ.matches ? rot.dataset.kapittelKlippMobil : rot.dataset.kapittelKlipp;
    if (!url) return;
    const ac = new AbortController();
    laster = ac;
    fetch(url, { signal: ac.signal })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        if (dod || ac.signal.aborted || !flate) return;
        const v = document.createElement("video");
        v.className = "kap__video";
        v.muted = true;
        v.playsInline = true;
        v.preload = "auto";
        v.disablePictureInPicture = true;
        v.setAttribute("muted", "");
        v.setAttribute("playsinline", "");
        v.setAttribute("disableremoteplayback", "");
        v.setAttribute("aria-hidden", "true");
        v.tabIndex = -1;
        blobUrl = URL.createObjectURL(blob);
        v.src = blobUrl;
        v.dataset.kilde = url;
        v.addEventListener("loadedmetadata", () => {
          klar = true;
          sok(true);
        });
        // Startbildet skjules først når klippet har tegnet (iOS blinker svart ellers).
        v.addEventListener(
          "seeked",
          () => {
            tegnet = true;
            sett(flate, "data-har-klipp", true);
            tegn();
          },
          { once: true },
        );
        v.addEventListener("loadeddata", () => {
          v.pause();
          if (primet) prim(v);
        });
        // Klippet legges under det grå og sløret, over bildene.
        flate.insertBefore(v, flate.querySelector("[data-kapittel-gra]"));
        video = v;
        start();
      })
      .catch(() => {
        laster = null;
      });
  }

  function slippKlipp() {
    laster?.abort();
    laster = null;
    if (video) {
      video.removeAttribute("src");
      video.load();
      video.remove();
    }
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    video = null;
    blobUrl = null;
    klar = false;
    tegnet = false;
    sett(flate, "data-har-klipp", false);
  }

  /** iOS: et dempet klipp må ha spilt én gang etter en berøring før det tegner spolte bilder. */
  function prim(v: HTMLVideoElement | null) {
    if (!v) return;
    const pr = v.play();
    if (pr) pr.then(() => v.pause()).catch(() => {});
  }

  /** Flytter klippet dit pS sier. Aldri ny spoling mens dekoderen fortsatt jobber. Gir true når i ro. */
  function sok(tving = false): boolean {
    const v = video;
    if (!v || !klar) return true;
    if (v.seeking && !tving) return false;
    const varighet = v.duration || 1;
    const tid = klem(kartKapittel(pS, g, P), 0, 0.999) * varighet;
    if (Math.abs(v.currentTime - tid) > (mobilMQ.matches ? 0.02 : 0.008) || tving) {
      try {
        v.currentTime = Math.max(0.001, tid);
      } catch {
        /* ingenting */
      }
      return false;
    }
    return true;
  }

  // ── Tegning, alt fra pS ─────────────────────────────────────────────
  function tegn() {
    // Heroteksten glir opp og klippes bort nedenfra, borte etter 12 % (kritiker r4 #9).
    const ut = myk(pS / HERO_UT);
    const nokkel = ut >= 1 ? "ute" : ut.toFixed(3);
    if (nokkel !== forrige.hero) {
      forrige.hero = nokkel;
      if (tekst) {
        // Ingen visibility: lenkene må kunne få fokus mens teksten er ute, så fokus kan rulle
        // tilbake (fokus() under). Klippet og opasiteten skjuler den helt.
        tekst.style.opacity = ut >= 1 ? "0" : "";
        tekst.style.clipPath = ut > 0 ? `inset(-2rem 0 ${(ut * 100).toFixed(1)}% 0)` : "";
        tekst.style.transform = ut > 0 ? `translate3d(0, ${(-ut * HERO_LOFT).toFixed(2)}vh, 0)` : "";
        tekst.style.pointerEvents = ut < 0.5 ? "" : "none";
      }
      if (slorHero) slorHero.style.opacity = (1 - ut).toFixed(3);
    }
    const plateVis = pS >= HERO_UT * 0.98;
    if (plateVis !== forrige.plate) {
      forrige.plate = plateVis;
      sett(plate, "data-synlig", plateVis);
    }
    const gronn = pS >= P;
    if (gronn !== forrige.gronn) {
      forrige.gronn = gronn;
      rot.dataset.kapittelFase = gronn ? "losning" : "problem";
      sett(plate, "data-gronn", gronn);
    }
    // Skrubb uten tegnet klipp: når lampa er grønn, står det grønne bildet (hardt kutt).
    const visGronn = modus === "skrubb" && gronn && !tegnet;
    if (visGronn !== forrige.visGronn) {
      forrige.visGronn = visGronn;
      sett(flate, "data-vis-gronn", visGronn);
    }
  }

  // ── Takten ──────────────────────────────────────────────────────────
  let raf = 0;
  let sist = 0;
  function tikk(na: number) {
    raf = 0;
    les();
    const dt = sist ? Math.min(100, na - sist) : 16.67;
    sist = na;
    const d = p - pS;
    if (d !== 0) {
      const f = 1 - Math.pow(1 - FOLG, dt / 16.67);
      pS = Math.abs(d) < 0.0004 ? p : pS + d * f;
      tegn();
    }
    const ro = sok() && pS === p;
    if (!ro) raf = requestAnimationFrame(tikk);
    else sist = 0;
  }
  function start() {
    if (!raf && !dod) raf = requestAnimationFrame(tikk);
  }

  const naer = (r: DOMRect) => r.top < innerHeight * NAER && r.bottom > -innerHeight * NAER;
  // Bare mens seksjonen er på skjermen følger klokka rullingen (resten av siden koster ingenting).
  let synlig = true;
  const paRull = () => {
    if (!lasting && scrollY > 0) slaaPaLasting();
    if (synlig) start();
  };
  const slaaPaLasting = () => {
    if (lasting) return;
    lasting = true;
    requestAnimationFrame(() => {
      if (naer(rot.getBoundingClientRect())) lastKlipp();
    });
  };
  const forsteBeroring = () => {
    slaaPaLasting();
    if (primet) return;
    primet = true;
    prim(video);
  };
  // Seksjoner lenger nede (ikke i dag): last når de nærmer seg.
  const io = new IntersectionObserver(
    (t) => {
      if (t.some((x) => x.isIntersecting)) lastKlipp();
    },
    { rootMargin: `${NAER * 100}% 0px` },
  );
  io.observe(rot);
  const vis = new IntersectionObserver((t) => {
    synlig = t.some((x) => x.isIntersecting);
    // Én siste runde når den går ut, så tilstanden står riktig når du ruller tilbake.
    start();
  });
  vis.observe(rot);

  const valg = { once: true, passive: true } as const;
  addEventListener("scroll", paRull, { passive: true });
  addEventListener("resize", start);
  addEventListener("pointerdown", forsteBeroring, valg);
  addEventListener("touchstart", forsteBeroring, valg);
  addEventListener("wheel", slaaPaLasting, valg);
  addEventListener("keydown", slaaPaLasting, { once: true });

  // Tastatur: fokus i heroteksten mens den er ute av syne, ruller tilbake til toppen av kapittelet.
  const fokus = (e: FocusEvent) => {
    if (!tekst?.contains(e.target as Node) || pS <= 0.01) return;
    const topp = rot.getBoundingClientRect().top + scrollY;
    // Med myk rulling (Lenis) må hoppet gå gjennom Lenis, ellers ruller den tilbake dit den var.
    const l = lenis();
    if (l) l.scrollTo(topp, { immediate: true, force: true });
    else scrollTo({ top: topp, behavior: "instant" as ScrollBehavior });
    p = pS = 0;
    tegn();
  };
  rot.addEventListener("focusin", fokus);

  // Stående ↔ liggende: bytt klipp (bildet byttes av <picture>).
  const byttRetning = () => {
    slippKlipp();
    lastKlipp();
    forrige.visGronn = !forrige.visGronn;
    tegn();
    start();
  };
  mobilMQ.addEventListener("change", byttRetning);

  // Første tilstand: der siden står (f.eks. etter oppfrisking midt i kapittelet), uten myk innfølging.
  les();
  pS = p;
  tegn();
  if (scrollY > 0) slaaPaLasting();

  return () => {
    dod = true;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    vis.disconnect();
    removeEventListener("scroll", paRull);
    removeEventListener("resize", start);
    removeEventListener("pointerdown", forsteBeroring);
    removeEventListener("touchstart", forsteBeroring);
    removeEventListener("wheel", slaaPaLasting);
    removeEventListener("keydown", slaaPaLasting);
    rot.removeEventListener("focusin", fokus);
    mobilMQ.removeEventListener("change", byttRetning);
    slippKlipp();
    if (tekst) tekst.style.opacity = tekst.style.clipPath = tekst.style.transform = tekst.style.pointerEvents = "";
    if (slorHero) slorHero.style.opacity = "";
    sett(plate, "data-synlig", false);
    sett(plate, "data-gronn", false);
    sett(flate, "data-vis-gronn", false);
    rot.dataset.kapittelFase = "problem";
    rot.removeAttribute("data-kapittel-klar");
  };
}

/**
 * Starter alle kapitler på siden. Film bare når inline-skriptet i Kapittel.astro har satt
 * data-kapittel-film (full bevegelse, ikke Save-Data, og skriptet kom innen 4 s). Ellers stillbilde.
 * Bytter brukeren til redusert bevegelse underveis, blir kapittelet stillbilde.
 */
export function startKapittel(): Opprydding | void {
  const rotter = Array.from(document.querySelectorAll<HTMLElement>("[data-kapittel]"));
  if (!rotter.length) return;
  const redusert = matchMedia(REDUSERT);
  const rydd = rotter.map((rot) => {
    const filmen = rot.hasAttribute("data-kapittel-film") && !redusert.matches && !sparData();
    let av = filmen ? film(rot) : stille(rot);
    if (!filmen) return av;
    const bytt = () => {
      if (!redusert.matches) return;
      av();
      av = stille(rot);
    };
    redusert.addEventListener("change", bytt);
    return () => {
      redusert.removeEventListener("change", bytt);
      av();
    };
  });
  return () => rydd.forEach((f) => f());
}
