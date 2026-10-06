/**
 * WCAG-reglene vi kan navngi på norsk.
 *
 * Kanonisk kopi. Skanneren har sin egen i services/skanner/wcag-navn.mjs, fordi
 * den bygges i en SEPARAT Docker-kontekst der src/ ikke finnes – og hovedappens
 * kontekst utelater services/. Røntgenlinsen importerte derfor rett over grensen,
 * bygget lokalt og FEILET i Docker med «Could not resolve».
 *
 * En test i test/sjekk.test.ts feiler hvis de to listene kommer ut av synk.
 */
export const WCAG_NAVN = {
  "image-alt": {
    tekst: "Bilder mangler alt-tekst. En som bruker skjermleser får ikke vite hva bildet viser.",
    krav: "WCAG 1.1.1",
  },
  "input-image-alt": {
    tekst: "Bildeknapper mangler alt-tekst, så det er uklart hva knappen gjør.",
    krav: "WCAG 1.1.1",
  },
  "html-has-lang": {
    tekst: "Siden sier ikke hvilket språk den er på. Skjermlesere leser da norsk med engelsk uttale.",
    krav: "WCAG 3.1.1",
  },
  "html-lang-valid": {
    tekst: "Språkkoden på siden er ikke gyldig.",
    krav: "WCAG 3.1.1",
  },
  "document-title": {
    tekst: "Siden mangler tittel. Tittelen er det første en skjermleser leser opp, og den vises i fanen.",
    krav: "WCAG 2.4.2",
  },
  "color-contrast": {
    tekst: "Tekst har for svak kontrast mot bakgrunnen. Det er den feilen flest faktisk merker.",
    krav: "WCAG 1.4.3",
  },
  "link-name": {
    tekst: "Lenker uten tekst. En skjermleser leser dem opp som «lenke», uten å si hvor de går.",
    krav: "WCAG 2.4.4",
  },
  "button-name": {
    tekst: "Knapper uten tekst. Det er ikke mulig å vite hva de gjør uten å se skjermen.",
    krav: "WCAG 4.1.2",
  },
  label: {
    tekst: "Skjemafelt mangler ledetekst. Brukeren vet ikke hva som skal fylles inn.",
    krav: "WCAG 3.3.2",
  },
  "form-field-multiple-labels": {
    tekst: "Et skjemafelt har flere ledetekster, og det er uklart hvilken som gjelder.",
    krav: "WCAG 3.3.2",
  },
  "frame-title": {
    tekst: "Innebygd innhold (iframe) mangler tittel, så det er uklart hva det inneholder.",
    krav: "WCAG 4.1.2",
  },
  "heading-order": {
    tekst: "Overskriftsnivåene hopper over trinn. Det ødelegger strukturen man navigerer etter.",
    krav: "WCAG 1.3.1",
  },
  "empty-heading": {
    tekst: "Tomme overskrifter. De dukker opp i innholdslisten uten å si noe.",
    krav: "WCAG 1.3.1",
  },
  list: {
    tekst: "Lister er bygget feil i koden, så antall punkter leses ikke riktig opp.",
    krav: "WCAG 1.3.1",
  },
  listitem: {
    tekst: "Listepunkter ligger utenfor en liste.",
    krav: "WCAG 1.3.1",
  },
  "meta-viewport": {
    tekst: "Siden hindrer at man kan zoome. Det stenger ute alle som trenger større tekst.",
    krav: "WCAG 1.4.4",
  },
  "aria-required-attr": {
    tekst: "Et element bruker ARIA uten de attributtene rollen krever, og blir lest opp feil.",
    krav: "WCAG 4.1.2",
  },
  "aria-valid-attr-value": {
    tekst: "ARIA-attributter har ugyldige verdier.",
    krav: "WCAG 4.1.2",
  },
  "aria-hidden-focus": {
    tekst: "Noe er skjult for skjermlesere, men kan fortsatt nås med tabulatortasten.",
    krav: "WCAG 4.1.2",
  },
  "duplicate-id-aria": {
    tekst: "To elementer har samme id, og ARIA-koblingen peker da feil sted.",
    krav: "WCAG 4.1.1",
  },
  region: {
    tekst: "Innhold ligger utenfor landemerker, så det er vanskelig å hoppe rett til det.",
    krav: "WCAG 1.3.1",
  },
  bypass: {
    tekst: "Siden mangler en måte å hoppe over menyen på. Da må man tabulere gjennom hele hver gang.",
    krav: "WCAG 2.4.1",
  },
  "landmark-one-main": {
    tekst: "Siden mangler et hovedinnhold-landemerke.",
    krav: "WCAG 1.3.1",
  },
  "page-has-heading-one": {
    tekst: "Siden mangler hovedoverskrift (h1).",
    krav: "WCAG 1.3.1",
  },
  "td-headers-attr": {
    tekst: "Tabellceller peker på overskrifter som ikke finnes.",
    krav: "WCAG 1.3.1",
  },
  "th-has-data-cells": {
    tekst: "Tabelloverskrifter mangler celler de hører til.",
    krav: "WCAG 1.3.1",
  },
  "valid-lang": {
    tekst: "Et språkbytte i teksten bruker en ugyldig språkkode.",
    krav: "WCAG 3.1.2",
  },
};
