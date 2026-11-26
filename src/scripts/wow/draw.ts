/**
 * data-draw              SVG-linjen tegnes med rullingen (scrub, begge veier).
 * data-draw="inn"        Tegnes én gang på tid når den kommer i syne (ikoner, haker).
 *
 * Sett attributtet på selve figuren (path, line, polyline, polygon, circle, rect,
 * ellipse) eller på <svg>/<g>; da tegnes alle figurene inni samtidig.
 *
 * Høye figurer (minst 30 % av vinduet, f.eks. en loddrett linje gjennom fire steg)
 * tegnes slik at tuppen følger en fast linje på 70 % av vinduet. Korte figurer
 * tegnes mens de går fra 85 % til 45 % av vinduet.
 *
 * Virker med preserveAspectRatio="none" og vector-effect: non-scaling-stroke: da
 * måles lengden i skjermpiksler, og den måles på nytt når vinduet endrer størrelse.
 *
 * Elementer inni data-pin="befaring" tegnes av befaringens tidslinje.
 */
import { gsap, ScrollTrigger, KURVE, alle, klar, vist, iBefaring, type Opprydding } from "./felles";

const FIGURER = "path, line, polyline, polygon, circle, rect, ellipse";

/** Hvor langt figuren er tegnet, 0–1. */
const fremdrift = new WeakMap<SVGGeometryElement, number>();
const kjente = new Set<SVGGeometryElement>();

function lengde(f: SVGGeometryElement): number {
  let l = 0;
  try {
    l = f.getTotalLength();
    if (getComputedStyle(f).vectorEffect === "non-scaling-stroke") {
      // Streken (og dermed stiplingen) ligger i skjermrommet: mål der.
      const m = f.getScreenCTM();
      if (m && l > 0) {
        const n = 32;
        let sum = 0;
        let forrige = f.getPointAtLength(0).matrixTransform(m);
        for (let i = 1; i <= n; i++) {
          const p = f.getPointAtLength((l * i) / n).matrixTransform(m);
          sum += Math.hypot(p.x - forrige.x, p.y - forrige.y);
          forrige = p;
        }
        l = sum;
      }
    }
  } catch {
    /* ikke tegnet (display: none) – måles på nytt ved neste oppfrisking */
  }
  // +2 så runde linjeender ikke lager en prikk når linjen er «utegnet».
  return Math.ceil(l) + 2;
}

function tegnTil(f: SVGGeometryElement, p: number) {
  fremdrift.set(f, p);
  const l = Number(f.dataset.wowLengde) || lengde(f);
  f.style.strokeDashoffset = String(l * (1 - p));
}

function mal(f: SVGGeometryElement) {
  const l = lengde(f);
  f.dataset.wowLengde = String(l);
  f.style.strokeDasharray = `${l} ${l}`;
  tegnTil(f, fremdrift.get(f) ?? 0);
}

const malAlle = () => kjente.forEach(mal);

/** Figurene et data-draw-element består av, utegnet og klare. */
export function figurer(el: Element): SVGGeometryElement[] {
  const liste = (el.matches(FIGURER) ? [el] : alle(FIGURER, el)) as SVGGeometryElement[];
  if (!kjente.size) ScrollTrigger.addEventListener("refreshInit", malAlle);
  for (const f of liste) {
    kjente.add(f);
    fremdrift.set(f, 0);
    mal(f);
  }
  return liste;
}

/** Fjerner dash-oppsettet, så linjen står hel (redusert bevegelse, opprydding). */
export function nullstill(liste: SVGGeometryElement[]): void {
  for (const f of liste) {
    kjente.delete(f);
    f.style.strokeDasharray = "";
    f.style.strokeDashoffset = "";
    delete f.dataset.wowLengde;
  }
  if (!kjente.size) ScrollTrigger.removeEventListener("refreshInit", malAlle);
}

/** Tween fra utegnet til tegnet. Brukes også av befaring.ts. */
export function tegn(liste: SVGGeometryElement[], vars: gsap.TweenVars = {}) {
  const p = { v: 0 };
  return gsap.to(p, {
    v: 1,
    ease: KURVE.scrub,
    ...vars,
    onUpdate() {
      for (const f of liste) tegnTil(f, p.v);
    },
  });
}

const hoy = (el: Element) => el.getBoundingClientRect().height >= innerHeight * 0.3;

export function startDraw(): Opprydding {
  const alleFigurer: SVGGeometryElement[] = [];
  for (const el of alle<SVGElement>("[data-draw]")) {
    if (iBefaring(el)) continue;
    const liste = figurer(el);
    alleFigurer.push(...liste);
    klar(el);
    if (!liste.length) continue;
    if (el.dataset.draw === "inn") {
      tegn(liste, {
        duration: 1.2,
        ease: KURVE.innUt,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onComplete: () => vist(el),
      });
      continue;
    }
    // Triggeren er <svg>-en, ikke figuren: figuren kan være en tynn linje uten høyde.
    const trigger = el.closest("svg") ?? el;
    tegn(liste, {
      scrollTrigger: {
        trigger,
        start: () => (hoy(trigger) ? "top 70%" : "top 85%"),
        end: () => (hoy(trigger) ? "bottom 70%" : "top 45%"),
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
  }
  return () => nullstill(alleFigurer);
}
