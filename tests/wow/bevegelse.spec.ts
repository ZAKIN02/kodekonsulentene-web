// Tester for wow-bevegelsen (src/scripts/wow/) mot laben /lab/wow-bevegelse.
//
// Kjør mot en server du har startet selv, f.eks. utviklingsserveren:
//   npx astro dev --port 4436
//   BASE_URL=http://127.0.0.1:4436 npx playwright test tests/wow
// Mot et bygg (server.mjs) gjelder de samme testene, og da er CSP-en den ekte.
//
// Bruker installert Chrome (channel), fordi Playwrights egen Chromium ikke er lastet ned
// på alle maskiner som kjører dette.
import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { lagSikkerhetsheadere } from "../../sikkerhet.mjs";

test.use({ channel: "chrome" });

const SIDE = "/lab/wow-bevegelse";

/** Hopper over inntoningen fra svart (første visning i økta) i testene som ikke gjelder den. */
async function utenIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("wow-inngang", "1");
    } catch {
      /* ingenting */
    }
  });
}

function fangFeil(page: Page) {
  const feil: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") feil.push(m.text());
  });
  page.on("pageerror", (e) => feil.push(`pageerror: ${e.message}`));
  return feil;
}

const EFFEKTER = '[data-split], [data-reveal], [data-befaring-steg], [data-draw], [data-stagger] > *';

/** Alt som har en startstil, sett fra CSS: er det synlig og uklippet? */
async function skjulte(page: Page) {
  return page.evaluate((sel) => {
    const ut: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || Number(cs.opacity) < 1 || (cs.clipPath !== "none" && cs.clipPath !== "")) {
        ut.push(`${el.tagName.toLowerCase()}#${el.id || "?"} vis=${cs.visibility} op=${cs.opacity} clip=${cs.clipPath}`);
      }
    }
    return ut;
  }, EFFEKTER);
}

/** Ruller hele siden i små steg, så ScrollTrigger rekker å reagere. */
async function rullGjennom(page: Page, steg = 300, vent = 60) {
  const hoyde = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= hoyde; y += steg) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(vent);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
}

