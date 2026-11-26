/**
 * data-pin="befaring"
 *
 * Signaturøyeblikket. Seksjonen festes mens du ruller, og tidslinjen spilles av
 * rullingen (scrub, begge veier):
 *
 *   1. data-befaring-skriv="kunde.no"   teksten skrives bokstav for bokstav
 *   2. data-befaring-steg="1".."n"     stegene fylles i nummerrekkefølge; inni hvert steg
 *        data-befaring-fyll             fylles fra venstre (scaleX 0 → 1)
 *        data-befaring-verdi            verdien låser seg på plass (glir opp 0,4 linje og tones inn)
 *        data-draw                      tegnes
 *        data-count                     teller opp når steget fylles
 *      data-befaring-lander             på et steg (fastprisen): lander med en tydelig landing,
 *                                       liten skala (1,06 → 1) og et lysstreif over flaten,
 *                                       spilt på tid i det rullingen passerer det. Steget får
 *                                       data-befaring-landet når det har landet.
 *   3. data-draw direkte i seksjonen (ikke i et steg) tegnes over hele tidslinjen.
 *
 * Venter-tilstand fra start: står data-befaring-venter på seksjonen, eller har stegene
 * data-befaring-status="venter" i markupen, er radene synlige fra første stund (etikett,
 * tom linje, tom verdi) og bare fyllet, linjen og verdien spilles. Uten det tones hele
 * steget inn som før. Stilen for «venter» eier byggeren (wow.css).
 *
 * Tilstand for stil: hvert steg får data-befaring-status="venter" | "aktiv" | "fylt",
 * skrivefeltet får data-befaring-status="skrevet" når det er ferdig, og seksjonen
 * får data-befaring-ferdig når alt er fylt.
 *
 * Desktop (≥ 768 px): festet i data-pin-lengde vh (standard 160). Hele utfyllingen er
 * ferdig ved ca. 85 % av festingen, så fastprisen står en stund før seksjonen slippes.
 * Mobil (< 768 px): ingen festing; hvert steg spilles når det kommer i syne.
 * Redusert bevegelse og uten JavaScript: alt står ferdig.
 */
import { gsap, KURVE, alle, klar, skjermlesertekst, type Opprydding } from "./felles";
import { figurer, tegn, nullstill } from "./draw";
import { spillTall } from "./count";

interface Skriv {
  el: HTMLElement;
  tekst: string;
  ut: HTMLElement;
  original: Node[];
}

interface Steg {
  el: HTMLElement;
  fyll: HTMLElement[];
  verdier: HTMLElement[];
  linjer: SVGGeometryElement[];
  tall: HTMLElement[];
  lander: boolean;
  lys: HTMLElement | null;
}

interface Befaring {
  rot: HTMLElement;
  venter: boolean;
  skriv: Skriv[];
  steg: Steg[];
  linjer: SVGGeometryElement[];
}

const RØTTER = '[data-pin="befaring"]';

function lagSkriv(el: HTMLElement): Skriv {
  const tekst = (el.dataset.befaringSkriv || el.textContent || "").trim();
  const original = Array.from(el.childNodes);
  // Spøkelset holder full bredde fra start, så ingenting rundt flytter seg mens
  // teksten skrives. Skjermlesere får hele teksten fra første stund.
  const boks = document.createElement("span");
  boks.className = "wow-skriv";
  boks.setAttribute("aria-hidden", "true");
  const spokelse = document.createElement("span");
  spokelse.className = "wow-skriv__spokelse";
  spokelse.textContent = tekst;
  const ut = document.createElement("span");
  ut.className = "wow-skriv__tekst";
  boks.append(spokelse, ut);
  el.replaceChildren(skjermlesertekst(tekst), boks);
  klar(el);
  return { el, tekst, ut, original };
}

/** Lysstreifet over landingsflaten: et eget lag som klipper seg selv, så steget ikke endres. */
function lagLys(el: HTMLElement): HTMLElement {
  if (getComputedStyle(el).position === "static") el.style.position = "relative";
  const lys = document.createElement("span");
  lys.className = "wow-lys";
  lys.setAttribute("aria-hidden", "true");
  lys.append(document.createElement("span"));
  el.append(lys);
  return lys;
}

