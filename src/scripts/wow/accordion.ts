/**
 * data-accordion på <details>
 *
 * Myk høyde når den åpnes og lukkes. Innholdet er elementet rett etter <summary>:
 *   <details data-accordion>
 *     <summary>Spørsmål</summary>
 *     <div>Svar …</div>
 *   </details>
 *
 * Elementet er en ekte <details> hele veien: tastatur, skjermleser og søk i siden
 * (som åpner den av seg selv) virker som før. Skriptet tar bare over klikket på
 * <summary> for å animere høyden. Med name="…" på flere <details> lukkes de andre
 * i gruppen med animasjon når én åpnes.
 *
 * Kan avbrytes (runde 9): trykker du igjen mens den åpnes eller lukkes, snur den fra høyden den
 * har nå, ikke fra null. Begge veier bruker samme kurve (KURVE.ut): rask start, så svaret på
 * trykket kommer straks; lukkingen er kortere enn åpningen.
 *
 * Uten JavaScript og ved redusert bevegelse: vanlig <details>, uten animasjon.
 */
import { gsap, KURVE, alle, type Opprydding } from "./felles";

const kjorer = new WeakMap<HTMLDetailsElement, gsap.core.Tween>();

function innhold(d: HTMLDetailsElement): HTMLElement | null {
  const s = d.querySelector(":scope > summary");
  return (s?.nextElementSibling as HTMLElement | null) ?? null;
}

const RYDD = "height,paddingTop,paddingBottom,opacity,overflow";

/**
 * Boksens naturlige høyde og luft (padding), målt uten skriptets inline-stiler og satt tilbake
 * etterpå, i samme oppgave (ingenting males i mellomtiden). Luften animeres sammen med høyden
 * (runde 9): med `height: 0` alene sto luften igjen (32 px i FAQ-en), så boksen startet med et
 * hopp når den åpnet og endte med et hopp når den lukket.
 */
function naturlig(el: HTMLElement): { height: number; paddingTop: number; paddingBottom: number } {
  const { height, paddingTop, paddingBottom } = el.style;
  el.style.height = el.style.paddingTop = el.style.paddingBottom = "";
  const cs = getComputedStyle(el);
  const pt = parseFloat(cs.paddingTop) || 0;
  const pb = parseFloat(cs.paddingBottom) || 0;
  // offsetHeight er med luft. Med content-box er `height` uten den.
  const h = el.offsetHeight - (cs.boxSizing === "border-box" ? 0 : pt + pb);
  el.style.height = height;
  el.style.paddingTop = paddingTop;
  el.style.paddingBottom = paddingBottom;
  return { height: h, paddingTop: pt, paddingBottom: pb };
}

function apne(d: HTMLDetailsElement) {
  const el = innhold(d);
  // Avbrutt midt i en lukking: fortsett fra høyden og opasiteten den har nå.
  const midtI = kjorer.get(d)?.isActive() ?? false;
  kjorer.get(d)?.kill();
  // Lukk de andre i samme gruppe selv, med animasjon. Navnet tas av dem mens de
  // lukkes, ellers lukker nettleseren dem brått i det denne åpnes.
  if (d.name) {
    for (const annen of alle<HTMLDetailsElement>(`details[data-accordion][name="${CSS.escape(d.name)}"]`)) {
      if (annen !== d && annen.open) {
        annen.dataset.wowNavn = annen.name;
        annen.removeAttribute("name");
        lukk(annen);
      }
    }
  }
  d.open = true;
  if (!el) return;
  const mal = naturlig(el);
  gsap.set(el, midtI ? { overflow: "hidden" } : { height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, overflow: "hidden" });
  const t = gsap.to(el, {
    ...mal,
    opacity: 1,
    duration: 0.55,
    ease: KURVE.ut,
    onComplete: () => void gsap.set(el, { clearProps: RYDD }),
  });
  kjorer.set(d, t);
}

function lukk(d: HTMLDetailsElement) {
  const el = innhold(d);
  kjorer.get(d)?.kill();
  const ferdig = () => {
    d.open = false;
    if (d.dataset.wowNavn) {
      d.setAttribute("name", d.dataset.wowNavn);
      delete d.dataset.wowNavn;
    }
  };
  if (!el) return ferdig();
  gsap.set(el, { overflow: "hidden" });
  const t = gsap.to(el, {
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    opacity: 0,
    duration: 0.3,
    ease: KURVE.ut,
    onComplete() {
      ferdig();
      gsap.set(el, { clearProps: RYDD });
    },
  });
  kjorer.set(d, t);
}

export function startAccordion(): Opprydding | void {
  const alleD = alle<HTMLDetailsElement>("details[data-accordion]");
  if (!alleD.length) return;
  const klikk = (e: MouseEvent) => {
    const s = (e.target as Element).closest("summary");
    const d = s?.parentElement;
    if (!(d instanceof HTMLDetailsElement) || !d.matches("[data-accordion]") || s !== d.querySelector(":scope > summary")) return;
    e.preventDefault();
    // Åpen og ikke på vei til å lukkes → lukk. Ellers åpne.
    const lukker = kjorer.get(d)?.isActive() && kjorer.get(d)?.vars.height === 0;
    if (d.open && !lukker) lukk(d);
    else apne(d);
  };
  document.addEventListener("click", klikk);
  return () => document.removeEventListener("click", klikk);
}
