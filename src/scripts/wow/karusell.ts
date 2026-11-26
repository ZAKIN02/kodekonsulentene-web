/**
 * data-karusell – horisontal rad man kan dra i (Embla).
 *
 * Markup:
 *   <div data-karusell-ramme>                       (valgfri, samler kontrollene)
 *     <div data-karusell aria-label="Arbeid">        (Embla-roten, viewport)
 *       <ul class="karusell__spor">                  (beholderen)
 *         <li class="karusell__lysbilde">…</li>
 *       </ul>
 *     </div>
 *     <button data-karusell-forrige>Forrige</button> (valgfri)
 *     <button data-karusell-neste>Neste</button>     (valgfri)
 *     <div data-karusell-fremdrift></div>            (valgfri, scaleX følger rullingen)
 *   </div>
 *
 * Dra med mus eller finger, piltaster når roten har fokus, og Tab inn i et
 * lysbilde ruller det fram. Roten får role="region" og aria-roledescription;
 * lysbildene får role="group" og «n av N» hvis de ikke har egen etikett.
 *
 * Uten JavaScript: raden kan rulles sidelengs med snap (wow-bevegelse.css).
 * Kjører i alle modi; ved redusert bevegelse er overgangene korte.
 */
import type { EmblaCarouselType } from "embla-carousel";
import { alle, klar, type Opprydding } from "./felles";

function bygg(Embla: typeof import("embla-carousel").default, rot: HTMLElement, redusert: boolean): Opprydding {
  const spor = rot.querySelector<HTMLElement>(".karusell__spor");
  if (!spor) return () => {};
  const ramme = rot.closest<HTMLElement>("[data-karusell-ramme]") ?? rot;
  const forrige = ramme.querySelector<HTMLButtonElement>("[data-karusell-forrige]");
  const neste = ramme.querySelector<HTMLButtonElement>("[data-karusell-neste]");
  const fremdrift = ramme.querySelector<HTMLElement>("[data-karusell-fremdrift]");

  rot.scrollLeft = 0;
  klar(rot);
  const embla: EmblaCarouselType = Embla(rot, {
    container: spor,
    slides: ".karusell__lysbilde",
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    duration: redusert ? 12 : 32,
  });

  if (!rot.hasAttribute("role")) rot.setAttribute("role", "region");
  rot.setAttribute("aria-roledescription", "karusell");
  if (!rot.hasAttribute("tabindex")) rot.tabIndex = 0;
  const lysbilder = embla.slideNodes();
  lysbilder.forEach((l, i) => {
    if (!l.hasAttribute("role")) l.setAttribute("role", "group");
    l.setAttribute("aria-roledescription", "lysbilde");
    if (!l.hasAttribute("aria-label") && !l.hasAttribute("aria-labelledby")) {
      l.setAttribute("aria-label", `${i + 1} av ${lysbilder.length}`);
    }
  });

  const oppdaterKnapper = () => {
    if (forrige) forrige.disabled = !embla.canScrollPrev();
    if (neste) neste.disabled = !embla.canScrollNext();
  };
  const oppdaterFremdrift = () => {
    if (fremdrift) fremdrift.style.transform = `scaleX(${Math.max(0, Math.min(1, embla.scrollProgress()))})`;
  };
  embla.on("select", oppdaterKnapper).on("init", oppdaterKnapper).on("reInit", oppdaterKnapper);
  embla.on("scroll", oppdaterFremdrift).on("reInit", oppdaterFremdrift);
  oppdaterKnapper();
  oppdaterFremdrift();

  const gaaForrige = () => embla.scrollPrev();
  const gaaNeste = () => embla.scrollNext();
  forrige?.addEventListener("click", gaaForrige);
  neste?.addEventListener("click", gaaNeste);

  const tast = (e: KeyboardEvent) => {
    if (e.target !== rot) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      embla.scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      embla.scrollNext();
    } else if (e.key === "Home") {
      e.preventDefault();
      embla.scrollTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      embla.scrollTo(embla.scrollSnapList().length - 1);
    }
  };
  // Fokus inni et lysbilde utenfor synet: nettleseren ruller roten sidelengs på egen
  // hånd og river Embla ut av stilling. Nullstill og la Embla rulle i stedet.
  const fokus = (e: FocusEvent) => {
    const l = (e.target as Element).closest(".karusell__lysbilde");
    if (!l) return;
    rot.scrollLeft = 0;
    const i = lysbilder.indexOf(l as HTMLElement);
    if (i >= 0 && !embla.slidesInView().includes(i)) embla.scrollTo(i);
  };
  rot.addEventListener("keydown", tast);
  rot.addEventListener("focusin", fokus);

  return () => {
    rot.removeEventListener("keydown", tast);
    rot.removeEventListener("focusin", fokus);
    forrige?.removeEventListener("click", gaaForrige);
    neste?.removeEventListener("click", gaaNeste);
    embla.destroy();
    rot.removeAttribute("data-wow-klar");
  };
}

export function startKarusell(redusert: boolean): Opprydding | void {
  const rotter = alle("[data-karusell]");
  if (!rotter.length) return;
  let av: Opprydding[] = [];
  let avbrutt = false;
  // Embla (ca. 7 kB gzip) hentes først når en karusell er én skjermhøyde unna (revisor r3 #4).
  // Til da er karusellen en vanlig vannrett rulling med snap, som uten JavaScript.
  const naer = new IntersectionObserver(
    (oppf) => {
      if (!oppf.some((o) => o.isIntersecting)) return;
      naer.disconnect();
      void import("embla-carousel").then(({ default: Embla }) => {
        if (!avbrutt) av = rotter.map((r) => bygg(Embla, r, redusert));
      });
    },
    { rootMargin: "100% 0px" },
  );
  rotter.forEach((r) => naer.observe(r));
  return () => {
    avbrutt = true;
    naer.disconnect();
    av.forEach((f) => f());
  };
}
