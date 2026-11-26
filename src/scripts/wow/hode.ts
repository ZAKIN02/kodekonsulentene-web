/**
 * data-hode-skjul  (på toppfeltet, f.eks. <header class="wow-hode" data-hode-skjul>)
 *
 * Toppfeltet glir opp og ut av veien når du ruller nedover, og kommer tilbake så snart
 * du ruller oppover. Leseren får hele skjermen til innholdet, og menyen er aldri mer enn
 * en liten rulling unna (kritiker wow-r1 #11).
 *
 * Tilstand: data-hode-skjult settes på elementet; CSS-en i wow-bevegelse.css flytter det
 * med `translate` (--wow-tid-svar, 280 ms), ikke `transform`, så det ikke slåss med andre effekter.
 * Feltet vises alltid når fokus er inni det, når en <details> i det er åpen, og øverst
 * på siden (første 2 × feltets høyde).
 *
 * Uten GSAP (bølge A2): brukes både av filminngangen (index.ts) og av rolig.ts, og rolig-sidene
 * skal ikke laste GSAP. Rullingen leses fra vinduet i requestAnimationFrame; Lenis ruller vinduet,
 * så det samme gjelder med myk rulling.
 *
 * Uten JavaScript og ved redusert bevegelse: feltet står fast og skjules aldri.
 */

type Opprydding = () => void;

/** Minste rulling i samme retning før feltet bytter tilstand, så små rykk ikke blinker. */
const TERSKEL = 8;

export function startHode(): Opprydding | void {
  const hoder = Array.from(document.querySelectorAll<HTMLElement>("[data-hode-skjul]"));
  if (!hoder.length) return;

  const rydd = hoder.map((hode) => {
    let ankerY = scrollY;
    let skjult = false;
    let planlagt = 0;
    const sett = (s: boolean) => {
      if (s === skjult) return;
      skjult = s;
      hode.toggleAttribute("data-hode-skjult", s);
    };
    const maaVises = () => hode.matches(":focus-within") || hode.querySelector("details[open]") !== null;

    const oppdater = () => {
      planlagt = 0;
      const y = scrollY;
      if (y < hode.offsetHeight * 2 || maaVises()) {
        sett(false);
        ankerY = y;
        return;
      }
      const d = y - ankerY;
      if (Math.abs(d) < TERSKEL) return;
      sett(d > 0);
      ankerY = y;
    };
    const paRull = () => {
      if (!planlagt) planlagt = requestAnimationFrame(oppdater);
    };
    const fokus = () => sett(false);
    addEventListener("scroll", paRull, { passive: true });
    hode.addEventListener("focusin", fokus);
    hode.addEventListener("toggle", fokus, true);
    return () => {
      if (planlagt) cancelAnimationFrame(planlagt);
      removeEventListener("scroll", paRull);
      hode.removeEventListener("focusin", fokus);
      hode.removeEventListener("toggle", fokus, true);
      hode.removeAttribute("data-hode-skjult");
    };
  });
  return () => rydd.forEach((f) => f());
}
