/**
 * Laster scenene etter filmen på forsiden (runde wow-r7 «Lampa») først når de nærmer seg.
 *
 * Seksjonskomponentene (Arbeid, Garanti, Prosess) importerer denne fila. Den finner
 * elementer med data-seksjon="<navn>" og henter modulen for navnet når elementet er 1,5
 * skjermhøyder unna, så forsidens JS ved load ikke vokser (mål: ≤ 70 kB gzip). Modulene
 * deler GSAP med index.ts (felles.ts), så den lastes ikke to ganger.
 *
 *   drift     den levende lampa i Arbeid. Funksjon, ikke bevegelse: måler også ved redusert
 *             bevegelse (uten puls).
 *   garanti   strektegningen som fylles. Bare med full bevegelse og scene-klassene.
 *   prosess   datohjulet. Bare med full bevegelse og scene-klassene.
 *
 * Scenene er festet med CSS og har ferdig tilstand som standard; modulen setter starttilstanden
 * selv mens seksjonen ennå er under synsfeltet. Kommer den ikke, står scenen ferdig.
 */
type Modul = { start: (el: HTMLElement) => void };

const MODULER: Record<string, () => Promise<Modul>> = {
  drift: () => import("./drift"),
  garanti: () => import("./garanti"),
  prosess: () => import("./prosess"),
};

/** Scener som bare spilles med bevegelse. */
const BEVEGELSE = new Set(["garanti", "prosess"]);

function bevegelse(): boolean {
  const c = document.documentElement.classList;
  return (
    c.contains("wow-js") &&
    !c.contains("wow-spar") &&
    !c.contains("wow-sent") &&
    matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}

function start() {
  const elementer = Array.from(document.querySelectorAll<HTMLElement>("[data-seksjon]"));
  if (!elementer.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (oppf) => {
      for (const o of oppf) {
        if (!o.isIntersecting) continue;
        io.unobserve(o.target);
        const el = o.target as HTMLElement;
        const hent = MODULER[el.dataset.seksjon ?? ""];
        if (!hent) continue;
        hent()
          .then((m) => m.start(el))
          .catch(() => {
            /* Modulen kom ikke: scenen står ferdig, som uten JS. */
          });
      }
    },
    { rootMargin: "0px 0px 150% 0px" },
  );
  for (const el of elementer) {
    const navn = el.dataset.seksjon ?? "";
    if (!(navn in MODULER)) continue;
    if (BEVEGELSE.has(navn) && !bevegelse()) continue;
    io.observe(el);
  }
}

if (!(window as unknown as { __wowSeksjoner?: boolean }).__wowSeksjoner) {
  (window as unknown as { __wowSeksjoner?: boolean }).__wowSeksjoner = true;
  start();
}
