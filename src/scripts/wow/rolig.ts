/**
 * Inngangen for «rolig» (Read- og Operate-sidene: artikler, håndbok, juridisk, verktøy, /sjekk,
 * /kontakt, /status, /terminal, 404). Plan: docs/design/wow-undersider.md del 0 og 1.2.
 * MalWow rendrer denne i stedet for index.ts når bevegelse="rolig":
 *   <script>import "../scripts/wow/rolig.ts";</script>
 *
 * Ingenting her importerer GSAP, ScrollTrigger, SplitText, Lenis, Embla eller number-flow, og
 * ingenting importerer felles.ts (som registrerer GSAP). Bunten er under 1 kB gzip (mål i bygget:
 * docs/design/bevegelse.md, «rolig»). Søk i siden og vanlig rulling virker som i en bok.
 *
 * Det som beveger seg, gjør det bare som svar på noe leseren gjør:
 *  - toppfeltet glir bort ved rulling nedover og tilbake ved rulling oppover (data-hode-skjul,
 *    280 ms), ikke ved redusert bevegelse
 *  - <details> i <main> toner innholdet inn når det åpnes (ren CSS i wow-bevegelse.css, «rolig»,
 *    --wow-tid-svar, bare opasitet; høyden animeres ikke, del 8)
 * Menyen i toppfeltet lukkes med Esc og klikk utenfor av Hode.astro sitt eget skript (alle sider).
 *
 * Står det likevel et Kapittel på en rolig side, blir det stillbilde (ingen film uten filminngangen).
 * Står Intro.astro på siden (den skal bare stå på /), slippes startstilene, så ingenting står skjult.
 *
 * Uten JavaScript ser siden lik ut, bare uten at toppfeltet glir bort.
 */
import { startHode } from "./hode";

const html = document.documentElement;
html.classList.remove("wow-js", "wow-inngang");
html.classList.add("wow-rolig", "wow-klar");

if (matchMedia("(prefers-reduced-motion: no-preference)").matches) startHode();

for (const k of document.querySelectorAll<HTMLElement>("[data-kapittel]")) {
  k.removeAttribute("data-kapittel-film");
  k.setAttribute("data-kapittel-klar", "");
}
