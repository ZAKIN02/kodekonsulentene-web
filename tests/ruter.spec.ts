import { test, expect } from "@playwright/test";
import { hovedmeny, footerLenker } from "../src/data/navigasjon";

/**
 * Rutene leses fra navigasjon.ts, ikke fra en kopiert liste. Legger noen til en
 * lenke i menyen uten å lage siden, blir denne testen rød med én gang.
 */
const RUTER = [
  ...new Set([
    "/",
    ...hovedmeny.map((l) => l.href),
    ...footerLenker.map((l) => l.href),
    "/kontakt",
    "/caser",
    "/verktoy/priskalkulator",
    "/verktoy/dmarc",
    "/verktoy/cookie-sjekk",
    "/verktoy/uu-sjekk",
    "/bransjer/handverkere",
    "/bransjer/klinikker",
  ]),
];

test.describe("ruter", () => {
  for (const rute of RUTER) {
    test(`@overvaak ${rute} svarer 200`, async ({ page }) => {
      const svar = await page.goto(rute);
      expect(svar?.status(), `${rute} skal svare 200`).toBe(200);
    });
  }

  test("@overvaak ukjent sti gir 404", async ({ page }) => {
    const svar = await page.goto("/finnes-ikke-xyz");
    expect(svar?.status()).toBe(404);
  });

  test("nøyaktig én h1 per side", async ({ page }) => {
    // Hullet dette fanger: Section rendret alltid h2, så 15 undersider sto helt
    // uten h1. Både et WCAG-problem og et SEO-problem, og ingen test så det.
    for (const rute of RUTER) {
      await page.goto(rute);
      const n = await page.locator("h1").count();
      expect(n, `${rute} har ${n} h1-elementer`).toBe(1);
    }
  });
});
