import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  lyttEtterFeil,
  maalKontrast,
  videoTilstander,
  scrollGjennom,
} from "./hjelpere";

/**
 * Hver test her svarer til en feil som faktisk nådde produksjon mens hele
 * node:test-suiten var grønn. Navnet på testen sier hva den vokter.
 */

const SIDER = ["/", "/nettsider", "/sjekk", "/priser", "/sikkerhet", "/verktoy"];

/** Tekst som ligger over bilde eller video, og beholderen den males mot. */
const TEKST_OVER_MEDIE: { side: string; beholder: string; tekst: string; navn: string }[] = [
  { side: "/", beholder: ".hero", tekst: ".hero__lead", navn: "hero-ingress" },
  { side: "/", beholder: ".hero", tekst: ".hero h1", navn: "hero-overskrift" },
  { side: "/", beholder: ".teaser", tekst: ".teaser__tekst .body-lg", navn: "stripe-ingress" },
];

test.describe("konsoll og CSP", () => {
  for (const side of SIDER) {
    test(`@overvaak ${side}: ingen konsollfeil og ingen CSP-brudd`, async ({ page }) => {
      const l = lyttEtterFeil(page);
      await page.goto(side, { waitUntil: "networkidle" });
      await scrollGjennom(page, 8);

      // CSP-brudd er den stilleste feilen vi har hatt: scroll-historien og
      // temabryteren ble blokkert, og ingenting feilet synlig.
      expect(l.cspBrudd, `${side}: CSP blokkerer egen kode`).toEqual([]);
      expect(l.feil, `${side}: konsollfeil`).toEqual([]);
    });
  }
});

test.describe("video kan faktisk spilles og spoles", () => {
  for (const side of ["/", "/verktoy"]) {
    test(`@overvaak ${side}: videoene er lastbare og spolbare`, async ({ page }) => {
      await page.goto(side, { waitUntil: "networkidle" });
      await scrollGjennom(page, 10);
      await page.waitForTimeout(1200);

      const videoer = await videoTilstander(page);
      test.skip(videoer.length === 0, "ingen video på siden");

      for (const v of videoer) {
        // readyState 0 betyr at ingenting er lastet; da står bare plakaten.
        expect(v.readyState, `${side}: ${v.src} lastet ikke (readyState ${v.readyState})`).toBeGreaterThanOrEqual(1);
        expect(v.duration, `${side}: ${v.src} har ingen varighet`).toBeGreaterThan(0);
        // Dette er testen som avslørte manglende HTTP Range. Uten Range melder
        // nettleseren seekable.end(0) === 0, og all scroll-spoling er død.
        expect(
          v.seekbarTil,
          `${side}: ${v.src} kan ikke spoles – mangler serveren Range-støtte?`,
        ).toBeGreaterThan(0);
      }
    });
  }

  test("forsiden: currentTime endrer seg når man scroller", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const sett = new Set<number>();
    const hoyde = await page.evaluate(() => document.documentElement.scrollHeight);
    const vindu = await page.evaluate(() => window.innerHeight);
    for (let i = 0; i <= 8; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), ((hoyde - vindu) * i) / 8);
      await page.waitForTimeout(400);
      const t = await page.evaluate(() => {
        const v = document.querySelector("video");
        return v ? Number(v.currentTime.toFixed(2)) : null;
      });
      if (t !== null) sett.add(t);
    }
    test.skip(sett.size === 0, "ingen video på forsiden");
    // Står den stille, er enten Range, CSP eller scroll-koblingen død.
    expect(sett.size, `videoen står stille – bare verdiene ${[...sett].join(", ")}`).toBeGreaterThanOrEqual(3);
  });
});

test.describe("mediefiler leveres riktig", () => {
  test("@overvaak content-type og accept-ranges", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollGjennom(page, 6);

    const filer = await page.evaluate(() => {
      const ut = new Set<string>();
      for (const v of document.querySelectorAll("video")) {
        if (v.currentSrc) ut.add(new URL(v.currentSrc).pathname);
        if (v.poster) ut.add(new URL(v.poster, location.href).pathname);
        for (const s of v.querySelectorAll("source")) {
          const src = s.getAttribute("src");
          if (src) ut.add(new URL(src, location.href).pathname);
        }
      }
      return [...ut];
    });
    test.skip(filer.length === 0, "ingen mediefiler på forsiden");

    for (const f of filer) {
      const svar = await request.get(f);
      expect(svar.status(), `${f}`).toBe(200);
      const h = svar.headers();
      const forventet = f.endsWith(".mp4")
        ? "video/mp4"
        : f.endsWith(".webm")
          ? "video/webm"
          : f.endsWith(".avif")
            ? "image/avif"
            : null;
      if (forventet) {
        // application/octet-stream her = nettleseren nekter å spille av.
        expect(h["content-type"], `${f} har feil MIME-type`).toContain(forventet);
      }
      if (f.endsWith(".mp4") || f.endsWith(".webm")) {
        expect(h["accept-ranges"], `${f} mangler accept-ranges`).toBe("bytes");
      }
    }
  });
});

