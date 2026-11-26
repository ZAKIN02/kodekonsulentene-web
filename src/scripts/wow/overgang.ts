/**
 * Panelet blir rapporten (kritiker r4 #2). Hentes av scroll-world.ts først når filmen nærmer seg
 * slutten (revisor r4: JS ved load ≤ 70 kB gzip), og bare når siden har en rapport med
 * data-sw-rapport (Befaring.astro).
 *
 * Panelet i filmen (data-sw-maalinger) og rapporten har de samme delene, merket med
 * data-maal-del («0:status», «0:navn», «0:forbehold», «0:spor», «0:verdi» …). Mens filmen går,
 * er panelet det som vises (det står i den festede rammen, så CSS holder det i ro). I det filmen
 * slipper (y = A), skjules panelet, og delene i rapporten står på panelets plass i samme ramme.
 * Radene står øverst i rapporten (bygger wow-r6), med spørsmålet og adressefeltet etter dem, så
 * panelet venter bare til toppluften i #rapport har rullet inn. Når radene har rullet opp til
 * panelet (y = B), følger det radene. I vinduet før B (VINDU skjermhøyder) glir og skaleres
 * delene fra panelets form til radenes, med toppen festet:
 *
 *   topp(y) = min(panelets topp, radenes topp)            ingen dupp, aldri ned og opp igjen
 *   e       = kurveInnUt((y - (B - VINDU)) / VINDU)
 *   del     = topp(y) + lerp(avstand i panelet, avstand i rapporten, e), x og skala likeså
 *
 * Tekst skaleres likt i begge retninger (høydeforholdet), målelinja bare på bredden. Panelets
 * bakgrunn (data-sw-bak) følger med og tones bort. Bare transform og opacity. Før A er delene i
 * rapporten usynlige, så ingen skjerm viser målingene to ganger; etter B står rapporten som uten
 * JavaScript.
 *
 * Delene har ingen CSS-overgang på transform mens dette eier dem (wow-bevegelse.css,
 * [data-sw-overgang] [data-maal-del]): ellers henger haken etter og står over etiketten.
 *
 * Tilstand for stil og test: data-sw-overgang="for" | "under" | "etter" på rapporten, og
 * data-overgang på panelet når det er skjult.
 */
import { ScrollTrigger, alle, type Opprydding } from "./felles";

/** Vinduet før radene når panelet, der delene går fra panelets form til radenes (skjermhøyder). */
const VINDU = 0.4;

