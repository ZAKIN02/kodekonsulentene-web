/** Typer for sikkerhet.mjs, som er ren JavaScript fordi server.mjs leser den uten byggesteg. */
declare module "*/sikkerhet.mjs" {
  export const SIKKERHETSHEADERE: Record<string, string>;
  export function lagSikkerhetsheadere(skriptHasher?: string[]): Record<string, string>;
}
