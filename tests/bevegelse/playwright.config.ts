// Playwright-oppsett for testene av Scene.astro. Kjøres med:
//   npx playwright test --config tests/bevegelse/playwright.config.ts
// Starter sin egen statiske server på port 4330 (med Range-støtte) over en
// generert testside – ingen Astro-build.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4330',
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'node tests/bevegelse/server.mjs',
    url: 'http://localhost:4330/',
    reuseExistingServer: true,
    cwd: '../..',
  },
});
