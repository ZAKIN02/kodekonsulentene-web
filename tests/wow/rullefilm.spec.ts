// Rullefilmen i nettleseren (runde 7): src/scripts/wow/rullefilm.ts mot /lab/scroll-world.
// De rene funksjonene testes i spole.spec.ts. Her: at bildet følger rullingen, at fila hentes i deler,
// og at reserven (<video>) tar over når WebCodecs mangler eller ikke kan dekode.
//
//   npx astro dev --port 4711
//   BASE_URL=http://127.0.0.1:4711 npx playwright test tests/wow/rullefilm.spec.ts
import { test, expect, type Page } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { lesHode } from "../../src/scripts/wow/spole";

test.use({ channel: "chrome" });

const SIDE = "/lab/scroll-world";

interface SegData {
  type: "klipp" | "still";
  klipp: string | null;
  klippM: string | null;
  vekt: number;
  retning: 1 | -1;
  kart: unknown;
}

async function apne(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem("wow-inngang", "1"));
  await page.goto(SIDE);
  await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-scroll-world]")?.dataset.swTider);
  // Første interaksjon: klippene får lastes.
  await page.keyboard.press("Shift");
}

const segmenter = (page: Page) =>
  page.evaluate(() => JSON.parse(document.querySelector<HTMLElement>("[data-scroll-world]")!.dataset.scrollWorld!).segmenter as SegData[]);
const startFor = (segs: SegData[], i: number) => segs.slice(0, i).reduce((a, s) => a + s.vekt, 0);

/** Ruller til `t` skjermhøyder inn i filmen. */
async function til(page: Page, t: number, vent = 900) {
  await page.evaluate((t) => {
    const r = document.querySelector<HTMLElement>("[data-scroll-world]")!;
    const W = JSON.parse(r.dataset.swTider!).W;
    const topp = r.getBoundingClientRect().top + scrollY;
    scrollTo(0, Math.round(topp + (t / W) * (r.offsetHeight - innerHeight)));
  }, t);
  await page.waitForTimeout(vent);
}

async function klipp(page: Page, lag: number) {
  return page.evaluate((lag) => {
    const v = document.querySelector<HTMLElement & { swAndel?: number; swRamer?: number; swMotor?: string }>(`[data-sw-lag="${lag}"] .sw__video`);
    if (!v) return null;
    return {
      andel: v.swAndel ?? -1,
      ramer: v.swRamer ?? 0,
      motor: v.swMotor ?? "",
      tag: v.tagName,
      kilde: v.dataset.kilde ?? "",
      tegnet: v.closest("[data-har-klipp]") !== null,
      b: v instanceof HTMLCanvasElement ? v.width : 0,
      h: v instanceof HTMLCanvasElement ? v.height : 0,
    };
  }, lag);
}

/** Et klipp forover uten klippkart: andelen av rullingen er andelen av klippet. */
function rettKlipp(segs: SegData[]) {
  return segs.findIndex((s) => s.type === "klipp" && s.klipp && s.retning === 1 && !s.kart);
}

