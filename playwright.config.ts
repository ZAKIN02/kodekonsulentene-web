import { defineConfig, devices } from "@playwright/test";

/**
 * Visuell kvalitetssikring i headless Chrome.
 *
 * Hvorfor denne finnes ved siden av node:test-suiten: alle de 154 testene der var
 * grønne mens scroll-historien og temabryteren ikke kjørte i det hele tatt, fordi
 * CSP-en blokkerte skriptene. Et skript som stoppes av CSP feiler helt stille –
 * siden laster, markup er riktig, og ingenting beveger seg. Det må en ekte
 * nettleser til for å oppdage.
 *
 * BASE_URL ikke satt  → bygger og starter server.mjs på 4399 (lokalt og i CI).
 * BASE_URL satt       → kjører mot den adressen, uten å starte noe (overvåkning).
 */
const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:4399";
const MOT_PRODUKSJON = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: "./tests",
  // Videolasting og spoling tar tid; 60 s holder også på en treg CI-maskin.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Mørkt tema er standard i designsystemet, og det er der kontrasten er trangest.
    colorScheme: "dark",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobil", use: { ...devices["Pixel 7"] } },
  ],

  webServer: MOT_PRODUKSJON
    ? undefined
    : {
        // `node ./server.mjs`, ikke `node server.mjs`: andre prosesser i dette
        // prosjektet rydder med `pkill -f "node server.mjs"`, og det mønsteret
        // drepte testserveren midt i kjøringen. Punktum-skråstrek gjør at
        // kommandolinjen ikke lenger treffer.
        command: "npm run build && PORT=4399 node ./server.mjs",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
