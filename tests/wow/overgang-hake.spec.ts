// Overgangen fra panelet i filmen til rapporten (overgang.ts) på forsiden: haken skal aldri stå over
// etiketten i samme rad midt i overgangen (bygger wow-r6 punkt 4, «Uni✓ersell»). Årsaken var
// overgangen på transform i .wow-hake (280 ms), som lot haken henge etter de andre delene.
//
//   BASE_URL=http://127.0.0.1:4700 npx playwright test tests/wow/overgang-hake.spec.ts
import { test, expect } from "@playwright/test";

test.use({ channel: "chrome" });

test("haken henger ikke etter etiketten i overgangen til rapporten", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("wow-inngang", "1"));
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
  const slutt = await page.evaluate(() => {
    const r = document.querySelector<HTMLElement>("[data-scroll-world]")!;
    return r.getBoundingClientRect().top + scrollY + r.offsetHeight - innerHeight;
  });
  let steg = 0;
  let verst = -Infinity;
  for (let y = slutt - 200; y < slutt + 900; y += 20) {
    await page.evaluate((y) => scrollTo(0, y), y);
    // To rammer, ikke mer: en CSS-overgang på 280 ms ville fortsatt vært midt i.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const o = await page.evaluate(() => {
      const rap = document.querySelector<HTMLElement>("[data-sw-rapport]");
      if (!rap || rap.dataset.swOvergang !== "under") return null;
      let maks = -Infinity;
      for (let j = 0; j < 4; j++) {
        const s = rap.querySelector(`[data-maal-del="${j}:status"]`)?.getBoundingClientRect();
        const t = rap.querySelector(`[data-maal-del="${j}:navn"]`)?.getBoundingClientRect();
        if (s && t) maks = Math.max(maks, s.right - t.left);
      }
      return maks;
    });
    if (o !== null) {
      steg++;
      verst = Math.max(verst, o);
    }
  }
  test.skip(steg === 0, "Overgangen kjørte ikke på denne siden (ingen rapport eller ingen film).");
  expect(verst, "hakens høyre kant er til venstre for etiketten").toBeLessThanOrEqual(0);
  // Og selve årsaken: ingen CSS-overgang på delene mens overgang.ts eier dem.
  const varighet = await page.evaluate(() => getComputedStyle(document.querySelector('[data-sw-rapport] [data-maal-del$=":status"]')!).transitionDuration);
  expect(varighet.split(",").every((d) => parseFloat(d) === 0)).toBe(true);
});