test.describe("rullefilm: WebCodecs til lerret", () => {
  test("klippet hentes i deler med Range, tabellen først, og tegnes på et lerret", async ({ page }) => {
    const svar: { url: string; status: number; range: string }[] = [];
    page.on("response", (r) => {
      if (/\.mp4(\?|$)/.test(r.url())) svar.push({ url: r.url(), status: r.status(), range: r.request().headers()["range"] ?? "" });
    });
    await apne(page);
    const segs = await segmenter(page);
    const i = rettKlipp(segs);
    test.skip(i < 0, "Ingen klipp i dette bygget");
    await til(page, startFor(segs, i) + segs[i].vekt * 0.5, 1500);
    await expect.poll(async () => (await klipp(page, i))?.tegnet ?? false, { timeout: 8000 }).toBe(true);
    const k = (await klipp(page, i))!;
    expect(k.motor).toBe("webcodecs");
    expect(k.tag).toBe("CANVAS");
    expect(svar.length).toBeGreaterThan(0);
    // Alt hentes med Range og svarer 206; første henting av hver fil er starten (tabellen).
    expect(svar.filter((s) => s.status !== 206)).toEqual([]);
    const forste = new Map<string, string>();
    for (const s of svar) if (!forste.has(s.url)) forste.set(s.url, s.range);
    for (const r of forste.values()) expect(r).toMatch(/^bytes=0-\d+$/);
    // Ingen <video> i filmen når WebCodecs virker.
    expect(await page.locator("[data-scroll-world] video").count()).toBe(0);
  });

  test("antall ramer og bildets mål leses fra fila, ikke antatt", async ({ page }) => {
    await apne(page);
    const segs = await segmenter(page);
    const i = rettKlipp(segs);
    test.skip(i < 0, "Ingen klipp i dette bygget");
    await til(page, startFor(segs, i) + segs[i].vekt * 0.5, 1500);
    await expect.poll(async () => (await klipp(page, i))?.ramer ?? 0, { timeout: 8000 }).toBeGreaterThan(0);
    const k = (await klipp(page, i))!;
    const fil = join(process.cwd(), "public", decodeURIComponent(new URL(k.kilde, "http://x").pathname));
    test.skip(!existsSync(fil), "Klippet er en plassholder utenfor public/");
    const b = readFileSync(fil);
    const t = lesHode(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer).tabell!;
    expect(k.ramer).toBe(t.n);
    expect([k.b, k.h]).toEqual([t.bredde, t.hoyde]);
  });

  test("halvveis i rullingen er halvveis i klippet, bunnen er siste rame, og baklengs rulling spoler tilbake", async ({ page }) => {
    await apne(page);
    const segs = await segmenter(page);
    const i = rettKlipp(segs);
    test.skip(i < 0, "Ingen klipp i dette bygget");
    const start = startFor(segs, i);
    await til(page, start + segs[i].vekt * 0.5, 1500);
    await expect.poll(async () => (await klipp(page, i))?.tegnet ?? false, { timeout: 8000 }).toBe(true);
    const n = (await klipp(page, i))!.ramer;
    const rame = 1 / (n - 1);
    // I ro står bildet på nøyaktig den ramen rullingen peker på (± én rame for avrunding av rulleposisjonen).
    await expect.poll(async () => Math.abs((await klipp(page, i))!.andel - 0.5), { timeout: 4000 }).toBeLessThanOrEqual(rame * 1.5);
    await til(page, start + segs[i].vekt * 0.9);
    await expect.poll(async () => Math.abs((await klipp(page, i))!.andel - 0.9), { timeout: 4000 }).toBeLessThanOrEqual(rame * 1.5);
    await til(page, start + segs[i].vekt * 0.999);
    await expect.poll(async () => (await klipp(page, i))!.andel, { timeout: 4000 }).toBeGreaterThanOrEqual(1 - rame * 2);
    await til(page, start + segs[i].vekt * 0.2);
    await expect.poll(async () => Math.abs((await klipp(page, i))!.andel - 0.2), { timeout: 4000 }).toBeLessThanOrEqual(rame * 1.5);
  });

  test("jevn rulling gjennom et klipp: bildet byttes hele veien, forlengs og baklengs, uten opphold", async ({ page }) => {
    await apne(page);
    const segs = await segmenter(page);
    const i = rettKlipp(segs);
    test.skip(i < 0, "Ingen klipp i dette bygget");
    const start = startFor(segs, i);
    await til(page, start + segs[i].vekt * 0.05, 1500);
    await expect.poll(async () => (await klipp(page, i))?.tegnet ?? false, { timeout: 8000 }).toBe(true);
    const feie = (fra: number, mot: number) =>
      page.evaluate(
        ([lag, fra, mot]) =>
          new Promise<{ ulike: number; lengsteOpphold: number; feilVei: number; bilder: number }>((ferdig) => {
            const r = document.querySelector<HTMLElement>("[data-scroll-world]")!;
            const W = JSON.parse(r.dataset.swTider!).W;
            const topp = r.getBoundingClientRect().top + scrollY;
            const lengde = r.offsetHeight - innerHeight;
            const el = document.querySelector<HTMLElement & { swAndel?: number }>(`[data-sw-lag="${lag}"] .sw__video`)!;
            const VARIGHET = 2500;
            const sett = new Set<number>();
            let t0 = 0;
            let forrige = el.swAndel ?? -1;
            let opphold = 0;
            let lengste = 0;
            let feilVei = 0;
            let bilder = 0;
            const ramme = (ts: number) => {
              if (!t0) t0 = ts;
              const p = Math.min(1, (ts - t0) / VARIGHET);
              scrollTo(0, topp + ((fra + (mot - fra) * p) / W) * lengde);
              const a = el.swAndel ?? -1;
              bilder++;
              sett.add(a);
              if (a === forrige) opphold++;
              else {
                if ((a - forrige) * (mot - fra) < 0) feilVei++;
                lengste = Math.max(lengste, opphold);
                opphold = 0;
              }
              forrige = a;
              if (p < 1) requestAnimationFrame(ramme);
              else ferdig({ ulike: sett.size, lengsteOpphold: Math.max(lengste, opphold), feilVei, bilder });
            };
            requestAnimationFrame(ramme);
          }),
        [i, fra, mot] as const,
      );
    const n = (await klipp(page, i))!.ramer;
    const a = start + segs[i].vekt * 0.05;
    const b = start + segs[i].vekt * 0.95;
    for (const [fra, mot] of [
      [a, b],
      [b, a],
    ]) {
      const m = await feie(fra, mot);
      // 90 % av klippet på 2,5 s: minst hver tredje rame vises, aldri baklengs, og aldri stille over 100 ms.
      expect(m.ulike, JSON.stringify(m)).toBeGreaterThan(Math.min(n, m.bilder) * 0.3);
      expect(m.feilVei, JSON.stringify(m)).toBe(0);
      expect(m.lengsteOpphold, JSON.stringify(m)).toBeLessThanOrEqual(6);
      await page.waitForTimeout(400);
    }
  });
});

