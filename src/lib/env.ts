/**
 * Henter hemmeligheter. På Fly.io ligger de i prosessens miljø (`fly secrets set`),
 * lokalt i .env som Astro laster inn. Returnerer undefined når nøkkelen ikke er satt –
 * ingenting kaster, fordi verktøyet skal svare med det det har.
 */
export function hentEnv(navn: keyof Env): string | undefined {
  // process.env er sannheten i drift. globalThis-oppslaget gjør at filen også kan
  // importeres i en sammenheng uten Node-typer uten å kaste.
  const prosess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const fraProsess = prosess?.env?.[navn];
  if (typeof fraProsess === "string" && fraProsess) return fraProsess;

  const fraVite = (import.meta.env as Record<string, unknown>)[navn];
  if (typeof fraVite === "string" && fraVite) return fraVite;

  return undefined;
}
