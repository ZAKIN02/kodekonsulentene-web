/**
 * Garantien på forsiden (runde wow-r7 «Lampa», historie-manus.md del 5, Garanti).
 *
 * Markup: Garanti.astro med `tegning`. Scenen (data-garanti-scene) er festet med CSS
 * (position: sticky, høyde --wow-scene-garanti) bare når html har wow-js og full bevegelse og
 * skjermen er høy nok. Standardtilstanden er ferdig: feltet fylt, setningen hel. Denne modulen
 * setter starttilstanden mens scenen ennå er under synsfeltet (last.ts henter den 1,5 skjerm-
 * høyder før), og lar rullingen spille den, begge veier:
 *
 *   0,00–0,32  strektegningen av en forside tegnes, strek for strek (stroke-dashoffset),
 *              mens scenen kommer inn og de første skjermhøydene den står fast
 *   0,34–0,46  tegningen fylles nedenfra med refleks (clip-path inne i rammen)
 *   0,46–0,58  feltet vokser ut til full bredde
 *   0,56–0,66  teksten kommer
 *   0,68–0,78  ordene løsner; «nei» og «ingenting» blir stående
 *   0,86–0,94  hele setningen kommer tilbake
 *
 * Bare transform, opacity, clip-path og stroke-dashoffset. Ved redusert bevegelse eller lav
 * skjerm rydder gsap.matchMedia opp, og CSS viser feltet ferdig.
 */
import { gsap } from "../felles";

const MQ_SCENE = "(prefers-reduced-motion: no-preference) and (min-height: 560px)";

export function start(seksjon: HTMLElement) {
  const scene = seksjon.querySelector<HTMLElement>("[data-garanti-scene]");
  const stage = seksjon.querySelector<HTMLElement>("[data-garanti-stage]");
  const flate = seksjon.querySelector<HTMLElement>("[data-garanti-flate]");
  if (!scene || !stage || !flate) return;

  const mm = gsap.matchMedia();
  mm.add(MQ_SCENE, () => {
    // Scenen er bare festet når CSS sier det (wow-js, ikke wow-spar/wow-sent).
    if (getComputedStyle(stage).position !== "sticky") return;
    const tegning = Array.from(seksjon.querySelectorAll<SVGSVGElement>("[data-garanti-tegning]")).find(
      (s) => getComputedStyle(s).display !== "none",
    );
    if (!tegning) return;
    const streker = Array.from(tegning.querySelectorAll<SVGGeometryElement>("rect, path, circle"));
    const ramme = tegning.querySelector<SVGGeometryElement>("[data-ramme]") ?? streker[0];
    const tekst = seksjon.querySelectorAll<HTMLElement>("[data-garanti-inngang], [data-garanti-hoved]");
    const gaar = seksjon.querySelectorAll<HTMLElement>('[data-garanti-ord="gaar"]');

    // Rammen i tegningen, målt mot scenen: der fyllingen starter. Måles på nytt ved refresh.
    const innfelt = () => {
      const s = stage.getBoundingClientRect();
      const r = ramme.getBoundingClientRect();
      return {
        t: r.top - s.top,
        h: s.right - r.right,
        b: s.bottom - r.bottom,
        v: r.left - s.left,
        hoyde: r.height,
      };
    };
    const radius = getComputedStyle(seksjon).getPropertyValue("--wow-radius-l").trim() || "0px";
    // tom: null høyde i bunnen av rammen (fyllingen har ikke begynt); ellers hele rammen.
    const klipp = (tom: boolean) => () => {
      const f = innfelt();
      const topp = tom ? f.t + f.hoyde : f.t;
      return `inset(${topp}px ${f.h}px ${f.b}px ${f.v}px round ${radius})`;
    };

    gsap.set(streker, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(flate, { clipPath: klipp(true)() });
    gsap.set(tekst, { autoAlpha: 0, y: 32 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: scene,
        // Tegningen begynner mens scenen kommer inn (fra 75 % av vinduet), så det aldri står en
        // tom, svart skjerm før første strek. Resten skjer mens scenen står fast.
        start: "top 75%",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    // Strekene tegnes i rekkefølge, rammen først. Litt overlapp, så det leses som én hånd.
    const n = streker.length;
    streker.forEach((s, i) => {
      tl.to(s, { strokeDashoffset: 0, duration: 0.12, ease: "power1.inOut" }, 0.02 + (i / n) * 0.18);
    });
    // Fyllingen stiger i rammen, så vokser feltet ut til kantene.
    tl.fromTo(flate, { clipPath: klipp(true) }, { clipPath: klipp(false), duration: 0.12, ease: "power2.inOut" }, 0.34);
    tl.to(flate, { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 0.12, ease: "power2.inOut" }, 0.46);
    tl.to(tekst, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out", stagger: 0.02 }, 0.56);
    // Ordene løsner, de to blir stående, så kommer setningen tilbake.
    tl.to(gaar, { opacity: 0.1, y: -6, duration: 0.08, ease: "power1.out", stagger: { each: 0.004, from: "random" } }, 0.68);
    tl.to(gaar, { opacity: 1, y: 0, duration: 0.08, ease: "power1.out", stagger: { each: 0.004, from: "random" } }, 0.86);
    tl.to({}, { duration: 0.06 }, 0.94);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([...streker, flate, ...tekst, ...gaar], { clearProps: "all" });
    };
  });
}
