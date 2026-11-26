/**
 * data-reveal="clip"  Bilde/video avdekkes med clip-path fra bunnen; mediet inni
 *                     skaleres 1.15 → 1 samtidig.
 * data-reveal="fade"  Opp 40 px og opasitet 0 → 1.
 * data-stagger[="0.08"] på en forelder: alle data-reveal="fade" inni spilles som én
 *                     gruppe med forskyvning (sekunder) når forelderen kommer i syne.
 *
 * Spilles én gang. Etterpå fjernes alle inline-stiler, så CSS-en eier elementet igjen.
 */
import { gsap, KURVE, alle, klar, vist, erVist, iBefaring, type Opprydding } from "./felles";

const START = "top 85%";

function clip(el: HTMLElement) {
  const media = el.querySelector<HTMLElement>("[data-reveal-indre], img, video, picture, svg");
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: START, once: true },
    onComplete() {
      gsap.set(el, { clearProps: "clipPath" });
      if (media) gsap.set(media, { clearProps: "scale" });
      vist(el);
    },
  });
  tl.fromTo(
    el,
    { clipPath: "inset(100% 0% 0% 0%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: KURVE.innUt },
  );
  if (media) tl.fromTo(media, { scale: 1.15 }, { scale: 1, duration: 1.6, ease: KURVE.ut }, 0);
  klar(el);
}

function fade(mal: HTMLElement[], trigger: HTMLElement, stagger: number) {
  gsap.fromTo(
    mal,
    // opacity, ikke autoAlpha (bevegelse wow-r9): med visibility: hidden hoppet Tab over lenker i
    // blokker som ikke var rullet inn ennå. Nå får de fokus, nettleseren ruller dit, og blokken vises.
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.95,
      ease: KURVE.ut,
      stagger,
      scrollTrigger: { trigger, start: START, once: true },
      onComplete() {
        gsap.set(mal, { clearProps: "transform,opacity" });
        mal.forEach(vist);
      },
    },
  );
  mal.forEach(klar);
}

export function startReveal(): Opprydding | void {
  for (const el of alle('[data-reveal="clip"]')) if (!erVist(el) && !iBefaring(el)) clip(el);

  const iGruppe = new Set<HTMLElement>();
  for (const gruppe of alle("[data-stagger]")) {
    const barn = alle('[data-reveal="fade"]', gruppe).filter(
      (b) => b.parentElement?.closest("[data-stagger]") === gruppe && !erVist(b) && !iBefaring(b),
    );
    // data-stagger og data-reveal="fade" på samme element: barna er gruppen.
    if (gruppe.dataset.reveal === "fade") {
      if (!barn.length) barn.push(...(Array.from(gruppe.children) as HTMLElement[]));
      klar(gruppe);
    }
    if (!barn.length) continue;
    barn.forEach((b) => iGruppe.add(b));
    const s = parseFloat(gruppe.dataset.stagger ?? "");
    fade(barn, gruppe, Number.isFinite(s) ? s : 0.08);
  }

  for (const el of alle('[data-reveal="fade"]')) {
    if (iGruppe.has(el) || erVist(el) || iBefaring(el) || el.hasAttribute("data-stagger")) continue;
    fade([el], el, 0);
  }
}
