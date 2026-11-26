/**
 * Myk rulling med Lenis, koblet til ScrollTrigger.
 *
 * Bare når brukeren ikke har bedt om redusert bevegelse (index.ts styrer det).
 * Lenis jevner bare ut hjulet: tastatur, berøring og rullefelt er nettleserens egne,
 * og Lenis følger etter. Ingenting låses.
 *
 * Ankerlenker håndteres her og ikke med Lenis' `anchors`, fordi den varianten ikke
 * flytter fokus. «Hopp til innhold» må flytte fokus, ellers havner neste Tab øverst.
 */
import Lenis from "lenis";
import { gsap, ScrollTrigger, type Opprydding } from "./felles";

let aktiv: Lenis | null = null;

/** Lenis-instansen hvis den kjører, ellers null (redusert bevegelse, eller ikke startet). */
export const lenis = () => aktiv;

function fokuser(mal: HTMLElement) {
  if (!mal.matches("a[href], button, input, select, textarea, [tabindex]")) {
    mal.setAttribute("tabindex", "-1");
  }
  mal.focus({ preventScroll: true });
}

function ankerklikk(e: MouseEvent) {
  if (!aktiv || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || a.target === "_blank") return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const id = decodeURIComponent(url.hash.slice(1));
  const mal = id === "" || id === "top" ? document.body : document.getElementById(id);
  if (!mal) return;
  e.preventDefault();
  const marg = parseFloat(getComputedStyle(mal).scrollMarginTop) || 0;
  history.pushState(null, "", url.hash);
  // Festingen kan ha gjort siden høyere siden Lenis målte sist; mål før vi sikter.
  aktiv.resize();
  aktiv.scrollTo(mal === document.body ? 0 : mal, {
    offset: -marg,
    onComplete: () => fokuser(mal),
  });
}

export function startLenis(): Opprydding {
  const l = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    smoothWheel: true,
    // Berøring er nettleserens egen. Mobil får native rulling og treghet.
    syncTouch: false,
  });
  aktiv = l;
  l.on("scroll", ScrollTrigger.update);
  const tikk = (tid: number) => l.raf(tid * 1000);
  gsap.ticker.add(tikk);
  gsap.ticker.lagSmoothing(0);
  document.addEventListener("click", ankerklikk);
  // ScrollTrigger legger til og fjerner høyde (pin-spacer). Lenis må vite den nye grensen.
  const mal = () => l.resize();
  ScrollTrigger.addEventListener("refresh", mal);

  return () => {
    ScrollTrigger.removeEventListener("refresh", mal);
    document.removeEventListener("click", ankerklikk);
    gsap.ticker.remove(tikk);
    gsap.ticker.lagSmoothing(500, 33);
    l.destroy();
    if (aktiv === l) aktiv = null;
  };
}