test.describe("rullefilm: reserven", () => {
  test("uten VideoDecoder: <video> og currentTime følger rullingen", async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error fjerner WebCodecs, som i en nettleser uten
      delete window.VideoDecoder;
    });
    await apne(page);
    const segs = await segmenter(page);
    const i = rettKlipp(segs);
    test.skip(i < 0, "Ingen klipp i dette bygget");
    const start = startFor(segs, i);
    await til(page, start + segs[i].vekt * 0.5, 1500);
    await expect.poll(async () => (await klipp(page, i))?.tegnet ?? false, { timeout: 8000 }).toBe(true);
    const k = (await klipp(page, i))!;
    expect(k.motor).toBe("video");
    expect(k.tag).toBe("VIDEO");
    await expect.poll(async () => Math.abs((await klipp(page, i))!.andel - 0.5), { timeout: 4000 }).toBeLessThan(0.03);
    await til(page, start + segs[i].vekt * 0.2);
    await expect.poll(async () => Math.abs((await klipp(page, i))!.andel - 0.2), { timeout: 4000 }).toBeLessThan(0.03);
    expect(await page.locator("[data-scroll-world] canvas").count()).toBe(0);
  });

  test("dekoderen støtter ikke fila: klippet bytter til <video> uten at laget blir stående tomt", async ({ page }) => {
    await page.addInitScript(() => {
      if (typeof VideoDecoder === "function") VideoDecoder.isConfigSupported = async (config) => ({ supported: false, config });
    });
    const feil: string[] = [];
    page.on("pageerror", (e) => feil.push(e.message));
    await apne(page);
    const segs = await segmenter(page);
    const i = rettKlipp(segs);
    test.skip(i < 0, "Ingen klipp i dette bygget");
    await til(page, startFor(segs, i) + segs[i].vekt * 0.5, 1500);
    await expect.poll(async () => (await klipp(page, i))?.motor ?? "", { timeout: 8000 }).toBe("video");
    await expect.poll(async () => (await klipp(page, i))?.tegnet ?? false, { timeout: 8000 }).toBe(true);
    await expect(page.locator(`[data-sw-lag="${i}"] .sw__video`)).toHaveCount(1);
    expect(feil).toEqual([]);
  });

  test("tjeneren svarer ikke på Range: hele fila kommer med første svar, og filmen virker likevel", async ({ page }) => {
    // Første henting (bytes=0-…) besvares med hele fila og 200, slik en tjener uten Range gjør.
    await page.route(/\.mp4(\?|$)/, async (route) => {
      const svar = await route.fetch({ headers: { ...route.request().headers(), range: "" } });
      await route.fulfill({ status: 200, body: await svar.body(), headers: { "content-type": "video/mp4" } });
    });
    await apne(page);
    const segs = await segmenter(page);
    const i = rettKlipp(segs);
    test.skip(i < 0, "Ingen klipp i dette bygget");
    await til(page, startFor(segs, i) + segs[i].vekt * 0.5, 1500);
    // Hele fila kom med første svar, så lerretet har alt det trenger og tegner uten flere hentinger.
    await expect.poll(async () => (await klipp(page, i))?.tegnet ?? false, { timeout: 10000 }).toBe(true);
    const k = (await klipp(page, i))!;
    expect(["webcodecs", "video"]).toContain(k.motor);
    await expect.poll(async () => Math.abs((await klipp(page, i))!.andel - 0.5), { timeout: 4000 }).toBeLessThan(0.03);
  });
});
