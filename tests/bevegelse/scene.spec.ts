// Tester for Scene.astro (briefens del 8). Kjører mot en statisk testside som
// bruker komponentens skript og stiler ordrett (se lag-testside.mjs).
// Testvideoen er 6 s med innbrent tidskode; Playwrights Chromium spiller ikke
// H.264, så komponenten skal selv velge webm.
import { test, expect, type Page } from '@playwright/test';

const VARIGHET = 6;
const MAAL = (p: number) => p * (VARIGHET - 0.05);

/** Ruller til andel p av scenens rullelengde og lar rAF-oppdateringen kjøre. */
async function rullTil(page: Page, p: number) {
  await page.evaluate((andel) => {
    const scene = document.querySelector('[data-scene]') as HTMLElement;
    const lengde = scene.getBoundingClientRect().height - innerHeight;
    scrollTo(0, Math.round(lengde * andel));
  }, p);
}

/** Venter til videoen står i ro nær forventet tidspunkt. */
async function ventPaaTid(page: Page, forventet: number, slingring = 0.2) {
  await page.waitForFunction(
    ({ t, s }) => {
      const v = document.querySelector('video');
      return !!v && !v.seeking && Math.abs(v.currentTime - t) < s;
    },
    { t: forventet, s: slingring },
  );
}

async function ventPaaVideo(page: Page) {
  await page.waitForFunction(() => {
    const v = document.querySelector('video');
    return !!v && v.readyState >= 1 && Number.isFinite(v.duration);
  });
}

test.describe('desktop', () => {
  test('serveren svarer 206 på Range', async ({ request }) => {
    const svar = await request.get('/scener/test/test-1080.webm', {
      headers: { range: 'bytes=0-99' },
    });
    expect(svar.status()).toBe(206);
    expect(svar.headers()['content-range']).toContain('bytes 0-99/');
  });

  test('halvveis i rullingen er halvveis i videoen', async ({ page }) => {
    await page.goto('/');
    await ventPaaVideo(page);
    await rullTil(page, 0.5);
    await ventPaaTid(page, MAAL(0.5));
    const tid = await page.evaluate(() => document.querySelector('video')!.currentTime);
    expect(Math.abs(tid - MAAL(0.5))).toBeLessThan(0.2);
  });

  test('scenen åpner seg gradvis', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-scene][data-aktiv]');
    const apning = () =>
      page.evaluate(() => {
        const scene = document.querySelector('[data-scene]') as HTMLElement;
        return Number(scene.style.getPropertyValue('--apning'));
      });
    await rullTil(page, 0);
    await page.waitForFunction(() => {
      const s = document.querySelector('[data-scene]') as HTMLElement;
      return s.style.getPropertyValue('--apning') !== '';
    });
    const lukket = await apning();
    await rullTil(page, 0.05);
    await page.waitForTimeout(150);
    const halvapen = await apning();
    await rullTil(page, 0.2);
    await page.waitForTimeout(150);
    const apen = await apning();
    expect(lukket).toBe(0);
    expect(halvapen).toBeGreaterThan(0);
    expect(halvapen).toBeLessThan(1);
    expect(apen).toBe(1);
    // Flaten er beskåret når scenen er lukket, og ubeskåret når den er åpen.
    await rullTil(page, 0);
    await page.waitForTimeout(150);
    const klippLukket = await page.evaluate(
      () => getComputedStyle(document.querySelector('.scene__flate')!).clipPath,
    );
    expect(klippLukket).not.toBe('none');
    expect(klippLukket).toContain('inset');
  });

  test('baklengs rulling spoler tilbake', async ({ page }) => {
    await page.goto('/');
    await ventPaaVideo(page);
    await rullTil(page, 0.8);
    await ventPaaTid(page, MAAL(0.8));
    const framme = await page.evaluate(() => document.querySelector('video')!.currentTime);
    await rullTil(page, 0.3);
    await ventPaaTid(page, MAAL(0.3));
    const tilbake = await page.evaluate(() => document.querySelector('video')!.currentTime);
    expect(tilbake).toBeLessThan(framme);
    expect(Math.abs(tilbake - MAAL(0.3))).toBeLessThan(0.2);
  });

  test('bunnen er slutten av videoen', async ({ page }) => {
    await page.goto('/');
    await ventPaaVideo(page);
    await rullTil(page, 1);
    await ventPaaTid(page, MAAL(1));
    const tid = await page.evaluate(() => document.querySelector('video')!.currentTime);
    expect(Math.abs(tid - MAAL(1))).toBeLessThan(0.2);
  });

  test('første Tab treffer hopp-lenken', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const fokus = await page.evaluate(() => ({
      klasse: document.activeElement?.className ?? '',
      tekst: document.activeElement?.textContent ?? '',
    }));
    expect(fokus.klasse).toContain('scene__hopp');
    expect(fokus.tekst).toBe('Hopp over animasjonen');
    // Lenken er synlig når den har fokus.
    await expect(page.locator('.scene__hopp')).toBeVisible();
  });

  test('ingen feil i konsollen gjennom hele rullingen', async ({ page }) => {
    const feil: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') feil.push(m.text());
    });
    page.on('pageerror', (e) => feil.push(String(e)));
    await page.goto('/');
    await ventPaaVideo(page);
    for (const p of [0.1, 0.3, 0.5, 0.7, 1, 0.4, 0]) {
      await rullTil(page, p);
      await page.waitForTimeout(200);
    }
    expect(feil).toEqual([]);
  });
});

