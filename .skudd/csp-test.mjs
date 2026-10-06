import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const s of ["/kontakt", "/", "/priser", "/historie"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  await p.goto("http://127.0.0.1:8080" + s, { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(1000);
  const csp = feil.filter((f) => /Content Security/.test(f)).length;
  console.log(s.padEnd(12), "CSP:", csp, "| annet:", feil.length - csp);
  await p.close();
}
await b.close();
