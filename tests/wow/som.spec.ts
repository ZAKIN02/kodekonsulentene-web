// Sømmer og hold i rullefilmen i nettleseren (runde 9): src/scripts/wow/scroll-world.ts og som.ts mot
// /lab/scroll-world, med DAGENS klipp. De rene funksjonene testes i test/som.test.ts (node --test).
//
// Historien i historie.ts har ennå harde kutt i alle sømmer (klippene fra manus v6 er ikke levert).
// Testene setter derfor `som` og `hold` inn i data-scroll-world før skriptet leser det, slik
// ScrollWorld.astro vil skrive dem når et segment får `som: "toning"` eller `hold`.
//
//   BASE_URL=http://127.0.0.1:4780 npx playwright test tests/wow/som.spec.ts --project=desktop
import { test, expect, type Page } from "@playwright/test";

test.use({ channel: "chrome" });

const SIDE = "/lab/scroll-world";
const BREDDE = 0.05;

interface SegData {
  type: "klipp" | "still";
  klipp: string | null;
  vekt: number;
  retning: 1 | -1;
  kart: unknown;
  poster: boolean;
  som?: number;
  hold?: [number, number];
}

/** Åpner siden med `som` på alle sømmer unntatt `kutt`, og `hold` på første klipp forover uten kart. */
async function apne(page: Page, valg: { toning?: boolean; kuttEtter?: number; hold?: [number, number] } = {}) {
  await page.addInitScript((v) => {
    const lapp = (el: HTMLElement) => {
      if (el.dataset.lappet) return;
      el.dataset.lappet = "1";
      const d = JSON.parse(el.dataset.scrollWorld || "{}");
      const segs = d.segmenter as { type: string; klipp: string | null; retning: number; kart: unknown; som?: number; hold?: [number, number] }[];
      if (v.toning) segs.forEach((s, i) => { if (i < segs.length - 1 && i !== v.kuttEtter) s.som = v.bredde; });
      if (v.hold) {
        const i = segs.findIndex((s) => s.type === "klipp" && s.klipp && s.retning === 1 && !s.kart);
        if (i >= 0) segs[i].hold = v.hold;
      }
      el.dataset.scrollWorld = JSON.stringify(d);
    };
    new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>("[data-scroll-world]");
      if (el) lapp(el);
    }).observe(document, { childList: true, subtree: true });
  }, { ...valg, bredde: BREDDE });
  await page.goto(SIDE);
  await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-scroll-world]")?.dataset.swTider);
  await page.keyboard.press("Shift");
}

const segmenter = (page: Page) =>
  page.evaluate(() => JSON.parse(document.querySelector<HTMLElement>("[data-scroll-world]")!.dataset.scrollWorld!).segmenter as SegData[]);
const startFor = (segs: SegData[], i: number) => segs.slice(0, i).reduce((a, s) => a + s.vekt, 0);

async function til(page: Page, t: number, vent = 900) {
  await page.evaluate((t) => {
    const r = document.querySelector<HTMLElement>("[data-scroll-world]")!;
    const W = JSON.parse(r.dataset.swTider!).W;
    const topp = r.getBoundingClientRect().top + scrollY;
    scrollTo(0, topp + (t / W) * (r.offsetHeight - innerHeight));
  }, t);
  await page.waitForTimeout(vent);
}

/** Lagene som vises nå: indeks og opasitet. */
const synlige = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-sw-lag]")]
      .filter((l) => getComputedStyle(l).visibility === "visible" && getComputedStyle(l).display !== "none")
      .map((l) => ({ i: Number(l.dataset.swLag), op: Number(getComputedStyle(l).opacity) })),
  );

const andel = (page: Page, lag: number) =>
  page.evaluate((lag) => (document.querySelector<HTMLElement & { swAndel?: number }>(`[data-sw-lag="${lag}"] .sw__video`)?.swAndel ?? -1), lag);

/** En søm der begge sider har noe å vise uten å vente på et klipp: stillbilde eller klipp med poster. */
function somMedBilde(segs: SegData[]) {
  return segs.findIndex((s, i) => i < segs.length - 1 && (segs[i + 1].type === "still" || segs[i + 1].poster));
}

