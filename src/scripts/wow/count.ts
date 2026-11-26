/**
 * data-count="14900"
 *
 * Tallet teller opp med number-flow når det kommer i syne. Format nb-NO
 * (14 900). Skriv det ferdige tallet som tekst i elementet også, så siden er
 * riktig uten JavaScript: <span data-count="14900">14 900</span>.
 *
 * Valgfritt:
 *   data-count-fra="0"        startverdi (standard 0)
 *   data-count-desimaler="1"  antall desimaler (standard 0)
 *   data-count-inn="av"       ingen opptelling når tallet kommer i syne; tallet står ferdig
 *                             og ruller bare når verdien endres. Bruk det på prisene: en pris
 *                             som ruller opp som en spilleautomat, går mot «fast pris».
 *
 * Endre verdien senere (prisvelgeren): sett bare el.dataset.count = "29900".
 * Tallet ruller til den nye verdien på 500 ms. Skriv aldri textContent selv.
 *
 * Maske: hver sifferkolonne er klippet til linjen (overflow: clip på ::part(digit) og
 * linjehøyde 1, wow-bevegelse.css). Midt i rullingen står det aldri sifre over eller under
 * tallet, og «29 900» leses aldri som «2 9 9 00» (kritiker wow-r1 #5).
 *
 * Skjermlesere leser et skjult spenn med sluttverdien; selve rullingen er aria-hidden.
 * Bredden låses til sluttverdiens bredde, så ingenting rundt hopper (ingen CLS).
 * Redusert bevegelse: ingen opptelling, tallet står ferdig og bytter uten rulling.
 */
import type NumberFlow from "number-flow";
import { ScrollTrigger, alle, klar, vist, iBefaring, skjermlesertekst, type Opprydding } from "./felles";

let modul: Promise<typeof import("number-flow")> | null = null;
const last = () => (modul ??= import("number-flow"));

interface Tall {
  el: HTMLElement;
  flow?: NumberFlow;
  sr?: HTMLElement;
  formater: Intl.NumberFormat;
  spilt: boolean;
}

const tall = new WeakMap<HTMLElement, Tall>();

/** Opptelling når tallet kommer i syne, og bytte av verdi (prisvelgeren). Samme kurve som KURVE.ut. */
const INN = 1000;
const BYTTE = 500;
const KURVE_UT = "cubic-bezier(0.16, 1, 0.3, 1)";
function settTid(flow: NumberFlow, ms: number) {
  flow.transformTiming = { duration: ms, easing: KURVE_UT };
  flow.spinTiming = { duration: ms, easing: KURVE_UT };
  flow.opacityTiming = { duration: Math.round(ms * 0.4), easing: "ease-out" };
}

const verdi = (el: HTMLElement, attr = "count") => {
  const v = parseFloat((el.dataset[attr] ?? "").replace(",", "."));
  return Number.isFinite(v) ? v : 0;
};

function formatValg(el: HTMLElement): { minimumFractionDigits: number; maximumFractionDigits: number } {
  const d = Math.max(0, Math.min(4, parseInt(el.dataset.countDesimaler ?? "0", 10) || 0));
  return { minimumFractionDigits: d, maximumFractionDigits: d };
}

async function bygg(el: HTMLElement, animert: boolean): Promise<Tall> {
  const t = tall.get(el)!;
  await last();
  if (t.flow) return t;
  // Lås bredden til sluttverdien før innholdet byttes.
  const bredde = el.getBoundingClientRect().width;
  el.style.display = "inline-block";
  el.style.minWidth = `${Math.ceil(bredde)}px`;

  const flow = document.createElement("number-flow") as NumberFlow;
  flow.locales = "nb-NO";
  flow.format = formatValg(el);
  flow.setAttribute("aria-hidden", "true");
  settTid(flow, INN);
  const sr = skjermlesertekst(t.formater.format(verdi(el)));
  el.replaceChildren(sr, flow);
  flow.animated = false;
  flow.update(animert ? verdi(el, "countFra") : verdi(el));
  // number-flow tegner seg i neste ramme; slå på animasjon etter det.
  requestAnimationFrame(() => (flow.animated = true));
  t.flow = flow;
  t.sr = sr;
  klar(el);
  return t;
}

/** Spiller opptellingen. Brukes også av befaring.ts når steget med tallet vises. */
export async function spillTall(el: HTMLElement): Promise<void> {
  const t = tall.get(el);
  if (!t || t.spilt) return;
  t.spilt = true;
  await bygg(el, true);
  // To rammer: én for at startverdien er tegnet, én for at animated er satt.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      t.flow!.update(verdi(el));
      vist(el);
    }),
  );
}

/** Setter tallet rett til sluttverdien uten opptelling (redusert bevegelse, befaring baklengs). */
export function ferdigTall(el: HTMLElement): void {
  const t = tall.get(el);
  if (t?.flow) t.flow.update(verdi(el));
}

/**
 * @param animert false ved redusert bevegelse: tallene står ferdig fra start,
 *                men følger fortsatt endringer i data-count.
 */
export function startCount(animert: boolean): Opprydding | void {
  const elementer = alle("[data-count]");
  if (!elementer.length) return;

  // number-flow (ca. 6 kB gzip) hentes først når et tall er én skjermhøyde unna (revisor r3 #4).
  // Til da står tallet som vanlig tekst med sluttverdien, slik det gjør uten JavaScript.
  const triggere: ScrollTrigger[] = [];
  const naer = new IntersectionObserver(
    (oppf) => {
      for (const o of oppf) {
        if (!o.isIntersecting) continue;
        const el = o.target as HTMLElement;
        naer.unobserve(el);
        const t = tall.get(el)!;
        void bygg(el, !t.spilt);
      }
    },
    { rootMargin: "100% 0px" },
  );
  for (const el of elementer) {
    if (!tall.has(el)) {
      tall.set(el, { el, formater: new Intl.NumberFormat("nb-NO", formatValg(el)), spilt: false });
    }
    const t = tall.get(el)!;
    if (!animert || t.spilt || el.dataset.countInn === "av") {
      t.spilt = true;
    } else if (!iBefaring(el)) {
      triggere.push(
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => void spillTall(el) }),
      );
    }
    if (!t.flow) naer.observe(el);
  }

  // Endret data-count (prisvelgeren): rull til ny verdi, eller skriv teksten hvis
  // number-flow ikke er klar ennå.
  const obs = new MutationObserver((endringer) => {
    for (const m of endringer) {
      const el = m.target as HTMLElement;
      const t = tall.get(el);
      if (!t) continue;
      const ny = verdi(el);
      if (t.sr) t.sr.textContent = t.formater.format(ny);
      if (t.flow) {
        el.style.minWidth = "";
        settTid(t.flow, BYTTE);
        t.flow.update(ny);
      } else {
        el.textContent = t.formater.format(ny);
      }
    }
  });
  for (const el of elementer) obs.observe(el, { attributes: true, attributeFilter: ["data-count"] });

  return () => {
    obs.disconnect();
    naer.disconnect();
    triggere.forEach((s) => s.kill());
  };
}
