// Sideoverganger (øyeblikk 4, runde 9): stilene i src/styles/wow-bevegelse.css («Sideoverganger»).
// Ren CSS (`@view-transition { navigation: auto }`), så testen spør nettleseren om overgangen
// faktisk ble startet: `pagereveal` på den nye siden har `viewTransition` når den gjorde det.
//
//   BASE_URL=http://127.0.0.1:4780 npx playwright test tests/wow/sideovergang.spec.ts --project=desktop
import { test, expect, type Page } from "@playwright/test";

test.use({ channel: "chrome" });

/** Klikker første synlige lenke til siden (toppfeltet på desktop, bunnen på mobil) og svarer på om den nye siden ble vist med en overgang. */
async function naviger(page: Page, fra: string, til: string) {
  await page.addInitScript(() => {
    addEventListener("pagereveal", (e) => {
      const vt = (e as Event & { viewTransition?: unknown }).viewTransition;
      (window as unknown as { __overgang: boolean }).__overgang = Boolean(vt);
    });
  });
  await page.goto(fra);
  await page.waitForLoadState("load");
  const stottet = await page.evaluate(() => "onpagereveal" in window);
  await Promise.all([page.waitForURL(`**${til}`), page.locator(`a[href="${til}"]:visible`).first().click()]);
  await page.waitForLoadState("load");
  return { stottet, overgang: await page.evaluate(() => (window as unknown as { __overgang?: boolean }).__overgang ?? false) };
}

test("lenke mellom to sider starter en overgang, og toppfeltet har eget navn", async ({ page }) => {
  const r = await naviger(page, "/priser", "/om");
  test.skip(!r.stottet, "Nettleseren har ikke overganger mellom dokumenter");
  expect(r.overgang).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("header.wow-hode")!).viewTransitionName)).toBe("wow-hode");
  // Etter overgangen står siden som vanlig: innholdet er synlig og kan brukes.
  await expect(page.locator("main h1").first()).toBeVisible();
});

test("fra en rolig side til en film-side virker også", async ({ page }) => {
  const r = await naviger(page, "/personvern", "/priser");
  test.skip(!r.stottet, "Nettleseren har ikke overganger mellom dokumenter");
  expect(r.overgang).toBe(true);
});

test.describe("redusert bevegelse", () => {
  test.use({ reducedMotion: "reduce" });
  test("ingen overgang: siden byttes som før", async ({ page }) => {
    const r = await naviger(page, "/priser", "/om");
    expect(r.overgang).toBe(false);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector("header.wow-hode")!).viewTransitionName)).toBe("none");
  });
});
