/**
 * Eneste inngang for wow-bevegelsen. Layouten importerer denne fila:
 *   <script>import "../scripts/wow/index.ts";</script>
 * og alt startes ut fra data-attributtene i DOM-en. Kontrakten står i
 * docs/design/wow-brief.md («Global bevegelse»), og eksempler på bruk i hver modul.
 *
 * Rekkefølge og hvorfor:
 *  1. Intro.astro har satt html.wow-js (startstilene i wow-bevegelse.css og filmoppsettet i
 *     ScrollWorld gjelder) før første maling. Uten JS settes den ikke, og alt står synlig.
 *     Kom ikke denne fila innen 4 s, har Intro.astro fjernet den og satt wow-sent.
 *  2. gsap.matchMedia skiller full bevegelse fra redusert. Ved redusert bevegelse
 *     starter verken Lenis, festing, parallakse, film eller peker, og alt står ferdig.
 *  3. Befaringen og ScrollWorld først (de legger til høyde og festing), så skrubb-effektene,
 *     så inngangene (split, reveal, tall). Det finnes ikke lenger noe teppe å vente på:
 *     heroen tegnes ved første maling, og linjene løftes med en gang.
 *
 * Sider med bevegelse="rolig" i MalWow laster rolig.ts i stedet, uten noe av dette.
 *
 * GSAP, ScrollTrigger, SplitText og Lenis ligger i denne bunten. Embla og number-flow
 * lastes først når en karusell eller et tall er én skjermhøyde unna, og befaring.ts bare
 * når siden har data-pin="befaring" (revisor r3 #4: mål ≤ 70 kB gzip ved load).
 */
import { gsap, ScrollTrigger, html, MQ, samle } from "./felles";
import { startLenis } from "./lenis";
import { startSplit } from "./split";
import { startReveal } from "./reveal";
import { startParallax } from "./parallax";
import { startMagnetic } from "./magnetic";
import { startCount } from "./count";
import { startMarquee } from "./marquee";
import { startScaleIn } from "./scale-in";
import { startDraw } from "./draw";
import { startPeker } from "./peker";
import { startKarusell } from "./karusell";
import { startAccordion } from "./accordion";
import { startScrollWorld } from "./scroll-world";
import { startHode } from "./hode";

// For sent: Intro.astro ga opp etter 4 s og viste alt. Da spilles ingen innganger
// (innholdet er allerede lest), men skrubb-effekter og funksjon startes som vanlig.
const forSent = html.classList.contains("wow-sent");
// Kom vi hit uten Intro.astro (ingen tidlig klasse), sett den nå.
if (!forSent) html.classList.add("wow-js");
html.classList.add("wow-klar");

const mm = gsap.matchMedia();

// ScrollWorld ligger øverst og legger høyde til alt under; den startes først.
mm.add({ full: MQ.full, redusert: MQ.redusert }, (ctx) => {
  const { full } = ctx.conditions as { full: boolean };
  return startScrollWorld(full && !forSent);
});

// Kapittelet (toppbildet på tjenestesidene, /om og bransjesidene) hentes bare når siden har ett.
// Høyden er satt av inline-skriptet i Kapittel.astro før første maling, så ingenting flytter seg
// når modulen kommer. Den bruker ikke GSAP og styrer redusert bevegelse selv.
if (document.querySelector("[data-kapittel]")) void import("./kapittel").then((m) => m.startKapittel());

// Befaringen med festing (data-pin="befaring") finnes bare i lab-sidene nå; forsiden har en
// ferdig utfylt rapport uten festing. Modulen hentes derfor bare når den trengs (revisor r3 #4).
// Festingen legger til høyde, så alt måles på nytt når den er satt opp.
const befaringRot = document.querySelector('[data-pin="befaring"]');
const befaring = befaringRot ? import("./befaring") : null;
if (befaring) {
  mm.add(`${MQ.full} and ${MQ.desktop}`, (ctx) => {
    let rydd: (() => void) | undefined;
    let av = false;
    void befaring.then((m) => {
      if (av) return;
      ctx.add(() => (rydd = m.befaringPin()));
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => {
      av = true;
      rydd?.();
    };
  });
  mm.add(`${MQ.full} and ${MQ.mobil}`, (ctx) => {
    let rydd: (() => void) | undefined;
    let av = false;
    void befaring.then((m) => {
      if (av) return;
      ctx.add(() => (rydd = m.befaringMobil()));
    });
    return () => {
      av = true;
      rydd?.();
    };
  });
}

mm.add({ full: MQ.full, mobil: MQ.mobil }, (ctx) => {
  const { full, mobil } = ctx.conditions as { full: boolean; mobil: boolean };
  if (!full) return;
  const rydd = samle(startLenis(), startMarquee(), startAccordion(), startHode());
  startParallax(mobil);
  startScaleIn();
  const inngang = forSent
    ? samle(startDraw(), startCount(false))
    : samle(startSplit(), startDraw(), startReveal(), startCount(true));
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  return samle(rydd, inngang);
});

mm.add(`${MQ.full} and ${MQ.fin}`, () => samle(startPeker(), startMagnetic()));

mm.add(MQ.redusert, () => {
  void befaring?.then((m) => m.befaringFerdig());
  return startCount(false);
});

// Funksjon, ikke bevegelse: karusellen virker i alle modi, med korte overganger ved redusert.
startKarusell(matchMedia(MQ.redusert).matches);

// Fonter endrer linjehøyder og bredder; mål på nytt når de er lastet.
void document.fonts?.ready.then(() => ScrollTrigger.refresh());
