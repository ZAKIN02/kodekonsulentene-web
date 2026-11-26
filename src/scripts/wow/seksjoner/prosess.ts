/**
 * «Fra samtale til lansering» på forsiden (runde wow-r7 «Lampa», historie-manus.md del 5).
 *
 * Markup: Prosess.astro med `hjul`. Datohjulet (data-hjul-rull) har verdiene «I dag», dagene fram
 * til prototypen og ukene fram til lanseringen (prosessdatoer.ts, hjulVerdier). Rullingen dreier
 * hjulet fram én verdi om gangen, med et lite klikk i hver, og holder ved de tre som betyr noe:
 *
 *   0,00–0,10  «I dag» (samtalen)
 *   0,10–0,38  dagene ruller fram til prototypen
 *   0,38–0,50  prototypedagen står
 *   0,50–0,80  ukene ruller fram til lanseringsuka
 *   0,80–1,00  lanseringsuka står
 *
 * Prikken går langs streken mellom punktene i stegene, og stegene den har nådd, får
 * data-hjul-naadd. Desktop: hele scenen er festet (CSS sticky, --wow-scene-hjul). Mobil: bare
 * hjulet står fast øverst mens stegene ruller forbi under det. Ruller du opp, går datoene tilbake.
 *
 * Datoene regnes på nytt fra nettleserens dato (samme funksjoner som ved bygg), så siden aldri
 * viser datoer fra dagen den ble bygget. Hjulet er aria-hidden; stegene bærer datoene.
 * Ved redusert bevegelse, Save-Data eller lav skjerm: ingen hjul, stegene står som før.
 */
import { gsap, ScrollTrigger } from "../felles";
import { hjulVerdier, prototypeDeler, prosessdatoer } from "../../../components/wow/side/prosessdatoer";

const MQ_SCENE = "(prefers-reduced-motion: no-preference) and (min-height: 720px)";
const MQ_MOBIL = "(max-width: 1023.98px)";

/** Rulleandel → plass i hjulet (0–6), med hold ved i dag, prototypen og lanseringen. */
const KART: [number, number][] = [
  [0, 0],
  [0.1, 0],
  [0.38, 3],
  [0.5, 3],
  [0.8, 6],
  [1, 6],
];

function plass(p: number): number {
  for (let i = 1; i < KART.length; i++) {
    const [p0, v0] = KART[i - 1];
    const [p1, v1] = KART[i];
    if (p <= p1) return v0 + ((v1 - v0) * (p - p0)) / Math.max(p1 - p0, 1e-6);
  }
  return KART[KART.length - 1][1];
}

/** Hjulet klikker: hver verdi låser seg, i stedet for å gli jevnt forbi. */
function klikk(f: number): number {
  const hel = Math.floor(f);
  const x = f - hel;
  const e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  return hel + e;
}

/** Plass i hjulet → steg langs streken (0 samtale, 1 prototype, 2 bygging, 3 lansering). */
function stegPlass(w: number): number {
  if (w <= 3) return w / 3;
  if (w <= 4) return 1 + (w - 3);
  return 2 + (w - 4) / 2;
}

function oppdaterDatoer(seksjon: HTMLElement, start: string) {
  const naa = new Date();
  const verdier = hjulVerdier(start, naa);
  seksjon.querySelectorAll<HTMLElement>(".wow-hjul__verdi").forEach((li, i) => {
    if (verdier[i] && li.textContent !== verdier[i].tekst) li.textContent = verdier[i].tekst;
  });
  const proto = seksjon.querySelector<HTMLElement>('[data-steg="prototype"]');
  const deler = prototypeDeler(naa);
  const dag = proto?.querySelector<HTMLElement>(".wow-steg__dag");
  const dato = proto?.querySelector<HTMLElement>("[data-steg-naar]");
  if (dag && dag.textContent !== deler.dag) dag.textContent = deler.dag;
  if (dato && dato.textContent !== deler.dato) dato.textContent = deler.dato;
  const lans = seksjon.querySelector<HTMLElement>('[data-steg="lansering"] [data-steg-naar]');
  const uke = `uke ${prosessdatoer(naa).lanseringsuke}`;
  if (lans && lans.textContent !== uke) lans.textContent = uke;
}

