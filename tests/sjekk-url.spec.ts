// /sjekk?url=… fra hero-feltet på forsiden.
//
// /sjekk er forhåndsbygget. I bygget er Astro.url.searchParams tom, så feltet kom
// ut tomt og sjekken startet aldri når noen sendte adressen fra forsiden (funnet i
// wow-r2). Skriptet på siden leser nå location.search. Testen må kjøres mot et
// bygg for å bety noe; i `astro dev` fyller serveren feltet selv.
//
//   BASE_URL=http://127.0.0.1:<port> npx playwright test tests/sjekk-url.spec.ts
//
// /api/sjekk stubbes, så testen ikke henter noen fremmed nettside.
import { test, expect } from "@playwright/test";

// Samme som de andre wow-testene: installert Chrome, ikke Playwrights egen.
test.use({ channel: "chrome" });

const ADRESSE = "eksempel.no";

test("adressen fra ?url= fylles inn og sjekken starter av seg selv", async ({ page }) => {
  const sendt: string[] = [];
  await page.route("**/api/sjekk", async (route) => {
    sendt.push(route.request().postData() ?? "");
    await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ feil: "Stubbet i testen." }) });
  });

  await page.goto(`/sjekk?url=${encodeURIComponent(ADRESSE)}`);

  await expect(page.locator("#url-sjekk")).toHaveValue(ADRESSE);
  await expect.poll(() => sendt.length).toBe(1);
  expect(JSON.parse(sendt[0])).toEqual({ url: ADRESSE });
  await expect(page.locator("#resultat")).toContainText("Stubbet i testen.");
});

test("uten ?url= står feltet tomt og ingen sjekk starter", async ({ page }) => {
  let kall = 0;
  await page.route("**/api/sjekk", (route) => {
    kall++;
    return route.abort();
  });

  await page.goto("/sjekk");
  await expect(page.locator("#url-sjekk")).toHaveValue("");
  await page.waitForTimeout(500);
  expect(kall).toBe(0);
});