function forbered(rot: HTMLElement): Befaring {
  // Generelle effekter står av inni befaringen; slipp startstilene deres.
  alle("[data-split], [data-reveal]", rot).forEach(klar);
  const stegEl = alle("[data-befaring-steg]", rot).sort(
    (a, b) => Number(a.dataset.befaringSteg) - Number(b.dataset.befaringSteg),
  );
  // Leses før skriptet setter noen status selv.
  const venter = rot.hasAttribute("data-befaring-venter") || stegEl.some((s) => s.dataset.befaringStatus === "venter");
  const steg = stegEl.map((el) => {
    const linjer = alle("[data-draw]", el).flatMap((d) => {
      klar(d);
      return figurer(d);
    });
    klar(el);
    const lander = el.hasAttribute("data-befaring-lander");
    const verdier = alle("[data-befaring-verdi]", el);
    verdier.forEach(klar);
    return {
      el,
      fyll: alle("[data-befaring-fyll]", el),
      verdier,
      linjer,
      tall: alle("[data-count]", el),
      lander,
      lys: lander ? lagLys(el) : null,
    };
  });
  const linjer = alle("[data-draw]", rot)
    .filter((d) => !d.closest("[data-befaring-steg]"))
    .flatMap((d) => {
      klar(d);
      return figurer(d);
    });
  return { rot, venter, skriv: alle("[data-befaring-skriv]", rot).map(lagSkriv), steg, linjer };
}

function rydd(b: Befaring) {
  for (const s of b.skriv) {
    s.el.replaceChildren(...s.original);
    delete s.el.dataset.befaringStatus;
  }
  nullstill([...b.linjer, ...b.steg.flatMap((s) => s.linjer)]);
  for (const s of b.steg) {
    s.lys?.remove();
    s.el.removeAttribute("data-befaring-landet");
  }
  gsap.set(
    b.steg.flatMap((s) => [s.el, ...s.fyll, ...s.verdier]),
    { clearProps: "transform,opacity,visibility,position" },
  );
}

const skrivTween = (s: Skriv, vars: gsap.TweenVars) => {
  const p = { n: 0 };
  return gsap.to(p, {
    n: s.tekst.length,
    ease: "none",
    ...vars,
    onUpdate() {
      const n = Math.round(p.n);
      s.ut.textContent = s.tekst.slice(0, n);
      if (n >= s.tekst.length) s.el.dataset.befaringStatus = "skrevet";
      else delete s.el.dataset.befaringStatus;
    },
  });
};

/**
 * Hele steget tones inn (når det ikke står i venter-tilstand fra start). Landeren kommer ovenfra.
 * Bare opasitet, aldri visibility: en lenke i et steg (fastprisens «Book 20 minutter») skal kunne
 * nås med Tab selv om rullingen ikke har kommet dit (revisor r3 #5).
 */
const fra = (s: Steg) => ({ opacity: 0, y: s.lander ? -24 : 20 });
const til = { opacity: 1, y: 0 };
const VERDI_FRA = { yPercent: 40, opacity: 0 };
const VERDI_TIL = { yPercent: 0, opacity: 1 };

function settStatus(el: HTMLElement, status: "venter" | "aktiv" | "fylt") {
  if (el.dataset.befaringStatus !== status) el.dataset.befaringStatus = status;
}

/**
 * Landingen spilles på tid, ikke på rulling: et nedslag som følger rullingen sakte, leses
 * ikke som et nedslag. Baklengs settes steget tilbake til før landingen.
 */
function land(s: Steg, fram: boolean) {
  const strale = s.lys?.firstElementChild as HTMLElement | null;
  // Bare landingens egne egenskaper: inntoningen av steget (opasitet, y) skal få gå ferdig.
  gsap.killTweensOf(s.el, "scale");
  if (strale) gsap.killTweensOf(strale);
  if (!fram) {
    s.el.removeAttribute("data-befaring-landet");
    gsap.set(s.el, { scale: 1 });
    if (strale) gsap.set(strale, { xPercent: -100, opacity: 0 });
    return;
  }
  s.el.setAttribute("data-befaring-landet", "");
  gsap.fromTo(s.el, { scale: 1.06 }, { scale: 1, duration: 0.6, ease: KURVE.ut, transformOrigin: "50% 50%" });
  if (strale) {
    gsap.fromTo(strale, { xPercent: -100, opacity: 1 }, { xPercent: 100, duration: 0.75, ease: KURVE.innUt });
    gsap.to(strale, { opacity: 0, duration: 0.25, delay: 0.5, ease: "power1.out" });
  }
}

