// Tester for Kapittel (bølge A2, docs/design/wow-undersider.md del 2.3) og rolig modus (del 1.2),
// mot lab-sidene /lab/kapittel/<side> og /lab/rolig.
//
// Kjør mot dev-serveren dirigenten har startet:
//   BASE_URL=http://127.0.0.1:4700 npx playwright test tests/wow/kapittel.spec.ts
// Installert Chrome (H.264). Prosjektene «desktop» (1440 × 900) og «mobil» (Pixel 7, stående)
// fra playwright.config.ts.
import { test, expect, type Page } from "@playwright/test";

test.use({ channel: "chrome" });

const SKRUBB = "/lab/kapittel/nettsider";
const STILL = "/lab/kapittel/klinikker";
const ROLIG = "/lab/rolig";
/** Samme som PROBLEM i kapittel.ts. */
const P = { skrubb: 0.45, still: 0.3 };

function fangFeil(page: Page) {
  const feil: string[] = [];
  page.on("console", (m) => {
    // Dev-serveren melder om HMR-tilkoblingen; den er ikke sidens feil.
    if (m.type() === "error" && !/vite|hmr|websocket/i.test(m.text())) feil.push(m.text());
  });
  page.on("pageerror", (e) => feil.push(`pageerror: ${e.message}`));
  return feil;
}

function fangKlipp(page: Page) {
  const klipp: string[] = [];
  page.on("request", (r) => {
    if (/\.(mp4|webm)(\?|$)/.test(r.url())) klipp.push(decodeURIComponent(r.url()));
  });
  return klipp;
}

/** Første interaksjon (en tast), så klippet hentes. Ikke hjulet: Lenis ville rullet videre etter
 *  scrollTo i testene. */
async function interaksjon(page: Page) {
  await page.keyboard.press("Shift");
  await page.waitForTimeout(100);
}

async function klar(page: Page) {
  await page.waitForFunction(() => document.querySelector("[data-kapittel]")?.hasAttribute("data-kapittel-klar"));
}

/** Ruller til andel `a` av kapittelets rulling og venter til pS og CSS-overgangene har roet seg. */
async function tilAndel(page: Page, a: number, vent = 1300) {
  await page.evaluate((a) => {
    const k = document.querySelector<HTMLElement>("[data-kapittel]")!;
    const topp = k.getBoundingClientRect().top + scrollY;
    scrollTo(0, Math.round(topp + a * (k.offsetHeight - innerHeight)));
  }, a);
  await page.waitForTimeout(vent);
}

async function tilstand(page: Page) {
  return page.evaluate(() => {
    const k = document.querySelector<HTMLElement>("[data-kapittel]")!;
    const op = (el: Element | null) => (el ? Number(getComputedStyle(el).opacity) : -1);
    const gra = k.querySelector(".kap__gra:not(.kap__gra--mork)");
    const plate = k.querySelector("[data-kapittel-plate]");
    const flate = k.querySelector("[data-kapittel-flate]")!;
    const v = k.querySelector("video");
    return {
      fase: k.dataset.kapittelFase,
      gra: op(gra),
      graVises: gra ? getComputedStyle(gra).display !== "none" : false,
      plate: op(plate),
      lampeGronn: plate?.hasAttribute("data-gronn") ?? false,
      problem: op(k.querySelector(".kap__rad--problem")),
      losning: op(k.querySelector(".kap__rad--losning")),
      tekst: op(k.querySelector("[data-kapittel-tekst]")),
      harKlipp: flate.hasAttribute("data-har-klipp"),
      visGronn: flate.hasAttribute("data-vis-gronn"),
      tid: v ? v.currentTime : null,
      varighet: v ? v.duration : null,
      kilde: v?.dataset.kilde ?? null,
    };
  });
}

