import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const d = [];
p.on("response", (r) => { if (r.status() === 404) d.push(r.url()); });
for (const sti of ["/", "/finnes-ikke", "/lab/typo"]) {
  await p.goto("http://127.0.0.1:4399" + sti, { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(900);
}
console.log("404-ressurser:", d.length ? [...new Set(d)] : "ingen");
await b.close();