test.describe("grunnmur", () => {
  test("redusert bevegelse: alt står ferdig, ingen Lenis, ingen intro, ingen peker", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const feil = fangFeil(page);
    await page.goto(SIDE);
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
    await page.waitForTimeout(300);

    const html = await page.evaluate(() => document.documentElement.className);
    expect(html).not.toContain("lenis");
    expect(html).not.toContain("wow-intro-pa");
    expect(html).not.toContain("wow-peker-pa");
    await expect(page.locator("[data-intro]")).toBeHidden();
    expect(await skjulte(page)).toEqual([]);

    // Befaringen står ferdig utfylt, uten festing.
    const steg = page.locator("[data-befaring-steg]");
    for (let i = 0; i < (await steg.count()); i++) {
      await expect(steg.nth(i)).toHaveAttribute("data-befaring-status", "fylt");
    }
    await expect(page.locator("#skriv")).toHaveText("kunde.no");
    expect(await page.locator(".pin-spacer").count()).toBe(0);

    // Tallene står på sluttverdien med en gang. number-flow hentes først når tallet er nær
    // (revisor r3 #4); til da står sluttverdien som vanlig tekst, og etterpå i skjermlesertekst.
    await expect(page.locator("#tall-start")).toHaveText(/14\s900/);
    await page.locator("#tall-start").scrollIntoViewIfNeeded();
    await expect(page.locator("#tall-start .wow-sr")).toHaveText("14 900");
    expect(feil).toEqual([]);
  });

  test("uten JavaScript: alt innhold er synlig", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(SIDE);
    expect(await page.evaluate(() => document.documentElement.className)).toBe("");
    expect(await skjulte(page)).toEqual([]);
    await expect(page.locator("[data-intro]")).toBeHidden();
    await expect(page.locator("[data-wow-peker]")).toBeHidden();
    await expect(page.locator("#hero-tittel")).toHaveText("Ting som låser seg på plass");
    await expect(page.locator("#skriv")).toHaveText("kunde.no");
    await expect(page.locator("#tall-start")).toHaveText("14 900");
    // Alle stegene i befaringen står der, og spørsmålene kan åpnes som vanlige details.
    await expect(page.locator("[data-befaring-steg]")).toHaveCount(5);
    await page.locator("#faq-1 summary").click();
    await expect(page.locator("#faq-1")).toHaveAttribute("open", "");
    await ctx.close();
  });

  test("ingen feil i konsollen gjennom hele siden, og ingen vannrett rulling", async ({ page }) => {
    await utenIntro(page);
    const feil = fangFeil(page);
    await page.goto(SIDE);
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
    await rullGjennom(page);
    expect(feil).toEqual([]);
    const { bredde, vindu } = await page.evaluate(() => ({
      bredde: document.documentElement.scrollWidth,
      vindu: document.documentElement.clientWidth,
    }));
    expect(bredde).toBeLessThanOrEqual(vindu);
  });

  test("ingen layoutforskyvning (CLS) fra effektene", async ({ page }) => {
    await utenIntro(page);
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(SIDE);
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
    await rullGjennom(page, 250, 80);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThan(0.05);
  });

  test("CSP fra sikkerhet.mjs blokkerer ingenting", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Samme bunt på mobil");
    await utenIntro(page);
    // Som server.mjs: hashene for inline-skript leses ut av HTML-en, og CSP-en settes på svaret.
    await page.route(SIDE, async (route) => {
      const svar = await route.fetch();
      const kropp = await svar.text();
      const hasher = [...kropp.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
        .filter((m) => m[1].trim())
        .map((m) => `'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
      const csp = lagSikkerhetsheadere(hasher)["content-security-policy"];
      await route.fulfill({ response: svar, body: kropp, headers: { ...svar.headers(), "content-security-policy": csp } });
    });
    const brudd: string[] = [];
    page.on("console", (m) => {
      if (/content security policy/i.test(m.text())) brudd.push(m.text());
    });
    await page.goto(SIDE);
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"), null, { timeout: 8000 });
    expect(brudd.filter((b) => /script/i.test(b))).toEqual([]);
  });
});

test.describe("inngang", () => {
  test("ikke noe teppe: ingenting dekker siden, og første Tab treffer hopp-lenken", async ({ page }) => {
    await page.goto(SIDE, { waitUntil: "commit" });
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
    expect(await page.locator("[data-intro], .wow-intro").count()).toBe(0);
    // Øverste element midt på skjermen er sideinnhold, ikke et fullskjermlag.
    const midt = await page.evaluate(() => {
      const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      const cs = el ? getComputedStyle(el) : null;
      return { fast: cs?.position === "fixed" && el!.getBoundingClientRect().width >= innerWidth };
    });
    expect(midt.fast).toBe(false);
    await page.keyboard.press("Tab");
    await expect(page.locator(".lab-hopp")).toBeFocused();
  });

  test("H1-linjene er oppe innen 0,9 s, uten venting på et teppe", async ({ page }) => {
    await page.goto(SIDE, { waitUntil: "commit" });
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
    const t0 = Date.now();
    await page.waitForSelector("#hero-tittel[data-wow-vist]", { timeout: 3000 });
    // 0,9 s pluss slingringsmonn for en travel testmaskin.
    expect(Date.now() - t0).toBeLessThan(1400);
  });
});

test.describe("effekter", () => {
  test.beforeEach(async ({ page }) => {
    await utenIntro(page);
    await page.goto(SIDE);
    await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
  });

  test("split: skjermleseren får hele overskriften mens linjene animeres, og markupen blir ren etterpå", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1, name: "Ting som låser seg på plass" });
    await expect(h1).toBeVisible();
    await page.waitForSelector("#hero-tittel[data-wow-vist]");
    expect(await page.locator("#hero-tittel").evaluate((el) => el.innerHTML)).toBe("Ting som låser seg på plass");
    await expect(h1).toBeVisible();
  });

  test("count: teller opp til riktig sluttall i nb-NO, og ruller til ny verdi når data-count endres", async ({ page }) => {
    await page.locator("#tall").scrollIntoViewIfNeeded();
    await page.waitForSelector("#tall-start[data-wow-vist]");
    await page.waitForTimeout(1800);
    const start = await page.locator("#tall-start").evaluate((el) => ({
      verdi: (el.querySelector("number-flow") as unknown as { value: number }).value,
      sr: el.querySelector(".wow-sr")?.textContent,
    }));
    expect(start).toEqual({ verdi: 14900, sr: "14 900" });
    expect(await page.locator("#tall-sek number-flow").evaluate((el) => (el as unknown as { value: number }).value)).toBe(30);

    await page.getByRole("button", { name: "Bedrift" }).click();
    await page.waitForTimeout(1600);
    const velger = await page.locator("#tall-velger").evaluate((el) => ({
      verdi: (el.querySelector("number-flow") as unknown as { value: number }).value,
      sr: el.querySelector(".wow-sr")?.textContent,
    }));
    expect(velger).toEqual({ verdi: 29900, sr: "29 900" });
  });

  test("befaring: rullingen fullfører alle steg, og festingen gjelder bare desktop", async ({ page }, info) => {
    const rot = page.locator("#befaring");
    const topp = await rot.evaluate((el) => el.getBoundingClientRect().top + scrollY);
    // Rull i steg fra rett over seksjonen til godt forbi festingen.
    const tilOgMed = topp + (await page.evaluate(() => innerHeight)) * 4;
    let festet = 0;
    for (let y = topp - 200; y <= tilOgMed; y += 120) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(50);
      const t = await rot.evaluate((el) => Math.round(el.getBoundingClientRect().top));
      if (y > topp + 300 && Math.abs(t) <= 1) festet++;
    }
    await page.waitForTimeout(1500);

    const steg = page.locator("[data-befaring-steg]");
    const n = await steg.count();
    expect(n).toBe(5);
    for (let i = 0; i < n; i++) await expect(steg.nth(i)).toHaveAttribute("data-befaring-status", "fylt");
    await expect(rot).toHaveAttribute("data-befaring-ferdig", "");
    await expect(page.locator("#skriv")).toHaveAttribute("data-befaring-status", "skrevet");
    await expect(page.locator("#skriv .wow-skriv__tekst")).toHaveText("kunde.no");
    await expect(page.locator("#skriv .wow-sr")).toHaveText("kunde.no");
    // Fyllene er fulle og stegene står fullt synlige.
    const fyll = await page.locator("[data-befaring-fyll]").evaluateAll((els) =>
      els.map((e) => new DOMMatrix(getComputedStyle(e).transform).a),
    );
    expect(fyll.every((a) => Math.abs(a - 1) < 0.01)).toBe(true);
    expect(await skjulte(page)).toEqual([]);

    if (info.project.name === "desktop") expect(festet).toBeGreaterThan(5);
    else expect(festet).toBe(0);
  });

  test("befaring: baklengs rulling spoler tidslinjen tilbake (desktop)", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Ingen festing på mobil");
    const topp = await page.locator("#befaring").evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const vh = await page.evaluate(() => innerHeight);
    for (let y = topp; y <= topp + vh * 3; y += 150) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-befaring-steg="5"]')).toHaveAttribute("data-befaring-status", "fylt");
    for (let y = topp + vh * 3; y >= topp - 100; y -= 150) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(40);
    }
    // Helt opp over festepunktet: tidslinjen skal stå på null.
    await page.evaluate((y) => window.scrollTo(0, y), topp - 200);
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-befaring-steg="1"]')).toHaveAttribute("data-befaring-status", "venter");
    await expect(page.locator("#skriv .wow-skriv__tekst")).toHaveText("");
  });

  test("ankerlenke: ruller til målet og flytter fokus dit", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Lenkene i laben er desktop-meny");
    await page.getByRole("link", { name: "Spørsmål", exact: true }).click();
    await expect(page.locator("#sporsmal")).toBeFocused({ timeout: 5000 });
    await expect
      .poll(() => page.locator("#sporsmal").evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBeLessThan(10);
    expect(new URL(page.url()).hash).toBe("#sporsmal");
  });

  test("karusell: piltaster og knapper flytter raden, Tab inn i et skjult lysbilde ruller det fram", async ({ page }) => {
    const rot = page.locator("#karusell-rot");
    await rot.scrollIntoViewIfNeeded();
    await expect(rot).toHaveAttribute("aria-roledescription", "karusell");
    await page.waitForTimeout(400);
    const x = () => page.locator("#karusell-rot .karusell__spor").evaluate((el) => Math.round(new DOMMatrix(getComputedStyle(el).transform).e) + 0); // + 0: -0 blir 0
    expect(await x()).toBe(0);
    await rot.focus();
    await expect(rot).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect.poll(x, { timeout: 3000 }).toBeLessThan(-100);
    const etterPil = await x();
    await page.getByRole("button", { name: "Forrige" }).click();
    await expect.poll(x, { timeout: 3000 }).toBe(0);
    await page.locator('#karusell-rot a[href="#akt-tetting"]').focus();
    await expect.poll(x, { timeout: 3000 }).toBeLessThan(etterPil);
    expect(await rot.evaluate((el) => el.scrollLeft)).toBe(0);
  });

  test("accordion: åpner mykt, lukker de andre i gruppen, og er en ekte details hele veien", async ({ page }) => {
    const a = page.locator("#faq-1");
    await a.scrollIntoViewIfNeeded();
    await a.locator("summary").click();
    await expect(a).toHaveAttribute("open", "");
    // Underveis: høyden animeres.
    const underveis = await a.locator("summary + div").evaluate((el) => el.style.height);
    expect(underveis).not.toBe("");
    await page.waitForTimeout(800);
    expect(await a.locator("summary + div").evaluate((el) => el.style.height)).toBe("");

    const b = page.locator('details[name="faq"]').nth(1);
    await b.locator("summary").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(900);
    await expect(b).toHaveAttribute("open", "");
    expect(await a.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(false);
    expect(await a.getAttribute("name")).toBe("faq");
  });

  test("marquee: båndet går, kloner er skjult for skjermlesere, og stoppknappen stopper det", async ({ page }) => {
    const band = page.locator("#marquee");
    await band.scrollIntoViewIfNeeded();
    await page.mouse.move(2, 2);
    const x = () => band.locator(".wow-marquee__spor").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);
    const a = await x();
    await page.waitForTimeout(500);
    expect(await x()).not.toBe(a);
    expect(await band.locator('.wow-marquee__gruppe:not([aria-hidden="true"])').count()).toBe(1);
    const knapp = band.getByRole("button", { name: "Stopp løpebåndet" });
    await knapp.focus();
    await knapp.press("Enter");
    await expect(band.getByRole("button", { name: "Start løpebåndet" })).toBeVisible();
    await page.locator("body").press("Shift+Tab").catch(() => {});
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    const b = await x();
    await page.waitForTimeout(500);
    expect(await x()).toBe(b);
  });

  test("peker: følger musa og blir stor over medier (bare fin peker)", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Ingen peker på berøringsskjerm");
    const peker = page.locator("[data-wow-peker]");
    await page.mouse.move(400, 300);
    await page.mouse.move(420, 320);
    await expect(peker).toHaveAttribute("data-synlig", "");
    await page.locator("#klipp-bilde").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1600);
    const r = await page.locator("#klipp-bilde").boundingBox();
    await page.mouse.move(r!.x + r!.width / 2, r!.y + r!.height / 2);
    await expect(peker).toHaveAttribute("data-tilstand", "medie");
    await expect(peker.locator("[data-peker-tekst]")).toHaveText("Se");
  });
});