interface Rekt {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Par {
  del: HTMLElement;
  fra: HTMLElement;
  type: string;
  S: Rekt;
  O: Rekt;
}

const klem = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const myk = (x: number) => {
  x = klem(x);
  return x * x * (3 - 2 * x);
};
/** cubic-bezier(0.65, 0, 0.35, 1), samme kurve som --wow-kurve-inn-ut (del 8: to kurver). */
function innUt(x: number) {
  x = klem(x);
  let a = 0;
  let b = 1;
  for (let i = 0; i < 24; i++) {
    const t = (a + b) / 2;
    const bx = 3 * (1 - t) * (1 - t) * t * 0.65 + 3 * (1 - t) * t * t * 0.35 + t * t * t;
    if (bx < x) a = t;
    else b = t;
  }
  const t = (a + b) / 2;
  return 3 * (1 - t) * t * t + t * t * t;
}

/**
 * @param panel   panelet i filmen (data-sw-maalinger)
 * @param ramme   den festede rammen panelet står i (.sw__ramme)
 * @param slutt   rulleposisjonen (px) der filmen slipper
 */
export function startOvergang(panel: HTMLElement, ramme: HTMLElement, slutt: () => number): Opprydding | void {
  const rapport = document.querySelector<HTMLElement>("[data-sw-rapport]");
  if (!rapport) return;
  const par: Par[] = [];
  for (const fra of alle("[data-maal-del]", panel)) {
    const del = rapport.querySelector<HTMLElement>(`[data-maal-del="${fra.dataset.maalDel}"]`);
    if (del) par.push({ del, fra, type: (fra.dataset.maalDel ?? "").split(":")[1], S: nul(), O: nul() });
  }
  if (!par.length) return;
  const bak = rapport.querySelector<HTMLElement>("[data-sw-bak]");
  const bakMal = bak?.parentElement ?? null;
  let P = nul();
  let R = nul();
  let A = 0;
  let B = 1;
  let V = 0;
  let plass = 0;
  let toppDok = 0;
  let fase = "";

  function nul(): Rekt {
    return { x: 0, y: 0, w: 1, h: 1 };
  }

  /** Panelet relativt til rammen (= skjermen mens rammen er festet), rapporten i dokumentet. */
  function mal() {
    for (const p of par) p.del.style.transform = "";
    if (bak) bak.style.transform = "";
    const rr = ramme.getBoundingClientRect();
    const y = scrollY;
    const iRamme = (el: Element): Rekt => {
      const r = el.getBoundingClientRect();
      return { x: r.left - rr.left, y: r.top - rr.top, w: r.width || 1, h: r.height || 1 };
    };
    const iDok = (el: Element): Rekt => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top + y, w: r.width || 1, h: r.height || 1 };
    };
    for (const p of par) {
      p.S = iRamme(p.fra);
      p.O = iDok(p.del);
    }
    P = iRamme(panel);
    if (bakMal) R = iDok(bakMal);
    A = slutt();
    // Panelet venter på sin plass til radene i rapporten har rullet opp til det (toppluften i
    // #rapport), og legger seg da inn i dem.
    toppDok = Math.min(...par.map((p) => p.O.y));
    plass = Math.min(...par.map((p) => p.S.y));
    B = Math.max(A + 1, toppDok - plass);
    V = Math.max(A, B - innerHeight * VINDU);
    fase = "";
  }

  function tegn(y: number) {
    const ny = y < A ? "for" : y >= B ? "etter" : "under";
    if (ny !== "under" && ny === fase) return;
    if (ny !== fase) {
      fase = ny;
      rapport!.dataset.swOvergang = ny;
      panel.toggleAttribute("data-overgang", ny !== "for");
    }
    if (ny !== "under") {
      for (const p of par) p.del.style.transform = "";
      if (bak) bak.style.transform = bak.style.opacity = "";
      return;
    }
    const e = innUt((y - V) / (B - V || 1));
    const f = 1 - e;
    // Toppen står fast på panelets plass til radene når den, og følger så radene.
    const topp = Math.min(plass, toppDok - y);
    for (const { del, type, S, O } of par) {
      // Tekst og haken likt i begge retninger; målelinja bare på bredden.
      const sx = type === "spor" ? S.w / O.w : S.h / O.h;
      const sy = type === "spor" ? 1 : sx;
      const x0 = type === "verdi" ? S.x + S.w - O.w * sx : S.x;
      const y0 = type === "spor" ? S.y + (S.h - O.h) / 2 : S.y;
      const x = x0 * f + O.x * e;
      const yv = topp + (y0 - plass) * f + (O.y - toppDok) * e;
      const tx = x - O.x;
      const ty = yv - (O.y - y);
      del.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${(sx + (1 - sx) * e).toFixed(4)}, ${(sy + (1 - sy) * e).toFixed(4)})`;
    }
    if (bak) {
      const kx = P.w / R.w + (1 - P.w / R.w) * e;
      const ky = P.h / R.h + (1 - P.h / R.h) * e;
      const yv = topp + (P.y - plass) * f + (R.y - toppDok) * e;
      bak.style.transform = `translate3d(${((P.x - R.x) * f).toFixed(1)}px, ${(yv - (R.y - y)).toFixed(1)}px, 0) scale(${kx.toFixed(4)}, ${ky.toFixed(4)})`;
      // Tett til delene nesten har landet, så det som ruller forbi under, ikke skinner gjennom.
      bak.style.opacity = (1 - myk((e - 0.94) / 0.06)).toFixed(3);
    }
  }

  const st = ScrollTrigger.create({
    start: () => {
      mal();
      return A;
    },
    end: () => B,
    onUpdate: (self) => tegn(self.scroll()),
    onRefresh: (self) => tegn(self.scroll()),
    onToggle: (self) => tegn(self.scroll()),
  });
  tegn(scrollY);

  return () => {
    st.kill();
    for (const p of par) p.del.style.transform = "";
    if (bak) bak.style.transform = bak.style.opacity = "";
    delete rapport.dataset.swOvergang;
    panel.removeAttribute("data-overgang");
  };
}
