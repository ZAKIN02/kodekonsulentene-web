/**
 * Små hjelpere for overskrifter på undersidene (brukes av SideHode, Seksjon, Verktoyramme m.fl.).
 */

/** Æ, Ø eller Å i en overskrift i versaler: linjeavstanden må være 0,95 (kritiker r4 #14). */
export const harAao = (tekst: string) => /[æøåÆØÅ]/.test(tekst);

/** Klassene for en displayoverskrift (Archivo, versaler) i en gitt størrelse. */
export function tittelKlasser(storrelse: "stor" | "tjeneste" | "h3", tekst: string): string[] {
  return ["wow-tittel", `wow-tittel--${storrelse}`, harAao(tekst) ? "wow-tittel--aao" : ""].filter(Boolean);
}

/** Stabil id av en tekst: «Hva du får» → «hva-du-far». Mykt bindestrek (U+00AD) teller ikke. */
export function slug(tekst: string): string {
  return tekst
    .replace(/\u00AD/g, "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface Handling {
  tekst: string;
  href: string;
  /** Én primær per toppdel (wow-undersider.md del 1.0). */
  type: "primar" | "strek" | "lenke";
}