test.describe("sømmer: krysstoning", () => {
  test("midt i sømmen står begge lagene, det nye over det gamle med halv opasitet", async ({ page }) => {
    await apne(page, { toning: true });
    const segs = await segmenter(page);
    const i = somMedBilde(segs);
    test.skip(i < 0, "Ingen søm med bilde på begge sider i dette bygget");
    const T = startFor(segs, i + 1);
    await til(page, T);
    const lag = await synlige(page);
    expect(lag.map((l) => l.i)).toEqual([i, i + 1]);
    expect(lag[0].op).toBe(1);
    expect(lag[1].op).toBeGreaterThan(0.3);
    expect(lag[1].op).toBeLessThan(0.7);
  });

  test("toningen åpner seg gradvis og er over innen bredden, begge veier", async ({ page }) => {
    await apne(page, { toning: true });
    const segs = await segmenter(page);
    const i = somMedBilde(segs);
    test.skip(i < 0, "Ingen søm med bilde på begge sider i dette bygget");
    const T = startFor(segs, i + 1);
    const op = async (t: number) => {
      await til(page, t);
      return (await synlige(page)).find((x) => x.i === i + 1)?.op ?? 0;
    };
    const for_ = await op(T - BREDDE);
    const kvart = await op(T - BREDDE / 4);
    const trekvart = await op(T + BREDDE / 4);
    const etter = await op(T + BREDDE);
    expect(for_).toBe(0);
    expect(kvart).toBeGreaterThan(0.1);
    expect(kvart).toBeLessThan(0.45);
    expect(trekvart).toBeGreaterThan(0.55);
    expect(trekvart).toBeLessThan(0.9);
    expect(etter).toBe(1);
    // Etter sømmen står bare det nye laget.
    expect((await synlige(page)).map((l) => l.i)).toEqual([i + 1]);
    // Baklengs: samme opasitet på samme sted.
    const tilbake = await op(T - BREDDE / 4);
    expect(Math.abs(tilbake - kvart)).toBeLessThan(0.05);
    await til(page, T - BREDDE);
    expect((await synlige(page)).map((l) => l.i)).toEqual([i]);
  });

  test("bare opasitet endres i sømmen: ingen layout, ingen vannrett rulling, ingen feil", async ({ page }) => {
    const feil: string[] = [];
    page.on("pageerror", (e) => feil.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") feil.push(m.text()); });
    await apne(page, { toning: true });
    const segs = await segmenter(page);
    const W = startFor(segs, segs.length);
    const skift = await page.evaluate(async (W) => {
      let cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) cls += e.value; }).observe({ type: "layout-shift" });
      const r = document.querySelector<HTMLElement>("[data-scroll-world]")!;
      const topp = r.getBoundingClientRect().top + scrollY;
      const lengde = r.offsetHeight - innerHeight;
      await new Promise<void>((ferdig) => {
        const start = performance.now();
        const steg = (ts: number) => {
          const p = Math.min(1, (ts - start) / 6000);
          scrollTo(0, topp + p * lengde);
          if (p < 1) requestAnimationFrame(steg);
          else ferdig();
        };
        requestAnimationFrame(steg);
      });
      return { cls, overX: document.documentElement.scrollWidth - innerWidth, W };
    }, W);
    expect(skift.cls).toBeLessThan(0.01);
    expect(skift.overX).toBeLessThanOrEqual(0);
    expect(feil.filter((f) => !/favicon|vite|hmr/i.test(f))).toEqual([]);
  });
});

test.describe("sømmer: hardt kutt", () => {
  test("uten `som` er sømmen et kutt: aldri to lag med delvis opasitet (dagens film)", async ({ page }) => {
    await apne(page);
    const segs = await segmenter(page);
    expect(segs.every((s) => !s.som)).toBe(true);
    const i = somMedBilde(segs);
    test.skip(i < 0, "Ingen søm med bilde på begge sider i dette bygget");
    const T = startFor(segs, i + 1);
    for (const t of [T - 0.02, T, T + 0.02]) {
      await til(page, t, 600);
      const lag = await synlige(page);
      expect(lag.every((l) => l.op === 1)).toBe(true);
      // Nøyaktig på sømmen avgjør pikselavrundingen hvilken side vi står på; begge er riktige.
      if (t !== T) expect(lag.some((l) => l.i === (t < T ? i : i + 1))).toBe(true);
    }
  });

  test("et segment merket som kutt tones ikke, selv om naboene gjør det", async ({ page }) => {
    await apne(page, { toning: true, kuttEtter: 0 });
    const segs = await segmenter(page);
    expect(segs[0].som).toBeUndefined();
    const T = startFor(segs, 1);
    await til(page, T - 0.01, 600);
    expect((await synlige(page)).filter((l) => l.op > 0 && l.op < 1)).toEqual([]);
    await til(page, T + 0.01, 600);
    expect((await synlige(page)).filter((l) => l.op > 0 && l.op < 1)).toEqual([]);
  });
});

test.describe("hold på en ramme", () => {
  test("klippet står på rammen mens rullingen går, og når slutten av klippet ved slutten av segmentet", async ({ page }) => {
    const VED = 0.3;
    const ANDEL = 0.4;
    await apne(page, { hold: [VED, ANDEL] });
    const segs = await segmenter(page);
    const i = segs.findIndex((s) => s.hold);
    test.skip(i < 0, "Ingen klipp forover uten kart i dette bygget");
    const s0 = startFor(segs, i);
    const v = segs[i].vekt;
    const a = VED * (1 - ANDEL);
    const ved = async (u: number) => {
      await til(page, s0 + v * u, 1200);
      return andel(page, i);
    };
    await expect.poll(() => ved(a + 0.02), { timeout: 10000 }).toBeGreaterThan(0);
    const start = await ved(a + 0.02);
    const midt = await ved(a + ANDEL / 2);
    const slutt = await ved(a + ANDEL - 0.02);
    // Samme ramme gjennom hele holdet (innenfor én ramme i et klipp på minst 48 ramer).
    expect(Math.abs(start - VED)).toBeLessThan(0.03);
    expect(midt).toBe(start);
    expect(slutt).toBe(start);
    // Før holdet er klippet tidligere, etter holdet senere, og det når slutten.
    expect(await ved(a * 0.5)).toBeLessThan(start);
    expect(await ved(a + ANDEL + 0.1)).toBeGreaterThan(start);
    expect(await ved(0.995)).toBeGreaterThan(0.95);
    // Baklengs: tilbake på samme ramme.
    expect(await ved(a + ANDEL / 2)).toBe(start);
  });
});
