// Tester for ScrollWorld (historien, runde wow-r5) og wow-bevegelsen, mot /lab/scroll-world.
// Historien står i src/data/historie.ts; lab-siden bruker den som standard, og har rapporten
// (Befaring.astro) rett under filmen, så overgangen fra panelet til rapporten kan måles.
//
// Kjør mot en server du har startet selv:
//   npx astro dev --port 4437 --ignore-lock
//   BASE_URL=http://127.0.0.1:4437 npx playwright test tests/wow/scroll-world.spec.ts
// Til produsenten har levert klippene, finnes de bare som plassholdere i `astro dev`
// (.design/arbeid/bevegelse/scroll-world/). Mot et bygg uten klipp hoppes testene som
// trenger video over, med begrunnelse; resten gjelder like fullt.
import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { lagSikkerhetsheadere } from "../../sikkerhet.mjs";

test.use({ channel: "chrome" });

const SIDE = "/lab/scroll-world";

function fangFeil(page: Page) {
  const feil: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") feil.push(m.text());
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

/** Ikke inntoning fra svart (første visning i økta) i testene som ikke gjelder den. */
async function utenInngang(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("wow-inngang", "1");
    } catch {
      /* ingenting */
    }
  });
}

async function klar(page: Page) {
  await page.waitForFunction(() => document.documentElement.classList.contains("wow-klar"));
}

/** Seksjonens segmenter, slik komponenten har skrevet dem i data-scroll-world. */
async function segmenter(page: Page) {
  return page.evaluate(() => {
    const rot = document.querySelector<HTMLElement>("[data-scroll-world]")!;
    return JSON.parse(rot.dataset.scrollWorld!).segmenter as { type: string; k: number; klipp: string | null; vekt: number }[];
  });
}

/** Rulleposisjon (px) der filmen står på `t` skjermhøyder inn i seksjonen. */
async function yFor(page: Page, t: number) {
  return page.evaluate((t) => {
    const rot = document.querySelector<HTMLElement>("[data-scroll-world]")!;
    const segs = JSON.parse(rot.dataset.scrollWorld!).segmenter as { vekt: number }[];
    const W = segs.reduce((a, s) => a + s.vekt, 0);
    const topp = rot.getBoundingClientRect().top + scrollY;
    const lengde = rot.offsetHeight - innerHeight;
    return Math.round(topp + (t / W) * lengde);
  }, t);
}

/** Start (i skjermhøyder) for segment nr. i. */
const startFor = (segs: { vekt: number }[], i: number) => segs.slice(0, i).reduce((a, s) => a + s.vekt, 0);

async function rullTil(page: Page, y: number, vent = 700) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(vent);
}

/**
 * Klippet i et lag, slik motoren viser det (runde 7: et lerret med WebCodecs, ellers <video>).
 * t er andelen av klippet som vises (0–1), d er 1 når klippet er klart, b og h bildets mål.
 */
async function videoI(page: Page, lag: number) {
  return page.evaluate((lag) => {
    const v = document.querySelector<HTMLElement & { swAndel?: number; swRamer?: number; swMotor?: string }>(`[data-sw-lag="${lag}"] .sw__video`);
    if (!v) return null;
    const video = v instanceof HTMLVideoElement ? v : null;
    const lerret = v instanceof HTMLCanvasElement ? v : null;
    const klar = video ? video.readyState >= 1 : (v.swRamer ?? 0) > 0;
    return {
      t: v.swAndel ?? 0,
      d: klar ? 1 : 0,
      src: video?.currentSrc ?? "",
      kilde: v.dataset.kilde ?? "",
      motor: v.swMotor ?? "",
      b: klar ? (video ? video.videoWidth : lerret!.width) : 0,
      h: klar ? (video ? video.videoHeight : lerret!.height) : 0,
    };
  }, lag);
}

