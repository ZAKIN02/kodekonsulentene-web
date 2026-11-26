/**
 * data-marquee[="30"]
 *
 * Uendelig løpebånd. Barna til elementet er innholdet; skriptet legger dem i et
 * spor og kloner dem (aria-hidden og inert) til båndet fyller bredden. Verdien er
 * sekunder per runde (standard 30). Retningen følger rulleretningen, og farten
 * øker litt med rullefarten.
 *
 * Stopp (WCAG 2.2.2): båndet stopper når pekeren er over det, når noe inni har
 * fokus, ved trykk på berøringsskjerm, og med en knapp som blir synlig ved Tab.
 * Det står stille når det er utenfor skjermen.
 *
 * Uten JavaScript og med redusert bevegelse rører skriptet ikke elementet;
 * innholdet står som en vanlig rad som kan rulles sidelengs.
 */
import { gsap, ScrollTrigger, alle, klar, type Opprydding } from "./felles";

function bygg(el: HTMLElement): Opprydding {
  const sekunder = parseFloat(el.dataset.marquee ?? "") || 30;
  const original = Array.from(el.childNodes);

  const spor = document.createElement("div");
  spor.className = "wow-marquee__spor";
  const gruppe = document.createElement("div");
  gruppe.className = "wow-marquee__gruppe";
  gruppe.append(...original);
  spor.append(gruppe);

  const knapp = document.createElement("button");
  knapp.type = "button";
  knapp.className = "wow-marquee__stopp";
  knapp.setAttribute("aria-pressed", "false");
  knapp.textContent = "Stopp løpebåndet";

  el.append(spor, knapp);
  klar(el);

  const kloner: HTMLElement[] = [];
  const fyll = () => {
    kloner.forEach((k) => k.remove());
    kloner.length = 0;
    const b = gruppe.offsetWidth || 1;
    const n = Math.ceil(el.offsetWidth / b) + 1;
    for (let i = 0; i < n; i++) {
      const k = gruppe.cloneNode(true) as HTMLElement;
      k.setAttribute("aria-hidden", "true");
      k.inert = true;
      spor.append(k);
      kloner.push(k);
    }
  };
  fyll();

  // fromTo, ikke to: etter invalidate() (ny bredde) skal starten være 0, ikke der sporet står nå.
  const tween = gsap.fromTo(spor, { x: 0 }, {
    x: () => -gruppe.offsetWidth,
    duration: sekunder,
    ease: "none",
    repeat: -1,
    paused: true,
    immediateRender: false,
  });
  // Rom til å spille baklengs: start langt inne i den uendelige gjentakelsen.
  tween.totalTime(sekunder * 1000);

  let retning = 1;
  let stoppetAvBruker = false;
  let holdt = false;
  let synlig = false;
  const oppdater = () => (synlig && !holdt && !stoppetAvBruker ? tween.resume() : tween.pause());

  const st = ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onToggle(self) {
      synlig = self.isActive;
      oppdater();
    },
    onUpdate(self) {
      const fart = Math.min(Math.abs(self.getVelocity()) / 400, 4);
      retning = self.direction;
      gsap.to(tween, { timeScale: retning * (1 + fart), duration: 0.2, overwrite: true });
      gsap.to(tween, { timeScale: retning, duration: 1.2, delay: 0.2, ease: "power2.out" });
    },
  });

  const hold = (v: boolean) => () => {
    holdt = v;
    oppdater();
  };
  const inn = hold(true);
  const ut = hold(false);
  const veksle = () => {
    stoppetAvBruker = !stoppetAvBruker;
    knapp.setAttribute("aria-pressed", String(stoppetAvBruker));
    knapp.textContent = stoppetAvBruker ? "Start løpebåndet" : "Stopp løpebåndet";
    oppdater();
  };
  const trykk = (e: PointerEvent) => {
    if (e.pointerType === "touch" && e.target !== knapp) veksle();
  };
  el.addEventListener("pointerenter", inn);
  el.addEventListener("pointerleave", ut);
  el.addEventListener("focusin", inn);
  el.addEventListener("focusout", ut);
  el.addEventListener("pointerup", trykk);
  knapp.addEventListener("click", veksle);

  let ventende = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(ventende);
    ventende = requestAnimationFrame(() => {
      fyll();
      tween.invalidate();
    });
  });
  ro.observe(el);

  return () => {
    ro.disconnect();
    st.kill();
    tween.kill();
    el.removeEventListener("pointerenter", inn);
    el.removeEventListener("pointerleave", ut);
    el.removeEventListener("focusin", inn);
    el.removeEventListener("focusout", ut);
    el.removeEventListener("pointerup", trykk);
    spor.remove();
    knapp.remove();
    el.append(...original);
    el.removeAttribute("data-wow-klar");
  };
}

export function startMarquee(): Opprydding {
  const av = alle("[data-marquee]").map(bygg);
  return () => av.forEach((f) => f());
}