test.describe("Kapittel, skrubb", () => {
  test("ved load: H1 synlig, startbildet grått, ingen klipp før interaksjon", async ({ page }) => {
    const feil = fangFeil(page);
    const klipp = fangKlipp(page);
    await page.goto(SKRUBB);
    await klar(page);
    await page.waitForTimeout(1500);
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    expect(await h1.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    const t = await tilstand(page);
    expect(t.fase).toBe("problem");
    expect(t.gra).toBeGreaterThan(0.9);
    expect(t.plate).toBe(0);
    expect(klipp, "ingen klipp før første interaksjon").toEqual([]);
    // Bare startbildet er hentet av kapittelets bilder (det grønne er lazy og skjult).
    const bilder = await page.evaluate(() =>
      performance.getEntriesByType("resource").map((r) => r.name).filter((n) => n.includes("/kapitler/")),
    );
    expect(bilder.some((b) => /kapittel-1-start/.test(b))).toBe(true);
    expect(bilder.some((b) => /kapittel-1-gronn/.test(b))).toBe(false);
    expect(feil).toEqual([]);
  });

  test("grå → farge og problem → løsning, i rammen ved gronnVed, begge veier", async ({ page }) => {
    const feil = fangFeil(page);
    await page.goto(SKRUBB);
    await klar(page);
    await interaksjon(page);
    await tilAndel(page, 0.3);
    let t = await tilstand(page);
    expect(t.fase).toBe("problem");
    expect(t.gra).toBeGreaterThan(0.9);
    expect(t.lampeGronn).toBe(false);
    expect(t.problem).toBe(1);
    expect(t.losning).toBe(0);
    expect(t.tekst, "heroteksten er ute etter 12 %").toBe(0);

    // Rett før og rett etter det grønne: løsningen får minst 55 % av rullingen.
    await tilAndel(page, P.skrubb - 0.02);
    expect((await tilstand(page)).fase).toBe("problem");
    await tilAndel(page, P.skrubb + 0.005);
    t = await tilstand(page);
    expect(t.fase).toBe("losning");
    expect(t.lampeGronn).toBe(true);
    expect(t.gra).toBeLessThan(0.05);
    expect(t.problem).toBe(0);
    expect(t.losning).toBe(1);

    // Baklengs: grått og problemet igjen.
    await tilAndel(page, 0.25);
    t = await tilstand(page);
    expect(t.fase).toBe("problem");
    expect(t.gra).toBeGreaterThan(0.9);
    expect(t.problem).toBe(1);
    expect(t.losning).toBe(0);
    expect(feil).toEqual([]);
  });

  test("aldri to tekster synlige på platen, også midt i byttet", async ({ page }) => {
    await page.goto(SKRUBB);
    await klar(page);
    await tilAndel(page, 0.35);
    let verst = 0;
    for (const a of [0.42, 0.46, 0.5, 0.44, 0.4, 0.47]) {
      await page.evaluate((a) => {
        const k = document.querySelector<HTMLElement>("[data-kapittel]")!;
        scrollTo(0, Math.round(k.getBoundingClientRect().top + scrollY + a * (k.offsetHeight - innerHeight)));
      }, a);
      for (let i = 0; i < 25; i++) {
        const sum = await page.evaluate(() => {
          const k = document.querySelector("[data-kapittel]")!;
          return [".kap__rad--problem", ".kap__rad--losning"]
            .map((s) => Number(getComputedStyle(k.querySelector(s)!).opacity))
            .reduce((x, y) => x + y, 0);
        });
        verst = Math.max(verst, sum);
        await page.waitForTimeout(16);
      }
    }
    // Den gamle er ute (120 ms) før den nye kommer (etter 120 ms): summen av opasitet ≤ 1.
    expect(verst).toBeLessThanOrEqual(1.001);
  });

  test("klippet følger rullingen: grønt lys i klippet når lampa blir grønn, riktig fil per skjerm", async ({ page }, info) => {
    const klipp = fangKlipp(page);
    await page.goto(SKRUBB);
    await klar(page);
    await interaksjon(page);
    await page.waitForFunction(() => document.querySelector("[data-kapittel-flate]")?.hasAttribute("data-har-klipp"), null, { timeout: 15000 });
    const mobil = info.project.name === "mobil";
    expect(klipp.length).toBe(1);
    expect(klipp[0]).toMatch(mobil ? /kapittel-1-m\.mp4$/ : /kapittel-1\.mp4$/);
    const g = Number(await page.locator("[data-kapittel]").getAttribute("data-kapittel-gronn"));
    await tilAndel(page, P.skrubb, 1800);
    let t = await tilstand(page);
    expect(Math.abs(t.tid! / t.varighet! - g)).toBeLessThan(0.04);
    // Halvveis i løsningen er klippet mellom det grønne og slutten, og baklengs spoler tilbake.
    await tilAndel(page, 0.8, 1800);
    t = await tilstand(page);
    const iLosning = t.tid! / t.varighet!;
    expect(iLosning).toBeGreaterThan(g);
    expect(iLosning).toBeLessThan(1);
    await tilAndel(page, 0.1, 1800);
    t = await tilstand(page);
    expect(t.tid! / t.varighet!).toBeLessThan(g * 0.5);
  });

  test("fokus i heroteksten når den er ute, ruller tilbake; Tab går videre til seksjon 2", async ({ page }) => {
    await page.goto(SKRUBB);
    await klar(page);
    const siste = page.locator("[data-kapittel-tekst] a").last();
    await siste.focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#forste-etter")).toBeFocused();
    await tilAndel(page, 0.5);
    await page.locator("[data-kapittel-tekst] a").first().focus();
    await page.waitForTimeout(400);
    const t = await tilstand(page);
    expect(t.tekst).toBe(1);
    expect(await page.evaluate(() => scrollY)).toBeLessThan(5);
  });

  test("ingen sidelengs overflyt ved 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(SKRUBB);
    await klar(page);
    for (const a of [0, 0.3, 0.7]) {
      await tilAndel(page, a, 500);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Kapittel, still", () => {
  test("ingen video; det grønne bildet er grått til 30 %, så farge", async ({ page }) => {
    const klipp = fangKlipp(page);
    await page.goto(STILL);
    await klar(page);
    await interaksjon(page);
    await tilAndel(page, P.still - 0.05);
    let t = await tilstand(page);
    expect(t.fase).toBe("problem");
    expect(t.gra).toBeGreaterThan(0.9);
    await tilAndel(page, P.still + 0.03);
    t = await tilstand(page);
    expect(t.fase).toBe("losning");
    expect(t.gra).toBeLessThan(0.05);
    expect(t.lampeGronn).toBe(true);
    expect(klipp).toEqual([]);
  });
});

test.describe("Kapittel uten bevegelse", () => {
  test("redusert bevegelse: vanlig høyde, farge, begge linjer, ingen video", async ({ browser }, info) => {
    const ctx = await browser.newContext({ ...info.project.use, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const klipp = fangKlipp(page);
    await page.goto(SKRUBB);
    await klar(page);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(1200);
    const t = await page.evaluate(() => {
      const k = document.querySelector<HTMLElement>("[data-kapittel]")!;
      const ramme = k.querySelector<HTMLElement>(".kap__ramme")!;
      const gronn = k.querySelector(".kap__bilde--gronn img")!;
      return {
        film: k.hasAttribute("data-kapittel-film"),
        hoydeLik: Math.abs(k.offsetHeight - ramme.offsetHeight) < 2,
        graVises: getComputedStyle(k.querySelector(".kap__gra")!).display !== "none",
        gronnVises: getComputedStyle(k.querySelector(".kap__bilde--gronn")!).display !== "none",
        gronnSrc: (gronn as HTMLImageElement).currentSrc,
        problem: getComputedStyle(k.querySelector(".kap__rad--problem")!).opacity,
        losning: getComputedStyle(k.querySelector(".kap__rad--losning")!).opacity,
      };
    });
    expect(t.film).toBe(false);
    expect(t.hoydeLik).toBe(true);
    expect(t.graVises).toBe(false);
    expect(t.gronnVises).toBe(true);
    expect(t.gronnSrc).toMatch(/kapittel-1-gronn/);
    expect(t.problem).toBe("1");
    expect(t.losning).toBe("1");
    await expect(page.locator("[data-kapittel]").getByText("Kunden står utenfor med mobilen")).toBeVisible();
    await expect(page.locator("[data-kapittel]").getByText("En rask side, så kunden bestiller")).toBeVisible();
    expect(klipp).toEqual([]);
    await ctx.close();
  });

  test("uten JavaScript: alt innhold står, det grønne bildet, ingen video", async ({ browser }, info) => {
    const ctx = await browser.newContext({ ...info.project.use, javaScriptEnabled: false });
    const page = await ctx.newPage();
    const klipp = fangKlipp(page);
    await page.goto(SKRUBB);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-kapittel]").getByText("Kunden står utenfor med mobilen")).toBeVisible();
    await expect(page.locator("[data-kapittel]").getByText("En rask side, så kunden bestiller")).toBeVisible();
    await expect(page.locator(".kap__bilde--gronn img")).toBeVisible();
    await expect(page.locator(".kap__bilde--start")).toBeHidden();
    await expect(page.getByRole("link", { name: "Book 20 minutter" })).toBeVisible();
    expect(await page.locator("[data-kapittel-film]").count()).toBe(0);
    expect(klipp).toEqual([]);
    await ctx.close();
  });
});

test.describe("rolig modus", () => {
  test("laster ikke GSAP, Lenis eller filminngangen", async ({ page }) => {
    const feil = fangFeil(page);
    const skript: string[] = [];
    page.on("request", (r) => {
      if (r.resourceType() === "script") skript.push(decodeURIComponent(r.url()));
    });
    await page.goto(ROLIG, { waitUntil: "networkidle" });
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(800);
    expect(skript.some((s) => /rolig\.ts/.test(s)), "rolig.ts er lastet").toBe(true);
    const tunge = skript.filter((s) => /gsap|ScrollTrigger|SplitText|lenis|embla|number-flow|scripts\/wow\/(index|felles|kapittel)\.ts/i.test(s));
    expect(tunge).toEqual([]);
    const html = await page.evaluate(() => document.documentElement.className);
    expect(html).toContain("wow-rolig");
    expect(html).not.toContain("lenis");
    expect(feil).toEqual([]);
  });

  test("toppfeltet glir bort ved rulling ned og kommer tilbake ved rulling opp", async ({ page }) => {
    await page.goto(ROLIG);
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-rolig"));
    const hode = page.locator("[data-hode-skjul]");
    await page.evaluate(() => scrollTo(0, 900));
    await page.waitForTimeout(150);
    await page.evaluate(() => scrollTo(0, 1100));
    await expect(hode).toHaveAttribute("data-hode-skjult", "");
    await page.evaluate(() => scrollTo(0, 1000));
    await expect(hode).not.toHaveAttribute("data-hode-skjult", "");
  });

  test("<details> åpnes med opasitet, ikke høyde; et kapittel på siden blir stillbilde", async ({ page }) => {
    await page.goto(ROLIG);
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-rolig"));
    const overgang = await page.evaluate(() => {
      const d = document.querySelector("main details")!;
      const cs = getComputedStyle(d, "::details-content");
      return { egenskap: cs.transitionProperty, varighet: cs.transitionDuration };
    });
    expect(overgang.egenskap).toContain("opacity");
    expect(overgang.egenskap).not.toMatch(/height|block-size/);
    const k = await page.evaluate(() => {
      const k = document.querySelector<HTMLElement>("[data-kapittel]")!;
      return { film: k.hasAttribute("data-kapittel-film"), klar: k.hasAttribute("data-kapittel-klar") };
    });
    expect(k).toEqual({ film: false, klar: true });
  });
});

/**
 * Kontrast over bildet: teksten gjøres gjennomsiktig, bakgrunnen bak hver tekstboks fotograferes,
 * og 95-persentilen av luminansen (de lyseste 5 % er enkeltpiksler i lyskilder) måles mot
 * tekstfargen. 4,5:1 for brødtekst og lenker, 3:1 for H1 (stor tekst).
 */
async function kontraster(page: Page) {
  const bokser = await page.evaluate(() => {
    const k = document.querySelector("[data-kapittel]")!;
    const mal = [
      ["h1", 3],
      [".kap__ingress", 4.5],
      [".kap__lenke", 4.5],
      [".kap__rad--problem .kap__linje", 4.5],
      [".kap__rad--losning .kap__linje", 4.5],
    ] as const;
    const ut: { navn: string; krav: number; x: number; y: number; w: number; h: number; farge: string }[] = [];
    for (const [sel, krav] of mal) {
      const el = k.querySelector<HTMLElement>(sel);
      // Synlig bare hvis ingen forelder er gjennomsiktig eller klippet bort (heroteksten ute, platen inne).
      let synlig = !!el;
      for (let e: Element | null = el; e && synlig; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (Number(cs.opacity) < 0.5 || cs.visibility === "hidden" || /inset\(-?[\d.]+\w* 0px (9\d|100)/.test(cs.clipPath)) synlig = false;
      }
      if (!el || !synlig) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.bottom < 0 || r.top > innerHeight) continue;
      ut.push({ navn: sel, krav, x: r.left, y: Math.max(0, r.top), w: r.width, h: Math.min(r.bottom, innerHeight) - Math.max(0, r.top), farge: getComputedStyle(el).color });
    }
    const stil = document.createElement("style");
    stil.id = "test-skjul";
    stil.textContent = "[data-kapittel] *{color:transparent!important;background-image:none!important;text-shadow:none!important}";
    document.head.append(stil);
    return ut;
  });
  const res: { navn: string; krav: number; forhold: number }[] = [];
  for (const b of bokser) {
    const png = await page.screenshot({ clip: { x: b.x, y: b.y, width: b.w, height: b.h } });
    const forhold = await page.evaluate(
      async ({ data, farge }) => {
        const lum = (r: number, g: number, b: number) => {
          const f = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const bilde = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
        const c = new OffscreenCanvas(bilde.width, bilde.height);
        const ctx = c.getContext("2d")!;
        ctx.drawImage(bilde, 0, 0);
        const px = ctx.getImageData(0, 0, bilde.width, bilde.height).data;
        const l: number[] = [];
        for (let i = 0; i < px.length; i += 4) l.push(lum(px[i], px[i + 1], px[i + 2]));
        l.sort((a, b) => a - b);
        const bak = l[Math.floor(l.length * 0.95)];
        const [r, g, b] = farge.match(/\d+/g)!.map(Number);
        const t = lum(r, g, b);
        return (Math.max(t, bak) + 0.05) / (Math.min(t, bak) + 0.05);
      },
      { data: png.toString("base64"), farge: b.farge },
    );
    res.push({ navn: b.navn, krav: b.krav, forhold });
  }
  await page.evaluate(() => document.getElementById("test-skjul")?.remove());
  return res;
}

test.describe("Kapittel, kontrast", () => {
  for (const [navn, side, a] of [
    ["skrubb, heroen", SKRUBB, 0],
    ["skrubb, problemet", SKRUBB, 0.3],
    ["skrubb, løsningen", SKRUBB, 0.7],
    ["still, løsningen", STILL, 0.6],
    ["om, heroen", "/lab/kapittel/om", 0],
    ["om, løsningen", "/lab/kapittel/om", 0.7],
  ] as const) {
    test(`tekst over bildet holder kravet: ${navn}`, async ({ page }) => {
      await page.goto(side);
      await klar(page);
      await interaksjon(page);
      await tilAndel(page, a, 2000);
      const res = await kontraster(page);
      expect(res.length).toBeGreaterThan(0);
      for (const r of res) expect(r.forhold, `${r.navn}: ${r.forhold.toFixed(2)}:1`).toBeGreaterThanOrEqual(r.krav);
    });
  }

  test("tekst over bildet holder kravet: redusert bevegelse (platen under heroen)", async ({ browser }, info) => {
    const ctx = await browser.newContext({ ...info.project.use, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(SKRUBB);
    await klar(page);
    await page.waitForTimeout(800);
    const res = await kontraster(page);
    for (const r of res) expect(r.forhold, `${r.navn}: ${r.forhold.toFixed(2)}:1`).toBeGreaterThanOrEqual(r.krav);
    await ctx.close();
  });
});