test.describe("ScrollWorld: film", () => {
  test.beforeEach(async ({ page }) => {
    await utenInngang(page);
  });

  test("slutten av det siste klippet er slutten av klippet (i avspillingsretningen)", async ({ page }) => {
    await page.goto(SIDE);
    await klar(page);
    const segs = (await segmenter(page)) as unknown as { klipp: string | null; vekt: number; retning?: number }[];
    const siste = segs.map((s, i) => (s.klipp ? i : -1)).filter((i) => i >= 0).pop();
    test.skip(siste === undefined, "Ingen klipp i dette bygget");
    const slutt = startFor(segs, siste! + 1);
    for (const t of [slutt - 1.5, slutt - 0.8, slutt - 0.01]) await rullTil(page, await yFor(page, t), 300);
    await rullTil(page, await yFor(page, slutt - 0.01), 1500);
    await expect.poll(async () => {
      const v = await videoI(page, siste!);
      if (!v) return 0;
      const a = v.t / v.d;
      // Baklengs (runde 4: pult-inn) slutter klippet på sitt første bilde.
      return segs[siste!].retning === -1 ? 1 - a : a;
    }, { timeout: 6000 }).toBeGreaterThan(0.95);
  });

  test("lasting: ingen klipp før første interaksjon (heller ikke pekerbevegelse), så etter nærhet", async ({ page }) => {
    const klipp = fangKlipp(page);
    await page.goto(SIDE);
    await klar(page);
    const segs = await segmenter(page);
    test.skip(!segs.some((s) => s.klipp), "Ingen klipp i dette bygget");
    // Ved load og etter ro: ingen klipp (revisor r4 #12). Pekerbevegelse teller ikke.
    expect(klipp).toEqual([]);
    await page.mouse.move(200, 200);
    await page.mouse.move(600, 400);
    await page.waitForTimeout(3500);
    expect(klipp).toEqual([]);
    await expect(page.locator('[data-sw-lag="0"] img')).toBeVisible();
    // Første rulling: nærmeste klipp (runde 4: dive-4 baklengs og gata), ikke rørleggeren eller pult-inn.
    await rullTil(page, 200, 1500);
    expect(klipp.some((u) => /dive-4(-m)?\.mp4/.test(u))).toBe(true);
    expect(klipp.some((u) => /dive-0(-m)?\.mp4/.test(u))).toBe(true);
    expect(klipp.some((u) => /(dive-3|pult-inn)(-m)?\.mp4/.test(u))).toBe(false);
  });

  test("første visning: bare heroens bilde hentes fra filmen, nabolagenes stillbilder først etter første interaksjon (LCP)", async ({ page }, info) => {
    const bilder: string[] = [];
    page.on("request", (r) => {
      if (/\/scroll-world\/[^/]+\.(webp|avif)(\?|$)/.test(r.url())) bilder.push(decodeURIComponent(new URL(r.url()).pathname.split("/").pop()!));
    });
    await page.goto(SIDE);
    await klar(page);
    await page.waitForTimeout(2500);
    // Heroen (ett format, riktig retning) og ingenting annet fra filmen.
    expect(bilder.filter((b) => !/^hero(-m)?\.(avif|webp)$/.test(b))).toEqual([]);
    expect(bilder.length).toBe(1);
    expect(bilder[0]).toBe(info.project.name === "mobil" ? "hero-m.avif" : "hero.avif");
    // LCP-bildet er ikke lat, har høy prioritet og dekodes synkront, så det males med første bilde.
    const hero = page.locator('[data-sw-lag="0"] img');
    await expect(hero).toHaveAttribute("loading", "eager");
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    await expect(hero).toHaveAttribute("decoding", "sync");
    // Etter første interaksjon hentes stillbildet til neste lag med poster.
    await page.keyboard.press("Shift");
    await expect.poll(() => bilder.length, { timeout: 5000 }).toBeGreaterThan(1);
  });

  test("heroens bilde på stående skjerm veier under 40 kB (LCP på mobil)", async ({ request }, info) => {
    test.skip(info.project.name !== "mobil", "Gjelder det stående bildet");
    const svar = await request.get("/media/wow/scroll-world/hero-m.avif");
    test.skip(!svar.ok(), "hero-m.avif finnes ikke i dette bygget");
    expect((await svar.body()).byteLength).toBeLessThan(40 * 1024);
  });

  test("mobil velger 9:16-klippene (-m), desktop 16:9", async ({ page }, info) => {
    const klipp = fangKlipp(page);
    await page.goto(SIDE);
    await klar(page);
    const segs = await segmenter(page);
    // Første klipp i filmen (heroen er et stillbilde, så segment 0 har aldri klipp).
    const k = segs.findIndex((s) => s.klipp);
    test.skip(k < 0, "Ingen klipp i dette bygget");
    await page.keyboard.press("Shift");
    await rullTil(page, await yFor(page, startFor(segs, k) + segs[k].vekt * 0.3), 600);
    await expect.poll(() => videoI(page, k), { timeout: 8000 }).not.toBeNull();
    await expect.poll(async () => (await videoI(page, k))!.b, { timeout: 8000 }).toBeGreaterThan(0);
    const v = (await videoI(page, k))!;
    if (info.project.name === "mobil") {
      expect(klipp.every((u) => /-m\.mp4$/.test(u))).toBe(true);
      expect(v.kilde).toMatch(/-m\.mp4$/);
      expect(v.b).toBeLessThan(v.h);
      // Runde 7: stående klipp er 720 piksler brede (2,25 ganger færre piksler å dekode enn 1080).
      expect(v.b).toBeLessThanOrEqual(720);
      // Heroens stillbilde er også det stående.
      const poster = await page.locator('[data-sw-lag="0"] img').evaluate((i: HTMLImageElement) => i.currentSrc);
      expect(poster).toMatch(/-m\.(webp|avif)$|mobil\.webp$/);
    } else {
      expect(klipp.some((u) => /-m\.mp4$/.test(u))).toBe(false);
      expect(v.b).toBeGreaterThan(v.h);
    }
  });

  test("CSP fra sikkerhet.mjs: klippene tegnes, og ingenting blokkeres", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Samme bunt på mobil");
    const csp0 = lagSikkerhetsheadere([])["content-security-policy"] as string;
    expect(/media-src ([^;]*)/.exec(csp0)?.[1].split(/\s+/)).toContain("blob:");

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
      // Vites HMR-websocket finnes bare i `astro dev`, ikke i bygget.
      if (/content security policy/i.test(m.text()) && !/ws:\/\/[^ ]*\?token=/.test(m.text())) brudd.push(m.text());
    });
    await utenInngang(page);
    await page.goto(SIDE);
    await klar(page);
    const segs = await segmenter(page);
    const k = segs.findIndex((s) => s.klipp);
    if (k >= 0) {
      await page.keyboard.press("Shift");
      await rullTil(page, await yFor(page, startFor(segs, k) + segs[k].vekt * 0.3), 600);
      // Runde 7: klippet hentes med fetch (connect-src 'self') og dekodes med WebCodecs til et lerret.
      await expect(page.locator(`[data-sw-lag="${k}"]`)).toHaveAttribute("data-har-klipp", "", { timeout: 8000 });
      expect((await videoI(page, k))?.motor).toBe("webcodecs");
    }
    // Ingen <style> injisert av motoren: stilene ligger i wow-bevegelse.css.
    expect(await page.locator("style#sw-css").count()).toBe(0);
    expect(brudd).toEqual([]);
  });

  test("CSP og reserven: uten VideoDecoder spilles blob-klippet i <video>, og ingenting blokkeres", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Samme bunt på mobil");
    await page.addInitScript(() => {
      // @ts-expect-error fjerner WebCodecs, som i en nettleser uten
      delete window.VideoDecoder;
    });
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
      if (/content security policy/i.test(m.text()) && !/ws:\/\/[^ ]*\?token=/.test(m.text())) brudd.push(m.text());
    });
    await page.goto(SIDE);
    await klar(page);
    const segs = await segmenter(page);
    const k = segs.findIndex((s) => s.klipp);
    test.skip(k < 0, "Ingen klipp i dette bygget");
    await page.keyboard.press("Shift");
    await rullTil(page, await yFor(page, startFor(segs, k) + segs[k].vekt * 0.3), 600);
    await expect.poll(async () => (await videoI(page, k))?.src ?? "", { timeout: 8000 }).toMatch(/^blob:/);
    await expect(page.locator(`[data-sw-lag="${k}"]`)).toHaveAttribute("data-har-klipp", "", { timeout: 8000 });
    expect((await videoI(page, k))?.motor).toBe("video");
    expect(brudd).toEqual([]);
  });
});

