---
name: kodekonsulentene-case
description: Bruk når du skal skrive en case eller referanse fra et ferdig prosjekt til nettsiden, LinkedIn eller et tilbud. Sikrer problem → løsning → resultat med tall, og at konseptarbeid merkes som konsept.
---

# Case fra et ferdig prosjekt

Caser ligger i `src/data/caser.ts` og vises på forsiden og `/caser`.

## Strukturen – tre deler, alltid

1. **Problem.** Hva kostet dette kunden før? I timer, telefoner, tapte bestillinger eller kroner. Én til to setninger, med kundens egne ord der du har dem.
2. **Løsning.** Hva du bygde, i klartekst og uten teknologinavn. Teknologien hører hjemme i `stack`-feltet, ikke i setningen.
3. **Resultat.** Tall. Minst ett, helst to.

Mangler du tall, er caset ikke ferdig. Da skriver du `TODO` og spør kunden – du finner
ikke på et anslag. Et oppdiktet tall er det eneste som kan velte hele siden, fordi hele
posisjoneringen er «tall og tid før adjektiver».

## Felt i `src/data/caser.ts`

```ts
{
  slug, tittel, kunde,
  type: "App" | "System" | "Nettside" | "Konsept",
  problem, losning,
  resultat: [{ verdi, tekst }],
  stack: [],
  href?, bilde?, bildeAlt?
}
```

## Merking

- **`type: "Konsept"`** skal alltid vises med teksten «Konsept, ikke oppdrag». Et konseptredesign som ser ut som et oppdrag er villedende, og det er den typen ting en kunde oppdager.
- Egne apper settes som `kunde: "Eget produkt"`. De teller som caser – de er det sterkeste beviset når du er ny, fordi de viser at du leverer ferdige produkter og ikke bare sider.
- Demo-systemer settes som `kunde: "Demo"`.

## Samtykke

Kundens navn, logo og skjermbilder kan brukes med mindre kunden har reservert seg
(se punkt 8 i `/vilkar`). **Tall og resultater publiseres bare etter kundens godkjenning.**
Spør skriftlig, og ta vare på svaret.

## Gode og dårlige resultatlinjer

| Bra | Dårlig |
|---|---|
| «14 færre telefoner i uka» | «Bedre kundeopplevelse» |
| «Last-tid 3,4 s → 0,8 s» | «Betydelig raskere» |
| «4 timer spart per måned på avstemming» | «Effektivisert arbeidsflyt» |
| «31 bestillinger første måned, 22 utenom åpningstid» | «Økt konvertering» |

## Tone

Følg `kodekonsulentene-tekst`. Caser skrives i tredje person om kunden og første person
om deg. Ingen superlativer, ingen «vi er stolte av å kunne presentere».
