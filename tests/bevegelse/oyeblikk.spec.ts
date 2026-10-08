// Tester for øyeblikk 2 (Loft), 3 (CaseVideo) og 6 (Reel). Kjører mot en statisk
// testside som bruker komponentenes skript og stiler ordrett (se
// lag-testside-oyeblikk.mjs). Testvideoene ligger i public/scener/test/.
import { test, expect, type Page } from '@playwright/test';

const SIDE = '/oyeblikk.html';

function fangVideokall(page: Page) {
  const kall: string[] = [];
  page.on('request', (r) => {
    if (/\.(mp4|webm)(\?|$)/.test(r.url())) kall.push(r.url());
  });
  return kall;
}

test.describe('øyeblikk 2: overskrifter som løftes inn', () => {
  test('overskrift under folden animeres først når den kommer i syne, og bare én gang', async ({ page }) => {
    await page.goto(SIDE);
    const under = page.locator('#h2-under');
    // Ikke animert før den er i syne.
    await page.waitForTimeout(400);
    expect(await under.getAttribute('data-vis')).toBeNull();
    expect(await under.getAttribute('data-ferdig')).toBeNull();
    // Rull den i syne: linjene løftes inn, og til slutt settes teksten tilbake.
    await under.scrollIntoViewIfNeeded();
    await page.waitForSelector('#h2-under[data-ferdig]');
    await expect(under).toHaveText('Vi tar siden fra hverandre lag for lag');
    await expect(under).toBeVisible();
    // Ren tekst igjen: ingen spenn står igjen etter animasjonen.
    expect(await under.evaluate((el) => el.children.length)).toBe(0);
    expect(await under.getAttribute('aria-label')).toBeNull();
    // Rull bort og tilbake: ingenting skjer på nytt.
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    await under.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    expect(await under.evaluate((el) => el.children.length)).toBe(0);
    await expect(under).toHaveText('Vi tar siden fra hverandre lag for lag');
  });

  test('overskrift øverst deles i linjer og løftes inn med forsinkelse per linje', async ({ page }) => {
    await page.goto(SIDE);
    // Underveis: linjemasker med klipp og transform finnes.
    const hadde = await page.waitForFunction(() => {
      const el = document.querySelector('#h1-topp');
      return !!el && (el.querySelectorAll('.loft__linje').length > 1 || el.hasAttribute('data-ferdig'));
    });
    expect(hadde).toBeTruthy();
    await page.waitForSelector('#h1-topp[data-ferdig]');
    await expect(page.locator('#h1-topp')).toHaveText('Gratis befaring av nettsiden din');
  });
});

test.describe('øyeblikk 3: case-video', () => {
  test('ingen src før pekeren er over, spiller ved peker og stopper når den går', async ({ page }) => {
    const videokall = fangVideokall(page);
    await page.goto(SIDE);
    await page.waitForTimeout(500);
    expect(videokall).toEqual([]);
    const video = page.locator('#case video');
    expect(await video.getAttribute('src')).toBeNull();
    // Pekeren over casen: opptaket lastes og spiller.
    await page.locator('#case').scrollIntoViewIfNeeded();
    await page.locator('#case').hover();
    await page.waitForFunction(() => {
      const v = document.querySelector('#case video') as HTMLVideoElement;
      return !!v.src && !v.paused;
    });
    expect(videokall.length).toBeGreaterThan(0);
    // Pekeren bort: opptaket stopper.
    await page.mouse.move(5, 5);
    await page.waitForFunction(() => (document.querySelector('#case video') as HTMLVideoElement).paused);
  });

  test('fokus i casen spiller opptaket', async ({ page }) => {
    await page.goto(SIDE);
    await page.locator('#case').focus();
    await page.waitForFunction(() => {
      const v = document.querySelector('#case video') as HTMLVideoElement;
      return !!v.src && !v.paused;
    });
  });

  test('manglende opptak viser plassholder, ikke video', async ({ page }) => {
    await page.goto(SIDE);
    const mangler = page.locator('#case-mangler .casevideo--mangler');
    await expect(mangler).toHaveText('MANGLER: skjermopptak');
    expect(await page.locator('#case-mangler video').count()).toBe(0);
  });
});

