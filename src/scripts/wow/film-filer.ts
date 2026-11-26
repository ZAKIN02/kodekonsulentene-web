/**
 * Filene til filmen på forsiden (ScrollWorld). BARE PÅ SERVEREN (ved bygging): bruker node:fs.
 * Importeres av ScrollWorld.astro og av siden som forhåndslaster heroens bilde. Aldri fra et
 * <script> i nettleseren.
 *
 * Finnes fila i public/<mappe>/, brukes den. I `astro dev` brukes ellers plassholderen i
 * .design/arbeid/bevegelse/scroll-world/ (pult.webp og pult-inn.mp4 til produsenten har levert
 * N1 og N2). I et bygg uten fila: null, og ScrollWorld bruker reserven.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

export const FILM_MAPPE = "/media/wow/scroll-world";
const PLASSHOLDER = join(process.cwd(), ".design/arbeid/bevegelse/scroll-world");

export interface FilFunn {
  url: string;
  plassholder: boolean;
}

export function finnFil(navn: string, mappe = FILM_MAPPE, dev = false): FilFunn | null {
  if (existsSync(join(process.cwd(), "public", mappe, navn))) return { url: `${mappe}/${navn}`, plassholder: false };
  if (dev && existsSync(join(PLASSHOLDER, navn))) return { url: `/@fs${PLASSHOLDER}/${navn}`, plassholder: true };
  return null;
}

/** Samme spørring som MOBIL i ScrollWorld.astro. */
const STAAENDE = "(max-aspect-ratio: 4/5)";
const LIGGENDE = "(min-aspect-ratio: 801/1000)";

/**
 * Forhåndslasting av heroens bilde (LCP): siste ramme i dive-4, avif når den finnes.
 * Til `forhandslast` på MalWow i src/pages/index.astro:
 *   import { filmForhandslast } from "../scripts/wow/film-filer";
 *   <MalWow … forhandslast={filmForhandslast(import.meta.env.DEV)}>
 * Samme bilde som første lag i ScrollWorld, så nettleseren aldri henter et bilde som ikke vises.
 */
export function filmForhandslast(dev = false, mappe = FILM_MAPPE): { href: string; type: string; media: string }[] {
  const ut: { href: string; type: string; media: string }[] = [];
  for (const [v, media] of [
    ["", LIGGENDE],
    ["-m", STAAENDE],
  ] as const) {
    const avif = finnFil(`hero${v}.avif`, mappe, dev);
    const webp = finnFil(`hero${v}.webp`, mappe, dev);
    const f = avif ?? webp;
    if (f) ut.push({ href: f.url, type: avif ? "image/avif" : "image/webp", media });
  }
  return ut;
}