/** Desktop: festet seksjon, tidslinjen styres av rullingen. */
export function befaringPin(): Opprydding {
  const alleB = alle(RØTTER).map(forbered);
  for (const b of alleB) {
    const lengde = parseFloat(b.rot.dataset.pinLengde ?? "") || 160;
    const grenser: { start: number; slutt: number }[] = [];
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      onUpdate() {
        const t = this.time();
        b.steg.forEach((s, i) => {
          const g = grenser[i];
          settStatus(s.el, t >= g.slutt ? "fylt" : t > g.start ? "aktiv" : "venter");
        });
        b.rot.toggleAttribute("data-befaring-ferdig", b.steg.every((s) => s.el.dataset.befaringStatus === "fylt"));
      },
      scrollTrigger: {
        trigger: b.rot,
        pin: true,
        start: "top top",
        end: () => `+=${(innerHeight * lengde) / 100}`,
        scrub: 0.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Tett og raskt: adressen på 0,6, så ett steg hver 0,55 med fyll på 0,4.
    let t = 0;
    for (const s of b.skriv) tl.add(skrivTween(s, { duration: 0.6 }), 0);
    if (b.skriv.length) t = 0.7;

    for (const s of b.steg) {
      // I venter-tilstand står alle stegene synlige fra start, også fastprisen: bare målingen
      // inni spilles, og landingen (skala og lysstreif) spilles på tid.
      if (!b.venter) {
        gsap.set(s.el, fra(s));
        tl.to(s.el, { ...til, duration: s.lander ? 0.25 : 0.35, ease: "power2.out" }, t);
      }
      if (s.fyll.length) tl.fromTo(s.fyll, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.4, ease: "power1.inOut" }, t + 0.05);
      if (s.linjer.length) tl.add(tegn(s.linjer, { duration: 0.4 }), t + 0.05);
      if (s.verdier.length) {
        gsap.set(s.verdier, VERDI_FRA);
        tl.to(s.verdier, { ...VERDI_TIL, duration: 0.2, ease: "power2.out" }, t + 0.35);
      }
      for (const el of s.tall) tl.call(() => void spillTall(el), [], t + 0.15);
      if (s.lander) {
        tl.call(() => land(s, (tl.scrollTrigger?.direction ?? 1) > 0), [], t + 0.25);
      }
      grenser.push({ start: t, slutt: t + 0.45 });
      t += 0.55;
    }
    if (b.linjer.length) tl.add(tegn(b.linjer, { duration: Math.max(t, 1) }), 0);
    // Ro på slutten, så fastprisen står før seksjonen slippes.
    tl.to({}, { duration: 0.5 });
    b.steg.forEach((s) => settStatus(s.el, "venter"));
  }
  return () => alleB.forEach(rydd);
}

/** Mobil: ingen festing. Hvert steg spilles én gang når det kommer i syne. */
export function befaringMobil(): Opprydding {
  const alleB = alle(RØTTER).map(forbered);
  for (const b of alleB) {
    for (const s of b.skriv) {
      skrivTween(s, {
        duration: Math.min(0.9, 0.06 * s.tekst.length + 0.2),
        scrollTrigger: { trigger: s.el, start: "top 85%", once: true },
      });
    }
    for (const s of b.steg) {
      settStatus(s.el, "venter");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: s.el, start: "top 85%", once: true },
        onStart: () => settStatus(s.el, "aktiv"),
        onComplete() {
          settStatus(s.el, "fylt");
          b.rot.toggleAttribute("data-befaring-ferdig", b.steg.every((x) => x.el.dataset.befaringStatus === "fylt"));
        },
      });
      if (!b.venter) tl.fromTo(s.el, fra(s), { ...til, duration: 0.5, ease: KURVE.ut });
      if (s.fyll.length) tl.fromTo(s.fyll, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.6, ease: KURVE.innUt }, 0.1);
      if (s.linjer.length) tl.add(tegn(s.linjer, { duration: 0.6, ease: KURVE.innUt }), 0.1);
      if (s.verdier.length) tl.fromTo(s.verdier, VERDI_FRA, { ...VERDI_TIL, duration: 0.35, ease: KURVE.ut }, 0.45);
      for (const el of s.tall) tl.call(() => void spillTall(el), [], 0.15);
      if (s.lander) tl.call(() => land(s, true), [], 0.2);
    }
    if (b.linjer.length) {
      tegn(b.linjer, { scrollTrigger: { trigger: b.rot, start: "top 70%", end: "bottom 70%", scrub: 0.4 } });
    }
  }
  return () => alleB.forEach(rydd);
}

/** Redusert bevegelse: alt står ferdig, og tilstanden sier det. */
export function befaringFerdig(): void {
  for (const rot of alle(RØTTER)) {
    alle("[data-befaring-steg]", rot).forEach((s) => {
      settStatus(s, "fylt");
      if (s.hasAttribute("data-befaring-lander")) s.setAttribute("data-befaring-landet", "");
    });
    alle("[data-befaring-skriv]", rot).forEach((s) => (s.dataset.befaringStatus = "skrevet"));
    rot.setAttribute("data-befaring-ferdig", "");
  }
}
