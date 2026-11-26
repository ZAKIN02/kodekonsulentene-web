/**
 * data-magnetic[="0.35"]
 *
 * Knappen trekkes mot pekeren mens pekeren er over den, og glir tilbake når den
 * går. Verdien er styrken (andel av avstanden fra midten, standard 0.35).
 * Bare med fin peker (mus/styreflate) og uten redusert bevegelse – index.ts styrer det.
 * Et barn med data-magnetic-tekst følger med litt lenger, så teksten får dybde.
 */
import { gsap, alle, type Opprydding } from "./felles";

export function startMagnetic(): Opprydding {
  const av: Opprydding[] = [];

  for (const el of alle("[data-magnetic]")) {
    const raa = parseFloat(el.dataset.magnetic ?? "");
    const styrke = Number.isFinite(raa) && raa > 0 ? Math.min(raa, 1) : 0.35;
    const tekst = el.querySelector<HTMLElement>("[data-magnetic-tekst]");
    const opt = { duration: 0.6, ease: "power3" };
    const xTo = gsap.quickTo(el, "x", opt);
    const yTo = gsap.quickTo(el, "y", opt);
    const txTo = tekst ? gsap.quickTo(tekst, "x", opt) : null;
    const tyTo = tekst ? gsap.quickTo(tekst, "y", opt) : null;

    const flytt = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      // Trekk fra dagens forskyvning, ellers jager knappen sin egen skygge.
      const cx = r.left + r.width / 2 - (gsap.getProperty(el, "x") as number);
      const cy = r.top + r.height / 2 - (gsap.getProperty(el, "y") as number);
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      xTo(dx * styrke);
      yTo(dy * styrke);
      txTo?.(dx * styrke * 0.4);
      tyTo?.(dy * styrke * 0.4);
    };
    const slipp = () => {
      xTo(0);
      yTo(0);
      txTo?.(0);
      tyTo?.(0);
    };
    el.addEventListener("pointermove", flytt);
    el.addEventListener("pointerleave", slipp);
    av.push(() => {
      el.removeEventListener("pointermove", flytt);
      el.removeEventListener("pointerleave", slipp);
      gsap.set([el, tekst].filter(Boolean), { clearProps: "transform" });
    });
  }

  return () => av.forEach((f) => f());
}