export function start(seksjon: HTMLElement) {
  const scene = seksjon.querySelector<HTMLElement>("[data-hjul]");
  const rull = seksjon.querySelector<HTMLElement>("[data-hjul-rull]");
  const etikett = seksjon.querySelector<HTMLElement>("[data-hjul-etikett]");
  const prikk = seksjon.querySelector<HTMLElement>("[data-hjul-prikk]");
  const lop = seksjon.querySelector<HTMLElement>(".wow-hjul__lop");
  if (!scene || !rull || !lop) return;

  oppdaterDatoer(seksjon, scene.dataset.hjulStart ?? "");

  const verdier = Array.from(rull.querySelectorAll<HTMLElement>(".wow-hjul__verdi"));
  const steg = Array.from(seksjon.querySelectorAll<HTMLElement>(".wow-steg"));
  const punkter = steg.map((s) => s.querySelector<HTMLElement>(".wow-steg__punkt"));
  const navn = steg.map((s) => s.querySelector(".wow-steg__navn")?.textContent?.trim() ?? "");
  // Hvilket steg hver verdi i hjulet hører til (0–3): i dag, dagene og prototypen, ukene, lanseringen.
  const sone = (i: number) => (i === 0 ? 0 : i <= 3 ? 1 : i < verdier.length - 1 ? 2 : 3);

  const mm = gsap.matchMedia();
  mm.add({ scene: MQ_SCENE, mobil: MQ_MOBIL }, (ctx) => {
    const { scene: erScene, mobil } = ctx.conditions as { scene: boolean; mobil: boolean };
    if (!erScene || !seksjon.matches(".wow-prosess--hjul") || getComputedStyle(rull).display === "none") return;

    let hoyde = 0;
    let sentre: { x: number; y: number }[] = [];
    const mal = () => {
      hoyde = verdier[0]?.offsetHeight ?? 0;
      const l = lop.getBoundingClientRect();
      sentre = punkter.map((p) => {
        const r = p?.getBoundingClientRect();
        return r ? { x: r.left + r.width / 2 - l.left, y: r.top + r.height / 2 - l.top } : { x: 0, y: 0 };
      });
    };
    mal();

    // Svakeste opasitet for en synlig dato (--wow-hjul-svakest i tokens-wow.css, kontrast ≥ 4,5:1).
    const svakest = parseFloat(getComputedStyle(rull).getPropertyValue("--wow-hjul-svakest")) || 0.5;
    let sistAktiv = -1;
    const tegn = (p: number) => {
      const w = klikk(plass(p));
      gsap.set(rull, { y: -w * hoyde });
      verdier.forEach((li, i) => {
        const d = i - w;
        const a = Math.abs(d);
        // Fra 1 (i vinduet) til «svakest» (én hel plass unna, altså akkurat ute av vinduet).
        // Lenger unna er datoen ikke synlig og skjules helt, i stedet for å stå igjen som svak
        // tekst under kontrastkravet.
        li.style.opacity = String(1 - Math.min(a, 1) * (1 - svakest));
        li.style.visibility = a >= 1 ? "hidden" : "";
        li.style.transform = mobil ? "" : `rotateX(${(-d * 32).toFixed(2)}deg)`;
      });
      const aktiv = Math.round(w);
      if (aktiv !== sistAktiv) {
        sistAktiv = aktiv;
        verdier.forEach((li, i) => li.toggleAttribute("data-hjul-aktiv", i === aktiv));
        const z = sone(aktiv);
        if (etikett && navn[z]) etikett.textContent = navn[z];
        steg.forEach((s, i) => s.toggleAttribute("data-hjul-naadd", i <= z));
      }
      // Prikken mellom punktene.
      const s = Math.min(stegPlass(w), sentre.length - 1);
      const i0 = Math.floor(s);
      const i1 = Math.min(i0 + 1, sentre.length - 1);
      const t = s - i0;
      const a0 = sentre[i0];
      const a1 = sentre[i1];
      if (prikk && a0 && a1) gsap.set(prikk, { x: a0.x + (a1.x - a0.x) * t, y: a0.y + (a1.y - a0.y) * t });
    };

    const st = ScrollTrigger.create({
      trigger: mobil ? lop : scene,
      start: mobil ? "top 55%" : "top top",
      end: mobil ? "bottom 55%" : "bottom bottom",
      onRefresh: (self) => {
        mal();
        tegn(self.progress);
      },
    });
    const proxy = { p: 0 };
    const tw = gsap.to(proxy, {
      p: 1,
      ease: "none",
      scrollTrigger: { trigger: st.trigger, start: st.vars.start, end: st.vars.end, scrub: 0.5 },
      onUpdate: () => tegn(proxy.p),
    });
    seksjon.setAttribute("data-hjul-klar", "");
    tegn(0);

    return () => {
      st.kill();
      tw.scrollTrigger?.kill();
      tw.kill();
      seksjon.removeAttribute("data-hjul-klar");
      gsap.set(rull, { clearProps: "transform" });
      verdier.forEach((li) => {
        li.style.opacity = "";
        li.style.visibility = "";
        li.style.transform = "";
        li.toggleAttribute("data-hjul-aktiv", false);
      });
      steg.forEach((s) => s.removeAttribute("data-hjul-naadd"));
      if (prikk) gsap.set(prikk, { clearProps: "transform" });
    };
  });
}