test.describe('øyeblikk 6: reel', () => {
  test('laster video først ved klikk, Esc lukker og fokus går tilbake', async ({ page }) => {
    const videokall = fangVideokall(page);
    await page.goto(SIDE);
    const knapp = page.locator('[data-reel-apne]');
    await knapp.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    // Ingenting hentet før klikk.
    expect(videokall).toEqual([]);
    expect(await page.locator('[data-reel] video').getAttribute('src')).toBeNull();
    // Klikk: dialogen åpnes, videoen får src, lukkeknappen har fokus.
    await knapp.click();
    await expect(page.locator('dialog.reel__dialog')).toHaveAttribute('open', '');
    await page.waitForFunction(() => !!(document.querySelector('[data-reel] video') as HTMLVideoElement).src);
    expect(videokall.length).toBeGreaterThan(0);
    await expect(page.locator('[data-reel-lukk]')).toBeFocused();
    // Esc: dialogen lukkes, videoen står, fokus tilbake på knappen.
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog.reel__dialog')).not.toHaveAttribute('open', '');
    await page.waitForFunction(() => (document.querySelector('[data-reel] video') as HTMLVideoElement).paused);
    await expect(knapp).toBeFocused();
    // Lukkeknappen fungerer også.
    await knapp.click();
    await expect(page.locator('dialog.reel__dialog')).toHaveAttribute('open', '');
    await page.locator('[data-reel-lukk]').click();
    await expect(page.locator('dialog.reel__dialog')).not.toHaveAttribute('open', '');
  });
});

test('ingen feil i konsollen gjennom hele siden og alle interaksjonene', async ({ page }) => {
  const feil: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') feil.push(m.text());
  });
  page.on('pageerror', (e) => feil.push(String(e)));
  await page.goto(SIDE);
  await page.waitForSelector('#h1-topp[data-ferdig]');
  await page.locator('#h2-under').scrollIntoViewIfNeeded();
  await page.waitForSelector('#h2-under[data-ferdig]');
  await page.locator('#case').scrollIntoViewIfNeeded();
  await page.locator('#case').hover();
  await page.waitForTimeout(400);
  await page.mouse.move(5, 5);
  const knapp = page.locator('[data-reel-apne]');
  await knapp.scrollIntoViewIfNeeded();
  await knapp.click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  expect(feil).toEqual([]);
});

test.describe('redusert bevegelse', () => {
  test.use({ reducedMotion: 'reduce' });

  test('overskriftene står stille og er synlige', async ({ page }) => {
    await page.goto(SIDE);
    await page.waitForTimeout(400);
    const topp = page.locator('#h1-topp');
    await expect(topp).toBeVisible();
    await expect(topp).toHaveText('Gratis befaring av nettsiden din');
    // Aldri delt opp, aldri animert.
    expect(await topp.evaluate((el) => el.children.length)).toBe(0);
    expect(await topp.getAttribute('data-vis')).toBeNull();
    const synlig = await topp.evaluate((el) => {
      const s = getComputedStyle(el);
      return { opacity: s.opacity, transform: s.transform };
    });
    expect(synlig.opacity).toBe('1');
    expect(synlig.transform).toBe('none');
  });

  test('case-videoen laster ingenting, posteren står', async ({ page }) => {
    const videokall = fangVideokall(page);
    await page.goto(SIDE);
    await page.locator('#case').scrollIntoViewIfNeeded();
    await page.locator('#case').hover();
    await page.waitForTimeout(500);
    expect(videokall).toEqual([]);
    expect(await page.locator('#case video').getAttribute('src')).toBeNull();
    expect(await page.locator('#case video').getAttribute('poster')).toBe('/scener/test/poster.avif');
  });
});

test.describe('mobil', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('case-videoen spiller når kortet er i syne, og stopper utenfor', async ({ page }) => {
    const videokall = fangVideokall(page);
    await page.goto(SIDE);
    await page.waitForTimeout(400);
    expect(videokall).toEqual([]);
    await page.locator('#case').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const v = document.querySelector('#case video') as HTMLVideoElement;
      return !!v.src && !v.paused;
    });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForFunction(() => (document.querySelector('#case video') as HTMLVideoElement).paused);
  });

  test('ingen vannrett rulling på mobil', async ({ page }) => {
    await page.goto(SIDE);
    await page.locator('#case').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const maal = await page.evaluate(() => ({
      dokument: document.documentElement.scrollWidth,
      vindu: document.documentElement.clientWidth,
    }));
    expect(maal.dokument).toBeLessThanOrEqual(maal.vindu);
  });
});

test.describe('uten JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('tekst synlig, poster står, reel-knappen er en lenke til filmen', async ({ page }) => {
    await page.goto(SIDE);
    await expect(page.locator('#h1-topp')).toBeVisible();
    await expect(page.locator('#h1-topp')).toHaveText('Gratis befaring av nettsiden din');
    await expect(page.locator('#h2-under')).toHaveText('Vi tar siden fra hverandre lag for lag');
    expect(await page.locator('#case video').getAttribute('src')).toBeNull();
    expect(await page.locator('#case video').getAttribute('poster')).toBe('/scener/test/poster.avif');
    const href = await page.locator('[data-reel-apne]').getAttribute('href');
    expect(href).toMatch(/^\/scener\/test\/test-1080\.(mp4|webm)$/);
    expect(await page.locator('[data-reel-apne]').getAttribute('role')).toBeNull();
  });
});