test.describe("kontrast mot faktisk malte piksler", () => {
  for (const { side, beholder, tekst, navn } of TEKST_OVER_MEDIE) {
    test(`${navn}: minst 4,5:1`, async ({ page }) => {
      await page.goto(side, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);

      const funn = await maalKontrast(page, beholder, tekst);
      test.skip(funn === null, `${navn} finnes ikke på siden`);

      expect(
        funn!.kontrast,
        `${navn}: verste punkt rgb(${funn!.verstRgb.join(",")}) mot ${funn!.tekstFarge} ` +
          `gir ${funn!.kontrast.toFixed(2)}:1 i (${funn!.punkt.x}, ${funn!.punkt.y})`,
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});

test.describe("tilgjengelighet", () => {
  // Revisjonen kjøres med redusert bevegelse. Uten det fanget axe elementer midt i
  // en innton-animasjon og meldte kontrast 2,22:1 på en farge som i hvile er
  // 200,242,74. En flakete tilgjengelighetstest lærer folk å overse rødt.
  test.use({ reducedMotion: "reduce" });

  for (const side of SIDER) {
    test(`${side}: ingen WCAG A/AA-brudd (axe)`, async ({ page }) => {
      await page.goto(side, { waitUntil: "networkidle" });
      await scrollGjennom(page, 6);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);
      const res = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const kort = res.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`);
      expect(kort, `${side}`).toEqual([]);
    });
  }
});

test.describe("uten JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const side of ["/", "/nettsider"]) {
    test(`${side}: innhold og CTA står uten JS`, async ({ page }) => {
      await page.goto(side, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toHaveCount(1);
      // Hovedhandlingen må finnes i HTML-en, ikke bygges av et skript.
      const cta = page.getByRole("link", { name: /Sjekk nettsiden din|Kjør sjekken|Se historien|Book/i });
      expect(await cta.count(), `${side} mangler CTA uten JS`).toBeGreaterThan(0);
      const tekst = (await page.locator("main").innerText()).trim();
      expect(tekst.length, `${side} har nesten ingen tekst uten JS`).toBeGreaterThan(400);
    });
  }
});

test.describe("redusert bevegelse", () => {
  test.use({ reducedMotion: "reduce" });

  test("ingen video spilles, plakaten står", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollGjennom(page, 8);
    await page.waitForTimeout(600);

    const v = await page.evaluate(() =>
      [...document.querySelectorAll("video")].map((x) => ({
        paused: x.paused,
        currentTime: x.currentTime,
        poster: x.poster,
      })),
    );
    for (const x of v) {
      expect(x.paused, "video spiller ved prefers-reduced-motion").toBe(true);
      expect(x.currentTime, "video spoles ved prefers-reduced-motion").toBe(0);
      expect(x.poster, "video mangler plakat som statisk reserve").not.toBe("");
    }
  });

  test("ingen scroll-spolt video noe sted", async ({ page }) => {
    // Erstatter «/historie faller til statisk modus». /historie ble slettet
    // 7. oktober 2026, men mekanismen den voktet – en video som spoles av
    // scroll-posisjonen – kan komme tilbake i en ny komponent. Testen spør
    // derfor etter mønsteret, ikke etter siden.
    for (const side of SIDER) {
      await page.goto(side, { waitUntil: "networkidle" });
      await scrollGjennom(page, 8);
      await page.waitForTimeout(600);
      const spolt = await page.evaluate(() =>
        [...document.querySelectorAll("video")].some((v) => v.currentTime > 0),
      );
      expect(spolt, `${side}: video spoles tross prefers-reduced-motion`).toBe(false);
    }
  });
});

test.describe("slettede sider svarer 301", () => {
  // /historie lå i sitemap med prioritet 0,6 og kan være indeksert utenfra.
  // En 404 der ville kastet bort lenkeverdien; omdirigeringen lever i server.mjs.
  test("/historie peker videre til /nettsider", async ({ request }) => {
    const svar = await request.get("/historie", { maxRedirects: 0 });
    expect(svar.status(), "/historie skal svare 301").toBe(301);
    expect(svar.headers()["location"]).toBe("/nettsider");
  });
});
