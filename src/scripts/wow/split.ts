/**
 * data-split="lines" | "chars"
 *
 * Linjer (eller bokstaver) glir opp bak en maske når elementet kommer i syne.
 * Bruker SplitText med `autoSplit` (deler på nytt ved endret bredde og når fonten
 * er lastet) og `mask: "lines"`.
 *
 * Valgfritt:
 *   data-split-inngang   Heroen: deles ikke og spilles ikke inn. Står synlig fra første maling
 *                        (LCP, revisor r3 #1). Gjelder også alt med data-split i første kapittel
 *                        av ScrollWorld. Elementer med en lenke eller et skjemafelt inni deles
 *                        heller ikke (fokuserbart innhold i aria-hidden, revisor r3 #3).
 *   data-split-scrub     Følger rullingen begge veier i stedet for å spilles én gang
 *                        (ordmerket i bunnen: bokstavene løftes opp mens du ruller inn).
 *                        Markupen pakkes ikke ut etterpå; skjermlesertekst står hele tiden.
 *
 * Skjermlesere: innholdet flyttes inn i et aria-hidden spenn som SplitText deler,
 * og hele teksten ligger ved siden av i et visuelt skjult spenn. Når animasjonen
 * er ferdig, settes elementet tilbake til nøyaktig den markupen det hadde.
 * En overskrift beholder dermed rollen og navnet sitt hele veien.
 */
import { gsap, SplitText, KURVE, alle, klar, vist, erVist, iBefaring, skjermlesertekst, renTekst, type Opprydding } from "./felles";

interface Aktiv {
  el: HTMLElement;
  indre: HTMLElement;
  sr: HTMLElement;
  split: SplitText;
}

function pakkUt({ el, indre, sr, split }: Aktiv) {
  split.revert();
  sr.remove();
  while (indre.firstChild) el.insertBefore(indre.firstChild, indre);
  indre.remove();
}

export function startSplit(): Opprydding {
  const aktive = new Set<Aktiv>();

  for (const el of alle("[data-split]")) {
    if (erVist(el) || iBefaring(el)) continue;
    const bokstaver = el.dataset.split === "chars";
    // Heroen (H1 er LCP) males ved første maling og spilles ikke inn (revisor r3 #1): en
    // inngang ville skjult den til bunten har kjørt. Den deles heller ikke, så ingen lenke
    // eller tekst havner i et aria-skjult spenn.
    if (el.hasAttribute("data-split-inngang") || el.closest('[data-sw-kapittel="0"]') !== null) {
      klar(el);
      vist(el);
      continue;
    }
    // En lenke inni teksten deles aldri: den ville havnet i det aria-skjulte spennet og gitt
    // tomme og skjulte Tab-stopp (revisor r3 #3, axe aria-hidden-focus).
    if (el.querySelector("a, button, input, select, textarea, [tabindex]")) {
      klar(el);
      vist(el);
      continue;
    }
    const scrub = el.hasAttribute("data-split-scrub");

    const sr = skjermlesertekst(renTekst(el));
    const indre = document.createElement("span");
    indre.className = "wow-split";
    indre.setAttribute("aria-hidden", "true");
    while (el.firstChild) indre.appendChild(el.firstChild);
    el.append(sr, indre);

    let a: Aktiv;
    const split = SplitText.create(indre, {
      // Ord tas med for bokstaver, så et ord aldri brytes midt i.
      type: bokstaver ? "lines,words,chars" : "lines",
      mask: "lines",
      linesClass: "wow-linje",
      autoSplit: true,
      aria: "none",
      onSplit(self) {
        const deler = bokstaver ? self.chars : self.lines;
        if (scrub) {
          // clamp(): start og slutt holdes innenfor siden, så et ordmerke helt nederst
          // alltid rulles ferdig selv om det aldri når 55 % av skjermen.
          return gsap.from(deler, {
            yPercent: 105,
            ease: KURVE.scrub,
            stagger: 0.04,
            scrollTrigger: { trigger: el, start: "clamp(top bottom)", end: "clamp(top 55%)", scrub: 0.6 },
          });
        }
        return gsap.from(deler, {
          yPercent: 130,
          // Runde 9: 1,15 s → 0,9 s og 85 → 70 ms mellom linjene. En overskrift på tre linjer er
          // på plass etter ca. 1,0 s i stedet for 1,3 s; med expo.out står hver linje lesbar etter
          // en tredel av tiden. Lesingen skal ikke vente på bevegelsen.
          duration: bokstaver ? 0.7 : 0.9,
          ease: KURVE.ut,
          stagger: bokstaver ? 0.022 : 0.07,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onComplete() {
            vist(el);
            if (aktive.delete(a)) pakkUt(a);
          },
        });
      },
    });
    a = { el, indre, sr, split };
    aktive.add(a);
    klar(el);
  }

  return () => {
    for (const a of aktive) pakkUt(a);
    aktive.clear();
  };
}
