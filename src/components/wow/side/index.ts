/**
 * Felleskomponentene for undersidene i wow-uttrykket, med navnene fra wow-undersider.md del 3.
 * Én import for sidene:
 *
 *   import { SideHode, Seksjon, Kravrader, Prisliste, Kontaktblokk } from "../components/wow/side";
 *
 * Prosess, Prisliste, Sporsmal, Kontaktblokk, Refleksfelt og Ramme er seksjonene fra forsiden
 * (src/components/wow/seksjoner/), gjort gjenbrukbare med props i stedet for kopiert.
 * Kapittel eies av bevegelse (src/components/wow/Kapittel.astro) og står ikke her.
 * Katalog med props og eksempler: /lab/wow-side og docs/design/rapporter/wow-a1-felles.md.
 */
export { default as SideHode } from "./SideHode.astro";
export { default as Seksjon } from "./Seksjon.astro";
export { default as Brodsmuler } from "./Brodsmuler.astro";
export { default as Lampe } from "./Lampe.astro";
export { default as Maaling } from "./Maaling.astro";
export { default as Rapportark } from "./Rapportark.astro";
export { default as UrlFelt } from "./UrlFelt.astro";
export { default as Verktoyramme } from "./Verktoyramme.astro";
export { default as Artikkelkropp } from "./Artikkelkropp.astro";
export { default as Prosa } from "./Prosa.astro";
export { default as Prisrader } from "./Prisrader.astro";
export { default as Kravrader } from "./Kravrader.astro";
export { default as Tekstrader } from "./Tekstrader.astro";
export { default as Steg } from "./Steg.astro";
export { default as Opptak } from "./Opptak.astro";
export { default as Videre } from "./Videre.astro";
export { default as Flyt } from "./Flyt.astro";
export { default as Handlinger } from "./Handlinger.astro";

export { default as Prosess } from "../seksjoner/Prosess.astro";
export { default as Prisliste } from "../seksjoner/Priser.astro";
export { default as Sporsmal } from "../seksjoner/Sporsmal.astro";
export { default as Kontaktblokk } from "../seksjoner/Kontakt.astro";
export { default as Refleksfelt } from "../seksjoner/Garanti.astro";
export { default as Ramme } from "../seksjoner/Ramme.astro";

export { maalingHtml, lampeHtml, verdiHtml, rapportarkHtml, statusOrd, fraSjekk } from "./maaling";
export type { LampeStatus, MaalingData, RapportarkData } from "./maaling";
export { prosessdatoer, isoUke } from "./prosessdatoer";
export type { Handling } from "./tittel";