/** Tilstanden i filmen, slik leseren ser den. */
async function tilstand(page: Page) {
  return page.evaluate(() => {
    const op = (el: Element | null) => {
      let o = 1;
      for (let e = el as HTMLElement | null; e && e !== document.body; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
      return o;
    };
    const kort = document.querySelector<HTMLElement>("[data-sw-kort][data-sw-aktiv]");
    const lag = [...document.querySelectorAll<HTMLElement>("[data-sw-lag]")];
    return {
      kort: kort ? Number(kort.dataset.swKort) : -1,
      fase: kort?.dataset.fase ?? "",
      synligeTekster: [...document.querySelectorAll(".sw__fase")].filter((f) => op(f) > 0.02).length,
      teller: document.querySelector("[data-sw-teller-sr]")?.textContent ?? "",
      gronne: [...document.querySelectorAll<HTMLElement>("[data-sw-kort]")].filter((k) => k.hasAttribute("data-gronn")).map((k) => Number(k.dataset.swKort)),
      tellerLamper: [...document.querySelectorAll<HTMLElement>("[data-sw-teller-lampe]")].filter((l) => l.hasAttribute("data-gronn")).length,
      tellerSynlig: document.querySelector("[data-sw-teller]")?.hasAttribute("data-synlig") ?? false,
      gra: document.querySelector(".sw__gra[data-aktiv]") !== null,
      overgang: document.querySelector<HTMLElement>("[data-sw-rapport]")?.dataset.swOvergang ?? "",
      lag: lag.filter((l) => getComputedStyle(l).visibility === "visible").map((l) => Number(l.dataset.swLag)),
      lagOpasitet: lag.map((l) => Number(getComputedStyle(l).opacity)),
      laste: [...document.querySelectorAll("[data-sw-maaling]")].filter((r) => r.hasAttribute("data-last")).length,
      plateSynlig: document.querySelector("[data-sw-plate]")?.hasAttribute("data-synlig") ?? false,
      hero: Number(getComputedStyle(document.querySelector('[data-sw-kapittel="0"] [data-sw-tekst]')!).opacity),
    };
  });
}

/**
 * Kapitlene slik skriptet har regnet dem ut (data-sw-tider), i skjermhøyder: fra (kuttet inn i
 * dykket), gronn (lampa), farge (fargene tilbake) og laas (målingene), pluss dykkets start og slutt.
 */
async function historie(page: Page) {
  await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-scroll-world]")?.dataset.swTider);
  return page.evaluate(() => {
    const rot = document.querySelector<HTMLElement>("[data-scroll-world]")!;
    const d = JSON.parse(rot.dataset.scrollWorld!);
    const tider = JSON.parse(rot.dataset.swTider!) as { fra: number; gronn: number | null; farge: number | null; laas: number[] }[];
    const segs = d.segmenter as { type: string; k: number; vekt: number }[];
    let off = 0;
    const start = segs.map((s) => ((off += s.vekt), off - s.vekt));
    return (d.kapitler as { gronnVed: number | null; tellende: boolean; maalinger: number }[]).map((k, i) => {
      const di = segs.findIndex((s) => s.type === "dykk" && s.k === i);
      return { ...k, ...tider[i], start: start[di], slutt: start[di] + segs[di].vekt, W: off };
    });
  });
}

