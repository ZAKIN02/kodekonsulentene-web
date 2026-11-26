/**
 * data-parallax="0.2"
 *
 * Elementet forskyves loddrett med rullingen (scrub), så det ser ut til å ligge
 * bak resten. Hele utslaget er faktor × forelderens høyde: 0.2 i en beholder på
 * 600 px gir 120 px, fra −60 til +60. Negativ faktor = foran. Grense ±1.
 *
 * Forskyvningen er null når forelderen står midt i vinduet, så posisjonen i layouten
 * er den du ser når elementet er i fokus. Trigger er forelderen, som ikke flytter seg.
 *
 * Til bilder: legg elementet i en beholder med overflow: hidden og gi det høyden
 * (100 + 100 × faktor) %, altså 120 % ved 0.2. Da vises kantene aldri.
 */
import { gsap, KURVE, alle } from "./felles";

export function startParallax(mobil: boolean): void {
  for (const el of alle("[data-parallax]")) {
    const raa = parseFloat(el.dataset.parallax ?? "");
    const faktor = Math.max(-1, Math.min(1, Number.isFinite(raa) ? raa : 0.2)) * (mobil ? 0.6 : 1);
    if (!faktor) continue;
    const trigger = el.parentElement ?? el;
    const halv = () => (faktor * trigger.offsetHeight) / 2;
    gsap.fromTo(
      el,
      { y: () => -halv() },
      {
        y: () => halv(),
        ease: KURVE.scrub,
        scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      },
    );
  }
}