test.describe('desktop uten JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('uten JavaScript leses alle steg som tekst', async ({ page }) => {
    await page.goto('/');
    const titler = page.locator('.scene__steg h2');
    await expect(titler).toHaveCount(4);
    for (const tittel of await titler.all()) await expect(tittel).toBeVisible();
    await expect(page.locator('.scene__steg p').first()).toBeVisible();
    // Ingen video lastes, og scenen holder ikke skjermen fast.
    const video = page.locator('video');
    await expect(video).toHaveCount(1);
    expect(await video.getAttribute('src')).toBeNull();
    expect(await page.locator('[data-scene][data-aktiv]').count()).toBe(0);
  });
});

test.describe('desktop med redusert bevegelse', () => {
  test.use({ reducedMotion: 'reduce' });

  test('redusert bevegelse laster ingen video', async ({ page }) => {
    const videokall: string[] = [];
    page.on('request', (r) => {
      if (/\.(mp4|webm)(\?|$)/.test(r.url())) videokall.push(r.url());
    });
    await page.goto('/');
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    expect(videokall).toEqual([]);
    const video = page.locator('video');
    expect(await video.getAttribute('src')).toBeNull();
    expect(await page.locator('[data-scene][data-aktiv]').count()).toBe(0);
    // Posterbildet står som vanlig innhold.
    await expect(page.locator('.scene__flate img')).toBeVisible();
  });
});

test.describe('mobil', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('mobil får 9:16-fila', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => {
      const v = document.querySelector('video');
      return !!v && v.getAttribute('src') !== null;
    });
    const src = await page.evaluate(() => document.querySelector('video')!.getAttribute('src'));
    // Chromium i Playwright 1.63 spiller H.264, så komponenten kan velge mp4.
    // Det avgjørende er at det er 9:16-fila («-mobil»), uansett container.
    expect(src).toMatch(/^\/scener\/test\/test-mobil\.(webm|mp4)$/);
    await ventPaaVideo(page);
    const maal = await page.evaluate(() => {
      const v = document.querySelector('video')!;
      return { bredde: v.videoWidth, hoyde: v.videoHeight };
    });
    expect(maal).toEqual({ bredde: 1080, hoyde: 1920 });
  });

  test('ingen vannrett rulling på mobil', async ({ page }) => {
    await page.goto('/');
    await ventPaaVideo(page);
    for (const p of [0, 0.3, 0.7, 1]) {
      await rullTil(page, p);
      await page.waitForTimeout(150);
      const maal = await page.evaluate(() => ({
        dokument: document.documentElement.scrollWidth,
        vindu: document.documentElement.clientWidth,
      }));
      expect(maal.dokument).toBeLessThanOrEqual(maal.vindu);
    }
  });

  test('rullingen styrer videoen også på mobil', async ({ page }) => {
    await page.goto('/');
    await ventPaaVideo(page);
    await rullTil(page, 0.5);
    await ventPaaTid(page, MAAL(0.5));
    const tid = await page.evaluate(() => document.querySelector('video')!.currentTime);
    expect(Math.abs(tid - MAAL(0.5))).toBeLessThan(0.2);
  });
});
