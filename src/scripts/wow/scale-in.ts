/**
 * data-scale-in
 *
 * Flaten vokser fra 0.92 til 1 mens den rulles inn, og hjørnene går fra 32 px
 * til rette. Hjørnene lages med clip-path (inset … round), ikke border-radius,
 * så det bare er transform og clip-path som endres per bilde. Scrub: følger
 * rullingen begge veier.
 */
import { gsap, KURVE, alle } from "./felles";

export function startScaleIn(): void {
  for (const el of alle("[data-scale-in]")) {
    gsap.fromTo(
      el,
      { scale: 0.92, clipPath: "inset(0% 0% 0% 0% round 32px)" },
      {
        scale: 1,
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        ease: KURVE.scrub,
        scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub: 0.6 },
      },
    );
  }
}
