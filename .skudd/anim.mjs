import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });

// Terminalen skal skrive seg inn
const foer = await p.evaluate(() => document.querySelectorAll(".kk-term[data-skriv] .kk-term-linje[data-synlig]").length);
await p.waitForTimeout(1400);
const etter = await p.evaluate(() => document.querySelectorAll(".kk-term[data-skriv] .kk-term-linje[data-synlig]").length);
const totalt = await p.evaluate(() => document.querySelectorAll(".kk-term[data-skriv] .kk-term-linje").length);
console.log(`terminal: ${foer} -> ${etter} av ${totalt} linjer synlige`);

// Tallene skal telle opp og ende på riktig verdi
await p.evaluate(() => document.querySelector(".kk-proof")?.scrollIntoView({ block: "center" }));
await p.waitForTimeout(900);
console.log("bevis-tall:", await p.evaluate(() => [...document.querySelectorAll("[data-tell]")].map(e => e.textContent)));
console.log("konsollfeil:", feil.length ? feil : "ingen");
await b.close();
