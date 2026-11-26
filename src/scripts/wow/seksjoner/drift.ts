/**
 * Den levende lampa i Arbeid (runde wow-r7 «Lampa», historie-manus.md del 5 og «Nytt i motoren»).
 *
 *   <li data-seksjon="drift">
 *     <p class="wow-drift" data-drift data-drift-maalt="svarte på {n} ms" data-drift-ikke-maalt="ikke målt nå">
 *       <span class="wow-lampe wow-lampe--hul" data-drift-lampe></span>
 *       <span data-drift-tekst>ikke målt nå</span>
 *     </p>
 *   </li>
 *
 * Når kortet er synlig, spør nettleseren /status (samme side som Fly bruker som helsesjekk) én
 * gang, uten hurtiglager, og måler tiden fra kallet går til svaret er lest (performance.now()).
 * Lampa tennes og teksten blir «svarte på {N} ms» med tallet som faktisk ble målt. Tallet står
 * aldri i koden, og det telles ikke opp (et tall som snurrer forbi verdier som ikke er målt, ville
 * påstått mer enn målingen). Feiler kallet eller tar det over 4 s, står lampa hul med «ikke målt
 * nå». Kommer kortet inn igjen etter å ha vært ute, måles det på nytt.
 *
 * Mens kallet går, har lampa data-tilstand="maaler" (én puls i CSS, ikke ved redusert bevegelse).
 * Ingen tredjepart, ingen GSAP.
 */
const MAAL_TIDSFRIST = 4000;

// Tekstene står i markupen (fra fortelling.ts), så de har én kilde.
const tekster = (el: HTMLElement) => ({
  maalt: el.dataset.driftMaalt ?? "",
  ikkeMaalt: el.dataset.driftIkkeMaalt ?? "",
});

async function maal(): Promise<number | null> {
  const ctl = new AbortController();
  const tid = setTimeout(() => ctl.abort(), MAAL_TIDSFRIST);
  try {
    const t0 = performance.now();
    const svar = await fetch("/status", { cache: "no-store", signal: ctl.signal, credentials: "omit" });
    await svar.arrayBuffer();
    const ms = performance.now() - t0;
    return svar.ok ? Math.max(1, Math.round(ms)) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(tid);
  }
}

function vis(rad: HTMLElement, ms: number | null) {
  const lampe = rad.querySelector<HTMLElement>("[data-drift-lampe]");
  const tekst = rad.querySelector<HTMLElement>("[data-drift-tekst]");
  if (!lampe || !tekst) return;
  const t = tekster(rad);
  if (!t.maalt.includes("{n}")) return;
  lampe.classList.toggle("wow-lampe--bestatt", ms !== null);
  lampe.classList.toggle("wow-lampe--hul", ms === null);
  lampe.dataset.tilstand = ms === null ? "feil" : "maalt";
  if (ms === null) {
    tekst.textContent = t.ikkeMaalt;
    return;
  }
  // «svarte på {n} ms»: tallet får sitt eget element, så det kan stå i visningsstørrelse.
  const [for_, etter] = t.maalt.split("{n}");
  const tall = document.createElement("strong");
  tall.className = "wow-drift__tall";
  tall.textContent = new Intl.NumberFormat("nb-NO").format(ms);
  tekst.replaceChildren(document.createTextNode(for_), tall, document.createTextNode(etter ?? ""));
  rad.dataset.driftNy = "";
  requestAnimationFrame(() => requestAnimationFrame(() => delete rad.dataset.driftNy));
}

export function start(kort: HTMLElement) {
  const rad = kort.querySelector<HTMLElement>("[data-drift]");
  if (!rad) return;
  let ute = true;
  let pagaar = false;
  const io = new IntersectionObserver(
    async ([o]) => {
      if (!o.isIntersecting) {
        ute = true;
        return;
      }
      if (!ute || pagaar) return;
      ute = false;
      pagaar = true;
      const lampe = rad.querySelector<HTMLElement>("[data-drift-lampe]");
      if (lampe) lampe.dataset.tilstand = "maaler";
      const ms = await maal();
      pagaar = false;
      vis(rad, ms);
    },
    { threshold: 0.5 },
  );
  io.observe(rad);
}
