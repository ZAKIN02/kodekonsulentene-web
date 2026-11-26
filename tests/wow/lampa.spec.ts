// Tester for filmen på forsiden, historien C «Lampa» (runde 4, docs/design/historie-manus.md del 5),
// mot /lab/scroll-world (samme ScrollWorld og samme `film` fra src/data/historie.ts som forsiden,
// med rapporten under).
//
//   BASE_URL=http://127.0.0.1:4700 npx playwright test tests/wow/lampa.spec.ts
// Installert Chrome (H.264). I `astro dev` står plassholdere for N1 (pult.webp) og N2 (pult-inn.mp4)
// til produsenten har levert; mot et bygg uten dem brukes reserven (manus C), og testene som gjelder
// N2, hoppes over med begrunnelse.
import { test, expect, type Page } from "@playwright/test";

test.use({ channel: "chrome" });

const SIDE = "/lab/scroll-world";

interface Tider {
  W: number;
  linjer: number[];
  gra: [number, number][];
  laas: number[];
  malt: number | null;
}

interface SegData {
  type: "klipp" | "still";
  klipp: string | null;
  vekt: number;
  retning: 1 | -1;
}

function fangFeil(page: Page) {
  const feil: string[] = [];
  page.on("console", (m) => {
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

async function apne(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem("wow-inngang", "1"));
  await page.goto(SIDE);
  await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-scroll-world]")?.dataset.swTider);
}

const tider = (page: Page) =>
  page.evaluate(() => JSON.parse(document.querySelector<HTMLElement>("[data-scroll-world]")!.dataset.swTider!) as Tider);
const segmenter = (page: Page) =>
  page.evaluate(() => JSON.parse(document.querySelector<HTMLElement>("[data-scroll-world]")!.dataset.scrollWorld!).segmenter as SegData[]);

/** Ruller til `t` skjermhøyder inn i filmen og venter til klokka og CSS har roet seg. */
async function til(page: Page, t: number, vent = 1100) {
  await page.evaluate((t) => {
    const r = document.querySelector<HTMLElement>("[data-scroll-world]")!;
    const W = JSON.parse(r.dataset.swTider!).W;
    const topp = r.getBoundingClientRect().top + scrollY;
    scrollTo(0, Math.round(topp + (t / W) * (r.offsetHeight - innerHeight)));
  }, t);
  await page.waitForTimeout(vent);
}

async function tilstand(page: Page) {
  return page.evaluate(() => {
    const r = document.querySelector<HTMLElement>("[data-scroll-world]")!;
    const plate = r.querySelector<HTMLElement>("[data-sw-plate]")!;
    const aktiv = r.querySelector<HTMLElement>("[data-sw-linje][data-sw-aktiv]");
    const op = (el: Element | null) => (el ? Number(getComputedStyle(el).opacity) : -1);
    return {
      linje: aktiv ? Number(aktiv.dataset.swLinje) : -1,
      plate: plate.hasAttribute("data-synlig"),
      malt: plate.hasAttribute("data-malt"),
      gra: op(r.querySelector(".sw__gra")),
      statusMalt: op(r.querySelector(".sw__status-malt")),
      statusIkke: op(r.querySelector(".sw__status-ikke")),
      lampeGronn: op(r.querySelector("[data-sw-lampe] .sw__lampe-gronn")),
      synligeLinjer: [...r.querySelectorAll("[data-sw-linje]")].reduce((a, l) => a + op(l), 0),
      lag: [...r.querySelectorAll<HTMLElement>("[data-sw-lag]")].map((l) => l.style.visibility === "visible"),
    };
  });
}

/** Klippet i et lag (runde 7: lerret med WebCodecs, ellers <video>). t er andelen som vises, d er 1 når det er klart. */
async function video(page: Page, lag: number) {
  return page.evaluate((lag) => {
    const v = document.querySelector<HTMLElement & { swAndel?: number; swRamer?: number }>(`[data-sw-lag="${lag}"] .sw__video`);
    if (!v) return null;
    const klar = v instanceof HTMLVideoElement ? v.readyState >= 1 : (v.swRamer ?? 0) > 0;
    return { t: v.swAndel ?? 0, d: klar ? 1 : 0, kilde: v.dataset.kilde ?? "" };
  }, lag);
}

test.describe("Lampa: filmen", () => {
  test("heroen: siste ramme i dive-4, H1 synlig, lampa hul, ingen klipp før interaksjon, ingen teller", async ({ page }, info) => {
    const feil = fangFeil(page);
    const klipp = fangKlipp(page);
    await apne(page);
    await page.waitForTimeout(1200);
    await expect(page.locator("[data-scroll-world]")).toHaveAttribute("data-sw-modus", "film");
    const forste = await page.evaluate(() => document.querySelector<HTMLImageElement>('[data-sw-lag="0"] img')!.currentSrc);
    expect(forste).toMatch(info.project.name === "mobil" ? /hero-m\.(avif|webp)/ : /hero\.(avif|webp)/);
    await expect(page.locator("h1").first()).toBeVisible();
    const s = await tilstand(page);
    expect(s.plate).toBe(false);
    expect(s.malt).toBe(false);
    expect(await page.locator("[data-sw-teller], .sw__teller").count()).toBe(0);
    expect(klipp).toEqual([]);
    expect(feil).toEqual([]);
  });

  test("linjene kommer i manusets rekkefølge, én om gangen, og den stille linja tømmer platen", async ({ page }) => {
    await apne(page);
    const T = await tider(page);
    const stille = await page.evaluate(() => JSON.parse(document.querySelector<HTMLElement>("[data-scroll-world]")!.dataset.scrollWorld!).linjer.map((l: { stille: boolean }) => l.stille) as boolean[]);
    for (let j = 0; j < T.linjer.length; j++) {
      const neste = T.linjer[j + 1] ?? T.W;
      await til(page, (T.linjer[j] + Math.min(neste, T.W) ) / 2, 900);
      const s = await tilstand(page);
      expect(s.linje, `linje ${j}`).toBe(j);
      expect(s.plate, `platen ved linje ${j}`).toBe(!stille[j]);
      expect(s.synligeLinjer, `bare én linje synlig ved ${j}`).toBeLessThanOrEqual(1.001);
    }
  });

  test("gråtonen og lampa er uavhengige: fargene kommer tilbake i bakeriet, lampa er fortsatt hul", async ({ page }) => {
    await apne(page);
    const T = await tider(page);
    const [g0, g1] = T.gra[0];
    await til(page, (g0 + g1) / 2, 1300);
    let s = await tilstand(page);
    expect(s.gra).toBeGreaterThan(0.9);
    expect(s.malt).toBe(false);
    await til(page, g1 + 0.1, 1300);
    s = await tilstand(page);
    expect(s.gra, "fargene er tilbake").toBeLessThan(0.05);
    expect(s.malt, "lampa er ikke tent av fargene").toBe(false);
    expect(s.statusIkke).toBe(1);
    expect(s.lampeGronn).toBe(0);
  });

  test("lampa tennes første gang når den fjerde målingen låser seg, med dato, og slukkes baklengs", async ({ page }) => {
    await apne(page);
    const T = await tider(page);
    expect(T.malt).not.toBeNull();
    // Rett før: tre rader låst, lampa hul.
    await til(page, T.malt! - 0.03, 1300);
    let s = await tilstand(page);
    expect(s.malt).toBe(false);
    expect(await page.locator("[data-sw-maaling][data-last]").count()).toBe(3);
    // Rett etter: fire rader, lampa fylt grønn med dato.
    await til(page, T.malt! + 0.03, 1300);
    s = await tilstand(page);
    expect(s.malt).toBe(true);
    expect(await page.locator("[data-sw-maaling][data-last]").count()).toBe(4);
    expect(s.lampeGronn).toBe(1);
    // Datoen står ved lampa når platen er synlig (neste linje: «Den første lampa i filmen som lyser»).
    await til(page, T.malt! + 0.15, 1300);
    s = await tilstand(page);
    expect(s.statusMalt).toBe(1);
    await expect(page.locator(".sw__status-malt")).toHaveText(/Målt \d+\. \w+\.? \d{4}/);
    // Baklengs: hul igjen.
    await til(page, T.laas[0] - 0.2, 1300);
    s = await tilstand(page);
    expect(s.malt).toBe(false);
    // Hele veien fra gata til pulten har lampa vært hul.
    for (const t of [1.5, 3.0, 4.4, 5.6, 6.3]) {
      await til(page, t, 500);
      expect((await tilstand(page)).malt, `t=${t}`).toBe(false);
    }
  });

  test("baklengs: dive-4 spoles tilbake i prologen og starter på heroens bilde; pult-inn baklengs", async ({ page }) => {
    await apne(page);
    await page.keyboard.press("Shift");
    const segs = await segmenter(page);
    const start = (i: number) => segs.slice(0, i).reduce((a, s) => a + s.vekt, 0);
    const bak = segs.map((s, i) => (s.type === "klipp" && s.retning === -1 && s.klipp ? i : -1)).filter((i) => i >= 0);
    expect(bak.length).toBeGreaterThanOrEqual(1);
    for (const i of bak) {
      await til(page, start(i) + segs[i].vekt * 0.1, 1500);
      await expect.poll(async () => (await video(page, i))?.d ?? 0, { timeout: 8000 }).toBeGreaterThan(0);
      await page.waitForTimeout(600);
      const tidlig = (await video(page, i))!;
      await til(page, start(i) + segs[i].vekt * 0.9, 1500);
      const sent = (await video(page, i))!;
      expect(tidlig.t / tidlig.d, `segment ${i} (${tidlig.kilde}) tidlig`).toBeGreaterThan(0.75);
      expect(sent.t / sent.d, `segment ${i} sent`).toBeLessThan(0.25);
    }
  });

  test("stillbilder er egne segmenter: ingen video i laget, zoom bare med transform", async ({ page }) => {
    await apne(page);
    await page.keyboard.press("Shift");
    const segs = await segmenter(page);
    const start = (i: number) => segs.slice(0, i).reduce((a, s) => a + s.vekt, 0);
    const pult = segs.findIndex((s, i) => s.type === "still" && i > 0 && s.vekt > 1);
    expect(pult).toBeGreaterThan(0);
    await til(page, start(pult) + segs[pult].vekt * 0.4, 1300);
    const z = await page.evaluate((i) => {
      const l = document.querySelector<HTMLElement>(`[data-sw-lag="${i}"]`)!;
      return { video: !!l.querySelector("video, canvas, .sw__video"), zoom: Number(l.style.getPropertyValue("--sw-zoom")), transform: getComputedStyle(l.querySelector("img")!).transform };
    }, pult);
    expect(z.video).toBe(false);
    expect(z.zoom).toBeGreaterThan(1.05);
    expect(z.transform).toMatch(/matrix/);
  });

  test("hardt kutt i sømmene: et lag er helt synlig eller helt borte, aldri to samtidig (unntatt laget under et klipp som ikke har tegnet)", async ({ page }) => {
    await apne(page);
    const T = await tider(page);
    for (let t = 0.2; t < T.W; t += 0.45) {
      await til(page, t, 500);
      const s = await tilstand(page);
      expect(s.lag.filter(Boolean).length, `t=${t.toFixed(2)}`).toBeLessThanOrEqual(2);
      expect(s.lag.filter(Boolean).length).toBeGreaterThanOrEqual(1);
    }
  });

  test("overgangen: panelet blir radene i rapporten, og den hule lampa står ved feltet", async ({ page }) => {
    await apne(page);
    const T = await tider(page);
    test.skip((await page.locator("[data-sw-rapport]").count()) === 0, "Ingen rapport på siden");
    await til(page, T.W + 1.5, 1500);
    await expect(page.locator("[data-sw-rapport]")).toHaveAttribute("data-sw-overgang", "etter");
    await expect(page.getByText("Din side: ikke målt").first()).toBeVisible();
  });
});

test.describe("Lampa: uten film", () => {
  async function sjekkManus(page: Page) {
    // Alle linjene som ikke er stille, står som tekst i rekkefølge, med H2-ene som lenker.
    const forventet = await page.evaluate(() =>
      [...document.querySelectorAll("[data-sw-linje] .sw__fortelling")].map((p) => p.textContent!.trim()).filter(Boolean),
    );
    const statisk = await page.evaluate(() => [...document.querySelectorAll(".sw__linje-fast")].map((p) => p.textContent!.trim()));
    expect(statisk).toEqual(forventet);
    for (const p of await page.locator(".sw__linje-fast").all()) await expect(p).toBeVisible();
    for (const href of ["/nettsider", "/systemer", "/apper-og-ai"]) {
      await expect(page.locator(`.sw__blokk h2 a[href="${href}"]`)).toBeVisible();
    }
    await expect(page.locator(".sw__lampe-rad[data-gronn]")).toHaveCount(1);
    await expect(page.locator(".sw__lampe-rad[data-gronn]")).toContainText(/Målt/);
  }

  test("redusert bevegelse: beatene som statiske blokker i rekkefølge, ingen video", async ({ browser }, info) => {
    const ctx = await browser.newContext({ ...info.project.use, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const klipp = fangKlipp(page);
    await page.goto(SIDE);
    await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-scroll-world]")?.dataset.swModus === "stille");
    await sjekkManus(page);
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(800);
    expect(klipp).toEqual([]);
    // Heller ikke lerret eller motor: bare stillbilder.
    expect(await page.locator("[data-scroll-world] :is(video, canvas, .sw__video)").count()).toBe(0);
    await ctx.close();
  });

  test("uten JavaScript: samme manus, heroen over pulten", async ({ browser }, info) => {
    const ctx = await browser.newContext({ ...info.project.use, javaScriptEnabled: false });
    const page = await ctx.newPage();
    const klipp = fangKlipp(page);
    await page.goto(SIDE);
    await sjekkManus(page);
    await expect(page.locator("h1").first()).toBeVisible();
    const src = await page.locator('[data-sw-lag="0"] img').evaluate((i: HTMLImageElement) => i.currentSrc);
    expect(src).toMatch(/hero/);
    expect(klipp).toEqual([]);
    await ctx.close();
  });
});

test.describe("Lampa: hero, overgang og tastatur", () => {
  test("heroen glir opp og ut og er borte innen 12vh; platen kommer først med prologens første linje", async ({ page }) => {
    await apne(page);
    const T = await tider(page);
    expect(await page.locator("#hero-tittel").evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
    await til(page, 0.05, 700);
    const halv = await page.locator('[data-sw-kapittel="0"] [data-sw-tekst]').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { op: cs.opacity, y: new DOMMatrix(cs.transform).f, klipp: cs.clipPath };
    });
    expect(halv.op).toBe("1");
    expect(halv.y).toBeLessThan(-5);
    expect(halv.klipp).toMatch(/^inset\(/);
    await til(page, 0.13, 700);
    expect(await page.locator('[data-sw-kapittel="0"] [data-sw-tekst]').evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    expect((await tilstand(page)).plate).toBe(false);
    await til(page, T.linjer[0] + 0.05, 900);
    expect((await tilstand(page)).plate).toBe(true);
  });

  test("panelet blir rapporten: ingen skjerm viser målingene to ganger", async ({ page }) => {
    await apne(page);
    test.skip((await page.locator("[data-sw-rapport]").count()) === 0, "Ingen rapport på siden");
    const T = await tider(page);
    const yFor = (t: number) =>
      page.evaluate((t) => {
        const r = document.querySelector<HTMLElement>("[data-scroll-world]")!;
        return Math.round(r.getBoundingClientRect().top + scrollY + (t / JSON.parse(r.dataset.swTider!).W) * (r.offsetHeight - innerHeight));
      }, t);
    await til(page, T.W - 0.3, 1200);
    await expect(page.locator("[data-sw-rapport]")).toHaveAttribute("data-sw-overgang", "for", { timeout: 5000 });
    const sluttY = await yFor(T.W);
    const rapportY = await page.locator("[data-sw-rapport] .wow-rapport").evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const synlige = () =>
      page.evaluate(() => {
        const vises = (el: HTMLElement) => {
          if (getComputedStyle(el).visibility !== "visible") return false;
          let o = 1;
          for (let e: HTMLElement | null = el; e && e !== document.body; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
          const r = el.getBoundingClientRect();
          return o > 0.02 && r.bottom > 0 && r.top < innerHeight && r.width > 0;
        };
        const panel = [...document.querySelectorAll<HTMLElement>("[data-sw-maaling] .sw__maaling-verdi")].map(vises);
        const rapport = [...document.querySelectorAll<HTMLElement>("[data-sw-rapport] .wow-rapport__verdi")].map(vises);
        return panel.map((p, j) => Number(p) + Number(rapport[j]));
      });
    let sett = 0;
    for (let y = sluttY - 300; y <= rapportY + 200; y += 60) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(120);
      const n = await synlige();
      for (const [j, antall] of n.entries()) expect(antall, `y = ${y}, rad ${j}`).toBeLessThanOrEqual(1);
      sett += n.reduce((a, b) => a + b, 0);
    }
    expect(sett).toBeGreaterThan(0);
  });

  test("Tab: hopp-lenken etter heroen, så hver H2 i filmen ett stopp, og den vises når den har fokus", async ({ page }) => {
    await apne(page);
    await page.locator("#adresse").focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator(".sw__hopp")).toBeFocused();
    for (const navn of ["Nettsider som laster på mobilen", "Integrasjoner for booking, betaling og regnskap", "Apper for håndverkere"]) {
      await page.keyboard.press("Tab");
      const lenke = page.locator(".sw__plate a", { hasText: navn });
      await expect(lenke).toBeFocused();
      await page.waitForTimeout(600);
      const synlig = await lenke.evaluate((el) => {
        let o = 1;
        for (let e = el as HTMLElement | null; e && e !== document.body; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
        const r = el.getBoundingClientRect();
        return o > 0.99 && r.width > 0 && r.top >= 0 && r.bottom <= innerHeight;
      });
      expect(synlig, navn).toBe(true);
    }
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.closest("[data-scroll-world]") === null)).toBe(true);
    const skjult = await page.evaluate(() =>
      [...document.querySelectorAll("[aria-hidden='true'] a, [aria-hidden='true'] button, [aria-hidden='true'] input")].filter(
        (el) => (el as HTMLElement).tabIndex >= 0,
      ).length,
    );
    expect(skjult).toBe(0);
  });
});