// Runde 4 (historien C «Lampa»): testene for den gamle historien (telleren «N av 4», kortene med
// problem og løsning, «3 av 4» i de statiske blokkene) er erstattet av tests/wow/lampa.spec.ts.

test.describe("ScrollWorld: uten film", () => {
  test("Save-Data: bare stillbilder, ingen video", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    });
    const klipp = fangKlipp(page);
    await page.goto(SIDE);
    await klar(page);
    await expect(page.locator("html")).toHaveClass(/wow-spar/);
    await expect(page.locator("[data-scroll-world]")).toHaveAttribute("data-sw-modus", "stille");
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(1500);
    expect(await page.locator(".sw__video").count()).toBe(0);
    expect(klipp).toEqual([]);
  });

});

test.describe("ScrollWorld: tilgjengelighet og ro", () => {
  test("første Tab treffer hopp-lenken, neste går rett til heroen", async ({ page }) => {
    await page.goto(SIDE);
    await klar(page);
    await page.keyboard.press("Tab");
    await expect(page.locator(".lab-hopp")).toBeFocused();
    // Snarveiene i toppfeltet, så adressefeltet i heroen.
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    await expect(page.locator("#adresse")).toBeFocused();
  });

  test("ingen vannrett rulling og ingen feil i konsollen gjennom hele siden", async ({ page }) => {
    await utenInngang(page);
    const feil = fangFeil(page);
    await page.goto(SIDE);
    await klar(page);
    const hoyde = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= hoyde; y += 400) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(800);
    const { bredde, vindu } = await page.evaluate(() => ({
      bredde: document.documentElement.scrollWidth,
      vindu: document.documentElement.clientWidth,
    }));
    expect(bredde).toBeLessThanOrEqual(vindu);
    expect(feil).toEqual([]);
  });

  test("inngangen: filmen toner inn fra svart første gang i økta (≤ 0,9 s), ikke neste gang", async ({ page }) => {
    await page.goto(SIDE);
    await klar(page);
    await expect(page.locator("html")).toHaveClass(/wow-inngang/);
    const anim = await page.locator(".sw__inngang").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { navn: cs.animationName, tid: parseFloat(cs.animationDuration) };
    });
    expect(anim.navn).toBe("sw-inngang");
    expect(anim.tid).toBeLessThanOrEqual(0.9);
    // Ingenting over teksten: H1 kan klikkes/leses mens bildet toner inn.
    const over = await page.evaluate(() => {
      const h = document.querySelector("#hero-tittel")!.getBoundingClientRect();
      const el = document.elementFromPoint(h.left + 10, h.top + h.height / 2);
      return el?.closest("#hero-tittel") !== null;
    });
    expect(over).toBe(true);
    await page.reload();
    await klar(page);
    await expect(page.locator("html")).not.toHaveClass(/wow-inngang/);
  });

  test("toppfeltet glir bort ved rulling nedover og kommer tilbake ved rulling oppover", async ({ page }) => {
    await utenInngang(page);
    await page.goto(SIDE);
    await klar(page);
    const hode = page.locator("#hode");
    await rullTil(page, 1200, 400);
    await rullTil(page, 1600, 500);
    await expect(hode).toHaveAttribute("data-hode-skjult", "");
    await rullTil(page, 1400, 500);
    await expect(hode).not.toHaveAttribute("data-hode-skjult", "");
    // Fokus i feltet viser det alltid.
    await rullTil(page, 2000, 500);
    await expect(hode).toHaveAttribute("data-hode-skjult", "");
    await hode.getByRole("link", { name: "Pris" }).focus();
    await expect(hode).not.toHaveAttribute("data-hode-skjult", "");
  });
});

