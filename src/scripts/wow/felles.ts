/**
 * Felles for alle wow-effektene: GSAP med plugins registrert én gang, mediespørringene
 * og små hjelpere. Ingen effekt importerer gsap direkte; alt går gjennom denne fila,
 * så registreringen skjer før første bruk.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const html = document.documentElement;

/** Mediespørringene alt styres av. `full` = brukeren har ikke bedt om mindre bevegelse. */
export const MQ = {
  full: "(prefers-reduced-motion: no-preference)",
  redusert: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px)",
  mobil: "(max-width: 767.98px)",
  fin: "(hover: hover) and (pointer: fine)",
} as const;

/**
 * To kurver for alt som spilles på tid, pluss lineær for scrub.
 * `ut`: rask start, myk landing – ting som låser seg på plass.
 * `innUt`: teppe og overganger der begge ender skal være rolige.
 */
export const KURVE = { ut: "expo.out", innUt: "power3.inOut", scrub: "none" } as const;

export function alle<T extends Element = HTMLElement>(sel: string, rot: ParentNode = document): T[] {
  return Array.from(rot.querySelectorAll<T>(sel));
}

/** Fjerner CSS-startstilen for elementet: fra nå eier JavaScript tilstanden. */
export function klar(el: Element): void {
  el.setAttribute("data-wow-klar", "");
}

/** Elementet er ferdig animert og skal ikke animeres inn igjen. */
export function vist(el: Element): void {
  el.setAttribute("data-wow-vist", "");
}

export const erVist = (el: Element) => el.hasAttribute("data-wow-vist");

/** Elementer inni befaringen styres av befaring.ts, ikke av de generelle effektene. */
export const iBefaring = (el: Element) => el.closest('[data-pin="befaring"]') !== null;

export type Opprydding = () => void;

export function samle(...fns: (Opprydding | void | undefined)[]): Opprydding {
  return () => {
    for (const f of fns) f?.();
  };
}

/** Lager et visuelt skjult spenn med teksten, for skjermlesere mens det synlige er delt opp. */
export function skjermlesertekst(tekst: string): HTMLSpanElement {
  const s = document.createElement("span");
  s.className = "wow-sr";
  s.textContent = tekst;
  return s;
}

/** Ren tekst med mellomrom normalisert, slik skjermleseren skal lese den. */
export const renTekst = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
