/**
 * Egen peker (markup: src/components/wow/Peker.astro).
 *
 * En liten prikk følger musa med litt etterslep. Over lenker og knapper blir den
 * en ring; over medier (img, video, data-karusell) og alt med data-peker blir den
 * en stor fylt sirkel. data-peker="Se" setter et ord i sirkelen.
 *
 * Systempekeren skjules ikke: prikken er et tillegg, ikke en erstatning.
 * Bare fin peker og uten redusert bevegelse (index.ts styrer det).
 */
import { gsap, html, type Opprydding } from "./felles";

const LENKE = "a[href], button, summary, label, [role='button'], input, select, textarea";
const MEDIE = "[data-peker], img, video, picture, [data-karusell]";

export function startPeker(): Opprydding | void {
  const rot = document.querySelector<HTMLElement>("[data-wow-peker]");
  if (!rot) return;
  const tekst = rot.querySelector<HTMLElement>("[data-peker-tekst]");
  html.classList.add("wow-peker-pa");

  const xTo = gsap.quickTo(rot, "x", { duration: 0.35, ease: "power3" });
  const yTo = gsap.quickTo(rot, "y", { duration: 0.35, ease: "power3" });
  let forste = true;

  const flytt = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (forste) {
      // Første bevegelse: hopp rett dit, ikke fly inn fra hjørnet.
      gsap.set(rot, { x: e.clientX, y: e.clientY });
      forste = false;
    }
    xTo(e.clientX);
    yTo(e.clientY);
    if (rot.dataset.synlig === undefined) rot.dataset.synlig = "";
  };

  const over = (e: PointerEvent) => {
    // Nærmeste vinner: en lenke inni et kort med data-peker er en lenke.
    const mal = e.target instanceof Element ? e.target.closest<HTMLElement>(`${LENKE}, ${MEDIE}`) : null;
    let tilstand = "";
    let ord = "";
    if (mal) {
      const medie = mal.matches(MEDIE);
      tilstand = medie ? "medie" : "lenke";
      // Ordet kan stå på en forelder: <figure data-peker="Se"><img></figure>.
      const merket = mal.closest<HTMLElement>("[data-peker]");
      ord = merket?.dataset.peker ?? (mal.closest("[data-karusell]") ? "Dra" : "");
      if (ord) tilstand = "medie";
    }
    if (rot.dataset.tilstand !== tilstand) rot.dataset.tilstand = tilstand;
    if (tekst && tekst.textContent !== ord) tekst.textContent = ord;
  };

  const ut = (e: PointerEvent) => {
    if (!e.relatedTarget) delete rot.dataset.synlig;
  };

  window.addEventListener("pointermove", flytt, { passive: true });
  document.addEventListener("pointerover", over, { passive: true });
  document.addEventListener("pointerout", ut, { passive: true });

  return () => {
    window.removeEventListener("pointermove", flytt);
    document.removeEventListener("pointerover", over);
    document.removeEventListener("pointerout", ut);
    html.classList.remove("wow-peker-pa");
    delete rot.dataset.synlig;
    delete rot.dataset.tilstand;
  };
}