test.describe("tall, befaring og bunn", () => {
  test.beforeEach(async ({ page }) => {
    await utenInngang(page);
    await page.goto(SIDE);
    await klar(page);
  });

  test("pris: står ferdig når den kommer i syne, ruller bare ved bytte, og sifrene er klippet til linjen", async ({ page }) => {
    const pris = page.locator("#pris-tall");
    await pris.scrollIntoViewIfNeeded();
    await expect(pris.locator("number-flow")).toHaveCount(1);
    const start = await pris.evaluate((el) => (el.querySelector("number-flow") as unknown as { value: number }).value);
    expect(start).toBe(Number((await pris.getAttribute("data-count"))!));

    await page.getByRole("button", { name: "Bedrift" }).click();
    // Midt i rullingen: hver sifferkolonne er klippet, og ingen sifre står utenfor linjen.
    await page.waitForTimeout(120);
    const maske = await pris.evaluate((el) => {
      const nf = el.querySelector("number-flow")!;
      const linje = nf.getBoundingClientRect();
      const sifre = [...nf.shadowRoot!.querySelectorAll<HTMLElement>(".digit")];
      return {
        klippet: sifre.length > 0 && sifre.every((d) => getComputedStyle(d).overflowY === "clip"),
        innenfor: sifre.every((d) => {
          const r = d.getBoundingClientRect();
          return r.top >= linje.top - 1 && r.bottom <= linje.bottom + 1;
        }),
      };
    });
    expect(maske).toEqual({ klippet: true, innenfor: true });
    await page.waitForTimeout(700);
    const slutt = await pris.evaluate((el) => ({
      verdi: (el.querySelector("number-flow") as unknown as { value: number }).value,
      sr: el.querySelector(".wow-sr")?.textContent,
    }));
    expect(slutt.verdi).toBe(29900);
    expect(slutt.sr).toMatch(/^29\s900$/);
  });

  test("befaring: radene står i venter fra start, og fastprisen lander", async ({ page }, info) => {
    const steg = page.locator("[data-befaring-steg]");
    await expect(steg.first()).toHaveAttribute("data-befaring-status", "venter");
    // Venter-tilstand: radene er synlige fra start, bare verdien mangler.
    expect(await steg.first().evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    const rot = page.locator("#befaring");
    const topp = await rot.evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const vh = await page.evaluate(() => innerHeight);
    for (let y = topp - 200; y <= topp + vh * 2.2; y += 120) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(1200);
    const n = await steg.count();
    for (let i = 0; i < n; i++) await expect(steg.nth(i)).toHaveAttribute("data-befaring-status", "fylt");
    await expect(page.locator("#lander")).toHaveAttribute("data-befaring-landet", "");
    const verdier = await page.locator("[data-befaring-verdi]").evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
    expect(verdier.every((o) => o === "1")).toBe(true);
    // Landingen er ferdig: skala tilbake på 1.
    expect(await page.locator("#lander").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)).toBeCloseTo(1, 2);
    if (info.project.name === "desktop") {
      // Festet i 160vh, ikke 250.
      const spacer = await rot.evaluate((el: HTMLElement) => {
        const p = el.parentElement;
        return p?.classList.contains("pin-spacer") ? p.offsetHeight - el.offsetHeight : 0;
      });
      expect(Math.abs(spacer - vh * 1.6)).toBeLessThan(4);
    }
  });

  test("ordmerket løftes med rullingen og står helt oppe nederst på siden", async ({ page }) => {
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1500);
    const y = await page.locator("#ordmerke").evaluate((el) =>
      [...el.querySelectorAll<HTMLElement>(".wow-split *")]
        .filter((c) => c.children.length === 0)
        .map((c) => Math.abs(new DOMMatrix(getComputedStyle(c).transform).f)),
    );
    expect(y.length).toBeGreaterThan(5);
    expect(Math.max(...y)).toBeLessThan(1);
    await expect(page.locator("#ordmerke .wow-sr")).toHaveText("KodeKonsulentene");
  });
});
