/**
 * Klient mot skannertjenesten (services/skanner).
 *
 * Regelen her er den samme som ellers i verktøyet: vi påstår aldri mer enn vi
 * har målt. Er skanneren nede, treg eller ikke konfigurert, returnerer vi `null`
 * – ikke en tom rapport som ser ut som et rent resultat. Siden sier da at
 * skanningen ikke kunne kjøres, og det er et ærlig svar.
 *
 * Ingenting her kaster. En nede skannertjeneste skal aldri gi 500 på nettsiden.
 */

/* ------------------------------------------------------------ miljø ---- */

/**
 * Leses direkte fra process.env i stedet for via hentEnv().
 *
 * hentEnv() er typet mot `Env` i src/env.d.ts, og den filen tilhører en annen
 * arbeidsstrøm akkurat nå. Når SKANNER_URL og SKANNER_NOKKEL er lagt inn der,
 * bør dette byttes til hentEnv() slik at all miljølesing går ett sted.
 */
function env(navn: "SKANNER_URL" | "SKANNER_NOKKEL"): string | undefined {
  const prosess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const fraProsess = prosess?.env?.[navn];
  if (typeof fraProsess === "string" && fraProsess) return fraProsess;

  // import.meta.env finnes i Astro/Vite, men ikke når denne filen importeres rett
  // inn i node --test. Uten vakten kaster oppslaget der i stedet for å returnere
  // undefined, og testene for «skanneren er ikke satt opp» ville aldri kjørt.
  const vite = (import.meta as { env?: Record<string, unknown> }).env;
  const fraVite = vite?.[navn];
  if (typeof fraVite === "string" && fraVite) return fraVite;

  return undefined;
}

/* ------------------------------------------------------------ typer ---- */

export interface SkannetCookie {
  navn: string;
  domene: string;
  forstepart: boolean;
  /** null betyr øktcookie – den slettes når nettleseren lukkes. */
  levetidDager: number | null;
  sikker: boolean;
  httpOnly: boolean;
  /** Navnet på sporeren cookien hører til, når vi kjenner den igjen. */
  sporer: string | null;
}

export interface SkannetSporer {
  id: string;
  navn: string;
  kategori: string;
  vert: string;
  antallKall: number;
  typiskeCookies: string[];
  kilde: string;
}

export interface CookieSkann {
  url: string;
  status: number | null;
  cookies: SkannetCookie[];
  lagring: { local: string[]; session: string[] };
  sporere: SkannetSporer[];
  ukjenteTredjeparter: { vert: string; antallKall: number }[];
  blokkertAvVern: string[];
  millisekunder: number;
}

export interface UuBrudd {
  regel: string;
  alvorlighet: string;
  forklaring: string;
  krav: string | null;
  /** false betyr at teksten er axe-core sin engelske – vi oversetter ikke på gjetning. */
  oversatt: boolean;
  antall: number;
  eksempler: string[];
  hjelpeLenke: string;
}

export interface UuSkann {
  url: string;
  status: number | null;
  brudd: UuBrudd[];
  antallBrudd: number;
  antallRegler: number;
  bestått: number;
  måSjekkesManuelt: { regel: string; forklaring: string; antall: number }[];
  millisekunder: number;
}

/** Hvorfor en skanning ikke ga svar. Vises til brukeren, så den er på norsk. */
export type SkannFeil =
  | "ikke-konfigurert"
  | "utilgjengelig"
  | "tidsavbrudd"
  | "opptatt"
  | "avvist";

export interface SkannSvar<T> {
  resultat: T | null;
  feil: SkannFeil | null;
  /** Meldingen fra tjenesten når den selv forklarte hvorfor det gikk galt. */
  melding: string | null;
}

/* ------------------------------------------------------------ kall ---- */

const TIDSAVBRUDD_MS = 45_000;

async function kall<T>(sti: "/cookie" | "/uu", url: string): Promise<SkannSvar<T>> {
  const base = env("SKANNER_URL");
  const nokkel = env("SKANNER_NOKKEL");
  if (!base || !nokkel) {
    return { resultat: null, feil: "ikke-konfigurert", melding: null };
  }

  try {
    const svar = await fetch(new URL(sti, base), {
      method: "POST",
      headers: { "content-type": "application/json", "x-skanner-nokkel": nokkel },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(TIDSAVBRUDD_MS),
    });

    const data = (await svar.json().catch(() => null)) as (T & { feil?: string }) | null;

    if (svar.ok && data && !data.feil) {
      return { resultat: data as T, feil: null, melding: null };
    }
    if (svar.status === 503) {
      return { resultat: null, feil: "opptatt", melding: data?.feil ?? null };
    }
    if (svar.status === 504) {
      return { resultat: null, feil: "tidsavbrudd", melding: data?.feil ?? null };
    }
    if (svar.status === 400) {
      return { resultat: null, feil: "avvist", melding: data?.feil ?? null };
    }
    return { resultat: null, feil: "utilgjengelig", melding: data?.feil ?? null };
  } catch (e) {
    const tidsavbrudd = e instanceof Error && /timeout|abort/i.test(e.message);
    return {
      resultat: null,
      feil: tidsavbrudd ? "tidsavbrudd" : "utilgjengelig",
      melding: null,
    };
  }
}

export const skannCookies = (url: string) => kall<CookieSkann>("/cookie", url);
export const skannUu = (url: string) => kall<UuSkann>("/uu", url);

/** Én setning til brukeren om hvorfor skanningen ikke ga noe svar. */
export function forklarFeil(feil: SkannFeil, melding: string | null): string {
  if (melding) return melding;
  switch (feil) {
    case "ikke-konfigurert":
      return "Skanneren er ikke satt opp ennå. Prøv igjen senere.";
    case "opptatt":
      return "Skanneren kjører en annen sjekk akkurat nå. Prøv igjen om et halvt minutt.";
    case "tidsavbrudd":
      return "Siden brukte for lang tid på å laste i nettleseren.";
    case "avvist":
      return "Den adressen kan ikke skannes.";
    default:
      return "Skanneren svarte ikke. Rapporten er ikke kjørt – det er ikke det samme som at siden er i orden.";
  }
}

/* ------------------------------------------------------ oppsummering ---- */

export type Status = "ok" | "warn" | "fail" | "neutral";

/**
 * Status for cookie-funnet.
 *
 * Merk hva denne IKKE gjør: den avgjør ikke om siden er lovlig. Ekomloven
 * § 3-15 unntar cookies som er strengt nødvendige for tjenesten, og hva som er
 * strengt nødvendig kan ingen maskin avgjøre. Vi rapporterer hva som ble satt,
 * og sier hvem som må vurdere resten.
 */
export function cookieStatus(s: CookieSkann): Status {
  if (s.sporere.length > 0) return "fail";
  const tredjepart = s.cookies.filter((c) => !c.forstepart).length;
  if (tredjepart > 0) return "fail";
  if (s.cookies.length > 0 || s.lagring.local.length > 0) return "warn";
  return "ok";
}

export function uuStatus(s: UuSkann): Status {
  const alvorlige = s.brudd.filter(
    (b) => b.alvorlighet === "critical" || b.alvorlighet === "serious",
  ).length;
  if (alvorlige > 0) return "fail";
  if (s.antallBrudd > 0) return "warn";
  return "ok";
}
