// Tester for Prisvelger.astro (øyeblikk 5). Kjører mot en statisk testside som
// bruker komponentens skript og stil ordrett (se lag-testside-prisvelger.mjs).
// Testvideoen er 6 s; stoppunktene er 0 s (Start), 3 s (Bedrift), 6 s (System).
import { test, expect, type Page } from '@playwright/test';

const SIDE = '/prisvelger.html';
const VARIGHET = 6;
const STOPP = (s: number) => Math.min(s, VARIGHET - 0.05);

function fangVideokall(page: Page) {
  const kall: string[] = [];
  page.on('request', (r) => {
    if (/\.(mp4|webm)(\?|$)/.test(r.url())) kall.push(r.url());
  });
  return kall;
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

test('ingen henting før interaksjon, og første valg laster videoen', async ({ page }) => {
  const videokall = fangVideokall(page);
  await page.goto(SIDE);
  await page.waitForTimeout(500);
  // Velgeren er i syne, men ingenting er hentet før brukeren gjør noe.
  expect(videokall).toEqual([]);
  expect(await page.locator('video').getAttribute('src')).toBeNull();
  // Et valg er en interaksjon: videoen hentes og hopper til stoppunktet.
  await page.locator('input[value="bedrift"]').check();
  await page.waitForFunction(() => document.querySelector('video')?.getAttribute('src') !== null);
  expect(videokall.length).toBeGreaterThan(0);
  await ventPaaTid(page, STOPP(3));
});

test('valg spoler mykt til stoppunktet, og tilbake', async ({ page }) => {
  await page.goto(SIDE);
  await page.locator('input[value="bedrift"]').check();
  await ventPaaTid(page, STOPP(3));
  // Til System: slutten av videoen (6 s klippes til varighet - 0,05).
  await page.locator('input[value="system"]').check();
  await ventPaaTid(page, STOPP(6));
  // Tilbake til Start: objektet bygger seg ned til 0.
  await page.locator('input[value="start"]').check();
  await ventPaaTid(page, STOPP(0));
  const tid = await page.evaluate(() => document.querySelector('video')!.currentTime);
  expect(tid).toBeLessThan(0.2);
});

test('spolingen er myk: tiden går gjennom mellomliggende verdier', async ({ page }) => {
  await page.goto(SIDE);
  // Rulleintensjon laster videoen; Start er allerede valgt, så tiden står på 0.
  await page.mouse.wheel(0, 10);
  await page.waitForFunction(() => {
    const v = document.querySelector('video');
    return !!v && v.readyState >= 1;
  });
  await ventPaaTid(page, STOPP(0));
  // Logg tidspunktene mens det spoles fra 0 til 6.
  const tider = await page.evaluate(async () => {
    const v = document.querySelector('video')!;
    const logg: number[] = [];
    const inp = document.querySelector('input[value="system"]') as HTMLInputElement;
    inp.checked = true;
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise<void>((res) => {
      const les = () => {
        logg.push(v.currentTime);
        if (logg.length < 40) requestAnimationFrame(les);
        else res();
      };
      requestAnimationFrame(les);
    });
    return logg;
  });
  // Minst ett målepunkt ligger klart mellom start og slutt.
  expect(tider.some((t) => t > 0.5 && t < 5.0)).toBe(true);
});

test('statuslinja leses opp ved valg', async ({ page }) => {
  await page.goto(SIDE);
  await page.locator('input[value="bedrift"]').check();
  await expect(page.locator('.prisvelger__status')).toHaveText(
    'Valgt: Bedrift. Illustrasjonen viser hva som er med.',
  );
});

test('tastatur: piltast flytter valget og spoler', async ({ page }) => {
  await page.goto(SIDE);
  await page.locator('input[value="start"]').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('input[value="bedrift"]')).toBeChecked();
  await ventPaaTid(page, STOPP(3));
});

test('ingen feil i konsollen gjennom alle valg', async ({ page }) => {
  const feil: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') feil.push(m.text());
  });
  page.on('pageerror', (e) => feil.push(String(e)));
  await page.goto(SIDE);
  for (const verdi of ['bedrift', 'system', 'start', 'system']) {
    await page.locator(`input[value="${verdi}"]`).check();
    await page.waitForTimeout(350);
  }
  expect(feil).toEqual([]);
});

test.describe('uten JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('alle tre pakkene og prisene er lesbare, Start er valgt', async ({ page }) => {
    await page.goto(SIDE);
    const navn = page.locator('.prisvelger__navn');
    await expect(navn).toHaveCount(3);
    await expect(navn.nth(0)).toContainText('Start');
    await expect(navn.nth(1)).toContainText('Bedrift');
    await expect(navn.nth(2)).toContainText('System');
    const priser = page.locator('.prisvelger__pris');
    for (const pris of await priser.all()) await expect(pris).toBeVisible();
    await expect(page.locator('input[value="start"]')).toBeChecked();
    // Posterbildet står, ingen video er hentet.
    await expect(page.locator('.prisvelger__flate img')).toBeVisible();
    expect(await page.locator('video').getAttribute('src')).toBeNull();
  });
});

test.describe('redusert bevegelse', () => {
  test.use({ reducedMotion: 'reduce' });

  test('valg virker, men ingen video hentes – posterbildet er stillrammen', async ({ page }) => {
    const videokall = fangVideokall(page);
    await page.goto(SIDE);
    await page.locator('input[value="system"]').check();
    await page.waitForTimeout(500);
    await expect(page.locator('input[value="system"]')).toBeChecked();
    expect(videokall).toEqual([]);
    expect(await page.locator('video').getAttribute('src')).toBeNull();
    await expect(page.locator('.prisvelger__flate img')).toBeVisible();
  });
});

test.describe('mobil', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('mobil får 9:16-fila og valget spoler', async ({ page }) => {
    await page.goto(SIDE);
    await page.locator('input[value="bedrift"]').check();
    await page.waitForFunction(() => document.querySelector('video')?.getAttribute('src') !== null);
    const src = await page.evaluate(() => document.querySelector('video')!.getAttribute('src'));
    expect(src).toMatch(/^\/scener\/test\/test-mobil\.(webm|mp4)$/);
    await ventPaaTid(page, STOPP(3));
  });

  test('ingen vannrett rulling på mobil', async ({ page }) => {
    await page.goto(SIDE);
    const maal = await page.evaluate(() => ({
      dokument: document.documentElement.scrollWidth,
      vindu: document.documentElement.clientWidth,
    }));
    expect(maal.dokument).toBeLessThanOrEqual(maal.vindu);
  });
});
